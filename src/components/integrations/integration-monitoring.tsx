import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Zap,
  Clock,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Gauge,
  RefreshCw,
  Download,
} from "lucide-react";

interface MetricData {
  name: string;
  value: number;
  change: number;
  trend: "up" | "down" | "stable";
  status: "good" | "warning" | "critical";
}

interface PerformanceMetric {
  integration: string;
  responseTime: number;
  successRate: number;
  requestCount: number;
  errorRate: number;
  uptime: number;
}

export const IntegrationMonitoring: React.FC = () => {
  const [metrics, setMetrics] = useState<MetricData[]>([
    {
      name: "Requisições Totais",
      value: 12847,
      change: 8.2,
      trend: "up",
      status: "good",
    },
    {
      name: "Taxa de Sucesso",
      value: 98.7,
      change: -0.3,
      trend: "down",
      status: "warning",
    },
    {
      name: "Tempo de Resposta",
      value: 245,
      change: -12.4,
      trend: "down",
      status: "good",
    },
    {
      name: "Uptime Médio",
      value: 99.2,
      change: 0.5,
      trend: "up",
      status: "good",
    },
  ]);

  const [performanceData, setPerformanceData] = useState<PerformanceMetric[]>([
    {
      integration: "Supabase Database",
      responseTime: 120,
      successRate: 99.8,
      requestCount: 4521,
      errorRate: 0.2,
      uptime: 99.9,
    },
    {
      integration: "Nautilus AI Analytics",
      responseTime: 340,
      successRate: 97.2,
      requestCount: 1243,
      errorRate: 2.8,
      uptime: 97.1,
    },
    {
      integration: "WhatsApp Business",
      responseTime: 560,
      successRate: 94.5,
      requestCount: 892,
      errorRate: 5.5,
      uptime: 94.8,
    },
    {
      integration: "Microsoft Outlook",
      responseTime: 280,
      successRate: 96.7,
      requestCount: 524,
      errorRate: 3.3,
      uptime: 96.2,
    },
  ]);

  const [realTimeData, setRealTimeData] = useState({
    activeConnections: 24,
    requestsPerMinute: 156,
    averageLatency: 245,
    errorCount: 3,
  });

  // Simular dados em tempo real
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeData(prev => ({
        activeConnections: Math.max(15, prev.activeConnections + Math.floor(Math.random() * 6 - 3)),
        requestsPerMinute: Math.max(
          100,
          prev.requestsPerMinute + Math.floor(Math.random() * 20 - 10)
        ),
        averageLatency: Math.max(150, prev.averageLatency + Math.floor(Math.random() * 50 - 25)),
        errorCount: Math.max(0, prev.errorCount + Math.floor(Math.random() * 3 - 1)),
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: MetricData["status"]) => {
    switch (status) {
    case "good":
      return "text-success";
    case "warning":
      return "text-warning";
    case "critical":
      return "text-destructive";
    }
  };

  const getTrendIcon = (trend: MetricData["trend"]) => {
    switch (trend) {
    case "up":
      return <TrendingUp className="w-4 h-4 text-success" />;
    case "down":
      return <TrendingDown className="w-4 h-4 text-destructive" />;
    default:
      return <Activity className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getPerformanceScore = (metric: PerformanceMetric) => {
    const responseScore = Math.max(0, 100 - metric.responseTime / 10);
    const successScore = metric.successRate;
    const uptimeScore = metric.uptime;

    return Math.round((responseScore + successScore + uptimeScore) / 3);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-0 bg-gradient-to-br from-primary/5 via-background to-nautical/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                <Activity className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl text-foreground">
                  Monitoramento de Integrações
                </CardTitle>
                <CardDescription>
                  Acompanhe a performance e saúde das suas integrações em tempo real
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Atualizar
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index} className="border border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">{metric.name}</p>
                {getTrendIcon(metric.trend)}
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className={`text-2xl font-bold ${getStatusColor(metric.status)}`}>
                    {metric.name.includes("Tempo")
                      ? `${metric.value}ms`
                      : metric.name.includes("Taxa") || metric.name.includes("Uptime")
                        ? `${metric.value}%`
                        : metric.value.toLocaleString()}
                  </p>
                  <p
                    className={`text-xs ${metric.change >= 0 ? "text-success" : "text-destructive"}`}
                  >
                    {metric.change >= 0 ? "+" : ""}
                    {metric.change}% vs. período anterior
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dados em Tempo Real */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Zap className="w-5 h-5 text-primary" />
              Dados em Tempo Real
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground">Conexões Ativas</p>
                <p className="text-2xl font-bold text-primary">{realTimeData.activeConnections}</p>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground">Req/min</p>
                <p className="text-2xl font-bold text-success">{realTimeData.requestsPerMinute}</p>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground">Latência Média</p>
                <p className="text-2xl font-bold text-nautical">{realTimeData.averageLatency}ms</p>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground">Erros</p>
                <p className="text-2xl font-bold text-destructive">{realTimeData.errorCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Gauge className="w-5 h-5 text-primary" />
              Health Score Geral
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div className="relative w-32 h-32 mx-auto">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="54"
                    stroke="hsl(var(--muted))"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="54"
                    stroke="hsl(var(--success))"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${94 * 3.39} 339.29`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-success">94%</p>
                    <p className="text-xs text-muted-foreground">Saúde</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Excelente</span>
                  <CheckCircle className="w-4 h-4 text-success" />
                </div>
                <p className="text-xs text-muted-foreground">
                  Todas as integrações operando dentro dos parâmetros normais
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance por Integração */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <BarChart3 className="w-5 h-5 text-primary" />
            Performance por Integração
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {performanceData.map((integration, index) => (
              <div key={index} className="p-4 border border-border/50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <h4 className="font-medium text-foreground">{integration.integration}</h4>
                    <Badge
                      className={
                        getPerformanceScore(integration) >= 90
                          ? "bg-success/20 text-success border-success/30"
                          : getPerformanceScore(integration) >= 70
                            ? "bg-warning/20 text-warning border-warning/30"
                            : "bg-destructive/20 text-destructive border-destructive/30"
                      }
                    >
                      Score: {getPerformanceScore(integration)}%
                    </Badge>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <p>{integration.requestCount.toLocaleString()} requisições</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Tempo Resposta</p>
                    <p className="font-medium text-foreground">{integration.responseTime}ms</p>
                    <Progress
                      value={Math.max(0, 100 - integration.responseTime / 10)}
                      className="h-1 mt-1"
                    />
                  </div>

                  <div>
                    <p className="text-muted-foreground">Taxa Sucesso</p>
                    <p className="font-medium text-foreground">{integration.successRate}%</p>
                    <Progress value={integration.successRate} className="h-1 mt-1" />
                  </div>

                  <div>
                    <p className="text-muted-foreground">Taxa Erro</p>
                    <p className="font-medium text-foreground">{integration.errorRate}%</p>
                    <Progress value={100 - integration.errorRate} className="h-1 mt-1" />
                  </div>

                  <div>
                    <p className="text-muted-foreground">Uptime</p>
                    <p className="font-medium text-foreground">{integration.uptime}%</p>
                    <Progress value={integration.uptime} className="h-1 mt-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alertas e Notificações */}
      <Card className="border-warning/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-warning">
            <AlertTriangle className="w-5 h-5" />
            Alertas Ativos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-warning/5 border border-warning/20 rounded-lg">
              <Clock className="w-4 h-4 text-warning" />
              <div className="flex-1">
                <p className="font-medium text-foreground">Latência Elevada</p>
                <p className="text-sm text-muted-foreground">
                  WhatsApp Business API apresenta tempo de resposta 40% acima do normal
                </p>
              </div>
              <Badge variant="outline" className="text-xs">
                5min atrás
              </Badge>
            </div>

            <div className="flex items-center gap-3 p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <div className="flex-1">
                <p className="font-medium text-foreground">Taxa de Erro Alta</p>
                <p className="text-sm text-muted-foreground">
                  Stripe Payment registrou 12 erros nos últimos 15 minutos
                </p>
              </div>
              <Badge variant="outline" className="text-xs">
                2min atrás
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
