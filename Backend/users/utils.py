# utils.py
import random
from django.core.cache import cache
from django.core.mail import send_mail
from django.conf import settings

def generate_otp():
    """Generate a 6-digit OTP"""
    return ''.join(random.choices('0123456789', k=6))

def store_otp_in_cache(email, otp, purpose='registration', expire_seconds=60):
    """Store OTP in cache with expiration time"""
    cache_key = f"otp_{purpose}_{email}"
    cache.set(cache_key, otp, expire_seconds)

def store_user_data_in_cache(email, user_data, expire_seconds=300):
    """Store user registration data in cache"""
    cache_key = f"user_data_{email}"
    cache.set(cache_key, user_data, expire_seconds)

def get_user_data_from_cache(email):
    """Retrieve user registration data from cache"""
    cache_key = f"user_data_{email}"
    return cache.get(cache_key)

def get_otp_data_from_cache(email, purpose='registration'):
    """Retrieve OTP from cache"""
    cache_key = f"otp_{purpose}_{email}"
    return cache.get(cache_key)

def is_otp_valid(email, provided_otp, purpose='registration'):
    """Check if provided OTP is valid"""
    stored_otp = get_otp_data_from_cache(email, purpose)
    
    if not stored_otp:
        return False, "OTP expired or not found. Please request a new one."
    
    if stored_otp != provided_otp:
        return False, "Invalid OTP. Please check and try again."
    
    return True, "OTP verified successfully"

def send_otp_email(email, otp, purpose='registration'):
    """Send OTP via email"""
    subject = f"Your {'Login' if purpose == 'login' else 'Registration'} OTP"
    message = f"""
    Hello,
    
    Your one-time password (OTP) for {'login' if purpose == 'login' else 'account registration'} is: {otp}
    
    This OTP will expire in 60 seconds.
    
    If you didn't request this OTP, please ignore this email.
    
    Thank you,
    Your App Team
    """
    
    from_email = settings.DEFAULT_FROM_EMAIL
    recipient_list = [email]
    
    send_mail(subject, message, from_email, recipient_list)