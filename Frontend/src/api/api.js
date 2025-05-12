import axios from 'axios';


const baseURL = 'https://task.affils.site/api';
const axiosInstance = axios.create({
    baseURL,
    timeout: 5000,
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  // Attach token
  axiosInstance.interceptors.request.use(
    async config => {
      const access = localStorage.getItem('access');
      if (access) {
        config.headers['Authorization'] = `Bearer ${access}`;
      }
      return config;
    },
    error => Promise.reject(error)
  );
  
  // Refresh token if needed
  axiosInstance.interceptors.response.use(
    response => response,
    async error => {
      const originalRequest = error.config;
  
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
  
        try {
          const refresh = localStorage.getItem('refresh');
          const res = await axios.post(`${baseURL}/token/refresh/`, {
            refresh,
          });
  
          const newAccess = res.data.access;
          localStorage.setItem('access', newAccess);
  
          axiosInstance.defaults.headers['Authorization'] = `Bearer ${newAccess}`;
          originalRequest.headers['Authorization'] = `Bearer ${newAccess}`;
  
          return axiosInstance(originalRequest);
        } catch (err) {
          localStorage.removeItem('access');
          localStorage.removeItem('refresh');
          window.location.href = '/login'; // Redirect to login
        }
      }
  
      return Promise.reject(error);
    }
  );
  
  export default axiosInstance;