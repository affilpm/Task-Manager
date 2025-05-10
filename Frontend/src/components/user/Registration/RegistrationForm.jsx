import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Link } from 'react-router-dom';

// Step 1: Initial registration form validation schema
const RegisterSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Email is required'),
  full_name: Yup.string().required('Full name is required'),
  password: Yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/\d/, 'Password must contain at least one number')
    .matches(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character'),
  confirm_password: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
});

// Custom error component for Formik with Tailwind
const ErrorText = ({ children }) => (
  <div className="text-red-500 text-sm mt-1">{children}</div>
);

const RegistrationForm = ({ onSubmit, loading, theme, themeColors, isDarkMode }) => {
  return (
    <Formik
      initialValues={{
        email: '',
        full_name: '',
        password: '',
        confirm_password: '',
      }}
      validationSchema={RegisterSchema}
      onSubmit={onSubmit}
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
            <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Full Name
            </label>
            <Field
              type="text"
              name="full_name"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/70 dark:bg-gray-700/70 dark:text-white"
              placeholder="John Doe"
            />
            <ErrorMessage name="full_name" component={ErrorText} />
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
          
          <div>
            <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Confirm Password
            </label>
            <Field
              type="password"
              name="confirm_password"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/70 dark:bg-gray-700/70 dark:text-white"
              placeholder="••••••••"
            />
            <ErrorMessage name="confirm_password" component={ErrorText} />
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
                Processing...
              </span>
            ) : 'Create Account'}
          </button>
          
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className={`font-medium ${themeColors[theme].secondary}`}>
                Sign in
              </Link>
            </p>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default RegistrationForm;