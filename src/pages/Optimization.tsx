import React from "react";
import { MainLayout } from "@/components/layouts/MainLayout";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PerformanceOptimizer from "@/components/optimization/performance-optimizer";
import { UserExperienceEnhancer } from "@/components/optimization/UserExperienceEnhancer";
import { SmartInsights } from "@/components/optimization/SmartInsights";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Zap, 
  TrendingUp, 
  Users, 
  Target, 
  Activity,
  Gauge,
  Sparkles,
  BarChart3
} from "lucide-react";

const Optimization = () => {
  return (
    <ModulePageWrapper gradient="green">
      <MainLayout>
        <div className="flex-1 flex flex-col">
            <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="container flex h-14 items-center px-6">
                <div className="flex items-center gap-2">
                  <Zap className="h-6 w-6 text-primary" />
                  <h1 className="text-xl font-semibold">Centro de Otimização</h1>
                </div>
              </div>
            </header>

          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Optimization Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="glass-effect">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Gauge className="h-4 w-4 text-primary" />
                      Performance Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">92.5</div>
                    <p className="text-xs text-muted-foreground">+5.2% este mês</p>
                  </CardContent>
                </Card>

                <Card className="glass-effect">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-success" />
                      Satisfação UX
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-success">87.9%</div>
                    <p className="text-xs text-muted-foreground">Usuários satisfeitos</p>
                  </CardContent>
                </Card>

                <Card className="glass-effect">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <TrendingUp className="h-4 w-4 text-info" />
                      Melhorias Implementadas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-info">47</div>
                    <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
                  </CardContent>
                </Card>

                <Card className="glass-effect">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Target className="h-4 w-4 text-warning" />
                      Eficiência Ganho
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-warning">+34%</div>
                    <p className="text-xs text-muted-foreground">Produtividade geral</p>
                  </CardContent>
                </Card>
              </div>

              {/* Optimization Tabs */}
              <Tabs defaultValue="performance" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="performance" className="flex items-center gap-2">
                    <Gauge className="h-4 w-4" />
                    <span className="hidden sm:inline">Performance</span>
                  </TabsTrigger>
                  <TabsTrigger value="experience" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span className="hidden sm:inline">Experiência</span>
                  </TabsTrigger>
                  <TabsTrigger value="insights" className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    <span className="hidden sm:inline">Insights</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="performance">
                  <PerformanceOptimizer />
                </TabsContent>

                <TabsContent value="experience">
                  <UserExperienceEnhancer />
                </TabsContent>

                <TabsContent value="insights">
                  <SmartInsights />
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </MainLayout>
    </ModulePageWrapper>
  );
};

export default Optimization;