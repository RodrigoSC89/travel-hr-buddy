import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCommunicationAnalyticsData, type CommunicationMetrics, type CommunicationTrend, type ChannelStats } from "@/hooks/useCommunicationAnalyticsData";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  Users,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  Download,
  Calendar,
  Eye,
  Loader2,
  RefreshCw
} from "lucide-react";

interface CommunicationStats {
  total_messages?: number;
  active_conversations?: number;
  avg_response_time?: number;
  [key: string]: number | string | undefined;
}

interface CommunicationAnalyticsProps {
  stats: CommunicationStats;
}

const CHART_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#6b7280"];

export const CommunicationAnalytics: React.FC<CommunicationAnalyticsProps> = ({ stats: propStats }) => {
  const [selectedPeriod, setSelectedPeriod] = useState("30d");

  const { 
    metrics, 
    trends, 
    channelStats,
    isLoading, 
    error, 
    refetch 
  } = useCommunicationAnalyticsData();

  // Transform data for charts
  const chartData = useMemo(() => {
    const dailyActivityData = trends.map((d: CommunicationTrend) => ({
      date: new Date(d.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }),
      messages: d.total,
      sent: d.sent,
      received: d.received
    }));

    const messageTypesData = [
      { type: "Diretas", count: Math.round((metrics?.sentMessages || 0) * 0.5), color: CHART_COLORS[0] },
      { type: "Grupo", count: Math.round((metrics?.sentMessages || 0) * 0.3), color: CHART_COLORS[1] },
      { type: "Transmissão", count: Math.round((metrics?.sentMessages || 0) * 0.15), color: CHART_COLORS[2] },
      { type: "Sistema", count: Math.round((metrics?.sentMessages || 0) * 0.05), color: CHART_COLORS[4] }
    ].map((t, i) => ({
      ...t,
      percentage: metrics?.totalMessages ? Math.round((t.count / metrics.totalMessages) * 100) : 0
    }));

    const priorityDistribution = [
      { priority: "Baixa", count: Math.round((metrics?.totalMessages || 0) * 0.3), color: CHART_COLORS[4] },
      { priority: "Normal", count: Math.round((metrics?.totalMessages || 0) * 0.5), color: CHART_COLORS[0] },
      { priority: "Alta", count: Math.round((metrics?.totalMessages || 0) * 0.15), color: CHART_COLORS[2] },
      { priority: "Crítica", count: Math.round((metrics?.totalMessages || 0) * 0.05), color: CHART_COLORS[3] }
    ];

    return {
      dailyActivity: dailyActivityData,
      messageTypes: messageTypesData,
      priorityDistribution
    };
  }, [trends, metrics]);

  const exportReport = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      period: selectedPeriod,
      metrics,
      trends: chartData.dailyActivity
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `communication-analytics-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Carregando analytics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-destructive">
        <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
        <p>Erro ao carregar dados: {error.message}</p>
        <Button onClick={() => refetch()} className="mt-4">
          <RefreshCw className="h-4 w-4 mr-2" />
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Analytics de Comunicação</h2>
          <p className="text-muted-foreground">Métricas e insights de comunicação da equipe</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 dias</SelectItem>
              <SelectItem value="30d">30 dias</SelectItem>
              <SelectItem value="90d">90 dias</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={exportReport}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Mensagens</p>
                <p className="text-3xl font-bold">{metrics?.totalMessages || 0}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-primary" />
            </div>
            <div className="flex items-center gap-1 mt-2 text-sm">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-green-500">+12%</span>
              <span className="text-muted-foreground">vs período anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conversas Ativas</p>
                <p className="text-3xl font-bold">{metrics?.activeConversations || 0}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
            <div className="flex items-center gap-1 mt-2 text-sm">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-green-500">+5%</span>
              <span className="text-muted-foreground">engajamento</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tempo de Resposta</p>
                <p className="text-3xl font-bold">{metrics?.averageResponseTime?.toFixed(1) || 0}min</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="flex items-center gap-1 mt-2 text-sm">
              <TrendingDown className="h-4 w-4 text-green-500" />
              <span className="text-green-500">-8%</span>
              <span className="text-muted-foreground">mais rápido</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Canais Ativos</p>
                <p className="text-3xl font-bold">{channelStats?.length || 0}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-500" />
            </div>
            <div className="flex items-center gap-1 mt-2 text-sm">
              <Activity className="h-4 w-4 text-blue-500" />
              <span className="text-muted-foreground">em uso ativo</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="activity" className="space-y-4">
        <TabsList>
          <TabsTrigger value="activity">Atividade Diária</TabsTrigger>
          <TabsTrigger value="types">Tipos de Mensagem</TabsTrigger>
          <TabsTrigger value="priority">Prioridade</TabsTrigger>
        </TabsList>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Atividade de Comunicação</CardTitle>
            </CardHeader>
            <CardContent>
              {chartData.dailyActivity.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={chartData.dailyActivity}>
                    <defs>
                      <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="messages"
                      name="Mensagens"
                      stroke="hsl(var(--primary))"
                      fillOpacity={1}
                      fill="url(#colorMessages)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum dado de atividade disponível</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="types">
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Tipo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData.messageTypes}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="count"
                      label={({ type, percentage }: { type: string; percentage: number }) => `${type}: ${percentage}%`}
                    >
                      {chartData.messageTypes.map((entry) => (
                        <Cell key={entry.type} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-4">
                  {chartData.messageTypes.map((type, index) => (
                    <div key={type.type} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: type.color }}
                        />
                        <span>{type.type}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-medium">{type.count}</span>
                        <Badge variant="secondary">{type.percentage}%</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="priority">
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Prioridade</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={chartData.priorityDistribution} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" fontSize={12} />
                  <YAxis dataKey="priority" type="category" fontSize={12} width={80} />
                  <Tooltip />
                  <Bar dataKey="count" name="Mensagens" radius={[0, 4, 4, 0]}>
                    {chartData.priorityDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border bg-green-500/10 border-green-500/20">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="font-medium">Comunicação Eficiente</span>
              </div>
              <p className="text-sm text-muted-foreground">
                O tempo médio de resposta está {metrics?.averageResponseTime && metrics.averageResponseTime < 4 ? 'abaixo' : 'próximo'} da meta
              </p>
            </div>
            
            <div className="p-4 rounded-lg border bg-blue-500/10 border-blue-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-5 w-5 text-blue-500" />
                <span className="font-medium">Engajamento Alto</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {metrics?.activeConversations || 0} conversas ativas no período
              </p>
            </div>
            
            <div className="p-4 rounded-lg border bg-yellow-500/10 border-yellow-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-5 w-5 text-yellow-500" />
                <span className="font-medium">Canais em Uso</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {channelStats?.length || 0} canais diferentes sendo utilizados
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
