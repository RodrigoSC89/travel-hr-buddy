import React from 'react';
import ReportsDashboard from '@/components/reports/reports-dashboard';
import AIReportGenerator from '@/components/reports/AIReportGenerator';
import { ThemeProvider } from '@/components/layout/theme-provider';
import { Header } from '@/components/layout/header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, BarChart3, TrendingUp, Brain } from 'lucide-react';
import { BackToDashboard } from '@/components/ui/back-to-dashboard';

const Reports = () => {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto p-6 space-y-6">
          <BackToDashboard />
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 rounded-lg bg-primary/10">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Relatórios</h1>
              <p className="text-muted-foreground">
                Análises avançadas e relatórios inteligentes
              </p>
            </div>
          </div>

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
        </main>
      </div>
    </ThemeProvider>
  );
};

export default Reports;