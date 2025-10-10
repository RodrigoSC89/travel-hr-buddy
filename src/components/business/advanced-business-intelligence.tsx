import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Line,
  Area,
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
  ComposedChart,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  ShoppingCart,
  Target,
  Calendar,
  Download,
  RefreshCw,
  Brain,
  Zap,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface KPI {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down" | "stable";
  icon: React.ReactNode;
  target: string;
  progress: number;
  description: string;
}

interface InsightCard {
  id: string;
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  category: string;
  recommendation: string;
  confidence: number;
  estimatedValue: string;
}

interface PredictiveModel {
  name: string;
  accuracy: number;
  prediction: string;
  confidence: number;
  trend: "positive" | "negative" | "stable";
  timeframe: string;
}

const AdvancedBusinessIntelligence = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("30d");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Main KPIs
  const [kpis, setKpis] = useState<KPI[]>([
    {
      title: "Receita Total",
      value: "R$ 8.437.923",
      change: "+23.4%",
      trend: "up",
      icon: <DollarSign className="w-5 h-5" />,
      target: "R$ 9.000.000",
      progress: 94,
      description: "Receita bruta do período selecionado",
    },
    {
      title: "Clientes Ativos",
      value: "12.847",
      change: "+18.2%",
      trend: "up",
      icon: <Users className="w-5 h-5" />,
      target: "15.000",
      progress: 86,
      description: "Clientes que fizeram ao menos uma compra",
    },
    {
      title: "Taxa de Conversão",
      value: "4.8%",
      change: "+0.7%",
      trend: "up",
      icon: <Target className="w-5 h-5" />,
      target: "5.5%",
      progress: 87,
      description: "Visitantes que se tornaram clientes",
    },
    {
      title: "Ticket Médio",
      value: "R$ 657",
      change: "-2.1%",
      trend: "down",
      icon: <ShoppingCart className="w-5 h-5" />,
      target: "R$ 750",
      progress: 88,
      description: "Valor médio por transação",
    },
  ]);

  // AI-driven insights
  const [insights, setInsights] = useState<InsightCard[]>([
    {
      id: "1",
      title: "Oportunidade de Cross-selling",
      description:
        "Clientes que compraram produtos da categoria A têm 67% mais probabilidade de comprar categoria B",
      impact: "high",
      category: "Vendas",
      recommendation: "Implementar campanha de cross-selling automatizada",
      confidence: 89,
      estimatedValue: "+R$ 234.000/mês",
    },
    {
      id: "2",
      title: "Otimização de Inventário",
      description: "Detectado excesso de estoque em 15 produtos com baixa rotatividade",
      impact: "medium",
      category: "Operações",
      recommendation: "Reduzir pedidos e criar promoções direcionadas",
      confidence: 92,
      estimatedValue: "-R$ 45.000 custos",
    },
    {
      id: "3",
      title: "Risco de Churn",
      description: "234 clientes apresentam sinais de possível abandono nos próximos 30 dias",
      impact: "high",
      category: "Retenção",
      recommendation: "Ativar campanha de retenção personalizada",
      confidence: 84,
      estimatedValue: "R$ 156.000 em risco",
    },
  ]);

  // Predictive models
  const [predictiveModels, setPredictiveModels] = useState<PredictiveModel[]>([
    {
      name: "Previsão de Vendas",
      accuracy: 94.2,
      prediction: "R$ 9.2M nos próximos 30 dias",
      confidence: 91,
      trend: "positive",
      timeframe: "30 dias",
    },
    {
      name: "Demanda de Produtos",
      accuracy: 87.6,
      prediction: "Aumento de 15% na categoria Tech",
      confidence: 88,
      trend: "positive",
      timeframe: "15 dias",
    },
    {
      name: "Comportamento do Cliente",
      accuracy: 92.1,
      prediction: "Churn reduzirá para 2.3%",
      confidence: 85,
      trend: "positive",
      timeframe: "60 dias",
    },
  ]);

  // Sample data for charts
  const revenueData = [
    { month: "Jan", revenue: 4200000, target: 4000000, costs: 2800000 },
    { month: "Fev", revenue: 4800000, target: 4500000, costs: 3100000 },
    { month: "Mar", revenue: 5200000, target: 5000000, costs: 3300000 },
    { month: "Abr", revenue: 5800000, target: 5500000, costs: 3600000 },
    { month: "Mai", revenue: 6400000, target: 6000000, costs: 3900000 },
    { month: "Jun", revenue: 7100000, target: 6500000, costs: 4200000 },
    { month: "Jul", revenue: 7800000, target: 7000000, costs: 4500000 },
    { month: "Ago", revenue: 8400000, target: 7500000, costs: 4800000 },
  ];

  const customerSegments = [
    { name: "Premium", value: 3247, percentage: 25.3, revenue: 2800000 },
    { name: "Regular", value: 5892, percentage: 45.8, revenue: 3200000 },
    { name: "Novos", value: 2156, percentage: 16.8, revenue: 1100000 },
    { name: "Inativos", value: 1552, percentage: 12.1, revenue: 300000 },
  ];

  const productPerformance = [
    { category: "Tecnologia", sales: 2800000, margin: 32, growth: 18 },
    { category: "Casa & Jardim", sales: 1900000, margin: 28, growth: 12 },
    { category: "Moda", sales: 1600000, margin: 45, growth: -3 },
    { category: "Esportes", sales: 1200000, margin: 38, growth: 22 },
    { category: "Livros", sales: 900000, margin: 25, growth: 8 },
  ];

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      setLastUpdate(new Date());
      // Simulate data updates
      setKpis(prev =>
        prev.map(kpi => ({
          ...kpi,
          value: updateValue(kpi.value),
          change: generateRandomChange(),
        }))
      );
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const updateValue = (currentValue: string): string => {
    // Simple simulation of value updates
    if (currentValue.includes("R$")) {
      const number = parseFloat(currentValue.replace(/[R$.,\s]/g, ""));
      const variation = (Math.random() - 0.5) * 0.02; // ±1% variation
      const newNumber = number * (1 + variation);
      return `R$ ${newNumber.toLocaleString("pt-BR")}`;
    }
    return currentValue;
  };

  const generateRandomChange = (): string => {
    const change = (Math.random() * 10 - 5).toFixed(1);
    return `${Number(change) > 0 ? "+" : ""}${change}%`;
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case "down":
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <div className="w-4 h-4 bg-gray-400 rounded-full" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-green-100 text-green-800 border-green-200";
    }
  };

  const exportReport = () => {
    toast({
      title: "Relatório exportado",
      description: "Relatório BI enviado para seu email",
    });
  };

  const refreshData = () => {
    setLastUpdate(new Date());
    toast({
      title: "Dados atualizados",
      description: "Dashboard sincronizado com sucesso",
    });
  };

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#8dd1e1"];

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Business Intelligence Avançado</h1>
          <p className="text-muted-foreground">Analytics em tempo real com IA preditiva</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${autoRefresh ? "bg-green-500 animate-pulse" : "bg-gray-400"}`}
            />
            <span className="text-sm">{autoRefresh ? "Auto-refresh ativo" : "Manual"}</span>
          </div>

          <Badge variant="outline" className="gap-2">
            <Calendar className="w-3 h-3" />
            Atualizado: {lastUpdate.toLocaleTimeString()}
          </Badge>

          <Button variant="outline" size="sm" onClick={refreshData}>
            <RefreshCw className="w-4 h-4" />
          </Button>

          <Button variant="outline" size="sm" onClick={exportReport}>
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Últimos 7 dias</SelectItem>
            <SelectItem value="30d">Últimos 30 dias</SelectItem>
            <SelectItem value="90d">Últimos 90 dias</SelectItem>
            <SelectItem value="1y">Último ano</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Departamento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="sales">Vendas</SelectItem>
            <SelectItem value="marketing">Marketing</SelectItem>
            <SelectItem value="operations">Operações</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant={autoRefresh ? "default" : "outline"}
          size="sm"
          onClick={() => setAutoRefresh(!autoRefresh)}
        >
          <Zap className="w-4 h-4 mr-2" />
          Auto-refresh
        </Button>
      </div>

      {/* Main KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, index) => (
          <Card key={index} className="border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <div className="flex items-center gap-2">
                {kpi.icon}
                {getTrendIcon(kpi.trend)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">{kpi.value}</div>
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`text-sm ${kpi.trend === "up" ? "text-green-600" : "text-red-600"}`}
                >
                  {kpi.change} vs. período anterior
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Meta: {kpi.target}</span>
                  <span>{kpi.progress}%</span>
                </div>
                <Progress value={kpi.progress} className="h-2" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">{kpi.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-500" />
            Insights de IA
          </CardTitle>
          <CardDescription>Recomendações inteligentes baseadas em análise de dados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {insights.map(insight => (
              <Card key={insight.id} className="border-border">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge className={getImpactColor(insight.impact)}>
                        {insight.impact === "high"
                          ? "Alto Impacto"
                          : insight.impact === "medium"
                            ? "Médio Impacto"
                            : "Baixo Impacto"}
                      </Badge>
                      <Badge variant="outline">{insight.confidence}% confiança</Badge>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm">{insight.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{insight.description}</p>
                    </div>

                    <div className="p-3 bg-accent/50 rounded-lg">
                      <p className="text-xs font-medium mb-1">Recomendação:</p>
                      <p className="text-xs">{insight.recommendation}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{insight.category}</span>
                      <span className="text-xs font-medium text-green-600">
                        {insight.estimatedValue}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Charts Section */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="revenue">Receita & Custos</TabsTrigger>
          <TabsTrigger value="customers">Segmentação</TabsTrigger>
          <TabsTrigger value="products">Produtos</TabsTrigger>
          <TabsTrigger value="predictions">Predições IA</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análise de Receita vs Custos</CardTitle>
              <CardDescription>Evolução mensal com metas e margem de lucro</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `R$ ${value.toLocaleString()}`} />
                  <Legend />
                  <Bar dataKey="costs" fill="#ff7300" name="Custos" />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    fill="#8884d8"
                    stroke="#8884d8"
                    name="Receita"
                  />
                  <Line
                    type="monotone"
                    dataKey="target"
                    stroke="#82ca9d"
                    strokeWidth={2}
                    name="Meta"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Clientes</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={customerSegments}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {customerSegments.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Receita por Segmento</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={customerSegments}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `R$ ${value.toLocaleString()}`} />
                    <Bar dataKey="revenue" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance de Produtos por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={productPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="sales" fill="#8884d8" name="Vendas (R$)" />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="margin"
                    stroke="#82ca9d"
                    name="Margem (%)"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="growth"
                    stroke="#ffc658"
                    name="Crescimento (%)"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {predictiveModels.map((model, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-500" />
                    {model.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Precisão do Modelo</span>
                      <span className="font-medium">{model.accuracy}%</span>
                    </div>
                    <Progress value={model.accuracy} className="h-2" />
                  </div>

                  <div className="p-3 bg-accent/50 rounded-lg">
                    <p className="text-sm font-medium mb-1">Predição:</p>
                    <p className="text-sm">{model.prediction}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {model.trend === "positive" ? (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      )}
                      <span className="text-sm font-medium">{model.confidence}% confiança</span>
                    </div>
                    <Badge variant="outline">{model.timeframe}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedBusinessIntelligence;
