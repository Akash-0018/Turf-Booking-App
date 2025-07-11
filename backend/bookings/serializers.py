# backend/bookings/serializers.py
from rest_framework import serializers
from .models import Booking
from turfs.models import Turf
from datetime import datetime, time
from decimal import Decimal

class BookingSerializer(serializers.ModelSerializer):
    turf_name = serializers.CharField(source='turf.name', read_only=True)
    customer_phone = serializers.CharField(source='customer.phone_number', read_only=True)
    owner_phone = serializers.CharField(source='turf.owner.phone_number', read_only=True)

    class Meta:
        model = Booking
        fields = [
            'id', 'turf', 'turf_name', 'customer_phone', 'owner_phone',
            'date', 'start_time', 'end_time', 'hours', 'price', 
            'convenience_fee', 'total_amount', 'status',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['customer', 'price', 'convenience_fee', 'total_amount', 'status']

    def validate(self, data):
        # Check if turf exists
        turf = data.get('turf')
        date = data.get('date')
        start_time = data.get('start_time')
        end_time = data.get('end_time')
        hours = data.get('hours')

        # Validate time range
        if start_time >= end_time:
            raise serializers.ValidationError("End time must be after start time")

        # Calculate hours from start and end time
        start_datetime = datetime.combine(date, start_time)
        end_datetime = datetime.combine(date, end_time)
        calculated_hours = (end_datetime - start_datetime).seconds / 3600

        if abs(calculated_hours - hours) > 0.01:  # Allow small floating-point error
            raise serializers.ValidationError("Hours don't match the time range")

        # Check for overlapping bookings
        overlapping_bookings = Booking.objects.filter(
            turf=turf,
            date=date,
            status__in=['pending', 'confirmed'],
        ).exclude(
            start_time__gte=end_time
        ).exclude(
            end_time__lte=start_time
        )

        if overlapping_bookings.exists():
            raise serializers.ValidationError("This time slot is already booked")

        return data

    def create(self, validated_data):
        turf = validated_data.get('turf')
        date = validated_data.get('date')
        hours = validated_data.get('hours')

        # Determine if it's a weekday or weekend
        is_weekend = date.weekday() >= 5  # 5 is Saturday, 6 is Sunday

        # Calculate price based on weekday/weekend
        hourly_price = turf.weekend_price if is_weekend else turf.weekday_price
        price = hourly_price * Decimal(hours)

        # Calculate convenience fee (18.63 per hour)
        convenience_fee = Decimal('18.63') * Decimal(hours)

        # Calculate total amount
        total_amount = price + convenience_fee

        # Create booking
        booking = Booking.objects.create(
            customer=self.context['request'].user,
            price=price,
            convenience_fee=convenience_fee,
            total_amount=total_amount,
            status='confirmed',
            **validated_data
        )

        return booking