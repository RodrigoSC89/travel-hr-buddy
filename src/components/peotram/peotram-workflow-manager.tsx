import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Workflow,
  Plus,
  Play,
  Pause,
  Square,
  Edit,
  Copy,
  Trash2,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  ArrowRight,
  Settings,
  Calendar,
  Target,
} from "lucide-react";

interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  assignee: string;
  estimatedDuration: number;
  status: "pending" | "in-progress" | "completed" | "blocked";
  dependencies: string[];
}

interface PeotramWorkflow {
  id: string;
  name: string;
  description: string;
  type:
    | "audit-preparation"
    | "non-conformity-resolution"
    | "compliance-check"
    | "training"
    | "custom";
  status: "draft" | "active" | "paused" | "completed";
  priority: "low" | "medium" | "high" | "critical";
  steps: WorkflowStep[];
  createdAt: string;
  updatedAt: string;
  progress: number;
}

export const PeotramWorkflowManager: React.FC = () => {
  const [workflows, setWorkflows] = useState<PeotramWorkflow[]>(getDemoWorkflows());
  const [selectedWorkflow, setSelectedWorkflow] = useState<PeotramWorkflow | null>(null);
  const [isNewWorkflowOpen, setIsNewWorkflowOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  function getDemoWorkflows(): PeotramWorkflow[] {
    return [
      {
        id: "WF001",
        name: "Preparação Auditoria Embarcação",
        description: "Fluxo completo para preparação de auditoria PEOTRAM em embarcação",
        type: "audit-preparation",
        status: "active",
        priority: "high",
        progress: 65,
        createdAt: "2024-01-15",
        updatedAt: "2024-01-20",
        steps: [
          {
            id: "STEP001",
            name: "Planejamento da Auditoria",
            description: "Definir escopo, objetivos e cronograma da auditoria",
            assignee: "João Silva",
            estimatedDuration: 2,
            status: "completed",
            dependencies: [],
          },
          {
            id: "STEP002",
            name: "Preparação de Documentos",
            description: "Reunir e organizar toda documentação necessária",
            assignee: "Maria Santos",
            estimatedDuration: 3,
            status: "in-progress",
            dependencies: ["STEP001"],
          },
          {
            id: "STEP003",
            name: "Coordenação com Embarcação",
            description: "Alinhar disponibilidade e requisitos com a tripulação",
            assignee: "Carlos Eduardo",
            estimatedDuration: 1,
            status: "pending",
            dependencies: ["STEP001"],
          },
        ],
      },
      {
        id: "WF002",
        name: "Resolução de Não Conformidade",
        description: "Processo padronizado para resolução de não conformidades críticas",
        type: "non-conformity-resolution",
        status: "active",
        priority: "critical",
        progress: 30,
        createdAt: "2024-01-18",
        updatedAt: "2024-01-22",
        steps: [
          {
            id: "STEP004",
            name: "Análise da Não Conformidade",
            description: "Investigar causas raiz e impactos da não conformidade",
            assignee: "Ana Costa",
            estimatedDuration: 1,
            status: "completed",
            dependencies: [],
          },
          {
            id: "STEP005",
            name: "Plano de Ação Corretiva",
            description: "Desenvolver plano detalhado de correção",
            assignee: "Pedro Oliveira",
            estimatedDuration: 2,
            status: "in-progress",
            dependencies: ["STEP004"],
          },
        ],
      },
    ];
  }

  const getStatusColor = (status: string) => {
    switch (status) {
    case "completed":
      return "bg-success/20 text-success border-success/30";
    case "active":
    case "in-progress":
      return "bg-info/20 text-info border-info/30";
    case "paused":
    case "blocked":
      return "bg-warning/20 text-warning border-warning/30";
    case "draft":
    case "pending":
      return "bg-muted/20 text-muted-foreground border-muted/30";
    default:
      return "bg-muted/20 text-muted-foreground border-muted/30";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
    case "critical":
      return "bg-destructive/20 text-destructive border-destructive/30";
    case "high":
      return "bg-warning/20 text-warning border-warning/30";
    case "medium":
      return "bg-info/20 text-info border-info/30";
    case "low":
      return "bg-muted/20 text-muted-foreground border-muted/30";
    default:
      return "bg-muted/20 text-muted-foreground border-muted/30";
    }
  };

  const getStepStatusIcon = (status: string) => {
    switch (status) {
    case "completed":
      return <CheckCircle className="w-4 h-4 text-success" />;
    case "in-progress":
      return <Clock className="w-4 h-4 text-info" />;
    case "blocked":
      return <AlertCircle className="w-4 h-4 text-destructive" />;
    default:
      return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gestão de Workflows</h2>
          <p className="text-muted-foreground">
            Gerencie processos e fluxos de trabalho do PEOTRAM
          </p>
        </div>

        <div className="flex gap-2">
          <Dialog open={isNewWorkflowOpen} onOpenChange={setIsNewWorkflowOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Novo Workflow
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Criar Novo Workflow</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="workflow-name">Nome</Label>
                    <Input id="workflow-name" placeholder="Nome do workflow" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="workflow-type">Tipo</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="audit-preparation">Preparação de Auditoria</SelectItem>
                        <SelectItem value="non-conformity-resolution">Resolução de NC</SelectItem>
                        <SelectItem value="compliance-check">
                          Verificação de Conformidade
                        </SelectItem>
                        <SelectItem value="training">Treinamento</SelectItem>
                        <SelectItem value="custom">Personalizado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="workflow-description">Descrição</Label>
                  <Textarea id="workflow-description" placeholder="Descrição do workflow" />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsNewWorkflowOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={() => setIsNewWorkflowOpen(false)}>Criar Workflow</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="active">Workflows Ativos</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Workflow className="w-8 h-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{workflows.length}</p>
                    <p className="text-sm text-muted-foreground">Total Workflows</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Play className="w-8 h-8 text-success" />
                  <div>
                    <p className="text-2xl font-bold">
                      {workflows.filter(w => w.status === "active").length}
                    </p>
                    <p className="text-sm text-muted-foreground">Ativos</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-8 h-8 text-warning" />
                  <div>
                    <p className="text-2xl font-bold">
                      {workflows.filter(w => w.status === "paused").length}
                    </p>
                    <p className="text-sm text-muted-foreground">Pausados</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-8 h-8 text-info" />
                  <div>
                    <p className="text-2xl font-bold">
                      {workflows.filter(w => w.status === "completed").length}
                    </p>
                    <p className="text-sm text-muted-foreground">Concluídos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="active" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {workflows
              .filter(w => w.status === "active")
              .map(workflow => (
                <Card key={workflow.id} className="cursor-pointer hover:shadow-lg transition-all">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{workflow.name}</CardTitle>
                      <div className="flex gap-2">
                        <Badge variant="outline" className={getStatusColor(workflow.status)}>
                          {workflow.status}
                        </Badge>
                        <Badge variant="outline" className={getPriorityColor(workflow.priority)}>
                          {workflow.priority}
                        </Badge>
                      </div>
                    </div>
                    <CardDescription>{workflow.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${workflow.progress}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progresso: {workflow.progress}%</span>
                      <span className="text-muted-foreground">
                        {workflow.steps.filter(s => s.status === "completed").length}/
                        {workflow.steps.length} etapas
                      </span>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">Próximas Etapas:</h4>
                      {workflow.steps
                        .filter(s => s.status === "in-progress" || s.status === "pending")
                        .slice(0, 2)
                        .map(step => (
                          <div
                            key={step.id}
                            className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg"
                          >
                            {getStepStatusIcon(step.status)}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{step.name}</p>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {step.assignee}
                                <Clock className="w-3 h-3 ml-2" />
                                {step.estimatedDuration}h
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="w-3 h-3 mr-1" />
                        Editar
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Pause className="w-3 h-3 mr-1" />
                        Pausar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="text-center p-8">
            <Workflow className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Templates de Workflow</h3>
            <p className="text-muted-foreground mb-4">
              Crie templates reutilizáveis para padronizar processos
            </p>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Criar Template
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
