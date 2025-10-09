import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Target, 
  AlertCircle, 
  Activity, 
  Calendar,
  Briefcase,
  BarChart3,
  PieChart,
  Globe,
  Zap,
  Shield,
  Clock
} from "lucide-react";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const Executive = () => {
  const [selectedPeriod, setSelectedPeriod] = React.useState("month");
  const [selectedView, setSelectedView] = React.useState("overview");

  // Dados simulados para o dashboard executivo
  const kpiData = {
    revenue: { current: 2450000, previous: 2280000, target: 2500000 },
    employees: { current: 125, previous: 120, target: 130 },
    efficiency: { current: 94.2, previous: 91.8, target: 95 },
    satisfaction: { current: 4.6, previous: 4.4, target: 4.8 },
    projects: { completed: 18, ongoing: 12, delayed: 3 },
    costs: { current: 1850000, previous: 1920000, budget: 1800000 }
  };

  const revenueData = [
    { month: "Jan", revenue: 2100000, profit: 420000, expenses: 1680000 },
    { month: "Fev", revenue: 2200000, profit: 460000, expenses: 1740000 },
    { month: "Mar", revenue: 2350000, profit: 520000, expenses: 1830000 },
    { month: "Abr", revenue: 2280000, profit: 485000, expenses: 1795000 },
    { month: "Mai", revenue: 2450000, profit: 580000, expenses: 1870000 },
    { month: "Jun", revenue: 2520000, profit: 630000, expenses: 1890000 }
  ];

  const getPercentageChange = (current: number, previous: number) => {
    return ((current - previous) / previous * 100).toFixed(1);
  };

  const getTargetProgress = (current: number, target: number) => {
    return (current / target * 100).toFixed(1);
  };

  const getTrendIcon = (current: number, previous: number) => {
    return current > previous ? TrendingUp : TrendingDown;
  };

  const getTrendColor = (current: number, previous: number) => {
    return current > previous ? "text-green-600" : "text-red-600";
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Briefcase className="w-8 h-8" />
            Dashboard Executivo
          </h1>
          <p className="text-muted-foreground">Visão estratégica da organização</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Última Semana</SelectItem>
              <SelectItem value="month">Último Mês</SelectItem>
              <SelectItem value="quarter">Último Trimestre</SelectItem>
              <SelectItem value="year">Último Ano</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            <Calendar className="w-4 h-4 mr-2" />
            Relatório
          </Button>
        </div>
      </div>

      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Receita</p>
                <p className="text-2xl font-bold">R$ {(kpiData.revenue.current / 1000000).toFixed(1)}M</p>
                <div className="flex items-center gap-1 mt-1">
                  {React.createElement(getTrendIcon(kpiData.revenue.current, kpiData.revenue.previous), {
                    className: `w-4 h-4 ${getTrendColor(kpiData.revenue.current, kpiData.revenue.previous)}`
                  })}
                  <span className={`text-sm ${getTrendColor(kpiData.revenue.current, kpiData.revenue.previous)}`}>
                    {getPercentageChange(kpiData.revenue.current, kpiData.revenue.previous)}%
                  </span>
                </div>
              </div>
              <div className="text-right">
                <DollarSign className="w-8 h-8 text-green-600" />
                <p className="text-xs text-muted-foreground mt-1">
                  Meta: {getTargetProgress(kpiData.revenue.current, kpiData.revenue.target)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Funcionários</p>
                <p className="text-2xl font-bold">{kpiData.employees.current}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-600">
                    +{kpiData.employees.current - kpiData.employees.previous}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <Users className="w-8 h-8 text-blue-600" />
                <p className="text-xs text-muted-foreground mt-1">
                  Meta: {getTargetProgress(kpiData.employees.current, kpiData.employees.target)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Eficiência</p>
                <p className="text-2xl font-bold">{kpiData.efficiency.current}%</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-600">
                    +{(kpiData.efficiency.current - kpiData.efficiency.previous).toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="text-right">
                <Activity className="w-8 h-8 text-orange-600" />
                <p className="text-xs text-muted-foreground mt-1">
                  Meta: {getTargetProgress(kpiData.efficiency.current, kpiData.efficiency.target)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Satisfação</p>
                <p className="text-2xl font-bold">{kpiData.satisfaction.current}/5</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-600">
                    +{(kpiData.satisfaction.current - kpiData.satisfaction.previous).toFixed(1)}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <Target className="w-8 h-8 text-purple-600" />
                <p className="text-xs text-muted-foreground mt-1">
                  Meta: {getTargetProgress(kpiData.satisfaction.current, kpiData.satisfaction.target)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Evolução Financeira</CardTitle>
          <CardDescription>Receita, lucro e despesas dos últimos 6 meses</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: number) => `R$ ${(value / 1000000).toFixed(1)}M`} />
              <Legend />
              <Area type="monotone" dataKey="revenue" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="Receita" />
              <Area type="monotone" dataKey="profit" stackId="2" stroke="#10b981" fill="#10b981" fillOpacity={0.8} name="Lucro" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Projetos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Concluídos</span>
                <Badge variant="default">{kpiData.projects.completed}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Em Andamento</span>
                <Badge variant="secondary">{kpiData.projects.ongoing}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Atrasados</span>
                <Badge variant="destructive">{kpiData.projects.delayed}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Custos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Atual</p>
                <p className="text-lg font-semibold">R$ {(kpiData.costs.current / 1000000).toFixed(1)}M</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Orçamento</p>
                <p className="text-lg font-semibold">R$ {(kpiData.costs.budget / 1000000).toFixed(1)}M</p>
              </div>
              <div className="flex items-center gap-1">
                <TrendingDown className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-600">
                  {getPercentageChange(kpiData.costs.current, kpiData.costs.previous)}% vs anterior
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Status Geral
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Saúde Financeira</span>
                <Badge variant="default">Excelente</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Operações</span>
                <Badge variant="default">Estável</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Crescimento</span>
                <Badge variant="default">Positivo</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Executive;