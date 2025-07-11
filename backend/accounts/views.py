# backend/accounts/views.py
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.shortcuts import get_object_or_404
from .models import User, OTP
from .serilaizers import (
    UserSerializer, RegisterSerializer, OTPSerializer,
    VerifyOTPSerializer, LoginSerializer
)
from notifications.utils import send_sms

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Generate OTP
        otp_code = OTP.generate_otp()
        OTP.objects.create(user=user, code=otp_code)

        # Send OTP via SMS
        message = f"Your OTP for Turf Booking registration is: {otp_code}"
        send_sms(user.phone_number, message)

        return Response({
            "message": "User registered successfully. Please verify your phone number with the OTP sent.",
            "user_id": user.id
        }, status=status.HTTP_201_CREATED)

class RequestOTPView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        phone_number = request.data.get('phone_number')
        if not phone_number:
            return Response({"error": "Phone number is required"}, status=status.HTTP_400_BAD_REQUEST)

        user = get_object_or_404(User, phone_number=phone_number)

        # Generate OTP
        otp_code = OTP.generate_otp()
        OTP.objects.create(user=user, code=otp_code)

        # Send OTP via SMS
        message = f"Your OTP for Turf Booking is: {otp_code}"
        send_sms(user.phone_number, message)

        return Response({"message": "OTP sent successfully"}, status=status.HTTP_200_OK)

class VerifyOTPView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        if serializer.is_valid():
            phone_number = serializer.validated_data['phone_number']
            otp_code = serializer.validated_data['otp']

            user = get_object_or_404(User, phone_number=phone_number)
            otp = OTP.objects.filter(user=user, code=otp_code, is_used=False).order_by('-created_at').first()

            if not otp:
                return Response({"error": "Invalid OTP"}, status=status.HTTP_400_BAD_REQUEST)

            # Mark OTP as used
            otp.is_used = True
            otp.save()

            # Mark user's phone as verified
            user.is_phone_verified = True
            user.save()

            # Generate tokens
            refresh = RefreshToken.for_user(user)

            return Response({
                "message": "Phone number verified successfully",
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "user_type": user.user_type
            }, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            phone_number = serializer.validated_data['phone_number']
            password = serializer.validated_data['password']

            user = get_object_or_404(User, phone_number=phone_number)

            if not user.check_password(password):
                return Response({"error": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)

            if not user.is_phone_verified:
                # Generate OTP for verification
                otp_code = OTP.generate_otp()
                OTP.objects.create(user=user, code=otp_code)

                # Send OTP via SMS
                message = f"Your OTP for Turf Booking login is: {otp_code}"
                send_sms(user.phone_number, message)

                return Response({
                    "message": "Please verify your phone number",
                    "requires_verification": True,
                    "phone_number": phone_number
                }, status=status.HTTP_200_OK)

            # Generate tokens
            refresh = RefreshToken.for_user(user)

            return Response({
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "user": UserSerializer(user).data
            }, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user