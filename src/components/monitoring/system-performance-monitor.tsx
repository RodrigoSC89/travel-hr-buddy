import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { 
  Activity, 
  Server, 
  Database, 
  Wifi, 
  Cpu, 
  HardDrive, 
  MemoryStick, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  Zap,
  Globe,
  Shield,
  RefreshCw,
  Download
} from "lucide-react";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface SystemMetric {
  name: string;
  value: number;
  unit: string;
  status: "healthy" | "warning" | "critical";
  threshold: { warning: number; critical: number };
  trend: "up" | "down" | "stable";
}

interface ServiceStatus {
  name: string;
  status: "online" | "offline" | "degraded";
  uptime: number;
  responseTime: number;
  lastCheck: Date;
}

const SystemPerformanceMonitor = () => {
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState("1h");
  const [isExporting, setIsExporting] = useState(false);

  // Dados simulados de métricas do sistema
  const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>([
    { name: "CPU Usage", value: 45, unit: "%", status: "healthy", threshold: { warning: 70, critical: 90 }, trend: "stable" },
    { name: "Memory Usage", value: 68, unit: "%", status: "warning", threshold: { warning: 70, critical: 85 }, trend: "up" },
    { name: "Disk Usage", value: 55, unit: "%", status: "healthy", threshold: { warning: 80, critical: 95 }, trend: "up" },
    { name: "Network I/O", value: 23, unit: "MB/s", status: "healthy", threshold: { warning: 50, critical: 80 }, trend: "down" },
    { name: "Active Connections", value: 142, unit: "conn", status: "healthy", threshold: { warning: 200, critical: 300 }, trend: "stable" },
    { name: "Database Queries/sec", value: 85, unit: "q/s", status: "healthy", threshold: { warning: 150, critical: 200 }, trend: "up" }
  ]);

  const [services, setServices] = useState<ServiceStatus[]>([
    { name: "Web Server", status: "online", uptime: 99.9, responseTime: 120, lastCheck: new Date() },
    { name: "Database", status: "online", uptime: 99.8, responseTime: 15, lastCheck: new Date() },
    { name: "API Gateway", status: "online", uptime: 99.7, responseTime: 45, lastCheck: new Date() },
    { name: "Cache Server", status: "degraded", uptime: 95.2, responseTime: 8, lastCheck: new Date() },
    { name: "File Storage", status: "online", uptime: 99.9, responseTime: 25, lastCheck: new Date() },
    { name: "Backup Service", status: "online", uptime: 98.5, responseTime: 200, lastCheck: new Date() }
  ]);

  // Dados históricos para gráficos
  const performanceData = [
    { time: "00:00", cpu: 35, memory: 55, disk: 52, network: 15 },
    { time: "04:00", cpu: 42, memory: 58, disk: 53, network: 18 },
    { time: "08:00", cpu: 65, memory: 72, disk: 54, network: 28 },
    { time: "12:00", cpu: 58, memory: 68, disk: 55, network: 23 },
    { time: "16:00", cpu: 45, memory: 65, disk: 55, network: 20 },
    { time: "20:00", cpu: 38, memory: 60, disk: 55, network: 16 }
  ];

  const responseTimeData = [
    { time: "00:00", api: 45, database: 12, web: 120 },
    { time: "04:00", api: 42, database: 15, web: 115 },
    { time: "08:00", api: 65, database: 25, web: 180 },
    { time: "12:00", api: 55, database: 20, web: 145 },
    { time: "16:00", api: 48, database: 18, web: 130 },
    { time: "20:00", api: 45, database: 15, web: 120 }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
    case "online":
    case "healthy":
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    case "warning":
    case "degraded":
      return <AlertTriangle className="w-4 h-4 text-orange-600" />;
    case "critical":
    case "offline":
      return <AlertTriangle className="w-4 h-4 text-red-600" />;
    default:
      return <Activity className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
    case "online":
    case "healthy":
      return "text-green-600 bg-green-100";
    case "warning":
    case "degraded":
      return "text-orange-600 bg-orange-100";
    case "critical":
    case "offline":
      return "text-red-600 bg-red-100";
    default:
      return "text-muted-foreground bg-gray-100";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
    case "up": return <TrendingUp className="w-4 h-4 text-red-600" />;
    case "down": return <TrendingDown className="w-4 h-4 text-green-600" />;
    default: return <Activity className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const refreshMetrics = async () => {
    setIsRefreshing(true);
    // Simular atualização dos dados
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Atualizar métricas com valores aleatórios
    setSystemMetrics(prev => prev.map(metric => ({
      ...metric,
      value: Math.max(0, metric.value + (Math.random() - 0.5) * 10)
    })));

    setIsRefreshing(false);
  };

  const exportReport = async () => {
    setIsExporting(true);
    try {
      // Prepare performance report data
      const reportData = {
        timestamp: new Date().toISOString(),
        timeRange: selectedTimeRange,
        systemMetrics,
        services,
        performanceData,
        alerts: systemMetrics.filter(m => m.status !== "healthy").length,
        overallStatus: overallStatus
      };

      // Simulate export delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast({
        title: "Relatório Exportado",
        description: "Relatório de performance do sistema exportado com sucesso!",
      });

      // In production, this would trigger a file download} catch (error) {
      toast({
        title: "Erro na Exportação",
        description: "Falha ao exportar relatório de performance.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const overallStatus = systemMetrics.every(m => m.status === "healthy") && 
                       services.every(s => s.status === "online") ? "healthy" : 
    systemMetrics.some(m => m.status === "critical") || 
                       services.some(s => s.status === "offline") ? "critical" : "warning";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Server className="w-8 h-8" />
              Monitor de Performance
            </h1>
            <p className="text-muted-foreground">Monitoramento em tempo real do sistema</p>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(overallStatus)}
            <Badge className={getStatusColor(overallStatus)}>
              {overallStatus === "healthy" ? "Sistema Saudável" : 
                overallStatus === "warning" ? "Atenção Necessária" : "Problemas Críticos"}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={refreshMetrics}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
          <Button onClick={exportReport} disabled={isExporting}>
            <Download className={`w-4 h-4 mr-2 ${isExporting ? "animate-pulse" : ""}`} />
            {isExporting ? "Exportando..." : "Exportar"}
          </Button>
        </div>
      </div>

      {/* Alertas Críticos */}
      {systemMetrics.some(m => m.status === "critical") && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Atenção: Métricas críticas detectadas. Verifique o uso de recursos imediatamente.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="resources">Recursos</TabsTrigger>
          <TabsTrigger value="services">Serviços</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Métricas Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {systemMetrics.map((metric, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      {metric.name.includes("CPU") && <Cpu className="w-5 h-5 text-blue-600" />}
                      {metric.name.includes("Memory") && <MemoryStick className="w-5 h-5 text-green-600" />}
                      {metric.name.includes("Disk") && <HardDrive className="w-5 h-5 text-orange-600" />}
                      {metric.name.includes("Network") && <Wifi className="w-5 h-5 text-purple-600" />}
                      {metric.name.includes("Connection") && <Globe className="w-5 h-5 text-cyan-600" />}
                      {metric.name.includes("Database") && <Database className="w-5 h-5 text-red-600" />}
                      <h3 className="font-semibold text-sm">{metric.name}</h3>
                    </div>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(metric.status)}
                      {getTrendIcon(metric.trend)}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">
                        {metric.value.toFixed(1)} {metric.unit}
                      </span>
                    </div>
                    
                    <Progress 
                      value={metric.unit === "%" ? metric.value : (metric.value / metric.threshold.critical) * 100} 
                      className="h-2"
                    />
                    
                    <div className="text-xs text-muted-foreground">
                      Aviso: {metric.threshold.warning}{metric.unit} | 
                      Crítico: {metric.threshold.critical}{metric.unit}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Gráfico de Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Performance do Sistema (Últimas 24h)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="cpu" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="CPU %" />
                  <Area type="monotone" dataKey="memory" stackId="2" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="Memória %" />
                  <Area type="monotone" dataKey="network" stackId="3" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} name="Rede MB/s" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Uso de CPU</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-blue-600">45%</p>
                    <p className="text-sm text-muted-foreground">Uso atual</p>
                  </div>
                  <Progress value={45} className="h-3" />
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Pico (24h)</p>
                      <p className="font-semibold">78%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Média (24h)</p>
                      <p className="font-semibold">52%</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Uso de Memória</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-green-600">68%</p>
                    <p className="text-sm text-muted-foreground">8.2 GB / 12 GB</p>
                  </div>
                  <Progress value={68} className="h-3" />
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Disponível</p>
                      <p className="font-semibold">3.8 GB</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Cache</p>
                      <p className="font-semibold">2.1 GB</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Armazenamento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-orange-600">55%</p>
                    <p className="text-sm text-muted-foreground">550 GB / 1 TB</p>
                  </div>
                  <Progress value={55} className="h-3" />
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Livre</p>
                      <p className="font-semibold">450 GB</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Taxa I/O</p>
                      <p className="font-semibold">125 MB/s</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rede</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-purple-600">23</p>
                    <p className="text-sm text-muted-foreground">MB/s</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Upload</p>
                      <p className="font-semibold">12 MB/s</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Download</p>
                      <p className="font-semibold">11 MB/s</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Latência</p>
                      <p className="font-semibold">15ms</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Packet Loss</p>
                      <p className="font-semibold">0.01%</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="services" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">{service.name}</h3>
                    <Badge className={getStatusColor(service.status)}>
                      {service.status}
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Uptime</span>
                      <span className="font-semibold">{service.uptime}%</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span>Tempo de Resposta</span>
                      <span className="font-semibold">{service.responseTime}ms</span>
                    </div>
                    
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Última Verificação</span>
                      <span>{service.lastCheck.toLocaleTimeString()}</span>
                    </div>
                    
                    <Progress value={service.uptime} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tempo de Resposta dos Serviços</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={responseTimeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="api" stroke="#3b82f6" strokeWidth={2} name="API (ms)" />
                  <Line type="monotone" dataKey="database" stroke="#10b981" strokeWidth={2} name="Database (ms)" />
                  <Line type="monotone" dataKey="web" stroke="#f59e0b" strokeWidth={2} name="Web Server (ms)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Configuração de Alertas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Configure thresholds para receber alertas automáticos quando métricas críticas forem atingidas.
                </p>
                <Button>
                  <Shield className="w-4 h-4 mr-2" />
                  Configurar Alertas
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemPerformanceMonitor;