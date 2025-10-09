import React from "react";
import { usePermissions, UserRole } from "@/hooks/use-permissions";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, AlertTriangle } from "lucide-react";

interface RoleBasedAccessProps {
  roles?: UserRole[];
  permissions?: Array<{
    permission: "users" | "certificates" | "reports" | "system_settings" | "analytics";
    action?: "read" | "write" | "delete" | "manage";
  }>;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showFallback?: boolean;
}

export const RoleBasedAccess: React.FC<RoleBasedAccessProps> = ({
  roles,
  permissions,
  children,
  fallback,
  showFallback = true
}) => {
  const { userRole, hasPermission, isLoading } = usePermissions();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Verificar acesso por role
  if (roles && userRole) {
    const hasRoleAccess = roles.includes(userRole);
    if (!hasRoleAccess) {
      return showFallback ? (fallback || <AccessDeniedFallback />) : null;
    }
  }

  // Verificar acesso por permissões específicas
  if (permissions && permissions.length > 0) {
    const hasPermissionAccess = permissions.some(({ permission, action = "read" }) =>
      hasPermission(permission, action)
    );
    if (!hasPermissionAccess) {
      return showFallback ? (fallback || <AccessDeniedFallback />) : null;
    }
  }

  return <>{children}</>;
};

const AccessDeniedFallback: React.FC = () => (
  <Card className="border-destructive/20">
    <CardContent className="flex items-center justify-center p-6">
      <div className="text-center space-y-2">
        <AlertTriangle className="w-8 h-8 text-destructive mx-auto" />
        <h3 className="font-semibold text-destructive">Acesso Negado</h3>
        <p className="text-sm text-muted-foreground">
          Você não tem permissão para acessar este conteúdo
        </p>
      </div>
    </CardContent>
  </Card>
);