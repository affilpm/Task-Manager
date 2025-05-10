import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../../services/AuthenticationService';
import axiosInstance from '../../api/api';

const LogoutButton = ({ className, buttonText = 'Logout' }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogout = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get the refresh token from localStorage to blacklist it on the server
      const refreshToken = localStorage.getItem('refresh');
      
      if (refreshToken) {
        // Call the server's logout endpoint to blacklist the token
        await axiosInstance.post('/users/logout/', { refresh: refreshToken });
      }
      
      // Clear local storage regardless of server response
      AuthService.logout();
      
      // Redirect to login page
      window.location.href = '/login';
    } catch (error) {
      setError('Logout failed. Please try again.');
      console.error('Logout error:', error);
      
      // Even if the server request fails, we should still clear local storage
      // to ensure the user is logged out on the client side
      AuthService.logout();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={className}>
      <button 
        onClick={handleLogout}
        disabled={isLoading}
        className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
      >
        {isLoading ? 'Logging out...' : buttonText}
      </button>
      
      {error && (
        <p className="text-red-500 mt-2 text-sm">{error}</p>
      )}
    </div>
  );
};

// You can also create a full logout page component
const LogoutPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  React.useEffect(() => {
    const performLogout = async () => {
      setIsLoading(true);
      
      try {
        // Get the refresh token from localStorage to blacklist it on the server
        const refreshToken = localStorage.getItem('refresh');
        
        if (refreshToken) {
          // Call the server's logout endpoint to blacklist the token
          await axiosInstance.post('/user/logout/', { refresh: refreshToken });
        }
        
        // Clear local storage
        AuthService.logout();
        
        // Redirect to login page with a small delay
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 1000);
      } catch (error) {
        console.error('Logout error:', error);
        // Still clear local storage and redirect
        AuthService.logout();
        window.location.href = '/login';
      }
    };
    
    performLogout();
  }, [navigate]);
  
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold mb-4">Logging Out</h1>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
        <p className="mt-4 text-gray-600">Please wait while we securely log you out...</p>
      </div>
    </div>
  );
};

// A navbar component with logout button example
const NavbarWithLogout = () => {
  const user = AuthService.getCurrentUser();
  
  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="font-bold text-xl">Your App</div>
        
        <div className="flex items-center space-x-4">
          {user && (
            <>
              <span>Welcome, {user.name || user.email}</span>
              <LogoutButton buttonText="Sign Out" />
            </>
          )}
          
          {!user && (
            <button 
              onClick={() => window.location.href = '/login'}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export { LogoutButton, LogoutPage, NavbarWithLogout };