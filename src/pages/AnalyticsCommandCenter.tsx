/**
 * ANALYTICS COMMAND CENTER - Unified Analytics System
 * Fusion of: Analytics Core + Advanced Analytics + Predictive Analytics
 * 
 * Features:
 * - Overview Dashboard with unified KPIs
 * - Core Analytics with notifications, metrics, AI insights
 * - Advanced Fleet Analytics with detailed performance charts
 * - Predictive Analytics with ML predictions
 * - Reports and export functionality
 */

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

import { 
  BarChart3, TrendingUp, TrendingDown, Activity, Download, Brain, Database, 
  FileText, Settings, Bell, Check, RefreshCw, Loader2, Sparkles, Target, 
  Zap, Users, DollarSign, Clock, Gauge, PieChart, LineChart, Ship,
  AlertTriangle, CheckCircle, Fuel, ArrowUpRight, ArrowDownRight, Eye
} from "lucide-react";

import { 
  ComposedChart, Line, Bar, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer, PieChart as RechartsPie, Pie, Cell, AreaChart,
  LineChart as RechartsLineChart, BarChart
} from "recharts";

// Types
interface KPIMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  trend: "up" | "down" | "stable";
  change: number;
  category: string;
  icon?: React.ReactNode;
}

interface AIInsight {
  id: string;
  title: string;
  content: string;
  type: "prediction" | "recommendation" | "alert" | "trend";
  confidence: number;
  priority: "high" | "medium" | "low";
  createdAt: Date;
  actionable: boolean;
}

interface PredictiveInsight {
  id: string;
  type: "maintenance" | "fuel" | "route" | "crew" | "cost";
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  confidence: number;
  potential_savings: number;
  action_required: boolean;
  timeline: string;
  actions: string[];
}

interface FleetMetrics {
  efficiency: number;
  fuel_consumption: number;
  operational_cost: number;
  revenue: number;
  profit_margin: number;
  vessel_utilization: number;
  crew_efficiency: number;
  safety_score: number;
  environmental_score: number;
}

const CHART_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"];

