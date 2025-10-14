/**
 * MMI Page - Intelligent Maintenance Module
 * Main page for accessing MMI features
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ModulePageWrapper } from '@/components/ui/module-page-wrapper';
import { ModuleHeader } from '@/components/ui/module-header';
import {
  Wrench,
  Bot,
  BarChart3,
  FileText,
  History,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Settings,
  Ship,
  Activity,
} from 'lucide-react';
import { MMICentralJobsDashboard } from '@/modules/mmi/components/MMICentralJobsDashboard';
import { MMIMaintenanceCopilot } from '@/modules/mmi/components/MMIMaintenanceCopilot';

export default function MMI() {
  const [activeView, setActiveView] = useState<'overview' | 'dashboard' | 'copilot'>('overview');

  return (
    <ModulePageWrapper gradient="orange">
      <ModuleHeader
        icon={Wrench}
        title="MMI - Manutenção Inteligente"
        description="Módulo de Manutenção Inteligente com IA para previsão de falhas e gestão de ordens de serviço"
        gradient="orange"
        badges={[
          { icon: Bot, label: 'IA Ativa' },
          { icon: TrendingUp, label: 'Preditivo' },
          { icon: CheckCircle, label: 'Automatizado' },
        ]}
      />

      {activeView === 'overview' && (
        <>
          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveView('dashboard')}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <BarChart3 className="h-8 w-8 text-blue-600" />
                  <Badge>Principal</Badge>
                </div>
                <CardTitle className="mt-4">Central de Jobs</CardTitle>
                <CardDescription>
                  Painel centralizado com filtros inteligentes para gestão de todos os jobs de manutenção
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Filtros por status e prioridade
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Dashboard de estatísticas
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Sugestões de IA integradas
                  </li>
                </ul>
                <Button className="w-full mt-4" onClick={() => setActiveView('dashboard')}>
                  Acessar Central de Jobs
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveView('copilot')}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Bot className="h-8 w-8 text-purple-600" />
                  <Badge variant="outline">🧠 IA</Badge>
                </div>
                <CardTitle className="mt-4">Copilot de Manutenção</CardTitle>
                <CardDescription>
                  Assistente conversacional com IA para técnicos e engenheiros
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Análise de falhas
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Previsão preditiva
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Abertura automática de OS
                  </li>
                </ul>
                <Button className="w-full mt-4" onClick={() => setActiveView('copilot')}>
                  Abrir Copilot
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                  <Badge variant="outline">Em Breve</Badge>
                </div>
                <CardTitle className="mt-4">Análise Preditiva</CardTitle>
                <CardDescription>
                  Machine Learning para previsão de falhas e otimização de manutenção
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Análise de padrões
                  </li>
                  <li className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Previsão de falhas
                  </li>
                  <li className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Otimização de rotas
                  </li>
                </ul>
                <Button variant="outline" className="w-full mt-4" disabled>
                  Em Desenvolvimento
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Tabs with Features */}
          <Tabs defaultValue="features" className="space-y-4">
            <TabsList className="grid grid-cols-3 w-full max-w-md">
              <TabsTrigger value="features">Funcionalidades</TabsTrigger>
              <TabsTrigger value="integrations">Integrações</TabsTrigger>
              <TabsTrigger value="data">Estrutura</TabsTrigger>
            </TabsList>

            <TabsContent value="features" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="h-5 w-5" />
                    Funcionalidades Principais
                  </CardTitle>
                  <CardDescription>
                    Recursos disponíveis no módulo MMI
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-start gap-3">
                        <BarChart3 className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                        <div>
                          <h4 className="font-semibold mb-1">Central de Jobs</h4>
                          <p className="text-sm text-muted-foreground">
                            Gestão centralizada de todos os jobs de manutenção preventiva e corretiva
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-start gap-3">
                        <Bot className="h-6 w-6 text-purple-600 flex-shrink-0 mt-1" />
                        <div>
                          <h4 className="font-semibold mb-1">Copilot IA</h4>
                          <p className="text-sm text-muted-foreground">
                            Assistente conversacional para consultas técnicas e sugestões
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-start gap-3">
                        <FileText className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                        <div>
                          <h4 className="font-semibold mb-1">Ordens de Serviço</h4>
                          <p className="text-sm text-muted-foreground">
                            Abertura e acompanhamento automático de OS vinculadas aos jobs
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-start gap-3">
                        <History className="h-6 w-6 text-orange-600 flex-shrink-0 mt-1" />
                        <div>
                          <h4 className="font-semibold mb-1">Histórico Técnico</h4>
                          <p className="text-sm text-muted-foreground">
                            Registro completo de eventos, falhas, trocas e inspeções
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-start gap-3">
                        <TrendingUp className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
                        <div>
                          <h4 className="font-semibold mb-1">Previsão de Falhas</h4>
                          <p className="text-sm text-muted-foreground">
                            Análise preditiva baseada em histórico e sensores IoT
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-start gap-3">
                        <Settings className="h-6 w-6 text-gray-600 flex-shrink-0 mt-1" />
                        <div>
                          <h4 className="font-semibold mb-1">Horímetros</h4>
                          <p className="text-sm text-muted-foreground">
                            Controle de uso com leituras manuais, OCR e IoT
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="integrations" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Integrações Disponíveis
                  </CardTitle>
                  <CardDescription>
                    Conectividade com outros sistemas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Activity className="h-6 w-6 text-blue-600" />
                        <div>
                          <h4 className="font-semibold">Sensores IoT</h4>
                          <p className="text-sm text-muted-foreground">
                            Dados em tempo real de equipamentos
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">Disponível</Badge>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Ship className="h-6 w-6 text-green-600" />
                        <div>
                          <h4 className="font-semibold">Gestão de Frota</h4>
                          <p className="text-sm text-muted-foreground">
                            Vinculação com ativos e embarcações
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">Disponível</Badge>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-6 w-6 text-purple-600" />
                        <div>
                          <h4 className="font-semibold">Checklists</h4>
                          <p className="text-sm text-muted-foreground">
                            Vinculação com procedimentos e inspeções
                          </p>
                        </div>
                      </div>
                      <Badge>Em Breve</Badge>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Settings className="h-6 w-6 text-orange-600" />
                        <div>
                          <h4 className="font-semibold">Estoque</h4>
                          <p className="text-sm text-muted-foreground">
                            Integração com gestão de peças e materiais
                          </p>
                        </div>
                      </div>
                      <Badge>Em Breve</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="data" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Estrutura de Dados
                  </CardTitle>
                  <CardDescription>
                    Organização do banco de dados MMI
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 border rounded-lg bg-blue-50 dark:bg-blue-900/20">
                      <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-1">
                        mmi_assets
                      </h4>
                      <p className="text-sm text-blue-800 dark:text-blue-300">
                        Ativos da frota - embarcações e equipamentos principais
                      </p>
                    </div>

                    <div className="p-3 border rounded-lg bg-green-50 dark:bg-green-900/20">
                      <h4 className="font-semibold text-green-900 dark:text-green-200 mb-1">
                        mmi_components
                      </h4>
                      <p className="text-sm text-green-800 dark:text-green-300">
                        Componentes técnicos vinculados aos ativos
                      </p>
                    </div>

                    <div className="p-3 border rounded-lg bg-purple-50 dark:bg-purple-900/20">
                      <h4 className="font-semibold text-purple-900 dark:text-purple-200 mb-1">
                        mmi_jobs
                      </h4>
                      <p className="text-sm text-purple-800 dark:text-purple-300">
                        Jobs de manutenção preventiva e corretiva
                      </p>
                    </div>

                    <div className="p-3 border rounded-lg bg-orange-50 dark:bg-orange-900/20">
                      <h4 className="font-semibold text-orange-900 dark:text-orange-200 mb-1">
                        mmi_os
                      </h4>
                      <p className="text-sm text-orange-800 dark:text-orange-300">
                        Ordens de serviço vinculadas aos jobs
                      </p>
                    </div>

                    <div className="p-3 border rounded-lg bg-red-50 dark:bg-red-900/20">
                      <h4 className="font-semibold text-red-900 dark:text-red-200 mb-1">
                        mmi_history
                      </h4>
                      <p className="text-sm text-red-800 dark:text-red-300">
                        Histórico técnico de eventos e manutenções
                      </p>
                    </div>

                    <div className="p-3 border rounded-lg bg-gray-50 dark:bg-gray-900/20">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-200 mb-1">
                        mmi_hours
                      </h4>
                      <p className="text-sm text-gray-800 dark:text-gray-300">
                        Horímetros e leituras de uso (manual, OCR, IoT)
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}

      {activeView === 'dashboard' && (
        <div className="space-y-4">
          <Button variant="outline" onClick={() => setActiveView('overview')}>
            ← Voltar à Visão Geral
          </Button>
          <MMICentralJobsDashboard />
        </div>
      )}

      {activeView === 'copilot' && (
        <div className="space-y-4">
          <Button variant="outline" onClick={() => setActiveView('overview')}>
            ← Voltar à Visão Geral
          </Button>
          <div className="h-[800px]">
            <MMIMaintenanceCopilot />
          </div>
        </div>
      )}
    </ModulePageWrapper>
  );
}
