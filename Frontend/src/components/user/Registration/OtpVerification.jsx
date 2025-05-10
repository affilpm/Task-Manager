import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

// Step 2: OTP verification validation schema
const OTPSchema = Yup.object().shape({
  otp: Yup.string()
    .matches(/^\d{6}$/, 'OTP must be exactly 6 digits')
    .required('OTP is required'),
});

// Custom error component for Formik with Tailwind
const ErrorText = ({ children }) => (
  <div className="text-red-500 text-sm mt-1">{children}</div>
);

const OTPVerification = ({ 
  userEmail, 
  onSubmit, 
  onResendOTP, 
  onBack, 
  loading, 
  countdown, 
  resendDisabled, 
  otpExpired, 
  theme, 
  themeColors,
  isDarkMode
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center mb-4">
        <div className="relative">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
            isDarkMode ? 'bg-blue-900 border-2 border-blue-600' : 'bg-blue-100 border-2 border-blue-500'
          }`}>
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      </div>
      
      <p className={`text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} font-medium`}>
        We've sent a 6-digit OTP to <br />
        <span className={`font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{userEmail}</span>
      </p>
      
      {otpExpired && (
        <div className={`${themeColors[theme].warning} p-3 rounded-md mb-2 text-center animate-pulse`}>
          Your OTP has expired. Please request a new one.
        </div>
      )}
      
      <Formik
        initialValues={{ otp: '' }}
        validationSchema={OTPSchema}
        onSubmit={onSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-4">
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Enter OTP
              </label>
              <Field
                type="text"
                name="otp"
                maxLength="6"
                className={`w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center tracking-widest text-lg font-mono ${
                  isDarkMode ? 'bg-gray-700/70 text-white' : 'bg-white/70 text-gray-900'
                } ${otpExpired ? 'opacity-50' : ''}`}
                disabled={otpExpired}
                placeholder="••••••"
              />
              <ErrorMessage name="otp" component={ErrorText} />
              
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                OTP valid for {countdown > 0 ? countdown : 0} seconds
              </div>
            </div>
            
            <button
              type="submit"
              className={`w-full py-3 px-4 rounded-md text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 ${
                isSubmitting || loading || otpExpired
                  ? themeColors[theme].disabled + ' cursor-not-allowed'
                  : themeColors[theme].primary
              }`}
              disabled={isSubmitting || loading || otpExpired}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </span>
              ) : 'Verify & Complete Registration'}
            </button>
          </Form>
        )}
      </Formik>
      
      <div className="text-center">
        <button 
          onClick={onResendOTP} 
          disabled={resendDisabled || loading} 
          className={`${themeColors[theme].secondary} text-sm font-medium transition-all duration-300 ${resendDisabled || loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {resendDisabled 
            ? `Resend OTP in ${countdown}s` 
            : 'Resend OTP'}
        </button>
      </div>
      
      <div className="mt-6">
        <button 
          onClick={onBack} 
          className={`w-full flex items-center justify-center py-2 px-4 rounded-md text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 ${
            loading
              ? themeColors[theme].backDisabled + ' cursor-not-allowed'
              : themeColors[theme].back
          }`}
          disabled={loading}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to registration
        </button>
      </div>
    </div>
  );
};

export default OTPVerification;