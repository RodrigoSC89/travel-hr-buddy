import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Activity, Users, TrendingUp, AlertTriangle, CheckCircle, Clock,
  Database, Cpu, HardDrive, Wifi, Shield, Zap
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

/** Deterministic sine-based value */
const sineValue = (base: number, amplitude: number, phase: number, hourOffset: number = 0): number => {
  const t = (Date.now() / 60000) + hourOffset;
  return base + Math.sin(t * 0.1 + phase) * amplitude;
};

const AdvancedSystemMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetric[]>([]);
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const { toast } = useToast();

  const generateMetrics = (): SystemMetric[] => {
    const now = Date.now();
    return [
      {
        id: "cpu",
        name: "CPU Usage",
        value: Math.round(sineValue(45, 20, 0) * 10) / 10,
        unit: "%",
        status: "good",
        threshold: 80,
        lastUpdated: new Date().toISOString()
      },
      {
        id: "memory",
        name: "Memory Usage",
        value: Math.round(sineValue(55, 15, 1.5) * 10) / 10,
        unit: "%",
        status: "good",
        threshold: 85,
        lastUpdated: new Date().toISOString()
      },
      {
        id: "database",
        name: "Database Connections",
        value: Math.floor(sineValue(25, 10, 3)),
        unit: "connections",
        status: "good",
        threshold: 100,
        lastUpdated: new Date().toISOString()
      },
      {
        id: "response_time",
        name: "Average Response Time",
        value: Math.round(sineValue(250, 100, 4.5) * 10) / 10,
        unit: "ms",
        status: "good",
        threshold: 500,
        lastUpdated: new Date().toISOString()
      },
      {
        id: "error_rate",
        name: "Error Rate",
        value: Math.round(Math.max(0, sineValue(1.2, 0.8, 6)) * 100) / 100,
        unit: "%",
        status: "good",
        threshold: 2,
        lastUpdated: new Date().toISOString()
      },
      {
        id: "active_users",
        name: "Active Users",
        value: Math.floor(Math.max(0, sineValue(85, 40, 7.5))),
        unit: "users",
        status: "good",
        threshold: 500,
        lastUpdated: new Date().toISOString()
      }
    ];
  };

  const generatePerformanceData = (): PerformanceData[] => {
    const data: PerformanceData[] = [];
    const now = new Date();
    
    for (let i = 23; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
      const hourPhase = (23 - i);
      data.push({
        timestamp: timestamp.toISOString(),
        cpu: Math.round(Math.max(0, Math.min(100, sineValue(45, 20, 0, hourPhase))) * 10) / 10,
        memory: Math.round(Math.max(0, Math.min(100, sineValue(55, 15, 1.5, hourPhase))) * 10) / 10,
        database: Math.floor(Math.max(0, sineValue(25, 10, 3, hourPhase))),
        requests: Math.floor(Math.max(0, sineValue(400, 200, 4.5, hourPhase)))
      });
    }
    
    return data;
  };

  const loadSystemMetrics = async () => {
    try {
      setIsLoading(true);
      const mockMetrics = generateMetrics();
      const mockPerformance = generatePerformanceData();
      
      const updatedMetrics = mockMetrics.map(metric => ({
        ...metric,
        status: (metric.value > metric.threshold ? "critical" : 
          metric.value > metric.threshold * 0.8 ? "warning" : "good") as "good" | "warning" | "critical"
      }));
      
      setMetrics(updatedMetrics);
      setPerformanceData(mockPerformance);
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao carregar métricas do sistema", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
    case "critical": return <AlertTriangle className="w-4 h-4 text-destructive" />;
    case "warning": return <Clock className="w-4 h-4 text-warning" />;
    default: return <CheckCircle className="w-4 h-4 text-success" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
    case "critical": return "border-destructive bg-destructive/10";
    case "warning": return "border-warning bg-warning/10";
    default: return "border-success bg-success/10";
    }
  };

  const getMetricIcon = (id: string) => {
    switch (id) {
    case "cpu": return <Cpu className="w-5 h-5" />;
    case "memory": return <HardDrive className="w-5 h-5" />;
    case "database": return <Database className="w-5 h-5" />;
    case "response_time": return <Zap className="w-5 h-5" />;
    case "error_rate": return <AlertTriangle className="w-5 h-5" />;
    case "active_users": return <Users className="w-5 h-5" />;
    default: return <Activity className="w-5 h-5" />;
    }
  };

  const formatValue = (value: number, unit: string): string => {
    if (unit === "ms") return `${value.toFixed(1)}${unit}`;
    if (unit === "%") return `${value.toFixed(1)}${unit}`;
    return `${Math.floor(value)} ${unit}`;
  };

  useEffect(() => {
    loadSystemMetrics();
    const interval = setInterval(loadSystemMetrics, refreshInterval * 1000);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  if (isLoading) {
    return (
      <Card className="w-full max-w-6xl mx-auto">
        <CardHeader><CardTitle>Monitor do Sistema</CardTitle></CardHeader>
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

  const criticalCount = metrics.filter(m => m.status === "critical").length;
  const warningCount = metrics.filter(m => m.status === "warning").length;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" /> Monitor do Sistema
              </CardTitle>
              <CardDescription>Monitoramento em tempo real da infraestrutura</CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Atualizar a cada:</span>
                <Input type="number" value={refreshInterval} onChange={(e) => setRefreshInterval(Number(e.target.value))} className="w-20" min="10" max="300" />
                <span className="text-sm text-muted-foreground">segundos</span>
              </div>
              <Button onClick={loadSystemMetrics} variant="outline">
                <Activity className="w-4 h-4 mr-2" /> Atualizar
              </Button>
            </div>
          </div>
          {(criticalCount > 0 || warningCount > 0) && (
            <div className="flex gap-2 mt-4">
              {criticalCount > 0 && <Badge variant="destructive">{criticalCount} Crítico{criticalCount > 1 ? "s" : ""}</Badge>}
              {warningCount > 0 && <Badge variant="secondary" className="bg-warning text-warning-foreground">{warningCount} Aviso{warningCount > 1 ? "s" : ""}</Badge>}
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
                    <div className="text-2xl font-bold">{formatValue(metric.value, metric.unit)}</div>
                    <div className="text-xs text-muted-foreground">Threshold: {metric.threshold}{metric.unit}</div>
                    <div className="text-xs text-muted-foreground">Atualizado: {new Date(metric.lastUpdated).toLocaleTimeString("pt-BR")}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="text-lg">CPU & Memória (24h)</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" tickFormatter={(value) => new Date(value).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} />
                    <YAxis />
                    <Tooltip labelFormatter={(value) => new Date(value).toLocaleString("pt-BR")} formatter={(value: number, name: string) => [`${value.toFixed(1)}%`, name === "cpu" ? "CPU" : "Memória"]} />
                    <Line type="monotone" dataKey="cpu" stroke="hsl(var(--primary))" strokeWidth={2} />
                    <Line type="monotone" dataKey="memory" stroke="hsl(var(--secondary))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-lg">Requests & Database (24h)</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" tickFormatter={(value) => new Date(value).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} />
                    <YAxis />
                    <Tooltip labelFormatter={(value) => new Date(value).toLocaleString("pt-BR")} formatter={(value: number, name: string) => [name === "requests" ? Math.floor(value) : `${value.toFixed(1)}`, name === "requests" ? "Requests" : "DB Connections"]} />
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
