import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
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
  AreaChart,
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
  Filter,
  Eye,
} from "lucide-react";

interface CommunicationAnalyticsProps {
  stats: any;
}

interface AnalyticsData {
  dailyActivity: Array<{
    date: string;
    messages: number;
    channels: number;
    users: number;
  }>;
  messageTypes: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
  responseTimeData: Array<{
    period: string;
    avgResponseTime: number;
    targetTime: number;
  }>;
  userEngagement: Array<{
    department: string;
    activeUsers: number;
    totalUsers: number;
    engagementRate: number;
  }>;
  priorityDistribution: Array<{
    priority: string;
    count: number;
    color: string;
  }>;
  communicationTrends: Array<{
    month: string;
    internal: number;
    external: number;
    emergency: number;
  }>;
}

const COLORS = {
  primary: "#3b82f6",
  success: "#10b981",
  warning: "#f59e0b",
  destructive: "#ef4444",
  muted: "#6b7280",
};

export const CommunicationAnalytics: React.FC<CommunicationAnalyticsProps> = ({ stats }) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("30d");
  const [selectedDepartment, setSelectedDepartment] = useState("all");

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedPeriod, selectedDepartment]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);

      // Mock analytics data - replace with real data fetching
      const mockData: AnalyticsData = {
        dailyActivity: [
          { date: "2024-01-15", messages: 45, channels: 8, users: 23 },
          { date: "2024-01-16", messages: 52, channels: 9, users: 28 },
          { date: "2024-01-17", messages: 38, channels: 7, users: 19 },
          { date: "2024-01-18", messages: 61, channels: 10, users: 32 },
          { date: "2024-01-19", messages: 47, channels: 8, users: 25 },
          { date: "2024-01-20", messages: 55, channels: 9, users: 29 },
          { date: "2024-01-21", messages: 43, channels: 8, users: 22 },
        ],
        messageTypes: [
          { type: "Mensagens Diretas", count: 156, percentage: 42 },
          { type: "Canais de Grupo", count: 134, percentage: 36 },
          { type: "Transmissões", count: 48, percentage: 13 },
          { type: "Emergência", count: 18, percentage: 5 },
          { type: "Sistema/IA", count: 15, percentage: 4 },
        ],
        responseTimeData: [
          { period: "Seg", avgResponseTime: 2.3, targetTime: 4 },
          { period: "Ter", avgResponseTime: 1.8, targetTime: 4 },
          { period: "Qua", avgResponseTime: 3.1, targetTime: 4 },
          { period: "Qui", avgResponseTime: 2.7, targetTime: 4 },
          { period: "Sex", avgResponseTime: 2.1, targetTime: 4 },
          { period: "Sáb", avgResponseTime: 4.2, targetTime: 4 },
          { period: "Dom", avgResponseTime: 5.1, targetTime: 4 },
        ],
        userEngagement: [
          { department: "RH", activeUsers: 12, totalUsers: 15, engagementRate: 80 },
          { department: "Operações", activeUsers: 28, totalUsers: 34, engagementRate: 82 },
          { department: "Engenharia", activeUsers: 18, totalUsers: 25, engagementRate: 72 },
          { department: "Deck", activeUsers: 22, totalUsers: 30, engagementRate: 73 },
          { department: "Administração", activeUsers: 8, totalUsers: 12, engagementRate: 67 },
        ],
        priorityDistribution: [
          { priority: "Baixa", count: 89, color: COLORS.muted },
          { priority: "Normal", count: 156, color: COLORS.primary },
          { priority: "Alta", count: 45, color: COLORS.warning },
          { priority: "Crítica", count: 12, color: COLORS.destructive },
        ],
        communicationTrends: [
          { month: "Set", internal: 234, external: 45, emergency: 3 },
          { month: "Out", internal: 267, external: 52, emergency: 7 },
          { month: "Nov", internal: 298, external: 48, emergency: 2 },
          { month: "Dez", internal: 312, external: 61, emergency: 8 },
          { month: "Jan", internal: 345, external: 58, emergency: 5 },
        ],
      };

      setAnalyticsData(mockData);
    } catch (error) {
      console.error("Error loading analytics data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTrend = (data: number[]): { value: number; isPositive: boolean } => {
    if (data.length < 2) return { value: 0, isPositive: true };
    const current = data[data.length - 1];
    const previous = data[data.length - 2];
    const change = ((current - previous) / previous) * 100;
    return { value: Math.abs(change), isPositive: change >= 0 };
  };

  const exportReport = () => {
    // Mock report export
    const reportData = {
      period: selectedPeriod,
      department: selectedDepartment,
      stats,
      analyticsData,
      generatedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `communication-analytics-${selectedPeriod}-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading || !analyticsData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const messageTrend = calculateTrend(analyticsData.dailyActivity.map(d => d.messages));
  const userTrend = calculateTrend(analyticsData.dailyActivity.map(d => d.users));

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Análise de Comunicação
            </CardTitle>
            <div className="flex items-center gap-2">
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Departamentos</SelectItem>
                  <SelectItem value="hr">RH</SelectItem>
                  <SelectItem value="operations">Operações</SelectItem>
                  <SelectItem value="engineering">Engenharia</SelectItem>
                  <SelectItem value="deck">Deck</SelectItem>
                  <SelectItem value="admin">Administração</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">7 dias</SelectItem>
                  <SelectItem value="30d">30 dias</SelectItem>
                  <SelectItem value="90d">90 dias</SelectItem>
                  <SelectItem value="1y">1 ano</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={exportReport}>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Mensagens Totais</p>
                <p className="text-2xl font-bold">{stats.totalMessages.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-1">
                  {messageTrend.isPositive ? (
                    <TrendingUp className="h-3 w-3 text-success" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-destructive" />
                  )}
                  <span
                    className={`text-xs ${messageTrend.isPositive ? "text-success" : "text-destructive"}`}
                  >
                    {messageTrend.value.toFixed(1)}%
                  </span>
                </div>
              </div>
              <MessageSquare className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Usuários Ativos</p>
                <p className="text-2xl font-bold">89</p>
                <div className="flex items-center gap-1 mt-1">
                  {userTrend.isPositive ? (
                    <TrendingUp className="h-3 w-3 text-success" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-destructive" />
                  )}
                  <span
                    className={`text-xs ${userTrend.isPositive ? "text-success" : "text-destructive"}`}
                  >
                    {userTrend.value.toFixed(1)}%
                  </span>
                </div>
              </div>
              <Users className="h-8 w-8 text-info" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Resposta</p>
                <p className="text-2xl font-bold">{stats.responseRate}%</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-success" />
                  <span className="text-xs text-success">2.3%</span>
                </div>
              </div>
              <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tempo Médio Resposta</p>
                <p className="text-2xl font-bold">2.4h</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingDown className="h-3 w-3 text-success" />
                  <span className="text-xs text-success">15.2%</span>
                </div>
              </div>
              <Clock className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="activity">
        <TabsList>
          <TabsTrigger value="activity">Atividade</TabsTrigger>
          <TabsTrigger value="engagement">Engajamento</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* Activity Tab */}
        <TabsContent value="activity" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Atividade Diária</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analyticsData.dailyActivity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={date =>
                        new Date(date).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                        })
                      }
                    />
                    <YAxis />
                    <Tooltip
                      labelFormatter={date => new Date(date).toLocaleDateString("pt-BR")}
                      formatter={(value, name) => [
                        value,
                        name === "messages"
                          ? "Mensagens"
                          : name === "users"
                            ? "Usuários"
                            : "Canais",
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="messages"
                      stackId="1"
                      stroke={COLORS.primary}
                      fill={COLORS.primary}
                      fillOpacity={0.6}
                    />
                    <Area
                      type="monotone"
                      dataKey="users"
                      stackId="2"
                      stroke={COLORS.success}
                      fill={COLORS.success}
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Tipo</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analyticsData.messageTypes}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ type, percentage }) => `${type}: ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {analyticsData.messageTypes.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={Object.values(COLORS)[index % Object.values(COLORS).length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={value => [value, "Mensagens"]} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Tendências de Comunicação</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData.communicationTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="internal" fill={COLORS.primary} name="Interna" />
                  <Bar dataKey="external" fill={COLORS.warning} name="Externa" />
                  <Bar dataKey="emergency" fill={COLORS.destructive} name="Emergência" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Engagement Tab */}
        <TabsContent value="engagement" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Engajamento por Departamento</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.userEngagement} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="department" type="category" width={80} />
                    <Tooltip formatter={(value, name) => [value + "%", "Taxa de Engajamento"]} />
                    <Bar dataKey="engagementRate" fill={COLORS.success} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Prioridades</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analyticsData.priorityDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ priority, count }) => `${priority}: ${count}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {analyticsData.priorityDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            {analyticsData.userEngagement.map(dept => (
              <Card key={dept.department}>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{dept.department}</span>
                      <Badge
                        variant={
                          dept.engagementRate >= 80
                            ? "default"
                            : dept.engagementRate >= 70
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {dept.engagementRate}%
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {dept.activeUsers} de {dept.totalUsers} usuários ativos
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${dept.engagementRate}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Tempo de Resposta por Dia da Semana</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analyticsData.responseTimeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis label={{ value: "Horas", angle: -90, position: "insideLeft" }} />
                  <Tooltip
                    formatter={(value, name) => [
                      value + "h",
                      name === "avgResponseTime" ? "Tempo Médio" : "Meta",
                    ]}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="avgResponseTime"
                    stroke={COLORS.primary}
                    strokeWidth={2}
                    name="Tempo Médio"
                  />
                  <Line
                    type="monotone"
                    dataKey="targetTime"
                    stroke={COLORS.destructive}
                    strokeDasharray="5 5"
                    strokeWidth={2}
                    name="Meta"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <Card>
              <CardContent className="p-4 text-center">
                <Activity className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold">2.4h</p>
                <p className="text-sm text-muted-foreground">Tempo Médio de Resposta</p>
                <Badge variant="secondary" className="mt-2">
                  Meta: 4h
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-success" />
                <p className="text-2xl font-bold">95%</p>
                <p className="text-sm text-muted-foreground">Taxa de Resolução</p>
                <Badge variant="default" className="mt-2">
                  Excelente
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-warning" />
                <p className="text-2xl font-bold">3</p>
                <p className="text-sm text-muted-foreground">Mensagens Urgentes</p>
                <Badge variant="warning" className="mt-2">
                  Atenção
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 text-success" />
                <p className="text-2xl font-bold">+12%</p>
                <p className="text-sm text-muted-foreground">Crescimento Mensal</p>
                <Badge variant="default" className="mt-2">
                  Positivo
                </Badge>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Insights Principais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    <span className="font-medium text-success">Excelente Performance</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    A taxa de resposta está 15% acima da meta, indicando alta eficiência na
                    comunicação.
                  </p>
                </div>

                <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                    <span className="font-medium text-warning">Atenção aos Fins de Semana</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    O tempo de resposta aumenta significativamente nos fins de semana. Considere
                    escala de plantão.
                  </p>
                </div>

                <div className="p-3 bg-info/10 border border-info/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-info" />
                    <span className="font-medium text-info">Crescimento Constante</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    O volume de comunicação cresce 12% ao mês, indicando maior engajamento da
                    equipe.
                  </p>
                </div>

                <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-primary" />
                    <span className="font-medium text-primary">Adoção Departamental</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Operações lidera em engajamento (82%), seguido por RH (80%). Engenharia precisa
                    de incentivo.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recomendações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium">Implementar Plantão de Fins de Semana</p>
                      <p className="text-sm text-muted-foreground">
                        Para manter o tempo de resposta dentro da meta mesmo nos fins de semana.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-warning rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium">Treinamento para Engenharia</p>
                      <p className="text-sm text-muted-foreground">
                        Organizar sessão de treinamento para aumentar o engajamento do departamento.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-success rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium">Expandir Canais de Comunicação</p>
                      <p className="text-sm text-muted-foreground">
                        O crescimento sugere necessidade de mais canais especializados.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-info rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium">Automatizar Respostas Comuns</p>
                      <p className="text-sm text-muted-foreground">
                        Implementar IA para respostas automáticas a perguntas frequentes.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Button className="w-full">Gerar Relatório Completo</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
