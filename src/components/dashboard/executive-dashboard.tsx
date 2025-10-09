import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Ship, 
  BarChart3,
  Calendar,
  Clock,
  Target,
  Award,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from "recharts";

interface ExecutiveKPI {
  id: string;
  title: string;
  value: number;
  target: number;
  unit: string;
  trend: "up" | "down" | "stable";
  change: number;
  changeType: "percentage" | "absolute";
  status: "excellent" | "good" | "warning" | "critical";
}

interface StrategicMetric {
  category: string;
  metrics: {
    name: string;
    current: number;
    target: number;
    trend: number;
  }[];
}

const ExecutiveDashboard = () => {
  const [kpis, setKpis] = useState<ExecutiveKPI[]>([]);
  const [strategicMetrics, setStrategicMetrics] = useState<StrategicMetric[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month" | "quarter" | "year">("month");

  useEffect(() => {
    loadExecutiveData();
  }, [selectedPeriod]);

  const loadExecutiveData = () => {
    // Simular dados KPIs executivos
    const mockKPIs: ExecutiveKPI[] = [
      {
        id: "1",
        title: "Receita Operacional",
        value: 12500000,
        target: 15000000,
        unit: "R$",
        trend: "up",
        change: 15.2,
        changeType: "percentage",
        status: "good"
      },
      {
        id: "2",
        title: "Eficiência da Frota",
        value: 87.5,
        target: 95,
        unit: "%",
        trend: "up",
        change: 3.2,
        changeType: "percentage",
        status: "warning"
      },
      {
        id: "3",
        title: "Satisfação do Cliente",
        value: 94.2,
        target: 98,
        unit: "%",
        trend: "stable",
        change: 0.8,
        changeType: "percentage",
        status: "excellent"
      },
      {
        id: "4",
        title: "Tripulação Certificada",
        value: 96.8,
        target: 100,
        unit: "%",
        trend: "up",
        change: 2.1,
        changeType: "percentage",
        status: "good"
      },
      {
        id: "5",
        title: "Tempo Médio de Entrega",
        value: 14.2,
        target: 12,
        unit: "dias",
        trend: "down",
        change: -1.3,
        changeType: "absolute",
        status: "warning"
      },
      {
        id: "6",
        title: "Incidentes de Segurança",
        value: 2,
        target: 0,
        unit: "casos",
        trend: "down",
        change: -3,
        changeType: "absolute",
        status: "critical"
      }
    ];

    // Simular métricas estratégicas
    const mockStrategicMetrics: StrategicMetric[] = [
      {
        category: "Operações",
        metrics: [
          { name: "Utilização da Frota", current: 87.5, target: 95, trend: 3.2 },
          { name: "Pontualidade das Entregas", current: 92.1, target: 98, trend: 1.8 },
          { name: "Consumo de Combustível", current: 12.5, target: 10.8, trend: -2.1 }
        ]
      },
      {
        category: "Financeiro",
        metrics: [
          { name: "Margem Operacional", current: 23.4, target: 28, trend: 2.1 },
          { name: "ROI de Investimentos", current: 18.7, target: 22, trend: 1.5 },
          { name: "Custo por Viagem", current: 45600, target: 42000, trend: -3.2 }
        ]
      },
      {
        category: "Recursos Humanos",
        metrics: [
          { name: "Retenção de Talentos", current: 89.3, target: 95, trend: 2.8 },
          { name: "Satisfação dos Funcionários", current: 8.4, target: 9.2, trend: 0.6 },
          { name: "Produtividade da Equipe", current: 94.2, target: 100, trend: 1.9 }
        ]
      }
    ];

    setKpis(mockKPIs);
    setStrategicMetrics(mockStrategicMetrics);
  };

  const formatValue = (kpi: ExecutiveKPI) => {
    if (kpi.unit === "R$") {
      return `${kpi.unit} ${(kpi.value / 1000000).toFixed(1)}M`;
    }
    return `${kpi.value}${kpi.unit}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
    case "excellent": return "text-success-foreground bg-success/20 border-success/30";
    case "good": return "text-info-foreground bg-info/20 border-info/30";
    case "warning": return "text-warning-foreground bg-warning/20 border-warning/30";
    case "critical": return "text-destructive-foreground bg-destructive/20 border-destructive/30";
    default: return "text-muted-foreground bg-muted/20 border-muted/30";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
    case "excellent": return <Award className="h-4 w-4 text-success" />;
    case "good": return <CheckCircle className="h-4 w-4 text-info" />;
    case "warning": return <AlertTriangle className="h-4 w-4 text-warning" />;
    case "critical": return <AlertTriangle className="h-4 w-4 text-destructive" />;
    default: return <BarChart3 className="h-4 w-4" />;
    }
  };

  const getTrendIcon = (trend: string, change: number) => {
    if (trend === "up" || change > 0) {
      return <TrendingUp className="h-4 w-4 text-success" />;
    } else if (trend === "down" || change < 0) {
      return <TrendingDown className="h-4 w-4 text-destructive" />;
    }
    return <BarChart3 className="h-4 w-4 text-muted-foreground" />;
  };

  // Dados para gráficos
  const revenueData = [
    { month: "Jan", revenue: 10200000, target: 12000000 },
    { month: "Fev", revenue: 11500000, target: 12000000 },
    { month: "Mar", revenue: 12800000, target: 12000000 },
    { month: "Abr", revenue: 11900000, target: 12000000 },
    { month: "Mai", revenue: 13200000, target: 12000000 },
    { month: "Jun", revenue: 12500000, target: 12000000 },
  ];

  const fleetEfficiencyData = [
    { name: "Nautilus Explorer", efficiency: 92 },
    { name: "Atlantic Pioneer", efficiency: 88 },
    { name: "Pacific Star", efficiency: 85 },
    { name: "Ocean Guardian", efficiency: 91 },
    { name: "Sea Voyager", efficiency: 89 },
  ];

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Executivo</h1>
          <p className="text-muted-foreground">
            Visão estratégica e KPIs críticos do negócio
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={selectedPeriod === "month" ? "default" : "outline"}
            onClick={() => setSelectedPeriod("month")}
            size="sm"
          >
            Mensal
          </Button>
          <Button
            variant={selectedPeriod === "quarter" ? "default" : "outline"}
            onClick={() => setSelectedPeriod("quarter")}
            size="sm"
          >
            Trimestral
          </Button>
          <Button
            variant={selectedPeriod === "year" ? "default" : "outline"}
            onClick={() => setSelectedPeriod("year")}
            size="sm"
          >
            Anual
          </Button>
        </div>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.id} className={`border ${getStatusColor(kpi.status)}`}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                {getStatusIcon(kpi.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <div className="text-2xl font-bold">{formatValue(kpi)}</div>
                  <div className="flex items-center gap-1 text-sm">
                    {getTrendIcon(kpi.trend, kpi.change)}
                    <span className={kpi.change >= 0 ? "text-success" : "text-destructive"}>
                      {kpi.change >= 0 ? "+" : ""}{kpi.change}
                      {kpi.changeType === "percentage" ? "%" : ""}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Meta: {kpi.target}{kpi.unit}</span>
                    <span>{((kpi.value / kpi.target) * 100).toFixed(1)}%</span>
                  </div>
                  <Progress 
                    value={(kpi.value / kpi.target) * 100} 
                    className="h-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts and Analytics */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="strategic">Métricas Estratégicas</TabsTrigger>
          <TabsTrigger value="operational">Operacional</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Receita vs Meta</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => [`R$ ${(value / 1000000).toFixed(1)}M`, ""]}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="hsl(var(--primary))" 
                      fill="hsl(var(--primary))"
                      fillOpacity={0.3}
                      name="Receita"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="target" 
                      stroke="hsl(var(--destructive))" 
                      strokeDasharray="5 5"
                      name="Meta"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Eficiência da Frota</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={fleetEfficiencyData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="efficiency"
                      label={({ name, efficiency }) => `${name}: ${efficiency}%`}
                    >
                      {fleetEfficiencyData.map((entry, index) => (
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

        <TabsContent value="strategic" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {strategicMetrics.map((category) => (
              <Card key={category.category}>
                <CardHeader>
                  <CardTitle>{category.category}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {category.metrics.map((metric) => (
                    <div key={metric.name} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{metric.name}</span>
                        <div className="flex items-center gap-1">
                          {getTrendIcon("", metric.trend)}
                          <span className={`text-xs ${metric.trend >= 0 ? "text-success" : "text-destructive"}`}>
                            {metric.trend >= 0 ? "+" : ""}{metric.trend}%
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Atual: {metric.current}%</span>
                        <span>Meta: {metric.target}%</span>
                      </div>
                      <Progress 
                        value={(metric.current / metric.target) * 100} 
                        className="h-2"
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="operational" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Ship className="h-8 w-8 text-info" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Embarcações Ativas</p>
                    <p className="text-2xl font-bold">24</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Users className="h-8 w-8 text-success" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Tripulação Total</p>
                    <p className="text-2xl font-bold">340</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Clock className="h-8 w-8 text-warning" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Horas Navegadas</p>
                    <p className="text-2xl font-bold">8,450</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Target className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Entregas no Prazo</p>
                    <p className="text-2xl font-bold">92.1%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExecutiveDashboard;