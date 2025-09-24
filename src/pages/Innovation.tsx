import React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AIAssistantPanel } from "@/components/innovation/AIAssistantPanel";
import { BusinessIntelligence } from "@/components/innovation/BusinessIntelligence";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
                <TabsList className="grid w-full grid-cols-2 lg:grid-cols-2">
                  <TabsTrigger value="ai-assistant" className="flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    <span className="hidden sm:inline">IA Assistant</span>
                  </TabsTrigger>
                  <TabsTrigger value="business-intelligence" className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    <span className="hidden sm:inline">Business Intelligence</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="ai-assistant">
                  <AIAssistantPanel />
                </TabsContent>

                <TabsContent value="business-intelligence">
                  <BusinessIntelligence />
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Innovation;