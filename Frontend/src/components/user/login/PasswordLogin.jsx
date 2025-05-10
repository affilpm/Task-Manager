import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axiosInstance from '../../../api/api';

// Dynamic background component remains the same
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

// Custom error component for Formik with Tailwind
const ErrorText = ({ children }) => (
  <div className="text-red-500 text-sm mt-1">{children}</div>
);

// Login validation schema
const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .required('Password is required')
});

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [theme, setTheme] = useState('blue');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
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
      gradientText: `${isDarkMode ? 'from-blue-400 to-indigo-300' : 'from-blue-500 to-indigo-600'}`
    },
    purple: {
      primary: `${isDarkMode ? 'bg-purple-700 hover:bg-purple-800 focus:ring-purple-600' : 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500'}`,
      secondary: `${isDarkMode ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-800'}`,
      disabled: `${isDarkMode ? 'bg-purple-600/50' : 'bg-purple-400'}`,
      error: `${isDarkMode ? 'bg-red-900/50 text-red-300' : 'bg-red-50 text-red-600'}`,
      gradientText: `${isDarkMode ? 'from-purple-400 to-pink-300' : 'from-purple-500 to-pink-600'}`
    },
    green: {
      primary: `${isDarkMode ? 'bg-emerald-700 hover:bg-emerald-800 focus:ring-emerald-600' : 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500'}`,
      secondary: `${isDarkMode ? 'text-emerald-400 hover:text-emerald-300' : 'text-emerald-600 hover:text-emerald-800'}`,
      disabled: `${isDarkMode ? 'bg-emerald-600/50' : 'bg-emerald-400'}`,
      error: `${isDarkMode ? 'bg-red-900/50 text-red-300' : 'bg-red-50 text-red-600'}`,
      gradientText: `${isDarkMode ? 'from-emerald-400 to-teal-300' : 'from-emerald-500 to-teal-600'}`
    }
  };

  // Get random theme on component mount - using same theme system as Register
  useEffect(() => {
    const themes = ['blue', 'purple', 'green'];
    const randomTheme = themes[Math.floor(Math.random() * themes.length)];
    setTheme(randomTheme);
  }, []);

  // Updated handle login form submission to connect with backend API
  const handleLoginSubmit = async (values, { setSubmitting }) => {
    setLoading(true);
    setError('');
    
    try {
      // Call the backend API for login
      const response = await axiosInstance.post('/users/login/password/', {
        email: values.email,
        password: values.password
      });
      console.log(response.data)
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
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (error.response.data.detail) {
          setError(error.response.data.detail);
        } else if (error.response.data.non_field_errors) {
          setError(error.response.data.non_field_errors[0]);
        } else {
          setError('Invalid email or password');
        }
      } else if (error.request) {
        // The request was made but no response was received
        setError('No response from server. Please try again.');
      } else {
        // Something happened in setting up the request that triggered an Error
        setError('An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  // Handle forgot password (dummy)
  const handleForgotPassword = () => {
    navigate('/forgot-password');
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
              Sign in to your account
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
            
            <Formik
              initialValues={{
                email: '',
                password: '',
              }}
              validationSchema={LoginSchema}
              onSubmit={handleLoginSubmit}
            >
              {({ isSubmitting }) => (
                <Form className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email
                    </label>
                    <Field
                      type="email"
                      name="email"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/70 dark:bg-gray-700/70 dark:text-white"
                      placeholder="your.email@example.com"
                    />
                    <ErrorMessage name="email" component={ErrorText} />
                  </div>
                  
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Password
                    </label>
                    <Field
                      type="password"
                      name="password"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/70 dark:bg-gray-700/70 dark:text-white"
                      placeholder="••••••••"
                    />
                    <ErrorMessage name="password" component={ErrorText} />
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
                    
                    <div className="text-sm">
                      <button
                        type="button"
                        onClick={handleForgotPassword}
                        className={`font-medium ${themeColors[theme].secondary}`}
                      >
                        Forgot password?
                      </button>
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    className={`w-full py-3 px-4 rounded-md text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 ${
                      isSubmitting || loading
                        ? themeColors[theme].disabled + ' cursor-not-allowed'
                        : themeColors[theme].primary
                    }`}
                    disabled={isSubmitting || loading}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Signing in...
                      </span>
                    ) : 'Sign in'}
                  </button>
                </Form>
              )}
            </Formik>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <Link to="/register" className={`font-medium ${themeColors[theme].secondary}`}>
                Create account
              </Link>
            </p>
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
      </div>
    </>
  );
};

export default Login;