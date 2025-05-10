import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// Dynamic Background component - reusing the same one from existing components
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

const LoginNavigator = () => {
  const [theme, setTheme] = useState('blue');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedOption, setSelectedOption] = useState('password');
  const navigate = useNavigate();
  const location = useLocation();
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const [showOtpConfirmation, setShowOtpConfirmation] = useState(false);

  // Check system theme preference
  useEffect(() => {
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(darkModeMediaQuery.matches);
    
    const handleThemeChange = (e) => setIsDarkMode(e.matches);
    darkModeMediaQuery.addEventListener('change', handleThemeChange);
    
    return () => darkModeMediaQuery.removeEventListener('change', handleThemeChange);
  }, []);

  // Get random theme on component mount - matching the same system from other components
  useEffect(() => {
    const themes = ['blue', 'purple', 'green'];
    const randomTheme = themes[Math.floor(Math.random() * themes.length)];
    setTheme(randomTheme);
  }, []);

  // Set selected option based on current path
  useEffect(() => {
    if (location.pathname === '/otplogin') {
      setSelectedOption('otp');
    } else if (location.pathname === '/passwordlogin') {
      setSelectedOption('password');
    }
    // Don't change selection if on the navigator page itself
  }, [location.pathname]);

  // Theme colors mapping - same as other login components
  const themeColors = {
    blue: {
      primary: `${isDarkMode ? 'bg-blue-700 hover:bg-blue-800 focus:ring-blue-600' : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'}`,
      secondary: `${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`,
      activeTab: `${isDarkMode ? 'border-blue-500 text-blue-400' : 'border-blue-500 text-blue-600'}`,
      inactiveTab: `${isDarkMode ? 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`,
      gradientText: `${isDarkMode ? 'from-blue-400 to-indigo-300' : 'from-blue-500 to-indigo-600'}`
    },
    purple: {
      primary: `${isDarkMode ? 'bg-purple-700 hover:bg-purple-800 focus:ring-purple-600' : 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500'}`,
      secondary: `${isDarkMode ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-800'}`,
      activeTab: `${isDarkMode ? 'border-purple-500 text-purple-400' : 'border-purple-500 text-purple-600'}`,
      inactiveTab: `${isDarkMode ? 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`,
      gradientText: `${isDarkMode ? 'from-purple-400 to-pink-300' : 'from-purple-500 to-pink-600'}`
    },
    green: {
      primary: `${isDarkMode ? 'bg-emerald-700 hover:bg-emerald-800 focus:ring-emerald-600' : 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500'}`,
      secondary: `${isDarkMode ? 'text-emerald-400 hover:text-emerald-300' : 'text-emerald-600 hover:text-emerald-800'}`,
      activeTab: `${isDarkMode ? 'border-emerald-500 text-emerald-400' : 'border-emerald-500 text-emerald-600'}`,
      inactiveTab: `${isDarkMode ? 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`,
      gradientText: `${isDarkMode ? 'from-emerald-400 to-teal-300' : 'from-emerald-500 to-teal-600'}`
    }
  };

  // Handle tab selection - only change the selected option without navigating
  const handleSelectOption = (option) => {
    setSelectedOption(option);
  };

  // Handle navigation with confirmation buttons
  const handlePasswordConfirmation = () => {
    setShowPasswordConfirmation(true);
    setTimeout(() => {
      navigate('/passwordlogin');
    }, 300);
  };

  const handleOtpConfirmation = () => {
    setShowOtpConfirmation(true);
    setTimeout(() => {
      navigate('/otplogin');
    }, 300);
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
              Choose your sign-in method
            </p>
          </div>

          <div className={`${isDarkMode ? 
            'bg-gray-800/80 backdrop-blur-sm shadow-xl border-gray-700' : 
            'bg-white/80 backdrop-blur-sm shadow-xl border-gray-200'} 
            rounded-xl p-8 transition-all duration-300 border`}>
            
            {/* Auth Method Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="-mb-px flex space-x-8" aria-label="Authentication Options">
                <button
                  onClick={() => handleSelectOption('password')}
                  className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors duration-200 ease-out ${
                    selectedOption === 'password' 
                      ? themeColors[theme].activeTab 
                      : themeColors[theme].inactiveTab
                  }`}
                  aria-current={selectedOption === 'password' ? 'page' : undefined}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Password</span>
                </button>
                
                <button
                  onClick={() => handleSelectOption('otp')}
                  className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors duration-200 ease-out ${
                    selectedOption === 'otp' 
                      ? themeColors[theme].activeTab 
                      : themeColors[theme].inactiveTab
                  }`}
                  aria-current={selectedOption === 'otp' ? 'page' : undefined}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span>OTP</span>
                </button>
              </nav>
            </div>
            
            <div className="mt-8 space-y-6">
              {/* Method descriptions */}
              <div className="space-y-4">
                {selectedOption === 'password' ? (
                  <div className="animate-fadeIn">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Sign in with Password</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Enter your email and password to access your account.
                    </p>
                    <button
                      onClick={handlePasswordConfirmation}
                      disabled={showPasswordConfirmation}
                      className={`mt-6 w-full py-3 px-4 rounded-md text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 flex justify-center items-center ${themeColors[theme].primary}`}
                    >
                      {showPasswordConfirmation ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Proceeding...
                        </>
                      ) : (
                        "Continue with Password"
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="animate-fadeIn">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Sign in with OTP</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        Enter your email to receive a one-time OTP for secure login.
                    </p>
                    <button
                      onClick={handleOtpConfirmation}
                      disabled={showOtpConfirmation}
                      className={`mt-6 w-full py-3 px-4 rounded-md text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 flex justify-center items-center ${themeColors[theme].primary}`}
                    >
                      {showOtpConfirmation ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Proceeding...
                        </>
                      ) : (
                        "Continue with OTP"
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <button 
                onClick={() => navigate('/register')}
                className={`font-medium ${themeColors[theme].secondary}`}
              >
                Create account
              </button>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginNavigator;