/**
 * Protected Route Guard - PATCH 68.5
 * Authentication and role-based access control for routes
 */
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions, UserRole } from "@/hooks/use-permissions";
import { OffshoreLoader } from "@/components/LoadingStates";

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Required roles to access this route (empty = any authenticated user) */
  requiredRoles?: UserRole[];
  /** Redirect path when unauthorized (default: /unauthorized) */
  unauthorizedRedirect?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children,
  requiredRoles = [],
  unauthorizedRedirect = "/unauthorized"
}) => {
  const { user, isLoading: authLoading } = useAuth();
  const { userRole, isLoading: roleLoading } = usePermissions();
  const location = useLocation();

  const isLoading = authLoading || roleLoading;

  // Show loading while checking authentication
  if (isLoading) {
    return <OffshoreLoader />;
  }

  // Redirect to auth if not authenticated
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Check role-based access if roles are specified
  if (requiredRoles.length > 0 && userRole) {
    const hasRequiredRole = requiredRoles.includes(userRole);
    
    if (!hasRequiredRole) {
      return <Navigate to={unauthorizedRedirect} state={{ from: location }} replace />;
    }
  }

  return <>{children}</>;
};

/**
 * Admin-only route guard
 */
export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredRoles={["admin"]}>
    {children}
  </ProtectedRoute>
);

/**
 * HR route guard (admin or hr_manager)
 */
export const HRRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
    {children}
  </ProtectedRoute>
);

/**
 * Manager route guard (admin, hr_manager, manager, supervisor)
 */
export const ManagerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredRoles={["admin", "hr_manager", "manager", "supervisor", "department_manager"]}>
    {children}
  </ProtectedRoute>
);

export default ProtectedRoute;
