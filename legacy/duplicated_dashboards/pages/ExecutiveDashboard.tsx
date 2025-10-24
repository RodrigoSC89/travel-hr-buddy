import React, { useState, useEffect } from "react";
import { OrganizationLayout } from "@/components/layout/organization-layout";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from "recharts";
import { 
  Ship, 
  Users, 
  DollarSign, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Activity,
  Fuel,
  Calendar,
  FileText,
  Shield,
  Anchor,
  Leaf
} from "lucide-react";

// Mock data for executive dashboard
const kpiData = [
  { metric: "Receita Mensal", value: "R$ 2.4M", change: "+12%", trend: "up" },
  { metric: "Utilização da Frota", value: "87%", change: "+5%", trend: "up" },
  { metric: "Eficiência Operacional", value: "94%", change: "+3%", trend: "up" },
  { metric: "Custo por Milha", value: "R$ 45", change: "-8%", trend: "down" }
];

const revenueData = [
  { month: "Jan", revenue: 2100, costs: 1500, profit: 600 },
  { month: "Fev", revenue: 2300, costs: 1600, profit: 700 },
  { month: "Mar", revenue: 2400, costs: 1550, profit: 850 },
  { month: "Abr", revenue: 2200, costs: 1480, profit: 720 },
  { month: "Mai", revenue: 2600, costs: 1650, profit: 950 },
  { month: "Jun", revenue: 2400, costs: 1580, profit: 820 }
];

const fleetPerformanceData = [
  { vessel: "MV Atlântico", efficiency: 95, revenue: 450000 },
  { vessel: "MV Pacífico", efficiency: 87, revenue: 380000 },
  { vessel: "MV Índico", efficiency: 92, revenue: 420000 },
  { vessel: "MV Ártico", efficiency: 89, revenue: 390000 },
  { vessel: "MV Antártico", efficiency: 94, revenue: 440000 }
];

const operationalMetrics = [
  { name: "Tempo de Operação", value: 92, color: "#10b981" },
  { name: "Tempo de Manutenção", value: 5, color: "#f59e0b" },
  { name: "Tempo Ocioso", value: 3, color: "#ef4444" }
];

