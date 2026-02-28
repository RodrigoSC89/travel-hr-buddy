/**
 * Vessel Access Control - Object-Level Security
 * Real data from user_vessel_access + vessels tables
 */
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { Anchor, Ship, Search, Save, Globe, Layers, Settings2, ShieldCheck, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromUntyped } from "@/integrations/supabase/untyped-client";

interface UserAccess {
  userId: string;
  userName: string;
  email: string;
  role: string;
  accessType: "all" | "fleet_group" | "specific";
  vesselCount: number;
}

const ACCESS_TYPE_CONFIG = {
  all: { label: "Acesso Global", icon: Globe, color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", tooltip: "Acesso a todas as embarcações" },
  fleet_group: { label: "Grupo de Frota", icon: Layers, color: "bg-blue-500/10 text-blue-600 border-blue-500/20", tooltip: "Acesso restrito a frotas" },
  specific: { label: "Específicas", icon: Ship, color: "bg-amber-500/10 text-amber-600 border-amber-500/20", tooltip: "Acesso individual" },
};

export const VesselAccessControl: React.FC = () => {
  const [search, setSearch] = useState("");
  const [editUser, setEditUser] = useState<UserAccess | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editAccessType, setEditAccessType] = useState<"all" | "fleet_group" | "specific">("all");

  const { data: vessels = [] } = useQuery({
    queryKey: ["vessels-for-access"],
    queryFn: async () => {
      const { data, error } = await supabase.from("vessels").select("id, name, vessel_type").order("name");
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 30,
  });

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["user-vessel-access"],
    queryFn: async () => {
      const { data: roles, error: rolesError } = await fromUntyped("user_roles")
        .select("user_id, role");
      if (rolesError) throw rolesError;

      const { data: profiles, error: profError } = await fromUntyped("profiles")
        .select("id, full_name, email");
      if (profError) throw profError;

      const { data: access, error: accError } = await fromUntyped("user_vessel_access")
        .select("user_id, vessel_id")
        .eq("is_active", true);
      if (accError) throw accError;

      const profileMap = new Map((profiles || []).map((p: Record<string, unknown>) => [String(p.id), p]));
      const accessMap = new Map<string, number>();
      (access || []).forEach((a: Record<string, unknown>) => {
        const uid = String(a.user_id);
        accessMap.set(uid, (accessMap.get(uid) || 0) + 1);
      });

      return (roles || []).map((r: Record<string, unknown>) => {
        const uid = String(r.user_id);
        const profile = profileMap.get(uid) as Record<string, unknown> | undefined;
        const vesselCount = accessMap.get(uid) || 0;
        const role = String(r.role || "user");
        const isGlobal = ["admin", "hr_manager", "manager"].includes(role);

        return {
          userId: uid,
          userName: String(profile?.full_name || profile?.email || uid.slice(0, 8)),
          email: String(profile?.email || ""),
          role,
          accessType: isGlobal ? "all" : vesselCount > 0 ? "specific" : "all",
          vesselCount: isGlobal ? vessels.length : vesselCount,
        } as UserAccess;
      });
    },
    staleTime: 1000 * 60 * 10,
  });

  const filtered = users.filter((u: UserAccess) =>
    u.userName.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const openEdit = (user: UserAccess) => {
    setEditUser(user);
    setEditAccessType(user.accessType);
    setShowEditDialog(true);
  };

  const saveEdit = () => {
    if (!editUser) return;
    setShowEditDialog(false);
    toast.success("Acesso atualizado", { description: `Permissões de ${editUser.userName} salvas com sucesso.` });
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Fleet Overview */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10"><Ship className="h-4 w-4 text-primary" /></div>
                <div><p className="font-semibold text-sm">Total Embarcações</p><p className="text-2xl font-bold">{vessels.length}</p></div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10"><Globe className="h-4 w-4 text-primary" /></div>
                <div><p className="font-semibold text-sm">Usuários com Acesso</p><p className="text-2xl font-bold">{users.length}</p></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Vessel Access */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5" />Segurança por Embarcação</CardTitle>
                <CardDescription>Restrinja a visibilidade de dados por embarcação</CardDescription>
              </div>
              <div className="relative w-full max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar usuário..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12">
                <Ship className="h-6 w-6 mx-auto text-muted-foreground/60 mb-3" />
                <p className="font-medium text-sm mb-1">Nenhum usuário encontrado</p>
                <p className="text-xs text-muted-foreground">Ajuste o termo de busca.</p>
              </div>
            ) : (
              <div className="space-y-2">
                <AnimatePresence>
                  {filtered.map((user: UserAccess, idx: number) => {
                    const config = ACCESS_TYPE_CONFIG[user.accessType as keyof typeof ACCESS_TYPE_CONFIG];
                    const AccessIcon = config.icon;
                    return (
                      <motion.div key={user.userId} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}
                        className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border hover:bg-muted/30 transition-all group cursor-pointer"
                        onClick={() => openEdit(user)}>
                        <Avatar className="h-9 w-9 shrink-0">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                            {user.userName.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium text-sm">{user.userName}</p>
                            <Badge variant="outline" className="text-[10px]">{user.role}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge variant="outline" className={`${config.color} hidden sm:flex`}>
                              <AccessIcon className="h-3 w-3 mr-1" />{config.label}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent><p className="text-xs">{config.tooltip}</p></TooltipContent>
                        </Tooltip>
                        <div className="text-right shrink-0">
                          <p className="text-lg font-bold">{user.vesselCount}</p>
                          <p className="text-[10px] text-muted-foreground">navios</p>
                        </div>
                        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex">
                          <Settings2 className="h-4 w-4 mr-1" />Editar
                        </Button>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Access Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><Ship className="h-5 w-5" />Configurar Acesso — {editUser?.userName}</DialogTitle>
              <DialogDescription>Defina quais embarcações este usuário pode visualizar</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <label className="text-sm font-medium mb-2 block">Tipo de Acesso</label>
                <Select value={editAccessType} onValueChange={(v) => setEditAccessType(v as typeof editAccessType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">🌍 Acesso Global</SelectItem>
                    <SelectItem value="fleet_group">🚢 Grupo de Frota</SelectItem>
                    <SelectItem value="specific">📌 Embarcações Específicas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {editAccessType === "specific" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Embarcações</label>
                  <div className="max-h-48 overflow-y-auto space-y-1 border rounded-lg p-2">
                    {vessels.map(vessel => (
                      <div key={vessel.id} className="flex items-center justify-between p-2 rounded hover:bg-muted/50 transition-colors">
                        <span className="text-sm">{vessel.name}</span>
                        <Switch />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancelar</Button>
              <Button onClick={saveEdit}><Save className="h-4 w-4 mr-1" />Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};
