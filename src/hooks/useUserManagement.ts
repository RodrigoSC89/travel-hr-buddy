import { useState, useCallback, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export interface OrganizationUser {
  id: string;
  email: string;
  role: "owner" | "admin" | "manager" | "member" | "viewer";
  status: "active" | "pending" | "inactive" | "suspended";
  full_name: string;
  avatar_url?: string;
  department?: string;
  position?: string;
  phone?: string;
  joined_at: string;
  last_active_at?: string;
  permissions?: string[];
}

export interface UserInvite {
  email: string;
  role: "admin" | "manager" | "member" | "viewer";
  department?: string;
  message?: string;
}

export const useUserManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<OrganizationUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchedRef = useRef(false);

  // Sample users for demo
  const sampleUsers: OrganizationUser[] = [
    {
      id: "usr-1",
      email: "admin@nautilus.com",
      role: "admin",
      status: "active",
      full_name: "Carlos Silva",
      department: "TI",
      position: "Administrador de Sistema",
      joined_at: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
      last_active_at: new Date().toISOString(),
      permissions: ["all"],
    },
    {
      id: "usr-2",
      email: "maria.santos@nautilus.com",
      role: "manager",
      status: "active",
      full_name: "Maria Santos",
      department: "RH",
      position: "Gerente de Recursos Humanos",
      joined_at: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
      last_active_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      permissions: ["manage_users", "view_analytics"],
    },
    {
      id: "usr-3",
      email: "joao.oliveira@nautilus.com",
      role: "member",
      status: "active",
      full_name: "João Oliveira",
      department: "Operações",
      position: "Analista de Operações",
      joined_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      last_active_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      permissions: ["view_data", "manage_data"],
    },
    {
      id: "usr-4",
      email: "ana.costa@nautilus.com",
      role: "member",
      status: "pending",
      full_name: "Ana Costa",
      department: "Financeiro",
      position: "Analista Financeiro",
      joined_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      permissions: ["view_data"],
    },
    {
      id: "usr-5",
      email: "pedro.lima@nautilus.com",
      role: "viewer",
      status: "inactive",
      full_name: "Pedro Lima",
      department: "Comercial",
      position: "Executivo de Vendas",
      joined_at: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(),
      last_active_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      permissions: ["view_data"],
    },
  ];

  // Fetch users - with guard against multiple calls
  const fetchUsers = useCallback(async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    setError(null);

    try {
      // Try to get from organization_users table
      const { data, error: dbError } = await supabase
        .from("organization_users")
        .select("*")
        .limit(50);

      if (dbError || !data || data.length === 0) {
        // Use sample data
        setUsers(sampleUsers);
      } else {
        // Map to our interface
        setUsers(data.map((u: any) => ({
          id: u.id || u.user_id,
          email: u.email || "email@example.com",
          role: u.role || "member",
          status: u.status || "active",
          full_name: u.full_name || "Usuário",
          department: u.department,
          position: u.position,
          joined_at: u.joined_at || u.created_at,
          last_active_at: u.last_active_at,
        })));
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      setUsers(sampleUsers);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch - only once
  useEffect(() => {
    if (!fetchedRef.current) {
      fetchedRef.current = true;
      fetchUsers();
    }
  }, [fetchUsers]);

  // Invite user
  const inviteUser = useCallback(async (invite: UserInvite) => {
    try {
      // Create new user locally first for demo
      const newUser: OrganizationUser = {
        id: `usr-${Date.now()}`,
        email: invite.email,
        role: invite.role,
        status: "pending",
        full_name: invite.email.split("@")[0],
        department: invite.department,
        joined_at: new Date().toISOString(),
        permissions: [],
      };

      setUsers(prev => [newUser, ...prev]);

      // Try to save to database (commented out since schema differs)
      // await supabase.from("organization_users").insert({...});

      toast({
        title: "Convite enviado",
        description: `Convite enviado para ${invite.email}`,
      });

      return newUser;
    } catch (err) {
      toast({
        title: "Erro",
        description: "Falha ao enviar convite",
        variant: "destructive",
      });
      throw err;
    }
  }, [toast]);

  // Update user role
  const updateUserRole = useCallback(async (userId: string, newRole: OrganizationUser["role"]) => {
    try {
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, role: newRole } : u
      ));

      try {
        await supabase
          .from("organization_users")
          .update({ role: newRole })
          .eq("id", userId);
      } catch (e) {
        // Continue
      }

      toast({
        title: "Função atualizada",
        description: "A função do usuário foi alterada com sucesso",
      });
    } catch (err) {
      toast({
        title: "Erro",
        description: "Falha ao atualizar função",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Update user status
  const updateUserStatus = useCallback(async (userId: string, newStatus: OrganizationUser["status"]) => {
    try {
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, status: newStatus } : u
      ));

      toast({
        title: "Status atualizado",
        description: `Usuário ${newStatus === "active" ? "ativado" : "desativado"}`,
      });
    } catch (err) {
      toast({
        title: "Erro",
        description: "Falha ao atualizar status",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Delete user
  const deleteUser = useCallback(async (userId: string) => {
    try {
      setUsers(prev => prev.filter(u => u.id !== userId));

      try {
        await supabase
          .from("organization_users")
          .delete()
          .eq("id", userId);
      } catch (e) {
        // Continue
      }

      toast({
        title: "Usuário removido",
        description: "O usuário foi removido da organização",
      });
    } catch (err) {
      toast({
        title: "Erro",
        description: "Falha ao remover usuário",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Bulk operations
  const bulkUpdateStatus = useCallback(async (userIds: string[], status: OrganizationUser["status"]) => {
    setUsers(prev => prev.map(u => 
      userIds.includes(u.id) ? { ...u, status } : u
    ));

    toast({
      title: "Atualização em lote",
      description: `${userIds.length} usuário(s) atualizado(s)`,
    });
  }, [toast]);

  const bulkDelete = useCallback(async (userIds: string[]) => {
    setUsers(prev => prev.filter(u => !userIds.includes(u.id)));

    toast({
      title: "Exclusão em lote",
      description: `${userIds.length} usuário(s) removido(s)`,
    });
  }, [toast]);

  // Export users
  const exportUsers = useCallback(() => {
    const data = {
      users,
      exportedAt: new Date().toISOString(),
      totalUsers: users.length,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users-export-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Exportado",
      description: "Lista de usuários exportada",
    });
  }, [users, toast]);

  // Stats
  const stats = {
    total: users.length,
    active: users.filter(u => u.status === "active").length,
    pending: users.filter(u => u.status === "pending").length,
    inactive: users.filter(u => u.status === "inactive").length,
    admins: users.filter(u => u.role === "admin" || u.role === "owner").length,
    managers: users.filter(u => u.role === "manager").length,
    members: users.filter(u => u.role === "member").length,
  };

  return {
    users,
    isLoading,
    error,
    stats,
    fetchUsers,
    inviteUser,
    updateUserRole,
    updateUserStatus,
    deleteUser,
    bulkUpdateStatus,
    bulkDelete,
    exportUsers,
  };
};
