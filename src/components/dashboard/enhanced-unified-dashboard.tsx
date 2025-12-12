import { useEffect, useState } from "react";;
import React, { useState, useEffect } from "react";
import { useOptimizedPolling } from "@/hooks/use-optimized-polling";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useNavigate, Link } from "react-router-dom";
import { 
  LayoutDashboard, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  Calendar,
  BarChart3,
  Activity,
  Clock,
  Target,
  Zap,
  Globe,
  ArrowRight,
  RefreshCw,
  Crown,
  Shield,
  Smartphone,
  Ship,
  FileText,
  Brain,
  Settings,
  Anchor,
  Waves,
  MapPin,
  TrendingDown,
  AlertCircle,
  Award,
  Building2,
  Database,
  Cloud,
  Cpu,
  HardDrive,
  Network,
  Server,
  Eye,
  PieChart,
  LineChart,
  BarChart2
} from "lucide-react";
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar, RadialBarChart, RadialBar } from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { useTenant } from "@/contexts/TenantContext";
import { useToast } from "@/hooks/use-toast";
import { EnhancedDashboardFilters } from "./enhanced-dashboard-filters";
import nautilusLogoNew from "@/assets/nautilus-logo-new.png";

import ProfessionalKPICards from "@/components/ui/professional-kpi-cards";
import SystemStatusDashboard from "@/components/ui/system-status-dashboard";
import ExecutiveMetricsPanel from "@/components/ui/executive-metrics-panel";
const EnhancedUnifiedDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentTenant, currentBranding, currentUser, tenantUsage } = useTenant();
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedKPIs, setSelectedKPIs] = useState(["revenue", "employees", "efficiency", "satisfaction"]);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isAutoUpdate, setIsAutoUpdate] = useState(true);
  const [filterPeriod, setFilterPeriod] = useState("30d");

  // Enhanced dashboard data with professional metrics
  const [dashboardData, setDashboardData] = useState({
    kpis: {
      revenue: { 
        value: 2450000, 
        change: 12.5, 
        status: "up", 
        target: 3000000,
        previous: 2180000,
        forecast: 2850000
      },
      employees: { 
        value: 125, 
        change: 4.2, 
        status: "up",
        active: 118,
        onLeave: 7,
        contractors: 15
      },
      efficiency: { 
        value: 94.2, 
        change: 2.8, 
        status: "up",
        target: 95,
        industry_avg: 87.5
      },
      satisfaction: { 
        value: 4.6, 
        change: 4.5, 
        status: "up",
        responses: 89,
        nps: 72
      }
    },
    financialMetrics: {
      grossMargin: 68.5,
      operatingMargin: 15.3,
      ebitda: 1850000,
      cashFlow: 980000,
      roe: 18.7,
      debt: 2100000
    },
    operationalMetrics: {
      vesselUtilization: 87.3,
      fuelEfficiency: 92.1,
      maintenanceCost: 340000,
      downtime: 2.1,
      safetyScore: 98.5,
      complianceRate: 99.2
    },
    alerts: [
      { id: 1, title: "Certificado STCW da MV Ocean Explorer expira em 15 dias", type: "warning", priority: "high", module: "hr", vessel: "MV Ocean Explorer", date: "2024-01-15" },
      { id: 2, title: "Meta mensal de eficiência operacional atingida - 94.2%", type: "success", priority: "medium", module: "fleet", percentage: 94.2 },
      { id: 3, title: "Análise IA detectou 3 oportunidades de otimização no PEOTRAM", type: "info", priority: "medium", module: "peotram", insights: 3 },
      { id: 4, title: "Backup automático da base de dados concluído com sucesso", type: "success", priority: "low", module: "system", size: "2.3GB" },
      { id: 5, title: "Manutenção preventiva agendada para MV Atlantic Dawn", type: "warning", priority: "medium", module: "maintenance", vessel: "MV Atlantic Dawn", date: "2024-01-20" }
    ],
    recentActivities: [
      { id: 1, user: "João Silva", action: "Completou auditoria PEOTRAM #2024-001 com score 98.5%", time: "2h atrás", type: "peotram", vessel: "MV Ocean Explorer", score: 98.5 },
      { id: 2, user: "Maria Santos", action: "Aprovou relatório mensal de frota - Janeiro 2024", time: "4h atrás", type: "fleet", documents: 15 },
      { id: 3, user: "Carlos Lima", action: "Atualizou cronograma de viagem para rota Santos-Houston", time: "6h atrás", type: "travel", route: "Santos-Houston" },
      { id: 4, user: "Ana Costa", action: "Upload de certificado STCW renovado", time: "8h atrás", type: "certificate", validity: "5 anos" },
      { id: 5, user: "Pedro Oliveira", action: "Finalizou inspeção de segurança com nota A+", time: "1d atrás", type: "safety", grade: "A+" }
    ],
    systemHealth: {
      performance: 97.3,
      uptime: 99.95,
      activeUsers: tenantUsage?.active_users || 42,
      errorRate: 0.08,
      apiCalls: tenantUsage?.api_calls_made || 1250,
      storageUsed: tenantUsage?.storage_used_gb || 2.3,
      totalStorage: 50,
      bandwidth: 245.8,
      responseTime: 180
    },
    moduleStats: {
      peotram: { 
        audits: tenantUsage?.peotram_audits_created || 15, 
        completion: 94.2,
        nonConformities: 3,
        avgScore: 96.8
      },
      fleet: { 
        vessels: tenantUsage?.vessels_managed || 8, 
        efficiency: 92.1,
        utilization: 87.3,
        routes: 24
      },
      documents: { 
        processed: tenantUsage?.documents_processed || 42, 
        ai_analyzed: 38,
        compliance: 99.1,
        digital: 89
      },
      reports: { 
        generated: tenantUsage?.reports_generated || 23, 
        automated: 18,
        scheduled: 45,
        real_time: 12
      }
    }
  });

  // Enhanced performance data
  const performanceData = [
    { time: "00:00", users: 15, performance: 95.2, api_calls: 120, revenue: 245000 },
    { time: "04:00", users: 8, performance: 97.1, api_calls: 80, revenue: 180000 },
    { time: "08:00", users: 35, performance: 91.3, api_calls: 280, revenue: 420000 },
    { time: "12:00", users: 45, performance: 88.7, api_calls: 350, revenue: 580000 },
    { time: "16:00", users: 38, performance: 93.4, api_calls: 290, revenue: 490000 },
    { time: "20:00", users: 25, performance: 96.8, api_calls: 180, revenue: 320000 }
  ];

  const revenueData = [
    { month: "Jul", value: 2100000, target: 2200000, previous: 2080000 },
    { month: "Ago", value: 2250000, target: 2300000, previous: 2150000 },
    { month: "Set", value: 2180000, target: 2400000, previous: 2200000 },
    { month: "Out", value: 2350000, target: 2500000, previous: 2280000 },
    { month: "Nov", value: 2420000, target: 2600000, previous: 2350000 },
    { month: "Dez", value: 2450000, target: 2700000, previous: 2420000 }
  ];

  const moduleUsageData = [
    { name: "PEOTRAM", value: 35, color: "#1e40af", growth: 12.5 },
    { name: "Fleet Management", value: 28, color: "#7c3aed", growth: 8.3 },
    { name: "HR & Certificates", value: 20, color: "#059669", growth: 15.2 },
    { name: "Analytics", value: 17, color: "#dc2626", growth: 22.1 }
  ];

  const operationalData = [
    { metric: "Vessel Utilization", value: 87.3, target: 90, status: "warning" },
    { metric: "Fuel Efficiency", value: 92.1, target: 88, status: "success" },
    { metric: "Safety Score", value: 98.5, target: 95, status: "success" },
    { metric: "Compliance Rate", value: 99.2, target: 98, status: "success" }
  ];

  const quickActions = [
    { 
      title: "PEOTRAM Auditorias", 
      description: "Sistema completo de auditorias marítimas", 
      icon: FileText, 
      path: "/peotram",
      color: "from-blue-600 to-blue-700",
      count: dashboardData.moduleStats.peotram.audits,
      status: "success",
      subtitle: `Score médio: ${dashboardData.moduleStats.peotram.avgScore}%`,
      metric: `${dashboardData.moduleStats.peotram.completion}% concluído`
    },
    { 
      title: "Gestão da Frota", 
      description: "Monitoramento avançado de embarcações", 
      icon: Ship, 
      path: "/fleet-dashboard",
      color: "from-purple-600 to-purple-700",
      count: dashboardData.moduleStats.fleet.vessels,
      status: "info",
      subtitle: `Utilização: ${dashboardData.operationalMetrics.vesselUtilization}%`,
      metric: `${dashboardData.moduleStats.fleet.routes} rotas ativas`
    },
    { 
      title: "Analytics Avançado", 
      description: "Business Intelligence e relatórios", 
      icon: BarChart3, 
      path: "/advanced-analytics",
      color: "from-green-600 to-green-700",
      count: dashboardData.moduleStats.reports.generated,
      status: "success",
      subtitle: `${dashboardData.moduleStats.reports.automated} automáticos`,
      metric: `${dashboardData.moduleStats.reports.real_time} em tempo real`
    },
    { 
      title: "IA & Automação", 
      description: "Inteligência artificial aplicada", 
      icon: Brain, 
      path: "/ai-insights",
      color: "from-cyan-600 to-cyan-700",
      count: dashboardData.moduleStats.documents.ai_analyzed,
      status: "success",
      subtitle: `${dashboardData.moduleStats.documents.compliance}% compliance`,
      metric: `${dashboardData.moduleStats.documents.digital}% digitalizados`
    },
    { 
      title: "Centro Marítimo", 
      description: "Hub completo de operações", 
      icon: Anchor, 
      path: "/maritime",
      color: "from-indigo-600 to-indigo-700",
      count: dashboardData.systemHealth.activeUsers,
      status: "info",
      subtitle: `${dashboardData.operationalMetrics.safetyScore}% segurança`,
      metric: `${dashboardData.systemHealth.uptime}% disponibilidade`
    },
    { 
      title: "Scanner Inteligente", 
      description: "Processamento IA de documentos", 
      icon: Zap, 
      path: "/advanced-documents",
      color: "from-orange-600 to-orange-700",
      count: dashboardData.moduleStats.documents.processed,
      status: "success",
      subtitle: `${dashboardData.moduleStats.documents.ai_analyzed} analisados`,
      metric: "99.1% precisão"
    }
  ];

  const refreshData = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setDashboardData(prev => ({
      ...prev,
      kpis: {
        ...prev.kpis,
        efficiency: { ...prev.kpis.efficiency, value: prev.kpis.efficiency.value + Math.random() * 2 - 1 }
      },
      systemHealth: {
        ...prev.systemHealth,
        performance: Math.max(90, Math.min(100, prev.systemHealth.performance + Math.random() * 4 - 2))
      }
    }));
    
    setLastUpdated(new Date());
    setIsRefreshing(false);
    toast({
      title: "Dashboard atualizado",
      description: "Dados atualizados com sucesso",
    });
  };

  const handleKPIToggle = (kpi: string) => {
    setSelectedKPIs(prev => 
      prev.includes(kpi) 
        ? prev.filter(k => k !== kpi)
        : [...prev, kpi]
    );
  };

  useOptimizedPolling({
    id: "enhanced-unified-dashboard-refresh",
    callback: refreshData,
    interval: 60000,
    enabled: isAutoUpdate,
  });

  const getStatusIcon = (type: string) => {
    switch (type) {
    case "warning": return <AlertTriangle className="w-4 h-4 text-warning" />;
    case "success": return <CheckCircle className="w-4 h-4 text-success" />;
    case "info": return <Bell className="w-4 h-4 text-info" />;
    default: return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
    case "peotram": return <FileText className="w-4 h-4 text-info" />;
    case "fleet": return <Ship className="w-4 h-4 text-primary" />;
    case "certificate": return <Award className="w-4 h-4 text-success" />;
    case "travel": return <MapPin className="w-4 h-4 text-warning" />;
    case "safety": return <Shield className="w-4 h-4 text-destructive" />;
    default: return <Activity className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getActionStatusColor = (status: string) => {
    switch (status) {
    case "success": return "text-success-foreground";
    case "warning": return "text-warning-foreground";
    case "info": return "text-info-foreground";
    default: return "text-muted-foreground";
    }
  };

  const displayName = currentBranding?.company_name || currentTenant?.name || "Nautilus One";
  const userDisplayName = currentUser?.display_name || user?.email?.split("@")[0] || "Usuário";

  return (
    <div className="min-h-screen bg-gradient-to-br from-azure-50 via-background to-azure-100 relative overflow-hidden">
      {/* Animated Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(14,165,233,0.08)_0%,transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(7,89,133,0.06)_0%,transparent_50%)]" />
      
      <div className="relative space-y-8 p-6 md:p-8">
        <EnhancedDashboardFilters
          selectedKPIs={selectedKPIs}
          onKPIToggle={handleKPIToggle}
          filterPeriod={filterPeriod}
          onPeriodChange={setFilterPeriod}
          isAutoUpdate={isAutoUpdate}
          onAutoUpdateToggle={setIsAutoUpdate}
          lastUpdated={lastUpdated}
        />

        {/* Hero Header with Glassmorphism */}
        <div className="relative animate-fade-in">
          {/* Background Glow Effect */}
          <div className="absolute -inset-1 bg-gradient-ocean rounded-3xl opacity-20 blur-2xl" />
          
          {/* Main Header Card */}
          <Card className="relative border-0 shadow-elegant bg-card/80 backdrop-blur-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-azure-500/5 via-transparent to-azure-600/5 rounded-3xl" />
            
            <CardContent className="relative p-8 md:p-10">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                {/* Left Section - Branding */}
                <div className="flex items-start gap-6 flex-1">
                  {/* Logo Nautilus com Glow */}
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-azure-400 to-azure-600 rounded-2xl blur-xl opacity-60 group-hover:opacity-100 transition-opacity" />
                    <div className="relative p-4 rounded-2xl bg-white dark:bg-azure-900/50 shadow-glow backdrop-blur-sm">
                      <img 
                        src={nautilusLogoNew} 
                        alt="Nautilus One"
                        className="w-14 h-14 object-contain group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  </div>

                  {/* Title & Info */}
                  <div className="flex-1">
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-azure-700 via-azure-600 to-azure-500 bg-clip-text text-transparent mb-3">
                      {displayName}
                    </h1>
                    
                    {/* Badges Row */}
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      <Badge className="bg-gradient-to-r from-azure-600 to-azure-500 text-white border-0 shadow-soft">
                        <Crown className="w-3 h-3 mr-1" />
                        Sistema Marítimo Integrado
                      </Badge>
                      {currentTenant?.plan_type && (
                        <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 text-white border-0">
                          <Award className="w-3 h-3 mr-1" />
                          {currentTenant.plan_type.charAt(0).toUpperCase() + currentTenant.plan_type.slice(1)}
                        </Badge>
                      )}
                      <Badge variant="secondary" className="backdrop-blur-sm bg-azure-100/80">
                        <Activity className="w-3 h-3 mr-1 text-azure-600" />
                        {dashboardData.systemHealth.activeUsers} usuários ativos
                      </Badge>
                    </div>

                    {/* Welcome Message */}
                    <p className="text-lg text-muted-foreground max-w-2xl">
                      Bem-vindo de volta, <strong className="text-foreground">{userDisplayName}</strong>! 
                      <br />
                      <span className="text-azure-600 font-medium">Painel executivo de operações marítimas em tempo real</span>
                    </p>
                  </div>
                </div>

                {/* Right Section - Actions & Status */}
                <div className="flex flex-col items-end gap-4 min-w-fit">
                  <div className="flex items-center gap-3">
                    <Button 
                      variant="outline" 
                      onClick={refreshData}
                      disabled={isRefreshing}
                      className="bg-white/80 backdrop-blur-sm hover:bg-azure-50 border-azure-200 shadow-soft"
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                      Atualizar Dados
                    </Button>
                    <Button 
                      onClick={() => navigate("/executive")}
                      className="bg-gradient-ocean text-white hover:shadow-glow shadow-azure"
                    >
                      <Target className="w-4 h-4 mr-2" />
                      Visão Executiva
                    </Button>
                  </div>

                  {/* Status Info */}
                  <div className="text-right space-y-2">
                    <div className="text-sm text-muted-foreground">
                      Última atualização: <span className="font-medium text-foreground">{lastUpdated.toLocaleTimeString()}</span>
                    </div>
                    <div className="flex items-center justify-end gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                      <span className="text-sm font-medium text-emerald-700">
                        Sistema operacional - {dashboardData.systemHealth.uptime}% uptime
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Professional KPI Cards */}
        <ProfessionalKPICards />

        {/* Executive Metrics Panel */}
        <ExecutiveMetricsPanel />

        {/* Financial Overview Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
          {/* Financial Performance Card */}
          <Card className="group relative border-0 shadow-elegant hover:shadow-glow transition-all duration-500 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-emerald-600/5" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.1),transparent_50%)]" />
            
            <CardHeader className="relative border-b border-emerald-100/50 bg-gradient-to-r from-emerald-50/50 to-transparent backdrop-blur-sm">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-soft">
                  <DollarSign className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-emerald-700 to-emerald-600 bg-clip-text text-transparent">
                  Performance Financeira
                </span>
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Indicadores estratégicos de performance
              </CardDescription>
            </CardHeader>
            
            <CardContent className="relative p-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3 p-4 rounded-xl bg-gradient-to-br from-emerald-50/50 to-transparent border border-emerald-100/50">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-muted-foreground">Margem Bruta</span>
                    <Badge className="bg-emerald-100 text-emerald-700 border-0">
                      Alto
                    </Badge>
                  </div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">
                    {dashboardData.financialMetrics.grossMargin}%
                  </div>
                  <Progress value={dashboardData.financialMetrics.grossMargin} className="h-2" />
                </div>

                <div className="space-y-3 p-4 rounded-xl bg-gradient-to-br from-blue-50/50 to-transparent border border-blue-100/50">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-muted-foreground">Margem Operacional</span>
                    <Badge className="bg-blue-100 text-blue-700 border-0">
                      Crescendo
                    </Badge>
                  </div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                    {dashboardData.financialMetrics.operatingMargin}%
                  </div>
                  <Progress value={dashboardData.financialMetrics.operatingMargin * 5} className="h-2" />
                </div>

                <div className="space-y-3 p-4 rounded-xl bg-gradient-to-br from-purple-50/50 to-transparent border border-purple-100/50">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-semibold text-muted-foreground">EBITDA</span>
                  </div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent">
                    R$ {(dashboardData.financialMetrics.ebitda / 1000000).toFixed(1)}M
                  </div>
                  <span className="text-xs text-muted-foreground">+12.5% vs mês anterior</span>
                </div>

                <div className="space-y-3 p-4 rounded-xl bg-gradient-to-br from-amber-50/50 to-transparent border border-amber-100/50">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-semibold text-muted-foreground">ROE</span>
                  </div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent">
                    {dashboardData.financialMetrics.roe}%
                  </div>
                  <span className="text-xs text-muted-foreground">Acima da média</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Operational Indicators Card */}
          <Card className="group relative border-0 shadow-elegant hover:shadow-glow transition-all duration-500 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-azure-500/10 via-transparent to-azure-600/5" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.1),transparent_50%)]" />
            
            <CardHeader className="relative border-b border-azure-100/50 bg-gradient-to-r from-azure-50/50 to-transparent backdrop-blur-sm">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-ocean shadow-soft">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-azure-700 to-azure-600 bg-clip-text text-transparent">
                  Indicadores Operacionais
                </span>
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Métricas essenciais de performance
              </CardDescription>
            </CardHeader>
            
            <CardContent className="relative p-6">
              <div className="space-y-4">
                {operationalData.map((item, index) => (
                  <div 
                    key={index} 
                    className="group/item p-4 rounded-xl border border-border/50 hover:border-azure-300 hover:shadow-soft transition-all duration-300 bg-gradient-to-r from-background to-azure-50/30"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full shadow-lg ${
                          item.status === "success" ? "bg-emerald-500 shadow-emerald-500/50" :
                            item.status === "warning" ? "bg-amber-500 shadow-amber-500/50" : 
                              "bg-red-500 shadow-red-500/50"
                        }`} />
                        <span className="text-sm font-semibold text-foreground">{item.metric}</span>
                      </div>
                      {item.status === "success" && (
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                      )}
                    </div>
                    
                    <div className="flex items-end justify-between">
                      <div className="space-y-1">
                        <div className="text-2xl font-bold text-foreground">{item.value}%</div>
                        <div className="text-xs text-muted-foreground">Meta: {item.target}%</div>
                      </div>
                      <Progress value={item.value} className="w-32 h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Operational Modules Grid */}
        <div className="relative animate-fade-in">
          <div className="absolute -inset-1 bg-gradient-ocean rounded-3xl opacity-10 blur-2xl" />
          
          <Card className="relative border-0 shadow-elegant overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-azure-500/5 via-transparent to-azure-600/5" />
            
            <CardHeader className="relative border-b bg-gradient-to-r from-azure-50 via-background to-transparent backdrop-blur-sm">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <CardTitle className="text-3xl flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-gradient-ocean shadow-glow">
                      <Globe className="w-7 h-7 text-primary-foreground" />
                    </div>
                    <span className="bg-gradient-to-r from-azure-700 to-azure-600 bg-clip-text text-transparent">
                      Módulos Operacionais
                    </span>
                  </CardTitle>
                  <CardDescription className="text-base text-muted-foreground">
                    Centro de controle integrado - {quickActions.length} módulos ativos e operacionais
                  </CardDescription>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge className="bg-gradient-to-r from-azure-600 to-azure-500 text-white border-0 shadow-soft">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Sistema Completo
                  </Badge>
                  <Badge variant="outline" className="border-azure-300 text-azure-700">
                    100% Online
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="relative p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {quickActions.map((action, index) => (
                  <Link 
                    key={index} 
                    to={action.path}
                    className="block"
                  >
                    <Card className="group relative hover:shadow-glow transition-all duration-500 cursor-pointer border-0 overflow-hidden bg-card/50 backdrop-blur-sm h-full"
                    >
                      {/* Gradient Overlay */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                    
                      {/* Corner Accent */}
                      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-transparent to-azure-500/5 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                      <CardContent className="relative p-6 space-y-4">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div className={`p-4 rounded-2xl bg-gradient-to-br ${action.color} text-white shadow-soft group-hover:shadow-glow group-hover:scale-110 transition-all duration-500`}>
                            <action.icon className="w-7 h-7" />
                          </div>
                          <Badge 
                            variant="secondary" 
                            className="backdrop-blur-sm bg-azure-50/80 border-azure-200 text-azure-700 font-semibold"
                          >
                            {action.count}
                          </Badge>
                        </div>

                        {/* Content */}
                        <div className="space-y-3">
                          <div>
                            <h3 className="font-bold text-lg mb-1 group-hover:text-azure-600 transition-colors">
                              {action.title}
                            </h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {action.description}
                            </p>
                          </div>

                          {/* Metrics */}
                          <div className="space-y-2 pt-2 border-t border-border/50">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium text-foreground">{action.subtitle}</span>
                              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-azure-600 group-hover:translate-x-1 transition-all" />
                            </div>
                            <div className="flex items-center gap-2 text-xs bg-gradient-to-r from-azure-50 to-transparent p-2.5 rounded-lg border border-azure-100">
                              <Zap className="w-3 h-3 text-azure-600" />
                              <span className="font-medium text-azure-700">{action.metric}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts & Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
          {/* Performance Chart */}
          <Card className="group relative border-0 shadow-elegant hover:shadow-glow transition-all duration-500 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-blue-600/5" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.1),transparent_50%)]" />
            
            <CardHeader className="relative border-b bg-gradient-to-r from-blue-50/50 to-transparent backdrop-blur-sm">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-soft">
                  <LineChart className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-700 to-blue-600 bg-clip-text text-transparent">
                  Performance em Tempo Real
                </span>
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Monitoramento 24/7 do sistema operacional
              </CardDescription>
            </CardHeader>
            
            <CardContent className="relative p-6">
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={performanceData}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--azure-500))" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(var(--azure-500))" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorPerformance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis 
                    dataKey="time" 
                    stroke="hsl(var(--muted-foreground))" 
                    style={{ fontSize: "12px", fontWeight: 500 }}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))" 
                    style={{ fontSize: "12px", fontWeight: 500 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--azure-200))",
                      borderRadius: "12px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                    }}
                    labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="users" 
                    stroke="hsl(var(--azure-500))" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorUsers)" 
                    name="Usuários Ativos" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="performance" 
                    stroke="hsl(var(--success))" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorPerformance)" 
                    name="Performance %" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Module Distribution Chart */}
          <Card className="group relative border-0 shadow-elegant hover:shadow-glow transition-all duration-500 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-purple-600/5" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.1),transparent_50%)]" />
            
            <CardHeader className="relative border-b bg-gradient-to-r from-purple-50/50 to-transparent backdrop-blur-sm">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-soft">
                  <PieChart className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-purple-700 to-purple-600 bg-clip-text text-transparent">
                  Distribuição de Módulos
                </span>
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Análise de uso por categoria do sistema
              </CardDescription>
            </CardHeader>
            
            <CardContent className="relative p-6">
              <ResponsiveContainer width="100%" height={320}>
                <RechartsPieChart>
                  <Pie
                    data={moduleUsageData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                    labelLine={false}
                  >
                    {moduleUsageData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color}
                        stroke="white"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--purple-200))",
                      borderRadius: "12px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                    }}
                    labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
              
              {/* Legend */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                {moduleUsageData.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-r from-background to-purple-50/30 border border-purple-100/50">
                    <div 
                      className="w-3 h-3 rounded-full shadow-sm" 
                      style={{ backgroundColor: item.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-foreground truncate">{item.name}</div>
                      <div className="text-xs text-emerald-600 font-semibold">+{item.growth}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts and Activities Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
          {/* System Alerts */}
          <Card className="group relative border-0 shadow-elegant hover:shadow-glow transition-all duration-500 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-amber-600/5" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.08),transparent_50%)]" />
            
            <CardHeader className="relative border-b bg-gradient-to-r from-amber-50/50 to-transparent backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 shadow-soft">
                      <AlertTriangle className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-amber-700 to-amber-600 bg-clip-text text-transparent">
                      Alertas do Sistema
                    </span>
                  </CardTitle>
                  <CardDescription className="text-muted-foreground mt-1">
                    Notificações importantes e pendências
                  </CardDescription>
                </div>
                <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                  {dashboardData.alerts.length} novos
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="relative p-6">
              <div className="space-y-3">
                {dashboardData.alerts.slice(0, 4).map((alert) => (
                  <div 
                    key={alert.id} 
                    className="group/alert p-4 rounded-xl border border-border/50 hover:border-amber-300 hover:shadow-soft transition-all duration-300 bg-gradient-to-r from-background to-amber-50/20 cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">{getStatusIcon(alert.type)}</div>
                      <div className="flex-1 space-y-2">
                        <div className="font-medium text-sm leading-relaxed text-foreground">
                          {alert.title}
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="text-xs border-azure-200 bg-azure-50 text-azure-700">
                            <Building2 className="w-3 h-3 mr-1" />
                            {alert.module.toUpperCase()}
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              alert.priority === "high" 
                                ? "border-red-200 bg-red-50 text-red-700" :
                                alert.priority === "medium" 
                                  ? "border-amber-200 bg-amber-50 text-amber-700" :
                                  "border-gray-200 bg-gray-50 text-gray-700"
                            }`}
                          >
                            {alert.priority === "high" ? "🔴 Alta" : 
                              alert.priority === "medium" ? "🟡 Média" : "⚪ Baixa"}
                          </Badge>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover/alert:text-amber-600 group-hover/alert:translate-x-1 transition-all" />
                    </div>
                  </div>
                ))}
              </div>
              
              <Button 
                variant="outline" 
                className="w-full mt-4 border-amber-200 hover:bg-amber-50 text-amber-700"
              >
                Ver todos os alertas
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card className="group relative border-0 shadow-elegant hover:shadow-glow transition-all duration-500 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-emerald-600/5" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.08),transparent_50%)]" />
            
            <CardHeader className="relative border-b bg-gradient-to-r from-emerald-50/50 to-transparent backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-soft">
                      <Activity className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-emerald-700 to-emerald-600 bg-clip-text text-transparent">
                      Atividades Recentes
                    </span>
                  </CardTitle>
                  <CardDescription className="text-muted-foreground mt-1">
                    Timeline de operações do sistema
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-xs font-medium text-emerald-700">Ao vivo</span>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="relative p-6">
              <div className="space-y-3">
                {dashboardData.recentActivities.slice(0, 4).map((activity) => (
                  <div 
                    key={activity.id} 
                    className="group/activity p-4 rounded-xl border border-border/50 hover:border-emerald-300 hover:shadow-soft transition-all duration-300 bg-gradient-to-r from-background to-emerald-50/20"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">{getActivityIcon(activity.type)}</div>
                      <div className="flex-1 space-y-2">
                        <div className="font-medium text-sm leading-relaxed text-foreground">
                          {activity.action}
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="text-xs border-azure-200 bg-azure-50 text-azure-700">
                            <Users className="w-3 h-3 mr-1" />
                            {activity.user}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {activity.time}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <Button 
                variant="outline" 
                className="w-full mt-4 border-emerald-200 hover:bg-emerald-50 text-emerald-700"
              >
                Ver histórico completo
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced System Health Monitor */}
        <SystemStatusDashboard />

      </div>
    </div>
  );
};

export default EnhancedUnifiedDashboard;