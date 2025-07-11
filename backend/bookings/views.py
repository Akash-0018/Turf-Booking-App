from django.shortcuts import render
from rest_framework import viewsets, permissions, status, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from .models import Booking
from .serializers import BookingSerializer
from notifications.utils import send_sms
from turfs.models import Turf
from decimal import Decimal
import datetime

class IsCustomerOrOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to the customer or turf owner
        return (obj.customer == request.user) or (obj.turf.owner == request.user)

class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated, IsCustomerOrOwnerOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['turf', 'customer', 'date', 'status']
    search_fields = ['turf__name', 'customer__phone_number']
    ordering_fields = ['date', 'start_time', 'created_at']

    def get_queryset(self):
        user = self.request.user

        # If admin, return all bookings
        if user.is_staff or user.is_superuser:
            return Booking.objects.all()

        # If turf owner, return bookings for their turfs
        if user.user_type == 'owner':
            return Booking.objects.filter(turf__owner=user)

        # If customer, return their bookings
        return Booking.objects.filter(customer=user)

    def perform_create(self, serializer):
        booking = serializer.save()

        # Send SMS to customer
        customer_message = f"Your booking for {booking.turf.name} on {booking.date} from {booking.start_time} to {booking.end_time} is confirmed. Total amount: ₹{booking.total_amount}"
        send_sms(booking.customer.phone_number, customer_message)

        # Send SMS to turf owner
        owner_message = f"New booking: {booking.customer.phone_number} has booked your turf {booking.turf.name} for {booking.hours} hours on {booking.date} from {booking.start_time} to {booking.end_time}"
        send_sms(booking.turf.owner.phone_number, owner_message)

    @action(detail=False, methods=['get'])
    def my_bookings(self, request):
        user = request.user
        bookings = Booking.objects.filter(customer=user).order_by('-date', '-start_time')
        serializer = self.get_serializer(bookings, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def turf_bookings(self, request):
        user = request.user
        if user.user_type != 'owner':
            return Response({"detail": "Not authorized"}, status=status.HTTP_403_FORBIDDEN)

        turf_id = request.query_params.get('turf_id')
        if not turf_id:
            return Response({"detail": "Turf ID is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            turf = Turf.objects.get(id=turf_id, owner=user)
        except Turf.DoesNotExist:
            return Response({"detail": "Turf not found"}, status=status.HTTP_404_NOT_FOUND)

        bookings = Booking.objects.filter(turf=turf).order_by('-date', '-start_time')
        serializer = self.get_serializer(bookings, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def check_availability(self, request):
        turf_id = request.data.get('turf_id')
        date = request.data.get('date')

        if not turf_id or not date:
            return Response({"detail": "Turf ID and date are required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            turf = Turf.objects.get(id=turf_id)
        except Turf.DoesNotExist:
            return Response({"detail": "Turf not found"}, status=status.HTTP_404_NOT_FOUND)

        try:
            booking_date = datetime.datetime.strptime(date, '%Y-%m-%d').date()
        except ValueError:
            return Response({"detail": "Invalid date format. Use YYYY-MM-DD"}, status=status.HTTP_400_BAD_REQUEST)

        # Get all bookings for the turf on the specified date
        bookings = Booking.objects.filter(
            turf=turf,
            date=booking_date,
            status__in=['pending', 'confirmed']
        ).order_by('start_time')

        # Create a list of booked time slots
        booked_slots = []
        for booking in bookings:
            booked_slots.append({
                'start_time': booking.start_time.strftime('%H:%M'),
                'end_time': booking.end_time.strftime('%H:%M')
            })

        # Determine if it's a weekday or weekend for pricing
        is_weekend = booking_date.weekday() >= 5
        price = turf.weekend_price if is_weekend else turf.weekday_price

        return Response({
            'turf_id': turf.id,
            'turf_name': turf.name,
            'date': date,
            'booked_slots': booked_slots,
            'hourly_price': price,
            'convenience_fee_per_hour': Decimal('18.63')
        })