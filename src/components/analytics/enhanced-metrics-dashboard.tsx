import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Target, 
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  Clock,
  Zap,
  Award,
  AlertTriangle,
  CheckCircle,
  Calendar,
  RefreshCw
} from "lucide-react";
import { 
  LineChart as RechartsLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from "recharts";
import { useToast } from "@/hooks/use-toast";

const EnhancedMetricsDashboard = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Dados simulados avançados
  const [metricsData, setMetricsData] = useState({
    kpis: {
      revenue: { value: 2450000, change: 12.5, trend: "up", target: 2600000 },
      users: { value: 1245, change: 8.3, trend: "up", target: 1500 },
      efficiency: { value: 94.2, change: 2.8, trend: "up", target: 95 },
      satisfaction: { value: 4.6, change: 4.5, trend: "up", target: 4.8 },
      conversion: { value: 3.2, change: -1.1, trend: "down", target: 3.5 },
      retention: { value: 89.5, change: 5.2, trend: "up", target: 90 }
    },
    timeRange: "last30days"
  });

  const monthlyData = [
    { month: "Jan", revenue: 2100000, users: 980, efficiency: 91.2 },
    { month: "Fev", revenue: 2250000, users: 1050, efficiency: 92.1 },
    { month: "Mar", revenue: 2180000, users: 1120, efficiency: 90.8 },
    { month: "Abr", revenue: 2320000, users: 1180, efficiency: 93.5 },
    { month: "Mai", revenue: 2450000, users: 1245, efficiency: 94.2 },
    { month: "Jun", revenue: 2380000, users: 1198, efficiency: 93.8 }
  ];

  const departmentData = [
    { name: "Vendas", value: 30, color: "hsl(var(--primary))" },
    { name: "Marketing", value: 25, color: "hsl(var(--secondary))" },
    { name: "Operações", value: 20, color: "hsl(var(--accent))" },
    { name: "RH", value: 15, color: "hsl(var(--warning))" },
    { name: "TI", value: 10, color: "hsl(var(--info))" }
  ];

  const performanceMetrics = [
    { 
      title: "Performance Operacional",
      value: 94.2,
      target: 95,
      change: 2.8,
      trend: "up",
      icon: Activity,
      color: "text-green-600",
      bgColor: "bg-green-50 border-green-200"
    },
    {
      title: "Eficiência de Processos",
      value: 87.5,
      target: 90,
      change: 5.1,
      trend: "up",
      icon: Zap,
      color: "text-blue-600",
      bgColor: "bg-blue-50 border-blue-200"
    },
    {
      title: "Qualidade de Serviço",
      value: 96.3,
      target: 95,
      change: 1.2,
      trend: "up",
      icon: Award,
      color: "text-purple-600",
      bgColor: "bg-purple-50 border-purple-200"
    },
    {
      title: "Tempo de Resposta",
      value: 2.1,
      target: 2.0,
      change: -8.5,
      trend: "down",
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50 border-orange-200"
    }
  ];

  const refreshData = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simular atualização dos dados
    setMetricsData(prev => ({
      ...prev,
      kpis: {
        ...prev.kpis,
        efficiency: { 
          ...prev.kpis.efficiency, 
          value: prev.kpis.efficiency.value + (Math.random() * 2 - 1) 
        }
      }
    }));
    
    setIsRefreshing(false);
    toast({
      title: "Métricas atualizadas",
      description: "Dados atualizados com sucesso",
    });
  };

  const getTrendIcon = (trend: string) => {
    return trend === "up" ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />;
  };

  const getTrendColor = (trend: string) => {
    return trend === "up" ? "text-green-600" : "text-red-600";
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="w-8 h-8 text-primary" />
            Analytics Avançados
          </h1>
          <p className="text-muted-foreground">
            Métricas detalhadas e insights inteligentes do sistema
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={refreshData}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
          <Button>
            <Calendar className="w-4 h-4 mr-2" />
            Relatório
          </Button>
        </div>
      </div>

      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(metricsData.kpis).map(([key, kpi]) => (
          <Card key={key} className="hover-lift border-l-4 border-l-primary">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground capitalize">
                    {key === "revenue" ? "Receita" : 
                      key === "users" ? "Usuários" :
                        key === "efficiency" ? "Eficiência" :
                          key === "satisfaction" ? "Satisfação" :
                            key === "conversion" ? "Conversão" : "Retenção"}
                  </p>
                  <p className="text-2xl font-bold">
                    {key === "revenue" ? `R$ ${(kpi.value / 1000000).toFixed(1)}M` :
                      key === "satisfaction" ? `${kpi.value}/5` :
                        key === "conversion" || key === "efficiency" || key === "retention" ? 
                          `${kpi.value.toFixed(1)}%` : kpi.value}
                  </p>
                  <div className="flex items-center gap-1">
                    <span className={getTrendColor(kpi.trend)}>
                      {getTrendIcon(kpi.trend)}
                    </span>
                    <span className={`text-sm ${getTrendColor(kpi.trend)}`}>
                      {kpi.change > 0 ? "+" : ""}{kpi.change.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-primary-foreground">
                    {key === "revenue" && <DollarSign className="w-6 h-6" />}
                    {key === "users" && <Users className="w-6 h-6" />}
                    {key === "efficiency" && <Activity className="w-6 h-6" />}
                    {key === "satisfaction" && <Target className="w-6 h-6" />}
                    {key === "conversion" && <TrendingUp className="w-6 h-6" />}
                    {key === "retention" && <Award className="w-6 h-6" />}
                  </div>
                  <div className="mt-2">
                    <Progress 
                      value={(kpi.value / kpi.target) * 100} 
                      className="h-2 w-16" 
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Meta: {key === "revenue" ? `${(kpi.target / 1000000).toFixed(1)}M` :
                        key === "satisfaction" ? `${kpi.target}/5` :
                          `${kpi.target}%`}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs de Analytics */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="trends">Tendências</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Tendência de Receita</CardTitle>
                <CardDescription>Últimos 6 meses</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`R$ ${(value as number / 1000000).toFixed(1)}M`, "Receita"]}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="hsl(var(--primary))" 
                      fill="hsl(var(--primary))" 
                      fillOpacity={0.6} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Department Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Departamento</CardTitle>
                <CardDescription>Participação na receita</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={departmentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {departmentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, "Participação"]} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {performanceMetrics.map((metric, index) => (
              <Card key={index} className={`border-l-4 ${metric.bgColor}`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <metric.icon className={`w-5 h-5 ${metric.color}`} />
                        <h3 className="font-semibold">{metric.title}</h3>
                      </div>
                      <div className="space-y-1">
                        <p className="text-2xl font-bold">
                          {metric.title === "Tempo de Resposta" ? 
                            `${metric.value}s` : `${metric.value}%`}
                        </p>
                        <div className="flex items-center gap-1">
                          <span className={getTrendColor(metric.trend)}>
                            {getTrendIcon(metric.trend)}
                          </span>
                          <span className={`text-sm ${getTrendColor(metric.trend)}`}>
                            {metric.change > 0 ? "+" : ""}{metric.change.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <Progress 
                        value={metric.title === "Tempo de Resposta" ? 
                          Math.max(0, 100 - (metric.value / metric.target) * 100) :
                          (metric.value / metric.target) * 100} 
                        className="h-2 w-20" 
                      />
                      <p className="text-xs text-muted-foreground">
                        Meta: {metric.title === "Tempo de Resposta" ? 
                          `${metric.target}s` : `${metric.target}%`}
                      </p>
                      <Badge variant={metric.value >= metric.target ? "default" : "secondary"}>
                        {metric.value >= metric.target ? 
                          <CheckCircle className="w-3 h-3 mr-1" /> :
                          <AlertTriangle className="w-3 h-3 mr-1" />}
                        {metric.value >= metric.target ? "Alcançado" : "Em progresso"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Evolução de Usuários e Eficiência</CardTitle>
              <CardDescription>Correlação entre crescimento e performance</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RechartsLineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="users" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    name="Usuários"
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="efficiency" 
                    stroke="hsl(var(--accent))" 
                    strokeWidth={3}
                    name="Eficiência %"
                  />
                </RechartsLineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-l-4 border-l-green-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="w-5 h-5" />
                  Pontos Fortes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="font-medium text-green-800">Eficiência Operacional</p>
                  <p className="text-sm text-green-600">
                    94.2% de eficiência, 2.8% acima do mês anterior
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="font-medium text-green-800">Crescimento de Usuários</p>
                  <p className="text-sm text-green-600">
                    8.3% de crescimento consistente
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-700">
                  <AlertTriangle className="w-5 h-5" />
                  Oportunidades
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-orange-50 rounded-lg">
                  <p className="font-medium text-orange-800">Taxa de Conversão</p>
                  <p className="text-sm text-orange-600">
                    Queda de 1.1% - revisar funil de vendas
                  </p>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <p className="font-medium text-orange-800">Tempo de Resposta</p>
                  <p className="text-sm text-orange-600">
                    Melhorar performance para atingir meta de 2.0s
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedMetricsDashboard;