import React from "react";
import ReportsDashboard from "@/components/reports/reports-dashboard";
import AIReportGenerator from "@/components/reports/AIReportGenerator";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, BarChart3, TrendingUp, Brain, Sparkles } from "lucide-react";

const Reports = () => {
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
          <Card>
            <CardHeader>
              <CardTitle>Analytics Avançado</CardTitle>
              <CardDescription>
                    Análises detalhadas de performance e tendências
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <TrendingUp className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Analytics em desenvolvimento</h3>
                <p className="text-muted-foreground">
                      Módulo de analytics avançado será disponibilizado em breve
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </ModulePageWrapper>
  );
};

export default Reports;