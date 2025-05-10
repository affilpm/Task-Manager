import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../../../api/api';

// Reusing the same DynamicBackground component from the password login
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

const OTPLogin = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpRequested, setOtpRequested] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(60);
  const [theme, setTheme] = useState('blue');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const navigate = useNavigate();
  const otpInputs = useRef([]);

  // Check system theme preference
  useEffect(() => {
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(darkModeMediaQuery.matches);
    
    const handleThemeChange = (e) => setIsDarkMode(e.matches);
    darkModeMediaQuery.addEventListener('change', handleThemeChange);
    
    return () => darkModeMediaQuery.removeEventListener('change', handleThemeChange);
  }, []);

  // Get random theme on component mount - matching the same system as password login
  useEffect(() => {
    const themes = ['blue', 'purple', 'green'];
    const randomTheme = themes[Math.floor(Math.random() * themes.length)];
    setTheme(randomTheme);
  }, []);

  // Timer effect for OTP countdown
  useEffect(() => {
    let interval;
    if (otpRequested && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0) {
      setError('OTP expired. Please request a new one.');
    }
    
    return () => clearInterval(interval);
  }, [otpRequested, timer]);

  // Theme colors mapping - same as password login
  const themeColors = {
    blue: {
      primary: `${isDarkMode ? 'bg-blue-700 hover:bg-blue-800 focus:ring-blue-600' : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'}`,
      secondary: `${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`,
      disabled: `${isDarkMode ? 'bg-blue-600/50' : 'bg-blue-400'}`,
      error: `${isDarkMode ? 'bg-red-900/50 text-red-300' : 'bg-red-50 text-red-600'}`,
      gradientText: `${isDarkMode ? 'from-blue-400 to-indigo-300' : 'from-blue-500 to-indigo-600'}`,
      highlight: `${isDarkMode ? 'border-blue-600' : 'border-blue-500'}`
    },
    purple: {
      primary: `${isDarkMode ? 'bg-purple-700 hover:bg-purple-800 focus:ring-purple-600' : 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500'}`,
      secondary: `${isDarkMode ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-800'}`,
      disabled: `${isDarkMode ? 'bg-purple-600/50' : 'bg-purple-400'}`,
      error: `${isDarkMode ? 'bg-red-900/50 text-red-300' : 'bg-red-50 text-red-600'}`,
      gradientText: `${isDarkMode ? 'from-purple-400 to-pink-300' : 'from-purple-500 to-pink-600'}`,
      highlight: `${isDarkMode ? 'border-purple-600' : 'border-purple-500'}`
    },
    green: {
      primary: `${isDarkMode ? 'bg-emerald-700 hover:bg-emerald-800 focus:ring-emerald-600' : 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500'}`,
      secondary: `${isDarkMode ? 'text-emerald-400 hover:text-emerald-300' : 'text-emerald-600 hover:text-emerald-800'}`,
      disabled: `${isDarkMode ? 'bg-emerald-600/50' : 'bg-emerald-400'}`,
      error: `${isDarkMode ? 'bg-red-900/50 text-red-300' : 'bg-red-50 text-red-600'}`,
      gradientText: `${isDarkMode ? 'from-emerald-400 to-teal-300' : 'from-emerald-500 to-teal-600'}`,
      highlight: `${isDarkMode ? 'border-emerald-600' : 'border-emerald-500'}`
    }
  };

  // Function to handle email submission and request OTP
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }
    
    try {
      // Call the backend API to request OTP
      const response = await axiosInstance.post('/users/login/otp/request/', {
        email: email
      });
      
      setOtpRequested(true);
      setTimer(60); // Reset timer to 60 seconds
      setLoading(false);
      
      // Focus the first OTP input
      if (otpInputs.current[0]) {
        otpInputs.current[0].focus();
      }
      
    } catch (error) {
      // Handle error response
      if (error.response) {
        if (error.response.data.error) {
          setError(error.response.data.error);
        } else if (error.response.data.email) {
          setError(error.response.data.email[0]);
        } else {
          setError('Failed to send OTP. Please try again.');
        }
      } else if (error.request) {
        setError('No response from server. Please try again.');
      } else {
        setError('An error occurred. Please try again.');
      }
      setLoading(false);
    }
  };

  // Function to handle OTP resend
  const handleResendOTP = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Call the backend API to resend OTP
      const response = await axiosInstance.post('/users/login/otp/resend/', {
        email: email
      });
      
      setTimer(60); // Reset timer to 60 seconds
      setOtp(['', '', '', '', '', '']); // Clear OTP fields
      setLoading(false);
      
      // Focus the first OTP input
      if (otpInputs.current[0]) {
        otpInputs.current[0].focus();
      }
      
    } catch (error) {
      // Handle error response
      if (error.response) {
        if (error.response.data.error) {
          setError(error.response.data.error);
        } else {
          setError('Failed to resend OTP. Please try again.');
        }
      } else if (error.request) {
        setError('No response from server. Please try again.');
      } else {
        setError('An error occurred. Please try again.');
      }
      setLoading(false);
    }
  };

  // Function to handle OTP input
  const handleOTPChange = (index, value) => {
    // Allow only numbers
    if (value && !/^\d+$/.test(value)) return;
    
    const newOTP = [...otp];
    newOTP[index] = value;
    setOtp(newOTP);
    
    // Auto focus next input
    if (value && index < 5) {
      otpInputs.current[index + 1].focus();
    }
    
    // Submit automatically when all digits are filled
    if (value && index === 5) {
      const fullOTP = newOTP.join('');
      if (fullOTP.length === 6) {
        handleVerifyOTP();
      }
    }
  };

  // Function to handle key press in OTP input
  const handleKeyDown = (index, e) => {
    // Move to previous input on backspace if current input is empty
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputs.current[index - 1].focus();
    }
  };

  // Function to handle OTP paste
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    
    // Check if pasted content is a 6-digit number
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtp(digits);
      
      // Focus the last input
      otpInputs.current[5].focus();
      
      // Submit automatically
      setTimeout(() => {
        handleVerifyOTP();
      }, 100);
    }
  };

  // Function to verify OTP
  const handleVerifyOTP = async () => {
    setLoading(true);
    setError('');
    
    const fullOTP = otp.join('');
    if (fullOTP.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      setLoading(false);
      return;
    }
    
    try {
      // Call the backend API to verify OTP
      const response = await axiosInstance.post('/users/login/otp/verify/', {
        email: email,
        otp: fullOTP
      });
      
      // Store tokens in localStorage
      localStorage.setItem('access', response.data.access);
      localStorage.setItem('refresh', response.data.refresh);
      
      // Show success message with animation
      const successMessage = document.createElement('div');
      successMessage.className = 'fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50';
      successMessage.innerHTML = `
        <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl transform transition-all animate-bounce">
          <h3 class="text-xl font-bold text-green-600 dark:text-green-400 mb-2">Success!</h3>
          <p class="dark:text-white">Login successful!</p>
        </div>
      `;
      document.body.appendChild(successMessage);
      
      // Store user info if needed
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      // Remember me functionality
      if (!rememberMe) {
        // If remember me is not checked, we'll set a session storage flag to clear tokens on browser close
        sessionStorage.setItem('temp_session', 'true');
      }
      
      setTimeout(() => {
        document.body.removeChild(successMessage);
        navigate('/dashboard'); // Redirect to dashboard page
      }, 1500);
      
    } catch (error) {
      // Handle error response
      if (error.response) {
        if (error.response.data.error) {
          setError(error.response.data.error);
        } else {
          setError('Invalid OTP. Please try again.');
        }
      } else if (error.request) {
        setError('No response from server. Please try again.');
      } else {
        setError('An error occurred. Please try again.');
      }
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
                Welcome Back
              </span>
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Sign in with OTP
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
            
            {!otpRequested ? (
              // Email input form
              <form onSubmit={handleRequestOTP} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/70 dark:bg-gray-700/70 dark:text-white"
                    placeholder="your.email@example.com"
                    required
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={() => setRememberMe(!rememberMe)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Remember me
                    </label>
                  </div>
                </div>
                
                <button
                  type="submit"
                  className={`w-full py-3 px-4 rounded-md text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 ${
                    loading
                      ? themeColors[theme].disabled + ' cursor-not-allowed'
                      : themeColors[theme].primary
                  }`}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Requesting OTP...
                    </span>
                  ) : 'Get OTP'}
                </button>
              </form>
            ) : (
              // OTP verification form
              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    We've sent a verification code to
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {email}
                  </p>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    The code will expire in <span className="font-medium">{timer}</span> seconds
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 text-center">
                    Enter verification code
                  </label>
                  <div className="flex justify-center space-x-2">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => (otpInputs.current[index] = el)}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOTPChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={index === 0 ? handlePaste : undefined}
                        className={`w-12 h-12 text-center text-xl font-bold border-2 rounded-md 
                          bg-white/70 dark:bg-gray-700/70 dark:text-white
                          focus:outline-none focus:ring-2 ${themeColors[theme].highlight} focus:border-transparent
                          ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}
                        autoComplete="off"
                      />
                    ))}
                  </div>
                </div>
                
                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleVerifyOTP}
                    className={`w-full py-3 px-4 rounded-md text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 ${
                      loading
                        ? themeColors[theme].disabled + ' cursor-not-allowed'
                        : themeColors[theme].primary
                    }`}
                    disabled={loading || otp.join('').length !== 6}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Verifying...
                      </span>
                    ) : 'Verify and Sign in'}
                  </button>
                </div>
                
                <div className="text-center mt-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Didn't receive the code?{' '}
                    {timer > 0 ? (
                      <span className="text-gray-400 dark:text-gray-500">
                        Resend in {timer}s
                      </span>
                    ) : (
                      <button
                        type="button" 
                        onClick={handleResendOTP}
                        disabled={loading}
                        className={`font-medium ${themeColors[theme].secondary}`}
                      >
                        Resend OTP
                      </button>
                    )}
                  </p>
                </div>
                
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setOtpRequested(false);
                      setOtp(['', '', '', '', '', '']);
                      setError('');
                    }}
                    className={`text-sm font-medium ${themeColors[theme].secondary}`}
                  >
                    Use a different email
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <Link to="/register" className={`font-medium ${themeColors[theme].secondary}`}>
                Create account
              </Link>
            </p>
          </div>
          
          <div className="mt-4 text-center">
            <button
                type="button"
                onClick={() => navigate('/login')}
                className={`text-sm font-medium ${themeColors[theme].secondary}`}
            >
                ← Go back to authentication options
            </button>
          </div>
          

        </div>
      </div>
    </>
  );
};

export default OTPLogin;