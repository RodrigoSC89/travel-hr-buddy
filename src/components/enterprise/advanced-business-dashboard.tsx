import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Ship, 
  FileText,
  BarChart3,
  PieChart,
  Calendar,
  Target,
  Award,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Globe,
  Briefcase,
  Settings,
  Filter,
  Download,
  Share2,
  RefreshCw,
  Eye,
  ArrowUp,
  ArrowDown,
  Minus
} from "lucide-react";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart as RechartsPieChart, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Pie } from "recharts";

interface KPIMetric {
  id: string;
  title: string;
  value: number;
  previousValue: number;
  unit: string;
  format: "currency" | "percentage" | "number" | "decimal";
  trend: "up" | "down" | "stable";
  target?: number;
  category: "financial" | "operational" | "safety" | "hr" | "environmental";
  icon: React.ReactNode;
  color: string;
}

interface BusinessInsight {
  id: string;
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  category: "opportunity" | "risk" | "optimization" | "compliance";
  priority: number;
  actionable: boolean;
  estimatedROI?: number;
  timeframe: string;
}

interface DepartmentPerformance {
  department: string;
  performance: number;
  budget: number;
  budgetUsed: number;
  efficiency: number;
  satisfaction: number;
  headcount: number;
  projects: number;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"];

export const AdvancedBusinessDashboard: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<"7d" | "30d" | "90d" | "1y">("30d");
  const [selectedCategory, setSelectedCategory] = useState<"all" | "financial" | "operational" | "safety" | "hr" | "environmental">("all");
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Mock data - em produção viria de APIs
  const kpiMetrics: KPIMetric[] = [
    {
      id: "revenue",
      title: "Receita Total",
      value: 12500000,
      previousValue: 11800000,
      unit: "BRL",
      format: "currency",
      trend: "up",
      target: 13000000,
      category: "financial",
      icon: <DollarSign className="h-4 w-4" />,
      color: "#10B981"
    },
    {
      id: "profit_margin",
      title: "Margem de Lucro",
      value: 23.5,
      previousValue: 21.2,
      unit: "%",
      format: "percentage",
      trend: "up",
      target: 25,
      category: "financial",
      icon: <TrendingUp className="h-4 w-4" />,
      color: "#059669"
    },
    {
      id: "fleet_utilization",
      title: "Utilização da Frota",
      value: 87.3,
      previousValue: 84.1,
      unit: "%",
      format: "percentage",
      trend: "up",
      target: 90,
      category: "operational",
      icon: <Ship className="h-4 w-4" />,
      color: "#3B82F6"
    },
    {
      id: "safety_incidents",
      title: "Incidentes de Segurança",
      value: 2,
      previousValue: 5,
      unit: "incidentes",
      format: "number",
      trend: "down",
      target: 0,
      category: "safety",
      icon: <AlertTriangle className="h-4 w-4" />,
      color: "#EF4444"
    },
    {
      id: "employee_satisfaction",
      title: "Satisfação Funcionários",
      value: 8.7,
      previousValue: 8.2,
      unit: "/10",
      format: "decimal",
      trend: "up",
      target: 9,
      category: "hr",
      icon: <Users className="h-4 w-4" />,
      color: "#8B5CF6"
    },
    {
      id: "carbon_footprint",
      title: "Pegada de Carbono",
      value: 1240,
      previousValue: 1380,
      unit: "tCO2",
      format: "number",
      trend: "down",
      target: 1000,
      category: "environmental",
      icon: <Globe className="h-4 w-4" />,
      color: "#10B981"
    }
  ];

  const businessInsights: BusinessInsight[] = [
    {
      id: "1",
      title: "Oportunidade de Otimização de Rotas",
      description: "Análise de dados mostra potencial de redução de 15% no consumo de combustível através de otimização de rotas.",
      impact: "high",
      category: "opportunity",
      priority: 1,
      actionable: true,
      estimatedROI: 850000,
      timeframe: "3-6 meses"
    },
    {
      id: "2",
      title: "Risco de Não Conformidade Ambiental",
      description: "Novas regulamentações ambientais exigem adequação dos sistemas de monitoramento até dezembro.",
      impact: "high",
      category: "risk",
      priority: 2,
      actionable: true,
      timeframe: "1-3 meses"
    },
    {
      id: "3",
      title: "Melhoria na Gestão de Estoque",
      description: "Implementação de sistema preditivo pode reduzir custos de estoque em 12%.",
      impact: "medium",
      category: "optimization",
      priority: 3,
      actionable: true,
      estimatedROI: 320000,
      timeframe: "2-4 meses"
    }
  ];

