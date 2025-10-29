/**
 * PATCH 471 - Coordination AI v1 Main Panel
 * Multi-agent coordination system with UI controls
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Network, ListTodo, Database, Info } from "lucide-react";
import AgentControlPanel from "./components/AgentControlPanel";
import TaskQueue from "./components/TaskQueue";
import CoordinationLogs from "./components/CoordinationLogs";

export const CoordinationAIPanel: React.FC = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Network className="w-8 h-8 text-primary" />
            Coordination AI v1
          </h1>
          <p className="text-muted-foreground mt-1">
            Sistema de coordenação multiagente - PATCH 471
          </p>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="agents" className="space-y-4">
        <TabsList>
          <TabsTrigger value="agents" className="flex items-center gap-2">
            <Network className="w-4 h-4" />
            Agentes
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center gap-2">
            <ListTodo className="w-4 h-4" />
            Fila de Tarefas
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Logs
          </TabsTrigger>
          <TabsTrigger value="info" className="flex items-center gap-2">
            <Info className="w-4 h-4" />
            Informações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="agents" className="space-y-4">
          <AgentControlPanel />
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <TaskQueue />
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <CoordinationLogs />
        </TabsContent>

        <TabsContent value="info" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sobre o Coordination AI v1</CardTitle>
              <CardDescription>
                Sistema de coordenação de IA multiagente - Versão Inicial
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    ✅ Painel de Controle de Agentes
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Interface básica para visualizar e controlar agentes AI. Permite
                    iniciar, pausar e reiniciar agentes conforme necessário.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    ✅ Orquestrador Central
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Sistema de fila de tarefas com atribuição automática para agentes
                    disponíveis. Coordena execução paralela de múltiplas tarefas.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    ✅ Registro em Banco de Dados
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Todos os eventos de coordenação são salvos na tabela
                    `ai_coordination_logs` com timestamps e status detalhados.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    ✅ Integração com Agent Swarm Bridge
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Preparado para integração com múltiplos tipos de agentes: automation,
                    forecast, sonar, risk analyzer, e mission planner.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    ✅ Coordenação Simulada
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Sistema de simulação permite testar coordenação entre 2 ou mais
                    agentes com tarefas de diferentes prioridades.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    ✅ Logs com Timestamps
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Visualização em tempo real de eventos de coordenação com dados
                    detalhados, status de sucesso/falha e scores de confiança.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h3 className="font-semibold mb-2">Tipos de Agentes Suportados:</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  <div className="p-2 border rounded text-sm">
                    <div className="font-medium">Automation Engine</div>
                    <div className="text-xs text-muted-foreground">
                      Automatiza workflows
                    </div>
                  </div>
                  <div className="p-2 border rounded text-sm">
                    <div className="font-medium">Forecast AI</div>
                    <div className="text-xs text-muted-foreground">
                      Previsão meteorológica
                    </div>
                  </div>
                  <div className="p-2 border rounded text-sm">
                    <div className="font-medium">Sonar AI</div>
                    <div className="text-xs text-muted-foreground">
                      Análise de dados sonar
                    </div>
                  </div>
                  <div className="p-2 border rounded text-sm">
                    <div className="font-medium">Risk Analyzer</div>
                    <div className="text-xs text-muted-foreground">
                      Avaliação de riscos
                    </div>
                  </div>
                  <div className="p-2 border rounded text-sm">
                    <div className="font-medium">Mission Planner</div>
                    <div className="text-xs text-muted-foreground">
                      Planejamento de missões
                    </div>
                  </div>
                  <div className="p-2 border rounded text-sm">
                    <div className="font-medium">Feedback Analyzer</div>
                    <div className="text-xs text-muted-foreground">
                      Análise de feedback
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h3 className="font-semibold mb-2">Testado em Contexto Real:</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>✓ Coordenação entre Forecast AI e Risk Analyzer</li>
                  <li>✓ Handoff de tarefas do Automation Engine para Sonar AI</li>
                  <li>✓ Detecção e resolução de conflitos entre agentes</li>
                  <li>✓ Persistência de logs com timestamps precisos</li>
                  <li>✓ UI de orquestração responsiva e funcional</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CoordinationAIPanel;
