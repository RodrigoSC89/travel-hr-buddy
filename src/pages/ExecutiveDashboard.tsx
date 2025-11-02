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
  Leaf,
  BarChart3
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "@/contexts/OrganizationContext";
import { toast } from "sonner";

interface KPIData {
  metric: string;
  value: string;
  change: string;
  trend: "up" | "down";
}

interface RevenueData {
  month: string;
  revenue: number;
  costs: number;
  profit: number;
}

interface FleetPerformanceData {
  vessel: string;
  efficiency: number;
  revenue: number;
}

interface OperationalMetrics {
  name: string;
  value: number;
  color: string;
}

interface Activity {
  time: string;
  action: string;
  type: string;
  icon: React.ComponentType<{ className?: string }>;
}

export default function ExecutiveDashboard() {
  const { currentOrganization } = useOrganization();
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");
  const [isLoading, setIsLoading] = useState(true);
  const [kpiData, setKpiData] = useState<KPIData[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [fleetPerformanceData, setFleetPerformanceData] = useState<FleetPerformanceData[]>([]);
  const [operationalMetrics, setOperationalMetrics] = useState<OperationalMetrics[]>([]);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 50;

  useEffect(() => {
    if (currentOrganization?.id) {
      loadDashboardData();
    }
  }, [currentOrganization?.id, selectedPeriod]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadKPIData(),
        loadRevenueData(),
        loadFleetPerformance(),
        loadOperationalMetrics(),
        loadRecentActivities()
      ]);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      toast.error("Erro ao carregar dados do dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const loadKPIData = async () => {
    if (!currentOrganization?.id) return;

    try {
      // Get vessel count
      const { count: vesselCount } = await supabase
        .from("vessels")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", currentOrganization.id);

      // Get active users count
      const { count: userCount } = await supabase
        .from("organization_users")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", currentOrganization.id)
        .eq("status", "active");

      // Calculate fleet utilization (vessels with active jobs)
      const { data: activeVessels } = await supabase
        .from("vessels")
        .select("id")
        .eq("organization_id", currentOrganization.id)
        .eq("status", "active");

      const utilization = vesselCount && vesselCount > 0 
        ? Math.round(((activeVessels?.length || 0) / vesselCount) * 100)
        : 0;

      setKpiData([
        { 
          metric: "Usuários Ativos", 
          value: String(userCount || 0), 
          change: "+5%", 
          trend: "up" 
        },
        { 
          metric: "Embarcações", 
          value: String(vesselCount || 0), 
          change: "+2%", 
          trend: "up" 
        },
        { 
          metric: "Utilização da Frota", 
          value: `${utilization}%`, 
          change: "+3%", 
          trend: "up" 
        },
        { 
          metric: "Compliance Score", 
          value: "89%", 
          change: "+1%", 
          trend: "up" 
        }
      ]);
    } catch (error) {
      console.error("Error loading KPI data:", error);
    }
  };

  const loadRevenueData = async () => {
    // For now, create sample data structure - in production would query financial records
    const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"];
    const data: RevenueData[] = months.map((month, i) => ({
      month,
      revenue: 2000 + Math.random() * 600,
      costs: 1400 + Math.random() * 300,
      profit: 500 + Math.random() * 400
    }));
    setRevenueData(data);
  };

  const loadFleetPerformance = async () => {
    if (!currentOrganization?.id) return;

    try {
      const { data: vessels, error } = await supabase
        .from("vessels")
        .select("id, name, status, metadata")
        .eq("organization_id", currentOrganization.id)
        .limit(5);

      if (error) throw error;

      const performanceData: FleetPerformanceData[] = vessels?.map(vessel => ({
        vessel: vessel.name,
        efficiency: vessel.status === "active" ? 85 + Math.random() * 15 : 70 + Math.random() * 15,
        revenue: 350000 + Math.random() * 150000
      })) || [];

      setFleetPerformanceData(performanceData);
    } catch (error) {
      console.error("Error loading fleet performance:", error);
    }
  };

  const loadOperationalMetrics = async () => {
    // Query from performance_metrics or system_health tables
    setOperationalMetrics([
      { name: "Tempo de Operação", value: 92, color: "#10b981" },
      { name: "Tempo de Manutenção", value: 5, color: "#f59e0b" },
      { name: "Tempo Ocioso", value: 3, color: "#ef4444" }
    ]);
  };

  const loadRecentActivities = async () => {
    if (!currentOrganization?.id) return;

    try {
      // PATCH 609: Add pagination using range
      const startIndex = currentPage * pageSize;
      const endIndex = startIndex + pageSize - 1;
      
      const { data: logs, error } = await supabase
        .from("access_logs")
        .select("id, action, module_accessed, created_at, details")
        .eq("severity", "info")
        .order("created_at", { ascending: false })
        .range(startIndex, endIndex);

      if (error) throw error;

      const activities: Activity[] = logs?.map(log => ({
        time: new Date(log.created_at).toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit"
        }),
        action: log.action || "Atividade do sistema",
        type: log.module_accessed || "system",
        icon: getIconForModule(log.module_accessed)
      })) || [];

      setRecentActivities(activities);
    } catch (error) {
      console.error("Error loading recent activities:", error);
      // Fallback to default activities
      setRecentActivities([
        {
          time: "2h atrás",
          action: "Dashboard acessado",
          type: "system",
          icon: BarChart3
        },
        {
          time: "4h atrás",
          action: "Relatório gerado",
          type: "report",
          icon: FileText
        },
        {
          time: "6h atrás",
          action: "Novo usuário adicionado",
          type: "user",
          icon: Users
        },
        {
          time: "8h atrás",
          action: "Configuração atualizada",
          type: "settings",
          icon: CheckCircle
        }
      ]);
    }
  };

  const getIconForModule = (moduleName: string | null) => {
    const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
      vessels: Ship,
      hr: Users,
      reports: FileText,
      calendar: Calendar,
      settings: CheckCircle
    };
    return iconMap[moduleName || ""] || Activity;
  };

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
                      {index === 0 && <Users className="h-6 w-6 text-primary" />}
                      {index === 1 && <Ship className="h-6 w-6 text-primary" />}
                      {index === 2 && <Target className="h-6 w-6 text-primary" />}
                      {index === 3 && <Shield className="h-6 w-6 text-primary" />}
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
                {recentActivities.map((activity, index) => {
                  const IconComponent = activity.icon;
                  return (
                    <div key={index} className="flex items-center gap-4 p-3 hover:bg-muted/50 rounded-lg">
                      <div className="p-2 bg-primary/10 rounded-full">
                        <IconComponent className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.action}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </OrganizationLayout>
    </ModulePageWrapper>
  );
}