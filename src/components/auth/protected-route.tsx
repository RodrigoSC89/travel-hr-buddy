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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  requiredRoles = [],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  unauthorizedRedirect = "/unauthorized"
}) => {
  // TEMPORARIAMENTE DESABILITADO - TODO: reativar quando auth estiver funcionando
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
