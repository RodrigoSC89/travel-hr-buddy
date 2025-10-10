import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Workflow,
  Play,
  Pause,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Edit,
  Copy,
  Calendar,
  FileText,
  Database,
  Zap,
  Target,
  Activity,
  BarChart3,
  Users,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface WorkflowStep {
  id: string;
  type: "trigger" | "condition" | "action" | "delay";
  title: string;
  description: string;
  config: Record<string, any>;
  position: { x: number; y: number };
  connections: string[];
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  status: "active" | "inactive" | "draft";
  trigger: string;
  steps: WorkflowStep[];
  executions: number;
  successRate: number;
  createdAt: Date;
  lastRun?: Date;
  category: string;
  tags: string[];
}

interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: "running" | "completed" | "failed" | "cancelled";
  startedAt: Date;
  completedAt?: Date;
  duration?: number;
  steps: Array<{
    stepId: string;
    status: "pending" | "running" | "completed" | "failed";
    result?: any;
  }>;
}

const SmartWorkflowAutomation = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([
    {
      id: "1",
      name: "Aprovação de Documentos",
      description: "Workflow para aprovação automática de documentos baseado em regras",
      status: "active",
      trigger: "Documento Enviado",
      steps: [],
      executions: 247,
      successRate: 94.2,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000),
      category: "Documentos",
      tags: ["aprovação", "automático", "documento"],
    },
    {
      id: "2",
      name: "Onboarding de Funcionários",
      description: "Processo completo de integração de novos colaboradores",
      status: "active",
      trigger: "Novo Funcionário",
      steps: [],
      executions: 23,
      successRate: 100,
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      lastRun: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      category: "RH",
      tags: ["onboarding", "funcionário", "integração"],
    },
    {
      id: "3",
      name: "Alertas de Performance",
      description: "Monitoramento automático de KPIs com notificações inteligentes",
      status: "active",
      trigger: "Dados Atualizados",
      steps: [],
      executions: 1520,
      successRate: 98.7,
      createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
      lastRun: new Date(Date.now() - 30 * 60 * 1000),
      category: "Monitoramento",
      tags: ["kpi", "alerta", "performance"],
    },
  ]);

  const [executions, setExecutions] = useState<WorkflowExecution[]>([
    {
      id: "1",
      workflowId: "1",
      status: "completed",
      startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 45000),
      duration: 45,
      steps: [
        { stepId: "1", status: "completed" },
        { stepId: "2", status: "completed" },
        { stepId: "3", status: "completed" },
      ],
    },
    {
      id: "2",
      workflowId: "2",
      status: "running",
      startedAt: new Date(Date.now() - 30 * 60 * 1000),
      steps: [
        { stepId: "1", status: "completed" },
        { stepId: "2", status: "running" },
        { stepId: "3", status: "pending" },
      ],
    },
  ]);

  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newWorkflow, setNewWorkflow] = useState({
    name: "",
    description: "",
    category: "",
    trigger: "",
  });

  // Predefined workflow templates
  const workflowTemplates = [
    {
      name: "Aprovação de Despesas",
      description: "Automatiza o processo de aprovação de reembolsos",
      category: "Financeiro",
      trigger: "Nova Despesa",
      steps: 3,
    },
    {
      name: "Backup Automático",
      description: "Executa backups programados dos dados críticos",
      category: "TI",
      trigger: "Agendamento",
      steps: 4,
    },
    {
      name: "Relatório Semanal",
      description: "Gera e distribui relatórios automaticamente",
      category: "Relatórios",
      trigger: "Cronograma",
      steps: 5,
    },
    {
      name: "Notificação de Vendas",
      description: "Alerta sobre metas e oportunidades de vendas",
      category: "Vendas",
      trigger: "Meta Atingida",
      steps: 2,
    },
  ];

  // Real-time updates simulation
  useEffect(() => {
    const interval = setInterval(() => {
      // Update running executions
      setExecutions(prev =>
        prev.map(exec => {
          if (exec.status === "running") {
            const shouldComplete = Math.random() > 0.7;
            if (shouldComplete) {
              return {
                ...exec,
                status: "completed",
                completedAt: new Date(),
                duration: Math.floor((Date.now() - exec.startedAt.getTime()) / 1000),
              };
            }
          }
          return exec;
        })
      );
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "inactive":
        return <Pause className="w-4 h-4 text-muted-foreground" />;
      case "draft":
        return <Edit className="w-4 h-4 text-blue-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getExecutionStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "running":
        return <Activity className="w-4 h-4 text-blue-500 animate-pulse" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "cancelled":
        return <Pause className="w-4 h-4 text-muted-foreground" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const toggleWorkflowStatus = (id: string) => {
    setWorkflows(prev =>
      prev.map(workflow =>
        workflow.id === id
          ? {
              ...workflow,
              status: workflow.status === "active" ? "inactive" : "active",
            }
          : workflow
      )
    );

    toast({
      title: "Status atualizado",
      description: "Workflow foi ativado/desativado com sucesso",
    });
  };

  const executeWorkflow = (id: string) => {
    const newExecution: WorkflowExecution = {
      id: Date.now().toString(),
      workflowId: id,
      status: "running",
      startedAt: new Date(),
      steps: [
        { stepId: "1", status: "running" },
        { stepId: "2", status: "pending" },
        { stepId: "3", status: "pending" },
      ],
    };

    setExecutions(prev => [newExecution, ...prev]);

    toast({
      title: "Workflow iniciado",
      description: "Execução em andamento...",
    });
  };

  const createWorkflow = () => {
    if (!newWorkflow.name.trim()) return;

    const workflow: Workflow = {
      id: Date.now().toString(),
      name: newWorkflow.name,
      description: newWorkflow.description,
      status: "draft",
      trigger: newWorkflow.trigger,
      steps: [],
      executions: 0,
      successRate: 0,
      createdAt: new Date(),
      category: newWorkflow.category,
      tags: [],
    };

    setWorkflows(prev => [workflow, ...prev]);
    setShowCreateDialog(false);
    setNewWorkflow({ name: "", description: "", category: "", trigger: "" });

    toast({
      title: "Workflow criado",
      description: "Novo workflow adicionado como rascunho",
    });
  };

  const duplicateWorkflow = (workflow: Workflow) => {
    const duplicated: Workflow = {
      ...workflow,
      id: Date.now().toString(),
      name: `${workflow.name} (Cópia)`,
      status: "draft",
      executions: 0,
      createdAt: new Date(),
      lastRun: undefined,
    };

    setWorkflows(prev => [duplicated, ...prev]);

    toast({
      title: "Workflow duplicado",
      description: "Cópia criada como rascunho",
    });
  };

  const deleteWorkflow = (id: string) => {
    setWorkflows(prev => prev.filter(w => w.id !== id));
    toast({
      title: "Workflow excluído",
      description: "Workflow removido permanentemente",
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "documentos":
        return <FileText className="w-4 h-4" />;
      case "rh":
        return <Users className="w-4 h-4" />;
      case "monitoramento":
        return <BarChart3 className="w-4 h-4" />;
      case "financeiro":
        return <Target className="w-4 h-4" />;
      case "ti":
        return <Database className="w-4 h-4" />;
      case "vendas":
        return <Zap className="w-4 h-4" />;
      default:
        return <Workflow className="w-4 h-4" />;
    }
  };

  const activeWorkflows = workflows.filter(w => w.status === "active").length;
  const totalExecutions = workflows.reduce((sum, w) => sum + w.executions, 0);
  const avgSuccessRate = workflows.reduce((sum, w) => sum + w.successRate, 0) / workflows.length;
  const runningExecutions = executions.filter(e => e.status === "running").length;

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Automação de Workflows</h1>
          <p className="text-muted-foreground">
            Automatize processos e otimize operações empresariais
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Novo Workflow
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Workflow</DialogTitle>
                <DialogDescription>Configure um novo processo automatizado</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Nome do Workflow</label>
                  <Input
                    value={newWorkflow.name}
                    onChange={e => setNewWorkflow(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Aprovação de Documentos"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Descrição</label>
                  <Textarea
                    value={newWorkflow.description}
                    onChange={e =>
                      setNewWorkflow(prev => ({ ...prev, description: e.target.value }))
                    }
                    placeholder="Descreva o objetivo deste workflow..."
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Categoria</label>
                  <Select
                    value={newWorkflow.category}
                    onValueChange={value => setNewWorkflow(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="documentos">Documentos</SelectItem>
                      <SelectItem value="rh">Recursos Humanos</SelectItem>
                      <SelectItem value="financeiro">Financeiro</SelectItem>
                      <SelectItem value="monitoramento">Monitoramento</SelectItem>
                      <SelectItem value="vendas">Vendas</SelectItem>
                      <SelectItem value="ti">TI</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Trigger</label>
                  <Input
                    value={newWorkflow.trigger}
                    onChange={e => setNewWorkflow(prev => ({ ...prev, trigger: e.target.value }))}
                    placeholder="Ex: Documento Enviado"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={createWorkflow}>Criar Workflow</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium">Workflows Ativos</span>
            </div>
            <div className="text-2xl font-bold">{activeWorkflows}</div>
            <p className="text-xs text-muted-foreground">de {workflows.length} total</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">Execuções</span>
            </div>
            <div className="text-2xl font-bold">{totalExecutions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{runningExecutions} em execução</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium">Taxa de Sucesso</span>
            </div>
            <div className="text-2xl font-bold">{avgSuccessRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Média geral</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium">Tempo Economizado</span>
            </div>
            <div className="text-2xl font-bold">847h</div>
            <p className="text-xs text-muted-foreground">Este mês</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="workflows" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="executions">Execuções</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="workflows" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {workflows.map(workflow => (
              <Card key={workflow.id} className="border-border hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(workflow.category)}
                      <CardTitle className="text-lg">{workflow.name}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(workflow.status)}
                      <Badge variant={workflow.status === "active" ? "default" : "secondary"}>
                        {workflow.status}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription className="line-clamp-2">{workflow.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Execuções:</span>
                      <div className="font-medium">{workflow.executions}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Sucesso:</span>
                      <div className="font-medium">{workflow.successRate}%</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Taxa de Sucesso</span>
                      <span>{workflow.successRate}%</span>
                    </div>
                    <Progress value={workflow.successRate} className="h-2" />
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>Criado: {workflow.createdAt.toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>
                      Última execução:{" "}
                      {workflow.lastRun ? workflow.lastRun.toLocaleString() : "Nunca"}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {workflow.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      onClick={() => executeWorkflow(workflow.id)}
                      disabled={workflow.status !== "active"}
                      className="flex-1"
                    >
                      <Play className="w-3 h-3 mr-1" />
                      Executar
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleWorkflowStatus(workflow.id)}
                    >
                      {workflow.status === "active" ? (
                        <Pause className="w-3 h-3" />
                      ) : (
                        <Play className="w-3 h-3" />
                      )}
                    </Button>

                    <Button size="sm" variant="outline" onClick={() => duplicateWorkflow(workflow)}>
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="executions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Execuções Recentes</CardTitle>
              <CardDescription>Histórico de execuções de workflows em tempo real</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {executions.map(execution => {
                    const workflow = workflows.find(w => w.id === execution.workflowId);
                    return (
                      <div
                        key={execution.id}
                        className="flex items-center gap-4 p-4 border border-border rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          {getExecutionStatusIcon(execution.status)}
                          <div>
                            <h4 className="font-medium">{workflow?.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {execution.status === "running"
                                ? "Em execução"
                                : execution.status === "completed"
                                  ? "Concluído"
                                  : execution.status === "failed"
                                    ? "Falhou"
                                    : "Cancelado"}
                            </p>
                          </div>
                        </div>

                        <div className="flex-1">
                          <div className="flex justify-between text-sm mb-2">
                            <span>Progresso</span>
                            <span>
                              {execution.steps.filter(s => s.status === "completed").length}/
                              {execution.steps.length} etapas
                            </span>
                          </div>
                          <Progress
                            value={
                              (execution.steps.filter(s => s.status === "completed").length /
                                execution.steps.length) *
                              100
                            }
                            className="h-2"
                          />
                        </div>

                        <div className="text-right text-sm">
                          <div className="font-medium">
                            {execution.startedAt.toLocaleTimeString()}
                          </div>
                          <div className="text-muted-foreground">
                            {execution.duration ? `${execution.duration}s` : "Em andamento"}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {workflowTemplates.map((template, index) => (
              <Card
                key={index}
                className="border-border hover:shadow-md transition-shadow cursor-pointer"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(template.category)}
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                    </div>
                    <Badge variant="outline">{template.category}</Badge>
                  </div>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Trigger: {template.trigger}</span>
                      <span>{template.steps} etapas</span>
                    </div>

                    <Button size="sm" variant="outline">
                      <Plus className="w-3 h-3 mr-1" />
                      Usar Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SmartWorkflowAutomation;
