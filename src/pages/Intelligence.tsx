import React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DocumentProcessor from "@/components/intelligence/DocumentProcessor";
import IntelligentNotificationCenter from "@/components/intelligence/IntelligentNotificationCenter";
import PersonalizedRecommendations from "@/components/intelligence/PersonalizedRecommendations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Brain, 
  FileText, 
  Bell, 
  Target, 
  Sparkles,
  TrendingUp,
  Users,
  Zap
} from "lucide-react";

const Intelligence = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center px-6">
              <div className="flex items-center gap-2">
                <Brain className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-semibold">Central de Inteligência</h1>
              </div>
            </div>
          </header>

          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Intelligence Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="glass-effect">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4 text-primary" />
                      Documentos Processados
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">2,847</div>
                    <p className="text-xs text-muted-foreground">Este mês</p>
                  </CardContent>
                </Card>

                <Card className="glass-effect">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Bell className="h-4 w-4 text-info" />
                      Notificações Inteligentes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-info">156</div>
                    <p className="text-xs text-muted-foreground">Insights gerados</p>
                  </CardContent>
                </Card>

                <Card className="glass-effect">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Target className="h-4 w-4 text-success" />
                      Recomendações Ativas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-success">89</div>
                    <p className="text-xs text-muted-foreground">Personalizadas</p>
                  </CardContent>
                </Card>

                <Card className="glass-effect">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Sparkles className="h-4 w-4 text-warning" />
                      Precisão IA
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-warning">94.2%</div>
                    <p className="text-xs text-muted-foreground">Acurácia média</p>
                  </CardContent>
                </Card>
              </div>

              {/* Intelligence Tabs */}
              <Tabs defaultValue="documents" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="documents" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span className="hidden sm:inline">Processamento</span>
                  </TabsTrigger>
                  <TabsTrigger value="notifications" className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    <span className="hidden sm:inline">Notificações</span>
                  </TabsTrigger>
                  <TabsTrigger value="recommendations" className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    <span className="hidden sm:inline">Recomendações</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="documents">
                  <DocumentProcessor />
                </TabsContent>

                <TabsContent value="notifications">
                  <IntelligentNotificationCenter />
                </TabsContent>

                <TabsContent value="recommendations">
                  <PersonalizedRecommendations />
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Intelligence;