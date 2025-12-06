import React from "react";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PerformanceOptimizer from "@/components/optimization/performance-optimizer";
import { UserExperienceEnhancer } from "@/components/optimization/UserExperienceEnhancer";
import { SmartInsights } from "@/components/optimization/SmartInsights";
import { OptimizationAICopilot } from "@/components/optimization/OptimizationAICopilot";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Zap, 
  TrendingUp, 
  Users, 
  Target, 
  Activity,
  Gauge,
  Sparkles,
  BarChart3,
  Bot
} from "lucide-react";

const Optimization = () => {
  return (
    <ModulePageWrapper gradient="green">
      <ModuleHeader
        icon={Zap}
        title="Centro de Otimização"
        description="Otimização inteligente de performance, experiência do usuário e insights estratégicos"
        gradient="green"
        badges={[
          { icon: Gauge, label: "92.5% Performance" },
          { icon: TrendingUp, label: "47 Melhorias" },
          { icon: Target, label: "+34% Eficiência" }
        ]}
      />

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
        <TabsList className="grid w-full grid-cols-4">
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
          <TabsTrigger value="copilot" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            <span className="hidden sm:inline">Copiloto IA</span>
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

        <TabsContent value="copilot">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <OptimizationAICopilot 
              systemData={{
                performanceScore: 92.5,
                uxSatisfaction: 87.9,
                improvementsCount: 47,
                efficiencyGain: 34
              }}
            />
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Contexto do Sistema
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Performance Score</p>
                    <p className="text-2xl font-bold text-primary">92.5</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Satisfação UX</p>
                    <p className="text-2xl font-bold text-success">87.9%</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Melhorias</p>
                    <p className="text-2xl font-bold text-info">47</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Eficiência</p>
                    <p className="text-2xl font-bold text-warning">+34%</p>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-r from-primary/10 to-transparent rounded-lg">
                  <p className="text-sm font-medium mb-2">O Copiloto pode ajudar com:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Análise de gargalos de performance</li>
                    <li>• Recomendações de melhorias UX</li>
                    <li>• Insights preditivos baseados em dados</li>
                    <li>• Cálculos de ROI de otimizações</li>
                    <li>• Priorização de implementações</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </ModulePageWrapper>
  );
};

export default Optimization;