from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    InitiateRegistrationView, 
    VerifyOTPView, 
    ResendOTPView,
    PasswordLoginView,
    RequestLoginOTPView,
    VerifyLoginOTPView,
    ResendLoginOTPView,
    CustomTokenRefreshView,
    CustomTokenVerifyView,
    LogoutView,
)


urlpatterns = [
    # Registration URLs
    path('register/initiate/', InitiateRegistrationView.as_view(), name='register'),
    path('register/verify-otp/', VerifyOTPView.as_view(), name='verify-registration-otp'),
    path('register/resend-otp/', ResendOTPView.as_view(), name='resend-registration-otp'),
    
    # Login URLs
    path('login/password/', PasswordLoginView.as_view(), name='password-login'),
    path('login/otp/request/', RequestLoginOTPView.as_view(), name='request-login-otp'),
    path('login/otp/verify/', VerifyLoginOTPView.as_view(), name='verify-login-otp'),
    path('login/otp/resend/', ResendLoginOTPView.as_view(), name='resend-login-otp'),
    path('token/refresh/', CustomTokenRefreshView.as_view(), name='token-refresh'),
    path('token/verify/', CustomTokenVerifyView.as_view(), name='token-verify'),
    path('logout', LogoutView.as_view(), name='logout'),
    


]
