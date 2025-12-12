import { useState, useCallback } from "react";;
import React, { useState } from "react";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Workflow,
  Play,
  Pause,
  Settings,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRight,
  Zap,
  Activity,
  BarChart3,
  GitBranch,
  RefreshCw,
} from "lucide-react";

const workflows = [
  {
    id: 1,
    name: "Aprovação de Documentos",
    description: "Fluxo automático de revisão e aprovação de documentos",
    status: "active",
    executions: 1247,
    successRate: 98.5,
    lastRun: "há 5 min",
    steps: 7,
    trigger: "Novo documento",
  },
  {
    id: 2,
    name: "Onboarding de Tripulante",
    description: "Processo automatizado de integração de novos tripulantes",
    status: "active",
    executions: 89,
    successRate: 100,
    lastRun: "há 2h",
    steps: 12,
    trigger: "Nova contratação",
  },
  {
    id: 3,
    name: "Alerta de Manutenção",
    description: "Notificações automáticas para manutenções programadas",
    status: "active",
    executions: 456,
    successRate: 99.1,
    lastRun: "há 15 min",
    steps: 5,
    trigger: "Agendamento",
  },
  {
    id: 4,
    name: "Relatório Diário",
    description: "Geração e envio automático de relatórios operacionais",
    status: "paused",
    executions: 730,
    successRate: 97.8,
    lastRun: "há 1 dia",
    steps: 8,
    trigger: "Agendado 06:00",
  },
  {
    id: 5,
    name: "Processamento de Faturas",
    description: "Extração e validação automática de dados de faturas",
    status: "active",
    executions: 2134,
    successRate: 95.2,
    lastRun: "há 30 min",
    steps: 10,
    trigger: "Email recebido",
  },
  {
    id: 6,
    name: "Backup de Dados",
    description: "Backup incremental automático de dados críticos",
    status: "active",
    executions: 365,
    successRate: 100,
    lastRun: "há 1h",
    steps: 4,
    trigger: "Diário 02:00",
  },
];

const kpis = [
  { title: "Workflows Ativos", value: "24", icon: Workflow, color: "text-purple-500" },
  { title: "Execuções Hoje", value: "1,247", icon: Play, color: "text-green-500" },
  { title: "Taxa de Sucesso", value: "98.7%", icon: CheckCircle2, color: "text-blue-500" },
  { title: "Tempo Economizado", value: "127h", icon: Clock, color: "text-amber-500" },
];

export default function WorkflowsPage() {
  const [workflowStates, setWorkflowStates] = useState<Record<number, boolean>>(
    workflows.reduce((acc, w) => ({ ...acc, [w.id]: w.status === "active" }), {})
  );

  const toggleWorkflow = (id: number) => {
    setWorkflowStates((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <ModulePageWrapper gradient="purple">
      <ModuleHeader
        icon={Workflow}
        title="Workflows Automatizados"
        description="Automação completa de processos operacionais com fluxos visuais"
        gradient="purple"
        badges={[
          { icon: GitBranch, label: "Fluxos Visuais" },
          { icon: Zap, label: "Execução Automática" },
          { icon: Activity, label: "Monitoramento" },
        ]}
      />

      <div className="space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{kpi.title}</p>
                    <p className="text-2xl font-bold mt-1">{kpi.value}</p>
                  </div>
                  <div className={`p-3 rounded-full bg-muted ${kpi.color}`}>
                    <kpi.icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Workflows</h2>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Workflow
          </Button>
        </div>

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="active">Ativos</TabsTrigger>
            <TabsTrigger value="paused">Pausados</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className="grid gap-4">
              {workflows.map((workflow) => (
                <Card key={workflow.id} className="hover:shadow-lg transition-all duration-300">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-950">
                          <Workflow className="h-6 w-6 text-purple-500" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">{workflow.name}</h3>
                            <Badge
                              className={
                                workflowStates[workflow.id]
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-700"
                              }
                            >
                              {workflowStates[workflow.id] ? "Ativo" : "Pausado"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{workflow.description}</p>
                          <div className="flex items-center gap-6 mt-4">
                            <div className="flex items-center gap-2 text-sm">
                              <Play className="h-4 w-4 text-muted-foreground" />
                              <span>{workflow.executions} execuções</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                              <span>{workflow.successRate}% sucesso</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>{workflow.lastRun}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <GitBranch className="h-4 w-4 text-muted-foreground" />
                              <span>{workflow.steps} etapas</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                            <Zap className="h-4 w-4 text-amber-500" />
                            <span>Trigger: {workflow.trigger}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Switch
                          checked={workflowStates[workflow.id]}
                          onCheckedChange={() => toggleWorkflow(workflow.id)}
                        />
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Play className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Taxa de Sucesso</span>
                        <span className="font-medium">{workflow.successRate}%</span>
                      </div>
                      <Progress value={workflow.successRate} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            <div className="grid gap-4">
              {workflows
                .filter((w) => workflowStates[w.id])
                .map((workflow) => (
                  <Card key={workflow.id} className="hover:shadow-lg transition-all">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <Workflow className="h-5 w-5 text-purple-500" />
                        <div className="flex-1">
                          <h3 className="font-semibold">{workflow.name}</h3>
                          <p className="text-sm text-muted-foreground">{workflow.description}</p>
                        </div>
                        <Badge className="bg-green-100 text-green-700">Ativo</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="paused" className="space-y-4">
            <div className="grid gap-4">
              {workflows
                .filter((w) => !workflowStates[w.id])
                .map((workflow) => (
                  <Card key={workflow.id} className="hover:shadow-lg transition-all">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <Workflow className="h-5 w-5 text-gray-500" />
                        <div className="flex-1">
                          <h3 className="font-semibold">{workflow.name}</h3>
                          <p className="text-sm text-muted-foreground">{workflow.description}</p>
                        </div>
                        <Badge className="bg-gray-100 text-gray-700">Pausado</Badge>
                        <Button size="sm">
                          <Play className="h-4 w-4 mr-2" />
                          Ativar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ModulePageWrapper>
  );
}
