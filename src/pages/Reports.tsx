import React, { useState, useEffect } from "react";
import ReportsDashboard from "@/components/reports/reports-dashboard";
import AIReportGenerator from "@/components/reports/AIReportGenerator";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, BarChart3, TrendingUp, Brain, Sparkles, Calendar, AlertCircle, CheckCircle, Clock, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface AnalyticsData {
  totalReports: number;
  totalInsights: number;
  totalAlerts: number;
  activeAlerts: number;
  recentReports: Array<{
    id: string;
    title: string;
    type: string;
    generated_at: string;
  }>;
  insightsByCategory: Record<string, number>;
  reportsThisMonth: number;
  reportsLastMonth: number;
}

const Reports = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    setIsLoadingAnalytics(true);
    try {
      const now = new Date();
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString();

      // Fetch reports
      const { data: reports, error: reportsError } = await supabase
        .from("ai_reports")
        .select("id, title, type, generated_at")
        .order("generated_at", { ascending: false })
        .limit(10);

      // Fetch insights
      const { data: insights, error: insightsError } = await supabase
        .from("ai_insights")
        .select("id, category");

      // Fetch alerts
      const { data: alerts, error: alertsError } = await supabase
        .from("price_alerts")
        .select("id, is_active");

      // Count reports this month
      const { count: reportsThisMonth } = await supabase
        .from("ai_reports")
        .select("*", { count: "exact", head: true })
        .gte("generated_at", thisMonthStart);

      // Count reports last month
      const { count: reportsLastMonth } = await supabase
        .from("ai_reports")
        .select("*", { count: "exact", head: true })
        .gte("generated_at", lastMonthStart)
        .lte("generated_at", lastMonthEnd);

      // Group insights by category
      const insightsByCategory = (insights || []).reduce((acc: Record<string, number>, insight: { category: string }) => {
        const cat = insight.category || 'general';
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
      }, {});

      setAnalyticsData({
        totalReports: reports?.length || 0,
        totalInsights: insights?.length || 0,
        totalAlerts: alerts?.length || 0,
        activeAlerts: alerts?.filter((a: { is_active: boolean }) => a.is_active)?.length || 0,
        recentReports: reports || [],
        insightsByCategory,
        reportsThisMonth: reportsThisMonth || 0,
        reportsLastMonth: reportsLastMonth || 0
      });
    } catch (error) {
      console.error("Error loading analytics:", error);
      toast({
        title: "Erro",
        description: "Falha ao carregar dados de analytics",
        variant: "destructive"
      });
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  const getGrowthPercentage = () => {
    if (!analyticsData || analyticsData.reportsLastMonth === 0) return null;
    const growth = ((analyticsData.reportsThisMonth - analyticsData.reportsLastMonth) / analyticsData.reportsLastMonth) * 100;
    return growth.toFixed(1);
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      hr: "Recursos Humanos",
      operational: "Operacional",
      analytics: "Analytics",
      custom: "Personalizado",
      financial: "Financeiro"
    };
    return labels[type] || type;
  };

  return (
    <ModulePageWrapper gradient="blue">
      <ModuleHeader
        icon={FileText}
        title="Relatórios"
        description="Análises avançadas e relatórios inteligentes com IA"
        gradient="blue"
        badges={[
          { icon: BarChart3, label: "Analytics Avançado" },
          { icon: Brain, label: "IA Reports" },
          { icon: Sparkles, label: "Insights Automáticos" }
        ]}
      />

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="ai-reports" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            IA Reports
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <ReportsDashboard />
        </TabsContent>

        <TabsContent value="ai-reports">
          <AIReportGenerator />
        </TabsContent>

        <TabsContent value="analytics">
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {isLoadingAnalytics ? (
                <>
                  {[1, 2, 3, 4].map((i) => (
                    <Card key={i}>
                      <CardContent className="pt-6">
                        <Skeleton className="h-8 w-16 mb-2" />
                        <Skeleton className="h-4 w-24" />
                      </CardContent>
                    </Card>
                  ))}
                </>
              ) : (
                <>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold">{analyticsData?.reportsThisMonth || 0}</p>
                          <p className="text-sm text-muted-foreground">Relatórios este mês</p>
                        </div>
                        <FileText className="h-8 w-8 text-primary opacity-50" />
                      </div>
                      {getGrowthPercentage() && (
                        <p className={`text-xs mt-2 ${Number(getGrowthPercentage()) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {Number(getGrowthPercentage()) >= 0 ? '+' : ''}{getGrowthPercentage()}% vs mês anterior
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold">{analyticsData?.totalInsights || 0}</p>
                          <p className="text-sm text-muted-foreground">Insights Gerados</p>
                        </div>
                        <Sparkles className="h-8 w-8 text-yellow-500 opacity-50" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold">{analyticsData?.activeAlerts || 0}</p>
                          <p className="text-sm text-muted-foreground">Alertas Ativos</p>
                        </div>
                        <AlertCircle className="h-8 w-8 text-orange-500 opacity-50" />
                      </div>
                      <p className="text-xs mt-2 text-muted-foreground">
                        de {analyticsData?.totalAlerts || 0} alertas totais
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold">{analyticsData?.totalReports || 0}</p>
                          <p className="text-sm text-muted-foreground">Total de Relatórios</p>
                        </div>
                        <Activity className="h-8 w-8 text-blue-500 opacity-50" />
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Reports */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Relatórios Recentes
                  </CardTitle>
                  <CardDescription>
                    Últimos relatórios gerados pela IA
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingAnalytics ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : analyticsData?.recentReports.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>Nenhum relatório gerado ainda</p>
                      <p className="text-sm">Vá para "IA Reports" para gerar seu primeiro relatório</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {analyticsData?.recentReports.slice(0, 5).map((report) => (
                        <div key={report.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded">
                              <FileText className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{report.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {getTypeLabel(report.type)}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(report.generated_at).toLocaleDateString("pt-BR")}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Insights by Category */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Insights por Categoria
                  </CardTitle>
                  <CardDescription>
                    Distribuição dos insights gerados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingAnalytics ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-10 w-full" />
                      ))}
                    </div>
                  ) : Object.keys(analyticsData?.insightsByCategory || {}).length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>Nenhum insight gerado ainda</p>
                      <p className="text-sm">Os insights serão exibidos aqui conforme são gerados</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {Object.entries(analyticsData?.insightsByCategory || {}).map(([category, count]) => {
                        const total = analyticsData?.totalInsights || 1;
                        const percentage = Math.round((count / total) * 100);
                        return (
                          <div key={category} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="capitalize">{category}</span>
                              <span className="text-muted-foreground">{count} ({percentage}%)</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary rounded-full transition-all"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Performance Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Resumo de Performance
                </CardTitle>
                <CardDescription>
                  Métricas consolidadas do sistema de relatórios
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-green-500/10 rounded-lg">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <p className="text-2xl font-bold">{analyticsData?.totalReports || 0}</p>
                    <p className="text-sm text-muted-foreground">Relatórios Gerados</p>
                  </div>
                  <div className="text-center p-4 bg-blue-500/10 rounded-lg">
                    <Brain className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                    <p className="text-2xl font-bold">{analyticsData?.totalInsights || 0}</p>
                    <p className="text-sm text-muted-foreground">Insights IA</p>
                  </div>
                  <div className="text-center p-4 bg-purple-500/10 rounded-lg">
                    <Calendar className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                    <p className="text-2xl font-bold">{analyticsData?.reportsThisMonth || 0}</p>
                    <p className="text-sm text-muted-foreground">Este Mês</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </ModulePageWrapper>
  );
};

export default Reports;
