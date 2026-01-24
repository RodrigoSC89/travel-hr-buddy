import React, { useState } from "react";
import { ResponsiveDashboard } from "./responsive-dashboard";
import { EnhancedDashboard } from "./enhanced-dashboard";
import PersonalizedRecommendations from "../intelligence/PersonalizedRecommendations";
import IntelligentNotificationCenter from "../intelligence/IntelligentNotificationCenter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Brain, Bell, BarChart3, Sparkles, Users, Target, Trophy, Activity, Lightbulb, LineChart, Star } from "lucide-react";

import { RealTimeCollaboration } from "@/components/innovation/RealTimeCollaboration";
import { AIAssistantPanel } from "@/components/innovation/AIAssistantPanel";
import { SmartWorkflow } from "@/components/innovation/SmartWorkflow";
import { SystemHealthDashboard } from "@/components/innovation/SystemHealthDashboard";
import { Gamification } from "@/components/innovation/Gamification";
import { AdvancedAIAssistant } from "@/components/innovation/AdvancedAIAssistant";
import { BusinessIntelligence } from "@/components/innovation/BusinessIntelligence";

interface GlobalDashboardProps {
  onNavigate?: (module: string) => void;
}

export const GlobalDashboard: React.FC<GlobalDashboardProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    { id: "overview", label: "Visão Geral", icon: BarChart3 },
    { id: "collaboration", label: "Colaboração", icon: Users },
    { id: "ai-assistant", label: "Assistente IA", icon: Sparkles },
    { id: "advanced-ai", label: "IA Avançada", icon: Brain },
    { id: "workflows", label: "Workflows", icon: Target },
    { id: "business-intelligence", label: "BI Analytics", icon: LineChart },
    { id: "gamification", label: "Gamificação", icon: Trophy },
    { id: "system-health", label: "Status Sistema", icon: Activity },
    { id: "recommendations", label: "Recomendações", icon: Star },
    { id: "notifications", label: "Notificações", icon: Bell },
    { id: "insights", label: "Insights IA", icon: Lightbulb }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/30">
      {/* Enhanced Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5" />
        <div className="relative px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Nautilus One
              </h1>
              <p className="text-lg text-muted-foreground">
                Sistema Corporativo Inteligente com IA Avançada
              </p>
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-success/20 text-success-foreground border border-success/30 text-sm font-medium">
                  <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                  Sistema Online
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary-foreground border border-primary/30 text-sm font-medium">
                  <Brain className="w-4 h-4" />
                  IA Ativa
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/20 text-secondary-foreground border border-secondary/30 text-sm font-medium">
                  <Sparkles className="w-4 h-4" />
                  11 Módulos
                </div>
              </div>
            </div>
            <div className="hidden lg:flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">99.8%</div>
                <div className="text-xs text-muted-foreground">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-success">1.2M</div>
                <div className="text-xs text-muted-foreground">Transações</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-info">45</div>
                <div className="text-xs text-muted-foreground">Usuários Ativos</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Tabs */}
      <div className="px-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          {/* Modern Tab Navigation */}
          <div className="relative">
            <ScrollArea className="w-full">
              <div className="flex gap-2 p-2 bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 shadow-lg">
                {tabs.map((tab) => {
                  const IconComponent = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 min-w-fit
                        ${isActive 
                      ? "bg-primary text-primary-foreground shadow-lg transform scale-105" 
                      : "text-foreground/80 hover:text-foreground hover:bg-accent/50 hover:scale-102"
                    }
                      `}
                    >
                      <IconComponent className={`w-5 h-5 ${isActive ? "animate-pulse" : ""}`} />
                      <span className="font-medium whitespace-nowrap">{tab.label}</span>
                      {isActive && (
                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-primary-foreground rounded-full" />
                      )}
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          {/* Enhanced Tab Content */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/2 via-transparent to-secondary/2 rounded-3xl" />
            <div className="relative backdrop-blur-sm rounded-3xl border border-border/50 bg-card/30 p-6 shadow-xl">
              
              <TabsContent value="overview" className="mt-0 space-y-6 animate-fade-in">
                <EnhancedDashboard />
                <ResponsiveDashboard />
              </TabsContent>

              <TabsContent value="collaboration" className="mt-0 space-y-6 animate-fade-in">
                <div className="grid gap-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-info/20">
                      <Users className="w-6 h-6 text-info" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Colaboração em Tempo Real</h2>
                      <p className="text-muted-foreground">Conecte-se e trabalhe junto com sua equipe</p>
                    </div>
                  </div>
                  <RealTimeCollaboration />
                </div>
              </TabsContent>

              <TabsContent value="ai-assistant" className="mt-0 space-y-6 animate-fade-in">
                <div className="grid gap-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-info/20 to-primary/20">
                      <Sparkles className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Assistente IA Inteligente</h2>
                      <p className="text-muted-foreground">Insights automáticos e recomendações personalizadas</p>
                    </div>
                  </div>
                  <AIAssistantPanel />
                </div>
              </TabsContent>

              <TabsContent value="advanced-ai" className="mt-0 space-y-6 animate-fade-in">
                <div className="grid gap-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-info/20">
                      <Brain className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">IA Executiva Avançada</h2>
                      <p className="text-muted-foreground">Análise estratégica e insights de negócio</p>
                    </div>
                  </div>
                  <AdvancedAIAssistant />
                </div>
              </TabsContent>

              <TabsContent value="workflows" className="mt-0 space-y-6 animate-fade-in">
                <div className="grid gap-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-success/20 to-success/10">
                      <Bell className="w-6 h-6 text-success" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Workflows Inteligentes</h2>
                      <p className="text-muted-foreground">Automação avançada de processos</p>
                    </div>
                  </div>
                  <SmartWorkflow />
                </div>
              </TabsContent>

              <TabsContent value="business-intelligence" className="mt-0 space-y-6 animate-fade-in">
                <div className="grid gap-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-warning/20 to-destructive/20">
                      <BarChart3 className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Business Intelligence</h2>
                      <p className="text-muted-foreground">Analytics avançados e insights preditivos</p>
                    </div>
                  </div>
                  <BusinessIntelligence />
                </div>
              </TabsContent>

              <TabsContent value="gamification" className="mt-0 space-y-6 animate-fade-in">
                <div className="grid gap-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20">
                      <Brain className="w-6 h-6 text-warning" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Gamificação Corporativa</h2>
                      <p className="text-muted-foreground">Engajamento e produtividade através de jogos</p>
                    </div>
                  </div>
                  <Gamification />
                </div>
              </TabsContent>

              <TabsContent value="system-health" className="mt-0 space-y-6 animate-fade-in">
                <div className="grid gap-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-info/20 to-primary/20">
                      <Brain className="w-6 h-6 text-info" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Status do Sistema</h2>
                      <p className="text-muted-foreground">Monitoramento em tempo real de todos os módulos</p>
                    </div>
                  </div>
                  <SystemHealthDashboard />
                </div>
              </TabsContent>

              <TabsContent value="recommendations" className="mt-0 space-y-6 animate-fade-in">
                <div className="grid gap-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-secondary/20 to-primary/20">
                      <Sparkles className="w-6 h-6 text-secondary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Recomendações IA</h2>
                      <p className="text-muted-foreground">Sugestões personalizadas baseadas em seu uso</p>
                    </div>
                  </div>
                  <PersonalizedRecommendations 
                    context="dashboard" 
                    onNavigate={onNavigate}
                  />
                </div>
              </TabsContent>

              <TabsContent value="notifications" className="mt-0 space-y-6 animate-fade-in">
                <div className="grid gap-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-destructive/20 to-warning/20">
                      <Bell className="w-6 h-6 text-destructive" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Centro de Notificações</h2>
                      <p className="text-muted-foreground">Alertas inteligentes e comunicações importantes</p>
                    </div>
                  </div>
                  <IntelligentNotificationCenter onNavigate={onNavigate} />
                </div>
              </TabsContent>

              <TabsContent value="insights" className="mt-0 space-y-6 animate-fade-in">
                <div className="grid gap-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-muted to-muted/50">
                      <Brain className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Insights Avançados</h2>
                      <p className="text-muted-foreground">Análises profundas e tendências de mercado</p>
                    </div>
                  </div>
                  
                  <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-border/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Brain className="w-5 h-5 text-primary" />
                        Insights Avançados com IA
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-6 md:grid-cols-2">
                        <Card className="bg-success/10 border-success/30">
                          <CardContent className="p-6">
                            <div className="space-y-4">
                              <h3 className="font-semibold text-success-foreground flex items-center gap-2">
                                <Sparkles className="w-5 h-5" />
                                🚀 Oportunidades de Crescimento
                              </h3>
                              <ul className="space-y-3 text-sm text-foreground">
                                <li className="flex items-start gap-2">
                                  <div className="w-2 h-2 bg-success rounded-full mt-2"></div>
                                  Automatizar 3 processos pode economizar 12h semanais
                                </li>
                                <li className="flex items-start gap-2">
                                  <div className="w-2 h-2 bg-success rounded-full mt-2"></div>
                                  Implementar alertas inteligentes reduzirá gastos em 15%
                                </li>
                                <li className="flex items-start gap-2">
                                  <div className="w-2 h-2 bg-success rounded-full mt-2"></div>
                                  Capacitação em IA pode aumentar produtividade em 28%
                                </li>
                              </ul>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="bg-info/10 border-info/30">
                          <CardContent className="p-6">
                            <div className="space-y-4">
                              <h3 className="font-semibold text-info-foreground flex items-center gap-2">
                                <BarChart3 className="w-5 h-5" />
                                📊 Análise de Padrões
                              </h3>
                              <ul className="space-y-3 text-sm text-foreground">
                                <li className="flex items-start gap-2">
                                  <div className="w-2 h-2 bg-info rounded-full mt-2"></div>
                                  Pico de uso entre 9h-11h (otimizar recursos)
                                </li>
                                <li className="flex items-start gap-2">
                                  <div className="w-2 h-2 bg-info rounded-full mt-2"></div>
                                  Terças-feiras: 34% mais produtivas
                                </li>
                                <li className="flex items-start gap-2">
                                  <div className="w-2 h-2 bg-info rounded-full mt-2"></div>
                                  Módulo de viagens tem 89% de satisfação
                                </li>
                              </ul>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-secondary/10 to-accent/10 border-secondary/30">
                          <CardContent className="p-6">
                            <div className="space-y-4">
                              <h3 className="font-semibold text-primary-foreground flex items-center gap-2">
                                <Target className="w-5 h-5" />
                                🎯 Recomendações Estratégicas
                              </h3>
                              <ul className="space-y-3 text-sm">
                                <li className="flex items-start gap-2">
                                  <div className="w-2 h-2 bg-secondary rounded-full mt-2"></div>
                                  Expandir uso de IA para 80% dos processos
                                </li>
                                <li className="flex items-start gap-2">
                                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                                  Implementar dashboard executivo personalizado
                                </li>
                                <li className="flex items-start gap-2">
                                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                                  Criar fluxos de aprovação automatizados
                                </li>
                              </ul>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200/50">
                          <CardContent className="p-6">
                            <div className="space-y-4">
                              <h3 className="font-semibold text-orange-700 flex items-center gap-2">
                                <Bell className="w-5 h-5" />
                                ⚡ Ações Prioritárias
                              </h3>
                              <ul className="space-y-3 text-sm">
                                <li className="flex items-start gap-2">
                                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                                  Revisar certificados expiram em 15 dias
                                </li>
                                <li className="flex items-start gap-2">
                                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                                  Otimizar alertas de preço ativos
                                </li>
                                <li className="flex items-start gap-2">
                                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                                  Configurar backup automático semanal
                                </li>
                              </ul>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      <div className="mt-8 p-6 border rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10 border-primary/20">
                        <h3 className="font-bold mb-3 flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-primary" />
                          💡 Insight Principal da Semana
                        </h3>
                        <p className="text-sm leading-relaxed">
                          A implementação completa das funcionalidades de IA disponíveis pode resultar em:
                          <strong className="text-primary"> 40% de redução no tempo de tarefas administrativas</strong>, 
                          <strong className="text-success-foreground"> 25% de economia em custos operacionais</strong> e 
                          <strong className="text-info-foreground"> 60% de melhoria na tomada de decisões</strong> baseadas em dados.
                        </p>
                        <div className="mt-4 flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            Baseado na análise de uso dos últimos 30 dias • Confiança: 92%
                          </span>
                          <div className="flex gap-2">
                            <Badge variant="outline" className="text-xs">IA Validado</Badge>
                            <Badge variant="outline" className="text-xs">Alta Confiança</Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </div>
    </div>
  );
};