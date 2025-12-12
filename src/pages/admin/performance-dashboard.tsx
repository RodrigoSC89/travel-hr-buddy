import { useEffect, useState, useCallback } from "react";;

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity, AlertTriangle, TrendingUp, TrendingDown, Monitor, Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import { logger } from "@/lib/logger";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface PerformanceMetric {
  id: string;
  system_name: string;
  metric_name: string;
  metric_value: number;
  metric_unit: string;
  status: "normal" | "warning" | "critical";
  metadata: unknown;
  created_at: string;
}

interface PerformanceAlert {
  id: string;
  system_name: string;
  alert_type: string;
  severity: "info" | "warning" | "critical";
  message: string;
  is_resolved: boolean;
  created_at: string;
}

export default function PerformanceDashboard() {
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPage, setSelectedPage] = useState<string>("all");
  const [selectedMetric, setSelectedMetric] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<string>("24h");

  useEffect(() => {
    loadDashboardData();
    
    // Subscribe to real-time updates
    const metricsChannel = supabase
      .channel("performance-metrics-changes")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "performance_metrics" }, (payload) => {
        setMetrics(prev => [payload.new as PerformanceMetric, ...prev].slice(0, 100));
      })
      .subscribe();

    const alertsChannel = supabase
      .channel("performance-alerts-changes")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "performance_alerts" }, (payload) => {
        const newAlert = payload.new as PerformanceAlert;
        setAlerts(prev => [newAlert, ...prev]);
        
        if (newAlert.severity === "critical") {
          toast({
            title: "⚠️ Performance Alert",
            description: newAlert.message,
            variant: "destructive"
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(metricsChannel);
      supabase.removeChannel(alertsChannel);
    };
  }, [timeRange]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const hoursBack = timeRange === "1h" ? 1 : timeRange === "24h" ? 24 : timeRange === "7d" ? 168 : 720;
      const timeFilter = new Date(Date.now() - hoursBack * 60 * 60 * 1000).toISOString();

      const [metricsResult, alertsResult] = await Promise.all([
        supabase
          .from("performance_metrics")
          .select("*")
          .eq("system_name", "web_vitals")
          .gte("created_at", timeFilter)
          .order("created_at", { ascending: false })
          .limit(1000),
        supabase
          .from("performance_alerts")
          .select("*")
          .eq("system_name", "web_vitals")
          .gte("created_at", timeFilter)
          .order("created_at", { ascending: false })
          .limit(100)
      ]);

      if (metricsResult.error) throw metricsResult.error;
      if (alertsResult.error) throw alertsResult.error;

      setMetrics(metricsResult.data || []);
      setAlerts(alertsResult.data || []);
    } catch (error) {
      logger.error("Error loading performance dashboard data", { error, timeRange });
      toast({
        title: "Erro",
        description: "Falha ao carregar dados de performance",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getFilteredMetrics = () => {
    let filtered = metrics;
    
    if (selectedPage !== "all") {
      filtered = filtered.filter(m => m.metadata?.page_url === selectedPage);
    }
    
    if (selectedMetric !== "all") {
      filtered = filtered.filter(m => m.metric_name === selectedMetric);
    }
    
    return filtered;
  };

  const getUniquePages = () => {
    const pages = new Set(metrics.map(m => m.metadata?.page_url).filter(Boolean));
    return Array.from(pages);
  };

  const getMetricStats = (metricName: string) => {
    const metricData = metrics.filter(m => m.metric_name === metricName);
    if (metricData.length === 0) return null;

    const values = metricData.map(m => m.metric_value);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const latest = metricData[0];

    return { avg, min, max, latest, count: values.length };
  };

  const getChartData = (metricName: string) => {
    const metricData = metrics
      .filter(m => m.metric_name === metricName)
      .slice(0, 50)
      .reverse();

    return {
      labels: metricData.map(m => new Date(m.created_at).toLocaleTimeString()),
      datasets: [
        {
          label: metricName,
          data: metricData.map(m => m.metric_value),
          borderColor: "rgb(75, 192, 192)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          tension: 0.1
        }
      ]
    };
  };

  const webVitalsMetrics = ["CLS", "FCP", "LCP", "TTFB", "INP"];

  const getStatusBadge = (status: string) => {
    switch (status) {
    case "critical":
      return <Badge variant="destructive">Critical</Badge>;
    case "warning":
      return <Badge variant="secondary">Warning</Badge>;
    default:
      return <Badge variant="default">Normal</Badge>;
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
    case "critical":
      return <AlertTriangle className="h-5 w-5 text-red-500" />;
    case "warning":
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    default:
      return <Activity className="h-5 w-5 text-blue-500" />;
    }
  };

  const unresolvedAlerts = alerts.filter(a => !a.is_resolved);
  const criticalAlerts = unresolvedAlerts.filter(a => a.severity === "critical");

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Monitor className="h-8 w-8" />
            Performance Monitoring Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Web Vitals e Métricas de Performance em Tempo Real
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Última Hora</SelectItem>
              <SelectItem value="24h">24 Horas</SelectItem>
              <SelectItem value="7d">7 Dias</SelectItem>
              <SelectItem value="30d">30 Dias</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={loadDashboardData} variant="outline">
            Atualizar
          </Button>
        </div>
      </div>

      {/* Alerts Summary */}
      {unresolvedAlerts.length > 0 && (
        <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Alertas Ativos ({unresolvedAlerts.length})
              {criticalAlerts.length > 0 && (
                <Badge variant="destructive">{criticalAlerts.length} Críticos</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-32">
              <div className="space-y-2">
                {unresolvedAlerts.slice(0, 5).map(alert => (
                  <div key={alert.id} className="flex items-start gap-2 p-2 bg-white dark:bg-gray-800 rounded">
                    {getSeverityIcon(alert.severity)}
                    <div className="flex-1">
                      <p className="text-sm font-medium">{alert.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true, locale: ptBR })}
                      </p>
                    </div>
                    {getStatusBadge(alert.severity)}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium">Página</label>
            <Select value={selectedPage} onValueChange={setSelectedPage}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Páginas</SelectItem>
                {getUniquePages().map(page => (
                  <SelectItem key={page} value={page}>{page}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <label className="text-sm font-medium">Métrica</label>
            <Select value={selectedMetric} onValueChange={setSelectedMetric}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Métricas</SelectItem>
                {webVitalsMetrics.map(metric => (
                  <SelectItem key={metric} value={metric}>{metric}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Web Vitals Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {webVitalsMetrics.map(metric => {
          const stats = getMetricStats(metric);
          if (!stats) return null;

          return (
            <Card key={metric}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {metric}
                  {getStatusBadge(stats.latest.status)}
                </CardTitle>
                <CardDescription>
                  {stats.count} medições no período
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Atual:</span>
                    <span className="font-bold">{stats.latest.metric_value.toFixed(2)} {stats.latest.metric_unit}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Média:</span>
                    <span>{stats.avg.toFixed(2)} {stats.latest.metric_unit}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Min/Max:</span>
                    <span>{stats.min.toFixed(2)} / {stats.max.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <Tabs defaultValue="CLS">
        <TabsList className="grid w-full grid-cols-5">
          {webVitalsMetrics.map(metric => (
            <TabsTrigger key={metric} value={metric}>{metric}</TabsTrigger>
          ))}
        </TabsList>
        {webVitalsMetrics.map(metric => (
          <TabsContent key={metric} value={metric}>
            <Card>
              <CardHeader>
                <CardTitle>{metric} - Histórico</CardTitle>
                <CardDescription>Últimas 50 medições</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <Line 
                    data={getChartData(metric)} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false }
                      }
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Recent Metrics Table */}
      <Card>
        <CardHeader>
          <CardTitle>Métricas Recentes</CardTitle>
          <CardDescription>Últimas medições coletadas</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-2">
              {getFilteredMetrics().slice(0, 50).map(metric => (
                <div key={metric.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{metric.metric_name}</span>
                      {getStatusBadge(metric.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {metric.metadata?.page_url || "Unknown page"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(metric.created_at), { addSuffix: true, locale: ptBR })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">{metric.metric_value.toFixed(2)} {metric.metric_unit}</p>
                    {metric.metadata?.rating && (
                      <p className="text-xs text-muted-foreground capitalize">{metric.metadata.rating}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
