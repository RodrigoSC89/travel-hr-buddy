import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  TrendingUp,
  Users,
  Ship,
  Activity,
  Zap,
  CheckCircle,
  Clock,
  BarChart3,
  Settings,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface OperationalMetric {
  id: string;
  metric_name: string;
  current_value: number;
  target_value: number;
  unit: string;
  trend: "increasing" | "decreasing" | "stable";
  last_calculation: string;
}

interface OperationalAlert {
  id: string;
  alert_type: string;
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "active" | "acknowledged" | "resolved";
  created_at: string;
  affected_crew_member_id?: string;
  affected_vessel_id?: string;
}

interface DashboardStats {
  total_crew: number;
  available_crew: number;
  active_vessels: number;
  compliance_rate: number;
  pending_alerts: number;
}

export const OperationalCommandCenter: React.FC = () => {
  const [metrics, setMetrics] = useState<OperationalMetric[]>([]);
  const [alerts, setAlerts] = useState<OperationalAlert[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    total_crew: 0,
    available_crew: 0,
    active_vessels: 0,
    compliance_rate: 0,
    pending_alerts: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [realTimeEnabled, setRealTimeEnabled] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardData();
    if (realTimeEnabled) {
      setupRealTimeSubscriptions();
    }

    return () => {
      // Cleanup subscriptions
    };
  }, [realTimeEnabled]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([loadMetrics(), loadAlerts(), loadStats()]);
    } catch (error) {
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os dados do centro de comando.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadMetrics = async () => {
    const { data, error } = await supabase
      .from("operational_metrics")
      .select("*")
      .order("last_calculation", { ascending: false })
      .limit(8);

    if (error) throw error;
    setMetrics(
      (data || []).map((metric: any) => ({
        ...metric,
        trend: metric.trend as "increasing" | "decreasing" | "stable",
      }))
    );
  };

  const loadAlerts = async () => {
    const { data, error } = await supabase
      .from("operational_alerts")
      .select("*")
      .neq("status", "resolved")
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) throw error;
    setAlerts(
      (data || []).map((alert: any) => ({
        ...alert,
        severity: alert.severity as "low" | "medium" | "high" | "critical",
        status: alert.status as "active" | "acknowledged" | "resolved",
      }))
    );
  };

  const loadStats = async () => {
    // Simulated stats - in real implementation, these would come from aggregated queries
    const mockStats: DashboardStats = {
      total_crew: 156,
      available_crew: 132,
      active_vessels: 24,
      compliance_rate: 94.5,
      pending_alerts: alerts.filter(a => a.status === "active").length,
    };
    setStats(mockStats);
  };

  const setupRealTimeSubscriptions = () => {
    // Setup real-time subscriptions for alerts and metrics
    const alertsChannel = supabase
      .channel("operational-alerts")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "operational_alerts",
        },
        payload => {
          loadAlerts();
        }
      )
      .subscribe();

    const metricsChannel = supabase
      .channel("operational-metrics")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "operational_metrics",
        },
        payload => {
          loadMetrics();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(alertsChannel);
      supabase.removeChannel(metricsChannel);
    };
  };

  const acknowledgeAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from("operational_alerts")
        .update({ status: "acknowledged" })
        .eq("id", alertId);

      if (error) throw error;

      toast({
        title: "Alerta reconhecido",
        description: "O alerta foi marcado como reconhecido.",
      });

      loadAlerts();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível reconhecer o alerta.",
        variant: "destructive",
      });
    }
  };

  const resolveAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from("operational_alerts")
        .update({
          status: "resolved",
          resolved_at: new Date().toISOString(),
        })
        .eq("id", alertId);

      if (error) throw error;

      toast({
        title: "Alerta resolvido",
        description: "O alerta foi marcado como resolvido.",
      });

      loadAlerts();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível resolver o alerta.",
        variant: "destructive",
      });
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-red-600 bg-red-50 border-red-200";
      case "high":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "low":
        return "text-blue-600 bg-blue-50 border-blue-200";
      default:
        return "text-muted-foreground bg-gray-50 border-gray-200";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "increasing":
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "decreasing":
        return <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />;
      default:
        return <Activity className="h-4 w-4 text-blue-600" />;
    }
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Tripulantes</p>
                <p className="text-2xl font-bold">{stats.total_crew}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tripulantes Disponíveis</p>
                <p className="text-2xl font-bold">{stats.available_crew}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Embarcações Ativas</p>
                <p className="text-2xl font-bold">{stats.active_vessels}</p>
              </div>
              <Ship className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Conformidade</p>
                <p className="text-2xl font-bold">{stats.compliance_rate}%</p>
              </div>
              <BarChart3 className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Alertas Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alerts.slice(0, 5).map(alert => (
              <div
                key={alert.id}
                className={`p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {alert.severity.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(alert.created_at).toLocaleString()}
                      </span>
                    </div>
                    <h4 className="font-semibold">{alert.title}</h4>
                    <p className="text-sm text-muted-foreground">{alert.description}</p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    {alert.status === "active" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => acknowledgeAlert(alert.id)}
                        >
                          Reconhecer
                        </Button>
                        <Button size="sm" onClick={() => resolveAlert(alert.id)}>
                          Resolver
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {alerts.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum alerta ativo no momento.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderMetricsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map(metric => (
          <Card key={metric.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold">{metric.metric_name}</h4>
                {getTrendIcon(metric.trend)}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>
                    Atual: {metric.current_value}
                    {metric.unit}
                  </span>
                  <span>
                    Meta: {metric.target_value}
                    {metric.unit}
                  </span>
                </div>

                <Progress
                  value={
                    metric.target_value > 0 ? (metric.current_value / metric.target_value) * 100 : 0
                  }
                  className="w-full"
                />

                <p className="text-xs text-muted-foreground">
                  Última atualização: {new Date(metric.last_calculation).toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {metrics.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Nenhuma métrica disponível no momento.</p>
        </div>
      )}
    </div>
  );

  const renderControlsTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">Atualizações em Tempo Real</h4>
              <p className="text-sm text-muted-foreground">
                Ative para receber atualizações automáticas dos alertas e métricas
              </p>
            </div>
            <Button
              variant={realTimeEnabled ? "default" : "outline"}
              onClick={() => setRealTimeEnabled(!realTimeEnabled)}
            >
              {realTimeEnabled ? (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Ativo
                </>
              ) : (
                <>
                  <Clock className="h-4 w-4 mr-2" />
                  Inativo
                </>
              )}
            </Button>
          </div>

          <div className="border-t pt-4">
            <Button onClick={loadDashboardData} disabled={isLoading}>
              {isLoading ? "Atualizando..." : "Atualizar Dados"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Carregando centro de comando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Centro de Comando Operacional</h1>
        <p className="text-muted-foreground">
          Monitoramento em tempo real de operações, tripulação e alertas
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="metrics">Métricas</TabsTrigger>
          <TabsTrigger value="controls">Controles</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {renderOverviewTab()}
        </TabsContent>

        <TabsContent value="metrics" className="space-y-6">
          {renderMetricsTab()}
        </TabsContent>

        <TabsContent value="controls" className="space-y-6">
          {renderControlsTab()}
        </TabsContent>
      </Tabs>
    </div>
  );
};
