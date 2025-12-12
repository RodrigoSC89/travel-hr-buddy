import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { OrganizationLayout } from "@/components/layout/organization-layout";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { logger } from "@/lib/logger";
import { useBrain } from "@/components/global/GlobalBrainProvider";
import { 
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
  BarChart3,
  Brain,
  Sparkles,
  Radio,
  RefreshCw,
  LayoutDashboard,
  Gauge
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

type IconType = React.ComponentType<{ className?: string }>;

interface Activity {
  time: string;
  action: string;
  type: string;
  icon: IconType;
}

interface SectionHeaderProps {
  icon: IconType;
  title: string;
  description: string;
}

const heroHighlights = [
  {
    label: "Eficiência Operacional",
    value: "96,4%",
    detail: "+1,2% vs último período",
    icon: TrendingUp
  },
  {
    label: "SLA Global",
    value: "99,1%",
    detail: "Processos auditados (IMCA / ANP)",
    icon: Shield
  },
  {
    label: "Frota Ativa",
    value: "24 embarcações",
    detail: "18 DP / 6 apoio logístico",
    icon: Ship
  },
  {
    label: "Capital Humano",
    value: "312 profissionais",
    detail: "Tripulações certificadas STCW",
    icon: Users
  }
];

const quickStats = [
  {
    label: "Compliance Geral",
    value: "89,7%",
    detail: "Última auditoria concluída há 24h"
  },
  {
    label: "Ações Pendentes",
    value: "4",
    detail: "Planos críticos aguardando aprovação"
  },
  {
    label: "Próxima Auditoria",
    value: "15 dias",
    detail: "IMCA Class 2 – Equipe preparada"
  }
];

const kpiVisuals: Array<{ icon: IconType; ringClass: string }> = [
  { icon: Users, ringClass: "border-emerald-500/30 bg-emerald-500/10 text-emerald-500" },
  { icon: Ship, ringClass: "border-blue-500/30 bg-blue-500/10 text-blue-500" },
  { icon: Target, ringClass: "border-amber-500/30 bg-amber-500/10 text-amber-500" },
  { icon: Shield, ringClass: "border-indigo-500/30 bg-indigo-500/10 text-indigo-500" }
];

const criticalAlerts = [
  {
    title: "Manutenção atrasada",
    detail: "MV Pacífico – 3 dias",
    severity: "Alto",
    icon: AlertTriangle,
    accent: "text-red-500",
    border: "border-red-500/30"
  },
  {
    title: "Combustível crítico",
    detail: "MV Índico – 15%",
    severity: "Médio",
    icon: Fuel,
    accent: "text-yellow-500",
    border: "border-yellow-500/30"
  },
  {
    title: "Certificação vencendo",
    detail: "STCW – 30 dias",
    severity: "Planejar",
    icon: Calendar,
    accent: "text-blue-500",
    border: "border-blue-500/30"
  }
];

const quickActions = [
  { label: "Gerar Relatório Mensal", icon: FileText },
  { label: "Revisar Escalas", icon: Users },
  { label: "Status da Frota", icon: Ship },
  { label: "Metas & KPIs", icon: Target }
];

const SectionHeader = ({ icon: Icon, title, description }: SectionHeaderProps) => (
  <div className="flex flex-col gap-2">
    <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-primary">
      <Icon className="h-4 w-4" />
      <span>{title}</span>
    </div>
    <p className="text-sm text-muted-foreground">{description}</p>
  </div>
);

export default function CommandCenter() {
  const { currentOrganization } = useOrganization();
  const navigate = useNavigate();
  const { openBrain } = useBrain();
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");
  const [activeTab, setActiveTab] = useState("executive");
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSync, setLastSync] = useState(new Date());
  const [kpiData, setKpiData] = useState<KPIData[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [fleetPerformanceData, setFleetPerformanceData] = useState<FleetPerformanceData[]>([]);
  const [operationalMetrics, setOperationalMetrics] = useState<OperationalMetrics[]>([]);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);
  
  const loadingRef = useRef(false);
  const initialLoadDone = useRef(false);

  const getIconForModule = (moduleName: string | null): IconType => {
    const iconMap: Record<string, IconType> = {
      vessels: Ship,
      hr: Users,
      reports: FileText,
      calendar: Calendar,
      settings: CheckCircle
    };
    return iconMap[moduleName || ""] || Activity;
  };

  useEffect(() => {
    const orgId = currentOrganization?.id;
    
    if (!orgId || loadingRef.current) {
      if (!orgId) setIsLoading(false);
      return;
    }
    
    if (initialLoadDone.current) {
      setIsLoading(false);
      return;
    }
    
    loadingRef.current = true;

    const loadData = async () => {
      setIsLoading(true);
      try {
        const [vesselResult, userResult, activeVesselsResult] = await Promise.all([
          supabase.from("vessels").select("*", { count: "exact", head: true }).eq("organization_id", orgId),
          supabase.from("organization_users").select("*", { count: "exact", head: true }).eq("organization_id", orgId).eq("status", "active"),
          supabase.from("vessels").select("id").eq("organization_id", orgId).eq("status", "active")
        ]);

        const vesselCount = vesselResult.count || 0;
        const userCount = userResult.count || 0;
        const activeVessels = activeVesselsResult.data?.length || 0;
        const utilization = vesselCount > 0 ? Math.round((activeVessels / vesselCount) * 100) : 0;

        setKpiData([
          { metric: "Usuários Ativos", value: String(userCount), change: "+5%", trend: "up" },
          { metric: "Embarcações", value: String(vesselCount), change: "+2%", trend: "up" },
          { metric: "Utilização da Frota", value: `${utilization}%`, change: "+3%", trend: "up" },
          { metric: "Compliance Score", value: "89%", change: "+1%", trend: "up" }
        ]);

        const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"];
        setRevenueData(months.map((month) => ({
          month,
          revenue: 2000 + Math.random() * 600,
          costs: 1400 + Math.random() * 300,
          profit: 500 + Math.random() * 400
        })));

        const { data: vessels } = await supabase
          .from("vessels")
          .select("id, name, status")
          .eq("organization_id", orgId)
          .limit(5);

        setFleetPerformanceData(vessels?.map(vessel => ({
          vessel: vessel.name,
          efficiency: vessel.status === "active" ? 85 + Math.random() * 15 : 70 + Math.random() * 15,
          revenue: 350000 + Math.random() * 150000
        })) || []);

        setOperationalMetrics([
          { name: "Tempo de Operação", value: 92, color: "#10b981" },
          { name: "Tempo de Manutenção", value: 5, color: "#f59e0b" },
          { name: "Tempo Ocioso", value: 3, color: "#ef4444" }
        ]);

        const { data: logs } = await supabase
          .from("access_logs")
          .select("id, action, module_accessed, created_at")
          .eq("severity", "info")
          .order("created_at", { ascending: false })
          .range(0, 4);

        setRecentActivities(logs?.map(log => ({
          time: new Date(log.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
          action: log.action || "Atividade do sistema",
          type: log.module_accessed || "system",
          icon: getIconForModule(log.module_accessed)
        })) || [
          { time: "2h atrás", action: "Dashboard acessado", type: "system", icon: BarChart3 },
          { time: "4h atrás", action: "Relatório gerado", type: "report", icon: FileText }
        ]);

        initialLoadDone.current = true;
      } catch (error) {
        logger.error("Error loading dashboard data", { error, organizationId: orgId });
        toast.error("Erro ao carregar dados do dashboard");
      } finally {
        setIsLoading(false);
        loadingRef.current = false;
      }
    };

    loadData();
  }, [currentOrganization?.id]);

  useEffect(() => {
    if (isLoading || !initialLoadDone.current) return;
    
    const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"];
    setRevenueData(months.map((month) => ({
      month,
      revenue: 2000 + Math.random() * 600,
      costs: 1400 + Math.random() * 300,
      profit: 500 + Math.random() * 400
    })));
  }, [selectedPeriod]);

  if (isLoading) {
    return (
      <ModulePageWrapper gradient="blue">
        <OrganizationLayout title="Command Center">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          </div>
        </OrganizationLayout>
      </ModulePageWrapper>
    );
  }

  return (
    <ModulePageWrapper gradient="blue">
      <OrganizationLayout title="Command Center">
        <div className="space-y-8">
          {/* Command Center Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-500 shadow-lg">
                  <LayoutDashboard className="h-8 w-8 text-white" />
                </div>
                {isOnline ? (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background animate-pulse" />
                ) : (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full border-2 border-background" />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 bg-clip-text text-transparent">
                  Nautilus Command Center
                </h1>
                <p className="text-sm text-muted-foreground">
                  Dashboard unificado com visão executiva e operacional
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={isOnline ? "default" : "secondary"} className="gap-1">
                <Radio className={`h-3 w-3 ${isOnline ? "animate-pulse" : ""}`} />
                {isOnline ? "Online" : "Offline"}
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Clock className="h-3 w-3" />
                Sync: {lastSync.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
              </Badge>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => { setLastSync(new Date()); window.location.reload(); }}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
              
              <Button 
                onClick={() => openBrain("Command Center - Dashboard Executivo e Operacional")}
                className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600"
              >
                <Brain className="h-4 w-4 mr-2" />
                Nautilus Brain
              </Button>
            </div>
          </div>

          {/* Tabs para alternar entre visões */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="executive" className="gap-2">
                <Gauge className="h-4 w-4" />
                Visão Executiva
              </TabsTrigger>
              <TabsTrigger value="operational" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Visão Operacional
              </TabsTrigger>
            </TabsList>

            <TabsContent value="executive" className="space-y-6 mt-6">
              {/* Hero Section */}
              <section className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-white to-slate-50 p-8 shadow-xl dark:border-white/10 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950 dark:text-white">
                <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                  <div className="space-y-5 max-w-2xl">
                    <Badge variant="outline" className="w-fit border-emerald-500/40 bg-emerald-50 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-200">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Atualizado há 12 minutos
                    </Badge>
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-white/70">Visão executiva</p>
                      <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">Governança operacional com IA</h2>
                      <p className="mt-2 text-base text-slate-600 dark:text-white/70">
                        Consolidado estratégico com KPIs de frota, capital humano e conformidade para decisões em tempo real.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {["weekly", "monthly", "quarterly", "yearly"].map((period) => (
                        <Button
                          key={period}
                          size="sm"
                          variant={selectedPeriod === period ? "default" : "ghost"}
                          className={`${selectedPeriod === period
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-secondary-foreground shadow-sm border border-border"}`}
                          onClick={() => setSelectedPeriod(period)}
                        >
                          {period === "weekly" ? "Semanal" :
                            period === "monthly" ? "Mensal" :
                              period === "quarterly" ? "Trimestral" : "Anual"}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="grid w-full gap-4 sm:grid-cols-2 lg:w-auto">
                    {heroHighlights.map((highlight) => {
                      const IconComponent = highlight.icon;
                      return (
                        <div
                          key={highlight.label}
                          className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-md dark:border-white/10 dark:bg-white/10"
                        >
                          <div className="flex items-center justify-between text-sm font-medium text-slate-600 dark:text-white/70">
                            {highlight.label}
                            <IconComponent className="h-4 w-4" />
                          </div>
                          <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">{highlight.value}</p>
                          <p className="text-xs text-slate-500 dark:text-white/60">{highlight.detail}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>

              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpiData.map((kpi, index) => {
                  const visual = kpiVisuals[index % kpiVisuals.length];
                  const IconComponent = visual.icon;
                  return (
                    <Card
                      key={index}
                      className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white/95 shadow-lg dark:border-white/10 dark:bg-slate-950/60"
                    >
                      <CardContent className="p-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-slate-500 dark:text-white/70">
                              {kpi.metric}
                            </p>
                            <p className="text-3xl font-semibold text-slate-900 dark:text-white">{kpi.value}</p>
                          </div>
                          <div className={`rounded-2xl border ${visual.ringClass} p-3`}>
                            <IconComponent className="h-6 w-6" />
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={`border-0 px-3 py-1 text-xs font-medium ${
                            kpi.trend === "up"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200"
                              : "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-200"
                          }`}
                        >
                          {kpi.change} vs período anterior
                        </Badge>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Maritime Safety Modules */}
              <Card className="border border-slate-200 bg-white/95 shadow-lg dark:border-white/10 dark:bg-slate-950/60">
                <CardHeader>
                  <SectionHeader 
                    icon={Shield}
                    title="Sistemas de Segurança Marítima"
                    description="Status dos módulos críticos de compliance e segurança operacional"
                  />
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
                        <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-2">PEO-DP</h3>
                        <p className="text-sm text-blue-700 dark:text-blue-200 mb-4">Plano de Operações com Dynamic Positioning</p>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-blue-800 dark:text-blue-300 font-medium">Compliance Score</span>
                            <span className="text-blue-900 dark:text-blue-100 font-bold">94%</span>
                          </div>
                          <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                            <div className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full" style={{ width: "94%" }}></div>
                          </div>
                        </div>
                        <Button 
                          className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                          onClick={() => navigate("/peo-dp")}
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
                        <h3 className="text-xl font-bold text-red-900 dark:text-red-100 mb-2">SGSO</h3>
                        <p className="text-sm text-red-700 dark:text-red-200 mb-4">Sistema de Gestão de Segurança Operacional</p>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-red-800 dark:text-red-300 font-medium">Compliance ANP</span>
                            <span className="text-red-900 dark:text-red-100 font-bold">84%</span>
                          </div>
                          <div className="w-full bg-red-200 dark:bg-red-800 rounded-full h-2">
                            <div className="bg-red-600 dark:bg-red-400 h-2 rounded-full" style={{ width: "84%" }}></div>
                          </div>
                        </div>
                        <Button 
                          className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white font-semibold"
                          onClick={() => navigate("/sgso")}
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
                        <h3 className="text-xl font-bold text-green-900 dark:text-green-100 mb-2">PEOTRAM</h3>
                        <p className="text-sm text-green-700 dark:text-green-200 mb-4">Plano de Emergência e Gestão Ambiental</p>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-green-800 dark:text-green-300 font-medium">Compliance Score</span>
                            <span className="text-green-900 dark:text-green-100 font-bold">91%</span>
                          </div>
                          <div className="w-full bg-green-200 dark:bg-green-800 rounded-full h-2">
                            <div className="bg-green-600 dark:bg-green-400 h-2 rounded-full" style={{ width: "91%" }}></div>
                          </div>
                        </div>
                        <Button 
                          className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-semibold"
                          onClick={() => navigate("/peotram")}
                        >
                          Acessar PEOTRAM
                        </Button>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Quick Stats Row */}
                  <Card className="mt-6 border border-slate-200 bg-white/90 shadow-lg dark:border-white/10 dark:bg-slate-950/60">
                    <CardContent className="grid gap-4 p-6 md:grid-cols-3">
                      {quickStats.map((stat) => (
                        <div key={stat.label} className="rounded-2xl border border-slate-100/80 p-4 text-center dark:border-white/10">
                          <p className="text-3xl font-semibold text-slate-900 dark:text-white">{stat.value}</p>
                          <p className="text-sm font-medium text-slate-500 dark:text-white/70">{stat.label}</p>
                          <p className="text-xs text-slate-400 dark:text-white/60">{stat.detail}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="operational" className="space-y-6 mt-6">
              {/* Main Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue & Profit Chart */}
                <Card className="border border-slate-200 bg-white/95 shadow-lg dark:border-white/10 dark:bg-slate-950/60">
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
                        <Tooltip formatter={(value: number) => [`R$ ${value}k`, ""]} />
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
                <Card className="border border-slate-200 bg-white/95 shadow-lg dark:border-white/10 dark:bg-slate-950/60">
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
                <Card className="border border-slate-200 bg-white/95 shadow-lg dark:border-white/10 dark:bg-slate-950/60">
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
                <Card className="border border-slate-200 bg-white/90 dark:border-white/10 dark:bg-slate-950/60">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Alertas Críticos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {criticalAlerts.map((alert) => {
                        const IconComponent = alert.icon;
                        return (
                          <div
                            key={alert.title}
                            className={`flex items-center gap-3 rounded-2xl border ${alert.border} bg-white/80 p-3 dark:bg-white/5`}
                          >
                            <div className={`rounded-2xl border border-white/40 p-2 ${alert.accent}`}>
                              <IconComponent className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-slate-800 dark:text-white">{alert.title}</p>
                              <p className="text-xs text-slate-500 dark:text-white/70">{alert.detail}</p>
                            </div>
                            <Badge variant="outline" className="border-white/20 text-xs text-slate-600 dark:text-white/70">
                              {alert.severity}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="border border-slate-200 bg-white/90 dark:border-white/10 dark:bg-slate-950/60">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Ações Rápidas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {quickActions.map((action) => {
                        const IconComponent = action.icon;
                        return (
                          <Button
                            key={action.label}
                            variant="outline"
                            className="w-full justify-start rounded-2xl border-border bg-secondary text-secondary-foreground hover:border-primary hover:text-primary"
                          >
                            <IconComponent className="mr-2 h-4 w-4" />
                            {action.label}
                          </Button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activities */}
              <Card className="border border-slate-200 bg-white/95 shadow-lg dark:border-white/10 dark:bg-slate-950/60">
                <CardHeader>
                  <CardTitle>Atividades Recentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivities.map((activity, index) => {
                      const IconComponent = activity.icon;
                      return (
                        <div
                          key={index}
                          className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white/80 p-4 transition hover:border-primary/40 dark:border-white/10 dark:bg-white/5"
                        >
                          <div className="rounded-2xl border border-primary/30 bg-primary/10 p-2 text-primary">
                            <IconComponent className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">{activity.action}</p>
                            <p className="text-xs text-slate-500 dark:text-white/60">{activity.type}</p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {activity.time}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </OrganizationLayout>
    </ModulePageWrapper>
  );
}
