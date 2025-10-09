import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Building2,
  Users,
  TrendingUp,
  DollarSign,
  Plus,
  Eye,
  Settings,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Ban
} from "lucide-react";

interface Organization {
  id: string;
  name: string;
  slug: string;
  status: string;
  plan_type: string;
  max_users: number;
  max_vessels: number;
  max_storage_gb: number;
  trial_ends_at?: string;
  subscription_ends_at?: string;
  created_at: string;
  user_count?: number;
  vessel_count?: number;
  branding?: {
    company_name: string;
    primary_color: string;
    theme_mode: string;
  };
}

export const SuperAdminDashboard: React.FC = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { toast } = useToast();

  // Formulário para nova organização
  const [newOrgForm, setNewOrgForm] = useState({
    name: "",
    slug: "",
    plan_type: "free",
    max_users: 5,
    max_vessels: 2,
    max_storage_gb: 1,
    billing_email: ""
  });

  const loadOrganizations = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const { data: orgs, error } = await supabase
        .from("organizations")
        .select(`
          *,
          organization_branding(company_name, primary_color, theme_mode),
          organization_users(id, status),
          vessels(id)
        `);

      if (error) throw error;

      // Processar dados das organizações
      const processedOrgs = orgs?.map(org => ({
        ...org,
        user_count: org.organization_users?.filter((u: { status: string }) => u.status === "active").length || 0,
        vessel_count: org.vessels?.length || 0,
        branding: org.organization_branding?.[0] || null
      })) || [];

      setOrganizations(processedOrgs);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar organizações",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadOrganizations();
  }, [loadOrganizations]);

  const createOrganization = async () => {
    try {
      // Validar slug único
      const { data: existingOrg } = await supabase
        .from("organizations")
        .select("id")
        .eq("slug", newOrgForm.slug)
        .single();

      if (existingOrg) {
        toast({
          title: "Erro",
          description: "Slug já está em uso",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from("organizations")
        .insert([newOrgForm])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Organização criada com sucesso",
      });

      setShowCreateModal(false);
      setNewOrgForm({
        name: "",
        slug: "",
        plan_type: "free",
        max_users: 5,
        max_vessels: 2,
        max_storage_gb: 1,
        billing_email: ""
      });
      
      loadOrganizations();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar organização",
        variant: "destructive",
      });
    }
  };

  const updateOrganizationStatus = async (orgId: string, status: string) => {
    try {
      const { error } = await supabase
        .from("organizations")
        .update({ status })
        .eq("id", orgId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Status da organização atualizado para ${status}`,
      });

      loadOrganizations();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar status da organização",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
    case "active": return <CheckCircle className="w-4 h-4 text-green-500" />;
    case "trial": return <Clock className="w-4 h-4 text-blue-500" />;
    case "suspended": return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    case "expired": return <Ban className="w-4 h-4 text-red-500" />;
    default: return <Activity className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
    case "free": return "secondary";
    case "professional": return "default";
    case "enterprise": return "destructive";
    default: return "secondary";
    }
  };

  // Estatísticas gerais
  const totalOrgs = organizations.length;
  const activeOrgs = organizations.filter(org => org.status === "active").length;
  const totalUsers = organizations.reduce((sum, org) => sum + (org.user_count || 0), 0);
  const totalVessels = organizations.reduce((sum, org) => sum + (org.vessel_count || 0), 0);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
          <p className="text-muted-foreground">Gerencie todas as organizações da plataforma Nautilus One SaaS</p>
        </div>
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nova Organização
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Criar Nova Organização</DialogTitle>
              <DialogDescription>
                Configure uma nova organização cliente na plataforma
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Nome da Empresa</Label>
                <Input
                  value={newOrgForm.name}
                  onChange={(e) => setNewOrgForm({...newOrgForm, name: e.target.value})}
                  placeholder="Ex: Blue Shipping"
                />
              </div>
              <div>
                <Label>Slug (Subdomínio)</Label>
                <Input
                  value={newOrgForm.slug}
                  onChange={(e) => setNewOrgForm({...newOrgForm, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-")})}
                  placeholder="Ex: blue-shipping"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Será usado em: {newOrgForm.slug}.nautilus.app
                </p>
              </div>
              <div>
                <Label>Plano</Label>
                <Select value={newOrgForm.plan_type} onValueChange={(value) => setNewOrgForm({...newOrgForm, plan_type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Grátis (5 usuários, 2 embarcações)</SelectItem>
                    <SelectItem value="professional">Profissional (50 usuários, 10 embarcações)</SelectItem>
                    <SelectItem value="enterprise">Enterprise (Ilimitado)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Email de Cobrança</Label>
                <Input
                  type="email"
                  value={newOrgForm.billing_email}
                  onChange={(e) => setNewOrgForm({...newOrgForm, billing_email: e.target.value})}
                  placeholder="financeiro@empresa.com"
                />
              </div>
              <Button onClick={createOrganization} className="w-full">
                Criar Organização
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Organizações</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrgs}</div>
            <p className="text-xs text-muted-foreground">
              {activeOrgs} ativas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Totais</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Across all organizations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Embarcações Gerenciadas</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVessels}</div>
            <p className="text-xs text-muted-foreground">
              Fleet management
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Estimada</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {(organizations.filter(org => org.plan_type === "professional").length * 299 + organizations.filter(org => org.plan_type === "enterprise").length * 899).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Mensal estimada
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Organizações */}
      <Card>
        <CardHeader>
          <CardTitle>Organizações Clientes</CardTitle>
          <CardDescription>
            Gerencie todas as organizações da plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {organizations.map((org) => (
              <div key={org.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center text-azure-50 font-bold" 
                    style={{ backgroundColor: org.branding?.primary_color || "#1e40af" }}>
                    {org.branding?.company_name?.charAt(0) || org.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{org.branding?.company_name || org.name}</h3>
                      {getStatusIcon(org.status)}
                      <Badge variant={getPlanBadgeColor(org.plan_type)}>
                        {org.plan_type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {org.slug}.nautilus.app • {org.user_count} usuários • {org.vessel_count} embarcações
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Criado em {new Date(org.created_at).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {org.status === "active" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateOrganizationStatus(org.id, "suspended")}
                    >
                      <Ban className="w-4 h-4 mr-1" />
                      Suspender
                    </Button>
                  )}
                  {org.status === "suspended" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateOrganizationStatus(org.id, "active")}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Ativar
                    </Button>
                  )}
                  <Button size="sm" variant="outline">
                    <Eye className="w-4 h-4 mr-1" />
                    Visualizar
                  </Button>
                  <Button size="sm" variant="outline">
                    <Settings className="w-4 h-4 mr-1" />
                    Configurar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};