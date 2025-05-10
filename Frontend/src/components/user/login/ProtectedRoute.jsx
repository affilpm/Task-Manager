import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import AuthService from '../../services/AuthenticationService';

const ProtectedRoute = ({ children }) => {
  const [isAuth, setIsAuth] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      
      try {
        // First check if we have a token
        const token = localStorage.getItem('access');
        
        if (!token) {
          setIsAuth(false);
          setIsLoading(false);
          return;
        }
        
        // Verify token validity with the server when possible
        // This helps prevent access with expired tokens
        const isValid = await AuthService.verifyToken();
        setIsAuth(isValid);
      } catch (error) {
        console.error("Authentication check failed:", error);
        setIsAuth(false);
      } finally {
        setIsLoading(false);
      }
    };

    // Check auth on mount and whenever location changes
    checkAuth();

    // Also add an event listener for storage changes
    // This will catch when localStorage is modified in another tab
    const handleStorageChange = (e) => {
      if (e.key === 'access' || e.key === null) {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Clean up the event listener
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [location.pathname]); // Re-run when the path changes

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuth) {
    // Use React Router's Navigate component for proper SPA navigation
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Render the protected content
  return children;
};

export default ProtectedRoute;