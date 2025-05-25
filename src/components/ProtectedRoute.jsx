import React, { useContext } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import AppContext from '../context/AppContext';
import FullScreenSpinner from './FullScreenSpinner';

const ProtectedRoute = () => {
  const { isAuthenticated, authLoading } = useContext(AppContext);
  const location = useLocation();

  if (authLoading) {
    return <FullScreenSpinner message="Authenticating..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;