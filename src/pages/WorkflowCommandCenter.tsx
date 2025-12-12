/**
import { useCallback, useMemo, useState } from "react";;
 * PATCH UNIFY-12.0 - Workflow Command Center
 * Centro Unificado de Workflows - Fusão de 4 módulos:
 * - Workflow Visual IA (/workflow-visual)
 * - Sugestões Workflow (/workflow-suggestions)
 * - Workflow (/workflow)
 * - Smart Workflow (/smart-workflow)
 */

import React, { useState, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useWorkflows } from "@/hooks/useWorkflows";
import { useWorkflowAI, workflowTemplates } from "@/hooks/useWorkflowAI";
import { WorkflowHeader } from "@/components/automation/workflow/WorkflowHeader";
import { WorkflowStats } from "@/components/automation/workflow/WorkflowStats";
import { WorkflowCard } from "@/components/automation/workflow/WorkflowCard";
import { WorkflowFilters } from "@/components/automation/workflow/WorkflowFilters";
import { WorkflowAISuggestions } from "@/components/ai/WorkflowAISuggestions";
import {
  RefreshCw,
  Settings,
  Sparkles,
  Workflow,
  GitBranch,
  Lightbulb,
  Zap,
  Play,
  Pause,
  CheckCircle2,
  AlertTriangle,
  Clock,
  TrendingUp,
  Bot,
  Target,
  BarChart3,
  Network,
  ArrowRight,
  Plus,
  Layers
} from "lucide-react";

// Visual Workflow Node Types
interface WorkflowNode {
  id: string;
  type: "trigger" | "action" | "condition" | "delay" | "end";
  label: string;
  status: "pending" | "running" | "completed" | "error";
  config?: Record<string, unknown>;
}

// Mock visual workflow data
const mockVisualWorkflows = [
  {
    id: "vw-1",
    name: "Onboarding Crew Automation",
    nodes: [
      { id: "n1", type: "trigger" as const, label: "Novo tripulante cadastrado", status: "completed" as const },
      { id: "n2", type: "action" as const, label: "Criar credenciais", status: "completed" as const },
      { id: "n3", type: "condition" as const, label: "Certificações válidas?", status: "running" as const },
      { id: "n4", type: "action" as const, label: "Agendar treinamento", status: "pending" as const },
      { id: "n5", type: "end" as const, label: "Onboarding completo", status: "pending" as const },
    ],
    status: "running",
    executions: 47,
    lastRun: "2024-01-15T10:30:00Z",
  },
  {
    id: "vw-2",
    name: "Manutenção Preventiva Flow",
    nodes: [
      { id: "n1", type: "trigger" as const, label: "Timer: 30 dias", status: "completed" as const },
      { id: "n2", type: "action" as const, label: "Gerar checklist", status: "completed" as const },
      { id: "n3", type: "action" as const, label: "Notificar técnico", status: "completed" as const },
      { id: "n4", type: "delay" as const, label: "Aguardar 24h", status: "running" as const },
      { id: "n5", type: "condition" as const, label: "Tarefa concluída?", status: "pending" as const },
      { id: "n6", type: "end" as const, label: "Finalizar", status: "pending" as const },
    ],
    status: "running",
    executions: 156,
    lastRun: "2024-01-15T08:00:00Z",
  },
  {
    id: "vw-3",
    name: "Alerta de Certificação",
    nodes: [
      { id: "n1", type: "trigger" as const, label: "Certificado expira em 30 dias", status: "completed" as const },
      { id: "n2", type: "action" as const, label: "Enviar email", status: "completed" as const },
      { id: "n3", type: "action" as const, label: "Criar tarefa", status: "completed" as const },
      { id: "n4", type: "end" as const, label: "Alerta enviado", status: "completed" as const },
    ],
    status: "completed",
    executions: 89,
    lastRun: "2024-01-14T14:20:00Z",
  },
];

