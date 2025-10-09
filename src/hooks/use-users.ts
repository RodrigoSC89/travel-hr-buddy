import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "./use-permissions";

interface UserWithRole {
  id: string;
  email: string;
  full_name: string | null;
  department: string | null;
  position: string | null;
  phone: string | null;
  status: string;
  employee_id: string | null;
  hire_date: string | null;
  manager_id: string | null;
  created_at: string;
  role: UserRole;
}

export const useUsers = () => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Buscar todos os profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select(
          `
          id,
          email,
          full_name,
          department,
          position,
          phone,
          status,
          employee_id,
          hire_date,
          manager_id,
          created_at
        `
        )
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Buscar roles para cada usuário
      const usersWithRoles = await Promise.all(
        (profiles || []).map(async profile => {
          const { data: roleData } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", profile.id)
            .maybeSingle();

          return {
            ...profile,
            role: (roleData?.role || "employee") as UserRole,
          };
        })
      );

      setUsers(usersWithRoles);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Erro ao carregar usuários");
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    try {
      const { error } = await supabase
        .from("user_roles")
        .update({ role: newRole })
        .eq("user_id", userId);

      if (error) throw error;

      // Atualizar estado local
      setUsers(prev => prev.map(user => (user.id === userId ? { ...user, role: newRole } : user)));

      return { success: true };
    } catch (err) {
      console.error("Error updating user role:", err);
      return { success: false, error: "Erro ao atualizar role do usuário" };
    }
  };

  const updateUserProfile = async (userId: string, profileData: Partial<UserWithRole>) => {
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
          manager_id: profileData.manager_id,
        })
        .eq("id", userId);

      if (error) throw error;

      // Atualizar role se fornecido
      if (profileData.role) {
        await updateUserRole(userId, profileData.role);
      }

      // Atualizar estado local
      setUsers(prev => prev.map(user => (user.id === userId ? { ...user, ...profileData } : user)));

      return { success: true };
    } catch (err) {
      console.error("Error updating user profile:", err);
      return { success: false, error: "Erro ao atualizar perfil do usuário" };
    }
  };

  const getRoleStats = () => {
    const stats = users.reduce(
      (acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      },
      {} as Record<UserRole, number>
    );

    return {
      total: users.length,
      active: users.filter(u => u.status === "active").length,
      inactive: users.filter(u => u.status === "inactive").length,
      byRole: stats,
    };
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    isLoading,
    error,
    fetchUsers,
    updateUserRole,
    updateUserProfile,
    getRoleStats,
  };
};
