import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import AuthService from '../../services/AuthenticationService';

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const verify = async () => {
      const valid = await AuthService.verifyToken();
      setIsAuthenticated(valid);
    };

    verify();
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-lg font-semibold">Checking authentication...</div>
      </div>
    );
  }

  // If children are passed (not using outlet), render them
  return isAuthenticated ? (children || <Outlet />) : <Navigate to="/login" replace />;
};

export default ProtectedRoute;