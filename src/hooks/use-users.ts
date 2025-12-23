import * as React from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type UserRole = Database["public"]["Enums"]["user_role"];
type UserRoleRow = Database["public"]["Tables"]["user_roles"]["Row"];

export interface UserWithRole extends Profile {
  role: UserRole;
}

export type { UserRole };

export const useUsers = () => {
  const [users, setUsers] = React.useState<UserWithRole[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const isMountedRef = React.useRef(true);

  const fetchUsers = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [profilesResult, rolesResult] = await Promise.all([
        supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("user_roles")
          .select("user_id, role"),
      ]);

      if (profilesResult.error || rolesResult.error) {
        throw profilesResult.error || rolesResult.error;
      }

      const roleMap = new Map<string, UserRole>(
        (rolesResult.data as UserRoleRow[] | null)?.map((roleRow) => [
          roleRow.user_id,
          roleRow.role ?? "employee",
        ]) ?? []
      );

      const usersWithRoles = (profilesResult.data as Profile[] | null)?.map((profile) => ({
        ...profile,
        role: roleMap.get(profile.id) ?? "employee",
      })) ?? [];

      if (!isMountedRef.current) return;
      setUsers(usersWithRoles);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      console.error("Error fetching users:", errorMessage);
      if (isMountedRef.current) {
        setError("Erro ao carregar usuários");
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  const updateUserRole = React.useCallback(async (userId: string, newRole: UserRole) => {
    try {
      const { error } = await supabase
        .from("user_roles")
        .upsert(
          {
            user_id: userId,
            role: newRole,
          },
          { onConflict: "user_id" }
        );

      if (error) throw error;

      // Atualizar estado local
      setUsers((prev: UserWithRole[]) => 
        prev.map((user: UserWithRole) => 
          user.id === userId 
            ? { ...user, role: newRole }
            : user
        )
      );

      return { success: true };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      console.error("Error updating user role:", errorMessage);
      return { success: false, error: "Erro ao atualizar role do usuário" };
    }
  }, []);

  const updateUserProfile = React.useCallback(async (userId: string, profileData: Partial<UserWithRole>) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profileData.full_name,
          department: profileData.department,
          position: profileData.position,
          phone: profileData.phone,
          status: profileData.status,
          employee_id: profileData.employee_id,
          hire_date: profileData.hire_date,
          manager_id: profileData.manager_id
        })
        .eq("id", userId);

      if (error) throw error;

      // Atualizar role se fornecido
      if (profileData.role) {
        await updateUserRole(userId, profileData.role);
      }

      // Atualizar estado local
      setUsers((prev: UserWithRole[]) => 
        prev.map((user: UserWithRole) => 
          user.id === userId 
            ? { ...user, ...profileData }
            : user
        )
      );

      return { success: true };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      console.error("Error updating user profile:", errorMessage);
      return { success: false, error: "Erro ao atualizar perfil do usuário" };
    }
  }, [updateUserRole]);

  const getRoleStats = React.useCallback(() => {
    const stats = users.reduce((acc: Record<UserRole, number>, user: UserWithRole) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<UserRole, number>);

    return {
      total: users.length,
      active: users.filter((u: UserWithRole) => u.status === "active").length,
      inactive: users.filter((u: UserWithRole) => u.status === "inactive").length,
      byRole: stats
    };
  }, [users]);

  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  React.useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    users,
    isLoading,
    error,
    fetchUsers,
    updateUserRole,
    updateUserProfile,
    getRoleStats
  };
};