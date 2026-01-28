/**
 * Workflow Detail Page - PATCH 881
 * Type-safe using actual smart_workflow_steps schema
 */
"use client";

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Workflow, Calendar, User, Plus, AlertCircle, Edit2, Trash2, GripVertical, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { MultiTenantWrapper } from "@/components/layout/multi-tenant-wrapper";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { exportSuggestionsToPDF, Suggestion } from "@/components/workflows";

// Interfaces aligned with actual DB schema
interface SmartWorkflow {
  id: string;
  name?: string | null;
  title?: string | null;
  description?: string | null;
  status?: string | null;
  created_at?: string | null;
}

interface Profile {
  id: string;
  full_name?: string | null;
}

interface WorkflowStep {
  id: string;
  title?: string | null;
  description?: string | null;
  status?: string | null;
  position?: number | null;
  assigned_to?: string | null;
  priority?: string | null;
  created_at?: string | null;
  step_number?: number | null;
  assignee_name?: string | null;
}

interface TaskFormData {
  title: string;
  description: string;
  status: string;
  assigned_to: string;
  priority: string;
}

const STATUS_COLUMNS: Array<{ value: string; label: string; color: string }> = [
  { value: "pendente", label: "Pendente", color: "bg-yellow-50 border-yellow-200" },
  { value: "em_progresso", label: "Em Progresso", color: "bg-blue-50 border-blue-200" },
  { value: "concluido", label: "Concluído", color: "bg-green-50 border-green-200" },
];

