import React, { Suspense } from "react";
import AnalyticsDashboard from "@/components/analytics/analytics-dashboard";
import PredictiveAnalytics from "@/components/analytics/PredictiveAnalytics";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Brain, Target } from "lucide-react";
import { DashboardSkeleton } from "@/components/ui/loading-skeleton";

const Analytics = () => {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <ModulePageWrapper gradient="blue">
        <ModuleHeader
          icon={BarChart3}
          title="Analytics"
          description="Insights avançados e análise preditiva"
          gradient="blue"
          badges={[
            { icon: Brain, label: "IA Preditiva" },
            { icon: TrendingUp, label: "Tendências" },
            { icon: Target, label: "KPIs" }
          ]}
        />

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="predictive" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Preditivo
            </TabsTrigger>
            <TabsTrigger value="kpis" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              KPIs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <Suspense fallback={<DashboardSkeleton />}>
              <AnalyticsDashboard />
            </Suspense>
          </TabsContent>

          <TabsContent value="predictive">
            <Suspense fallback={<DashboardSkeleton />}>
              <PredictiveAnalytics />
            </Suspense>
          </TabsContent>

          <TabsContent value="kpis">
            <Card>
              <CardHeader>
                <CardTitle>Indicadores Chave de Performance</CardTitle>
                <CardDescription>
                  Monitore os KPIs mais importantes do seu negócio
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Target className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">KPIs personalizados</h3>
                  <p className="text-muted-foreground">
                    Configure e monitore seus indicadores específicos
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </ModulePageWrapper>
    </ThemeProvider>
  );
};

export default Analytics;