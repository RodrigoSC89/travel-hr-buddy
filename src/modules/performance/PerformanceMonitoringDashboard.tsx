import { useEffect, useState, useCallback } from "react";;

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Activity, 
  AlertTriangle, 
  TrendingUp, 
  Download, 
  Settings,
  Gauge
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PerformanceMetric {
  id: string;
  system_name: string;
  metric_name: string;
  metric_value: number;
  metric_unit: string;
  status: string;
  created_at: string;
}

interface Alert {
  id: string;
  system_name: string;
  severity: string;
  message: string;
  is_resolved: boolean;
  created_at: string;
}

export const PerformanceMonitoringDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      // Fetch recent metrics
      const { data: metricsData, error: metricsError } = await supabase
        .from("performance_metrics")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (metricsError) throw metricsError;

      // Fetch active alerts
      const { data: alertsData, error: alertsError } = await supabase
        .from("performance_alerts")
        .select("*")
        .eq("is_resolved", false)
        .order("created_at", { ascending: false });

      if (alertsError) throw alertsError;

      setMetrics(metricsData || []);
      setAlerts(alertsData || []);

      // Show toast for new critical alerts
      const criticalAlerts = alertsData?.filter((a) => a.severity === "critical") || [];
      if (criticalAlerts.length > 0) {
        toast({
          title: "Critical Alert",
          description: `${criticalAlerts.length} critical performance alert(s) detected`,
          variant: "destructive",
        };
      }
    } catch (error) {
      console.error("Error fetching performance data:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportLogs = async () => {
    try {
      const csvContent = [
        ["Timestamp", "System", "Metric", "Value", "Unit", "Status"].join(","),
        ...metrics.map((m) =>
          [
            new Date(m.created_at).toISOString(),
            m.system_name,
            m.metric_name,
            m.metric_value,
            m.metric_unit,
            m.status,
          ].join(",")
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `performance-logs-${new Date().toISOString()}.csv`;
      a.click();

      toast({
        title: "Export Complete",
        description: "Performance logs exported successfully",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export logs",
        variant: "destructive",
      });
    }
  };

  // Group metrics by system for charts
  const systemMetrics = metrics.reduce((acc, metric) => {
    if (!acc[metric.system_name]) {
      acc[metric.system_name] = [];
    }
    acc[metric.system_name].push(metric);
    return acc;
  }, {} as Record<string, PerformanceMetric[]>);

  const chartData = Object.keys(systemMetrics).map((system) => {
    const systemData = systemMetrics[system];
    return {
      name: system,
      normal: systemData.filter((m) => m.status === "normal").length,
      warning: systemData.filter((m) => m.status === "warning").length,
      critical: systemData.filter((m) => m.status === "critical").length,
    };
  };

  const stats = {
    totalMetrics: metrics.length,
    criticalAlerts: alerts.filter((a) => a.severity === "critical").length,
    warningAlerts: alerts.filter((a) => a.severity === "warning").length,
    systems: Object.keys(systemMetrics).length,
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Gauge className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Performance Monitoring</h1>
            <p className="text-muted-foreground">
              Real-time system monitoring with threshold-based alerts
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchData}>
            <Activity className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={exportLogs}>
            <Download className="mr-2 h-4 w-4" />
            Export Logs
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMetrics}</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Systems</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.systems}</div>
            <p className="text-xs text-muted-foreground">Being monitored</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Warning Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.warningAlerts}</div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.criticalAlerts}</div>
            <p className="text-xs text-muted-foreground">Immediate action needed</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="thresholds">Thresholds</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Status Distribution</CardTitle>
              <CardDescription>Metric status by system</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="normal" stroke="#10b981" name="Normal" />
                  <Line type="monotone" dataKey="warning" stroke="#f59e0b" name="Warning" />
                  <Line type="monotone" dataKey="critical" stroke="#ef4444" name="Critical" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Metrics</CardTitle>
              <CardDescription>Latest 10 performance readings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {metrics.slice(0, 10).map((metric) => (
                  <div key={metric.id} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <span className="font-medium">{metric.system_name}</span>
                      <span className="text-muted-foreground"> - {metric.metric_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>
                        {metric.metric_value} {metric.metric_unit}
                      </span>
                      <Badge
                        variant={
                          metric.status === "critical"
                            ? "destructive"
                            : metric.status === "warning"
                              ? "secondary"
                              : "default"
                        }
                      >
                        {metric.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Active Alerts
              </CardTitle>
              <CardDescription>Unresolved performance alerts</CardDescription>
            </CardHeader>
            <CardContent>
              {alerts.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No active alerts</p>
              ) : (
                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <Alert key={alert.id} variant={alert.severity === "critical" ? "destructive" : "default"}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{alert.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(alert.created_at).toLocaleString()}
                            </p>
                          </div>
                          <Badge variant={alert.severity === "critical" ? "destructive" : "secondary"}>
                            {alert.severity}
                          </Badge>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="thresholds">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Threshold Configuration
              </CardTitle>
              <CardDescription>
                Configure warning and critical thresholds for system metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Thresholds are configured in the database. Contact your administrator to modify threshold settings.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PerformanceMonitoringDashboard;
