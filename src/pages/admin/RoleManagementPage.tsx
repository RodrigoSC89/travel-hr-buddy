/**
 * Role Management Page - Admin panel for managing user roles
 * Only accessible by admin users
 */
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Shield, Users, Search, UserCog, Crown, Anchor, Briefcase } from "lucide-react";
import { motion } from "framer-motion";
import type { UserRole } from "@/hooks/use-users";

const ROLES: { value: UserRole; label: string; icon: typeof Shield; color: string }[] = [
  { value: "admin", label: "Administrador", icon: Crown, color: "bg-destructive/10 text-destructive" },
  { value: "hr_manager", label: "Gerente de RH", icon: Briefcase, color: "bg-primary/10 text-primary" },
  { value: "hr_analyst", label: "Analista de RH", icon: Users, color: "bg-info/10 text-info" },
  { value: "manager", label: "Gerente", icon: UserCog, color: "bg-accent/10 text-accent-foreground" },
  { value: "supervisor", label: "Supervisor", icon: Shield, color: "bg-warning/10 text-warning" },
  { value: "captain", label: "Capitão", icon: Anchor, color: "bg-success/10 text-success" },
  { value: "officer", label: "Oficial", icon: Shield, color: "bg-muted text-muted-foreground" },
  { value: "crew_member", label: "Tripulante", icon: Users, color: "bg-muted text-muted-foreground" },
  { value: "employee", label: "Funcionário", icon: Users, color: "bg-muted text-muted-foreground" },
  { value: "finance", label: "Financeiro", icon: Briefcase, color: "bg-success/10 text-success" },
  { value: "auditor", label: "Auditor", icon: Shield, color: "bg-accent/10 text-accent-foreground" },
];

interface UserWithRole {
  user_id: string;
  role: UserRole;
  email?: string;
  full_name?: string;
}

export default function RoleManagementPage() {
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const { data: usersWithRoles = [], isLoading } = useQuery({
    queryKey: ["admin-user-roles"],
    queryFn: async () => {
      const { data: roles, error } = await supabase
        .from("user_roles")
        .select("user_id, role")
        .order("role");

      if (error) throw error;

      // Fetch profiles for display names
      const userIds = (roles ?? []).map(r => r.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, email, full_name")
        .in("id", userIds);

      const profileMap = new Map((profiles ?? []).map(p => [p.id, p]));

      return (roles ?? []).map(r => ({
        user_id: r.user_id,
        role: r.role as UserRole,
        email: profileMap.get(r.user_id)?.email ?? r.user_id.slice(0, 8),
        full_name: profileMap.get(r.user_id)?.full_name ?? "",
      })) as UserWithRole[];
    },
  });

  const updateRole = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: UserRole }) => {
      const { error } = await supabase
        .from("user_roles")
        .update({ role: newRole })
        .eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-user-roles"] });
      toast.success("Role atualizado com sucesso");
    },
    onError: () => toast.error("Erro ao atualizar role"),
  });

  const filtered = usersWithRoles.filter(u =>
    (u.email?.toLowerCase().includes(search.toLowerCase()) ||
     u.full_name?.toLowerCase().includes(search.toLowerCase()))
  );

  const roleCounts = usersWithRoles.reduce<Record<string, number>>((acc, u) => {
    acc[u.role] = (acc[u.role] || 0) + 1;
    return acc;
  }, {});

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 py-4"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary" />
            Gestão de Roles & Permissões
          </h1>
          <p className="text-muted-foreground mt-1">
            Atribua e gerencie roles de acesso dos usuários do sistema
          </p>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          {usersWithRoles.length} usuários
        </Badge>
      </div>

      {/* Role summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {ROLES.slice(0, 6).map(r => (
          <Card key={r.value} className="border-0 shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg ${r.color}`}>
                <r.icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-2xl font-bold">{roleCounts[r.value] || 0}</p>
                <p className="text-xs text-muted-foreground">{r.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search & Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="w-5 h-5" />
            Usuários e Roles
          </CardTitle>
          <CardDescription>
            Altere o role de cada usuário para controlar o acesso aos módulos
          </CardDescription>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Nenhum usuário encontrado</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map(user => {
                const roleConfig = ROLES.find(r => r.value === user.role) || ROLES[ROLES.length - 1];
                return (
                  <div
                    key={user.user_id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`p-2 rounded-full ${roleConfig.color}`}>
                        <roleConfig.icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate">
                          {user.full_name || user.email}
                        </p>
                        {user.full_name && (
                          <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                        )}
                      </div>
                    </div>
                    <Select
                      value={user.role}
                      onValueChange={(val) =>
                        updateRole.mutate({ userId: user.user_id, newRole: val as UserRole })
                      }
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLES.map(r => (
                          <SelectItem key={r.value} value={r.value}>
                            <span className="flex items-center gap-2">
                              <r.icon className="w-3 h-3" />
                              {r.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
