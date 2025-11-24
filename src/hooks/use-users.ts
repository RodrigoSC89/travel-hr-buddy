import { useState, useEffect, useCallback, useRef } from "react";
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
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  const fetchUsers = useCallback(async () => {
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

  const updateUserRole = useCallback(async (userId: string, newRole: UserRole) => {
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
      setUsers(prev => 
        prev.map(user => 
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

  const updateUserProfile = useCallback(async (userId: string, profileData: Partial<UserWithRole>) => {
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
      setUsers(prev => 
        prev.map(user => 
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

  const getRoleStats = useCallback(() => {
    const stats = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<UserRole, number>);

    return {
      total: users.length,
      active: users.filter(u => u.status === "active").length,
      inactive: users.filter(u => u.status === "inactive").length,
      byRole: stats
    };
  }, [users]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
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