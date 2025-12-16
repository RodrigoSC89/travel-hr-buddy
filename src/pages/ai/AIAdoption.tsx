/**
 * PATCH 653.1 - AI Adoption Metrics Page
 * Complete AI adoption scorecard and metrics with simulated data
 */

import React, { useState, useEffect, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  TrendingUp, 
  Brain, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  BarChart3,
  Users,
  Zap,
  Target,
  Activity,
  RefreshCw,
  Download,
  Calendar,
  ArrowUp,
  ArrowDown,
  Minus
} from "lucide-react";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useToast } from "@/hooks/use-toast";

// Simulated adoption data
const generateAdoptionData = () => ({
  overview: {
    acceptanceRate: 78,
    totalSuggestions: 1247,
    avgResponseTime: 245,
    successRate: 94,
    activeUsers: 89,
    totalInteractions: 3856,
    previousAcceptanceRate: 72,
    previousSuccessRate: 91,
  },
  modules: [
    { name: "Manutenção Preditiva", interactions: 456, accepted: 387, rejected: 69, avgTime: 180, trend: "up" },
    { name: "Compliance", interactions: 342, accepted: 298, rejected: 44, avgTime: 220, trend: "up" },
    { name: "Gestão de Tripulação", interactions: 289, accepted: 231, rejected: 58, avgTime: 195, trend: "stable" },
    { name: "Rotas Marítimas", interactions: 234, accepted: 187, rejected: 47, avgTime: 310, trend: "up" },
    { name: "Documentação", interactions: 198, accepted: 158, rejected: 40, avgTime: 150, trend: "down" },
    { name: "Segurança", interactions: 167, accepted: 150, rejected: 17, avgTime: 280, trend: "up" },
  ],
  timeline: [
    { date: "Jan", interactions: 450, accepted: 360, rate: 80 },
    { date: "Fev", interactions: 520, accepted: 390, rate: 75 },
    { date: "Mar", interactions: 580, accepted: 464, rate: 80 },
    { date: "Abr", interactions: 620, accepted: 527, rate: 85 },
    { date: "Mai", interactions: 680, accepted: 544, rate: 80 },
    { date: "Jun", interactions: 750, accepted: 638, rate: 85 },
  ],
  userAdoption: [
    { department: "Operações", users: 32, activeUsers: 28, adoptionRate: 87 },
    { department: "Manutenção", users: 24, activeUsers: 22, adoptionRate: 92 },
    { department: "Compliance", users: 18, activeUsers: 15, adoptionRate: 83 },
    { department: "RH", users: 12, activeUsers: 9, adoptionRate: 75 },
    { department: "Segurança", users: 15, activeUsers: 12, adoptionRate: 80 },
  ],
  recentActivity: [
    { id: "1", type: "accepted", module: "MMI", description: "Sugestão de manutenção preventiva aceita", timestamp: new Date(Date.now() - 1000 * 60 * 5) },
    { id: "2", type: "rejected", module: "Compliance", description: "Ajuste de prazo rejeitado pelo usuário", timestamp: new Date(Date.now() - 1000 * 60 * 15) },
    { id: "3", type: "accepted", module: "Tripulação", description: "Reatribuição de tarefas aceita", timestamp: new Date(Date.now() - 1000 * 60 * 30) },
    { id: "4", type: "accepted", module: "Rotas", description: "Otimização de rota implementada", timestamp: new Date(Date.now() - 1000 * 60 * 45) },
    { id: "5", type: "accepted", module: "Segurança", description: "Alerta de segurança processado", timestamp: new Date(Date.now() - 1000 * 60 * 60) },
  ],
  insights: [
    { title: "Alta adoção em Manutenção", description: "O módulo MMI tem a maior taxa de aceitação (85%)", type: "positive" },
    { title: "Tempo de resposta otimizado", description: "Redução de 15% no tempo médio de resposta este mês", type: "positive" },
    { title: "Documentação precisa atenção", description: "Taxa de rejeição acima da média no módulo de Documentação", type: "warning" },
  ]
});

