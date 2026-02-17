import React from "react";
import { TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FileText, BarChart3, TrendingUp, Brain, Sparkles, Calendar,
  AlertCircle, CheckCircle, Clock, Activity, AlertTriangle, Shield, Target
} from "lucide-react";
import ReportsDashboard from "@/components/reports/reports-dashboard";
import AIReportGenerator from "@/components/reports/AIReportGenerator";

const IncidentCards = () => <div className="text-center py-8 text-muted-foreground">Cards de incidentes não disponíveis.</div>;

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

interface ReportsTabsProps {
  analyticsData: AnalyticsData | null;
  isLoadingAnalytics: boolean;
  onTabChange: (tab: string) => void;
  getGrowthPercentage: () => string | null;
  getTypeLabel: (type: string) => string;
}

export const ReportsTabs: React.FC<ReportsTabsProps> = ({
  analyticsData, isLoadingAnalytics, onTabChange, getGrowthPercentage, getTypeLabel
}) => {
  const renderKPISkeletons = (count: number, prefix: string) => (
    <>
      {Array.from({ length: count }, (_, i) => (
        <Card key={`${prefix}-${i}`}>
          <CardContent className="pt-6">
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-4 w-24" />
          </CardContent>
        </Card>
      ))}
    </>
  );

  const renderRecentReports = (prefix: string) => {
    if (isLoadingAnalytics) {
      return (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={`${prefix}-${i}`} className="h-16 w-full" />)}
        </div>
      );
    }
    if (analyticsData?.recentReports.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>Nenhum relatório gerado ainda</p>
          <Button variant="link" className="mt-2" onClick={() => onTabChange("ai-reports")}>
            Gerar primeiro relatório
          </Button>
        </div>
      );
    }
    return (
      <div className="space-y-3">
        {analyticsData?.recentReports.slice(0, 5).map((report) => (
          <div key={report.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded">
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">{report.title}</p>
                <p className="text-xs text-muted-foreground">{getTypeLabel(report.type)}</p>
              </div>
            </div>
            <span className="text-xs text-muted-foreground">
              {new Date(report.generated_at).toLocaleDateString("pt-BR")}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const renderInsightsCategory = (prefix: string) => {
    if (isLoadingAnalytics) {
      return (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={`${prefix}-${i}`} className="h-10 w-full" />)}
        </div>
      );
    }
    if (Object.keys(analyticsData?.insightsByCategory || {}).length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>Nenhum insight gerado ainda</p>
          <p className="text-sm">Os insights serão exibidos aqui conforme são gerados</p>
        </div>
      );
    }
    return (
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
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${percentage}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <>
      {/* Overview Tab */}
      <TabsContent value="overview">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {isLoadingAnalytics ? renderKPISkeletons(5, "ov-kpi") : (
              <>
                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onTabChange("ai-reports")}>
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
                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onTabChange("incidents")}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold">{analyticsData?.totalIncidents || 0}</p>
                        <p className="text-sm text-muted-foreground">Total Incidentes</p>
                      </div>
                      <AlertTriangle className="h-8 w-8 text-orange-500 opacity-50" />
                    </div>
                    <p className="text-xs mt-2 text-muted-foreground">{analyticsData?.incidentsThisMonth || 0} este mês</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold">{analyticsData?.totalInsights || 0}</p>
                        <p className="text-sm text-muted-foreground">Insights IA</p>
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
                      <AlertCircle className="h-8 w-8 text-red-500 opacity-50" />
                    </div>
                    <p className="text-xs mt-2 text-muted-foreground">de {analyticsData?.totalAlerts || 0} total</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold">{analyticsData?.totalReports || 0}</p>
                        <p className="text-sm text-muted-foreground">Total Relatórios</p>
                      </div>
                      <Activity className="h-8 w-8 text-blue-500 opacity-50" />
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Target className="h-5 w-5" />Ações Rápidas</CardTitle>
              <CardDescription>Acesse as principais funcionalidades do centro de relatórios</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2" onClick={() => onTabChange("ai-reports")}>
                  <Brain className="h-6 w-6 text-primary" />
                  <span className="font-medium">Gerar Relatório IA</span>
                  <span className="text-xs text-muted-foreground">Análise inteligente</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2" onClick={() => onTabChange("incidents")}>
                  <AlertTriangle className="h-6 w-6 text-orange-500" />
                  <span className="font-medium">Ver Incidentes DP</span>
                  <span className="text-xs text-muted-foreground">Base de conhecimento</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2" onClick={() => onTabChange("dashboard")}>
                  <BarChart3 className="h-6 w-6 text-blue-500" />
                  <span className="font-medium">Dashboard</span>
                  <span className="text-xs text-muted-foreground">Processamento docs</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2" onClick={() => onTabChange("analytics")}>
                  <TrendingUp className="h-6 w-6 text-green-500" />
                  <span className="font-medium">Analytics</span>
                  <span className="text-xs text-muted-foreground">Métricas detalhadas</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5" />Relatórios Recentes</CardTitle>
                <CardDescription>Últimos relatórios gerados pela IA</CardDescription>
              </CardHeader>
              <CardContent>{renderRecentReports("ov-recent")}</CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5" />Insights por Categoria</CardTitle>
                <CardDescription>Distribuição dos insights gerados</CardDescription>
              </CardHeader>
              <CardContent>{renderInsightsCategory("ov-ins")}</CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" />Resumo de Performance</CardTitle>
              <CardDescription>Métricas consolidadas do centro de relatórios</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-success/10 rounded-lg">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 text-success" />
                  <p className="text-2xl font-bold">{analyticsData?.totalReports || 0}</p>
                  <p className="text-sm text-muted-foreground">Relatórios Gerados</p>
                </div>
                <div className="text-center p-4 bg-warning/10 rounded-lg">
                  <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-warning" />
                  <p className="text-2xl font-bold">{analyticsData?.totalIncidents || 0}</p>
                  <p className="text-sm text-muted-foreground">Incidentes Analisados</p>
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

      {/* Dashboard Tab */}
      <TabsContent value="dashboard">
        <ReportsDashboard />
      </TabsContent>

      {/* AI Reports Tab */}
      <TabsContent value="ai-reports">
        <AIReportGenerator />
      </TabsContent>

      {/* Incidents Tab */}
      <TabsContent value="incidents">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  DP Incident Intelligence Feed
                </CardTitle>
                <CardDescription>Base de conhecimento de incidentes DP com análise por IA</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="flex items-center gap-1"><Shield className="h-3 w-3" />IMCA Database</Badge>
                <Badge variant="outline" className="flex items-center gap-1"><Brain className="h-3 w-3" />Análise IA</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <IncidentCards />
          </CardContent>
        </Card>
      </TabsContent>

      {/* Analytics Tab */}
      <TabsContent value="analytics">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {isLoadingAnalytics ? renderKPISkeletons(4, "an-kpi") : (
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
                    <p className="text-xs mt-2 text-muted-foreground">de {analyticsData?.totalAlerts || 0} alertas totais</p>
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5" />Relatórios Recentes</CardTitle>
                <CardDescription>Últimos relatórios gerados pela IA</CardDescription>
              </CardHeader>
              <CardContent>{renderRecentReports("an-recent")}</CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5" />Insights por Categoria</CardTitle>
                <CardDescription>Distribuição dos insights gerados</CardDescription>
              </CardHeader>
              <CardContent>{renderInsightsCategory("an-ins")}</CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" />Resumo de Performance</CardTitle>
              <CardDescription>Métricas consolidadas do sistema de relatórios</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-success/10 rounded-lg">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 text-success" />
                  <p className="text-2xl font-bold">{analyticsData?.totalReports || 0}</p>
                  <p className="text-sm text-muted-foreground">Relatórios Gerados</p>
                </div>
                <div className="text-center p-4 bg-info/10 rounded-lg">
                  <Brain className="h-8 w-8 mx-auto mb-2 text-info" />
                  <p className="text-2xl font-bold">{analyticsData?.totalInsights || 0}</p>
                  <p className="text-sm text-muted-foreground">Insights IA</p>
                </div>
                <div className="text-center p-4 bg-accent/10 rounded-lg">
                  <Calendar className="h-8 w-8 mx-auto mb-2 text-accent" />
                  <p className="text-2xl font-bold">{analyticsData?.reportsThisMonth || 0}</p>
                  <p className="text-sm text-muted-foreground">Este Mês</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </>
  );
};
