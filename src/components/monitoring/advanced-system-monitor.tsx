/**
 * Advanced System Monitor - Real Data Integration
 * Uses useSystemHealth hook for real-time database metrics
 */
import React, { useState } from "react";
import { useSystemHealth, useSystemHealthHistory } from "@/hooks/useSystemHealthData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Activity, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Cpu,
  HardDrive,
  Wifi,
  Shield,
  Zap
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

interface SystemMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: "good" | "warning" | "critical";
  threshold: number;
  lastUpdated: string;
}

interface PerformanceData {
  timestamp: string;
  cpu: number;
  memory: number;
  database: number;
  requests: number;
}

const AdvancedSystemMonitor: React.FC = () => {
  const [refreshInterval, setRefreshInterval] = useState(30);
  const { metrics: healthMetrics, alerts, isLoading, refetch } = useSystemHealth();
  const { data: historyData } = useSystemHealthHistory(24);

  // Convert health metrics to display format
  const getMetrics = (): SystemMetric[] => {
    const now = new Date().toISOString();
    return [
      {
        id: "cpu",
        name: "CPU Usage",
        value: healthMetrics.cpu,
        unit: "%",
        status: healthMetrics.cpu > 80 ? "critical" : healthMetrics.cpu > 60 ? "warning" : "good",
        threshold: 80,
        lastUpdated: now
      },
      {
        id: "memory",
        name: "Memory Usage",
        value: healthMetrics.memory,
        unit: "%",
        status: healthMetrics.memory > 85 ? "critical" : healthMetrics.memory > 70 ? "warning" : "good",
        threshold: 85,
        lastUpdated: now
      },
      {
        id: "database",
        name: "Database Health",
        value: healthMetrics.database,
        unit: "%",
        status: healthMetrics.database < 50 ? "critical" : healthMetrics.database < 80 ? "warning" : "good",
        threshold: 80,
        lastUpdated: now
      },
      {
        id: "response_time",
        name: "Response Time",
        value: healthMetrics.responseTime,
        unit: "ms",
        status: healthMetrics.responseTime > 500 ? "critical" : healthMetrics.responseTime > 200 ? "warning" : "good",
        threshold: 500,
        lastUpdated: now
      },
      {
        id: "network",
        name: "Network Status",
        value: healthMetrics.network,
        unit: "%",
        status: healthMetrics.network < 50 ? "critical" : healthMetrics.network < 80 ? "warning" : "good",
        threshold: 80,
        lastUpdated: now
      },
      {
        id: "active_users",
        name: "Active Users",
        value: healthMetrics.activeUsers,
        unit: "users",
        status: "good",
        threshold: 500,
        lastUpdated: now
      }
    ];
  };

  // Convert history data to chart format
  const getPerformanceData = (): PerformanceData[] => {
    if (!historyData || historyData.length === 0) {
      // Return empty state with single point for chart
      return [{ timestamp: new Date().toISOString(), cpu: 0, memory: 0, database: 100, requests: 0 }];
    }

    return historyData.map(h => ({
      timestamp: h.recorded_at,
      cpu: h.cpu_usage ?? 0,
      memory: h.memory_usage ?? 0,
      database: 100 - Math.min((h.database_latency_ms ?? 0) / 10, 100),
      requests: h.active_users ?? 0
    }));
  };

  const metrics = getMetrics();
  const performanceData = getPerformanceData();

  const getStatusIcon = (status: string) => {
    switch (status) {
    case "critical":
      return <AlertTriangle className="w-4 h-4 text-destructive" />;
    case "warning":
      return <Clock className="w-4 h-4 text-warning" />;
    default:
      return <CheckCircle className="w-4 h-4 text-success" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
    case "critical":
      return "border-destructive bg-destructive/10";
    case "warning":
      return "border-warning bg-warning/10";
    default:
      return "border-success bg-success/10";
    }
  };

  const getMetricIcon = (id: string) => {
    switch (id) {
    case "cpu":
      return <Cpu className="w-5 h-5" />;
    case "memory":
      return <HardDrive className="w-5 h-5" />;
    case "database":
      return <Database className="w-5 h-5" />;
    case "response_time":
      return <Zap className="w-5 h-5" />;
    case "error_rate":
      return <AlertTriangle className="w-5 h-5" />;
    case "active_users":
      return <Users className="w-5 h-5" />;
    default:
      return <Activity className="w-5 h-5" />;
    }
  };

  const formatValue = (value: number, unit: string): string => {
    if (unit === "ms") {
      return `${value.toFixed(1)}${unit}`;
    }
    if (unit === "%") {
      return `${value.toFixed(1)}${unit}`;
    }
    return `${Math.floor(value)} ${unit}`;
  };

  const criticalCount = metrics.filter(m => m.status === "critical").length;
  const warningCount = metrics.filter(m => m.status === "warning").length;

  if (isLoading) {
    return (
      <Card className="w-full max-w-6xl mx-auto">
        <CardHeader>
          <CardTitle>Monitor do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-32 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Status Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Monitor do Sistema
              </CardTitle>
              <CardDescription>
                Monitoramento em tempo real da infraestrutura
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Atualizar a cada:</span>
                <Input
                  type="number"
                  value={refreshInterval}
                  onChange={(e) => setRefreshInterval(Number(e.target.value))}
                  className="w-20"
                  min="10"
                  max="300"
                />
                <span className="text-sm text-muted-foreground">segundos</span>
              </div>
              <Button onClick={() => refetch()} variant="outline">
                <Activity className="w-4 h-4 mr-2" />
                Atualizar
              </Button>
            </div>
          </div>
          
          {(criticalCount > 0 || warningCount > 0) && (
            <div className="flex gap-2 mt-4">
              {criticalCount > 0 && (
                <Badge variant="destructive">
                  {criticalCount} Crítico{criticalCount > 1 ? "s" : ""}
                </Badge>
              )}
              {warningCount > 0 && (
                <Badge variant="secondary" className="bg-warning text-warning-foreground">
                  {warningCount} Aviso{warningCount > 1 ? "s" : ""}
                </Badge>
              )}
            </div>
          )}
        </CardHeader>
      </Card>

      <Tabs defaultValue="metrics" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="metrics">Métricas em Tempo Real</TabsTrigger>
          <TabsTrigger value="performance">Gráficos de Performance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="metrics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics.map((metric) => (
              <Card key={metric.id} className={`transition-all hover:shadow-md ${getStatusColor(metric.status)}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getMetricIcon(metric.id)}
                      <span className="font-medium text-sm">{metric.name}</span>
                    </div>
                    {getStatusIcon(metric.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold">
                      {formatValue(metric.value, metric.unit)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Threshold: {metric.threshold}{metric.unit}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Atualizado: {new Date(metric.lastUpdated).toLocaleTimeString("pt-BR")}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">CPU & Memória (24h)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={(value) => new Date(value).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleString("pt-BR")}
                      formatter={(value: number, name: string) => [
                        `${value.toFixed(1)}%`,
                        name === "cpu" ? "CPU" : "Memória"
                      ]}
                    />
                    <Line type="monotone" dataKey="cpu" stroke="hsl(var(--primary))" strokeWidth={2} />
                    <Line type="monotone" dataKey="memory" stroke="hsl(var(--secondary))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Requests & Database (24h)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={(value) => new Date(value).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleString("pt-BR")}
                      formatter={(value: number, name: string) => [
                        name === "requests" ? Math.floor(value) : `${value.toFixed(1)}`,
                        name === "requests" ? "Requests" : "DB Connections"
                      ]}
                    />
                    <Area type="monotone" dataKey="requests" stackId="1" stroke="hsl(var(--info))" fill="hsl(var(--info))" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="database" stackId="2" stroke="hsl(var(--success))" fill="hsl(var(--success))" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedSystemMonitor;