import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Workflow, Plus, CheckCircle, Activity, Target, Clock } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useOptimizedPolling } from "@/hooks/use-optimized-polling";
import { WorkflowItem, WorkflowExecution } from "./workflow/types";
import { INITIAL_WORKFLOWS, INITIAL_EXECUTIONS, WORKFLOW_TEMPLATES } from "./workflow/data";
import { SmartWorkflowCard } from "./workflow/SmartWorkflowCard";
import { ExecutionsTab } from "./workflow/ExecutionsTab";
import { TemplatesTab } from "./workflow/TemplatesTab";

const SmartWorkflowAutomation = () => {
  const [workflows, setWorkflows] = useState<WorkflowItem[]>(INITIAL_WORKFLOWS);
  const [executions, setExecutions] = useState<WorkflowExecution[]>(INITIAL_EXECUTIONS);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newWorkflow, setNewWorkflow] = useState({ name: "", description: "", category: "", trigger: "" });

  useOptimizedPolling({
    id: "workflow-execution-updates",
    callback: () => {
      setExecutions(prev => prev.map(exec => {
        if (exec.status === "running") {
          const runningTime = (Date.now() - exec.startedAt.getTime()) / 1000;
          if (runningTime > 30) {
            return { ...exec, status: "completed", completedAt: new Date(), duration: Math.floor(runningTime) };
          }
        }
        return exec;
      }));
    },
    interval: 10000,
  });

  const toggleWorkflowStatus = (id: string) => {
    setWorkflows(prev => prev.map(w => w.id === id ? { ...w, status: w.status === "active" ? "inactive" : "active" } : w));
    toast({ title: "Status atualizado", description: "Workflow foi ativado/desativado com sucesso" });
  };

  const executeWorkflow = (id: string) => {
    const newExecution: WorkflowExecution = {
      id: Date.now().toString(), workflowId: id, status: "running", startedAt: new Date(),
      steps: [{ stepId: "1", status: "running" }, { stepId: "2", status: "pending" }, { stepId: "3", status: "pending" }]
    };
    setExecutions(prev => [newExecution, ...prev]);
    toast({ title: "Workflow iniciado", description: "Execução em andamento..." });
  };

  const createWorkflow = () => {
    if (!newWorkflow.name.trim()) return;
    const workflow: WorkflowItem = {
      id: Date.now().toString(), name: newWorkflow.name, description: newWorkflow.description,
      status: "draft", trigger: newWorkflow.trigger, steps: [], executions: 0, successRate: 0,
      createdAt: new Date(), category: newWorkflow.category, tags: []
    };
    setWorkflows(prev => [workflow, ...prev]);
    setShowCreateDialog(false);
    setNewWorkflow({ name: "", description: "", category: "", trigger: "" });
    toast({ title: "Workflow criado", description: "Novo workflow adicionado como rascunho" });
  };

  const duplicateWorkflow = (workflow: WorkflowItem) => {
    const duplicated: WorkflowItem = { ...workflow, id: Date.now().toString(), name: `${workflow.name} (Cópia)`, status: "draft", executions: 0, createdAt: new Date(), lastRun: undefined };
    setWorkflows(prev => [duplicated, ...prev]);
    toast({ title: "Workflow duplicado", description: "Cópia criada como rascunho" });
  };

  const activeWorkflows = workflows.filter(w => w.status === "active").length;
  const totalExecutions = workflows.reduce((sum, w) => sum + w.executions, 0);
  const avgSuccessRate = workflows.reduce((sum, w) => sum + w.successRate, 0) / workflows.length;
  const runningExecutions = executions.filter(e => e.status === "running").length;

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Automação de Workflows</h1>
          <p className="text-muted-foreground">Automatize processos e otimize operações empresariais</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" /> Novo Workflow</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Workflow</DialogTitle>
              <DialogDescription>Configure um novo processo automatizado</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div><label className="text-sm font-medium">Nome do Workflow</label><Input value={newWorkflow.name} onChange={(e) => setNewWorkflow(prev => ({ ...prev, name: e.target.value }))} placeholder="Ex: Aprovação de Documentos" /></div>
              <div><label className="text-sm font-medium">Descrição</label><Textarea value={newWorkflow.description} onChange={(e) => setNewWorkflow(prev => ({ ...prev, description: e.target.value }))} placeholder="Descreva o objetivo deste workflow..." /></div>
              <div><label className="text-sm font-medium">Categoria</label>
                <Select value={newWorkflow.category} onValueChange={(value) => setNewWorkflow(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger><SelectValue placeholder="Selecione uma categoria" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="documentos">Documentos</SelectItem><SelectItem value="rh">Recursos Humanos</SelectItem>
                    <SelectItem value="financeiro">Financeiro</SelectItem><SelectItem value="monitoramento">Monitoramento</SelectItem>
                    <SelectItem value="vendas">Vendas</SelectItem><SelectItem value="ti">TI</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><label className="text-sm font-medium">Trigger</label><Input value={newWorkflow.trigger} onChange={(e) => setNewWorkflow(prev => ({ ...prev, trigger: e.target.value }))} placeholder="Ex: Documento Enviado" /></div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancelar</Button>
                <Button onClick={createWorkflow}>Criar Workflow</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardContent className="p-4"><div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-success" /><span className="text-sm font-medium">Workflows Ativos</span></div><div className="text-2xl font-bold">{activeWorkflows}</div><p className="text-xs text-muted-foreground">de {workflows.length} total</p></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-2"><Activity className="w-4 h-4 text-info" /><span className="text-sm font-medium">Execuções</span></div><div className="text-2xl font-bold">{totalExecutions.toLocaleString()}</div><p className="text-xs text-muted-foreground">{runningExecutions} em execução</p></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-2"><Target className="w-4 h-4 text-accent-foreground" /><span className="text-sm font-medium">Taxa de Sucesso</span></div><div className="text-2xl font-bold">{avgSuccessRate.toFixed(1)}%</div><p className="text-xs text-muted-foreground">Média geral</p></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-2"><Clock className="w-4 h-4 text-warning" /><span className="text-sm font-medium">Tempo Economizado</span></div><div className="text-2xl font-bold">847h</div><p className="text-xs text-muted-foreground">Este mês</p></CardContent></Card>
      </div>

      <Tabs defaultValue="workflows" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="executions">Execuções</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>
        <TabsContent value="workflows" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {workflows.map((workflow) => (
              <SmartWorkflowCard key={workflow.id} workflow={workflow} onExecute={executeWorkflow} onToggleStatus={toggleWorkflowStatus} onDuplicate={duplicateWorkflow} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="executions" className="space-y-4">
          <ExecutionsTab executions={executions} workflows={workflows} />
        </TabsContent>
        <TabsContent value="templates" className="space-y-4">
          <TemplatesTab templates={WORKFLOW_TEMPLATES} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SmartWorkflowAutomation;
