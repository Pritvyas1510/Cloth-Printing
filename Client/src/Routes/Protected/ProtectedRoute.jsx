// src/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../AuthContext/AuthContext";

const ProtectedRoute = ({ children, role }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If route requires a role and user doesn't match → block
  if (role && user?.role?.toLowerCase() !== role.toLowerCase()) {
    console.warn("Blocked unauthorized access:", user?.role, "needed:", role);
    return <Navigate to="*" replace />;
  }

  return children;
};

export default ProtectedRoute;
