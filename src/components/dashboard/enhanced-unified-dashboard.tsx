import React, { useState, useMemo, memo, useCallback, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { useOptimizedPolling } from "@/hooks/use-optimized-polling";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useNavigate, Link } from "react-router-dom";
import { 
  LayoutDashboard, TrendingUp, Users, DollarSign, Bell, AlertTriangle, 
  CheckCircle, Calendar, BarChart3, Activity, Clock, Target, Zap, Globe, 
  ArrowRight, RefreshCw, Crown, Shield, Ship, FileText, Brain, Anchor,
  MapPin, Award, Building2, Eye, PieChart, LineChart, AlertCircle
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, PieChart as RechartsPieChart, Pie, Cell } from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { useTenant } from "@/contexts/TenantContext";
import { useToast } from "@/hooks/use-toast";
import { EnhancedDashboardFilters } from "./enhanced-dashboard-filters";
import nautilusLogoNew from "@/assets/nautilus-logo-new.png";
import { motion } from "framer-motion";

import ProfessionalKPICards from "@/components/ui/professional-kpi-cards";
import SystemStatusDashboard from "@/components/ui/system-status-dashboard";
import ExecutiveMetricsPanel from "@/components/ui/executive-metrics-panel";

/* ─── Animations ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
  })
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } }
};

/* ─── Data Hooks ─── */
function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-aggregated-kpis'],
    queryFn: async () => {
      // Use aggregated RPC for a single round-trip instead of 10+ queries
      const { data: kpis, error: kpiError } = await supabase.rpc("get_dashboard_kpis");

      // Fetch recent alerts and activities in parallel
      const [incidents, recentLogs] = await Promise.all([
        supabase.from('soc_alerts').select('id, title, severity, created_at').is('resolved_at', null).order('created_at', { ascending: false }).limit(6),
        supabase.from('access_logs').select('id, action, module_accessed, timestamp, user_id').order('timestamp', { ascending: false }).limit(6),
      ]);

      const k = (kpis as Record<string, number | string>) ?? {};

      // Build real alerts
      const realAlerts: Array<{ id: string; title: string; type: string; priority: string; module: string }> = [];
      (incidents.data ?? []).forEach(inc => {
        realAlerts.push({
          id: inc.id,
          title: inc.title || 'Alerta aberto',
          type: inc.severity === 'critical' ? 'warning' : 'info',
          priority: inc.severity === 'critical' ? 'high' : 'medium',
          module: 'SOC',
        });
      });

      // Build real activities
      const realActivities = (recentLogs.data ?? []).map(log => ({
        id: log.id,
        user: log.user_id?.slice(0, 8) || 'System',
        action: log.action,
        time: getTimeAgo(log.timestamp),
        type: log.module_accessed?.toLowerCase() || 'system',
      }));

      return {
        vessels_total: Number(k.vessels_total) || 0,
        vessels_active: Number(k.vessels_active) || 0,
        vessel_utilization: Number(k.vessel_utilization) || 0,
        crew_onboard: Number(k.crew_onboard) || 0,
        crew_total: Number(k.crew_total) || 0,
        crew_on_leave: Number(k.crew_on_leave) || 0,
        maint_pending: Number(k.maint_pending) || 0,
        maint_overdue: Number(k.maint_overdue) || 0,
        certs_expiring_30: Number(k.certs_expiring_30) || 0,
        certs_expiring_90: Number(k.certs_expiring_90) || 0,
        certs_expired: Number(k.certs_expired) || 0,
        incidents_open: Number(k.incidents_open) || 0,
        total_expenses: Number(k.expenses_30d) || 0,
        compliance_score: Number(k.compliance_score) || 100,
        safety_score: Number(k.safety_score) || 100,
        audits_count: Number(k.audits_total) || 0,
        docs_count: Number(k.docs_total) || 0,
        voyages_active: Number(k.voyages_active) || 0,
        ncs_open: Number(k.ncs_open) || 0,
        alerts: realAlerts,
        activities: realActivities,
        vessels_data: [] as Array<{ status: string }>,
      };
    },
    staleTime: 1000 * 60 * 2,
    refetchInterval: 1000 * 60 * 5,
  });
}

function getTimeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'agora';
  if (mins < 60) return `${mins}min atrás`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h atrás`;
  return `${Math.floor(hours / 24)}d atrás`;
}

/* ─── Memoized Sub-components ─── */
const ModuleCard = memo(({ action, t }: { action: any; t: any }) => (
  <Link to={action.path} className="block">
    <Card className="group relative hover:shadow-glow transition-all duration-500 cursor-pointer border-0 overflow-hidden bg-card/50 backdrop-blur-sm h-full">
      <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-transparent to-azure-500/5 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />
      <CardContent className="relative p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className={`p-4 rounded-2xl bg-gradient-to-br ${action.color} text-white shadow-soft group-hover:shadow-glow group-hover:scale-110 transition-all duration-500`}>
            <action.icon className="w-7 h-7" />
          </div>
          <Badge variant="secondary" className="backdrop-blur-sm bg-azure-50/80 border-azure-200 text-azure-700 font-semibold">
            {action.count}
          </Badge>
        </div>
        <div className="space-y-3">
          <div>
            <h3 className="font-bold text-lg mb-1 group-hover:text-azure-600 transition-colors">{action.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{action.description}</p>
          </div>
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
));
ModuleCard.displayName = "ModuleCard";

/* ─── Main Dashboard ─── */
const EnhancedUnifiedDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentTenant, currentBranding, currentUser, tenantUsage } = useTenant();
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedKPIs, setSelectedKPIs] = useState(["revenue", "employees", "efficiency", "satisfaction"]);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isAutoUpdate, setIsAutoUpdate] = useState(true);
  const [filterPeriod, setFilterPeriod] = useState("30d");

  const { data: realStats, isLoading: isStatsLoading, refetch: refetchStats } = useDashboardStats();

  const dashboardData = useMemo(() => ({
    kpis: {
      revenue: { value: realStats?.total_expenses ?? 0, change: 0, status: "up", target: 3000000 },
      employees: { value: realStats?.crew_total ?? 0, active: realStats?.crew_onboard ?? 0, onLeave: realStats?.crew_on_leave ?? 0 },
      efficiency: { value: realStats?.maint_overdue === 0 ? 99 : Math.max(70, 100 - (realStats?.maint_overdue ?? 0) * 5), target: 95 },
    },
    operationalMetrics: {
      vesselUtilization: realStats?.vessel_utilization ?? 0,
      safetyScore: realStats?.safety_score ?? 100,
      complianceRate: realStats?.compliance_score ?? 100,
    },
    alerts: realStats?.alerts ?? [],
    recentActivities: realStats?.activities ?? [],
    systemHealth: {
      uptime: 99.9,
      activeUsers: tenantUsage?.active_users || 0,
    },
    moduleStats: {
      peotram: { audits: realStats?.audits_count ?? 0, completion: 0, avgScore: 0, nonConformities: 0 },
      fleet: { vessels: realStats?.vessels_total ?? 0, routes: 0 },
      documents: { processed: realStats?.docs_count ?? 0, ai_analyzed: 0, compliance: 0, digital: 0 },
      reports: { generated: tenantUsage?.reports_generated || 0, automated: 0, real_time: 0 },
    },
    financialMetrics: {
      grossMargin: 0, operatingMargin: 0, ebitda: realStats?.total_expenses ?? 0, roe: 0,
    },
  }), [realStats, tenantUsage]);

  const performanceData = useMemo(() => [
    { time: "00:00", users: 15, performance: 95.2 },
    { time: "04:00", users: 8, performance: 97.1 },
    { time: "08:00", users: 35, performance: 91.3 },
    { time: "12:00", users: 45, performance: 88.7 },
    { time: "16:00", users: 38, performance: 93.4 },
    { time: "20:00", users: 25, performance: 96.8 },
  ], []);

  const moduleUsageData = useMemo(() => [
    { name: "PEOTRAM", value: 35, color: "hsl(221, 83%, 53%)", growth: 12.5 },
    { name: "Fleet", value: 28, color: "hsl(262, 83%, 58%)", growth: 8.3 },
    { name: "HR & Certs", value: 20, color: "hsl(160, 84%, 39%)", growth: 15.2 },
    { name: "Analytics", value: 17, color: "hsl(0, 72%, 51%)", growth: 22.1 },
  ], []);

  const operationalData = useMemo(() => [
    { metric: t('ui.vesselUtilization'), value: dashboardData.operationalMetrics.vesselUtilization || 87.3, target: 90, status: "warning" as const },
    { metric: t('ui.fuelEfficiency'), value: 92.1, target: 88, status: "success" as const },
    { metric: t('ui.safetyScore'), value: dashboardData.operationalMetrics.safetyScore, target: 95, status: "success" as const },
    { metric: t('ui.complianceRate'), value: dashboardData.operationalMetrics.complianceRate, target: 98, status: "success" as const },
  ], [t, dashboardData.operationalMetrics]);

  const quickActions = useMemo(() => [
    { title: t('ui.peotramAudits'), description: t('ui.completeAuditSystem'), icon: FileText, path: "/peotram", color: "from-blue-600 to-blue-700", count: dashboardData.moduleStats.peotram.audits, subtitle: t('ui.avgScore', { score: 0 }), metric: t('ui.completed', { percent: 0 }) },
    { title: t('ui.fleetManagement'), description: t('ui.advancedVesselMonitoring'), icon: Ship, path: "/fleet-dashboard", color: "from-purple-600 to-purple-700", count: dashboardData.moduleStats.fleet.vessels, subtitle: t('ui.utilization', { percent: dashboardData.operationalMetrics.vesselUtilization }), metric: t('ui.activeRoutes', { count: 0 }) },
    { title: t('ui.advancedAnalytics'), description: t('ui.businessIntelligenceReports'), icon: BarChart3, path: "/advanced-analytics", color: "from-green-600 to-green-700", count: dashboardData.moduleStats.reports.generated, subtitle: t('ui.automatic', { count: 0 }), metric: t('ui.realTime', { count: 0 }) },
    { title: t('ui.aiAutomation'), description: t('ui.appliedAI'), icon: Brain, path: "/ai-insights", color: "from-cyan-600 to-cyan-700", count: dashboardData.moduleStats.documents.ai_analyzed, subtitle: t('ui.compliance', { percent: 0 }), metric: t('ui.digitized', { percent: 0 }) },
    { title: t('ui.maritimeCenter'), description: t('ui.completeOpsHub'), icon: Anchor, path: "/maritime-command", color: "from-indigo-600 to-indigo-700", count: dashboardData.systemHealth.activeUsers, subtitle: t('ui.safety', { percent: dashboardData.operationalMetrics.safetyScore }), metric: t('ui.availability', { percent: dashboardData.systemHealth.uptime }) },
    { title: t('ui.smartScanner'), description: t('ui.aiDocumentProcessing'), icon: Zap, path: "/documents", color: "from-orange-600 to-orange-700", count: dashboardData.moduleStats.documents.processed, subtitle: t('ui.analyzed', { count: 0 }), metric: t('ui.precision') },
  ], [t, dashboardData]);

  const refreshData = useCallback(async () => {
    setIsRefreshing(true);
    await refetchStats();
    setLastUpdated(new Date());
    setIsRefreshing(false);
    toast({ title: t('ui.dashboardUpdated'), description: t('ui.realDataUpdated') });
  }, [refetchStats, toast, t]);

  const handleKPIToggle = useCallback((kpi: string) => {
    setSelectedKPIs(prev => prev.includes(kpi) ? prev.filter(k => k !== kpi) : [...prev, kpi]);
  }, []);

  useOptimizedPolling({ id: "enhanced-unified-dashboard-refresh", callback: refreshData, interval: 60000, enabled: isAutoUpdate });

  const getStatusIcon = useCallback((type: string) => {
    switch (type) {
      case "warning": return <AlertTriangle className="w-4 h-4 text-warning" />;
      case "success": return <CheckCircle className="w-4 h-4 text-success" />;
      case "info": return <Bell className="w-4 h-4 text-info" />;
      default: return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
    }
  }, []);

  const getActivityIcon = useCallback((type: string) => {
    switch (type) {
      case "peotram": return <FileText className="w-4 h-4 text-info" />;
      case "fleet": return <Ship className="w-4 h-4 text-primary" />;
      case "certificate": return <Award className="w-4 h-4 text-success" />;
      case "safety": return <Shield className="w-4 h-4 text-destructive" />;
      default: return <Activity className="w-4 h-4 text-muted-foreground" />;
    }
  }, []);

  const displayName = currentBranding?.company_name || currentTenant?.name || "Nauti One";
  const userDisplayName = currentUser?.display_name || user?.email?.split("@")[0] || "Usuário";

  return (
    <div className="min-h-screen bg-gradient-to-br from-azure-50 via-background to-azure-100 relative overflow-hidden">
      {/* Ambient background */}
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

        {/* Hero Header with cinematic entrance */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative"
        >
          <div className="absolute -inset-1 bg-gradient-ocean rounded-3xl opacity-20 blur-2xl" />
          <Card className="relative border-0 shadow-elegant bg-card/80 backdrop-blur-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-azure-500/5 via-transparent to-azure-600/5 rounded-3xl" />
            <CardContent className="relative p-8 md:p-10">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="flex items-start gap-6 flex-1">
                  <motion.div 
                    className="relative group"
                    whileHover={{ scale: 1.05, rotate: 2 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-azure-400 to-azure-600 rounded-2xl blur-xl opacity-60 group-hover:opacity-100 transition-opacity" />
                    <div className="relative p-4 rounded-2xl bg-background shadow-glow backdrop-blur-sm">
                      <img src={nautilusLogoNew} alt="Nauti One" className="w-14 h-14 object-contain" />
                    </div>
                  </motion.div>
                  <div className="flex-1">
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-azure-700 via-azure-600 to-azure-500 bg-clip-text text-transparent mb-3">
                      {displayName}
                    </h1>
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      <Badge className="bg-gradient-to-r from-azure-600 to-azure-500 text-white border-0 shadow-soft">
                        <Crown className="w-3 h-3 mr-1" />
                        {t('ui.integratedMaritimeSystem')}
                      </Badge>
                      {currentTenant?.plan_type && (
                        <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 text-white border-0">
                          <Award className="w-3 h-3 mr-1" />
                          {currentTenant.plan_type.charAt(0).toUpperCase() + currentTenant.plan_type.slice(1)}
                        </Badge>
                      )}
                      <Badge variant="secondary" className="backdrop-blur-sm bg-azure-100/80">
                        <Activity className="w-3 h-3 mr-1 text-azure-600" />
                        {t('ui.activeUsers', { count: dashboardData.systemHealth.activeUsers })}
                      </Badge>
                    </div>
                    <p className="text-lg text-muted-foreground max-w-2xl">
                      {t('ui.welcomeBack')}, <strong className="text-foreground">{userDisplayName}</strong>!
                      <br />
                      <span className="text-azure-600 font-medium">{t('ui.executivePanel')}</span>
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-4 min-w-fit">
                  <div className="flex items-center gap-3">
                    <Button variant="outline" onClick={refreshData} disabled={isRefreshing} className="bg-white/80 backdrop-blur-sm hover:bg-azure-50 border-azure-200 shadow-soft">
                      <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                      {t('ui.refreshData')}
                    </Button>
                    <Button onClick={() => navigate("/command?tab=executive")} className="bg-gradient-ocean text-white hover:shadow-glow shadow-azure">
                      <Target className="w-4 h-4 mr-2" />
                      {t('ui.executiveView')}
                    </Button>
                  </div>
                  <div className="text-right space-y-2">
                    <div className="text-sm text-muted-foreground">
                      {t('ui.lastUpdate')}: <span className="font-medium text-foreground">{lastUpdated.toLocaleTimeString()}</span>
                    </div>
                    <div className="flex items-center justify-end gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/20">
                      <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                      <span className="text-sm font-medium text-success">
                        {t('ui.systemOperational')} - {dashboardData.systemHealth.uptime}% {t('ui.uptime')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* KPI Cards */}
        <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
          <ProfessionalKPICards />
        </motion.div>

        {/* Executive Metrics */}
        <ExecutiveMetricsPanel />

        {/* Financial + Operational Grid */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
        >
          {/* Financial Performance */}
          <motion.div variants={fadeUp} custom={0}>
            <Card className="group relative border-0 shadow-elegant hover:shadow-glow transition-all duration-500 overflow-hidden h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-emerald-600/5" />
              <CardHeader className="relative border-b border-emerald-100/50 bg-gradient-to-r from-emerald-50/50 to-transparent backdrop-blur-sm">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-soft">
                    <DollarSign className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-emerald-700 to-emerald-600 bg-clip-text text-transparent">
                    {t('ui.financialPerformance')}
                  </span>
                </CardTitle>
                <CardDescription>{t('ui.strategicPerformanceIndicators')}</CardDescription>
              </CardHeader>
              <CardContent className="relative p-6">
                <div className="grid grid-cols-2 gap-6">
                  {[
                    { label: t('ui.grossMargin'), value: `${dashboardData.financialMetrics.grossMargin}%`, badge: t('ui.high'), color: "emerald" },
                    { label: t('ui.operatingMargin'), value: `${dashboardData.financialMetrics.operatingMargin}%`, badge: t('ui.growing'), color: "info" },
                    { label: "EBITDA", value: `R$ ${(dashboardData.financialMetrics.ebitda / 1000000).toFixed(1)}M`, icon: TrendingUp, color: "accent" },
                    { label: "ROE", value: `${dashboardData.financialMetrics.roe}%`, icon: Target, color: "warning" },
                  ].map((item, i) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="space-y-3 p-4 rounded-xl bg-gradient-to-br from-background to-muted/30 border border-border/50 hover:border-primary/30 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-muted-foreground">{item.label}</span>
                        {item.badge && <Badge className="bg-success/10 text-success border-0 text-xs">{item.badge}</Badge>}
                      </div>
                      <div className="text-3xl font-bold text-foreground">{item.value}</div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Operational Indicators */}
          <motion.div variants={fadeUp} custom={1}>
            <Card className="group relative border-0 shadow-elegant hover:shadow-glow transition-all duration-500 overflow-hidden h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-azure-500/10 via-transparent to-azure-600/5" />
              <CardHeader className="relative border-b border-azure-100/50 bg-gradient-to-r from-azure-50/50 to-transparent backdrop-blur-sm">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-ocean shadow-soft">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-azure-700 to-azure-600 bg-clip-text text-transparent">
                    {t('ui.operationalIndicators')}
                  </span>
                </CardTitle>
                <CardDescription>{t('ui.essentialPerformanceMetrics')}</CardDescription>
              </CardHeader>
              <CardContent className="relative p-6">
                <div className="space-y-4">
                  {operationalData.map((item, i) => (
                    <motion.div
                      key={item.metric}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="group/item p-4 rounded-xl border border-border/50 hover:border-azure-300 hover:shadow-soft transition-all duration-300 bg-gradient-to-r from-background to-azure-50/30"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full shadow-lg ${
                            item.status === "success" ? "bg-success shadow-success/50" : "bg-warning shadow-warning/50"
                          }`} />
                          <span className="text-sm font-semibold text-foreground">{item.metric}</span>
                        </div>
                        {item.status === "success" && <CheckCircle className="w-4 h-4 text-success" />}
                      </div>
                      <div className="flex items-end justify-between">
                        <div className="space-y-1">
                          <div className="text-2xl font-bold text-foreground">{item.value}%</div>
                          <div className="text-xs text-muted-foreground">{t('ui.target')}: {item.target}%</div>
                        </div>
                        <Progress value={item.value} className="w-32 h-2" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Operational Modules Grid */}
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
          className="relative"
        >
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
                      {t('ui.operationalModules')}
                    </span>
                  </CardTitle>
                  <CardDescription className="text-base">{t('ui.integratedControlCenter', { count: quickActions.length })}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-gradient-to-r from-azure-600 to-azure-500 text-white border-0 shadow-soft">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {t('ui.systemComplete')}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {quickActions.map((action, i) => (
                  <motion.div key={action.path} variants={fadeUp} custom={i}>
                    <ModuleCard action={action} t={t} />
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Charts Section */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
        >
          {/* Performance Chart */}
          <motion.div variants={fadeUp} custom={0}>
            <Card className="border-0 shadow-elegant hover:shadow-glow transition-all duration-500 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-blue-600/5" />
              <CardHeader className="relative border-b bg-gradient-to-r from-blue-50/50 to-transparent">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-soft">
                    <LineChart className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-700 to-blue-600 bg-clip-text text-transparent">
                    {t('ui.realTimePerformance')}
                  </span>
                </CardTitle>
                <CardDescription>{t('ui.monitoring247')}</CardDescription>
              </CardHeader>
              <CardContent className="relative p-6">
                <ResponsiveContainer width="100%" height={320}>
                  <AreaChart data={performanceData}>
                    <defs>
                      <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(214, 84%, 46%)" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="hsl(214, 84%, 46%)" stopOpacity={0.05} />
                      </linearGradient>
                      <linearGradient id="colorPerf" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 85%)" opacity={0.3} />
                    <XAxis dataKey="time" stroke="hsl(220, 20%, 28%)" style={{ fontSize: "12px" }} />
                    <YAxis stroke="hsl(220, 20%, 28%)" style={{ fontSize: "12px" }} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(0, 0%, 100%)", border: "1px solid hsl(214, 87%, 85%)", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
                    <Area type="monotone" dataKey="users" stroke="hsl(214, 84%, 46%)" strokeWidth={2} fillOpacity={1} fill="url(#colorUsers)" name={t('ui.activeUsersChart')} />
                    <Area type="monotone" dataKey="performance" stroke="hsl(142, 76%, 36%)" strokeWidth={2} fillOpacity={1} fill="url(#colorPerf)" name={t('ui.performancePercent')} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Module Distribution */}
          <motion.div variants={fadeUp} custom={1}>
            <Card className="border-0 shadow-elegant hover:shadow-glow transition-all duration-500 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-purple-600/5" />
              <CardHeader className="relative border-b bg-gradient-to-r from-purple-50/50 to-transparent">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-soft">
                    <PieChart className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-purple-700 to-purple-600 bg-clip-text text-transparent">
                    {t('ui.moduleDistribution')}
                  </span>
                </CardTitle>
                <CardDescription>{t('ui.usageAnalysisByCategory')}</CardDescription>
              </CardHeader>
              <CardContent className="relative p-6">
                <ResponsiveContainer width="100%" height={320}>
                  <RechartsPieChart>
                    <Pie data={moduleUsageData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}%`} labelLine={false}>
                      {moduleUsageData.map((entry, index) => (
                        <Cell key={`cell-${entry.name}`} fill={entry.color} stroke="white" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "hsl(0, 0%, 100%)", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
                  </RechartsPieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-3 mt-4">
                  {moduleUsageData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-r from-background to-purple-50/30 border border-border/50">
                      <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: item.color }} />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-foreground truncate">{item.name}</div>
                        <div className="text-xs text-success font-semibold">+{item.growth}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Alerts and Activities - Real Data */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
        >
          {/* System Alerts */}
          <motion.div variants={fadeUp} custom={0}>
            <Card className="border-0 shadow-elegant hover:shadow-glow transition-all duration-500 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-amber-600/5" />
              <CardHeader className="relative border-b bg-gradient-to-r from-amber-50/50 to-transparent backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 shadow-soft">
                        <AlertTriangle className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-xl font-bold bg-gradient-to-r from-amber-700 to-amber-600 bg-clip-text text-transparent">
                        {t('ui.systemAlerts')}
                      </span>
                    </CardTitle>
                    <CardDescription className="mt-1">{t('ui.importantNotificationsAndPending')}</CardDescription>
                  </div>
                  <Badge className="bg-warning/10 text-warning border-warning/20">
                    {dashboardData.alerts.length} {t('ui.new')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="relative p-6">
                <div className="space-y-3">
                  {dashboardData.alerts.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle className="w-10 h-10 mx-auto mb-3 text-success" />
                      <p className="font-medium">{t('ui.noActiveAlerts') || 'Nenhum alerta ativo'}</p>
                      <p className="text-sm mt-1">{t('ui.allSystemsNormal') || 'Todos os sistemas estão operando normalmente'}</p>
                    </div>
                  ) : (
                    dashboardData.alerts.slice(0, 4).map((alert, i) => (
                      <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="group/alert p-4 rounded-xl border border-border/50 hover:border-amber-300 hover:shadow-soft transition-all duration-300 bg-gradient-to-r from-background to-amber-50/20 cursor-pointer"
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">{getStatusIcon(alert.type)}</div>
                          <div className="flex-1 space-y-2">
                            <div className="font-medium text-sm leading-relaxed text-foreground">{alert.title}</div>
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className="text-xs border-azure-200 bg-azure-50 text-azure-700">
                                <Building2 className="w-3 h-3 mr-1" />
                                {alert.module}
                              </Badge>
                              <Badge variant="outline" className={`text-xs ${
                                alert.priority === "high" ? "border-destructive/20 bg-destructive/5 text-destructive" :
                                alert.priority === "medium" ? "border-warning/20 bg-warning/5 text-warning" :
                                "border-border bg-muted text-muted-foreground"
                              }`}>
                                {alert.priority === "high" ? t('ui.priorityHigh') : alert.priority === "medium" ? t('ui.priorityMedium') : t('ui.priorityLow')}
                              </Badge>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover/alert:text-warning group-hover/alert:translate-x-1 transition-all" />
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
                <Button variant="outline" className="w-full mt-4 border-warning/20 hover:bg-warning/5 text-warning" onClick={() => navigate('/command?tab=alerts')}>
                  {t('ui.viewAllAlerts')}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Activities - Real Data */}
          <motion.div variants={fadeUp} custom={1}>
            <Card className="border-0 shadow-elegant hover:shadow-glow transition-all duration-500 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-emerald-600/5" />
              <CardHeader className="relative border-b bg-gradient-to-r from-emerald-50/50 to-transparent backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-soft">
                        <Activity className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-xl font-bold bg-gradient-to-r from-emerald-700 to-emerald-600 bg-clip-text text-transparent">
                        {t('ui.recentActivities')}
                      </span>
                    </CardTitle>
                    <CardDescription className="mt-1">{t('ui.systemOperationsTimeline')}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/20">
                    <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                    <span className="text-xs font-medium text-success">{t('ui.live')}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative p-6">
                <div className="space-y-3">
                  {dashboardData.recentActivities.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Clock className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" />
                      <p className="font-medium">{t('ui.noRecentActivities') || 'Nenhuma atividade recente'}</p>
                      <p className="text-sm mt-1">{t('ui.activitiesWillAppear') || 'As atividades aparecerão aqui em tempo real'}</p>
                    </div>
                  ) : (
                    dashboardData.recentActivities.slice(0, 4).map((activity, i) => (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="group/activity p-4 rounded-xl border border-border/50 hover:border-emerald-300 hover:shadow-soft transition-all duration-300 bg-gradient-to-r from-background to-emerald-50/20"
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">{getActivityIcon(activity.type)}</div>
                          <div className="flex-1 space-y-2">
                            <div className="font-medium text-sm leading-relaxed text-foreground">{activity.action}</div>
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
                      </motion.div>
                    ))
                  )}
                </div>
                <Button variant="outline" className="w-full mt-4 border-success/20 hover:bg-success/5 text-success" onClick={() => navigate('/command?tab=activities')}>
                  {t('ui.viewFullHistory')}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* System Health */}
        <SystemStatusDashboard />
      </div>
    </div>
  );
};

export default EnhancedUnifiedDashboard;
