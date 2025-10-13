import React, { useState, useEffect } from "react";
import { HRDashboard } from "@/components/hr/hr-dashboard";
import { CertificateManager } from "@/components/hr/certificate-manager";
import { CertificateAlerts } from "@/components/hr/certificate-alerts";
import { EmployeeManagement } from "@/components/hr/employee-management";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { Header } from "@/components/layout/header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ModuleActionButton from "@/components/ui/module-action-button";
import { BackToDashboard } from "@/components/ui/back-to-dashboard";
import { logger } from "@/lib/logger";
import { 
  Users, 
  Award, 
  AlertTriangle, 
  UserCheck,
  Brain,
  Shield,
  TrendingUp,
  Sparkles,
  Star,
  Crown,
  Diamond,
  Globe,
  Clock,
  BarChart3,
  FileText,
  Calendar,
  UserPlus,
  Plus,
  DollarSign,
  RefreshCw,
  Download
} from "lucide-react";

const HumanResources = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const quickStats = [
    { icon: Users, label: "Funcionários Ativos", value: "156", color: "success" },
    { icon: Award, label: "Certificados Válidos", value: "98%", color: "info" },
    { icon: AlertTriangle, label: "Alertas Pendentes", value: "3", color: "warning" },
    { icon: UserCheck, label: "Conformidade", value: "95%", color: "primary" }
  ];

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <div className="min-h-screen bg-gradient-to-br from-background via-success/5 to-primary/10 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 bg-dots opacity-20" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-success/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-primary/10 to-transparent rounded-full blur-3xl" />
        
        <Header />
        <main className="relative z-10 container mx-auto p-6 space-y-8">
          <BackToDashboard />
          
          {/* Enhanced Hero Section */}
          <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-success via-success/90 to-success-glow p-8 text-success-foreground 
            transition-all duration-1000 transform ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 bg-mesh opacity-20" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/15 to-transparent rounded-full blur-2xl animate-pulse" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-secondary/20 to-transparent rounded-full blur-xl animate-pulse" style={{ animationDelay: "1s" }} />
            
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 rounded-2xl bg-success/20 backdrop-blur-sm animate-pulse-glow">
                  <Users className="w-10 h-10" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold font-display mb-2 text-shimmer drop-shadow-lg">
                    Recursos Humanos Inteligente
                  </h1>
                  <p className="text-xl opacity-95 drop-shadow-md font-semibold">
                    Gestão avançada de pessoas e certificações
                    <Crown className="inline-block w-6 h-6 ml-2 text-warning animate-bounce" />
                  </p>
                </div>
              </div>
              
              <p className="text-lg opacity-95 mb-8 max-w-3xl drop-shadow-md font-medium">
                Sistema revolucionário de gestão de RH com IA preditiva, automação completa 
                e experiência extraordinária para toda equipe marítima.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 bg-primary/90 text-primary-foreground px-4 py-2 rounded-xl backdrop-blur-sm hover:scale-105 transition-transform duration-300 hover:bg-primary shadow-lg border border-primary/30">
                  <Brain className="h-5 w-5 animate-pulse" />
                  <span className="font-semibold">IA Preditiva</span>
                </div>
                <div className="flex items-center gap-2 bg-info/90 text-info-foreground px-4 py-2 rounded-xl backdrop-blur-sm hover:scale-105 transition-transform duration-300 hover:bg-info shadow-lg border border-info/30">
                  <Shield className="h-5 w-5 animate-pulse" />
                  <span className="font-semibold">Compliance Total</span>
                </div>
                <div className="flex items-center gap-2 bg-warning/90 text-warning-foreground px-4 py-2 rounded-xl backdrop-blur-sm hover:scale-105 transition-transform duration-300 hover:bg-warning shadow-lg border border-warning/30">
                  <TrendingUp className="h-5 w-5 animate-pulse" />
                  <span className="font-semibold">Produtividade Máxima</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {quickStats.map((stat, index) => (
              <Card key={index} className={`group cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-2xl
                bg-gradient-to-br from-card via-card/95 to-${stat.color}/5 border-${stat.color}/20 hover:border-${stat.color}/40`}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`p-3 rounded-xl bg-${stat.color}/20 group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className={`w-6 h-6 text-${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Enhanced Tabs */}
          <Tabs defaultValue="dashboard" className="space-y-6">
            <div className="flex justify-center">
              <div className="w-full overflow-x-auto pb-2">
                <TabsList className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 w-full max-w-3xl h-14 bg-card/50 backdrop-blur-sm border border-border/50 min-w-fit">
                  <TabsTrigger value="dashboard" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <BarChart3 className="h-5 w-5" />
                    <span className="hidden sm:inline">Dashboard</span>
                    <span className="sm:hidden">Dashboard</span>
                  </TabsTrigger>
                  <TabsTrigger value="certificates" className="flex items-center gap-2 data-[state=active]:bg-warning data-[state=active]:text-warning-foreground">
                    <Award className="h-5 w-5" />
                    <span className="hidden sm:inline">Certificados</span>
                    <span className="sm:hidden">Certif.</span>
                  </TabsTrigger>
                  <TabsTrigger value="alerts" className="flex items-center gap-2 data-[state=active]:bg-destructive data-[state=active]:text-destructive-foreground">
                    <AlertTriangle className="h-5 w-5" />
                    <span className="hidden sm:inline">Alertas</span>
                    <span className="sm:hidden">Alertas</span>
                  </TabsTrigger>
                  <TabsTrigger value="employees" className="flex items-center gap-2 data-[state=active]:bg-success data-[state=active]:text-success-foreground">
                    <UserCheck className="h-5 w-5" />
                    <span className="hidden sm:inline">Funcionários</span>
                    <span className="sm:hidden">Funcion.</span>
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>

            <TabsContent value="dashboard" className="space-y-6">
              <HRDashboard />
            </TabsContent>

            <TabsContent value="certificates" className="space-y-6">
              <Card className="bg-gradient-to-br from-card via-card/95 to-warning/5 hover:shadow-2xl transition-all duration-700 backdrop-blur-sm border border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-warning/20 to-warning/10">
                      <Award className="w-6 h-6 text-warning" />
                    </div>
                    <span className="text-gradient">Gerenciamento de Certificados</span>
                    <Star className="w-6 h-6 text-warning animate-pulse" />
                  </CardTitle>
                  <CardDescription className="text-base">
                    Controle avançado e monitore certificações da equipe em tempo real
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center py-12">
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-warning/10 to-warning/5 inline-block mb-6">
                      <Award className="h-16 w-16 text-warning mx-auto animate-bounce" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-gradient">
                      Sistema de Certificados Ativo
                    </h3>
                    <p className="text-muted-foreground text-lg mb-6 max-w-md mx-auto">
                      Módulo de certificados totalmente operacional - acesse via Dashboard do RH
                    </p>
                    <div className="flex justify-center gap-2 mb-4">
                      <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                        Sistema Ativo
                      </Badge>
                      <Badge variant="outline" className="bg-info/10 text-info border-info/30">
                        Automação Completa
                      </Badge>
                      <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
                        Alertas Inteligentes
                      </Badge>
                    </div>
                    <Button className="gap-2">
                      <FileText className="h-4 w-4" />
                      Acessar Certificados
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="alerts" className="space-y-6">
              <CertificateAlerts />
            </TabsContent>

            <TabsContent value="employees" className="space-y-6">
              <EmployeeManagement />
            </TabsContent>
          </Tabs>
        </main>

        {/* Enhanced FAB */}
        {/* Module Action Button */}
        <ModuleActionButton
          moduleId="hr"
          moduleName="RH"
          moduleIcon={<Users className="h-4 w-4" />}
          actions={[
            {
              id: "new-employee",
              label: "Novo Funcionário",
              icon: <Plus className="h-4 w-4" />,
              action: () => logger.info("Novo funcionário"),
              variant: "default"
            },
            {
              id: "reports",
              label: "Relatórios",
              icon: <BarChart3 className="h-4 w-4" />,
              action: () => logger.info("Relatórios RH"),
              variant: "outline"
            },
            {
              id: "payroll",
              label: "Folha de Pagamento",
              icon: <DollarSign className="h-4 w-4" />,
              action: () => logger.info("Folha de pagamento"),
              variant: "outline"
            },
            {
              id: "training",
              label: "Treinamentos",
              icon: <Brain className="h-4 w-4" />,
              action: () => logger.info("Treinamentos"),
              variant: "outline"
            }
          ]}
          quickActions={[
            {
              id: "refresh",
              label: "Atualizar",
              icon: <RefreshCw className="h-3 w-3" />,
              action: () => window.location.reload(),
              shortcut: "F5"
            },
            {
              id: "export",
              label: "Exportar",
              icon: <Download className="h-3 w-3" />,
              action: () => logger.info("Export HR data")
            }
          ]}
        />
      </div>
    </ThemeProvider>
  );
};

export default HumanResources;