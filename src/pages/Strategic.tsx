import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import NauticalCopilot from "@/components/strategic/NauticalCopilot";
import MaritimeIdentitySystem from "@/components/strategic/MaritimeIdentitySystem";
import SmartIntegrationHub from "@/components/strategic/SmartIntegrationHub";
import { PublicAPI } from "@/components/strategic/PublicAPI";
import NautilusCopilotAdvanced from "@/components/ai/nautilus-copilot-advanced";
import PredictiveAnalyticsEnhanced from "@/components/analytics/predictive-analytics-enhanced";
import { 
  Anchor, 
  Compass, 
  Ship, 
  Waves, 
  Target,
  Brain,
  Palette,
  Link,
  Users,
  BarChart3,
  Settings,
  Globe,
  Zap,
  Crown,
  Sparkles,
  Rocket,
  Star,
  TrendingUp,
  Activity,
  Shield,
  Eye
} from "lucide-react";

const Strategic: React.FC = () => {
  const [activeModule, setActiveModule] = useState<"overview" | "copilot" | "identity" | "integrations" | "api" | "ai-advanced" | "predictive">("overview");

  const strategicModules = [
    {
      id: "copilot",
      title: "Nautilus Copilot",
      description: "Assistente IA marítimo com comandos inteligentes e automação proativa",
      icon: Brain,
      color: "from-blue-500 to-cyan-500",
      features: ["IA Conversacional", "Comandos Inteligentes", "Automação Proativa", "Análise Preditiva"],
      status: "Revolucionário"
    },
    {
      id: "ai-advanced",
      title: "Copiloto IA Avançado",
      description: "Sistema avançado de IA com capacidades marítimas especializadas",
      icon: Sparkles,
      color: "from-purple-500 to-indigo-500",
      features: ["Análise Contextual", "Insights Preditivos", "Automação Inteligente", "ML Marítimo"],
      status: "Beta Avançado"
    },
    {
      id: "predictive",
      title: "Analytics Preditivos",
      description: "Previsões e insights baseados em Machine Learning marítimo",
      icon: TrendingUp,
      color: "from-emerald-500 to-teal-500",
      features: ["Previsão de Manutenção", "Análise de Mercado", "Otimização de Rotas", "Gestão de Riscos"],
      status: "Inovador"
    },
    {
      id: "api",
      title: "APIs Públicas",
      description: "Interface de programação para integrações empresariais",
      icon: Globe,
      color: "from-orange-500 to-red-500",
      features: ["REST APIs", "Webhooks", "Rate Limiting", "Documentação"],
      status: "Enterprise"
    },
    {
      id: "identity",
      title: "Sistema de Identidade",
      description: "Customização visual completa com temas náuticos e branding personalizado",
      icon: Palette,
      color: "from-purple-500 to-pink-500",
      features: ["Temas Náuticos", "Branding Custom", "Cores Personalizadas", "Terminologia Adaptável"],
      status: "Inovador"
    },
    {
      id: "integrations",
      title: "Hub de Integrações",
      description: "Conectores inteligentes para APIs marítimas, governamentais e sistemas externos",
      icon: Link,
      color: "from-green-500 to-emerald-500",
      features: ["APIs Marítimas", "Automações", "Webhooks", "Monitoramento"],
      status: "Avançado"
    }
  ];

  const kpis = [
    { label: "Eficiência IA", value: "94%", trend: "+12%", icon: Brain, color: "text-blue-500" },
    { label: "Integrações Ativas", value: "8", trend: "+3", icon: Link, color: "text-green-500" },
    { label: "Automações", value: "156", trend: "+45%", icon: Zap, color: "text-purple-500" },
    { label: "Satisfação", value: "4.9/5", trend: "+0.3", icon: Star, color: "text-yellow-500" }
  ];

  const renderModuleContent = () => {
    switch (activeModule) {
    case "copilot":
      return <NauticalCopilot />;
    case "ai-advanced":
      return <NautilusCopilotAdvanced />;
    case "predictive":
      return <PredictiveAnalyticsEnhanced />;
    case "api":
      return <PublicAPI />;
    case "identity":
      return <MaritimeIdentitySystem />;
    case "integrations":
      return <SmartIntegrationHub />;
    default:
      return (
        <div className="space-y-8">
          {/* Hero Section */}
          <Card className="card-vessel overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary-glow/10 to-nautical/20 animate-tide" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-azure-100/20 to-transparent rounded-full blur-3xl animate-lighthouse" />
              
            <CardHeader className="relative z-10 pb-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 rounded-2xl bg-azure-600/20 backdrop-blur-sm animate-navigation">
                  <Target className="w-10 h-10 animate-compass" />
                </div>
                <div>
                  <CardTitle className="text-4xl font-display mb-2 text-gradient">
                      Central Estratégica Marítima
                  </CardTitle>
                  <p className="text-xl opacity-90 text-maritime">
                      Transformação Digital Náutica Revolucionária
                  </p>
                </div>
              </div>
                
              <p className="text-lg opacity-90 max-w-3xl text-balance">
                  Sistema revolucionário que integra IA marítima, customização náutica avançada e automações 
                  inteligentes para elevar sua operação ao próximo nível de excelência oceânica.
              </p>
                
              <div className="flex flex-wrap gap-4 mt-6">
                <Badge className="badge-captain hover-lift">
                  <Rocket className="w-4 h-4 mr-2" />
                    Inovação Disruptiva
                </Badge>
                <Badge className="badge-captain hover-lift">
                  <Crown className="w-4 h-4 mr-2" />
                    Liderança Oceânica
                </Badge>
                <Badge className="badge-captain hover-lift">
                  <Sparkles className="w-4 h-4 mr-2" />
                    Experiência Premium
                </Badge>
                <Badge className="badge-captain hover-lift">
                  <Anchor className="w-4 h-4 mr-2" />
                    Excelência Marítima
                </Badge>
              </div>
            </CardHeader>
          </Card>

          {/* KPIs Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {kpis.map((kpi, index) => {
              const Icon = kpi.icon;
              return (
                <Card key={index} className="card-vessel hover-lift animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 mx-auto mb-4 glass-maritime rounded-full center">
                      <Icon className={`w-6 h-6 ${kpi.color} animate-navigation`} />
                    </div>
                    <div className="text-3xl font-bold mb-2 text-gradient">{kpi.value}</div>
                    <div className="text-sm text-muted-foreground mb-1">{kpi.label}</div>
                    <Badge className="badge-crew text-green-600">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {kpi.trend}
                    </Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Módulos Estratégicos */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <Globe className="w-6 h-6 text-primary animate-compass" />
              <span className="text-maritime">Módulos Estratégicos Náuticos</span>
            </h2>
              
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {strategicModules.map((module, index) => {
                const Icon = module.icon;
                return (
                  <Card 
                    key={module.id} 
                    className="card-vessel hover-lift cursor-pointer group animate-slide-in-up"
                    style={{ animationDelay: `${index * 150}ms` }}
                    onClick={() => setActiveModule(module.id as unknown)}
                  >
                    <div className={`h-2 bg-gradient-to-r ${module.color} animate-tide`} />
                      
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${module.color} bg-opacity-20 group-hover:scale-110 transition-transform float-element`}>
                          <Icon className="w-6 h-6 text-azure-50" />
                        </div>
                        <Badge className="badge-captain">
                          {module.status}
                        </Badge>
                      </div>
                        
                      <CardTitle className="text-xl mb-2 group-hover:text-primary transition-colors text-maritime">
                        {module.title}
                      </CardTitle>
                      <p className="text-muted-foreground text-sm leading-relaxed text-pretty">
                        {module.description}
                      </p>
                    </CardHeader>
                      
                    <CardContent>
                      <div className="space-y-3">
                        <h4 className="font-medium text-sm flex items-center gap-2">
                          <Compass className="w-4 h-4 text-primary" />
                            Recursos Principais:
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          {module.features.map((feature, index) => (
                            <div key={index} className="flex items-center gap-2 text-xs">
                              <div className="status-sailing" />
                              {feature}
                            </div>
                          ))}
                        </div>
                      </div>
                        
                      <Button 
                        className="btn-maritime w-full mt-6 group-hover:shadow-beacon transition-all" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveModule(module.id as unknown);
                        }}
                      >
                          Navegar para Módulo
                        <Ship className="w-4 h-4 ml-2 animate-sail" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Roadmap Estratégico */}
          <Card className="card-vessel bg-gradient-to-br from-card to-secondary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <Compass className="w-6 h-6 text-primary animate-compass" />
                <span className="text-maritime">Carta de Navegação - Roadmap 2024-2025</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-green-600 flex items-center gap-2">
                    <Ship className="w-5 h-5" />
                      Q4 2024 - Porto Seguro
                  </h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <div className="status-sailing" />
                        IA Copilot Marítimo
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="status-sailing" />
                        Sistema de Identidade Visual
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="status-sailing" />
                        Hub de Integrações
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="status-sailing" />
                        Automações Inteligentes
                    </li>
                  </ul>
                </div>
                  
                <div className="space-y-4">
                  <h3 className="font-semibold text-blue-600 flex items-center gap-2">
                    <Waves className="w-5 h-5 animate-wave" />
                      Q1 2025 - Mar Aberto
                  </h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <div className="status-docked" />
                        Realidade Aumentada Portuária
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="status-docked" />
                        Blockchain para Documentos
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="status-docked" />
                        IoT Dashboard Avançado
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="status-docked" />
                        Gamificação Operacional
                    </li>
                  </ul>
                </div>
                  
                <div className="space-y-4">
                  <h3 className="font-semibold text-purple-600 flex items-center gap-2">
                    <Target className="w-5 h-5 animate-navigation" />
                      Q2 2025 - Novo Horizonte
                  </h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <div className="status-maintenance" />
                        IA Preditiva Avançada
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="status-maintenance" />
                        Gêmeos Digitais de Navios
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="status-maintenance" />
                        API Pública Empresarial
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="status-maintenance" />
                        Compliance Automatizado
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Metrics Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="card-port">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary animate-navigation" />
                    Performance Oceânica
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Eficiência Geral</span>
                    <span className="font-semibold text-green-600">94%</span>
                  </div>
                  <div className="progress-maritime h-2">
                    <div className="progress-fill w-[94%]" />
                  </div>
                    
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Automações Ativas</span>
                    <span className="font-semibold text-blue-600">156</span>
                  </div>
                  <div className="progress-maritime h-2">
                    <div className="progress-fill w-[78%]" />
                  </div>
                    
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Satisfação da Tripulação</span>
                    <span className="font-semibold text-purple-600">4.9/5</span>
                  </div>
                  <div className="progress-maritime h-2">
                    <div className="progress-fill w-[98%]" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-navigation">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-nautical" />
                    Status Operacional
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Sistemas Online</span>
                    <Badge className="badge-crew bg-green-500">99.9%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Integrações Ativas</span>
                    <Badge className="badge-crew bg-blue-500">8/10</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Backup Status</span>
                    <Badge className="badge-crew bg-green-500">Atualizado</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Última Sync</span>
                    <Badge className="badge-crew bg-blue-500">Agora</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-nautical/10 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-dots opacity-30" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-3xl animate-lighthouse" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-nautical/10 to-transparent rounded-full blur-3xl animate-tide" />
      
      <div className="relative z-10 p-6 space-y-6">
        {/* Navegação entre módulos */}
        {activeModule !== "overview" && (
          <div className="flex items-center gap-4 mb-6">
            <Button variant="outline" onClick={() => setActiveModule("overview")} className="btn-harbor">
              ← Voltar à Central
            </Button>
            
            <div className="flex gap-2">
              {strategicModules.map((module) => {
                const Icon = module.icon;
                return (
                  <Button
                    key={module.id}
                    variant={activeModule === module.id ? "default" : "outline"}
                    onClick={() => setActiveModule(module.id as unknown)}
                    className={`flex items-center gap-2 ${activeModule === module.id ? "btn-maritime" : "btn-harbor"}`}
                  >
                    <Icon className="w-4 h-4" />
                    {module.title.split(" ")[0]}
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {renderModuleContent()}
      </div>
    </div>
  );
};

export default Strategic;