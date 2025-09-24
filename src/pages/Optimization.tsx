import React from 'react';
import { ThemeProvider } from '@/components/layout/theme-provider';
import { Header } from '@/components/layout/header';
import { BackToDashboard } from '@/components/ui/back-to-dashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PerformanceOptimizer } from '@/components/optimization/PerformanceOptimizer';
import { SmartInsights } from '@/components/optimization/SmartInsights';
import { UserExperienceEnhancer } from '@/components/optimization/UserExperienceEnhancer';
import { 
  Gauge, 
  Brain, 
  Users, 
  Zap 
} from 'lucide-react';

const Optimization = () => {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <Header />
        <div className="container mx-auto p-6 space-y-6">
          <BackToDashboard />
          
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 rounded-lg bg-gradient-to-br from-primary to-primary/80">
              <Zap className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold gradient-text">Centro de Otimização</h1>
              <p className="text-muted-foreground">
                Performance, UX e Insights Inteligentes para Nautilus One
              </p>
            </div>
          </div>

          <Tabs defaultValue="performance" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="performance" className="flex items-center gap-2">
                <Gauge className="h-4 w-4" />
                Performance
              </TabsTrigger>
              <TabsTrigger value="insights" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Insights IA
              </TabsTrigger>
              <TabsTrigger value="ux" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                UX Enhancement
              </TabsTrigger>
            </TabsList>

            <TabsContent value="performance" className="mt-6">
              <PerformanceOptimizer />
            </TabsContent>

            <TabsContent value="insights" className="mt-6">
              <SmartInsights />
            </TabsContent>

            <TabsContent value="ux" className="mt-6">
              <UserExperienceEnhancer />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default Optimization;