import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth';

// Wrap protected routes: if no token redirect to /login preserving intended location.
export default function ProtectedRoute({ children }) {
  const { token } = useAuth();
  const location = useLocation();

  if (!token) {
    return (
      <Navigate to="/login" replace state={{ from: location }} />
    );
  }

  // Support both element wrapper <ProtectedRoute><Dashboard/></ProtectedRoute>
  // and route outlet pattern.
  return children ? children : <Outlet />;
}
