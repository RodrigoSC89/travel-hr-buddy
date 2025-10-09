import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  Activity,
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Wifi,
  Database,
  Shield,
} from "lucide-react";

interface SystemMetric {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  status: "good" | "warning" | "critical";
  trend: "up" | "down" | "stable";
  icon: React.ComponentType<any>;
}

interface SystemAlert {
  id: string;
  type: "info" | "warning" | "error";
  title: string;
  message: string;
  timestamp: string;
}

export const FunctionalSystemDashboard: React.FC = () => {
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<SystemMetric[]>([
    {
      id: "cpu",
      name: "CPU",
      value: 45,
      target: 80,
      unit: "%",
      status: "good",
      trend: "stable",
      icon: Activity,
    },
    {
      id: "memory",
      name: "Memória",
      value: 62,
      target: 85,
      unit: "%",
      status: "good",
      trend: "up",
      icon: Database,
    },
    {
      id: "users",
      name: "Usuários Ativos",
      value: 847,
      target: 1000,
      unit: "",
      status: "good",
      trend: "up",
      icon: Users,
    },
    {
      id: "response",
      name: "Tempo Resposta",
      value: 240,
      target: 500,
      unit: "ms",
      status: "good",
      trend: "down",
      icon: Zap,
    },
    {
      id: "uptime",
      name: "Uptime",
      value: 99.8,
      target: 99.5,
      unit: "%",
      status: "good",
      trend: "stable",
      icon: CheckCircle,
    },
    {
      id: "security",
      name: "Score Segurança",
      value: 96,
      target: 95,
      unit: "/100",
      status: "good",
      trend: "stable",
      icon: Shield,
    },
  ]);

  const [alerts, setAlerts] = useState<SystemAlert[]>([
    {
      id: "1",
      type: "info",
      title: "Sistema Atualizado",
      message: "Nova versão 2.1.4 instalada com sucesso",
      timestamp: "2024-01-15T10:30:00Z",
    },
    {
      id: "2",
      type: "warning",
      title: "Backup Agendado",
      message: "Backup automático será executado em 2 horas",
      timestamp: "2024-01-15T09:15:00Z",
    },
  ]);

  const [systemStatus, setSystemStatus] = useState<"operational" | "degraded" | "maintenance">(
    "operational"
  );

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setMetrics(prev =>
        prev.map(metric => ({
          ...metric,
          value: metric.value + (Math.random() - 0.5) * 2,
        }))
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: SystemMetric["status"]) => {
    switch (status) {
      case "good":
        return "text-green-600";
      case "warning":
        return "text-yellow-600";
      case "critical":
        return "text-red-600";
    }
  };

  const getProgressColor = (status: SystemMetric["status"]) => {
    switch (status) {
      case "good":
        return "bg-green-500";
      case "warning":
        return "bg-yellow-500";
      case "critical":
        return "bg-red-500";
    }
  };

  const getTrendIcon = (trend: SystemMetric["trend"]) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-3 w-3 text-green-500" />;
      case "down":
        return <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />;
      case "stable":
        return <div className="w-3 h-0.5 bg-gray-400 rounded" />;
    }
  };

  const getAlertIcon = (type: SystemAlert["type"]) => {
    switch (type) {
      case "info":
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
  };

  const runSystemCheck = () => {
    toast({
      title: "Verificação Iniciada",
      description: "Executando verificação completa do sistema...",
    });

    setTimeout(() => {
      toast({
        title: "Verificação Concluída",
        description: "Sistema operando normalmente. Nenhum problema detectado.",
      });
    }, 2000);
  };

  const getSystemStatusBadge = () => {
    switch (systemStatus) {
      case "operational":
        return <Badge className="bg-green-100 text-green-800">Operacional</Badge>;
      case "degraded":
        return <Badge variant="destructive">Degradado</Badge>;
      case "maintenance":
        return <Badge variant="secondary">Manutenção</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sistema</h1>
          <div className="flex items-center gap-2 mt-2">
            <p className="text-muted-foreground">Status do sistema:</p>
            {getSystemStatusBadge()}
          </div>
        </div>
        <Button onClick={runSystemCheck}>
          <Activity className="h-4 w-4 mr-2" />
          Verificar Sistema
        </Button>
      </div>

      {/* System Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {metrics.map(metric => {
          const IconComponent = metric.icon;
          const percentage = (metric.value / metric.target) * 100;

          return (
            <Card key={metric.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <IconComponent className={`h-4 w-4 ${getStatusColor(metric.status)}`} />
                      <span className="text-sm font-medium">{metric.name}</span>
                      {getTrendIcon(metric.trend)}
                    </div>
                    <div className="space-y-1">
                      <p className="text-2xl font-bold">
                        {metric.value.toFixed(metric.unit === "%" ? 1 : 0)}
                        {metric.unit}
                      </p>
                      <Progress value={Math.min(percentage, 100)} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        Meta: {metric.target}
                        {metric.unit}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* System Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Alertas do Sistema
          </CardTitle>
          <CardDescription>Notificações e eventos importantes do sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alerts.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum alerta ativo</h3>
                <p className="text-muted-foreground">Sistema operando normalmente</p>
              </div>
            ) : (
              alerts.map(alert => (
                <div key={alert.id} className="flex items-start gap-4 p-4 border rounded-lg">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1 space-y-1">
                    <h4 className="font-medium">{alert.title}</h4>
                    <p className="text-sm text-muted-foreground">{alert.message}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {new Date(alert.timestamp).toLocaleString("pt-BR")}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>Ferramentas de diagnóstico e manutenção</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-auto p-4 flex-col gap-2">
              <Database className="h-6 w-6" />
              <span className="text-sm">Backup</span>
            </Button>

            <Button variant="outline" className="h-auto p-4 flex-col gap-2">
              <Wifi className="h-6 w-6" />
              <span className="text-sm">Conectividade</span>
            </Button>

            <Button variant="outline" className="h-auto p-4 flex-col gap-2">
              <Shield className="h-6 w-6" />
              <span className="text-sm">Segurança</span>
            </Button>

            <Button variant="outline" className="h-auto p-4 flex-col gap-2">
              <Activity className="h-6 w-6" />
              <span className="text-sm">Performance</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
