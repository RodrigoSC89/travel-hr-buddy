import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useOrganization } from "@/contexts/OrganizationContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertTriangle,
  CheckCircle,
  Settings,
  Users,
  Ship,
  BarChart3,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface HealthCheck {
  id: string;
  title: string;
  description: string;
  status: "completed" | "pending" | "warning";
  action?: string;
  actionUrl?: string;
  priority: "high" | "medium" | "low";
}

export const OrganizationHealthCheck: React.FC = () => {
  const { currentOrganization, currentBranding } = useOrganization();
  const navigate = useNavigate();
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    users: 0,
    vessels: 0,
    certificates: 0,
    modules: 0,
  });

  useEffect(() => {
    if (currentOrganization) {
      loadHealthData();
    }
  }, [currentOrganization]);

  const loadHealthData = async () => {
    if (!currentOrganization) return;

    try {
      // Load organization stats
      const [usersData, vesselsData, certificatesData] = await Promise.all([
        supabase
          .from("organization_users")
          .select("id")
          .eq("organization_id", currentOrganization.id)
          .eq("status", "active"),
        supabase.from("vessels").select("id").eq("organization_id", currentOrganization.id),
        supabase.from("maritime_certificates").select("id").in("crew_member_id", []), // Will be empty for now, but structure is ready
      ]);

      const newStats = {
        users: usersData.data?.length || 0,
        vessels: vesselsData.data?.length || 0,
        certificates: certificatesData.data?.length || 0,
        modules: currentBranding?.enabled_modules
          ? Array.isArray(currentBranding.enabled_modules)
            ? currentBranding.enabled_modules.length
            : Object.keys(currentBranding.enabled_modules).length
          : 0,
      };

      setStats(newStats);

      // Generate health checks based on current state
      const checks: HealthCheck[] = [];

      // Organization setup check
      const hasEnabledModules =
        currentBranding?.enabled_modules &&
        (Array.isArray(currentBranding.enabled_modules)
          ? currentBranding.enabled_modules.length > 0
          : Object.keys(currentBranding.enabled_modules).length > 0);

      if (!currentBranding || !hasEnabledModules) {
        checks.push({
          id: "setup",
          title: "Configuração Inicial",
          description:
            "Complete a configuração inicial da sua organização para aproveitar todos os recursos.",
          status: "warning",
          action: "Configurar Agora",
          actionUrl: "/organization-setup",
          priority: "high",
        });
      } else {
        checks.push({
          id: "setup",
          title: "Configuração Inicial",
          description: "Organização configurada com sucesso.",
          status: "completed",
          priority: "low",
        });
      }

      // Users check
      if (newStats.users <= 1) {
        checks.push({
          id: "users",
          title: "Adicionar Usuários",
          description: "Convide membros da sua equipe para colaborar na plataforma.",
          status: "pending",
          action: "Gerenciar Usuários",
          actionUrl: "/users",
          priority: "medium",
        });
      } else {
        checks.push({
          id: "users",
          title: "Usuários Ativos",
          description: `${newStats.users} usuários ativos na organização.`,
          status: "completed",
          priority: "low",
        });
      }

      // Maritime module checks
      const hasFleetModule = Array.isArray(currentBranding?.enabled_modules)
        ? currentBranding?.enabled_modules.includes("fleet")
        : currentBranding?.enabled_modules?.fleet_management;

      if (hasFleetModule) {
        if (newStats.vessels === 0) {
          checks.push({
            id: "vessels",
            title: "Cadastrar Embarcações",
            description: "Adicione suas embarcações para começar o monitoramento da frota.",
            status: "pending",
            action: "Gestão de Frota",
            actionUrl: "/fleet-management",
            priority: "medium",
          });
        } else {
          checks.push({
            id: "vessels",
            title: "Frota Cadastrada",
            description: `${newStats.vessels} embarcações registradas no sistema.`,
            status: "completed",
            priority: "low",
          });
        }
      }

      // Analytics check
      const hasAnalyticsModule = Array.isArray(currentBranding?.enabled_modules)
        ? currentBranding?.enabled_modules.includes("analytics")
        : currentBranding?.enabled_modules?.analytics;

      if (hasAnalyticsModule) {
        checks.push({
          id: "analytics",
          title: "Dashboard Analytics",
          description: "Visualize métricas e relatórios detalhados da sua operação.",
          status: "completed",
          action: "Ver Analytics",
          actionUrl: "/analytics",
          priority: "low",
        });
      }

      setHealthChecks(checks);
    } catch (error) {
      console.error("Error loading health data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const completedChecks = healthChecks.filter(check => check.status === "completed").length;
  const totalChecks = healthChecks.length;
  const completionPercentage = totalChecks > 0 ? (completedChecks / totalChecks) * 100 : 0;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-50 border-green-200";
      case "warning":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      default:
        return "text-blue-600 bg-blue-50 border-blue-200";
    }
  };

  const getPriorityChecks = () => {
    return healthChecks
      .filter(check => check.status !== "completed")
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="space-y-2">
              <div className="h-3 bg-muted rounded"></div>
              <div className="h-3 bg-muted rounded w-5/6"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const priorityChecks = getPriorityChecks();

  return (
    <div className="space-y-6">
      {/* Main Health Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span>Status da Organização</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Progresso de Configuração</span>
              <span className="text-sm text-muted-foreground">
                {completedChecks}/{totalChecks} concluídos
              </span>
            </div>
            <Progress value={completionPercentage} className="w-full" />

            {completionPercentage === 100 ? (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">
                  Parabéns! Sua organização está completamente configurada e pronta para uso.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className="border-blue-200 bg-blue-50">
                <AlertTriangle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-700">
                  Complete os itens pendentes para aproveitar ao máximo a plataforma.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Users className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats.users}</p>
                <p className="text-sm text-muted-foreground">Usuários</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Ship className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{stats.vessels}</p>
                <p className="text-sm text-muted-foreground">Embarcações</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <BarChart3 className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{stats.modules}</p>
                <p className="text-sm text-muted-foreground">Módulos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{Math.round(completionPercentage)}%</p>
                <p className="text-sm text-muted-foreground">Completo</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Priority Actions */}
      {priorityChecks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Ações Recomendadas</CardTitle>
            <p className="text-sm text-muted-foreground">
              Complete estas etapas para melhorar sua experiência
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {priorityChecks.slice(0, 3).map(check => (
                <div
                  key={check.id}
                  className={`p-4 rounded-lg border transition-colors hover:shadow-sm ${getStatusColor(check.status)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {getStatusIcon(check.status)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{check.title}</h4>
                          <Badge variant={check.priority === "high" ? "destructive" : "secondary"}>
                            {check.priority === "high" ? "Importante" : "Recomendado"}
                          </Badge>
                        </div>
                        <p className="text-sm mt-1 text-foreground/80">{check.description}</p>
                      </div>
                    </div>
                    {check.action && check.actionUrl && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(check.actionUrl!)}
                        className="ml-4 shrink-0"
                      >
                        {check.action}
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
