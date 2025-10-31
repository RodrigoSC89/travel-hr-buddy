/**
 * PATCH 347: Analytics Core v2 - Real-Time Dashboard
 * Real-time analytics with streaming metrics and automatic alerts
 */

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Activity, AlertTriangle, TrendingUp, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { AnalyticsService } from "@/services/analytics.service";
import type { RealTimeMetrics, TimeSeriesData } from "@/types/analytics";

export const AnalyticsDashboardV2 = () => {
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);

  // Real-time metrics (refresh every 5 seconds)
  const { data: metrics, refetch } = useQuery({
    queryKey: ["realtime-metrics"],
    queryFn: () => AnalyticsService.getRealTimeMetrics(),
    refetchInterval: 5000,
  });

  const { data: alerts = [] } = useQuery({
    queryKey: ["analytics-alerts"],
    queryFn: () => AnalyticsService.getActiveAlerts(),
    refetchInterval: 30000,
  });

  const { data: alertHistory = [] } = useQuery({
    queryKey: ["alert-history"],
    queryFn: () => AnalyticsService.getAlertHistory(),
  });

  // Load time series data
  useEffect(() => {
    const loadTimeSeriesData = async () => {
      const data = await AnalyticsService.getTimeSeriesData("page_view", 60, 5);
      setTimeSeriesData(data);
    };
    loadTimeSeriesData();
    const interval = setInterval(loadTimeSeriesData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Start tracking this page view
  useEffect(() => {
    AnalyticsService.trackPageView("Analytics Dashboard V2");
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics Core v2</h1>
        <p className="text-muted-foreground">
          Monitoramento em tempo real e análise de métricas
        </p>
      </div>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Eventos/Minuto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.events_per_minute || 0}
            </div>
            <p className="text-xs text-muted-foreground">Últimos 5 minutos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4" />
              Usuários Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {metrics?.active_users || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics?.active_sessions || 0} sessões ativas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Visualizações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.page_views_last_5min || 0}
            </div>
            <p className="text-xs text-muted-foreground">Últimos 5 minutos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Erros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {metrics?.errors_last_5min || 0}
            </div>
            <p className="text-xs text-muted-foreground">Últimos 5 minutos</p>
          </CardContent>
        </Card>
      </div>

      {/* Time Series Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Visualizações de Página - Últimos 60 Minutos</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(value) =>
                  new Date(value).toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                }
              />
              <YAxis />
              <Tooltip
                labelFormatter={(value) =>
                  new Date(value).toLocaleString("pt-BR")
                }
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#2563eb"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Active Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Alertas Ativos ({alerts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alerts.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                Nenhum alerta ativo no momento
              </p>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <AlertTriangle
                      className={`w-5 h-5 ${
                        alert.severity === "critical"
                          ? "text-red-600"
                          : alert.severity === "warning"
                            ? "text-yellow-600"
                            : "text-blue-600"
                      }`}
                    />
                    <div>
                      <p className="font-medium">{alert.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {alert.description}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {alert.metric_name} {alert.condition} {alert.threshold}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Disparado {alert.trigger_count} vezes
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Alert History */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Alertas (Últimos 10)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {alertHistory.slice(0, 10).map((history: any) => (
              <div
                key={history.id}
                className="flex items-center justify-between p-2 border-b last:border-0"
              >
                <div>
                  <p className="text-sm">{history.message}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(history.triggered_at).toLocaleString("pt-BR")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    Valor: {history.metric_value}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Limiar: {history.threshold}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
