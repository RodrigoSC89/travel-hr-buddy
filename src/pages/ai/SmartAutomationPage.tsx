/**
import { useCallback, useState } from "react";;
 * Smart Automation Page - Automação Inteligente
 * Workflows automatizados com decisões baseadas em IA
 */

import React, { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Workflow,
  Zap,
  Play,
  Pause,
  Settings,
  Plus,
  Trash2,
  Clock,
  CheckCircle,
  AlertTriangle,
  Activity,
  Brain,
  Target,
  TrendingUp,
  RefreshCw,
  Eye,
  Edit,
  Copy,
  ArrowRight
} from "lucide-react";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { useToast } from "@/hooks/use-toast";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

interface AutomationWorkflow {
  id: string;
  name: string;
  description: string;
  trigger: string;
  actions: string[];
  status: "active" | "paused" | "error";
  executions: number;
  successRate: number;
  lastRun: string;
  aiOptimized: boolean;
  category: string;
}

const SmartAutomationPage: React.FC = () => {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);

  const workflows: AutomationWorkflow[] = [
    {
      id: "1",
      name: "Alerta de Manutenção Preditiva",
      description: "Dispara alertas quando a IA detecta necessidade de manutenção",
      trigger: "Análise de sensores IoT",
      actions: ["Criar ordem de serviço", "Notificar equipe", "Agendar inspeção"],
      status: "active",
      executions: 347,
      successRate: 98.5,
      lastRun: "Há 2 min",
      aiOptimized: true,
      category: "Manutenção"
    },
    {
      id: "2",
      name: "Otimização de Rota Automática",
      description: "Ajusta rotas baseado em condições meteorológicas e tráfego",
      trigger: "Mudança climática detectada",
      actions: ["Recalcular rota", "Atualizar ETA", "Notificar capitão"],
      status: "active",
      executions: 156,
      successRate: 94.2,
      lastRun: "Há 15 min",
      aiOptimized: true,
      category: "Navegação"
    },
    {
      id: "3",
      name: "Gestão de Documentos Vencidos",
      description: "Monitora e alerta sobre documentos próximos do vencimento",
      trigger: "30 dias antes do vencimento",
      actions: ["Enviar email", "Criar tarefa", "Escalar se necessário"],
      status: "active",
      executions: 89,
      successRate: 100,
      lastRun: "Há 1 hora",
      aiOptimized: false,
      category: "Compliance"
    },
    {
      id: "4",
      name: "Análise de Consumo de Combustível",
      description: "Monitora e otimiza consumo de combustível em tempo real",
      trigger: "Consumo acima da média",
      actions: ["Analisar causa", "Sugerir otimização", "Gerar relatório"],
      status: "paused",
      executions: 234,
      successRate: 91.8,
      lastRun: "Há 3 dias",
      aiOptimized: true,
      category: "Operacional"
    },
    {
      id: "5",
      name: "Escala de Tripulação Inteligente",
      description: "Otimiza escalas baseado em certificações e disponibilidade",
      trigger: "Nova viagem criada",
      actions: ["Verificar certificações", "Propor escala", "Notificar RH"],
      status: "error",
      executions: 45,
      successRate: 67.3,
      lastRun: "Erro há 1 dia",
      aiOptimized: true,
      category: "RH"
    }
  ];

  const executionHistory = [
    { day: "Seg", executions: 45, success: 44 },
    { day: "Ter", executions: 52, success: 51 },
    { day: "Qua", executions: 38, success: 37 },
    { day: "Qui", executions: 61, success: 59 },
    { day: "Sex", executions: 47, success: 46 },
    { day: "Sáb", executions: 23, success: 23 },
    { day: "Dom", executions: 15, success: 15 },
  ];

  const efficiencyData = [
    { month: "Set", manual: 45, automated: 12 },
    { month: "Out", manual: 38, automated: 18 },
    { month: "Nov", manual: 29, automated: 25 },
    { month: "Dez", manual: 22, automated: 32 },
    { month: "Jan", manual: 15, automated: 41 },
  ];

  const getStatusBadge = (status: AutomationWorkflow["status"]) => {
    switch (status) {
    case "active":
      return <Badge className="bg-green-500/20 text-green-400"><Activity className="h-3 w-3 mr-1 animate-pulse" />Ativo</Badge>;
    case "paused":
      return <Badge className="bg-yellow-500/20 text-yellow-400"><Pause className="h-3 w-3 mr-1" />Pausado</Badge>;
    case "error":
      return <Badge className="bg-red-500/20 text-red-400"><AlertTriangle className="h-3 w-3 mr-1" />Erro</Badge>;
    }
  };

  const handleToggleWorkflow = useCallback((workflowId: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "pausado" : "ativado";
    toast({
      title: `Workflow ${newStatus}`,
      description: `O workflow foi ${newStatus} com sucesso.`,
    };
  }, [toast]);

  const handleRunWorkflow = useCallback((workflowId: string) => {
    toast({
      title: "Executando Workflow",
      description: "O workflow está sendo executado manualmente...",
    };
  }, [toast]);

  return (
    <ModulePageWrapper gradient="green">
      <ModuleHeader
        icon={Workflow}
        title="Automação Inteligente"
        description="Workflows automatizados com decisões baseadas em IA"
        gradient="green"
        badges={[
          { icon: Zap, label: `${workflows.length} Workflows` },
          { icon: CheckCircle, label: `${workflows.filter(w => w.status === "active").length} Ativos` },
          { icon: Brain, label: "89% Eficiência" }
        ]}
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Workflows Ativos</p>
                <p className="text-2xl font-bold">{workflows.filter(w => w.status === "active").length}</p>
              </div>
              <Activity className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Execuções (7d)</p>
                <p className="text-2xl font-bold">871</p>
              </div>
              <RefreshCw className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Sucesso</p>
                <p className="text-2xl font-bold">97.2%</p>
              </div>
              <Target className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Horas Economizadas</p>
                <p className="text-2xl font-bold">156h</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="workflows" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="executions">Execuções</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="create">Criar Novo</TabsTrigger>
        </TabsList>

        <TabsContent value="workflows" className="space-y-6">
          <div className="space-y-4">
            {workflows.map((workflow) => (
              <Card key={workflow.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{workflow.name}</h3>
                        {getStatusBadge(workflow.status)}
                        {workflow.aiOptimized && (
                          <Badge className="bg-purple-500/20 text-purple-400">
                            <Brain className="h-3 w-3 mr-1" />IA
                          </Badge>
                        )}
                        <Badge variant="outline">{workflow.category}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">{workflow.description}</p>
                      
                      <div className="flex items-center gap-6 text-sm mb-4">
                        <div>
                          <span className="text-muted-foreground">Trigger:</span>
                          <span className="ml-2">{workflow.trigger}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Última execução:</span>
                          <span className="ml-2">{workflow.lastRun}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        {workflow.actions.map((action, idx) => (
                          <React.Fragment key={idx}>
                            <Badge variant="secondary" className="text-xs">{action}</Badge>
                            {idx < workflow.actions.length - 1 && (
                              <ArrowRight className="h-3 w-3 text-muted-foreground" />
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>

                    <div className="text-right ml-6">
                      <div className="text-2xl font-bold">{workflow.executions}</div>
                      <div className="text-sm text-muted-foreground">execuções</div>
                      <div className="text-sm mt-2">
                        <span className={workflow.successRate >= 95 ? "text-green-500" : workflow.successRate >= 80 ? "text-yellow-500" : "text-red-500"}>
                          {workflow.successRate}% sucesso
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4 pt-4 border-t">
                    <Button size="sm" variant="outline" onClick={() => handlehandleRunWorkflow}>
                      <Play className="h-4 w-4 mr-1" />
                      Executar
                    </Button>
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-1" />
                      Logs
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button size="sm" variant="outline">
                      <Copy className="h-4 w-4 mr-1" />
                      Duplicar
                    </Button>
                    <div className="flex-1" />
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Ativo</span>
                      <Switch 
                        checked={workflow.status === "active"}
                        onCheckedChange={() => handleToggleWorkflow(workflow.id, workflow.status}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="executions" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Execuções por Dia
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={executionHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }} />
                    <Bar dataKey="executions" fill="hsl(var(--primary))" name="Total" />
                    <Bar dataKey="success" fill="#22c55e" name="Sucesso" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Histórico Recente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3">
                    {[
                      { workflow: "Alerta de Manutenção", time: "Há 2 min", status: "success" },
                      { workflow: "Otimização de Rota", time: "Há 15 min", status: "success" },
                      { workflow: "Gestão de Documentos", time: "Há 1 hora", status: "success" },
                      { workflow: "Alerta de Manutenção", time: "Há 2 horas", status: "success" },
                      { workflow: "Escala de Tripulação", time: "Há 1 dia", status: "error" },
                      { workflow: "Otimização de Rota", time: "Há 1 dia", status: "success" },
                    ].map((log, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                        <div className="flex items-center gap-3">
                          {log.status === "success" ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          )}
                          <span>{log.workflow}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{log.time}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Comparativo: Manual vs Automatizado
              </CardTitle>
              <CardDescription>
                Horas gastas em tarefas por mês
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={efficiencyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }} />
                  <Line type="monotone" dataKey="manual" stroke="#ef4444" strokeWidth={2} name="Horas Manuais" />
                  <Line type="monotone" dataKey="automated" stroke="#22c55e" strokeWidth={2} name="Horas Automatizadas" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Criar Novo Workflow
              </CardTitle>
              <CardDescription>
                Configure um novo workflow de automação inteligente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nome do Workflow</Label>
                    <Input placeholder="Ex: Monitoramento de Temperatura" />
                  </div>
                  <div className="space-y-2">
                    <Label>Descrição</Label>
                    <Input placeholder="Descreva o objetivo do workflow" />
                  </div>
                  <div className="space-y-2">
                    <Label>Categoria</Label>
                    <Input placeholder="Ex: Manutenção, Navegação, Compliance" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Trigger (Gatilho)</Label>
                    <Input placeholder="Ex: Temperatura acima de 80°C" />
                  </div>
                  <div className="space-y-2">
                    <Label>Ações (separadas por vírgula)</Label>
                    <Input placeholder="Ex: Enviar alerta, Criar tarefa, Notificar" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Otimização por IA</Label>
                    <Switch />
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1">
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Workflow
                </Button>
                <Button variant="outline">
                  <Brain className="h-4 w-4 mr-2" />
                  Sugerir com IA
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </ModulePageWrapper>
  );
};

export default SmartAutomationPage;