const AnalyticsCommandCenter: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [timeRange, setTimeRange] = useState("30d");
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Data states
  const [metrics, setMetrics] = useState<KPIMetric[]>([]);
  const [fleetMetrics, setFleetMetrics] = useState<FleetMetrics | null>(null);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [predictions, setPredictions] = useState<PredictiveInsight[]>([]);
  
  // Chart Data
  const [revenueData, setRevenueData] = useState([
    { month: "Jan", receita: 45000, custos: 28000, lucro: 17000 },
    { month: "Fev", receita: 52000, custos: 30000, lucro: 22000 },
    { month: "Mar", receita: 48000, custos: 29000, lucro: 19000 },
    { month: "Abr", receita: 61000, custos: 35000, lucro: 26000 },
    { month: "Mai", receita: 55000, custos: 32000, lucro: 23000 },
    { month: "Jun", receita: 70000, custos: 38000, lucro: 32000 }
  ]);

  const [categoryData] = useState([
    { name: "Operacional", value: 35 },
    { name: "Manutenção", value: 25 },
    { name: "RH", value: 20 },
    { name: "Combustível", value: 15 },
    { name: "Outros", value: 5 }
  ]);

  const [trendData] = useState([
    { date: "Sem 1", eficiencia: 92, disponibilidade: 96, manutencao: 88 },
    { date: "Sem 2", eficiencia: 94, disponibilidade: 97, manutencao: 90 },
    { date: "Sem 3", eficiencia: 93, disponibilidade: 95, manutencao: 91 },
    { date: "Sem 4", eficiencia: 96, disponibilidade: 98, manutencao: 93 }
  ]);

  const [performanceData] = useState([
    { date: "Dia 1", fuel_efficiency: 85, revenue: 420000, crew_satisfaction: 87 },
    { date: "Dia 2", fuel_efficiency: 87, revenue: 435000, crew_satisfaction: 89 },
    { date: "Dia 3", fuel_efficiency: 89, revenue: 445000, crew_satisfaction: 91 },
    { date: "Dia 4", fuel_efficiency: 86, revenue: 430000, crew_satisfaction: 88 },
    { date: "Dia 5", fuel_efficiency: 90, revenue: 465000, crew_satisfaction: 93 },
    { date: "Dia 6", fuel_efficiency: 88, revenue: 450000, crew_satisfaction: 90 },
    { date: "Dia 7", fuel_efficiency: 91, revenue: 470000, crew_satisfaction: 94 }
  ]);

  const [maintenanceData] = useState([
    { month: "Jan", predicted: 85, actual: 82, confidence: 94 },
    { month: "Fev", predicted: 78, actual: 76, confidence: 91 },
    { month: "Mar", predicted: 92, actual: 89, confidence: 87 },
    { month: "Abr", predicted: 67, actual: 71, confidence: 89 },
    { month: "Mai", predicted: 88, actual: null, confidence: 92 },
    { month: "Jun", predicted: 75, actual: null, confidence: 88 },
  ]);

  const [riskData] = useState([
    { name: "Baixo Risco", value: 65, color: "#10b981" },
    { name: "Médio Risco", value: 25, color: "#f59e0b" },
    { name: "Alto Risco", value: 10, color: "#ef4444" },
  ]);

  const modelAccuracy = {
    maintenance: 94.2,
    performance: 89.7,
    fuel: 91.3,
    safety: 96.1
  };

  useEffect(() => {
    loadAllData();
  }, [timeRange]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadMetrics(),
        loadFleetMetrics(),
        loadInsights(),
        loadPredictions()
      ]);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setIsRefreshing(true);
    await loadAllData();
    toast({ title: "Dados atualizados", description: "Analytics atualizado com sucesso" });
    setIsRefreshing(false);
  };

  const loadMetrics = async () => {
    const defaultMetrics: KPIMetric[] = [
      { id: "1", name: "Eficiência Operacional", value: 94.3, unit: "%", trend: "up", change: 3.1, category: "performance" },
      { id: "2", name: "Consumo de Combustível", value: 87.5, unit: "%", trend: "down", change: -5.2, category: "consumption" },
      { id: "3", name: "Taxa de Disponibilidade", value: 98.7, unit: "%", trend: "up", change: 1.2, category: "availability" },
      { id: "4", name: "Índice de Manutenção", value: 91.4, unit: "%", trend: "stable", change: 0.3, category: "maintenance" },
      { id: "5", name: "Satisfação da Tripulação", value: 4.6, unit: "/5", trend: "up", change: 0.2, category: "hr" },
      { id: "6", name: "ROI Operacional", value: 23.5, unit: "%", trend: "up", change: 4.8, category: "financial" },
      { id: "7", name: "Taxa de Conformidade", value: 97.2, unit: "%", trend: "up", change: 2.1, category: "compliance" },
      { id: "8", name: "Índice de Segurança", value: 99.1, unit: "%", trend: "stable", change: 0.1, category: "safety" }
    ];
    setMetrics(defaultMetrics);
  };

  const loadFleetMetrics = async () => {
    const mockMetrics: FleetMetrics = {
      efficiency: 87.5,
      fuel_consumption: 245.8,
      operational_cost: 125000,
      revenue: 450000,
      profit_margin: 64.4,
      vessel_utilization: 92.3,
      crew_efficiency: 89.1,
      safety_score: 96.2,
      environmental_score: 88.7
    };
    setFleetMetrics(mockMetrics);
  };

  const loadInsights = async () => {
    const mockInsights: AIInsight[] = [
      {
        id: "1",
        title: "Otimização de Rota Identificada",
        content: "Análise de padrões indica rota 12% mais eficiente para próximas viagens. Economia estimada de R$ 45.000/mês.",
        type: "recommendation",
        confidence: 92,
        priority: "high",
        createdAt: new Date(),
        actionable: true
      },
      {
        id: "2",
        title: "Tendência de Consumo",
        content: "Consumo de combustível estabilizado após otimizações implementadas. Manter práticas atuais.",
        type: "trend",
        confidence: 88,
        priority: "medium",
        createdAt: new Date(Date.now() - 3600000),
        actionable: false
      },
      {
        id: "3",
        title: "Previsão de Manutenção",
        content: "Motor auxiliar MV Pacific Star requer atenção em 15 dias. Agendar manutenção preventiva.",
        type: "prediction",
        confidence: 94,
        priority: "high",
        createdAt: new Date(Date.now() - 7200000),
        actionable: true
      }
    ];
    setInsights(mockInsights);
  };

  const loadPredictions = async () => {
    const mockPredictions: PredictiveInsight[] = [
      {
        id: "1",
        type: "maintenance",
        title: "Motor Principal - Manutenção Preventiva",
        description: "Baseado em padrões de vibração e temperatura, recomenda-se manutenção preventiva.",
        impact: "high",
        confidence: 94,
        potential_savings: 45000,
        action_required: true,
        timeline: "15 dias",
        actions: ["Verificar filtros", "Analisar óleo", "Inspeção visual"]
      },
      {
        id: "2",
        type: "fuel",
        title: "Consumo de Combustível - Otimização",
        description: "Padrão de consumo indica oportunidade de otimização de rota.",
        impact: "medium",
        confidence: 87,
        potential_savings: 15000,
        action_required: false,
        timeline: "7 dias",
        actions: ["Revisar rotas", "Otimizar velocidade", "Calibrar sistemas"]
      },
      {
        id: "3",
        type: "crew",
        title: "Rotação de Tripulação",
        description: "Otimização de escalas pode melhorar eficiência em 8%.",
        impact: "medium",
        confidence: 84,
        potential_savings: 12000,
        action_required: false,
        timeline: "30 dias",
        actions: ["Revisar escalas", "Consultar RH", "Implementar mudanças"]
      },
      {
        id: "4",
        type: "cost",
        title: "Negociação de Contratos",
        description: "Renegociação de fornecedores pode reduzir custos em 6%.",
        impact: "low",
        confidence: 78,
        potential_savings: 8000,
        action_required: false,
        timeline: "60 dias",
        actions: ["Mapear fornecedores", "Solicitar propostas", "Negociar termos"]
      }
    ];
    setPredictions(mockPredictions);
  };

  const getHealthColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 75) return "text-yellow-600";
    return "text-red-600";
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "down": return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case "high": return <Badge variant="destructive">Alto Impacto</Badge>;
      case "medium": return <Badge variant="secondary">Médio Impacto</Badge>;
      default: return <Badge variant="outline">Baixo Impacto</Badge>;
    }
  };

  if (loading) {
    return (
      <ModulePageWrapper gradient="blue">
        <div className="flex items-center justify-center h-96">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Carregando Analytics...</p>
          </div>
        </div>
      </ModulePageWrapper>
    );
  }

  return (
    <ModulePageWrapper gradient="blue">
      <ModuleHeader
        icon={BarChart3}
        title="Analytics Command Center"
        description="Centro unificado de analytics com IA preditiva, insights em tempo real e relatórios avançados"
        gradient="blue"
        badges={[
          { icon: Brain, label: "IA Preditiva" },
          { icon: Zap, label: "Tempo Real" },
          { icon: Target, label: "Insights" },
          { icon: TrendingUp, label: "Tendências" }
        ]}
      />

      {/* Quick Actions Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
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
          <Badge variant="outline" className="gap-2">
            <Brain className="h-3 w-3" />
            IA Ativa
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={refreshData} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-muted/50">
          <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Gauge className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="core" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <BarChart3 className="w-4 h-4 mr-2" />
            Core
          </TabsTrigger>
          <TabsTrigger value="advanced" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <LineChart className="w-4 h-4 mr-2" />
            Avançado
          </TabsTrigger>
          <TabsTrigger value="predictive" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Brain className="w-4 h-4 mr-2" />
            Preditivo
          </TabsTrigger>
          <TabsTrigger value="insights" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Sparkles className="w-4 h-4 mr-2" />
            Insights IA
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {fleetMetrics && (
              <>
                <Card className="border-l-4 border-l-primary">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Eficiência Geral</p>
                        <p className="text-3xl font-bold">{fleetMetrics.efficiency}%</p>
                        <div className="flex items-center gap-1 mt-1">
                          <TrendingUp className="h-3 w-3 text-green-600" />
                          <span className="text-xs text-green-600">+2.3%</span>
                        </div>
                      </div>
                      <Target className="h-8 w-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Margem de Lucro</p>
                        <p className="text-3xl font-bold">{fleetMetrics.profit_margin}%</p>
                        <div className="flex items-center gap-1 mt-1">
                          <TrendingUp className="h-3 w-3 text-green-600" />
                          <span className="text-xs text-green-600">+5.1%</span>
                        </div>
                      </div>
                      <DollarSign className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Utilização da Frota</p>
                        <p className="text-3xl font-bold">{fleetMetrics.vessel_utilization}%</p>
                        <div className="flex items-center gap-1 mt-1">
                          <TrendingDown className="h-3 w-3 text-red-600" />
                          <span className="text-xs text-red-600">-1.2%</span>
                        </div>
                      </div>
                      <Ship className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-emerald-500">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Score de Segurança</p>
                        <p className="text-3xl font-bold">{fleetMetrics.safety_score}%</p>
                        <div className="flex items-center gap-1 mt-1">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          <span className="text-xs text-green-600">Excelente</span>
                        </div>
                      </div>
                      <CheckCircle className="h-8 w-8 text-emerald-500" />
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Receita vs Custos</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="receita" stackId="1" stroke="#10b981" fill="#10b981" name="Receita" />
                    <Area type="monotone" dataKey="custos" stackId="2" stroke="#f59e0b" fill="#f59e0b" name="Custos" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tendências de Eficiência</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsLineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="eficiencia" stroke="#3b82f6" name="Eficiência" />
                    <Line type="monotone" dataKey="disponibilidade" stroke="#10b981" name="Disponibilidade" />
                    <Line type="monotone" dataKey="manutencao" stroke="#f59e0b" name="Manutenção" />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Distribution Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Custos</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsPie>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </RechartsPie>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Insights de IA Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {insights.slice(0, 3).map((insight) => (
                    <div key={insight.id} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                      <Brain className="h-5 w-5 text-primary mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{insight.title}</span>
                          <Badge variant={insight.priority === "high" ? "destructive" : "secondary"}>
                            {insight.confidence}% confiança
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{insight.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Core Analytics Tab */}
        <TabsContent value="core" className="space-y-6">
          {/* KPI Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((metric) => (
              <Card key={metric.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">{metric.name}</span>
                    {getTrendIcon(metric.trend)}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">{metric.value}</span>
                    <span className="text-sm text-muted-foreground">{metric.unit}</span>
                  </div>
                  <div className={`text-xs mt-1 ${metric.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {metric.change >= 0 ? '+' : ''}{metric.change}% vs período anterior
                  </div>
                  <Progress value={Math.min(metric.value, 100)} className="h-1 mt-2" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Receita, Custos e Lucro</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="receita" fill="#3b82f6" name="Receita" />
                    <Bar dataKey="custos" fill="#f59e0b" name="Custos" />
                    <Line type="monotone" dataKey="lucro" stroke="#10b981" strokeWidth={2} name="Lucro" />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPie>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </RechartsPie>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Advanced Analytics Tab */}
        <TabsContent value="advanced" className="space-y-6">
          {/* Performance Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Eficiência de Combustível</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsLineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="fuel_efficiency" stroke="#8884d8" name="Eficiência %" />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Receita Diária</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="revenue" stroke="#82ca9d" fill="#82ca9d" name="Receita" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Eficiência da Tripulação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Performance Geral</span>
                    <span className="font-semibold">{fleetMetrics?.crew_efficiency}%</span>
                  </div>
                  <Progress value={fleetMetrics?.crew_efficiency} className="h-2" />
                  <div className="text-xs text-green-600">+3.2% vs período anterior</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Fuel className="h-5 w-5" />
                  Consumo de Combustível
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Litros/Milha</span>
                    <span className="font-semibold">{fleetMetrics?.fuel_consumption}</span>
                  </div>
                  <Progress value={75} className="h-2" />
                  <div className="text-xs text-green-600">-5.8% vs período anterior</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Score Ambiental
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Sustentabilidade</span>
                    <span className="font-semibold">{fleetMetrics?.environmental_score}%</span>
                  </div>
                  <Progress value={fleetMetrics?.environmental_score} className="h-2" />
                  <div className="text-xs text-green-600">+1.5% vs período anterior</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Predictive Analytics Tab */}
        <TabsContent value="predictive" className="space-y-6">
          {/* Model Accuracy */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Precisão Manutenção</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{modelAccuracy.maintenance}%</div>
                <Progress value={modelAccuracy.maintenance} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Precisão Performance</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{modelAccuracy.performance}%</div>
                <Progress value={modelAccuracy.performance} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Precisão Combustível</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{modelAccuracy.fuel}%</div>
                <Progress value={modelAccuracy.fuel} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Precisão Segurança</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{modelAccuracy.safety}%</div>
                <Progress value={modelAccuracy.safety} className="mt-2" />
              </CardContent>
            </Card>
          </div>

          {/* Predictions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {predictions.map((prediction) => (
              <Card key={prediction.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{prediction.title}</CardTitle>
                    {getImpactBadge(prediction.impact)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Confiança</span>
                      <span className="font-medium">{prediction.confidence}%</span>
                    </div>
                    <Progress value={prediction.confidence} />
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Prazo: {prediction.timeline}</span>
                  </div>

                  <p className="text-sm text-muted-foreground">{prediction.description}</p>

                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <DollarSign className="h-4 w-4" />
                    <span>Economia potencial: R$ {prediction.potential_savings.toLocaleString()}</span>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium">Ações Recomendadas:</div>
                    <ul className="text-xs space-y-1">
                      {prediction.actions.map((action, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <Check className="h-3 w-3 text-primary" />
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-4 w-4 mr-2" />
                      Detalhes
                    </Button>
                    <Button size="sm" className="flex-1">
                      Aplicar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Trend Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Tendências de Manutenção Preditiva</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsLineChart data={maintenanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="predicted" stroke="hsl(var(--primary))" strokeWidth={2} name="Predito" />
                    <Line type="monotone" dataKey="actual" stroke="hsl(var(--secondary))" strokeWidth={2} name="Real" />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Riscos</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPie>
                    <Pie
                      data={riskData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label
                    >
                      {riskData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </RechartsPie>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {insights.map((insight) => (
              <Card key={insight.id} className={`border-l-4 ${
                insight.priority === "high" ? "border-l-destructive" :
                insight.priority === "medium" ? "border-l-yellow-500" : "border-l-blue-500"
              }`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-primary" />
                      <CardTitle className="text-base">{insight.title}</CardTitle>
                    </div>
                    <Badge variant={insight.priority === "high" ? "destructive" : "secondary"}>
                      {insight.priority}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{insight.content}</p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Confiança</span>
                    <span className="font-medium">{insight.confidence}%</span>
                  </div>
                  <Progress value={insight.confidence} className="h-2" />

                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{insight.type}</Badge>
                    {insight.actionable && <Badge variant="secondary">Acionável</Badge>}
                  </div>

                  {insight.actionable && (
                    <Button size="sm" className="w-full">
                      <Zap className="h-4 w-4 mr-2" />
                      Aplicar Recomendação
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Risk Alerts */}
          <Card>
            <CardHeader>
              <CardTitle>Alertas de Risco</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-destructive/10 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <div className="flex-1">
                  <div className="font-medium text-sm">Alto Risco - Motor Auxiliar</div>
                  <div className="text-xs text-muted-foreground">Temperatura elevada detectada</div>
                </div>
                <Button size="sm" variant="destructive">Ação Urgente</Button>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-yellow-500/10 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <div className="flex-1">
                  <div className="font-medium text-sm">Médio Risco - Sistema Hidráulico</div>
                  <div className="text-xs text-muted-foreground">Pressão ligeiramente baixa</div>
                </div>
                <Button size="sm" variant="outline">Monitorar</Button>
              </div>

              <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div className="flex-1">
                  <div className="font-medium text-sm">Baixo Risco - Todos os Sistemas</div>
                  <div className="text-xs text-muted-foreground">Operação normal</div>
                </div>
                <Badge variant="outline" className="text-green-600">OK</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </ModulePageWrapper>
  );
};

export default AnalyticsCommandCenter;
