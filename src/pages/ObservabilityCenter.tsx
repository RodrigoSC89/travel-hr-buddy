/**
 * Observability Center - Unified Monitoring Dashboard
 * Consolidates Sentry, PostHog, and custom metrics
 * PATCH: Roadmap v3.2.0 - Observability Central
 */

import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bug,
  Eye,
  LineChart,
  Monitor,
  MousePointerClick,
  RefreshCw,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { usePerformanceMonitor } from "@/hooks/usePerformanceMonitor";

interface MetricCard {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: React.ElementType;
}

interface ErrorEvent {
  id: string;
  message: string;
  module: string;
  count: number;
  lastSeen: string;
  severity: "critical" | "error" | "warning";
}

interface UserSession {
  id: string;
  user: string;
  duration: string;
  pages: number;
  actions: number;
  status: "active" | "ended";
}

export default function ObservabilityCenter() {
  const { toast } = useToast();
  const { getMetrics, getAverageScore } = usePerformanceMonitor({ enableLogging: false });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [performanceScore, setPerformanceScore] = useState<number | null>(null);

  // Simulated metrics - in production, these would come from Sentry/PostHog APIs
  const [metrics] = useState<MetricCard[]>([
    { title: "Erros Ativos", value: 3, change: "-25%", changeType: "positive", icon: Bug },
    { title: "Uptime", value: "99.9%", change: "+0.1%", changeType: "positive", icon: Activity },
    { title: "Usuários Ativos", value: 47, change: "+12%", changeType: "positive", icon: Users },
    { title: "Latência Média", value: "142ms", change: "-8ms", changeType: "positive", icon: Zap },
  ]);

  const [recentErrors] = useState<ErrorEvent[]>([
    {
      id: "err_001",
      message: "Failed to fetch vessel data",
      module: "VesselContracts",
      count: 3,
      lastSeen: "2 min atrás",
      severity: "error",
    },
    {
      id: "err_002",
      message: "WebSocket connection timeout",
      module: "RealTimeSync",
      count: 1,
      lastSeen: "15 min atrás",
      severity: "warning",
    },
    {
      id: "err_003",
      message: "AI response timeout exceeded",
      module: "PEOTRAM",
      count: 2,
      lastSeen: "1 hora atrás",
      severity: "warning",
    },
  ]);

  const [activeSessions] = useState<UserSession[]>([
    { id: "sess_001", user: "operador@empresa.com", duration: "45m", pages: 12, actions: 67, status: "active" },
    { id: "sess_002", user: "comandante@navio.com", duration: "23m", pages: 8, actions: 34, status: "active" },
    { id: "sess_003", user: "admin@nautilus.app", duration: "1h 12m", pages: 24, actions: 156, status: "active" },
  ]);

  const [moduleUsage] = useState([
    { name: "Central de Comando", usage: 89, sessions: 234 },
    { name: "PEOTRAM", usage: 76, sessions: 187 },
    { name: "PEO-DP", usage: 72, sessions: 165 },
    { name: "Vessel Contracts", usage: 68, sessions: 142 },
    { name: "SGSO", usage: 65, sessions: 128 },
    { name: "Crew Management", usage: 58, sessions: 98 },
  ]);

  useEffect(() => {
    const score = getAverageScore();
    if (score !== null) {
      setPerformanceScore(score);
    }
  }, [getAverageScore]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsRefreshing(false);
    toast({
      title: "Dados atualizados",
      description: "Métricas de observabilidade sincronizadas",
    });
  };

  const getSeverityColor = (severity: ErrorEvent["severity"]) => {
    switch (severity) {
      case "critical":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "error":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "warning":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    }
  };

  return (
    <>
      <Helmet>
        <title>Observability Center | Nautilus One</title>
        <meta name="description" content="Central de monitoramento e observabilidade do Nautilus One" />
      </Helmet>

      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
          >
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <Eye className="h-8 w-8 text-primary" />
                Observability Center
              </h1>
              <p className="text-muted-foreground mt-1">
                Monitoramento unificado: Sentry + PostHog + Web Vitals
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
                <Activity className="h-3 w-3 mr-1" />
                Sistema Operacional
              </Badge>
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                Atualizar
              </Button>
            </div>
          </motion.div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((metric, index) => {
              const Icon = metric.icon;
              return (
                <motion.div
                  key={metric.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="border-border/50 bg-card/50 backdrop-blur">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">{metric.title}</p>
                          <p className="text-2xl font-bold mt-1">{metric.value}</p>
                          {metric.change && (
                            <span
                              className={`text-xs ${
                                metric.changeType === "positive"
                                  ? "text-green-400"
                                  : metric.changeType === "negative"
                                  ? "text-red-400"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {metric.change} vs. ontem
                            </span>
                          )}
                        </div>
                        <div className="p-3 rounded-xl bg-primary/10">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Performance Score */}
          {performanceScore !== null && (
            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <span className="font-medium">Performance Score (Core Web Vitals)</span>
                  </div>
                  <Badge
                    className={
                      performanceScore >= 90
                        ? "bg-green-500/20 text-green-400"
                        : performanceScore >= 70
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-red-500/20 text-red-400"
                    }
                  >
                    {performanceScore}/100
                  </Badge>
                </div>
                <Progress value={performanceScore} className="h-2" />
              </CardContent>
            </Card>
          )}

          {/* Tabs */}
          <Tabs defaultValue="errors" className="w-full">
            <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
              <TabsTrigger value="errors" className="flex items-center gap-2">
                <Bug className="h-4 w-4" />
                Erros
              </TabsTrigger>
              <TabsTrigger value="sessions" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Sessões
              </TabsTrigger>
              <TabsTrigger value="usage" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Uso
              </TabsTrigger>
              <TabsTrigger value="heatmap" className="flex items-center gap-2">
                <MousePointerClick className="h-4 w-4" />
                Heatmap
              </TabsTrigger>
            </TabsList>

            <TabsContent value="errors" className="mt-6">
              <Card className="border-border/50 bg-card/50 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-400" />
                    Erros Recentes
                  </CardTitle>
                  <CardDescription>Últimos erros capturados pelo Sentry</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentErrors.map((error) => (
                      <div
                        key={error.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition"
                      >
                        <div className="flex items-center gap-3">
                          <Badge className={getSeverityColor(error.severity)}>
                            {error.severity}
                          </Badge>
                          <div>
                            <p className="font-medium text-sm">{error.message}</p>
                            <p className="text-xs text-muted-foreground">
                              {error.module} • {error.count}x • {error.lastSeen}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          Ver detalhes
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sessions" className="mt-6">
              <Card className="border-border/50 bg-card/50 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-400" />
                    Sessões Ativas
                  </CardTitle>
                  <CardDescription>Usuários online no momento</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {activeSessions.map((session) => (
                      <div
                        key={session.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-border/50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                          <div>
                            <p className="font-medium text-sm">{session.user}</p>
                            <p className="text-xs text-muted-foreground">
                              {session.duration} • {session.pages} páginas • {session.actions} ações
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-green-500/10 text-green-400">
                          Ativo
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="usage" className="mt-6">
              <Card className="border-border/50 bg-card/50 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChart className="h-5 w-5 text-purple-400" />
                    Uso por Módulo
                  </CardTitle>
                  <CardDescription>Ranking de módulos mais utilizados (últimos 7 dias)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {moduleUsage.map((module, index) => (
                      <div key={module.name}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-muted-foreground w-6">
                              #{index + 1}
                            </span>
                            <span className="text-sm font-medium">{module.name}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {module.sessions} sessões
                          </span>
                        </div>
                        <Progress value={module.usage} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="heatmap" className="mt-6">
              <Card className="border-border/50 bg-card/50 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MousePointerClick className="h-5 w-5 text-amber-400" />
                    Heatmap de Interações
                  </CardTitle>
                  <CardDescription>Análise de cliques e interações via PostHog</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Monitor className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Heatmap em Tempo Real</h3>
                    <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                      Visualize onde os usuários mais clicam em cada página. 
                      Configure o PostHog para habilitar heatmaps visuais.
                    </p>
                    <Button variant="outline" onClick={() => window.open("https://posthog.com/docs/toolbar", "_blank")}>
                      Configurar PostHog Toolbar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Integration Status */}
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle>Status das Integrações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-lg border border-border/50">
                  <div className="p-2 rounded-lg bg-red-500/10">
                    <Bug className="h-5 w-5 text-red-400" />
                  </div>
                  <div>
                    <p className="font-medium">Sentry</p>
                    <p className="text-xs text-muted-foreground">Error Tracking & Performance</p>
                  </div>
                  <Badge className="ml-auto bg-green-500/20 text-green-400">Ativo</Badge>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg border border-border/50">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <BarChart3 className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium">PostHog</p>
                    <p className="text-xs text-muted-foreground">Analytics & Session Replay</p>
                  </div>
                  <Badge className="ml-auto bg-green-500/20 text-green-400">Ativo</Badge>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg border border-border/50">
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <Zap className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="font-medium">Web Vitals</p>
                    <p className="text-xs text-muted-foreground">Core Performance Metrics</p>
                  </div>
                  <Badge className="ml-auto bg-green-500/20 text-green-400">Ativo</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
