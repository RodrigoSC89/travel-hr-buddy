/**
 * PATCH 653 - AI Dashboard Page
 * Central dashboard for AI monitoring, suggestions, and adoption metrics
 */

import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AIAdoptionScorecard } from "@/components/ai/AIAdoptionScorecard";
import { WorkflowAISuggestions } from "@/components/ai/WorkflowAISuggestions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSystemHealth } from "@/hooks/ai/useSystemHealth";
import { useWatchdogAlerts } from "@/hooks/ai/useWatchdogAlerts";
import { 
  Brain, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp,
  RefreshCw,
  Bell
} from "lucide-react";

export default function AIDashboard() {
  const { healthStatus, overallStatus, getLatestHealth, isLoading: healthLoading } = useSystemHealth();
  const { alerts, unreadCount, getActiveAlerts, resolveAlert, isLoading: alertsLoading } = useWatchdogAlerts();

  useEffect(() => {
    getActiveAlerts();
  }, [getActiveAlerts]);

  const getHealthStatusColor = (status?: string) => {
    switch (status) {
      case "healthy":
        return "text-green-500";
      case "degraded":
        return "text-yellow-500";
      case "critical":
      case "unhealthy":
        return "text-red-500";
      default:
        return "text-muted-foreground";
    }
  };

  const getHealthStatusIcon = (status?: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "degraded":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "critical":
      case "unhealthy":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Activity className="h-5 w-5 text-muted-foreground" />;
    }
  };

  // Calculate metrics from health status
  const avgResponseTime = healthStatus.length > 0
    ? Math.round(healthStatus.reduce((sum, h) => sum + (h.response_time_ms || 0), 0) / healthStatus.length)
    : 0;

  const successRate = healthStatus.length > 0
    ? Math.round((healthStatus.filter(h => h.status === "healthy").length / healthStatus.length) * 100)
    : 100;

  const criticalAlerts = alerts.filter(a => a.severity === "critical");

  return (
    <>
      <Helmet>
        <title>Dashboard IA | Nautilus One</title>
        <meta name="description" content="Monitore a performance e adoção de IA no sistema Nautilus One" />
      </Helmet>

      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Brain className="h-8 w-8 text-primary" />
              Dashboard de IA
            </h1>
            <p className="text-muted-foreground mt-1">
              Monitore a performance, adoção e sugestões do sistema de IA
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {criticalAlerts.length > 0 && (
              <Badge variant="destructive" className="animate-pulse">
                <Bell className="h-3 w-3 mr-1" />
                {criticalAlerts.length} alertas críticos
              </Badge>
            )}
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                getLatestHealth();
                getActiveAlerts();
              }}
              disabled={healthLoading || alertsLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${(healthLoading || alertsLoading) ? "animate-spin" : ""}`} />
              Atualizar
            </Button>
          </div>
        </div>

        {/* System Health Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Status do Sistema</p>
                  <p className={`text-2xl font-bold capitalize ${getHealthStatusColor(overallStatus)}`}>
                    {overallStatus || "Verificando..."}
                  </p>
                </div>
                {getHealthStatusIcon(overallStatus)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tempo Médio de Resposta</p>
                  <p className="text-2xl font-bold">
                    {avgResponseTime}ms
                  </p>
                </div>
                <Activity className="h-5 w-5 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Taxa de Sucesso</p>
                  <p className="text-2xl font-bold text-green-500">
                    {successRate}%
                  </p>
                </div>
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Alertas Ativos</p>
                  <p className="text-2xl font-bold">
                    {unreadCount}
                  </p>
                </div>
                <Brain className="h-5 w-5 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="adoption" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="adoption">Adoção</TabsTrigger>
            <TabsTrigger value="suggestions">Sugestões</TabsTrigger>
            <TabsTrigger value="alerts">
              Alertas
              {unreadCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="adoption" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AIAdoptionScorecard />
              
              <Card>
                <CardHeader>
                  <CardTitle>Saúde por Serviço</CardTitle>
                  <CardDescription>Status de cada serviço do sistema</CardDescription>
                </CardHeader>
                <CardContent>
                  {healthStatus.length > 0 ? (
                    <div className="space-y-3">
                      {healthStatus.slice(0, 5).map((service, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                          <div className="flex items-center gap-3">
                            {getHealthStatusIcon(service.status)}
                            <span className="font-medium">{service.service_name}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{service.response_time_ms || 0}ms</span>
                            <Badge 
                              variant={service.status === "critical" ? "destructive" : service.status === "degraded" ? "outline" : "default"}
                            >
                              {service.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      Nenhum dado de serviço disponível
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="suggestions">
            <WorkflowAISuggestions limit={20} />
          </TabsContent>

          <TabsContent value="alerts">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Alertas do Sistema
                </CardTitle>
                <CardDescription>
                  Monitoramento de anomalias e alertas de performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                {alerts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-green-500" />
                    <p>Nenhum alerta no momento</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {alerts.map((alert) => (
                      <div 
                        key={alert.id}
                        className={`flex items-start justify-between p-4 rounded-lg border ${
                          alert.resolved_at ? "opacity-50 bg-muted/30" : "bg-card"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <AlertTriangle className={`h-5 w-5 mt-0.5 ${
                            alert.severity === "critical" ? "text-red-500" :
                            alert.severity === "high" ? "text-orange-500" :
                            alert.severity === "medium" ? "text-yellow-500" :
                            "text-blue-500"
                          }`} />
                          <div>
                            <div className="flex items-center gap-2">
                              <Badge variant={
                                alert.severity === "critical" ? "destructive" :
                                alert.severity === "high" ? "outline" :
                                "secondary"
                              }>
                                {alert.severity}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {alert.component_name}
                              </span>
                            </div>
                            <p className="mt-1">{alert.anomaly_detected}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(alert.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        {!alert.resolved_at && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => resolveAlert(alert.id, "Resolvido manualmente")}
                          >
                            Resolver
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
