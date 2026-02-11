/**
 * PATCH 870 - System Diagnostics Panel
 * Real-time monitoring of system health, latency, errors, and services
 * Migrated to edge-function-helper for stable environment handling
 */

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Database, 
  RefreshCw, 
  Server, 
  Wifi,
  XCircle,
  Zap,
  BarChart3,
  Terminal
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import { cn } from "@/lib/utils";
import { getEdgeFunctionUrl, getEdgeFunctionHeaders } from "@/lib/supabase/edge-function-helper";

interface ServiceStatus {
  name: string;
  status: "healthy" | "degraded" | "down";
  latency: number;
  lastCheck: Date;
  errorCount: number;
}

interface LogEntry {
  id: string;
  timestamp: Date;
  level: "info" | "warn" | "error";
  module: string;
  message: string;
  details?: Record<string, unknown>;
}

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  trend: "up" | "down" | "stable";
  threshold?: number;
}

export function SystemDiagnosticsPanel() {
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const checkServiceHealth = useCallback(async () => {
    const serviceChecks: ServiceStatus[] = [];

    // Check Supabase Database
    const dbStart = performance.now();
    try {
      const { error } = await supabase.from("organizations").select("id").limit(1);
      const dbLatency = performance.now() - dbStart;
      serviceChecks.push({
        name: "Supabase Database",
        status: error ? "degraded" : dbLatency > 2000 ? "degraded" : "healthy",
        latency: Math.round(dbLatency),
        lastCheck: new Date(),
        errorCount: error ? 1 : 0,
      });
    } catch {
      serviceChecks.push({
        name: "Supabase Database",
        status: "down",
        latency: 0,
        lastCheck: new Date(),
        errorCount: 1,
      });
    }

    // Check Edge Functions
    const efStart = performance.now();
    try {
      const response = await fetch(getEdgeFunctionUrl("system-validation"), {
        method: "POST",
        headers: getEdgeFunctionHeaders(),
        body: JSON.stringify({ test: true }),
      });
      const efLatency = performance.now() - efStart;
      serviceChecks.push({
        name: "Edge Functions",
        status: response.ok ? "healthy" : "degraded",
        latency: Math.round(efLatency),
        lastCheck: new Date(),
        errorCount: response.ok ? 0 : 1,
      });
    } catch {
      serviceChecks.push({
        name: "Edge Functions",
        status: "down",
        latency: 0,
        lastCheck: new Date(),
        errorCount: 1,
      });
    }

    // Check Auth Service
    const authStart = performance.now();
    try {
      const { error } = await supabase.auth.getSession();
      const authLatency = performance.now() - authStart;
      serviceChecks.push({
        name: "Auth Service",
        status: error ? "degraded" : "healthy",
        latency: Math.round(authLatency),
        lastCheck: new Date(),
        errorCount: error ? 1 : 0,
      });
    } catch {
      serviceChecks.push({
        name: "Auth Service",
        status: "down",
        latency: 0,
        lastCheck: new Date(),
        errorCount: 1,
      });
    }

    // Check Storage
    const storageStart = performance.now();
    try {
      const { error } = await supabase.storage.listBuckets();
      const storageLatency = performance.now() - storageStart;
      serviceChecks.push({
        name: "Storage Service",
        status: error ? "degraded" : "healthy",
        latency: Math.round(storageLatency),
        lastCheck: new Date(),
        errorCount: error ? 1 : 0,
      });
    } catch {
      serviceChecks.push({
        name: "Storage Service",
        status: "down",
        latency: 0,
        lastCheck: new Date(),
        errorCount: 1,
      });
    }

    // Check Realtime
    const realtimeState = String(supabase.realtime.connectionState());
    serviceChecks.push({
      name: "Realtime Service",
      status: realtimeState.includes("connect") || realtimeState === "open" ? "healthy" : "degraded",
      latency: 0,
      lastCheck: new Date(),
      errorCount: 0,
    });

    setServices(serviceChecks);
  }, []);

  const collectMetrics = useCallback(() => {
    const newMetrics: PerformanceMetric[] = [];

    // Memory usage (if available)
    const perfWithMemory = performance as Performance & { memory?: { usedJSHeapSize: number; totalJSHeapSize: number } };
    if (perfWithMemory.memory) {
      const memoryUsed = perfWithMemory.memory.usedJSHeapSize / 1024 / 1024;
      const memoryTotal = perfWithMemory.memory.totalJSHeapSize / 1024 / 1024;
      newMetrics.push({
        name: "Memory Usage",
        value: Math.round(memoryUsed),
        unit: "MB",
        trend: "stable",
        threshold: memoryTotal,
      });
    }

    // Navigation timing
    const navTiming = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
    if (navTiming) {
      newMetrics.push({
        name: "Page Load Time",
        value: Math.round(navTiming.loadEventEnd - navTiming.startTime),
        unit: "ms",
        trend: "stable",
      });
      newMetrics.push({
        name: "DOM Interactive",
        value: Math.round(navTiming.domInteractive - navTiming.startTime),
        unit: "ms",
        trend: "stable",
      });
    }

    // Connection info
    const connection = (navigator as { connection?: { effectiveType: string; downlink: number } }).connection;
    if (connection) {
      newMetrics.push({
        name: "Connection Type",
        value: connection.effectiveType === "4g" ? 4 : connection.effectiveType === "3g" ? 3 : 2,
        unit: "G",
        trend: "stable",
      });
      newMetrics.push({
        name: "Downlink Speed",
        value: Math.round(connection.downlink),
        unit: "Mbps",
        trend: "stable",
      });
    }

    setMetrics(newMetrics);
  }, []);

  const fetchRecentLogs = useCallback(async () => {
    try {
      // Use ai_logs as a fallback since system_health_log may not exist
      const { data, error } = await supabase
        .from("ai_logs")
        .select("id, created_at, status, service, error_message")
        .order("created_at", { ascending: false })
        .limit(50);

      if (!error && data) {
        setLogs(
          data.map((log) => ({
            id: log.id,
            timestamp: new Date(log.created_at),
            level: log.status === "error" ? "error" : log.status === "warning" ? "warn" : "info",
            module: log.service || "system",
            message: log.error_message || `${log.service} - ${log.status}`,
            details: undefined,
          }))
        );
      }
    } catch (err) {
      logger.error("[Diagnostics] Failed to fetch logs", { error: err });
    }
  }, []);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([checkServiceHealth(), collectMetrics(), fetchRecentLogs()]);
    setLastUpdate(new Date());
    setIsRefreshing(false);
  }, [checkServiceHealth, collectMetrics, fetchRecentLogs]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [refresh]);

  const getStatusIcon = (status: ServiceStatus["status"]) => {
    switch (status) {
      case "healthy":
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      case "degraded":
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case "down":
        return <XCircle className="h-4 w-4 text-destructive" />;
    }
  };

  const getLogIcon = (level: LogEntry["level"]) => {
    switch (level) {
      case "info":
        return <Activity className="h-3 w-3 text-info" />;
      case "warn":
        return <AlertTriangle className="h-3 w-3 text-warning" />;
      case "error":
        return <XCircle className="h-3 w-3 text-destructive" />;
    }
  };

  const overallHealth = services.every((s) => s.status === "healthy")
    ? "healthy"
    : services.some((s) => s.status === "down")
    ? "critical"
    : "degraded";

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-lg flex items-center gap-2">
            <Server className="h-5 w-5" />
            System Diagnostics
          </CardTitle>
          <CardDescription>
            Real-time health monitoring and performance metrics
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={
              overallHealth === "healthy"
                ? "default"
                : overallHealth === "degraded"
                ? "secondary"
                : "destructive"
            }
          >
            {overallHealth === "healthy" && <CheckCircle2 className="h-3 w-3 mr-1" />}
            {overallHealth === "degraded" && <AlertTriangle className="h-3 w-3 mr-1" />}
            {overallHealth === "critical" && <XCircle className="h-3 w-3 mr-1" />}
            {overallHealth.toUpperCase()}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="services" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="services" className="gap-1">
              <Wifi className="h-4 w-4" />
              Services
            </TabsTrigger>
            <TabsTrigger value="metrics" className="gap-1">
              <BarChart3 className="h-4 w-4" />
              Metrics
            </TabsTrigger>
            <TabsTrigger value="logs" className="gap-1">
              <Terminal className="h-4 w-4" />
              Logs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="services" className="mt-4 space-y-3">
            {services.map((service) => (
              <div
                key={service.name}
                className="flex items-center justify-between p-3 rounded-lg border bg-card"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(service.status)}
                  <div>
                    <p className="font-medium text-sm">{service.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Last check: {service.lastCheck.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-mono flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {service.latency}ms
                    </p>
                    {service.errorCount > 0 && (
                      <p className="text-xs text-destructive">
                        {service.errorCount} error(s)
                      </p>
                    )}
                  </div>
                  <Badge
                    variant={
                      service.status === "healthy"
                        ? "default"
                        : service.status === "degraded"
                        ? "secondary"
                        : "destructive"
                    }
                    className="capitalize"
                  >
                    {service.status}
                  </Badge>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="metrics" className="mt-4 space-y-4">
            {metrics.map((metric) => (
              <div key={metric.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{metric.name}</span>
                  <span className="text-sm font-mono">
                    {metric.value} {metric.unit}
                  </span>
                </div>
                {metric.threshold && (
                  <Progress
                    value={(metric.value / metric.threshold) * 100}
                    className="h-2"
                  />
                )}
              </div>
            ))}
            {metrics.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No metrics available
              </p>
            )}
          </TabsContent>

          <TabsContent value="logs" className="mt-4">
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className={cn(
                      "p-2 rounded text-xs font-mono border",
                      log.level === "error" && "bg-destructive/10 border-destructive/20",
                      log.level === "warn" && "bg-warning/10 border-warning/20",
                      log.level === "info" && "bg-info/10 border-info/20"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {getLogIcon(log.level)}
                      <span className="text-muted-foreground">
                        {log.timestamp.toLocaleTimeString()}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {log.module}
                      </Badge>
                    </div>
                    <p className="pl-5">{log.message}</p>
                  </div>
                ))}
                {logs.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No recent logs
                  </p>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <div className="mt-4 pt-4 border-t flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Database className="h-3 w-3" />
            Last updated: {lastUpdate.toLocaleTimeString()}
          </span>
          <span className="flex items-center gap-1">
            <Zap className="h-3 w-3" />
            Auto-refresh: 30s
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export default SystemDiagnosticsPanel;
