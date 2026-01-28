/**
 * Performance Dashboard - PATCH 879
 * Type-safe with proper Supabase schema alignment
 */
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, AlertTriangle, TrendingUp, Monitor, Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { LazyLineChart } from "@/components/charts/LazyChart";
import { logger } from "@/lib/logger";
import type { Database } from "@/integrations/supabase/types";

type PerformanceMetricRow = Database["public"]["Tables"]["performance_metrics"]["Row"];
type PerformanceAlertRow = Database["public"]["Tables"]["performance_alerts"]["Row"];

// UI Interface aligned with DB schema
interface PerformanceMetric {
  id: string;
  metric_name: string;
  metric_value: number;
  metric_unit: string;
  status: string;
  category: string;
  component: string | null;
  page_url: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

interface PerformanceAlert {
  id: string;
  system_name: string | null;
  alert_type: string;
  severity: string | null;
  message: string | null;
  is_resolved: boolean | null;
  created_at: string | null;
}

// Type-safe mapper functions
function mapMetricRow(row: PerformanceMetricRow): PerformanceMetric {
  return {
    id: row.id,
    metric_name: row.metric_name,
    metric_value: Number(row.metric_value),
    metric_unit: row.metric_unit,
    status: row.status,
    category: row.category,
    component: row.component,
    page_url: row.page_url,
    metadata: row.metadata as Record<string, unknown> | null,
    created_at: row.created_at,
  };
}

function mapAlertRow(row: PerformanceAlertRow): PerformanceAlert {
  return {
    id: row.id,
    system_name: row.system_name,
    alert_type: row.alert_type,
    severity: row.severity,
    message: row.message,
    is_resolved: row.is_resolved,
    created_at: row.created_at,
  };
}

// Severity color helper using design tokens
const getSeverityBadge = (severity: string | null): "default" | "secondary" | "destructive" | "outline" => {
  switch (severity) {
  case "critical": return "destructive";
  case "warning": return "secondary";
  default: return "outline";
  }
};

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
        const newMetric = mapMetricRow(payload.new as PerformanceMetricRow);
        setMetrics(prev => [newMetric, ...prev].slice(0, 100));
      })
      .subscribe();

    const alertsChannel = supabase
      .channel("performance-alerts-changes")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "performance_alerts" }, (payload) => {
        const newAlert = mapAlertRow(payload.new as PerformanceAlertRow);
        setAlerts(prev => [newAlert, ...prev]);
        
        if (newAlert.severity === "critical") {
          toast({
            title: "⚠️ Performance Alert",
            description: newAlert.message ?? "Critical alert detected",
            variant: "destructive"
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(metricsChannel);
      supabase.removeChannel(alertsChannel);
    };
  }, [timeRange, toast]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const hoursBack = timeRange === "1h" ? 1 : timeRange === "24h" ? 24 : timeRange === "7d" ? 168 : 720;
      const timeFilter = new Date(Date.now() - hoursBack * 60 * 60 * 1000).toISOString();

      const [metricsResult, alertsResult] = await Promise.all([
        supabase
          .from("performance_metrics")
          .select("*")
          .gte("created_at", timeFilter)
          .order("created_at", { ascending: false })
          .limit(1000),
        supabase
          .from("performance_alerts")
          .select("*")
          .gte("created_at", timeFilter)
          .order("created_at", { ascending: false })
          .limit(100)
      ]);

      if (metricsResult.error) {
        logger.error("Error loading metrics:", metricsResult.error);
      } else {
        setMetrics((metricsResult.data || []).map(mapMetricRow));
      }

      if (alertsResult.error) {
        logger.error("Error loading alerts:", alertsResult.error);
      } else {
        setAlerts((alertsResult.data || []).map(mapAlertRow));
      }
    } catch (error) {
      logger.error("Error loading dashboard data:", error);
      toast({
        title: "Error",
        description: "Failed to load performance data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resolveAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from("performance_alerts")
        .update({ is_resolved: true, resolved_at: new Date().toISOString() })
        .eq("id", alertId);

      if (error) throw error;
      
      setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, is_resolved: true } : a));
      toast({ title: "Alert resolved" });
    } catch (error) {
      logger.error("Error resolving alert:", error);
      toast({ title: "Error", description: "Failed to resolve alert", variant: "destructive" });
    }
  };

  // Filter and aggregate metrics
  const filteredMetrics = metrics.filter(m => {
    if (selectedPage !== "all" && m.page_url !== selectedPage) return false;
    if (selectedMetric !== "all" && m.metric_name !== selectedMetric) return false;
    return true;
  });

  const uniquePages = [...new Set(metrics.map(m => m.page_url).filter(Boolean))] as string[];
  const uniqueMetricNames = [...new Set(metrics.map(m => m.metric_name))];
  const unresolvedAlerts = alerts.filter(a => !a.is_resolved);

  // Aggregate by metric name for chart (Chart.js format)
  const chartData = {
    labels: uniqueMetricNames.slice(0, 5),
    datasets: [{
      label: "Average Value",
      data: uniqueMetricNames.slice(0, 5).map(name => {
        const metricValues = filteredMetrics.filter(m => m.metric_name === name);
        const avg = metricValues.length > 0 
          ? metricValues.reduce((sum, m) => sum + m.metric_value, 0) / metricValues.length 
          : 0;
        return Math.round(avg * 100) / 100;
      }),
      borderColor: "hsl(var(--primary))",
      backgroundColor: "hsl(var(--primary) / 0.1)",
      tension: 0.4,
    }],
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Activity className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Performance Dashboard</h1>
          <p className="text-muted-foreground">Monitor system performance and alerts</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={loadDashboardData} variant="outline">
            <Activity className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Monitor className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{metrics.length}</p>
                <p className="text-xs text-muted-foreground">Total Metrics</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{unresolvedAlerts.length}</p>
                <p className="text-xs text-muted-foreground">Active Alerts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{uniquePages.length}</p>
                <p className="text-xs text-muted-foreground">Pages Tracked</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-destructive" />
              <div>
                <p className="text-2xl font-bold">
                  {alerts.filter(a => a.severity === "critical" && !a.is_resolved).length}
                </p>
                <p className="text-xs text-muted-foreground">Critical Alerts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="metrics">
        <TabsList>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="alerts">Alerts ({unresolvedAlerts.length})</TabsTrigger>
          <TabsTrigger value="chart">Charts</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Performance Metrics
              </CardTitle>
              <CardDescription>
                <div className="flex gap-2 mt-2">
                  <Select value={selectedPage} onValueChange={setSelectedPage}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter by page" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Pages</SelectItem>
                      {uniquePages.map(page => (
                        <SelectItem key={page} value={page}>
                          {page.replace(/^\//, "") || "Home"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter by metric" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Metrics</SelectItem>
                      {uniqueMetricNames.map(name => (
                        <SelectItem key={name} value={name}>{name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {filteredMetrics.slice(0, 50).map(metric => (
                    <div key={metric.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{metric.metric_name}</span>
                          <Badge variant={metric.status === "normal" ? "outline" : metric.status === "warning" ? "secondary" : "destructive"}>
                            {metric.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {metric.page_url || metric.component || metric.category}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-lg">{metric.metric_value.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">{metric.metric_unit}</p>
                      </div>
                      <p className="text-xs text-muted-foreground ml-4">
                        {formatDistanceToNow(new Date(metric.created_at), { addSuffix: true, locale: ptBR })}
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Active Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {alerts.map(alert => (
                    <div 
                      key={alert.id} 
                      className={`flex items-center justify-between p-3 border rounded-lg ${alert.is_resolved ? "opacity-50" : ""}`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{alert.alert_type}</span>
                          <Badge variant={getSeverityBadge(alert.severity)}>
                            {alert.severity || "info"}
                          </Badge>
                          {alert.is_resolved && <Badge variant="outline">Resolved</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">{alert.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {alert.system_name || "System"} • {alert.created_at && formatDistanceToNow(new Date(alert.created_at), { addSuffix: true, locale: ptBR })}
                        </p>
                      </div>
                      {!alert.is_resolved && (
                        <Button size="sm" variant="outline" onClick={() => resolveAlert(alert.id)}>
                          Resolve
                        </Button>
                      )}
                    </div>
                  ))}
                  {alerts.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No alerts found</p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chart" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Metrics Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <LazyLineChart 
                  data={chartData} 
                  height={350}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
