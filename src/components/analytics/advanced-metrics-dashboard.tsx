import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Target,
  Clock,
  Users,
  Activity,
  Zap,
  Brain,
  Filter,
  Download,
  RefreshCw,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MetricData {
  name: string;
  value: number;
  target?: number;
  trend: number;
  unit: string;
  category: string;
}

interface ChartDataPoint {
  name: string;
  value: number;
  target?: number;
  date: string;
}

interface PerformanceInsight {
  id: string;
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  category: string;
  action?: string;
}

export const AdvancedMetricsDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<MetricData[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [insights, setInsights] = useState<PerformanceInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState("7d");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { user } = useAuth();
  const { toast } = useToast();

  // Sample data for demonstration
  const sampleMetrics: MetricData[] = [
    {
      name: "Eficiência Operacional",
      value: 87,
      target: 90,
      trend: 5.2,
      unit: "%",
      category: "performance",
    },
    {
      name: "Satisfação do Cliente",
      value: 92,
      target: 95,
      trend: 2.1,
      unit: "%",
      category: "customer",
    },
    {
      name: "Tempo de Resposta",
      value: 1.2,
      target: 1.0,
      trend: -8.5,
      unit: "s",
      category: "performance",
    },
    {
      name: "Taxa de Conversão",
      value: 15.8,
      target: 18.0,
      trend: 12.3,
      unit: "%",
      category: "business",
    },
    {
      name: "Produtividade da Equipe",
      value: 94,
      target: 95,
      trend: 3.7,
      unit: "%",
      category: "team",
    },
    {
      name: "Qualidade do Serviço",
      value: 96,
      target: 98,
      trend: 1.5,
      unit: "%",
      category: "quality",
    },
  ];

  const sampleChartData: ChartDataPoint[] = [
    { name: "Seg", value: 85, target: 90, date: "2024-01-01" },
    { name: "Ter", value: 87, target: 90, date: "2024-01-02" },
    { name: "Qua", value: 89, target: 90, date: "2024-01-03" },
    { name: "Qui", value: 92, target: 90, date: "2024-01-04" },
    { name: "Sex", value: 88, target: 90, date: "2024-01-05" },
    { name: "Sáb", value: 90, target: 90, date: "2024-01-06" },
    { name: "Dom", value: 87, target: 90, date: "2024-01-07" },
  ];

  const sampleInsights: PerformanceInsight[] = [
    {
      id: "1",
      title: "Oportunidade de Otimização",
      description: "O tempo de resposta pode ser melhorado em 15% com otimizações no cache",
      impact: "high",
      category: "performance",
      action: "optimize_cache",
    },
    {
      id: "2",
      title: "Tendência Positiva",
      description: "A satisfação do cliente tem crescido consistentemente nas últimas 2 semanas",
      impact: "medium",
      category: "customer",
    },
    {
      id: "3",
      title: "Atenção Necessária",
      description: "A taxa de conversão está 12% abaixo do target este mês",
      impact: "high",
      category: "business",
      action: "review_funnel",
    },
  ];

  const loadMetricsData = useCallback(async () => {
    setIsLoading(true);
    try {
      // In a real implementation, this would fetch from Supabase
      // For now, using sample data
      setTimeout(() => {
        setMetrics(sampleMetrics);
        setChartData(sampleChartData);
        setInsights(sampleInsights);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error loading metrics:", error);
      toast({
        title: "Erro ao carregar métricas",
        description: "Não foi possível carregar os dados das métricas",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadMetricsData();
  }, [selectedTimeRange, selectedCategory, loadMetricsData]);

  const generateReport = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("generate-ai-report", {
        body: {
          type: "metrics_analysis",
          timeRange: selectedTimeRange,
          category: selectedCategory,
          userId: user?.id,
        },
      });

      if (error) throw error;

      toast({
        title: "Relatório gerado",
        description: "O relatório de análise foi gerado com sucesso",
      });
    } catch (error) {
      console.error("Error generating report:", error);
      toast({
        title: "Erro ao gerar relatório",
        description: "Não foi possível gerar o relatório",
        variant: "destructive",
      });
    }
  };

  const getMetricColor = (value: number, target?: number) => {
    if (!target) return "text-foreground";
    const percentage = (value / target) * 100;
    if (percentage >= 95) return "text-green-600";
    if (percentage >= 80) return "text-yellow-600";
    return "text-red-600";
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (trend < 0) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Activity className="w-4 h-4 text-muted-foreground" />;
  };

  const getImpactColor = (impact: PerformanceInsight["impact"]) => {
    switch (impact) {
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
    }
  };

  const filteredMetrics =
    selectedCategory === "all" ? metrics : metrics.filter(m => m.category === selectedCategory);

  const pieChartData = filteredMetrics.map(metric => ({
    name: metric.name,
    value: metric.value,
    color: metric.value >= (metric.target || 80) ? "#10b981" : "#ef4444",
  }));

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Carregando métricas avançadas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dashboard de Métricas Avançadas</h2>
          <p className="text-muted-foreground">Análise completa de performance e insights</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={loadMetricsData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
          <Button onClick={generateReport}>
            <Download className="w-4 h-4 mr-2" />
            Gerar Relatório
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          <select
            value={selectedTimeRange}
            onChange={e => setSelectedTimeRange(e.target.value)}
            className="border rounded px-3 py-1"
          >
            <option value="1d">Último dia</option>
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="90d">Últimos 90 dias</option>
          </select>
        </div>

        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          className="border rounded px-3 py-1"
        >
          <option value="all">Todas as categorias</option>
          <option value="performance">Performance</option>
          <option value="customer">Cliente</option>
          <option value="business">Negócio</option>
          <option value="team">Equipe</option>
          <option value="quality">Qualidade</option>
        </select>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="trends">Tendências</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="comparisons">Comparações</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMetrics.map((metric, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
                  {getTrendIcon(metric.trend)}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    <span className={getMetricColor(metric.value, metric.target)}>
                      {metric.value}
                      {metric.unit}
                    </span>
                  </div>
                  {metric.target && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>
                          Meta: {metric.target}
                          {metric.unit}
                        </span>
                        <span>{Math.round((metric.value / metric.target) * 100)}%</span>
                      </div>
                      <Progress value={(metric.value / metric.target) * 100} className="mt-1" />
                    </div>
                  )}
                  <p
                    className={`text-xs mt-2 flex items-center ${
                      metric.trend > 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {metric.trend > 0 ? "+" : ""}
                    {metric.trend}% vs período anterior
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Tendência Temporal</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
                    <Line type="monotone" dataKey="target" stroke="#82ca9d" strokeDasharray="5 5" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análise de Tendências</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stackId="1"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map(insight => (
              <Card key={insight.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{insight.title}</CardTitle>
                    <Badge variant={getImpactColor(insight.impact)}>
                      {insight.impact === "high"
                        ? "Alto"
                        : insight.impact === "medium"
                          ? "Médio"
                          : "Baixo"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>
                  {insight.action && (
                    <Button variant="outline" size="sm">
                      <Zap className="w-4 h-4 mr-2" />
                      Aplicar Ação
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="comparisons" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Comparação de Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" />
                  <Bar dataKey="target" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
