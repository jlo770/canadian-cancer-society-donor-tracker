import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { useAuth } from '../../context/AuthContext';

/**
 * ProtectedRoute component to restrict access to authenticated users only
 * Redirects unauthenticated users to the login page
 * Can also restrict routes based on user role
 */
const ProtectedRoute = ({ children, requiredRole }) => {
  const { currentUser, loading, isAdmin } = useAuth();
  const location = useLocation();

  // Show loading spinner while auth state is being determined
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // If user is not authenticated, redirect to login
  if (!currentUser) {
    // Save the location they were trying to access for redirect after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If route requires specific role (e.g., admin) and user doesn't have it
  if (requiredRole === 'admin' && !isAdmin()) {
    // Redirect to dashboard with unauthorized access
    return <Navigate to="/" replace />;
  }

  // User is authenticated and has required role, render the protected component
  return children;
};

export default ProtectedRoute;
