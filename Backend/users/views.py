from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from django.core.cache import cache
from .serializers import UserRegistrationSerializer, OTPVerificationSerializer, OTPResendSerializer
from .utils import (
    generate_otp, send_otp_email, store_otp_in_cache, 
    store_user_data_in_cache, get_user_data_from_cache,
    is_otp_valid, get_otp_data_from_cache
)
from .serializers import (
    PasswordLoginSerializer, 
    RequestLoginOTPSerializer, 
    VerifyLoginOTPSerializer,
    ResendLoginOTPSerializer
)
from .utils import (
    generate_otp, 
    send_otp_email, 
    store_otp_in_cache, 
    is_otp_valid
)
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.core.cache import cache
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView





User = get_user_model()

class InitiateRegistrationView(APIView):
    """
    First step of registration - submit user details and receive OTP
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        
        if serializer.is_valid():
            email = serializer.validated_data['email']
            
            # Generate and send OTP
            otp = generate_otp()
            store_otp_in_cache(email, otp)
            
            # Store user data in cache
            store_user_data_in_cache(email, serializer.validated_data)
            
            # Send OTP via email
            send_otp_email(email, otp)
            
            return Response({
                "message": "OTP sent successfully. Please verify within 60 seconds to complete registration.",
                "email": email
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VerifyOTPView(APIView):
    """
    Second step of registration - verify OTP and create user
    """
    permission_classes = [AllowAny]
    def post(self, request):
        print(f"DEBUG: Received OTP verification request with data: {request.data}")
        serializer = OTPVerificationSerializer(data=request.data)
        
        if serializer.is_valid():
            email = serializer.validated_data['email']
            provided_otp = serializer.validated_data['otp']
            
            print(f"DEBUG: Validating OTP for email: {email}, OTP: {provided_otp}")
            
            # Check OTP validity
            is_valid, message = is_otp_valid(email, provided_otp)
            print(f"DEBUG: OTP validation result - Valid: {is_valid}, Message: {message}")
            
            if not is_valid:
                print(f"DEBUG: OTP validation failed with message: {message}")
                return Response(
                    {"error": message},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get cached user data
            print(f"DEBUG: Attempting to retrieve user data from cache for email: {email}")
            user_data = get_user_data_from_cache(email)
            print(f"DEBUG: Retrieved user data: {user_data}")
            
            if not user_data:
                print(f"DEBUG: No user data found in cache for email: {email}")
                return Response(
                    {"error": "Registration session expired. Please start over."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Create the user
            print(f"DEBUG: Creating user with email: {email}, name: {user_data['full_name']}")
            try:
                user = User.objects.create_user(
                    email=email,
                    full_name=user_data['full_name'],
                    password=user_data['password']
                )
                print(f"DEBUG: User created successfully with ID: {user.id}")
            except Exception as e:
                print(f"DEBUG: Failed to create user: {str(e)}")
                return Response(
                    {"error": f"Failed to create user: {str(e)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            # Clear cache
            print(f"DEBUG: Clearing cache entries for email: {email}")
            cache.delete(f"otp_{email}")
            cache.delete(f"user_data_{email}")
            
            return Response({
                "message": "Registration completed successfully",
                "user": {
                    "email": user.email,
                    "full_name": user.full_name
                }
            }, status=status.HTTP_201_CREATED)
        
        print(f"DEBUG: Serializer validation failed with errors: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ResendOTPView(APIView):
    """
    Resend OTP if expired or not received
    """
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = OTPResendSerializer(data=request.data)
        
        if serializer.is_valid():
            email = serializer.validated_data['email']
            
            # Check if user data exists in cache
            user_data = get_user_data_from_cache(email)
            if not user_data:
                return Response(
                    {"error": "Registration session expired. Please start over."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Generate new OTP
            otp = generate_otp()
            store_otp_in_cache(email, otp)
            
            # Send OTP via email
            send_otp_email(email, otp)
            print(email,otp)
            return Response({
                "message": "OTP resent successfully. Please verify within 60 seconds.",
                "email": email
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    
    
    
    
    
  
  

User = get_user_model()

class PasswordLoginView(APIView):
    """
    Login using email and password
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordLoginSerializer(data=request.data)
        
        if serializer.is_valid():
            user = serializer.validated_data['user']
            
            # Generate tokens
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': {
                    'email': user.email,
                    'full_name': user.full_name
                }
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RequestLoginOTPView(APIView):
    """
    Request OTP for login
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RequestLoginOTPSerializer(data=request.data)
        
        if serializer.is_valid():
            email = serializer.validated_data['email']
            
            # Generate and send OTP
            otp = generate_otp()
            store_otp_in_cache(email, otp, purpose='login')
            
            # Send OTP via email
            send_otp_email(email, otp, purpose='login')
            
            return Response({
                "message": "Login OTP sent successfully. Please verify within 60 seconds.",
                "email": email
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VerifyLoginOTPView(APIView):
    """
    Verify OTP and login
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = VerifyLoginOTPSerializer(data=request.data)
        
        if serializer.is_valid():
            email = serializer.validated_data['email']
            provided_otp = serializer.validated_data['otp']
            
            # Check OTP validity
            is_valid, message = is_otp_valid(email, provided_otp, purpose='login')
            
            if not is_valid:
                return Response(
                    {"error": message},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get user
            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                return Response(
                    {"error": "User not found."},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Generate tokens
            refresh = RefreshToken.for_user(user)
            
            # Clear OTP from cache
            cache.delete(f"otp_login_{email}")
            
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': {
                    'email': user.email,
                    'full_name': user.full_name
                }
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ResendLoginOTPView(APIView):
    """
    Resend OTP for login if expired or not received
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ResendLoginOTPSerializer(data=request.data)
        
        if serializer.is_valid():
            email = serializer.validated_data['email']
            
            # Generate new OTP
            otp = generate_otp()
            store_otp_in_cache(email, otp, purpose='login')
            
            # Send OTP via email
            send_otp_email(email, otp, purpose='login')
            
            return Response({
                "message": "Login OTP resent successfully. Please verify within 60 seconds.",
                "email": email
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)    
    
    
    
    

class CustomTokenRefreshView(TokenRefreshView):
    """
    Custom token refresh view to handle additional functionality
    """
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            return Response({"detail": str(e)}, status=status.HTTP_401_UNAUTHORIZED)
        
        return Response(serializer.validated_data, status=status.HTTP_200_OK)


class CustomTokenVerifyView(TokenVerifyView):
    """
    Custom token verify view to handle additional functionality
    """
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        try:
            serializer.is_valid(raise_exception=True)
            return Response({"valid": True}, status=status.HTTP_200_OK)
        except InvalidToken:
            return Response({"valid": False, "detail": "Token is invalid or expired"}, 
                           status=status.HTTP_401_UNAUTHORIZED)


class LogoutView(APIView):
    """
    Logout user by blacklisting the refresh token
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                # Blacklist the token to prevent it from being used again
                token.blacklist()
                return Response({"detail": "Successfully logged out."}, 
                               status=status.HTTP_200_OK)
            else:
                return Response({"detail": "Refresh token is required."}, 
                               status=status.HTTP_400_BAD_REQUEST)
        except TokenError:
            return Response({"detail": "Invalid token."}, 
                           status=status.HTTP_400_BAD_REQUEST)


class UserInfoView(APIView):
    """
    Get current user information
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            'email': user.email,
            'full_name': user.full_name,
            # Add any other user fields you want to return
        }, status=status.HTTP_200_OK)
    