  const departmentData: DepartmentPerformance[] = [
    {
      department: "Operações Marítimas",
      performance: 92,
      budget: 5000000,
      budgetUsed: 4200000,
      efficiency: 88,
      satisfaction: 8.5,
      headcount: 125,
      projects: 8
    },
    {
      department: "Recursos Humanos",
      performance: 87,
      budget: 2500000,
      budgetUsed: 2100000,
      efficiency: 91,
      satisfaction: 9.1,
      headcount: 45,
      projects: 12
    },
    {
      department: "Financeiro",
      performance: 95,
      budget: 1500000,
      budgetUsed: 1300000,
      efficiency: 94,
      satisfaction: 8.8,
      headcount: 28,
      projects: 5
    },
    {
      department: "TI",
      performance: 89,
      budget: 3000000,
      budgetUsed: 2700000,
      efficiency: 85,
      satisfaction: 8.2,
      headcount: 35,
      projects: 15
    }
  ];

  const performanceData = [
    { month: "Jan", revenue: 11200000, costs: 8400000, profit: 2800000 },
    { month: "Fev", revenue: 11800000, costs: 8900000, profit: 2900000 },
    { month: "Mar", revenue: 12500000, costs: 9200000, profit: 3300000 },
    { month: "Abr", revenue: 12100000, costs: 8800000, profit: 3300000 },
    { month: "Mai", revenue: 13200000, costs: 9600000, profit: 3600000 },
    { month: "Jun", revenue: 12800000, costs: 9100000, profit: 3700000 }
  ];

  const fleetUtilizationData = [
    { vessel: "Navio A", utilization: 95, efficiency: 88, maintenance: 5 },
    { vessel: "Navio B", utilization: 87, efficiency: 92, maintenance: 8 },
    { vessel: "Navio C", utilization: 92, efficiency: 85, maintenance: 12 },
    { vessel: "Navio D", utilization: 78, efficiency: 79, maintenance: 18 },
    { vessel: "Navio E", utilization: 89, efficiency: 91, maintenance: 7 }
  ];