export default function WorkflowDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [workflow, setWorkflow] = useState<SmartWorkflow | null>(null);
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [draggedStep, setDraggedStep] = useState<WorkflowStep | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<WorkflowStep | null>(null);
  const [deleteStepId, setDeleteStepId] = useState<string | null>(null);
  const [taskForm, setTaskForm] = useState<TaskFormData>({
    title: "",
    description: "",
    status: "pendente",
    assigned_to: "",
    priority: "medium"
  });
  const { toast } = useToast();

  const demoSuggestions: Suggestion[] = [
    { etapa: "Planejamento", tipo_sugestao: "Análise de Riscos", conteudo: "Realizar análise de riscos detalhada", criticidade: "Alta", responsavel_sugerido: "Project Manager" },
    { etapa: "Execução", tipo_sugestao: "Automação de Testes", conteudo: "Implementar testes automatizados", criticidade: "Média", responsavel_sugerido: "QA Lead" },
  ];

  const handleExportPDF = () => {
    try {
      exportSuggestionsToPDF(demoSuggestions);
      toast({ title: "Sucesso", description: "PDF exportado com sucesso!" });
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast({ title: "Erro", description: "Não foi possível exportar o PDF", variant: "destructive" });
    }
  };

  async function fetchWorkflow() {
    if (!id) return;
    try {
      setIsLoading(true);
      const { data, error } = await supabase.from("smart_workflows").select("*").eq("id", id).single();
      if (error) throw error;
      setWorkflow(data);
    } catch (error) {
      console.error("Error fetching workflow:", error);
      toast({ title: "Erro", description: "Não foi possível carregar o fluxo de trabalho", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchProfiles() {
    try {
      const { data, error } = await supabase.from("profiles").select("id, full_name").order("full_name", { ascending: true });
      if (error) throw error;
      setProfiles((data || []) as Profile[]);
    } catch (error) {
      console.error("Error fetching profiles:", error);
    }
  }

  async function fetchSteps() {
    if (!id) return;
    try {
      const { data, error } = await supabase
        .from("smart_workflow_steps")
        .select("id, title, description, status, position, assigned_to, priority, created_at, step_number")
        .eq("workflow_id", id)
        .order("position", { ascending: true });
      
      if (error) throw error;
      
      // Fetch assignee names separately
      const stepsWithNames: WorkflowStep[] = (data || []).map(step => ({
        ...step,
        assignee_name: null
      }));

      // Get profile names for assigned users
      const assignedIds = stepsWithNames.filter(s => s.assigned_to).map(s => s.assigned_to);
      if (assignedIds.length > 0) {
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", assignedIds as string[]);
        
        if (profilesData) {
          const profileMap = new Map(profilesData.map(p => [p.id, p.full_name]));
          stepsWithNames.forEach(step => {
            if (step.assigned_to) {
              step.assignee_name = profileMap.get(step.assigned_to) || null;
            }
          });
        }
      }

      setSteps(stepsWithNames);
    } catch (error) {
      console.error("Error fetching steps:", error);
      toast({ title: "Erro", description: "Não foi possível carregar as etapas", variant: "destructive" });
    }
  }

  async function addStep() {
    if (!newTitle.trim() || !id) return;
    try {
      setIsCreating(true);
      const { data: { user } } = await supabase.auth.getUser();
      const insertData = {
        workflow_id: id,
        title: newTitle,
        status: "pendente",
        position: steps.length,
        assigned_to: user?.id,
        created_by: user?.id
      } as Record<string, unknown>;

      const { error } = await supabase.from("smart_workflow_steps").insert(insertData as never);
      if (error) throw error;
      setNewTitle("");
      toast({ title: "Sucesso", description: "Tarefa adicionada com sucesso!" });
      fetchSteps();
    } catch (error) {
      console.error("Error adding step:", error);
      toast({ title: "Erro", description: "Não foi possível adicionar a tarefa", variant: "destructive" });
    } finally {
      setIsCreating(false);
    }
  }

  async function saveTask() {
    if (!taskForm.title.trim() || !id) return;
    try {
      setIsCreating(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (editingStep) {
        const updateData = {
          title: taskForm.title,
          description: taskForm.description,
          status: taskForm.status,
          assigned_to: taskForm.assigned_to || user?.id,
          priority: taskForm.priority
        } as Record<string, unknown>;

        const { error } = await supabase.from("smart_workflow_steps").update(updateData as never).eq("id", editingStep.id);
        if (error) throw error;
        toast({ title: "Sucesso", description: "Tarefa atualizada com sucesso!" });
      } else {
        const insertData = {
          workflow_id: id,
          title: taskForm.title,
          description: taskForm.description,
          status: taskForm.status,
          position: steps.length,
          assigned_to: taskForm.assigned_to || user?.id,
          priority: taskForm.priority,
          created_by: user?.id
        } as Record<string, unknown>;

        const { error } = await supabase.from("smart_workflow_steps").insert(insertData as never);
        if (error) throw error;
        toast({ title: "Sucesso", description: "Tarefa criada com sucesso!" });
      }
      
      setIsDialogOpen(false);
      setEditingStep(null);
      resetTaskForm();
      fetchSteps();
    } catch (error) {
      console.error("Error saving step:", error);
      toast({ title: "Erro", description: "Não foi possível salvar a tarefa", variant: "destructive" });
    } finally {
      setIsCreating(false);
    }
  }

  async function deleteStep(stepId: string) {
    try {
      const { error } = await supabase.from("smart_workflow_steps").delete().eq("id", stepId);
      if (error) throw error;
      toast({ title: "Sucesso", description: "Tarefa excluída com sucesso!" });
      fetchSteps();
    } catch (error) {
      console.error("Error deleting step:", error);
      toast({ title: "Erro", description: "Não foi possível excluir a tarefa", variant: "destructive" });
    } finally {
      setDeleteStepId(null);
    }
  }

  function resetTaskForm() {
    setTaskForm({ title: "", description: "", status: "pendente", assigned_to: "", priority: "medium" });
  }

  function openCreateDialog() {
    resetTaskForm();
    setEditingStep(null);
    setIsDialogOpen(true);
  }

  function openEditDialog(step: WorkflowStep) {
    setTaskForm({
      title: step.title || "",
      description: step.description || "",
      status: step.status || "pendente",
      assigned_to: step.assigned_to || "",
      priority: step.priority || "medium"
    });
    setEditingStep(step);
    setIsDialogOpen(true);
  }

  async function handleDrop(e: React.DragEvent, targetStatus: string) {
    e.preventDefault();
    if (!draggedStep || draggedStep.status === targetStatus) {
      setDraggedStep(null);
      return;
    }
    try {
      const { error } = await supabase.from("smart_workflow_steps").update({ status: targetStatus }).eq("id", draggedStep.id);
      if (error) throw error;
      toast({ title: "Sucesso", description: `Tarefa movida para ${targetStatus.replace("_", " ")}!` });
      fetchSteps();
    } catch (error) {
      console.error("Error updating step status:", error);
      toast({ title: "Erro", description: "Não foi possível mover a tarefa", variant: "destructive" });
    } finally {
      setDraggedStep(null);
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") addStep();
  };

  useEffect(() => {
    fetchWorkflow();
    fetchSteps();
    fetchProfiles();
  }, [id]);

  const getStepsByStatus = (status: string) => steps.filter(step => step.status === status);

  const getPriorityBadge = (priority?: string | null) => {
    switch (priority) {
    case "high": return <Badge variant="destructive" className="text-xs">Alta</Badge>;
    case "medium": return <Badge variant="secondary" className="text-xs">Média</Badge>;
    case "low": return <Badge variant="outline" className="text-xs">Baixa</Badge>;
    default: return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="p-6">
        <Card className="p-8 text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">Workflow não encontrado</p>
          <Link to="/admin/workflows">
            <Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" />Voltar</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <MultiTenantWrapper>
      <ModulePageWrapper>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/admin/workflows">
                <Button variant="outline" size="sm"><ArrowLeft className="mr-2 h-4 w-4" />Voltar</Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Workflow className="h-6 w-6" />
                  {workflow.name || workflow.title || "Workflow"}
                </h1>
                <p className="text-sm text-muted-foreground">{workflow.description || "Sem descrição"}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExportPDF}>
                <Download className="mr-2 h-4 w-4" />Exportar Sugestões
              </Button>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={openCreateDialog}><Plus className="mr-2 h-4 w-4" />Nova Tarefa</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingStep ? "Editar Tarefa" : "Nova Tarefa"}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label htmlFor="title">Título</Label>
                      <Input id="title" value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} placeholder="Digite o título da tarefa" />
                    </div>
                    <div>
                      <Label htmlFor="description">Descrição</Label>
                      <Textarea id="description" value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} placeholder="Descrição detalhada" rows={3} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="status">Status</Label>
                        <Select value={taskForm.status} onValueChange={(value) => setTaskForm({ ...taskForm, status: value })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {STATUS_COLUMNS.map((col) => (<SelectItem key={col.value} value={col.value}>{col.label}</SelectItem>))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="priority">Prioridade</Label>
                        <Select value={taskForm.priority} onValueChange={(value) => setTaskForm({ ...taskForm, priority: value })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="high">Alta</SelectItem>
                            <SelectItem value="medium">Média</SelectItem>
                            <SelectItem value="low">Baixa</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="assigned_to">Responsável</Label>
                      <Select value={taskForm.assigned_to} onValueChange={(value) => setTaskForm({ ...taskForm, assigned_to: value })}>
                        <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                        <SelectContent>
                          {profiles.map((profile) => (<SelectItem key={profile.id} value={profile.id}>{profile.full_name || "Sem nome"}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                    <Button onClick={saveTask} disabled={isCreating}>{isCreating ? "Salvando..." : "Salvar"}</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-2">
                <Input placeholder="Adicionar tarefa rapidamente..." value={newTitle} onChange={(e) => setNewTitle(e.target.value)} onKeyPress={handleKeyPress} />
                <Button onClick={addStep} disabled={isCreating || !newTitle.trim()}><Plus className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-3 gap-4">
            {STATUS_COLUMNS.map((column) => (
              <Card key={column.value} className={`${column.color} border-2`} onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, column.value)}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center justify-between">
                    {column.label}
                    <Badge variant="secondary">{getStepsByStatus(column.value).length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 min-h-[200px]">
                  {getStepsByStatus(column.value).map((step) => (
                    <Card key={step.id} className="cursor-grab bg-background shadow-sm hover:shadow-md transition-shadow" draggable onDragStart={() => setDraggedStep(step)}>
                      <CardContent className="p-3">
                        <div className="flex items-start gap-2">
                          <GripVertical className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="font-medium text-sm truncate">{step.title || "Sem título"}</span>
                              <div className="flex gap-1 flex-shrink-0">
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openEditDialog(step)}><Edit2 className="h-3 w-3" /></Button>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => setDeleteStepId(step.id)}><Trash2 className="h-3 w-3" /></Button>
                              </div>
                            </div>
                            {step.description && (<p className="text-xs text-muted-foreground line-clamp-2 mb-2">{step.description}</p>)}
                            <div className="flex items-center gap-2 flex-wrap">
                              {getPriorityBadge(step.priority)}
                              {step.assignee_name && (<Badge variant="outline" className="text-xs"><User className="h-3 w-3 mr-1" />{step.assignee_name}</Badge>)}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {getStepsByStatus(column.value).length === 0 && (<p className="text-sm text-muted-foreground text-center py-8">Arraste tarefas para cá</p>)}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <AlertDialog open={!!deleteStepId} onOpenChange={() => setDeleteStepId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription>Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={() => deleteStepId && deleteStep(deleteStepId)}>Excluir</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </ModulePageWrapper>
    </MultiTenantWrapper>
  );
}
