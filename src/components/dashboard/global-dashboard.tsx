import React, { useState } from 'react';
import { ResponsiveDashboard } from './responsive-dashboard';
import PersonalizedRecommendations from '../intelligence/PersonalizedRecommendations';
import IntelligentNotificationCenter from '../intelligence/IntelligentNotificationCenter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Bell, BarChart3, Sparkles } from 'lucide-react';

import { RealTimeCollaboration } from '@/components/innovation/RealTimeCollaboration';
import { AIAssistantPanel } from '@/components/innovation/AIAssistantPanel';
import { SmartWorkflow } from '@/components/innovation/SmartWorkflow';
import { SystemHealthDashboard } from '@/components/innovation/SystemHealthDashboard';
import { Gamification } from '@/components/innovation/Gamification';
import { AdvancedAIAssistant } from '@/components/innovation/AdvancedAIAssistant';
import { BusinessIntelligence } from '@/components/innovation/BusinessIntelligence';

interface GlobalDashboardProps {
  onNavigate?: (module: string) => void;
}

export const GlobalDashboard: React.FC<GlobalDashboardProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    { id: "overview", label: "Visão Geral", icon: BarChart3 },
    { id: "collaboration", label: "Colaboração", icon: Brain },
    { id: "ai-assistant", label: "Assistente IA", icon: Sparkles },
    { id: "advanced-ai", label: "IA Avançada", icon: Brain },
    { id: "workflows", label: "Workflows", icon: Bell },
    { id: "business-intelligence", label: "BI Analytics", icon: BarChart3 },
    { id: "gamification", label: "Gamificação", icon: Brain },
    { id: "system-health", label: "Status Sistema", icon: Brain },
    { id: "recommendations", label: "Recomendações", icon: Sparkles },
    { id: "notifications", label: "Notificações", icon: Bell },
    { id: "insights", label: "Insights IA", icon: Brain }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Inteligente</h1>
          <p className="text-muted-foreground">
            Visão geral com IA, recomendações personalizadas e insights inteligentes
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-11 w-fit bg-muted/50">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <TabsTrigger 
                key={tab.id} 
                value={tab.id} 
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200"
              >
                <IconComponent className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <ResponsiveDashboard />
        </TabsContent>

        <TabsContent value="collaboration" className="space-y-6">
          <RealTimeCollaboration />
        </TabsContent>

        <TabsContent value="ai-assistant" className="space-y-6">
          <AIAssistantPanel />
        </TabsContent>

        <TabsContent value="advanced-ai" className="space-y-6">
          <AdvancedAIAssistant />
        </TabsContent>

        <TabsContent value="workflows" className="space-y-6">
          <SmartWorkflow />
        </TabsContent>

        <TabsContent value="business-intelligence" className="space-y-6">
          <BusinessIntelligence />
        </TabsContent>

        <TabsContent value="gamification" className="space-y-6">
          <Gamification />
        </TabsContent>

        <TabsContent value="system-health" className="space-y-6">
          <SystemHealthDashboard />
        </TabsContent>

        <TabsContent value="recommendations">
          <PersonalizedRecommendations 
            context="dashboard" 
            onNavigate={onNavigate}
          />
        </TabsContent>

        <TabsContent value="notifications">
          <IntelligentNotificationCenter onNavigate={onNavigate} />
        </TabsContent>

        <TabsContent value="insights">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                Insights Avançados com IA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold text-green-600">🚀 Oportunidades de Crescimento</h3>
                      <ul className="space-y-2 text-sm">
                        <li>• Automatizar 3 processos pode economizar 12h semanais</li>
                        <li>• Implementar alertas inteligentes reduzirá gastos em 15%</li>
                        <li>• Capacitação em IA pode aumentar produtividade em 28%</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold text-blue-600">📊 Análise de Padrões</h3>
                      <ul className="space-y-2 text-sm">
                        <li>• Pico de uso entre 9h-11h (otimizar recursos)</li>
                        <li>• Terças-feiras: 34% mais produtivas</li>
                        <li>• Módulo de viagens tem 89% de satisfação</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold text-purple-600">🎯 Recomendações Estratégicas</h3>
                      <ul className="space-y-2 text-sm">
                        <li>• Expandir uso de IA para 80% dos processos</li>
                        <li>• Implementar dashboard executivo personalizado</li>
                        <li>• Criar fluxos de aprovação automatizados</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold text-orange-600">⚡ Ações Prioritárias</h3>
                      <ul className="space-y-2 text-sm">
                        <li>• Revisar certificados expiram em 15 dias</li>
                        <li>• Otimizar alertas de preço ativos</li>
                        <li>• Configurar backup automático semanal</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-6 p-6 border rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10">
                <h3 className="font-semibold mb-3">💡 Insight Principal da Semana</h3>
                <p className="text-sm leading-relaxed">
                  A implementação completa das funcionalidades de IA disponíveis pode resultar em:
                  <strong> 40% de redução no tempo de tarefas administrativas</strong>, 
                  <strong> 25% de economia em custos operacionais</strong> e 
                  <strong> 60% de melhoria na tomada de decisões</strong> baseadas em dados.
                </p>
                <div className="mt-4">
                  <span className="text-xs text-muted-foreground">
                    Baseado na análise de uso dos últimos 30 dias • Confiança: 92%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};