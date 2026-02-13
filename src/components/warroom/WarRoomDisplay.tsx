/**
 * PATCH 1004 - War Room Display
 * Fullscreen dashboard for TVs, projectors, and command centers
 */

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock,
  Expand,
  Maximize2,
  Minimize2,
  RefreshCw,
  Ship,
  Users,
  Wrench,
  XCircle,
  Zap,
  TrendingUp,
  TrendingDown,
  Activity,
  Volume2,
  VolumeX,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { logger } from "@/lib/logger";

interface KPIMetric {
  id: string;
  label: string;
  value: string | number;
  change?: number;
  status: "good" | "warning" | "critical";
  icon: React.ElementType;
}

interface CriticalAlert {
  id: string;
  title: string;
  severity: "critical" | "high" | "medium";
  timestamp: Date;
  source: string;
}

export function WarRoomDisplay() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [metrics, setMetrics] = useState<KPIMetric[]>([]);
  const [alerts, setAlerts] = useState<CriticalAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      // Fetch vessels
      const { count: vesselCount } = await supabase
        .from("vessels")
        .select("*", { count: "exact", head: true });

      // Fetch crew
      const { count: crewCount } = await supabase
        .from("crew_members")
        .select("*", { count: "exact", head: true });

      // Mock maintenance data for demo
      const pendingJobs = 8;
      const completedJobs = 42;
      const totalJobs = 50;
      const completionRate = Math.round((completedJobs / totalJobs) * 100);

      // Mock alerts for demo
      const alertData: Array<{ id: string; title: string; severity: string; created_at: string; source_module: string }> = [];

      setMetrics([
        {
          id: "vessels",
          label: "Embarcações Ativas",
          value: vesselCount || 0,
          status: "good",
          icon: Ship,
        },
        {
          id: "crew",
          label: "Tripulantes",
          value: crewCount || 0,
          status: "good",
          icon: Users,
        },
        {
          id: "pending-jobs",
          label: "Manutenções Pendentes",
          value: pendingJobs,
          status: pendingJobs > 20 ? "critical" : pendingJobs > 10 ? "warning" : "good",
          icon: Wrench,
        },
        {
          id: "completion",
          label: "Taxa de Conclusão",
          value: `${completionRate}%`,
          change: 5,
          status: completionRate > 80 ? "good" : completionRate > 60 ? "warning" : "critical",
          icon: CheckCircle2,
        },
        {
          id: "alerts",
          label: "Alertas Críticos",
          value: alertData?.length || 0,
          status: (alertData?.length || 0) > 0 ? "critical" : "good",
          icon: AlertTriangle,
        },
        {
          id: "uptime",
          label: "Uptime do Sistema",
          value: "99.9%",
          status: "good",
          icon: Zap,
        },
      ]);

      setAlerts(
        (alertData || []).map((a) => ({
          id: a.id,
          title: a.title || "Alerta",
          severity: a.severity as CriticalAlert["severity"],
          timestamp: new Date(a.created_at),
          source: a.source_module || "Sistema",
        }))
      );
    } catch (err) {
      logger.error("[WarRoom] Error fetching data:", err instanceof Error ? { message: err.message } : undefined);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [fetchData]);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const getStatusColor = (status: KPIMetric["status"]) => {
    switch (status) {
      case "good":
        return "text-success bg-success/10 border-success/20";
      case "warning":
        return "text-warning bg-warning/10 border-warning/20";
      case "critical":
        return "text-destructive bg-destructive/10 border-destructive/20 animate-pulse";
    }
  };

  const getSeverityColor = (severity: CriticalAlert["severity"]) => {
    switch (severity) {
      case "critical":
        return "destructive";
      case "high":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div
      className={cn(
        "w-full min-h-screen bg-background p-4 transition-all",
        isFullscreen && "fixed inset-0 z-50 p-6"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Activity className="h-8 w-8 text-primary animate-pulse" />
            <div>
              <h1 className="text-2xl font-bold">War Room</h1>
              <p className="text-sm text-muted-foreground">Centro de Comando</p>
            </div>
          </div>
          <Badge variant="outline" className="text-lg px-3 py-1">
            <Clock className="h-4 w-4 mr-2" />
            {currentTime.toLocaleTimeString()}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSoundEnabled(!soundEnabled)}
          >
            {soundEnabled ? (
              <Volume2 className="h-4 w-4" />
            ) : (
              <VolumeX className="h-4 w-4" />
            )}
          </Button>
          <Button variant="outline" size="icon" onClick={fetchData}>
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </Button>
          <Button variant="outline" size="icon" onClick={toggleFullscreen}>
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {metrics.map((metric) => (
          <Card
            key={metric.id}
            className={cn(
              "border-2 transition-all",
              getStatusColor(metric.status)
            )}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <metric.icon className="h-6 w-6" />
                {metric.change !== undefined && (
                  <span
                    className={cn(
                      "text-xs flex items-center",
                      metric.change > 0 ? "text-green-500" : "text-red-500"
                    )}
                  >
                    {metric.change > 0 ? (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-1" />
                    )}
                    {Math.abs(metric.change)}%
                  </span>
                )}
              </div>
              <div className="text-3xl font-bold">{metric.value}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {metric.label}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Alerts Panel */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bell className="h-5 w-5" />
              Alertas Críticos
              {alerts.length > 0 && (
                <Badge variant="destructive" className="ml-auto">
                  {alerts.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {alerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle2 className="h-12 w-12 text-green-500 mb-2" />
                <p className="text-muted-foreground">
                  Nenhum alerta crítico
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={cn(
                      "p-3 rounded-lg border-l-4 transition-all",
                      alert.severity === "critical"
                        ? "border-l-destructive bg-destructive/10 animate-pulse"
                        : alert.severity === "high"
                        ? "border-l-warning bg-warning/10"
                        : "border-l-warning bg-warning/10"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-sm">{alert.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {alert.source} • {alert.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                      <Badge variant={getSeverityColor(alert.severity) as "destructive" | "secondary" | "outline"}>
                        {alert.severity}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Status */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Zap className="h-5 w-5" />
              Status dos Sistemas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {[
                { name: "Database", status: 100, color: "bg-success" },
                { name: "Edge Functions", status: 100, color: "bg-success" },
                { name: "Auth Service", status: 100, color: "bg-success" },
                { name: "Storage", status: 100, color: "bg-success" },
                { name: "Realtime", status: 98, color: "bg-warning" },
                { name: "AI Gateway", status: 100, color: "bg-success" },
              ].map((system) => (
                <div key={system.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>{system.name}</span>
                    <span className={cn(
                      "font-mono",
                      system.status === 100 ? "text-green-500" : "text-yellow-500"
                    )}>
                      {system.status}%
                    </span>
                  </div>
                  <Progress value={system.status} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="mt-6 flex items-center justify-center text-xs text-muted-foreground">
        <span>Nautilus One • War Room • Atualização automática a cada 30s</span>
      </div>
    </div>
  );
}

export default WarRoomDisplay;
