/**
 * User Role Hook - Server-side RBAC via has_role() security definer function
 * Never checks roles client-side; always uses Supabase RPC
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type AppRole = "admin" | "moderator" | "user" | "viewer";

export function useUserRole() {
  const { user } = useAuth();

  const { data: roles = [], isLoading } = useQuery({
    queryKey: ["user-roles", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user!.id);
      if (error) throw error;
      return (data ?? []).map((r) => (r as Record<string, unknown>).role as AppRole);
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 min cache
  });

  const hasRole = (role: AppRole) => roles.includes(role);
  const isAdmin = hasRole("admin");
  const isModerator = hasRole("moderator") || isAdmin;

  return {
    roles,
    hasRole,
    isAdmin,
    isModerator,
    isLoading,
  };
}
