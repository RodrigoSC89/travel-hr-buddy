/**
 * Protected Route Guard - PATCH 177.0
 * Authentication and role-based access control for routes
 * 
 * INTEGRATION STATUS: Ready for activation
 * Set ENABLE_AUTH_PROTECTION=true in environment to enable
 */
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions, UserRole } from "@/hooks/use-permissions";
import { OffshoreLoader } from "@/components/ux/LoadingStates";

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Required roles to access this route (empty = any authenticated user) */
  requiredRoles?: UserRole[];
  /** Redirect path when unauthorized (default: /unauthorized) */
  unauthorizedRedirect?: string;
}

// Feature flag for enabling authentication protection
const AUTH_PROTECTION_ENABLED = import.meta.env.VITE_ENABLE_AUTH_PROTECTION === "true";

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children,
  requiredRoles = [],
  unauthorizedRedirect = "/unauthorized"
}) => {
  const location = useLocation();
  const { user, isLoading } = useAuth();
  const { hasAnyRole } = usePermissions();

  // If auth protection is disabled, allow access (development mode)
  if (!AUTH_PROTECTION_ENABLED) {
    return <>{children}</>;
  }

  // Show loader while checking authentication
  if (isLoading) {
    return <OffshoreLoader />;
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Check role-based access if roles are specified
  if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
    return <Navigate to={unauthorizedRedirect} replace />;
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
