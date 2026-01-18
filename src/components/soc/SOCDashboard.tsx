import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSOCDashboard } from "@/hooks/useSOCDashboard";
import {
  AlertTriangle,
  Bell,
  CheckCircle,
  Ship,
  Users,
  DollarSign,
  FileText,
  RefreshCw,
  Eye,
  Clock,
  AlertCircle,
  Loader2,
} from "lucide-react";

const severityColors: Record<string, string> = {
  critical: "bg-red-500 text-white",
  high: "bg-orange-500 text-white",
  medium: "bg-yellow-500 text-black",
  low: "bg-blue-500 text-white",
  info: "bg-gray-500 text-white",
};

const severityIcons: Record<string, React.ReactNode> = {
  critical: <AlertTriangle className="h-4 w-4" />,
  high: <AlertCircle className="h-4 w-4" />,
  medium: <Bell className="h-4 w-4" />,
  low: <Eye className="h-4 w-4" />,
  info: <FileText className="h-4 w-4" />,
};

export function SOCDashboard() {
  const {
    isLoading,
    stats,
    alerts,
    complianceDeadlines,
    fetchDashboardStats,
    fetchActiveAlerts,
    acknowledgeAlert,
    resolveAlert,
    fetchComplianceDeadlines,
    subscribeToAlerts,
    unsubscribeFromAlerts,
  } = useSOCDashboard();

  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Initial fetch
    fetchDashboardStats();
    fetchActiveAlerts();
    fetchComplianceDeadlines();

    // Subscribe to realtime updates
    subscribeToAlerts();

    return () => {
      unsubscribeFromAlerts();
    };
  }, [fetchDashboardStats, fetchActiveAlerts, fetchComplianceDeadlines, subscribeToAlerts, unsubscribeFromAlerts]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      fetchDashboardStats(),
      fetchActiveAlerts(),
      fetchComplianceDeadlines(),
    ]);
    setIsRefreshing(false);
  };

  if (isLoading && !stats) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Centro de Operações (SOC)</h1>
          <p className="text-muted-foreground">
            Monitoramento em tempo real · Última atualização: {stats?.last_updated ? new Date(stats.last_updated).toLocaleTimeString() : "-"}
          </p>
        </div>
        <Button onClick={handleRefresh} disabled={isRefreshing} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </div>

      {/* Alert Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className={stats?.alerts.critical ? "border-red-500 bg-red-500/10" : ""}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Críticos</p>
                <p className="text-3xl font-bold text-red-500">{stats?.alerts.critical || 0}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className={stats?.alerts.high ? "border-orange-500 bg-orange-500/10" : ""}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Altos</p>
                <p className="text-3xl font-bold text-orange-500">{stats?.alerts.high || 0}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Médios</p>
                <p className="text-3xl font-bold text-yellow-500">{stats?.alerts.medium || 0}</p>
              </div>
              <Bell className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Baixos</p>
                <p className="text-3xl font-bold text-blue-500">{stats?.alerts.low || 0}</p>
              </div>
              <Eye className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Não Reconhecidos</p>
                <p className="text-3xl font-bold">{stats?.alerts.unacknowledged || 0}</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alerts Panel */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Alertas Ativos ({alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              {alerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mb-2 text-green-500" />
                  <p>Nenhum alerta ativo</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-4 rounded-lg border ${
                        alert.severity === "critical"
                          ? "border-red-500 bg-red-500/5"
                          : alert.severity === "high"
                          ? "border-orange-500 bg-orange-500/5"
                          : "border-border"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <Badge className={severityColors[alert.severity]}>
                            {severityIcons[alert.severity]}
                          </Badge>
                          <div>
                            <h4 className="font-semibold">{alert.title}</h4>
                            <p className="text-sm text-muted-foreground">{alert.message}</p>
                            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                              <span>{alert.alert_type}</span>
                              <span>·</span>
                              <span>{new Date(alert.created_at).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {!alert.is_acknowledged && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => acknowledgeAlert(alert.id)}
                            >
                              Reconhecer
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => resolveAlert(alert.id)}
                          >
                            Resolver
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Stats Panel */}
        <div className="space-y-6">
          {/* Crew Status */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4" />
                Status da Tripulação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">A Bordo</span>
                  <span className="font-semibold text-green-500">{stats?.crew.onboard || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Em Terra</span>
                  <span className="font-semibold">{stats?.crew.onshore || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">De Licença</span>
                  <span className="font-semibold">{stats?.crew.on_leave || 0}</span>
                </div>
                <div className="border-t pt-2 flex justify-between">
                  <span className="text-sm font-medium">Total</span>
                  <span className="font-bold">{stats?.crew.total || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vessel Status */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Ship className="h-4 w-4" />
                Status das Embarcações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Ativas</span>
                  <span className="font-semibold text-green-500">{stats?.vessels.active || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">No Porto</span>
                  <span className="font-semibold text-blue-500">{stats?.vessels.in_port || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Manutenção</span>
                  <span className="font-semibold text-orange-500">{stats?.vessels.maintenance || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Status */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Faturas Pendentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Pendentes</span>
                  <span className="font-semibold">{stats?.invoices.pending_count || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Vencidas</span>
                  <span className="font-semibold text-red-500">{stats?.invoices.overdue_count || 0}</span>
                </div>
                <div className="border-t pt-2 flex justify-between">
                  <span className="text-sm font-medium">Valor Total</span>
                  <span className="font-bold">${(stats?.invoices.pending_amount || 0).toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SISCOMEX Status */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" />
                SISCOMEX (7 dias)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Confirmadas</span>
                  <span className="font-semibold text-green-500">{stats?.siscomex.acknowledged || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Enviadas</span>
                  <span className="font-semibold text-blue-500">{stats?.siscomex.sent || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Pendentes</span>
                  <span className="font-semibold text-yellow-500">{stats?.siscomex.pending || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Erros</span>
                  <span className="font-semibold text-red-500">{stats?.siscomex.errors || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Compliance Deadlines */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Prazos de Compliance (Próximos 90 dias)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {complianceDeadlines.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
              <p>Nenhum prazo próximo do vencimento</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {complianceDeadlines.map((deadline) => (
                <div
                  key={deadline.id}
                  className={`p-4 rounded-lg border ${
                    deadline.days_until_expiry <= 7
                      ? "border-red-500 bg-red-500/5"
                      : deadline.days_until_expiry <= 30
                      ? "border-orange-500 bg-orange-500/5"
                      : ""
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={severityColors[deadline.severity]}>
                      {deadline.days_until_expiry} dias
                    </Badge>
                    <span className="text-xs text-muted-foreground">{deadline.type}</span>
                  </div>
                  <p className="text-sm font-medium">{deadline.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Vencimento: {new Date(deadline.expiry_date).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