export default function WorkflowCommandCenter() {
  const { toast } = useToast();
  const {
    workflows, automationRules, isLoading,
    createWorkflow, updateWorkflow, deleteWorkflow,
    startWorkflow, pauseWorkflow, toggleAutomationRule,
    createAutomationRule, exportWorkflows, refetch,
  } = useWorkflows();

  const { isAnalyzing, generateWorkflowFromDescription } = useWorkflowAI();

  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [unreadCount, setUnreadCount] = useState(3);

  // Dialogs
  const [showNewWorkflow, setShowNewWorkflow] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<unknown>(null);
  const [newWorkflowData, setNewWorkflowData] = useState({ name: "", description: "", category: "custom", priority: "medium" });

  // Visual workflow state
  const [selectedVisualWorkflow, setSelectedVisualWorkflow] = useState<typeof mockVisualWorkflows[0] | null>(null);

  // Filtered workflows
  const filteredWorkflows = workflows.filter(w => {
    const matchesSearch = w.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (w.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchesStatus = statusFilter === "all" || w.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || w.category === categoryFilter;
    const matchesPriority = priorityFilter === "all" || w.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
  };

  const handleClearFilters = useCallback(() => {
    setSearchTerm("");
    setStatusFilter("all");
    setCategoryFilter("all");
    setPriorityFilter("all");
  }, []);

  const handleMarkAllRead = () => {
    setUnreadCount(0);
    toast({ title: "Notificações", description: "Todas marcadas como lidas" });
  };

  const handleNewWorkflow = async () => {
    if (!newWorkflowData.name) {
      toast({ title: "Erro", description: "Nome é obrigatório", variant: "destructive" });
      return;
    }
    await createWorkflow({
      name: newWorkflowData.name,
      description: newWorkflowData.description,
      category: newWorkflowData.category as unknown,
      priority: newWorkflowData.priority as unknown,
      status: "draft",
      steps: [],
    });
    setShowNewWorkflow(false);
    setNewWorkflowData({ name: "", description: "", category: "custom", priority: "medium" });
  };

  const handleUseTemplate = async (template: typeof workflowTemplates[0]) => {
    await createWorkflow({
      name: template.name,
      description: template.description,
      category: template.category as unknown,
      priority: "medium",
      status: "draft",
      steps: template.steps,
      estimated_duration: template.estimated_duration,
      tags: template.tags,
    });
    toast({ title: "Template aplicado", description: `Workflow "${template.name}" criado` });
  };

  const getNodeStatusColor = (status: string) => {
    switch (status) {
    case "completed": return "bg-green-500";
    case "running": return "bg-blue-500 animate-pulse";
    case "error": return "bg-red-500";
    default: return "bg-muted";
    }
  };

  const getNodeIcon = (type: string) => {
    switch (type) {
    case "trigger": return <Zap className="h-4 w-4" />;
    case "action": return <Play className="h-4 w-4" />;
    case "condition": return <GitBranch className="h-4 w-4" />;
    case "delay": return <Clock className="h-4 w-4" />;
    case "end": return <CheckCircle2 className="h-4 w-4" />;
    default: return <Workflow className="h-4 w-4" />;
    }
  };

  // Stats calculation
  const stats = {
    totalWorkflows: workflows.length + mockVisualWorkflows.length,
    activeWorkflows: workflows.filter(w => w.status === "active").length + mockVisualWorkflows.filter(w => w.status === "running").length,
    completedToday: workflows.filter(w => w.status === "completed").length,
    automationRulesActive: automationRules.filter(r => r.is_active).length,
    totalExecutions: mockVisualWorkflows.reduce((acc, w) => acc + w.executions, 0),
    efficiencyScore: 87
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Workflow Command Center | Nautilus One</title>
        <meta name="description" content="Centro unificado de gestão e automação de workflows com IA" />
      </Helmet>

      <div className="space-y-6 p-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Workflow className="h-8 w-8 text-primary" />
              Workflow Command Center
            </h1>
            <p className="text-muted-foreground mt-1">
              Gestão unificada de workflows, automações e sugestões de IA
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={refetch}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
            <Button variant="outline" onClick={exportWorkflows}>
              <BarChart3 className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button onClick={handleSetShowNewWorkflow}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Workflow
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalWorkflows}</p>
                  <p className="text-xs text-muted-foreground">Total Workflows</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Play className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-2xl font-bold text-green-500">{stats.activeWorkflows}</p>
                  <p className="text-xs text-muted-foreground">Em Execução</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.completedToday}</p>
                  <p className="text-xs text-muted-foreground">Concluídos Hoje</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.automationRulesActive}</p>
                  <p className="text-xs text-muted-foreground">Automações Ativas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalExecutions}</p>
                  <p className="text-xs text-muted-foreground">Execuções Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.efficiencyScore}%</p>
                  <p className="text-xs text-muted-foreground">Eficiência</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-muted/50 flex-wrap h-auto p-1">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="workflows" className="gap-2">
              <Workflow className="h-4 w-4" />
              Workflows
            </TabsTrigger>
            <TabsTrigger value="visual" className="gap-2">
              <GitBranch className="h-4 w-4" />
              Visual Builder
            </TabsTrigger>
            <TabsTrigger value="automation" className="gap-2">
              <Zap className="h-4 w-4" />
              Automações
            </TabsTrigger>
            <TabsTrigger value="suggestions" className="gap-2">
              <Lightbulb className="h-4 w-4" />
              Sugestões IA
            </TabsTrigger>
            <TabsTrigger value="templates" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              {/* Active Visual Workflows */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Network className="h-5 w-5 text-primary" />
                    Workflows Visuais Ativos
                  </CardTitle>
                  <CardDescription>Fluxos em execução com visualização de etapas</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockVisualWorkflows.filter(w => w.status === "running").map((workflow) => (
                    <div 
                      key={workflow.id} 
                      className="p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                      onClick={handleSetSelectedVisualWorkflow}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{workflow.name}</h4>
                        <Badge className="bg-blue-500/10 text-blue-500">Em execução</Badge>
                      </div>
                      <div className="flex items-center gap-2 overflow-x-auto pb-2">
                        {workflow.nodes.map((node, i) => (
                          <React.Fragment key={node.id}>
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${getNodeStatusColor(node.status)} text-white`}>
                              {getNodeIcon(node.type)}
                            </div>
                            {i < workflow.nodes.length - 1 && (
                              <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {workflow.executions} execuções • Última: {new Date(workflow.lastRun).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* AI Suggestions Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="h-5 w-5 text-yellow-500" />
                    Sugestões de IA Recentes
                  </CardTitle>
                  <CardDescription>Otimizações sugeridas pelo sistema</CardDescription>
                </CardHeader>
                <CardContent>
                  <WorkflowAISuggestions limit={3} className="border-0 shadow-none p-0" />
                </CardContent>
              </Card>
            </div>

            {/* Recent Workflows */}
            <Card>
              <CardHeader>
                <CardTitle>Workflows Recentes</CardTitle>
                <CardDescription>Últimos workflows criados ou modificados</CardDescription>
              </CardHeader>
              <CardContent>
                <WorkflowStats workflows={workflows} automationRules={automationRules} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Workflows Tab */}
          <TabsContent value="workflows" className="space-y-4">
            <WorkflowFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              statusFilter={statusFilter}
              onStatusChange={setStatusFilter}
              categoryFilter={categoryFilter}
              onCategoryChange={setCategoryFilter}
              priorityFilter={priorityFilter}
              onPriorityChange={setPriorityFilter}
              onClearFilters={handleClearFilters}
            />

            <div className="grid gap-4">
              {filteredWorkflows.length === 0 ? (
                <Card className="p-8 text-center">
                  <Workflow className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">Nenhum workflow encontrado</p>
                  <Button className="mt-4" onClick={handleSetShowNewWorkflow}>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Workflow
                  </Button>
                </Card>
              ) : (
                filteredWorkflows.map((workflow) => (
                  <WorkflowCard
                    key={workflow.id}
                    workflow={workflow}
                    onStart={startWorkflow}
                    onPause={pauseWorkflow}
                    onDetails={(w) => { setSelectedWorkflow(w); setShowDetails(true); }}
                    onEdit={(w) => { setSelectedWorkflow(w); setShowNewWorkflow(true); }}
                    onDuplicate={(w) => createWorkflow({ ...w, name: `${w.name} (Cópia)`, status: "draft" })}
                    onDelete={deleteWorkflow}
                  />
                ))
              )}
            </div>
          </TabsContent>

          {/* Visual Builder Tab */}
          <TabsContent value="visual" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GitBranch className="h-5 w-5 text-primary" />
                  Workflows Visuais
                </CardTitle>
                <CardDescription>Construa e visualize fluxos de trabalho com arrastar e soltar</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {mockVisualWorkflows.map((workflow) => (
                    <Card 
                      key={workflow.id} 
                      className="hover:shadow-md transition-shadow cursor-pointer"
                      onClick={handleSetSelectedVisualWorkflow}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{workflow.name}</CardTitle>
                          <Badge variant={workflow.status === "running" ? "default" : "secondary"}>
                            {workflow.status === "running" ? "Ativo" : "Concluído"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-1 mb-3 overflow-x-auto pb-2">
                          {workflow.nodes.slice(0, 5).map((node, i) => (
                            <React.Fragment key={node.id}>
                              <div className={`flex items-center justify-center w-6 h-6 rounded-full ${getNodeStatusColor(node.status)} text-white`}>
                                {getNodeIcon(node.type)}
                              </div>
                              {i < Math.min(workflow.nodes.length - 1, 4) && (
                                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                              )}
                            </React.Fragment>
                          ))}
                          {workflow.nodes.length > 5 && (
                            <Badge variant="outline" className="ml-1">+{workflow.nodes.length - 5}</Badge>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>{workflow.nodes.length} etapas</span>
                          <span>{workflow.executions} execuções</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {/* New Visual Workflow Card */}
                  <Card className="border-dashed hover:border-primary transition-colors cursor-pointer flex items-center justify-center min-h-[180px]">
                    <div className="text-center p-4">
                      <Plus className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="font-medium">Novo Workflow Visual</p>
                      <p className="text-sm text-muted-foreground">Crie com arrastar e soltar</p>
                    </div>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Automation Tab */}
          <TabsContent value="automation" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Regras de Automação</CardTitle>
                    <CardDescription>Configure regras para automatizar processos</CardDescription>
                  </div>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Regra
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {automationRules.length === 0 ? (
                  <div className="text-center py-8">
                    <Zap className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">Nenhuma regra de automação configurada</p>
                    <Button className="mt-4" variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Primeira Regra
                    </Button>
                  </div>
                ) : (
                  automationRules.map((rule) => (
                    <div key={rule.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium">{rule.rule_name}</h4>
                          <Badge variant="outline">{rule.trigger_type}</Badge>
                          <Badge className={rule.is_active ? "bg-green-500/10 text-green-600" : "bg-muted text-muted-foreground"}>
                            {rule.is_active ? "Ativa" : "Inativa"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{rule.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Execuções: {rule.execution_count} | Última: {rule.last_executed_at ? new Date(rule.last_executed_at).toLocaleString() : "Nunca"}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant={rule.is_active ? "destructive" : "default"} onClick={() => handletoggleAutomationRule}>
                          {rule.is_active ? "Desativar" : "Ativar"}
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Suggestions Tab */}
          <TabsContent value="suggestions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  Como Funcionam as Sugestões de IA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  O sistema analisa automaticamente os logs, prazos e falhas dos workflows 
                  para gerar sugestões acionáveis. As sugestões podem incluir:
                </p>
                <ul className="mt-3 space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    Criação de novas tarefas para resolver problemas identificados
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-yellow-500" />
                    Ajustes de prazo baseados em análise de histórico
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    Reatribuição de responsáveis para maior eficiência
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    Escalação de problemas críticos
                  </li>
                </ul>
              </CardContent>
            </Card>

            <WorkflowAISuggestions limit={50} />
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Templates de Workflow</CardTitle>
                <CardDescription>Modelos pré-configurados para processos comuns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {workflowTemplates.map((template) => (
                    <Card key={template.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">{template.name}</CardTitle>
                        <CardDescription>{template.category}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">{template.steps.length} etapas</span>
                          <Button size="sm" onClick={() => handlehandleUseTemplate}>
                            <Sparkles className="h-3 w-3 mr-1" />
                            Usar Template
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Eficiência dos Workflows</CardTitle>
                  <CardDescription>Tempo médio por categoria</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { category: "RH", time: "2.3 dias", eff: 87 },
                    { category: "Financeiro", time: "4h", eff: 94 },
                    { category: "Operações", time: "1.8 dias", eff: 76 },
                    { category: "Manutenção", time: "3.2 dias", eff: 82 },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{item.category}</p>
                        <p className="text-sm text-muted-foreground">{item.time}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{item.eff}%</p>
                        <Progress value={item.eff} className="w-20 h-2" />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Automações por Categoria</CardTitle>
                  <CardDescription>Últimos 30 dias</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { cat: "RH", exec: 156, trend: "+12%" },
                    { cat: "Financeiro", exec: 289, trend: "+8%" },
                    { cat: "Operações", exec: 97, trend: "-3%" },
                    { cat: "Manutenção", exec: 234, trend: "+15%" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <p className="font-medium">{item.cat}</p>
                      <div className="text-right">
                        <p className="font-bold">{item.exec}</p>
                        <p className={`text-sm ${item.trend.startsWith("+") ? "text-green-600" : "text-red-600"}`}>
                          {item.trend}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Métricas de Performance</CardTitle>
                  <CardDescription>Indicadores chave dos workflows</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <p className="text-3xl font-bold text-primary">98.5%</p>
                      <p className="text-sm text-muted-foreground">Taxa de Sucesso</p>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <p className="text-3xl font-bold text-green-500">1.2h</p>
                      <p className="text-sm text-muted-foreground">Tempo Médio</p>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <p className="text-3xl font-bold text-blue-500">847</p>
                      <p className="text-sm text-muted-foreground">Execuções/Mês</p>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <p className="text-3xl font-bold text-yellow-500">23h</p>
                      <p className="text-sm text-muted-foreground">Economia/Semana</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* New Workflow Dialog */}
        <Dialog open={showNewWorkflow} onOpenChange={setShowNewWorkflow}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Workflow</DialogTitle>
              <DialogDescription>Crie um novo fluxo de trabalho</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Input 
                placeholder="Nome do workflow" 
                value={newWorkflowData.name} 
                onChange={handleChange}))} 
              />
              <Textarea 
                placeholder="Descrição" 
                value={newWorkflowData.description} 
                onChange={handleChange}))} 
              />
              <div className="grid grid-cols-2 gap-4">
                <Select value={newWorkflowData.category} onValueChange={(v) => setNewWorkflowData(p => ({ ...p, category: v }))}>
                  <SelectTrigger><SelectValue placeholder="Categoria" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hr">RH</SelectItem>
                    <SelectItem value="finance">Financeiro</SelectItem>
                    <SelectItem value="operations">Operações</SelectItem>
                    <SelectItem value="maintenance">Manutenção</SelectItem>
                    <SelectItem value="custom">Personalizado</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={newWorkflowData.priority} onValueChange={(v) => setNewWorkflowData(p => ({ ...p, priority: v }))}>
                  <SelectTrigger><SelectValue placeholder="Prioridade" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="urgent">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleSetShowNewWorkflow}>Cancelar</Button>
              <Button onClick={handleNewWorkflow}>Criar Workflow</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Details Dialog */}
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedWorkflow?.name}</DialogTitle>
              <DialogDescription>{selectedWorkflow?.description}</DialogDescription>
            </DialogHeader>
            {selectedWorkflow && (
              <div className="space-y-4 py-4">
                <div className="flex gap-2">
                  <Badge>{selectedWorkflow.category}</Badge>
                  <Badge variant="outline">{selectedWorkflow.status}</Badge>
                  <Badge variant="outline">{selectedWorkflow.priority}</Badge>
                </div>
                <Progress value={selectedWorkflow.progress} className="h-3" />
                <p className="text-sm text-muted-foreground">Progresso: {selectedWorkflow.progress}%</p>
                <div className="border rounded-lg p-4 max-h-60 overflow-auto space-y-2">
                  {selectedWorkflow.steps?.map((step: unknown, i: number) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                      <span>{step.name}</span>
                      <Badge variant="outline">{step.status}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={handleSetShowDetails}>Fechar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Visual Workflow Details Dialog */}
        <Dialog open={!!selectedVisualWorkflow} onOpenChange={() => setSelectedVisualWorkflow(null}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <GitBranch className="h-5 w-5" />
                {selectedVisualWorkflow?.name}
              </DialogTitle>
              <DialogDescription>Visualização detalhada do fluxo de trabalho</DialogDescription>
            </DialogHeader>
            {selectedVisualWorkflow && (
              <div className="space-y-4 py-4">
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant={selectedVisualWorkflow.status === "running" ? "default" : "secondary"}>
                    {selectedVisualWorkflow.status === "running" ? "Em Execução" : "Concluído"}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {selectedVisualWorkflow.executions} execuções
                  </span>
                </div>

                <div className="border rounded-lg p-6 bg-muted/30">
                  <div className="flex flex-wrap items-center gap-4 justify-center">
                    {selectedVisualWorkflow.nodes.map((node, i) => (
                      <React.Fragment key={node.id}>
                        <div className="flex flex-col items-center gap-2">
                          <div className={`flex items-center justify-center w-12 h-12 rounded-full ${getNodeStatusColor(node.status)} text-white`}>
                            {getNodeIcon(node.type)}
                          </div>
                          <span className="text-xs text-center max-w-[100px]">{node.label}</span>
                          <Badge variant="outline" className="text-xs">
                            {node.status === "completed" ? "Concluído" : 
                              node.status === "running" ? "Executando" : "Pendente"}
                          </Badge>
                        </div>
                        {i < selectedVisualWorkflow.nodes.length - 1 && (
                          <ArrowRight className="h-6 w-6 text-muted-foreground" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold">{selectedVisualWorkflow.nodes.length}</p>
                    <p className="text-xs text-muted-foreground">Etapas</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold">
                      {selectedVisualWorkflow.nodes.filter(n => n.status === "completed").length}
                    </p>
                    <p className="text-xs text-muted-foreground">Concluídas</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold">
                      {Math.round((selectedVisualWorkflow.nodes.filter(n => n.status === "completed").length / selectedVisualWorkflow.nodes.length) * 100)}%
                    </p>
                    <p className="text-xs text-muted-foreground">Progresso</p>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={handleSetSelectedVisualWorkflow}>Fechar</Button>
              <Button>
                <Play className="h-4 w-4 mr-2" />
                Executar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
