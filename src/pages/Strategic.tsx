import React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductRoadmap } from "@/components/strategic/ProductRoadmap";
import { AnalyticsDashboard } from "@/components/strategic/AnalyticsDashboard";
import { PublicAPI } from "@/components/strategic/PublicAPI";
import { ClientCustomization } from "@/components/strategic/ClientCustomization";
import { SecurityCompliance } from "@/components/strategic/SecurityCompliance";
import { CopilotAI } from "@/components/strategic/CopilotAI";
import { FeedbackSystem } from "@/components/strategic/FeedbackSystem";
import { MobileSpecifications } from "@/components/strategic/MobileSpecifications";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Rocket, 
  BarChart3, 
  Globe, 
  Palette,
  Target,
  TrendingUp,
  Users,
  Zap,
  Shield,
  Bot,
  MessageSquare,
  Smartphone
} from "lucide-react";

const Strategic = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center px-6">
              <div className="flex items-center gap-2">
                <Rocket className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-semibold">Centro Estratégico</h1>
              </div>
            </div>
          </header>

          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="glass-effect">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Target className="h-4 w-4 text-primary" />
                      Iniciativas 2025
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">8</div>
                    <p className="text-xs text-muted-foreground">Projetos estratégicos</p>
                  </CardContent>
                </Card>

                <Card className="glass-effect">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <TrendingUp className="h-4 w-4 text-success" />
                      ROI Estimado
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-success">R$ 20.5M</div>
                    <p className="text-xs text-muted-foreground">Valor total projetado</p>
                  </CardContent>
                </Card>

                <Card className="glass-effect">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-info" />
                      Desenvolvedores
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-info">77</div>
                    <p className="text-xs text-muted-foreground">Recursos necessários</p>
                  </CardContent>
                </Card>

                <Card className="glass-effect">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Zap className="h-4 w-4 text-warning" />
                      APIs Ativas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-warning">99.9%</div>
                    <p className="text-xs text-muted-foreground">Uptime garantido</p>
                  </CardContent>
                </Card>
              </div>

              {/* Strategic Tabs */}
              <Tabs defaultValue="roadmap" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
                  <TabsTrigger value="roadmap" className="flex items-center gap-2">
                    <Rocket className="h-4 w-4" />
                    <span className="hidden sm:inline">Roadmap</span>
                  </TabsTrigger>
                  <TabsTrigger value="analytics" className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    <span className="hidden sm:inline">Analytics</span>
                  </TabsTrigger>
                  <TabsTrigger value="api" className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <span className="hidden sm:inline">API</span>
                  </TabsTrigger>
                  <TabsTrigger value="customization" className="flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    <span className="hidden sm:inline">Custom</span>
                  </TabsTrigger>
                  <TabsTrigger value="security" className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <span className="hidden sm:inline">Segurança</span>
                  </TabsTrigger>
                  <TabsTrigger value="copilot" className="flex items-center gap-2">
                    <Bot className="h-4 w-4" />
                    <span className="hidden sm:inline">Copiloto</span>
                  </TabsTrigger>
                  <TabsTrigger value="feedback" className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    <span className="hidden sm:inline">Feedback</span>
                  </TabsTrigger>
                  <TabsTrigger value="mobile" className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    <span className="hidden sm:inline">Mobile</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="roadmap">
                  <ProductRoadmap />
                </TabsContent>

                <TabsContent value="analytics">
                  <AnalyticsDashboard />
                </TabsContent>

                <TabsContent value="api">
                  <PublicAPI />
                </TabsContent>

                <TabsContent value="customization">
                  <ClientCustomization />
                </TabsContent>

                <TabsContent value="security">
                  <SecurityCompliance />
                </TabsContent>

                <TabsContent value="copilot">
                  <CopilotAI />
                </TabsContent>

                <TabsContent value="feedback">
                  <FeedbackSystem />
                </TabsContent>

                <TabsContent value="mobile">
                  <MobileSpecifications />
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Strategic;