import type { ReactNode, FC } from "react";
import { usePermissions } from "@/hooks/use-permissions";

interface PermissionGuardProps {
  permission: "users" | "certificates" | "reports" | "system_settings" | "analytics";
  action?: "read" | "write" | "delete" | "manage";
  children: ReactNode;
  fallback?: ReactNode;
}

export const PermissionGuard: FC<PermissionGuardProps> = ({
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
