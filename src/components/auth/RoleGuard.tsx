/**
 * RoleGuard Component
 * PATCH 122.0 - RBAC Implementation
 * 
 * Protects routes and components based on user roles with fine-grained module permissions
 */

import React from "react";
import { usePermissions, UserRole } from "@/hooks/use-permissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface RoleGuardProps {
  /**
   * Required roles to access the content
   */
  requiredRoles?: UserRole[];
  
  /**
   * Module name to check permissions against
   */
  module?: string;
  
  /**
   * Minimum required role level (uses role hierarchy)
   */
  minRole?: UserRole;
  
  /**
   * Content to render if user has access
   */
  children: React.ReactNode;
  
  /**
   * Custom fallback content for denied access
   */
  fallback?: React.ReactNode;
  
  /**
   * Whether to show fallback or return null
   */
  showFallback?: boolean;
  
  /**
   * Custom loading component
   */
  loadingComponent?: React.ReactNode;
}

/**
 * Role hierarchy from highest to lowest privilege
 */
const ROLE_HIERARCHY: Record<UserRole, number> = {
  admin: 100,
  hr_manager: 80,
  manager: 60,
  hr_analyst: 55,
  department_manager: 50,
  coordinator: 40,
  supervisor: 30,
  auditor: 20,
  employee: 10,
};

/**
 * RoleGuard component that protects content based on user roles
 */
export const RoleGuard: React.FC<RoleGuardProps> = ({
  requiredRoles,
  module,
  minRole,
  children,
  fallback,
  showFallback = true,
  loadingComponent,
}) => {
  const { userRole, canAccessModule, isLoading } = usePermissions();

  // Show loading state
  if (isLoading) {
    return loadingComponent || <LoadingFallback />;
  }

  // No user role means not authenticated
  if (!userRole) {
    return showFallback ? (
      fallback || <AccessDeniedFallback message="Por favor, faça login para acessar este conteúdo." />
    ) : null;
  }

  // Check specific required roles
  if (requiredRoles && requiredRoles.length > 0) {
    if (!requiredRoles.includes(userRole)) {
      return showFallback ? (
        fallback || (
          <AccessDeniedFallback 
            message={`Acesso restrito a: ${requiredRoles.join(", ")}`} 
          />
        )
      ) : null;
    }
  }

  // Check minimum role level (hierarchical)
  if (minRole) {
    const userRoleLevel = ROLE_HIERARCHY[userRole] || 0;
    const minRoleLevel = ROLE_HIERARCHY[minRole] || 0;
    
    if (userRoleLevel < minRoleLevel) {
      return showFallback ? (
        fallback || (
          <AccessDeniedFallback 
            message={`Requer nível de acesso: ${minRole} ou superior`} 
          />
        )
      ) : null;
    }
  }

  // Check module-specific permissions
  if (module && !canAccessModule(module)) {
    return showFallback ? (
      fallback || (
        <AccessDeniedFallback 
          message={`Você não tem permissão para acessar o módulo: ${module}`} 
        />
      )
    ) : null;
  }

  // User has access
  return <>{children}</>;
};

/**
 * Loading fallback component
 */
const LoadingFallback: React.FC = () => (
  <div className="flex items-center justify-center p-8">
    <div className="flex flex-col items-center space-y-4">
      <Shield className="w-8 h-8 text-primary animate-pulse" />
      <p className="text-sm text-muted-foreground">Verificando permissões...</p>
    </div>
  </div>
);

/**
 * Access denied fallback component
 */
const AccessDeniedFallback: React.FC<{ message?: string }> = ({ message }) => (
  <Card className="border-destructive/20">
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-destructive">
        <Shield className="w-5 h-5" />
        Acesso Negado
      </CardTitle>
    </CardHeader>
    <CardContent>
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {message || "Você não tem permissão para acessar este conteúdo."}
        </AlertDescription>
      </Alert>
    </CardContent>
  </Card>
);

/**
 * Hook to check if user has specific role
 */
export const useHasRole = (roles: UserRole | UserRole[]): boolean => {
  const { userRole } = usePermissions();
  
  if (!userRole) return false;
  
  const rolesArray = Array.isArray(roles) ? roles : [roles];
  return rolesArray.includes(userRole);
});

/**
 * Hook to check minimum role level
 */
export const useHasMinRole = (minRole: UserRole): boolean => {
  const { userRole } = usePermissions();
  
  if (!userRole) return false;
  
  const userRoleLevel = ROLE_HIERARCHY[userRole] || 0;
  const minRoleLevel = ROLE_HIERARCHY[minRole] || 0;
  
  return userRoleLevel >= minRoleLevel;
});
