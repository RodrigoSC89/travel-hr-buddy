/**
 * System Performance Panel - Painel de Performance do Sistema
 * Monitoramento de recursos, uptime e integrações
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Activity, Server, Cpu, HardDrive, Wifi, 
  Clock, CheckCircle2, AlertTriangle, XCircle,
  RefreshCw, Settings, BarChart3, Zap, Globe,
  Database, Cloud, Shield, Users, TrendingUp
} from "lucide-react";

interface SystemMetric {
  name: string;
  value: number;
  unit: string;
  status: "healthy" | "warning" | "critical";
  trend: "up" | "down" | "stable";
}

interface Integration {
  id: string;
  name: string;
  type: string;
  status: "connected" | "disconnected" | "error" | "syncing";
  lastSync: string;
  latency: number;
}

const systemMetrics: SystemMetric[] = [
  { name: "CPU", value: 42, unit: "%", status: "healthy", trend: "stable" },
  { name: "Memória", value: 68, unit: "%", status: "healthy", trend: "up" },
  { name: "Disco", value: 55, unit: "%", status: "healthy", trend: "up" },
  { name: "Rede", value: 12, unit: "Mbps", status: "healthy", trend: "stable" },
  { name: "Latência", value: 45, unit: "ms", status: "healthy", trend: "down" },
  { name: "Uptime", value: 99.97, unit: "%", status: "healthy", trend: "stable" },
];

const integrations: Integration[] = [
  { id: "1", name: "Supabase", type: "Database", status: "connected", lastSync: "Agora", latency: 23 },
  { id: "2", name: "OpenAI GPT-4", type: "AI", status: "connected", lastSync: "1min", latency: 450 },
  { id: "3", name: "Mapbox", type: "Maps", status: "connected", lastSync: "30s", latency: 89 },
  { id: "4", name: "Open-Meteo", type: "Weather", status: "connected", lastSync: "5min", latency: 156 },
  { id: "5", name: "AIS Feed", type: "Tracking", status: "syncing", lastSync: "Sync...", latency: 234 },
  { id: "6", name: "Stripe", type: "Payments", status: "connected", lastSync: "10min", latency: 67 },
];

const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case "connected":
      return <CheckCircle2 className="h-4 w-4 text-success" />;
    case "disconnected":
      return <XCircle className="h-4 w-4 text-muted-foreground" />;
    case "error":
      return <AlertTriangle className="h-4 w-4 text-destructive" />;
    case "syncing":
      return <RefreshCw className="h-4 w-4 text-primary animate-spin" />;
    default:
      return <Activity className="h-4 w-4" />;
  }
};

export default function SystemPerformancePanel() {
  const [activeUsers, setActiveUsers] = useState(47);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveUsers(prev => prev + Math.floor(Math.random() * 5) - 2);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const healthyIntegrations = integrations.filter(i => i.status === "connected").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Server className="h-6 w-6 text-primary" />
            Performance do Sistema
          </h2>
          <p className="text-muted-foreground">
            Monitoramento de recursos e integrações em tempo real
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-success/10 text-success">
            <Activity className="h-3 w-3 mr-1 animate-pulse" />
            Sistema Operacional
          </Badge>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Uptime</p>
                <p className="text-2xl font-bold text-success">99.97%</p>
              </div>
              <Clock className="h-8 w-8 text-success opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Usuários Ativos</p>
                <p className="text-2xl font-bold text-primary">{activeUsers}</p>
              </div>
              <Users className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Integrações</p>
                <p className="text-2xl font-bold text-purple-500">{healthyIntegrations}/{integrations.length}</p>
              </div>
              <Cloud className="h-8 w-8 text-purple-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Requisições/min</p>
                <p className="text-2xl font-bold text-orange-500">1,247</p>
              </div>
              <Zap className="h-8 w-8 text-orange-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Metrics */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Métricas do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            {systemMetrics.map((metric) => (
              <div key={metric.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{metric.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">
                      {metric.value}{metric.unit}
                    </span>
                    <TrendingUp className={`h-4 w-4 ${
                      metric.trend === "up" ? "text-success" :
                      metric.trend === "down" ? "text-destructive rotate-180" :
                      "text-muted-foreground"
                    }`} />
                  </div>
                </div>
                <Progress 
                  value={metric.name === "Latência" ? 100 - (metric.value / 2) : metric.value} 
                  className={`h-2 ${
                    metric.status === "healthy" ? "[&>div]:bg-success" :
                    metric.status === "warning" ? "[&>div]:bg-warning" :
                    "[&>div]:bg-destructive"
                  }`}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Integrations */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                Integrações Externas
              </CardTitle>
              <CardDescription>
                Status das conexões com serviços externos
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Gerenciar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {integrations.map((integration) => (
              <div
                key={integration.id}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div className="flex items-center gap-3">
                  <StatusIcon status={integration.status} />
                  <div>
                    <p className="font-medium text-sm">{integration.name}</p>
                    <p className="text-xs text-muted-foreground">{integration.type}</p>
                  </div>
                </div>
                <div className="text-right text-xs">
                  <p className="text-muted-foreground">Latência: {integration.latency}ms</p>
                  <p className="text-muted-foreground">Sync: {integration.lastSync}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security & Database */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-500" />
              Segurança
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Firewall</span>
              <Badge variant="default">Ativo</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">SSL/TLS</span>
              <Badge variant="default">Válido</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">RLS Policies</span>
              <Badge variant="default">21 Tabelas</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Última Auditoria</span>
              <span className="text-sm text-muted-foreground">Hoje, 14:32</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-500" />
              Banco de Dados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Conexões Ativas</span>
              <span className="font-medium">23/100</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Tamanho</span>
              <span className="font-medium">2.4 GB</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Último Backup</span>
              <span className="text-sm text-muted-foreground">Há 2 horas</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Replicação</span>
              <Badge variant="default">Sincronizado</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