const COLORS = ["#22c55e", "#ef4444", "#3b82f6", "#f59e0b", "#8b5cf6", "#ec4899"];

export default function AIAdoption() {
  const [data, setData] = useState(generateAdoptionData());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [period, setPeriod] = useState("30d");
  const { toast } = useToast();

  const refreshData = useCallback(async () => {
    setIsRefreshing(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate new random variations
    const newData = generateAdoptionData();
    newData.overview.acceptanceRate = Math.min(100, Math.max(60, data.overview.acceptanceRate + (Math.random() * 10 - 5)));
    newData.overview.totalSuggestions += Math.floor(Math.random() * 50);
    newData.overview.totalInteractions += Math.floor(Math.random() * 100);
    
    setData(newData);
    setIsRefreshing(false);
    
    toast({
      title: "Dados atualizados",
      description: "Métricas de adoção atualizadas com sucesso"
    });
  }, [data, toast]);

  const getAdoptionLevel = (rate: number) => {
    if (rate >= 80) return { label: "Alto", color: "bg-green-500/20 text-green-500" };
    if (rate >= 60) return { label: "Médio", color: "bg-yellow-500/20 text-yellow-500" };
    return { label: "Baixo", color: "bg-red-500/20 text-red-500" };
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return <ArrowUp className="h-4 w-4 text-green-500" />;
      case "down": return <ArrowDown className="h-4 w-4 text-red-500" />;
      default: return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const adoptionLevel = getAdoptionLevel(data.overview.acceptanceRate);

  return (
    <>
      <Helmet>
        <title>Métricas de Adoção IA | Nautilus One</title>
        <meta name="description" content="Scorecard e métricas de adoção do sistema de IA" />
      </Helmet>

      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-primary" />
              Métricas de Adoção de IA
            </h1>
            <p className="text-muted-foreground mt-1">
              Acompanhe a adoção e efetividade do sistema de IA
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Últimos 7 dias</SelectItem>
                <SelectItem value="30d">Últimos 30 dias</SelectItem>
                <SelectItem value="90d">Últimos 90 dias</SelectItem>
                <SelectItem value="1y">Último ano</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={refreshData} disabled={isRefreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              Atualizar
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Taxa de Aceitação</p>
                  <p className="text-3xl font-bold text-primary">{Math.round(data.overview.acceptanceRate)}%</p>
                  <div className="flex items-center gap-1 mt-1">
                    {data.overview.acceptanceRate > data.overview.previousAcceptanceRate ? (
                      <ArrowUp className="h-3 w-3 text-green-500" />
                    ) : (
                      <ArrowDown className="h-3 w-3 text-red-500" />
                    )}
                    <span className="text-xs text-muted-foreground">
                      vs {data.overview.previousAcceptanceRate}% anterior
                    </span>
                  </div>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total de Sugestões</p>
                  <p className="text-3xl font-bold">{data.overview.totalSuggestions.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {data.overview.totalInteractions.toLocaleString()} interações
                  </p>
                </div>
                <Brain className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tempo Médio</p>
                  <p className="text-3xl font-bold">{data.overview.avgResponseTime}ms</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Resposta do sistema
                  </p>
                </div>
                <Clock className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Taxa de Sucesso</p>
                  <p className="text-3xl font-bold text-green-500">{data.overview.successRate}%</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Users className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {data.overview.activeUsers} usuários ativos
                    </span>
                  </div>
                </div>
                <BarChart3 className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Adoption Score */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Adoção de IA
                </CardTitle>
                <Badge className={adoptionLevel.color}>
                  <Zap className="h-3 w-3 mr-1" />
                  {adoptionLevel.label}
                </Badge>
              </div>
              <CardDescription>Métricas dos últimos 30 dias</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Main Score */}
              <div className="text-center py-4">
                <p className="text-6xl font-bold text-primary">{Math.round(data.overview.acceptanceRate)}%</p>
                <p className="text-muted-foreground mt-2">Score de Adoção</p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span className="text-2xl font-bold">{data.overview.totalInteractions.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Interações</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-2xl font-bold">{data.overview.avgResponseTime}ms</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Tempo Médio</p>
                </div>
                <div className="p-3 rounded-lg bg-green-500/10">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-2xl font-bold text-green-500">
                      {Math.round(data.overview.totalSuggestions * data.overview.acceptanceRate / 100)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Aceitas</p>
                </div>
                <div className="p-3 rounded-lg bg-red-500/10">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    <span className="text-2xl font-bold text-red-500">
                      {Math.round(data.overview.totalSuggestions * (100 - data.overview.acceptanceRate) / 100)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Rejeitadas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Module Usage */}
          <Card>
            <CardHeader>
              <CardTitle>Uso por Módulo</CardTitle>
              <CardDescription>Operações de IA por módulo do sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-4">
                  {data.modules.map((module, index) => {
                    const rate = Math.round((module.accepted / module.interactions) * 100);
                    return (
                      <div key={module.name} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{module.name}</span>
                            {getTrendIcon(module.trend)}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">{module.interactions} ops</span>
                            <Badge variant="outline" className="text-xs">
                              {rate}%
                            </Badge>
                          </div>
                        </div>
                        <Progress value={rate} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Timeline Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Evolução da Adoção</CardTitle>
              <CardDescription>Tendência de interações e aceitação ao longo do tempo</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={data.timeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="interactions" 
                    name="Interações" 
                    stroke="hsl(var(--primary))" 
                    fill="hsl(var(--primary)/0.2)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="accepted" 
                    name="Aceitas" 
                    stroke="#22c55e" 
                    fill="rgba(34, 197, 94, 0.2)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Department Adoption */}
          <Card>
            <CardHeader>
              <CardTitle>Adoção por Departamento</CardTitle>
              <CardDescription>Taxa de adoção em cada departamento</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data.userAdoption} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis dataKey="department" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} width={100} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }}
                  />
                  <Bar dataKey="adoptionRate" name="Taxa de Adoção" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Atividade Recente
              </CardTitle>
              <CardDescription>Últimas interações com sugestões de IA</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[200px]">
                <div className="space-y-3">
                  {data.recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                      {activity.type === "accepted" ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{activity.description}</p>
                          <Badge variant="outline" className="text-xs">{activity.module}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {activity.timestamp.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Insights
              </CardTitle>
              <CardDescription>Análises automáticas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.insights.map((insight, index) => (
                  <div 
                    key={index} 
                    className={`p-3 rounded-lg border ${
                      insight.type === "positive" 
                        ? "bg-green-500/5 border-green-500/20" 
                        : "bg-yellow-500/5 border-yellow-500/20"
                    }`}
                  >
                    <p className="text-sm font-medium">{insight.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{insight.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Resumo de Sugestões</CardTitle>
            <CardDescription>Estatísticas das sugestões geradas pela IA</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-green-500/10 text-center">
                <CheckCircle2 className="h-8 w-8 mx-auto text-green-500 mb-2" />
                <p className="text-2xl font-bold text-green-500">
                  {Math.round(data.overview.totalSuggestions * data.overview.acceptanceRate / 100)}
                </p>
                <p className="text-xs text-muted-foreground">Aceitas</p>
              </div>

              <div className="p-4 rounded-lg bg-red-500/10 text-center">
                <XCircle className="h-8 w-8 mx-auto text-red-500 mb-2" />
                <p className="text-2xl font-bold text-red-500">
                  {Math.round(data.overview.totalSuggestions * (100 - data.overview.acceptanceRate) / 100)}
                </p>
                <p className="text-xs text-muted-foreground">Rejeitadas</p>
              </div>

              <div className="p-4 rounded-lg bg-blue-500/10 text-center">
                <Brain className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                <p className="text-2xl font-bold text-blue-500">{data.overview.totalInteractions.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Operações IA</p>
              </div>

              <div className="p-4 rounded-lg bg-purple-500/10 text-center">
                <TrendingUp className="h-8 w-8 mx-auto text-purple-500 mb-2" />
                <p className="text-2xl font-bold text-purple-500">{Math.round(data.overview.acceptanceRate)}%</p>
                <p className="text-xs text-muted-foreground">Taxa Adoção</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
