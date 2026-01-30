import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import type { UserRole } from "./use-users";

export type { UserRole };

export type PermissionType = "read" | "write" | "delete" | "manage";
export type Permission = "users" | "certificates" | "reports" | "system_settings" | "analytics";

interface RolePermission {
  role: UserRole;
  permission_name: Permission;
  can_read: boolean;
  can_write: boolean;
  can_delete: boolean;
  can_manage: boolean;
}

export const usePermissions = () => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [permissions, setPermissions] = useState<RolePermission[]>([]);
  // PATCH v41: Start with FALSE to NEVER block UI - permissions load in background
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchUserRoleAndPermissions = async () => {
      if (!user) {
        setUserRole(null);
        setPermissions([]);
        // No need to set isLoading false - already false
        return;
      }

      try {
        // Buscar role do usuário
        const { data: roleData, error: roleError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .maybeSingle();

        if (roleError) {
          setUserRole("employee"); // default
        } else {
          setUserRole(roleData?.role || "employee");
        }

        // Buscar permissões baseadas no role
        if (roleData?.role) {
          const { data: permissionsData, error: permissionsError } = await supabase
            .from("role_permissions")
            .select("*")
            .eq("role", roleData.role);

          if (permissionsError) {
            // Error fetching permissions, will use empty array
          } else {
            setPermissions(permissionsData as RolePermission[] || []);
          }
        }
      } catch (error) {
        // Error fetching user role and permissions
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserRoleAndPermissions();
  }, [user]);

  const hasPermission = (permission: Permission, type: PermissionType = "read"): boolean => {
    if (!userRole) return false;

    // Admin tem todas as permissões
    if (userRole === "admin") return true;

    const rolePermission = permissions.find(p => p.permission_name === permission);
    if (!rolePermission) return false;

    switch (type) {
    case "read":
      return rolePermission.can_read;
    case "write":
      return rolePermission.can_write;
    case "delete":
      return rolePermission.can_delete;
    case "manage":
      return rolePermission.can_manage;
    default:
      return false;
    }
  };

  const canAccessModule = (module: string): boolean => {
    switch (module) {
    case "admin":
      return userRole === "admin";
    case "hr":
      return hasPermission("users", "read") || hasPermission("certificates", "read");
    case "reports":
      return hasPermission("reports", "read");
    case "analytics":
      return hasPermission("analytics", "read");
    case "settings":
      return hasPermission("system_settings", "read");
    default:
      return true; // Módulos básicos acessíveis a todos
    }
  };

  const getRoleDisplayName = (role: UserRole): string => {
    const roleNames: Record<UserRole, string> = {
      admin: "Administrador",
      hr_manager: "Gerente de RH",
      hr_analyst: "Analista de RH",
      department_manager: "Gerente de Departamento",
      supervisor: "Supervisor",
      coordinator: "Coordenador",
      manager: "Gerente",
      employee: "Funcionário",
      auditor: "Auditor",
      legal: "Jurídico",
      finance: "Financeiro",
      purchasing: "Compras",
      operations: "Operações",
      crew_member: "Tripulante",
      captain: "Comandante",
      officer: "Oficial"
    };
    return roleNames[role] || "Funcionário";
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    if (!userRole) return false;
    return roles.includes(userRole);
  };

  const isAdmin = (): boolean => {
    return userRole === "admin";
  };

  return {
    userRole,
    permissions,
    isLoading,
    hasPermission,
    canAccessModule,
    getRoleDisplayName,
    hasAnyRole,
    isAdmin
  };
};