  const formatValue = (value: number, format: string, unit: string) => {
    switch (format) {
    case "currency":
      return new Intl.NumberFormat("pt-BR", { 
        style: "currency", 
        currency: "BRL",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value);
    case "percentage":
      return `${value.toFixed(1)}${unit}`;
    case "decimal":
      return `${value.toFixed(1)}${unit}`;
    default:
      return `${value.toLocaleString("pt-BR")} ${unit}`;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
    case "up":
      return <ArrowUp className="h-3 w-3 text-green-500" />;
    case "down":
      return <ArrowDown className="h-3 w-3 text-red-500" />;
    default:
      return <Minus className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
    case "high":
      return "border-red-200 bg-red-50";
    case "medium":
      return "border-yellow-200 bg-yellow-50";
    case "low":
      return "border-blue-200 bg-blue-50";
    default:
      return "border-gray-200 bg-gray-50";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
    case "opportunity":
      return <Target className="h-4 w-4 text-green-500" />;
    case "risk":
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    case "optimization":
      return <Zap className="h-4 w-4 text-blue-500" />;
    case "compliance":
      return <CheckCircle className="h-4 w-4 text-purple-500" />;
    default:
      return <Briefcase className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const filteredKPIs = selectedCategory === "all" 
    ? kpiMetrics 
    : kpiMetrics.filter(kpi => kpi.category === selectedCategory);

  const refreshData = async () => {
    setIsLoading(true);
    // Simular carregamento
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLastUpdated(new Date());
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Executivo</h1>
          <p className="text-muted-foreground">
            Visão estratégica completa do negócio • Última atualização: {lastUpdated.toLocaleTimeString("pt-BR")}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="bg-background border border-border rounded px-3 py-2 text-sm"
          >
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="90d">Últimos 90 dias</option>
            <option value="1y">Último ano</option>
          </select>
          
          <Button onClick={refreshData} disabled={isLoading} variant="outline" className="gap-2">
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
          
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">Indicadores Principais</h2>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as any)}
            className="bg-background border border-border rounded px-3 py-2 text-sm"
          >
            <option value="all">Todas as categorias</option>
            <option value="financial">Financeiro</option>
            <option value="operational">Operacional</option>
            <option value="safety">Segurança</option>
            <option value="hr">Recursos Humanos</option>
            <option value="environmental">Ambiental</option>
          </select>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredKPIs.map((kpi) => (
            <Card key={kpi.id} className="border-l-4" style={{ borderLeftColor: kpi.color }}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {kpi.icon}
                    <span className="text-sm font-medium">{kpi.title}</span>
                  </div>
                  {getTrendIcon(kpi.trend)}
                </div>
                
                <div className="mt-2">
                  <div className="text-2xl font-bold">
                    {formatValue(kpi.value, kpi.format, kpi.unit)}
                  </div>
                  {kpi.target && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Meta: {formatValue(kpi.target, kpi.format, kpi.unit)}</span>
                        <span>{Math.round((kpi.value / kpi.target) * 100)}%</span>
                      </div>
                      <Progress 
                        value={(kpi.value / kpi.target) * 100} 
                        className="h-2"
                      />
                    </div>
                  )}
                </div>
                
                <div className="mt-2 text-xs text-muted-foreground">
                  {kpi.trend === "up" ? "+" : kpi.trend === "down" ? "-" : ""}
                  {Math.abs(((kpi.value - kpi.previousValue) / kpi.previousValue) * 100).toFixed(1)}% 
                  vs período anterior
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="fleet">Frota</TabsTrigger>
          <TabsTrigger value="departments">Departamentos</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Evolução Financeira</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `R$ ${(value / 1000000).toFixed(1)}M`} />
                    <Tooltip 
                      formatter={(value: number) => [`R$ ${(value / 1000000).toFixed(1)}M`, ""]}
                    />
                    <Area type="monotone" dataKey="revenue" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="costs" stackId="2" stroke="#EF4444" fill="#EF4444" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="profit" stackId="3" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Receita</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={[
                        { name: "Transporte de Carga", value: 45, color: "#3B82F6" },
                        { name: "Serviços Portuários", value: 30, color: "#10B981" },
                        { name: "Logística", value: 15, color: "#F59E0B" },
                        { name: "Outros", value: 10, color: "#EF4444" }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      dataKey="value"
                    >
                      {[
                        { name: "Transporte de Carga", value: 45, color: "#3B82F6" },
                        { name: "Serviços Portuários", value: 30, color: "#10B981" },
                        { name: "Logística", value: 15, color: "#F59E0B" },
                        { name: "Outros", value: 10, color: "#EF4444" }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Fleet Tab */}
        <TabsContent value="fleet" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance da Frota</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={fleetUtilizationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="vessel" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="utilization" name="Utilização %" fill="#3B82F6" />
                  <Bar dataKey="efficiency" name="Eficiência %" fill="#10B981" />
                  <Bar dataKey="maintenance" name="Manutenção (dias)" fill="#F59E0B" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Departments Tab */}
        <TabsContent value="departments" className="space-y-4">
          <div className="grid gap-4">
            {departmentData.map((dept) => (
              <Card key={dept.department}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">{dept.department}</h3>
                    <Badge variant="outline">{dept.headcount} funcionários</Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Performance</div>
                      <div className="text-xl font-bold">{dept.performance}%</div>
                      <Progress value={dept.performance} className="mt-1" />
                    </div>
                    
                    <div>
                      <div className="text-sm text-muted-foreground">Orçamento Usado</div>
                      <div className="text-xl font-bold">
                        {Math.round((dept.budgetUsed / dept.budget) * 100)}%
                      </div>
                      <Progress value={(dept.budgetUsed / dept.budget) * 100} className="mt-1" />
                    </div>
                    
                    <div>
                      <div className="text-sm text-muted-foreground">Eficiência</div>
                      <div className="text-xl font-bold">{dept.efficiency}%</div>
                      <Progress value={dept.efficiency} className="mt-1" />
                    </div>
                    
                    <div>
                      <div className="text-sm text-muted-foreground">Projetos Ativos</div>
                      <div className="text-xl font-bold">{dept.projects}</div>
                      <div className="text-xs text-muted-foreground">em andamento</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <div className="space-y-4">
            {businessInsights.map((insight) => (
              <Card key={insight.id} className={`border-2 ${getImpactColor(insight.impact)}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getCategoryIcon(insight.category)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{insight.title}</h3>
                          <Badge variant="outline" className="text-xs">
                            {insight.impact.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {insight.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {insight.timeframe}
                          </div>
                          {insight.estimatedROI && (
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              ROI estimado: {formatValue(insight.estimatedROI, "currency", "BRL")}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    {insight.actionable && (
                      <Button size="sm" className="ml-4">
                        Ação
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Métricas em Tempo Real</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Embarcações Operando</span>
                  <Badge className="bg-green-100 text-green-800">4/5 Ativas</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Tripulação em Serviço</span>
                  <Badge className="bg-blue-100 text-blue-800">87/95</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Cargas em Trânsito</span>
                  <Badge className="bg-orange-100 text-orange-800">23 Cargas</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Manutenções Agendadas</span>
                  <Badge className="bg-purple-100 text-purple-800">5 Esta Semana</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Alertas Críticos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 p-2 bg-red-50 rounded border border-red-200">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span className="text-sm">Manutenção vencida - Navio D</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded border border-yellow-200">
                  <Clock className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">Certificado expira em 15 dias</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-blue-50 rounded border border-blue-200">
                  <CheckCircle className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Meta mensal atingida</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedBusinessDashboard;