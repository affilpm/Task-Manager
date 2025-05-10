import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { initiateRegistration, verifyOTP, resendOTP } from '../../../api/auth';
import RegistrationForm from './RegistrationForm';
import OTPVerification from './OtpVerification';

// Dynamic background component
const DynamicBackground = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  useEffect(() => {
    // Check for system dark/light theme preference
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(darkModeMediaQuery.matches);
    
    // Add listener for theme changes
    const handleThemeChange = (e) => setIsDarkMode(e.matches);
    darkModeMediaQuery.addEventListener('change', handleThemeChange);
    
    // Mouse position effect
    const handleMouseMove = (e) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      setPosition({ x, y });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      darkModeMediaQuery.removeEventListener('change', handleThemeChange);
    };
  }, []);
  
  return (
    <div className="fixed inset-0 -z-10">
      <div className={`absolute inset-0 ${isDarkMode ? 
        'bg-gradient-to-br from-gray-900 to-slate-800' : 
        'bg-gradient-to-br from-blue-50 to-indigo-100'}`}></div>
      <div 
        className={`absolute rounded-full blur-3xl w-1/2 h-1/2 ${isDarkMode ? 
          'bg-gradient-to-r from-blue-900/30 to-indigo-800/30' : 
          'bg-gradient-to-r from-blue-300/30 to-indigo-400/30'}`}
        style={{ 
          left: `${position.x * 20}%`, 
          top: `${position.y * 20}%`,
          transform: `translate(-${position.x * 50}%, -${position.y * 50}%)` 
        }}
      ></div>
      <div 
        className={`absolute rounded-full blur-3xl w-1/3 h-1/3 ${isDarkMode ? 
          'bg-gradient-to-r from-purple-900/20 to-pink-800/20' : 
          'bg-gradient-to-r from-purple-300/20 to-pink-300/20'}`}
        style={{ 
          right: `${position.x * 20}%`, 
          bottom: `${position.y * 20}%`,
          transform: `translate(${position.x * 50}%, ${position.y * 50}%)` 
        }}
      ></div>
    </div>
  );
};

// Error text component
const ErrorText = ({ children }) => (
  <div className="text-red-500 text-sm mt-1">{children}</div>
);

const Register = () => {
  const [step, setStep] = useState(1);
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [otpExpired, setOtpExpired] = useState(false);
  const [theme, setTheme] = useState('blue');
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const navigate = useNavigate();

  // Check system theme preference
  useEffect(() => {
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(darkModeMediaQuery.matches);
    
    const handleThemeChange = (e) => setIsDarkMode(e.matches);
    darkModeMediaQuery.addEventListener('change', handleThemeChange);
    
    return () => darkModeMediaQuery.removeEventListener('change', handleThemeChange);
  }, []);

  // Theme colors mapping
  const themeColors = {
    blue: {
      primary: `${isDarkMode ? 'bg-blue-700 hover:bg-blue-800 focus:ring-blue-600' : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'}`,
      secondary: `${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`,
      disabled: `${isDarkMode ? 'bg-blue-600/50' : 'bg-blue-400'}`,
      error: `${isDarkMode ? 'bg-red-900/50 text-red-300' : 'bg-red-50 text-red-600'}`,
      warning: `${isDarkMode ? 'bg-yellow-900/50 text-yellow-300' : 'bg-yellow-50 text-yellow-700'}`,
      back: `${isDarkMode ? 'bg-red-700 hover:bg-red-800 focus:ring-red-600' : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'}`,
      backDisabled: `${isDarkMode ? 'bg-red-600/50' : 'bg-red-400'}`,
      gradientText: `${isDarkMode ? 'from-blue-400 to-indigo-300' : 'from-blue-500 to-indigo-600'}`
    },
    purple: {
      primary: `${isDarkMode ? 'bg-purple-700 hover:bg-purple-800 focus:ring-purple-600' : 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500'}`,
      secondary: `${isDarkMode ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-800'}`,
      disabled: `${isDarkMode ? 'bg-purple-600/50' : 'bg-purple-400'}`,
      error: `${isDarkMode ? 'bg-red-900/50 text-red-300' : 'bg-red-50 text-red-600'}`,
      warning: `${isDarkMode ? 'bg-yellow-900/50 text-yellow-300' : 'bg-yellow-50 text-yellow-700'}`,
      back: `${isDarkMode ? 'bg-gray-700 hover:bg-gray-800 focus:ring-gray-600' : 'bg-gray-600 hover:bg-gray-700 focus:ring-gray-500'}`,
      backDisabled: `${isDarkMode ? 'bg-gray-600/50' : 'bg-gray-400'}`,
      gradientText: `${isDarkMode ? 'from-purple-400 to-pink-300' : 'from-purple-500 to-pink-600'}`
    },
    green: {
      primary: `${isDarkMode ? 'bg-emerald-700 hover:bg-emerald-800 focus:ring-emerald-600' : 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500'}`,
      secondary: `${isDarkMode ? 'text-emerald-400 hover:text-emerald-300' : 'text-emerald-600 hover:text-emerald-800'}`,
      disabled: `${isDarkMode ? 'bg-emerald-600/50' : 'bg-emerald-400'}`,
      error: `${isDarkMode ? 'bg-red-900/50 text-red-300' : 'bg-red-50 text-red-600'}`,
      warning: `${isDarkMode ? 'bg-yellow-900/50 text-yellow-300' : 'bg-yellow-50 text-yellow-700'}`,
      back: `${isDarkMode ? 'bg-gray-700 hover:bg-gray-800 focus:ring-gray-600' : 'bg-gray-600 hover:bg-gray-700 focus:ring-gray-500'}`,
      backDisabled: `${isDarkMode ? 'bg-gray-600/50' : 'bg-gray-400'}`,
      gradientText: `${isDarkMode ? 'from-emerald-400 to-teal-300' : 'from-emerald-500 to-teal-600'}`
    }
  };

  // Get random theme on component mount
  useEffect(() => {
    const themes = ['blue', 'purple', 'green'];
    const randomTheme = themes[Math.floor(Math.random() * themes.length)];
    setTheme(randomTheme);
  }, []);

  // Effect to handle OTP expiration
  useEffect(() => {
    let timer;
    
    if (otpSent && step === 2) {
      // Timer for OTP expiration (60 seconds)
      timer = setTimeout(() => {
        setOtpExpired(true);
        setError('Your OTP has expired. Please click "Resend OTP" to get a new one.');
      }, 60000);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [otpSent, step]);

  // Start countdown for resend button (60 seconds)
  const startResendCountdown = () => {
    setResendDisabled(true);
    setCountdown(60);
    
    const interval = setInterval(() => {
      setCountdown((prevCount) => {
        if (prevCount <= 1) {
          clearInterval(interval);
          setResendDisabled(false);
          return 0;
        }
        return prevCount - 1;
      });
    }, 1000);
  };

  // Handle initial registration form submission
  const handleRegistrationSubmit = async (values, { setSubmitting }) => {
    setLoading(true);
    setError('');
    setOtpExpired(false);
    
    try {
      const response = await initiateRegistration(values);
      setUserEmail(values.email);
      setOtpSent(true);
      setStep(2);
      console.log(response.data);
      
      // Start countdown for resend button
      startResendCountdown();
    } catch (err) {
      setError(err.response?.data?.email || 'An error occurred during registration');
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  // Handle OTP verification form submission
  const handleOTPSubmit = async (values, { setSubmitting }) => {
    if (otpExpired) {
      setError('Your OTP has expired. Please request a new one.');
      setSubmitting(false);
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await verifyOTP(userEmail, values.otp);
      
      // Show success message with animation
      setError('');
      const successMessage = document.createElement('div');
      successMessage.className = 'fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50';
      successMessage.innerHTML = `
        <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl transform transition-all animate-bounce">
          <h3 class="text-xl font-bold text-green-600 dark:text-green-400 mb-2">Success!</h3>
          <p class="dark:text-white">Registration completed successfully!</p>
        </div>
      `;
      document.body.appendChild(successMessage);
      
      setTimeout(() => {
        document.body.removeChild(successMessage);
        navigate('/login'); // Redirect to login page
      }, 1500);
    } catch (err) {
      // Check if error is due to OTP expiration
      if (err.response?.data?.error?.includes('expired')) {
        setOtpExpired(true);
      }
      setError(err.response?.data?.error || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  // Handle OTP resend
  const handleResendOTP = async () => {
    setLoading(true);
    setError('');
    setOtpExpired(false);
    
    try {
      await resendOTP(userEmail);
      setOtpSent(true);
      startResendCountdown();
    } catch (err) {
      // If the session has expired completely (30 minutes passed)
      if (err.response?.data?.error?.includes('session expired')) {
        setError('Registration session expired. Please start over.');
        setTimeout(() => setStep(1), 2000);
      } else {
        setError(err.response?.data?.error || 'Failed to resend OTP');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DynamicBackground />
      <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              <span className={`bg-clip-text text-transparent bg-gradient-to-r ${themeColors[theme].gradientText}`}>
                {step === 1 ? 'Create Account' : 'Verify Email'}
              </span>
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              {step === 1 ? 
                'Join our community today' : 
                'Almost there! Just one more step'}
            </p>
          </div>

          <div className={`${isDarkMode ? 
            'bg-gray-800/80 backdrop-blur-sm shadow-xl border-gray-700' : 
            'bg-white/80 backdrop-blur-sm shadow-xl border-gray-200'} 
            rounded-xl p-8 transition-all duration-300 border`}>
            
            {error && (
              <div className={`${themeColors[theme].error} p-3 rounded-md mb-4 text-center animate-pulse`}>
                {error}
              </div>
            )}
            
            {step === 1 ? (
              <RegistrationForm 
                onSubmit={handleRegistrationSubmit}
                loading={loading}
                theme={theme}
                themeColors={themeColors}
                isDarkMode={isDarkMode}
              />
            ) : (
              <OTPVerification 
                userEmail={userEmail}
                onSubmit={handleOTPSubmit}
                onResendOTP={handleResendOTP}
                onBack={() => {
                  setStep(1);
                  setOtpExpired(false);
                  setError('');
                }}
                loading={loading}
                countdown={countdown}
                resendDisabled={resendDisabled}
                otpExpired={otpExpired}
                theme={theme}
                themeColors={themeColors}
                isDarkMode={isDarkMode}
              />
            )}
          </div>
          
          <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            <p>
              By creating an account, you agree to our{' '}
              <a href="#" className="font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;