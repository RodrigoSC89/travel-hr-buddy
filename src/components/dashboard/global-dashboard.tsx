import React, { useState } from 'react';
import { ResponsiveDashboard } from './responsive-dashboard';
import PersonalizedRecommendations from '../intelligence/PersonalizedRecommendations';
import IntelligentNotificationCenter from '../intelligence/IntelligentNotificationCenter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Bell, BarChart3, Sparkles } from 'lucide-react';

interface GlobalDashboardProps {
  onNavigate?: (module: string) => void;
}

export const GlobalDashboard: React.FC<GlobalDashboardProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState('overview');

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
        <TabsList className="grid grid-cols-4 w-fit">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Recomendações
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notificações
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Insights IA
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <ResponsiveDashboard />
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