/**
 * Admin Module Access Management Page v2
 * Full module access control: Users, Modules, Requests, Pricing Plans
 */
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromUntyped } from "@/integrations/supabase/untyped-client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Shield, Users, Package, Search, Check, X, Clock, DollarSign, Star, Plus, Edit, Sparkles } from "lucide-react";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";

interface SystemModule {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  category: string;
  is_core: boolean;
  is_active: boolean;
  price_addon_brl: number;
  price_addon_usd: number;
  sort_order: number;
}

interface UserWithAccess {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  modules: string[];
}

interface AccessRequest {
  id: string;
  user_id: string;
  module_id: string;
  status: string;
  reason: string | null;
  created_at: string;
}

interface PricingPlan {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price_brl: number;
  price_usd: number;
  billing_interval: string;
  module_ids: string[];
  features: string[];
  is_active: boolean;
  is_popular: boolean;
  max_users: number | null;
  sort_order: number;
}

export default function AdminModuleAccessPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null);

  // Fetch all modules
  const { data: modules = [] } = useQuery({
    queryKey: ["admin-system-modules"],
    queryFn: async () => {
      const { data, error } = await fromUntyped("system_modules")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data as SystemModule[];
    },
  });

  // Fetch all users with their roles
  const { data: users = [] } = useQuery({
    queryKey: ["admin-users-with-access"],
    queryFn: async () => {
      const { data: profiles, error: pErr } = await supabase
        .from("profiles")
        .select("id, email, full_name");
      if (pErr) throw pErr;

      const { data: roles, error: rErr } = await supabase
        .from("user_roles")
        .select("user_id, role");
      if (rErr) throw rErr;

      const { data: access, error: aErr } = await fromUntyped("user_module_access")
        .select("user_id, module_id")
        .eq("is_active", true);
      if (aErr) throw aErr;

      const roleMap = new Map(roles?.map((r: any) => [r.user_id, r.role]) || []);
      const accessMap = new Map<string, string[]>();
      (access || []).forEach((a: any) => {
        const existing = accessMap.get(a.user_id) || [];
        existing.push(a.module_id);
        accessMap.set(a.user_id, existing);
      });

      return (profiles || []).map((p: any) => ({
        id: p.id,
        email: p.email,
        full_name: p.full_name,
        role: (roleMap.get(p.id) as string) || "employee",
        modules: accessMap.get(p.id) || [],
      })) as UserWithAccess[];
    },
  });

  // Fetch pending requests
  const { data: pendingRequests = [] } = useQuery({
    queryKey: ["admin-module-requests"],
    queryFn: async () => {
      const { data, error } = await fromUntyped("module_access_requests")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as AccessRequest[];
    },
  });

  // Fetch pricing plans
  const { data: plans = [] } = useQuery({
    queryKey: ["admin-pricing-plans"],
    queryFn: async () => {
      const { data, error } = await fromUntyped("module_pricing_plans")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data as PricingPlan[];
    },
  });

  // Toggle module access for a user
  const toggleAccess = useMutation({
    mutationFn: async ({ userId, moduleId, grant }: { userId: string; moduleId: string; grant: boolean }) => {
      if (grant) {
        const { error } = await fromUntyped("user_module_access").upsert({
          user_id: userId,
          module_id: moduleId,
          granted_by: user?.id,
          is_active: true,
          granted_at: new Date().toISOString(),
        }, { onConflict: "user_id,module_id" });
        if (error) throw error;
      } else {
        const { error } = await fromUntyped("user_module_access")
          .update({ is_active: false })
          .eq("user_id", userId)
          .eq("module_id", moduleId);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users-with-access"] });
      toast.success("Acesso atualizado");
    },
    onError: (e: any) => toast.error("Erro: " + e.message),
  });

  // Grant all modules from a plan to a user
  const grantPlan = useMutation({
    mutationFn: async ({ userId, plan }: { userId: string; plan: PricingPlan }) => {
      for (const moduleId of plan.module_ids) {
        await fromUntyped("user_module_access").upsert({
          user_id: userId,
          module_id: moduleId,
          granted_by: user?.id,
          is_active: true,
          granted_at: new Date().toISOString(),
        }, { onConflict: "user_id,module_id" });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users-with-access"] });
      toast.success("Plano aplicado ao usuário");
    },
    onError: (e: any) => toast.error("Erro: " + e.message),
  });

  // Approve/reject request
  const reviewRequest = useMutation({
    mutationFn: async ({ requestId, approved, moduleId, requestUserId }: { requestId: string; approved: boolean; moduleId: string; requestUserId: string }) => {
      const { error } = await fromUntyped("module_access_requests")
        .update({
          status: approved ? "approved" : "rejected",
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", requestId);
      if (error) throw error;

      if (approved) {
        const { error: accessErr } = await fromUntyped("user_module_access").upsert({
          user_id: requestUserId,
          module_id: moduleId,
          granted_by: user?.id,
          is_active: true,
          granted_at: new Date().toISOString(),
        }, { onConflict: "user_id,module_id" });
        if (accessErr) throw accessErr;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-module-requests"] });
      queryClient.invalidateQueries({ queryKey: ["admin-users-with-access"] });
      toast.success("Solicitação processada");
    },
    onError: (e: any) => toast.error("Erro: " + e.message),
  });

  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.full_name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedUser = users.find((u) => u.id === selectedUserId);
  const coreModules = modules.filter((m) => m.is_core);
  const addonModules = modules.filter((m) => !m.is_core);

  const getCategoryColor = (cat: string) => {
    const colors: Record<string, string> = {
      core: "bg-primary/10 text-primary",
      crewing: "bg-primary/20 text-primary",
      maintenance: "bg-accent/50 text-accent-foreground",
      operations: "bg-accent text-accent-foreground",
      qhse: "bg-destructive/10 text-destructive",
      finance: "bg-secondary text-secondary-foreground",
      intelligence: "bg-primary/15 text-primary",
      communications: "bg-muted text-foreground",
    };
    return colors[cat] || "bg-muted text-muted-foreground";
  };

  const getCategoryLabel = (cat: string) => {
    const labels: Record<string, string> = {
      core: "Core",
      crewing: "Tripulação",
      maintenance: "Manutenção",
      operations: "Operações",
      qhse: "QHSE",
      finance: "Financeiro",
      intelligence: "Inteligência",
      communications: "Comunicações",
    };
    return labels[cat] || cat;
  };

  return (
    <ModulePageWrapper gradient="purple">
      <ModuleHeader
        icon={Shield}
        title="Controle de Acesso Modular"
        description="Gerencie módulos, permissões de usuários, solicitações e planos de preços"
        gradient="purple"
        badges={[
          { icon: Users, label: `${users.length} Usuários` },
          { icon: Package, label: `${modules.length} Módulos` },
          { icon: Clock, label: `${pendingRequests.length} Pendentes` },
        ]}
      />

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="users" className="gap-1.5">
            <Users className="h-4 w-4" /> Usuários
          </TabsTrigger>
          <TabsTrigger value="modules" className="gap-1.5">
            <Package className="h-4 w-4" /> Módulos
          </TabsTrigger>
          <TabsTrigger value="requests" className="gap-1.5 relative">
            <Clock className="h-4 w-4" /> Solicitações
            {pendingRequests.length > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 min-w-5 p-0 flex items-center justify-center text-xs">
                {pendingRequests.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="plans" className="gap-1.5">
            <DollarSign className="h-4 w-4" /> Planos
          </TabsTrigger>
        </TabsList>

        {/* ====== USERS TAB ====== */}
        <TabsContent value="users" className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="space-y-2 max-h-[70vh] overflow-y-auto">
              {filteredUsers.map((u) => (
                <Card
                  key={u.id}
                  className={`cursor-pointer transition-colors hover:bg-accent/50 ${selectedUserId === u.id ? "border-primary bg-accent/30" : ""}`}
                  onClick={() => setSelectedUserId(u.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="font-medium truncate">{u.full_name || u.email.split("@")[0]}</p>
                        <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant={u.role === "admin" ? "default" : "secondary"} className="text-xs">
                          {u.role}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {u.role === "admin" ? "Todos" : `${u.modules.length} módulos`}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="lg:col-span-2">
              {selectedUser ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{selectedUser.full_name || selectedUser.email}</span>
                      <Badge variant={selectedUser.role === "admin" ? "default" : "outline"}>
                        {selectedUser.role}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      {selectedUser.role === "admin"
                        ? "Administradores têm acesso total a todos os módulos"
                        : "Ative/desative módulos ou aplique um plano"}
                    </CardDescription>
                    {selectedUser.role !== "admin" && plans.length > 0 && (
                      <div className="flex gap-2 flex-wrap pt-2">
                        {plans.filter(p => p.is_active).map(plan => (
                          <Button
                            key={plan.id}
                            size="sm"
                            variant="outline"
                            className="gap-1.5"
                            onClick={() => grantPlan.mutate({ userId: selectedUser.id, plan })}
                          >
                            <Sparkles className="h-3.5 w-3.5" />
                            Aplicar {plan.name}
                          </Button>
                        ))}
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground mb-2">Módulos Core (sempre ativos)</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {coreModules.map((m) => (
                          <div key={m.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                            <div className="flex items-center gap-2">
                               <Badge className={getCategoryColor(m.category)} variant="secondary">{getCategoryLabel(m.category)}</Badge>
                              <span className="text-sm font-medium">{m.name}</span>
                            </div>
                            <Check className="h-4 w-4 text-primary" />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground mb-2">Módulos Adicionais</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {addonModules.map((m) => {
                          const hasAccess = selectedUser.role === "admin" || selectedUser.modules.includes(m.id);
                          return (
                            <div key={m.id} className="flex items-center justify-between p-2 rounded-lg border">
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <Badge className={getCategoryColor(m.category)} variant="secondary">{getCategoryLabel(m.category)}</Badge>
                                  <span className="text-sm font-medium">{m.name}</span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-0.5 truncate">{m.description}</p>
                              </div>
                              <Switch
                                checked={hasAccess}
                                disabled={selectedUser.role === "admin"}
                                onCheckedChange={(checked) =>
                                  toggleAccess.mutate({
                                    userId: selectedUser.id,
                                    moduleId: m.id,
                                    grant: checked,
                                  })
                                }
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="flex items-center justify-center min-h-[300px]">
                  <CardContent className="text-center text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>Selecione um usuário para gerenciar seus módulos</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* ====== MODULES TAB ====== */}
        <TabsContent value="modules" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {modules.map((m) => {
              const usersWithAccess = users.filter(
                (u) => u.role === "admin" || m.is_core || u.modules.includes(m.id)
              ).length;
              return (
                <Card key={m.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{m.name}</CardTitle>
                       <Badge className={getCategoryColor(m.category)} variant="secondary">
                        {getCategoryLabel(m.category)}
                       </Badge>
                    </div>
                    <CardDescription>{m.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Users className="h-3.5 w-3.5" />
                        <span>{usersWithAccess} usuários</span>
                      </div>
                      {m.is_core ? (
                        <Badge variant="outline" className="text-xs">Core</Badge>
                      ) : (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <DollarSign className="h-3.5 w-3.5" />
                          <span>R$ {m.price_addon_brl}/navio/mês</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* ====== REQUESTS TAB ====== */}
        <TabsContent value="requests" className="space-y-4">
          {pendingRequests.length === 0 ? (
            <Card className="p-8 text-center">
              <Check className="h-12 w-12 mx-auto mb-3 text-primary opacity-50" />
              <p className="text-muted-foreground">Nenhuma solicitação pendente</p>
            </Card>
          ) : (
            pendingRequests.map((req) => {
              const reqUser = users.find((u) => u.id === req.user_id);
              const reqModule = modules.find((m) => m.id === req.module_id);
              return (
                <Card key={req.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{reqUser?.full_name || reqUser?.email || req.user_id}</p>
                      <p className="text-sm text-muted-foreground">
                        Solicita acesso ao módulo <strong>{reqModule?.name || req.module_id}</strong>
                      </p>
                      {req.reason && <p className="text-xs text-muted-foreground mt-1 italic">"{req.reason}"</p>}
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(req.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive border-destructive/20"
                        onClick={() => reviewRequest.mutate({ requestId: req.id, approved: false, moduleId: req.module_id, requestUserId: req.user_id })}
                      >
                        <X className="h-4 w-4 mr-1" /> Rejeitar
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => reviewRequest.mutate({ requestId: req.id, approved: true, moduleId: req.module_id, requestUserId: req.user_id })}
                      >
                        <Check className="h-4 w-4 mr-1" /> Aprovar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        {/* ====== PLANS TAB ====== */}
        <TabsContent value="plans" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const planModules = modules.filter(m => plan.module_ids.includes(m.id));
              return (
                <Card key={plan.id} className={`relative ${plan.is_popular ? 'border-primary shadow-lg' : ''}`}>
                  {plan.is_popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground gap-1">
                        <Star className="h-3 w-3" /> Mais Popular
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="text-center">
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="pt-2">
                      <span className="text-3xl font-bold">R$ {plan.price_brl}</span>
                      <span className="text-muted-foreground">/navio/mês</span>
                      <p className="text-xs text-muted-foreground mt-1">US$ {plan.price_usd}/vessel/mo</p>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-1.5">
                      {plan.features.map((f, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-primary shrink-0" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground mb-1">{planModules.length} módulos inclusos</p>
                      <div className="flex flex-wrap gap-1">
                        {planModules.slice(0, 6).map(m => (
                          <Badge key={m.id} variant="secondary" className="text-xs">{m.name}</Badge>
                        ))}
                        {planModules.length > 6 && (
                          <Badge variant="outline" className="text-xs">+{planModules.length - 6}</Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </ModulePageWrapper>
  );
}
