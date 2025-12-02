import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { OffshoreLoader } from "@/components/LoadingStates";

// DEVELOPMENT: Set to true to bypass auth temporarily
const BYPASS_AUTH_FOR_DEMO = true;

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children
}) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // DEVELOPMENT: Bypass authentication for demo purposes
  if (BYPASS_AUTH_FOR_DEMO) {
    return <>{children}</>;
  }

  // Show loading while checking authentication
  if (isLoading) {
    return <OffshoreLoader />;
  }

  // Redirect to auth if not authenticated
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;