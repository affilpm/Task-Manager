import axios from 'axios';

const API_URL = 'https://task.affils.site/api/';

/**
 * Initiates the registration process by sending user data to the server
 * @param {Object} userData - User registration data including email, full_name, password
 * @returns {Promise} - API response
 */
export const initiateRegistration = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}users/register/initiate/`, userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Verifies OTP for user registration
 * @param {string} email - User's email address
 * @param {string} otp - One-time password to verify
 * @returns {Promise} - API response
 */
export const verifyOTP = async (email, otp) => {
  try {
    const response = await axios.post(`${API_URL}users/register/verify-otp/`, { email, otp });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Resends OTP to the user's email
 * @param {string} email - User's email address
 * @returns {Promise} - API response
 */
export const resendOTP = async (email) => {
  try {
    const response = await axios.post(`${API_URL}users/register/resend-otp/`, { email });
    return response.data;
  } catch (error) {
    throw error;
  }
};