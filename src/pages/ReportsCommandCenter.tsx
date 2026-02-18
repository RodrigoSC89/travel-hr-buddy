/**
 * Reports Command Center - Refactored Orchestrator
 * (~120 lines from 752)
 */
import { useState, useEffect } from "react";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText, BarChart3, TrendingUp, Brain, Sparkles, AlertTriangle, Activity
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { logger } from '@/lib/logger';
import { ReportsTabs } from "./reports/ReportsTabs";
import { CrossModulePanel } from "@/components/integration";

interface AnalyticsData {
  totalReports: number;
  totalInsights: number;
  totalAlerts: number;
  activeAlerts: number;
  totalIncidents: number;
  recentReports: Array<{ id: string; title: string; type: string; generated_at: string }>;
  insightsByCategory: Record<string, number>;
  reportsThisMonth: number;
  reportsLastMonth: number;
  incidentsThisMonth: number;
}

const ReportsCommandCenter = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();

  useEffect(() => { loadAnalyticsData(); }, []);

  const loadAnalyticsData = async () => {
    setIsLoadingAnalytics(true);
    try {
      const now = new Date();
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString();

      const { data: reports } = await supabase.from("ai_reports").select("id, title, type, generated_at").order("generated_at", { ascending: false }).limit(10);
      const { data: insights } = await supabase.from("ai_insights").select("id, category");
      const { data: alerts } = await supabase.from("price_alerts").select("id, is_active");
      const { data: incidents } = await supabase.from("incident_reports").select("id");
      const { count: reportsThisMonth } = await supabase.from("ai_reports").select("*", { count: "exact", head: true }).gte("generated_at", thisMonthStart);
      const { count: reportsLastMonth } = await supabase.from("ai_reports").select("*", { count: "exact", head: true }).gte("generated_at", lastMonthStart).lte("generated_at", lastMonthEnd);
      const { count: incidentsThisMonth } = await supabase.from("incident_reports").select("*", { count: "exact", head: true }).gte("incident_date", thisMonthStart);

      const insightsByCategory = (insights || []).reduce((acc: Record<string, number>, insight: { category: string }) => {
        const cat = insight.category || 'general';
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
      }, {});

      setAnalyticsData({
        totalReports: reports?.length || 0, totalInsights: insights?.length || 0,
        totalAlerts: alerts?.length || 0, activeAlerts: alerts?.filter((a: { is_active: boolean }) => a.is_active)?.length || 0,
        totalIncidents: incidents?.length || 0, recentReports: reports || [], insightsByCategory,
        reportsThisMonth: reportsThisMonth || 0, reportsLastMonth: reportsLastMonth || 0,
        incidentsThisMonth: incidentsThisMonth || 0,
      });
    } catch (error) {
      logger.error("Error loading analytics:", error);
      toast({ title: "Erro", description: "Falha ao carregar dados de analytics", variant: "destructive" });
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  const getGrowthPercentage = () => {
    if (!analyticsData || analyticsData.reportsLastMonth === 0) return null;
    return (((analyticsData.reportsThisMonth - analyticsData.reportsLastMonth) / analyticsData.reportsLastMonth) * 100).toFixed(1);
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = { hr: "Recursos Humanos", operational: "Operacional", analytics: "Analytics", custom: "Personalizado", financial: "Financeiro" };
    return labels[type] || type;
  };

  return (
    <ModulePageWrapper gradient="blue">
      <ModuleHeader
        icon={FileText}
        title="Reports Command Center"
        description="Centro Unificado de Relatórios e Análise de Incidentes com IA"
        gradient="blue"
        badges={[
          { icon: BarChart3, label: "Analytics Avançado" },
          { icon: Brain, label: "IA Reports" },
          { icon: AlertTriangle, label: "Incidentes DP" },
          { icon: Sparkles, label: "Insights Automáticos" }
        ]}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-2 lg:grid-cols-5 w-full max-w-3xl">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Activity className="h-4 w-4" /><span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" /><span className="hidden sm:inline">Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="ai-reports" className="flex items-center gap-2">
            <Brain className="h-4 w-4" /><span className="hidden sm:inline">IA Reports</span>
          </TabsTrigger>
          <TabsTrigger value="incidents" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" /><span className="hidden sm:inline">Incidentes</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" /><span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
        </TabsList>

        <ReportsTabs
          analyticsData={analyticsData}
          isLoadingAnalytics={isLoadingAnalytics}
          onTabChange={setActiveTab}
          getGrowthPercentage={getGrowthPercentage}
          getTypeLabel={getTypeLabel}
        />
      </Tabs>

      {/* Cross-Module Integration — Reports ↔ Analytics ↔ Compliance */}
      <CrossModulePanel
        entityType="document"
        entityId="reports-center"
        showQuickActions={true}
        showActivityFeed={true}
        className="mt-6"
      />
    </ModulePageWrapper>
  );
};

export default ReportsCommandCenter;
