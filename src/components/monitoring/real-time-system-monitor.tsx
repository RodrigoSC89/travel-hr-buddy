import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Zap, 
  Clock, 
  TrendingUp, 
  Activity,
  Users,
  Database,
  Globe,
  Cpu,
  HardDrive,
  Wifi,
  AlertTriangle,
  CheckCircle,
  ArrowUp,
  ArrowDown
} from "lucide-react";

interface MetricData {
  label: string;
  value: number;
  unit: string;
  trend: number;
  status: "good" | "warning" | "critical";
}

export const RealTimeSystemMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<MetricData[]>([
    {
      label: "CPU Usage",
      value: 45.2,
      unit: "%",
      trend: -2.1,
      status: "good"
    },
    {
      label: "Memory Usage",
      value: 67.8,
      unit: "%",
      trend: 1.5,
      status: "warning"
    },
    {
      label: "Network I/O",
      value: 234.5,
      unit: "MB/s",
      trend: 12.3,
      status: "good"
    },
    {
      label: "Disk Usage",
      value: 78.9,
      unit: "%",
      trend: 0.8,
      status: "warning"
    },
    {
      label: "Active Users",
      value: 1247,
      unit: "",
      trend: 8.2,
      status: "good"
    },
    {
      label: "Response Time",
      value: 245,
      unit: "ms",
      trend: -15.6,
      status: "good"
    }
  ]);

  const [alerts] = useState([
    {
      id: "1",
      type: "warning",
      message: "Alto uso de memória detectado",
      timestamp: "2 minutos atrás",
      component: "Sistema"
    },
    {
      id: "2",
      type: "info",
      message: "Backup automático completado",
      timestamp: "15 minutos atrás",
      component: "Database"
    },
    {
      id: "3",
      type: "critical",
      message: "Falha na sincronização de dados",
      timestamp: "1 hora atrás",
      component: "Sync Service"
    }
  ]);

  const [systemHealth] = useState({
    overall: 87,
    api: 95,
    database: 92,
    storage: 78,
    network: 88,
    cache: 94
  });

  // Simular atualizações em tempo real
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prevMetrics => 
        prevMetrics.map(metric => ({
          ...metric,
          value: metric.value + (Math.random() - 0.5) * 5,
          trend: (Math.random() - 0.5) * 20
        }))
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
    case "good": return "text-green-500";
    case "warning": return "text-yellow-500";
    case "critical": return "text-red-500";
    default: return "text-muted-foreground";
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
    case "critical": return "border-red-200 bg-red-50 dark:bg-red-900/20";
    case "warning": return "border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20";
    case "info": return "border-blue-200 bg-blue-50 dark:bg-blue-900/20";
    default: return "border-gray-200 bg-gray-50 dark:bg-gray-900/20";
    }
  };

  const getHealthColor = (health: number) => {
    if (health >= 90) return "text-green-500";
    if (health >= 70) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Activity className="w-6 h-6 text-primary" />
          <h1 className="text-3xl font-bold">Monitoramento em Tempo Real</h1>
          <Badge variant="secondary" className="animate-pulse">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            LIVE
          </Badge>
        </div>
        <p className="text-muted-foreground">
          Dashboard completo de monitoramento de sistema e performance
        </p>
      </div>

      {/* System Health Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Saúde Geral do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center">
              <div className={`text-3xl font-bold ${getHealthColor(systemHealth.overall)}`}>
                {systemHealth.overall}%
              </div>
              <p className="text-sm text-muted-foreground">Geral</p>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getHealthColor(systemHealth.api)}`}>
                {systemHealth.api}%
              </div>
              <p className="text-sm text-muted-foreground">API</p>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getHealthColor(systemHealth.database)}`}>
                {systemHealth.database}%
              </div>
              <p className="text-sm text-muted-foreground">Database</p>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getHealthColor(systemHealth.storage)}`}>
                {systemHealth.storage}%
              </div>
              <p className="text-sm text-muted-foreground">Storage</p>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getHealthColor(systemHealth.network)}`}>
                {systemHealth.network}%
              </div>
              <p className="text-sm text-muted-foreground">Network</p>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getHealthColor(systemHealth.cache)}`}>
                {systemHealth.cache}%
              </div>
              <p className="text-sm text-muted-foreground">Cache</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {metric.label === "CPU Usage" && <Cpu className="w-5 h-5 text-blue-500" />}
                  {metric.label === "Memory Usage" && <HardDrive className="w-5 h-5 text-purple-500" />}
                  {metric.label === "Network I/O" && <Wifi className="w-5 h-5 text-green-500" />}
                  {metric.label === "Disk Usage" && <Database className="w-5 h-5 text-orange-500" />}
                  {metric.label === "Active Users" && <Users className="w-5 h-5 text-pink-500" />}
                  {metric.label === "Response Time" && <Clock className="w-5 h-5 text-indigo-500" />}
                  <span className="font-medium">{metric.label}</span>
                </div>
                <div className={`flex items-center gap-1 text-sm ${
                  metric.trend > 0 ? "text-green-500" : "text-red-500"
                }`}>
                  {metric.trend > 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                  {Math.abs(metric.trend).toFixed(1)}%
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-2xl font-bold ${getStatusColor(metric.status)}`}>
                    {metric.value.toFixed(1)}{metric.unit}
                  </span>
                  <Badge 
                    variant={metric.status === "good" ? "default" : 
                      metric.status === "warning" ? "secondary" : "destructive"}
                  >
                    {metric.status === "good" ? "OK" : 
                      metric.status === "warning" ? "Atenção" : "Crítico"}
                  </Badge>
                </div>
                
                {metric.label.includes("Usage") && (
                  <Progress 
                    value={metric.value} 
                    className={`h-2 ${metric.status === "critical" ? "bg-red-100" : 
                      metric.status === "warning" ? "bg-yellow-100" : "bg-green-100"}`}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              Alertas Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div key={alert.id} className={`p-3 border rounded-lg ${getAlertColor(alert.type)}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{alert.message}</span>
                    <Badge variant="outline" className="text-xs">
                      {alert.component}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{alert.timestamp}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              Performance Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
              <div className="text-center">
                <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Gráfico de performance em tempo real</p>
                <p className="text-sm text-muted-foreground">Dados atualizados a cada 3 segundos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" size="sm">
              <Zap className="w-4 h-4 mr-2" />
              Reiniciar Serviços
            </Button>
            <Button variant="outline" size="sm">
              <Database className="w-4 h-4 mr-2" />
              Otimizar Database
            </Button>
            <Button variant="outline" size="sm">
              <HardDrive className="w-4 h-4 mr-2" />
              Limpar Cache
            </Button>
            <Button variant="outline" size="sm">
              <Activity className="w-4 h-4 mr-2" />
              Gerar Relatório
            </Button>
            <Button variant="outline" size="sm">
              <Globe className="w-4 h-4 mr-2" />
              Testar Conectividade
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};