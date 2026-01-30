/**
 * Protected Route Guard - PATCH v41 - Zero infinite loading tolerance
 * Uses named imports to prevent multiple React instances
 */
import * as React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions, UserRole } from "@/hooks/use-permissions";
import { ModulePageSkeleton as OffshoreLoader } from "@/components/ui/enhanced-skeletons";
import type { ReactNode, FC } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  /** Required roles to access this route (empty = any authenticated user) */
  requiredRoles?: UserRole[];
  /** Redirect path when unauthorized (default: /unauthorized) */
  unauthorizedRedirect?: string;
}

// Feature flag for enabling authentication protection
// Safe getter for env vars
const getEnv = (key: string): string | undefined => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      return import.meta.env[key] as string | undefined;
    }
  } catch {
    return undefined;
  }
  return undefined;
};

const AUTH_PROTECTION_ENABLED = getEnv('VITE_ENABLE_AUTH_PROTECTION') === "true";

export const ProtectedRoute: FC<ProtectedRouteProps> = ({ 
  children,
  requiredRoles = [],
  unauthorizedRedirect = "/unauthorized"
}) => {
  const location = useLocation();
  const { user, isLoading } = useAuth();
  const { hasAnyRole } = usePermissions();
  const [forceAllow, setForceAllow] = React.useState(false);

  // PATCH v41: Safety timeout - NEVER block for more than 500ms
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setForceAllow(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // If auth protection is disabled, allow access (development mode)
  if (!AUTH_PROTECTION_ENABLED) {
    return <>{children}</>;
  }

  // PATCH v41: If timeout expired, redirect to auth instead of infinite spinner
  if (forceAllow && !user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Show loader while checking authentication (max 500ms)
  if (isLoading && !forceAllow) {
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
export const AdminRoute: FC<{ children: ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredRoles={["admin"]}>
    {children}
  </ProtectedRoute>
);

/**
 * HR route guard (admin or hr_manager)
 */
export const HRRoute: FC<{ children: ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
    {children}
  </ProtectedRoute>
);

/**
 * Manager route guard (admin, hr_manager, manager, supervisor)
 */
export const ManagerRoute: FC<{ children: ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredRoles={["admin", "hr_manager", "manager", "supervisor", "department_manager"]}>
    {children}
  </ProtectedRoute>
);

export default ProtectedRoute;
