import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  Lock, 
  Database, 
  Activity, 
  AlertTriangle,
  CheckCircle,
  Server,
  HardDrive,
  Cpu,
  MemoryStick,
  Network,
  Clock,
  TrendingUp,
  TrendingDown,
  Zap
} from "lucide-react";

interface SystemMetric {
  name: string;
  current: number;
  target: number;
  unit: string;
  status: "healthy" | "warning" | "critical";
  trend: "up" | "down" | "stable";
}

interface SecurityEvent {
  id: string;
  type: "login" | "access" | "security" | "system";
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  timestamp: string;
  resolved: boolean;
}

export const SystemHealthDashboard = () => {
  const [metrics, setMetrics] = useState<SystemMetric[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [systemLoad, setSystemLoad] = useState(67);

  useEffect(() => {
    setMetrics([
      { name: "CPU Usage", current: 45, target: 80, unit: "%", status: "healthy", trend: "stable" },
      { name: "Memory Usage", current: 72, target: 85, unit: "%", status: "healthy", trend: "up" },
      { name: "Disk Usage", current: 83, target: 90, unit: "%", status: "warning", trend: "up" },
      { name: "Network I/O", current: 234, target: 1000, unit: "MB/s", status: "healthy", trend: "down" },
      { name: "Active Sessions", current: 1247, target: 2000, unit: "", status: "healthy", trend: "up" },
      { name: "Response Time", current: 127, target: 200, unit: "ms", status: "healthy", trend: "stable" }
    ]);

    setSecurityEvents([
      {
        id: "1",
        type: "security",
        severity: "medium",
        message: "Tentativa de login com credenciais inválidas detectada",
        timestamp: "2 min atrás",
        resolved: false
      },
      {
        id: "2",
        type: "access",
        severity: "low",
        message: "Novo dispositivo conectado ao sistema",
        timestamp: "15 min atrás",
        resolved: true
      },
      {
        id: "3",
        type: "system",
        severity: "high",
        message: "Uso elevado de CPU detectado no servidor web",
        timestamp: "1 hora atrás",
        resolved: true
      },
      {
        id: "4",
        type: "login",
        severity: "low",
        message: "Login bem-sucedido de administrador",
        timestamp: "2 horas atrás",
        resolved: true
      }
    ]);

    // Simulate real-time updates
    const interval = setInterval(() => {
      setSystemLoad(prev => Math.max(30, Math.min(95, prev + (Math.random() - 0.5) * 10)));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
    case "healthy": return "text-success";
    case "warning": return "text-warning";
    case "critical": return "text-destructive";
    default: return "text-muted-foreground";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
    case "healthy": return "bg-success/10 text-success border-success/20";
    case "warning": return "bg-warning/10 text-warning border-warning/20";
    case "critical": return "bg-destructive/10 text-destructive border-destructive/20";
    default: return "bg-muted/10 text-muted-foreground border-muted/20";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
    case "low": return "bg-blue-100 text-blue-700";
    case "medium": return "bg-yellow-100 text-yellow-700";
    case "high": return "bg-orange-100 text-orange-700";
    case "critical": return "bg-red-100 text-red-700";
    default: return "bg-secondary text-secondary-foreground";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
    case "up": return <TrendingUp className="h-3 w-3 text-green-500" />;
    case "down": return <TrendingDown className="h-3 w-3 text-red-500" />;
    default: return <Activity className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const getMetricIcon = (name: string) => {
    switch (name.toLowerCase()) {
    case "cpu usage": return <Cpu className="h-4 w-4" />;
    case "memory usage": return <MemoryStick className="h-4 w-4" />;
    case "disk usage": return <HardDrive className="h-4 w-4" />;
    case "network i/o": return <Network className="h-4 w-4" />;
    case "active sessions": return <Activity className="h-4 w-4" />;
    case "response time": return <Clock className="h-4 w-4" />;
    default: return <Server className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Sistema & Segurança</h2>
          <p className="text-muted-foreground">Monitoramento em tempo real da infraestrutura</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Shield className="h-4 w-4 mr-2" />
            Relatório de Segurança
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-effect">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4 text-success" />
              Sistema Seguro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">99.8%</div>
            <p className="text-xs text-muted-foreground">Nível de proteção</p>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Lock className="h-4 w-4 text-warning" />
              Autenticação MFA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">87%</div>
            <p className="text-xs text-muted-foreground">Usuários protegidos</p>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Database className="h-4 w-4 text-primary" />
              Backup Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">100%</div>
            <p className="text-xs text-muted-foreground">Dados seguros</p>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Zap className="h-4 w-4 text-info" />
              Uptime
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-info">99.99%</div>
            <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="metrics" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="metrics">Métricas do Sistema</TabsTrigger>
          <TabsTrigger value="security">Eventos de Segurança</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoramento</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics.map((metric, index) => (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      {getMetricIcon(metric.name)}
                      {metric.name}
                    </div>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(metric.trend)}
                      <Badge className={getStatusBadgeColor(metric.status)}>
                        {metric.status}
                      </Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-end gap-2">
                    <span className={`text-2xl font-bold ${getStatusColor(metric.status)}`}>
                      {metric.current}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {metric.unit}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Atual</span>
                      <span>Meta: {metric.target}{metric.unit}</span>
                    </div>
                    <Progress 
                      value={(metric.current / metric.target) * 100} 
                      className="h-2" 
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <div className="space-y-3">
            {securityEvents.map((event) => (
              <Card key={event.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        event.resolved ? "bg-success/10" : "bg-warning/10"
                      }`}>
                        {event.resolved ? (
                          <CheckCircle className="h-4 w-4 text-success" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-warning" />
                        )}
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{event.message}</p>
                          <Badge className={getSeverityColor(event.severity)}>
                            {event.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {event.type} • {event.timestamp}
                        </p>
                      </div>
                    </div>
                    
                    {!event.resolved && (
                      <Button variant="outline" size="sm">
                        Resolver
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Carga do Sistema</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center space-y-2">
                  <div className="text-4xl font-bold">{systemLoad}%</div>
                  <Progress value={systemLoad} className="h-3" />
                  <p className="text-sm text-muted-foreground">
                    Carga média dos últimos 5 minutos
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estatísticas de Acesso</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">1,247</div>
                    <p className="text-sm text-muted-foreground">Sessões Ativas</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">45</div>
                    <p className="text-sm text-muted-foreground">Usuários Online</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">127ms</div>
                    <p className="text-sm text-muted-foreground">Tempo Resposta</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">99.99%</div>
                    <p className="text-sm text-muted-foreground">Disponibilidade</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};