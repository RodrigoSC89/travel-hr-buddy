import React from "react";
import { usePermissions } from "@/hooks/use-permissions";

interface PermissionGuardProps {
  permission: "users" | "certificates" | "reports" | "system_settings" | "analytics";
  action?: "read" | "write" | "delete" | "manage";
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permission,
  action = "read",
  children,
  fallback = null
}) => {
  const { hasPermission } = usePermissions();

  if (!hasPermission(permission, action)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};