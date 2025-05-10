import axiosInstance from "../api/api";

const AuthService = {
  /**
   * Login with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise} - Response with tokens and user data
   */
  login: async (email, password) => {
    try {
      const response = await axiosInstance.post('/users/login/password/', { email, password });
      
      if (response.data.access) {
        localStorage.setItem('access', response.data.access);
        localStorage.setItem('refresh', response.data.refresh);
        
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
      }
      
      return response.data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },
  
  /**
   * Logout user - clear tokens and user data
   */
  logout: () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem('user');
  },
  
  /**
   * Get current user from localStorage
   * @returns {Object|null} - User object or null
   */
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        localStorage.removeItem('user');
        return null;
      }
    }
    return null;
  },
  
  /**
   * Check if user is logged in by verifying token
   * @returns {Promise<boolean>} - True if token is valid
   */
  verifyToken: async () => {
    try {
      const token = localStorage.getItem('access');
      if (!token) return false;
      
      // Attempt to verify the token with the server
      await axiosInstance.post('/users/token/verify/', { token });
      return true;
    } catch (error) {
      console.error("Token verification failed:", error);
      
      // If token is expired, try to refresh it
      try {
        await AuthService.refreshToken();
        return true;
      } catch (refreshError) {
        // If refresh fails, user needs to login again
        return false;
      }
    }
  },
  
  /**
   * Refresh the access token using the refresh token
   * @returns {Promise} - New access token
   */
  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem('refresh');
      if (!refreshToken) throw new Error('No refresh token available');
      
      const response = await axiosInstance.post('/users/token/refresh/', { refresh: refreshToken });
      
      if (response.data.access) {
        localStorage.setItem('access', response.data.access);
        return response.data.access;
      } else {
        throw new Error('No access token in response');
      }
    } catch (error) {
      console.error("Token refresh failed:", error);
      // Clear tokens as they're invalid
      AuthService.logout();
      throw error;
    }
  },
  
  /**
   * Check if user is authenticated
   * @returns {boolean} - True if access token exists
   */
  isAuthenticated: () => {
    return !!localStorage.getItem('access');
  }
};

export default AuthService;