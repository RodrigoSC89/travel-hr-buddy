/**
import { useEffect } from "react";;
 * PATCH 186.0 - Authentication Guard
 * 
 * Protects routes and components from unauthorized access
 * Checks authentication before rendering sensitive content
 */

import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { structuredLogger } from "@/lib/logger/structured-logger";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Shield, Loader2 } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  fallbackPath?: string;
  showAlert?: boolean;
}

/**
 * Authentication Guard Component
 * 
 * Usage:
 * <AuthGuard requiredRoles={['admin', 'super_admin']}>
 *   <SensitiveComponent />
 * </AuthGuard>
 */
export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requiredRoles = [],
  fallbackPath = "/unauthorized",
  showAlert = true,
}) => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      structuredLogger.warn("Unauthorized access attempt", {
        path: location.pathname,
        timestamp: new Date().toISOString(),
};
      
      navigate(fallbackPath, {
        state: { from: location.pathname },
        replace: true,
      });
    }
  }, [user, isLoading, navigate, location, fallbackPath]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-sm text-muted-foreground">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // User not authenticated
  if (!user) {
    if (showAlert) {
      return (
        <div className="flex items-center justify-center min-h-[400px] p-4">
          <Alert className="max-w-md border-destructive">
            <Shield className="h-4 w-4 text-destructive" />
            <AlertTitle>Acesso Negado</AlertTitle>
            <AlertDescription>
              Você precisa estar autenticado para acessar este recurso.
              Redirecionando...
            </AlertDescription>
          </Alert>
        </div>
      );
    }
    return null;
  }

  // Check role requirements if specified
  if (requiredRoles.length > 0) {
    const userRole = (user as unknown).user_metadata?.role || "user";
    const hasRequiredRole = requiredRoles.includes(userRole);

    if (!hasRequiredRole) {
      structuredLogger.warn("Insufficient permissions", {
        userId: user.id,
        requiredRoles,
        userRole,
        path: location.pathname,
      });

      if (showAlert) {
        return (
          <div className="flex items-center justify-center min-h-[400px] p-4">
            <Alert className="max-w-md border-destructive">
              <Shield className="h-4 w-4 text-destructive" />
              <AlertTitle>Permissão Insuficiente</AlertTitle>
              <AlertDescription>
                Você não tem permissão para acessar este recurso.
                {requiredRoles.length > 0 && (
                  <p className="mt-2 text-xs">
                    Funções necessárias: {requiredRoles.join(", ")}
                  </p>
                )}
              </AlertDescription>
            </Alert>
          </div>
        );
      }
      return null;
    }
  }

  // User is authenticated and has required roles
  return <>{children}</>;
};

/**
 * Hook to check if user is authenticated
 */
export const useAuthGuard = memo(() => {
  const { user, isLoading } = useAuth();
  
  const isAuthenticated = !isLoading && !!user;
  
  const hasRole = (roles: string[]): boolean => {
    if (!user) return false;
    const userRole = (user as unknown).user_metadata?.role || "user";
    return roles.includes(userRole);
  };

  const requireAuth = (callback: () => void): void => {
    if (isAuthenticated) {
      callback();
    } else {
      structuredLogger.warn("Action requires authentication", {
        action: callback.name || "anonymous",
      };
    }
  };

  return {
    isAuthenticated,
    isLoading,
    user,
    hasRole,
    requireAuth,
  };
};

/**
 * Higher-order component for protecting routes
 */
export function withAuthGuard<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    requiredRoles?: string[];
    fallbackPath?: string;
  }
): React.FC<P> {
  return (props: P) => (
    <AuthGuard
      requiredRoles={options?.requiredRoles}
      fallbackPath={options?.fallbackPath}
    >
      <Component {...props} />
    </AuthGuard>
  );
};