export default function ExecutiveDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <ModulePageWrapper gradient="blue">
        <OrganizationLayout title="Dashboard Executivo">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          </div>
        </OrganizationLayout>
      </ModulePageWrapper>
    );
  }

  return (
    <ModulePageWrapper gradient="blue">
      <OrganizationLayout title="Dashboard Executivo">
        <div className="space-y-6">
          {/* Header with period selector */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Visão Executiva</h2>
              <p className="text-muted-foreground">
              Métricas estratégicas e performance organizacional
              </p>
            </div>
            <div className="flex gap-2">
              {["weekly", "monthly", "quarterly", "yearly"].map((period) => (
                <Button
                  key={period}
                  variant={selectedPeriod === period ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedPeriod(period)}
                >
                  {period === "weekly" ? "Semanal" :
                    period === "monthly" ? "Mensal" :
                      period === "quarterly" ? "Trimestral" : "Anual"}
                </Button>
              ))}
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {kpiData.map((kpi, index) => (
              <Card key={index} className="relative overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {kpi.metric}
                      </p>
                      <p className="text-3xl font-bold">{kpi.value}</p>
                      <div className="flex items-center mt-2">
                        <Badge 
                          variant={kpi.trend === "up" ? "default" : "secondary"}
                          className={kpi.trend === "up" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                        >
                          {kpi.change}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-3 bg-primary/10 rounded-full">
                      {index === 0 && <DollarSign className="h-6 w-6 text-primary" />}
                      {index === 1 && <Ship className="h-6 w-6 text-primary" />}
                      {index === 2 && <Target className="h-6 w-6 text-primary" />}
                      {index === 3 && <TrendingUp className="h-6 w-6 text-primary" />}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Maritime Safety Modules - PEO-DP, SGSO, PEOTRAM */}
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
              Sistemas de Segurança Marítima
              </CardTitle>
              <p className="text-muted-foreground">
              Status dos módulos críticos de compliance e segurança operacional
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* PEO-DP Card */}
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-300 hover:shadow-xl transition-all cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-blue-600 rounded-xl">
                        <Anchor className="h-8 w-8 text-white" />
                      </div>
                      <Badge className="bg-green-600 text-white font-bold">
                        <CheckCircle className="h-3 w-3 mr-1" />
                      Operacional
                      </Badge>
                    </div>
                    <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-2">
                    PEO-DP
                    </h3>
                    <p className="text-sm text-blue-700 dark:text-blue-200 mb-4">
                    Plano de Operações com Dynamic Positioning
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-blue-800 dark:text-blue-300 font-medium">Compliance Score</span>
                        <span className="text-blue-900 dark:text-blue-100 font-bold">94%</span>
                      </div>
                      <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                        <div className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full" style={{ width: "94%" }}></div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Badge variant="outline" className="text-xs bg-white dark:bg-blue-950 border-blue-300">
                        6 Seções
                        </Badge>
                        <Badge variant="outline" className="text-xs bg-white dark:bg-blue-950 border-blue-300">
                        IMCA Compliant
                        </Badge>
                      </div>
                    </div>
                    <Button 
                      className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                      onClick={() => window.location.href = "/peo-dp"}
                    >
                    Acessar PEO-DP
                    </Button>
                  </CardContent>
                </Card>

                {/* SGSO Card */}
                <Card className="bg-gradient-to-br from-red-50 to-orange-100 dark:from-red-950 dark:to-orange-900 border-red-300 hover:shadow-xl transition-all cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-red-600 rounded-xl">
                        <Shield className="h-8 w-8 text-white" />
                      </div>
                      <Badge className="bg-yellow-600 text-white font-bold">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                      Atenção
                      </Badge>
                    </div>
                    <h3 className="text-xl font-bold text-red-900 dark:text-red-100 mb-2">
                    SGSO
                    </h3>
                    <p className="text-sm text-red-700 dark:text-red-200 mb-4">
                    Sistema de Gestão de Segurança Operacional
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-red-800 dark:text-red-300 font-medium">Compliance ANP</span>
                        <span className="text-red-900 dark:text-red-100 font-bold">84%</span>
                      </div>
                      <div className="w-full bg-red-200 dark:bg-red-800 rounded-full h-2">
                        <div className="bg-red-600 dark:bg-red-400 h-2 rounded-full" style={{ width: "84%" }}></div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Badge variant="outline" className="text-xs bg-white dark:bg-red-950 border-red-300">
                        17 Práticas
                        </Badge>
                        <Badge variant="outline" className="text-xs bg-white dark:bg-red-950 border-red-300">
                        3 NC Abertas
                        </Badge>
                      </div>
                    </div>
                    <Button 
                      className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white font-semibold"
                      onClick={() => window.location.href = "/sgso"}
                    >
                    Acessar SGSO
                    </Button>
                  </CardContent>
                </Card>

                {/* PEOTRAM Card */}
                <Card className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-900 border-green-300 hover:shadow-xl transition-all cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-green-600 rounded-xl">
                        <Leaf className="h-8 w-8 text-white" />
                      </div>
                      <Badge className="bg-green-600 text-white font-bold">
                        <CheckCircle className="h-3 w-3 mr-1" />
                      Operacional
                      </Badge>
                    </div>
                    <h3 className="text-xl font-bold text-green-900 dark:text-green-100 mb-2">
                    PEOTRAM
                    </h3>
                    <p className="text-sm text-green-700 dark:text-green-200 mb-4">
                    Plano de Emergência e Gestão Ambiental
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-green-800 dark:text-green-300 font-medium">Compliance Score</span>
                        <span className="text-green-900 dark:text-green-100 font-bold">91%</span>
                      </div>
                      <div className="w-full bg-green-200 dark:bg-green-800 rounded-full h-2">
                        <div className="bg-green-600 dark:bg-green-400 h-2 rounded-full" style={{ width: "91%" }}></div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Badge variant="outline" className="text-xs bg-white dark:bg-green-950 border-green-300">
                        Wizard 8 Etapas
                        </Badge>
                        <Badge variant="outline" className="text-xs bg-white dark:bg-green-950 border-green-300">
                        ESG Ready
                        </Badge>
                      </div>
                    </div>
                    <Button 
                      className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-semibold"
                      onClick={() => window.location.href = "/peotram"}
                    >
                    Acessar PEOTRAM
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Stats Row */}
              <div className="grid grid-cols-3 gap-4 mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">89.7%</p>
                  <p className="text-sm text-muted-foreground">Compliance Geral</p>
                </div>
                <div className="text-center border-x border-gray-200 dark:border-gray-700">
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">4</p>
                  <p className="text-sm text-muted-foreground">Ações Pendentes</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">15 dias</p>
                  <p className="text-sm text-muted-foreground">Próxima Auditoria</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue & Profit Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                Receita e Lucro
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => [`R$ ${value}k`, ""]}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stackId="1"
                      stroke="hsl(var(--primary))" 
                      fill="hsl(var(--primary))"
                      fillOpacity={0.6}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="profit" 
                      stackId="2"
                      stroke="#10b981" 
                      fill="#10b981"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Fleet Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ship className="h-5 w-5" />
                Performance da Frota
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={fleetPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="vessel" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number, name: string) => [
                        name === "efficiency" ? `${value}%` : `R$ ${value.toLocaleString()}`,
                        name === "efficiency" ? "Eficiência" : "Receita"
                      ]}
                    />
                    <Bar dataKey="efficiency" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Operational Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Operational Time Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                Distribuição de Tempo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={operationalMetrics}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {operationalMetrics.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Critical Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                Alertas Críticos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Manutenção Atrasada</p>
                      <p className="text-xs text-muted-foreground">MV Pacífico - 3 dias</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                    <Fuel className="h-5 w-5 text-yellow-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Combustível Baixo</p>
                      <p className="text-xs text-muted-foreground">MV Índico - 15%</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Certificado Vencendo</p>
                      <p className="text-xs text-muted-foreground">STCW - 30 dias</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                Ações Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                  Gerar Relatório Mensal
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                  Revisar Escalas
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Ship className="h-4 w-4 mr-2" />
                  Status da Frota
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Target className="h-4 w-4 mr-2" />
                  Metas & KPIs
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle>Atividades Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    time: "2h atrás",
                    action: "MV Atlântico chegou no Porto de Santos",
                    type: "arrival",
                    icon: Ship
                  },
                  {
                    time: "4h atrás",
                    action: "Manutenção concluída - MV Ártico",
                    type: "maintenance",
                    icon: CheckCircle
                  },
                  {
                    time: "6h atrás",
                    action: "Nova escala adicionada para próxima semana",
                    type: "schedule",
                    icon: Calendar
                  },
                  {
                    time: "8h atrás",
                    action: "Relatório financeiro mensal gerado",
                    type: "report",
                    icon: FileText
                  }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 hover:bg-muted/50 rounded-lg">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <activity.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </OrganizationLayout>
    </ModulePageWrapper>
  );
}