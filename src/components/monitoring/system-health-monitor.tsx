import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  Activity,
  Cpu,
  HardDrive,
  Wifi,
  Database,
  Server,
  Globe,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  BarChart3,
  RefreshCw
} from "lucide-react";

interface SystemMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  database: number;
  activeUsers: number;
  responseTime: number;
  uptime: string;
  lastUpdate: Date;
}

interface SystemAlert {
  id: string;
  type: "warning" | "error" | "info";
  message: string;
  timestamp: Date;
}

export const SystemHealthMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const loadSystemMetrics = async () => {
    setIsLoading(true);
    try {
      // Simulate real system metrics
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newMetrics: SystemMetrics = {
        cpu: Math.floor(Math.random() * 100),
        memory: Math.floor(Math.random() * 100),
        disk: Math.floor(Math.random() * 100),
        network: Math.floor(Math.random() * 100),
        database: Math.floor(Math.random() * 100),
        activeUsers: Math.floor(Math.random() * 150) + 50,
        responseTime: Math.floor(Math.random() * 500) + 100,
        uptime: "15d 8h 42m",
        lastUpdate: new Date()
      };

      setMetrics(newMetrics);

      // Generate alerts based on metrics
      const newAlerts: SystemAlert[] = [];
      
      if (newMetrics.cpu > 80) {
        newAlerts.push({
          id: Date.now().toString(),
          type: "warning",
          message: `Alto uso de CPU: ${newMetrics.cpu}%`,
          timestamp: new Date()
        });
      }

      if (newMetrics.memory > 85) {
        newAlerts.push({
          id: (Date.now() + 1).toString(),
          type: "error",
          message: `Memória crítica: ${newMetrics.memory}%`,
          timestamp: new Date()
        });
      }

      if (newMetrics.responseTime > 400) {
        newAlerts.push({
          id: (Date.now() + 2).toString(),
          type: "warning",
          message: `Tempo de resposta alto: ${newMetrics.responseTime}ms`,
          timestamp: new Date()
        });
      }

      setAlerts(newAlerts);

      toast({
        title: "Métricas Atualizadas",
        description: "Sistema monitorado com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao carregar métricas do sistema",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSystemMetrics();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadSystemMetrics, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (value: number) => {
    if (value < 50) return "text-green-600";
    if (value < 80) return "text-yellow-600";
    return "text-red-600";
  };

  const getProgressColor = (value: number) => {
    if (value < 50) return "bg-green-500";
    if (value < 80) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
    case "error": return <AlertTriangle className="w-4 h-4 text-red-500" />;
    case "warning": return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    default: return <CheckCircle className="w-4 h-4 text-blue-500" />;
    }
  };

  if (!metrics) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <Activity className="w-12 h-12 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">Carregando métricas do sistema...</p>
            <Button onClick={loadSystemMetrics} disabled={isLoading}>
              {isLoading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Carregar Métricas
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Monitor de Sistema</h2>
          <p className="text-muted-foreground">
            Monitoramento em tempo real da saúde do sistema
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Online
          </Badge>
          <span className="text-sm text-muted-foreground">
            Atualizado: {metrics.lastUpdate.toLocaleTimeString("pt-BR")}
          </span>
          <Button onClick={loadSystemMetrics} disabled={isLoading} variant="outline">
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* System Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Cpu className="w-4 h-4 text-primary" />
              CPU
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getStatusColor(metrics.cpu)}`}>
              {metrics.cpu}%
            </div>
            <Progress 
              value={metrics.cpu} 
              className="mt-2"
              style={{ "--progress-foreground": getProgressColor(metrics.cpu) } as unknown}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Processamento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <HardDrive className="w-4 h-4 text-info" />
              Memória
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getStatusColor(metrics.memory)}`}>
              {metrics.memory}%
            </div>
            <Progress 
              value={metrics.memory} 
              className="mt-2"
              style={{ "--progress-foreground": getProgressColor(metrics.memory) } as unknown}
            />
            <p className="text-xs text-muted-foreground mt-1">
              RAM em uso
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Database className="w-4 h-4 text-warning" />
              Banco de Dados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getStatusColor(metrics.database)}`}>
              {metrics.database}%
            </div>
            <Progress 
              value={metrics.database} 
              className="mt-2"
              style={{ "--progress-foreground": getProgressColor(metrics.database) } as unknown}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Conexões ativas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Wifi className="w-4 h-4 text-success" />
              Rede
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getStatusColor(metrics.network)}`}>
              {metrics.network}%
            </div>
            <Progress 
              value={metrics.network} 
              className="mt-2"
              style={{ "--progress-foreground": getProgressColor(metrics.network) } as unknown}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Banda utilizada
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Globe className="w-4 h-4 text-primary" />
              Usuários Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {metrics.activeUsers}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Conectados agora
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Zap className="w-4 h-4 text-warning" />
              Tempo de Resposta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${metrics.responseTime > 400 ? "text-red-600" : metrics.responseTime > 200 ? "text-yellow-600" : "text-green-600"}`}>
              {metrics.responseTime}ms
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Média das requisições
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Clock className="w-4 h-4 text-success" />
              Uptime
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {metrics.uptime}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Sistema ativo
            </p>
          </CardContent>
        </Card>
      </div>

      {/* System Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              Alertas do Sistema
              <Badge variant="destructive">{alerts.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center gap-3 p-3 border rounded-lg"
                >
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <p className="text-sm font-medium">{alert.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {alert.timestamp.toLocaleTimeString("pt-BR")}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    Resolver
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SystemHealthMonitor;