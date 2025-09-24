import React, { Suspense } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import VoiceInterface from "@/components/voice/VoiceInterface";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { 
  Brain, 
  BarChart3, 
  Users, 
  Workflow,
  Activity,
  Trophy,
  TrendingUp,
  Zap,
  Target,
  Globe
} from "lucide-react";

// Lazy loading dos componentes para melhor performance
const AIAssistantPanel = React.lazy(() => 
  import("@/components/innovation/AIAssistantPanel").then(module => ({
    default: module.AIAssistantPanel
  }))
);
const BusinessIntelligence = React.lazy(() => 
  import("@/components/innovation/BusinessIntelligence").then(module => ({
    default: module.BusinessIntelligence
  }))
);
const RealTimeCollaboration = React.lazy(() => 
  import("@/components/innovation/RealTimeCollaboration").then(module => ({
    default: module.RealTimeCollaboration
  }))
);
const SmartWorkflow = React.lazy(() => 
  import("@/components/innovation/SmartWorkflow").then(module => ({
    default: module.SmartWorkflow
  }))
);
const SystemHealthDashboard = React.lazy(() => 
  import("@/components/innovation/SystemHealthDashboard").then(module => ({
    default: module.SystemHealthDashboard
  }))
);
const Gamification = React.lazy(() => 
  import("@/components/innovation/Gamification").then(module => ({
    default: module.Gamification
  }))
);

const Innovation = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center px-6">
              <div className="flex items-center gap-2">
                <Brain className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-semibold">Centro de Inovação</h1>
              </div>
            </div>
          </header>

          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Innovation Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="glass-effect">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Brain className="h-4 w-4 text-primary" />
                      IA Ativa
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">24/7</div>
                    <p className="text-xs text-muted-foreground">Assistente inteligente</p>
                  </CardContent>
                </Card>

                <Card className="glass-effect">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <TrendingUp className="h-4 w-4 text-success" />
                      Eficiência
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-success">+35%</div>
                    <p className="text-xs text-muted-foreground">Melhoria operacional</p>
                  </CardContent>
                </Card>

                <Card className="glass-effect">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-info" />
                      Colaboração
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-info">98.5%</div>
                    <p className="text-xs text-muted-foreground">Tempo real ativo</p>
                  </CardContent>
                </Card>

                <Card className="glass-effect">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Zap className="h-4 w-4 text-warning" />
                      Automação
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-warning">87</div>
                    <p className="text-xs text-muted-foreground">Workflows ativos</p>
                  </CardContent>
                </Card>
              </div>

              {/* Innovation Tabs */}
              <Tabs defaultValue="ai-assistant" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
                  <TabsTrigger value="ai-assistant" className="flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    <span className="hidden sm:inline">IA Assistant</span>
                  </TabsTrigger>
                  <TabsTrigger value="business-intelligence" className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    <span className="hidden sm:inline">BI</span>
                  </TabsTrigger>
                  <TabsTrigger value="collaboration" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span className="hidden sm:inline">Colaboração</span>
                  </TabsTrigger>
                  <TabsTrigger value="workflow" className="flex items-center gap-2">
                    <Workflow className="h-4 w-4" />
                    <span className="hidden sm:inline">Workflow</span>
                  </TabsTrigger>
                  <TabsTrigger value="health" className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    <span className="hidden sm:inline">Sistema</span>
                  </TabsTrigger>
                  <TabsTrigger value="gamification" className="flex items-center gap-2">
                    <Trophy className="h-4 w-4" />
                    <span className="hidden sm:inline">Gamificação</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="ai-assistant">
                  <Suspense fallback={
                    <div className="flex items-center justify-center p-8">
                      <LoadingSpinner size="lg" />
                    </div>
                  }>
                    <AIAssistantPanel />
                  </Suspense>
                </TabsContent>

                <TabsContent value="business-intelligence">
                  <Suspense fallback={
                    <div className="flex items-center justify-center p-8">
                      <LoadingSpinner size="lg" />
                    </div>
                  }>
                    <BusinessIntelligence />
                  </Suspense>
                </TabsContent>

                <TabsContent value="collaboration">
                  <Suspense fallback={
                    <div className="flex items-center justify-center p-8">
                      <LoadingSpinner size="lg" />
                    </div>
                  }>
                    <RealTimeCollaboration />
                  </Suspense>
                </TabsContent>

                <TabsContent value="workflow">
                  <Suspense fallback={
                    <div className="flex items-center justify-center p-8">
                      <LoadingSpinner size="lg" />
                    </div>
                  }>
                    <SmartWorkflow />
                  </Suspense>
                </TabsContent>

                <TabsContent value="health">
                  <Suspense fallback={
                    <div className="flex items-center justify-center p-8">
                      <LoadingSpinner size="lg" />
                    </div>
                  }>
                    <SystemHealthDashboard />
                  </Suspense>
                </TabsContent>

                <TabsContent value="gamification">
                  <Suspense fallback={
                    <div className="flex items-center justify-center p-8">
                      <LoadingSpinner size="lg" />
                    </div>
                  }>
                    <Gamification />
                  </Suspense>
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
        <VoiceInterface />
      </div>
    </SidebarProvider>
  );
};

export default Innovation;