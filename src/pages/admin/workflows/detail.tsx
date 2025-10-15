"use client";

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Workflow, Calendar, User, CheckSquare, Plus, AlertCircle, Edit2, Trash2, GripVertical, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { MultiTenantWrapper } from "@/components/layout/multi-tenant-wrapper";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { exportSuggestionsToPDF, WorkflowSuggestion } from "@/components/workflows";

interface SmartWorkflow {
  id: string
  title: string
  description?: string
  status: string
  created_at: string
  updated_at: string
  created_by?: string
  category?: string
  tags?: string[]
}

interface Profile {
  id: string
  full_name: string
}

interface WorkflowStep {
  id: string
  workflow_id: string
  title: string
  description?: string
  status: "pendente" | "em_progresso" | "concluido"
  position: number
  assigned_to?: string
  due_date?: string
  priority?: string
  created_at: string
  updated_at: string
  created_by?: string
  tags?: string[]
  metadata?: Record<string, unknown>
  profiles?: {
    full_name: string
  }
}

interface TaskFormData {
  title: string
  description: string
  status: WorkflowStep["status"]
  assigned_to: string
  due_date: string
  priority: string
}

const STATUS_COLUMNS: Array<{ value: WorkflowStep["status"]; label: string; color: string }> = [
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
    due_date: "",
    priority: "medium"
  });
  const { toast } = useToast();

  async function fetchWorkflow() {
    if (!id) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("smart_workflows")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error) throw error;
      setWorkflow(data);
    } catch (error) {
      console.error("Error fetching workflow:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o fluxo de trabalho",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchProfiles() {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name")
        .order("full_name", { ascending: true });
      
      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error("Error fetching profiles:", error);
    }
  }

  async function fetchSteps() {
    if (!id) return;
    
    try {
      const { data, error } = await supabase
        .from("smart_workflow_steps")
        .select("*, profiles:assigned_to (full_name)")
        .eq("workflow_id", id)
        .order("position", { ascending: true });
      
      if (error) throw error;
      setSteps(data || []);
    } catch (error) {
      console.error("Error fetching steps:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as etapas",
        variant: "destructive"
      });
    }
  }

  async function addStep() {
    if (!newTitle.trim() || !id) return;
    
    try {
      setIsCreating(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("smart_workflow_steps")
        .insert({
          workflow_id: id,
          title: newTitle,
          status: "pendente",
          position: steps.length,
          assigned_to: user?.id,
          created_by: user?.id
        });
      
      if (error) throw error;
      
      setNewTitle("");
      toast({
        title: "Sucesso",
        description: "Tarefa adicionada com sucesso!"
      });
      fetchSteps();
    } catch (error) {
      console.error("Error adding step:", error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a tarefa",
        variant: "destructive"
      });
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
        // Update existing step
        const { error } = await supabase
          .from("smart_workflow_steps")
          .update({
            title: taskForm.title,
            description: taskForm.description,
            status: taskForm.status,
            assigned_to: taskForm.assigned_to || user?.id,
            due_date: taskForm.due_date || null,
            priority: taskForm.priority
          })
          .eq("id", editingStep.id);
        
        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Tarefa atualizada com sucesso!"
        });
      } else {
        // Create new step
        const { error } = await supabase
          .from("smart_workflow_steps")
          .insert({
            workflow_id: id,
            title: taskForm.title,
            description: taskForm.description,
            status: taskForm.status,
            position: steps.length,
            assigned_to: taskForm.assigned_to || user?.id,
            due_date: taskForm.due_date || null,
            priority: taskForm.priority,
            created_by: user?.id
          });
        
        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Tarefa criada com sucesso!"
        });
      }
      
      setIsDialogOpen(false);
      setEditingStep(null);
      resetTaskForm();
      fetchSteps();
    } catch (error) {
      console.error("Error saving step:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a tarefa",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  }

  async function deleteStep(stepId: string) {
    try {
      const { error } = await supabase
        .from("smart_workflow_steps")
        .delete()
        .eq("id", stepId);
      
      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Tarefa excluída com sucesso!"
      });
      fetchSteps();
    } catch (error) {
      console.error("Error deleting step:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a tarefa",
        variant: "destructive"
      });
    } finally {
      setDeleteStepId(null);
    }
  }

  function resetTaskForm() {
    setTaskForm({
      title: "",
      description: "",
      status: "pendente",
      assigned_to: "",
      due_date: "",
      priority: "medium"
    });
  }

  function openCreateDialog() {
    resetTaskForm();
    setEditingStep(null);
    setIsDialogOpen(true);
  }

  function openEditDialog(step: WorkflowStep) {
    setTaskForm({
      title: step.title,
      description: step.description || "",
      status: step.status,
      assigned_to: step.assigned_to || "",
      due_date: step.due_date || "",
      priority: step.priority || "medium"
    });
    setEditingStep(step);
    setIsDialogOpen(true);
  }

  async function updateStepStatus(stepId: string, newStatus: WorkflowStep["status"]) {
    try {
      const { error } = await supabase
        .from("smart_workflow_steps")
        .update({ status: newStatus })
        .eq("id", stepId);
      
      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Status atualizado com sucesso!"
      });
      fetchSteps();
    } catch (error) {
      console.error("Error updating step status:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status",
        variant: "destructive"
      });
    }
  }

  function handleDragStart(e: React.DragEvent, step: WorkflowStep) {
    setDraggedStep(step);
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }

  async function handleDrop(e: React.DragEvent, targetStatus: WorkflowStep["status"]) {
    e.preventDefault();
    
    if (!draggedStep || draggedStep.status === targetStatus) {
      setDraggedStep(null);
      return;
    }

    try {
      const { error } = await supabase
        .from("smart_workflow_steps")
        .update({ status: targetStatus })
        .eq("id", draggedStep.id);
      
      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: `Tarefa movida para ${targetStatus.replace('_', ' ')}!`
      });
      fetchSteps();
    } catch (error) {
      console.error("Error updating step status:", error);
      toast({
        title: "Erro",
        description: "Não foi possível mover a tarefa",
        variant: "destructive"
      });
    } finally {
      setDraggedStep(null);
    }
  }

  async function updateStepTitle(stepId: string, newTitle: string) {
    if (!newTitle.trim()) return;
    
    try {
      const { error } = await supabase
        .from("smart_workflow_steps")
        .update({ title: newTitle })
        .eq("id", stepId);
      
      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Título atualizado com sucesso!"
      });
    } catch (error) {
      console.error("Error updating step title:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o título",
        variant: "destructive"
      });
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addStep();
    }
  };

  // Export workflow suggestions to PDF (demo function with sample data)
  function handleExportSuggestionsPDF() {
    try {
      // Sample suggestions for demonstration
      // In production, this would fetch real data from workflow_ai_suggestions table
      const sampleSuggestions: WorkflowSuggestion[] = [
        {
          etapa: "Aprovação de Despesas",
          tipo_sugestao: "Otimização de Processo",
          conteudo: "Implementar aprovação automática para despesas abaixo de R$ 500,00 quando dentro do orçamento aprovado",
          criticidade: "Média",
          responsavel_sugerido: "Gerente Financeiro"
        },
        {
          etapa: "Onboarding de Tripulantes",
          tipo_sugestao: "Melhoria de Eficiência",
          conteudo: "Criar checklist digital interativo para reduzir tempo de onboarding de 5 dias para 3 dias",
          criticidade: "Alta",
          responsavel_sugerido: "RH - Coordenador de Treinamento"
        },
        {
          etapa: "Renovação de Certificados",
          tipo_sugestao: "Automação",
          conteudo: "Configurar alertas automáticos 60 dias antes do vencimento de certificados marítimos",
          criticidade: "Crítica",
          responsavel_sugerido: "Departamento de Certificação"
        }
      ];

      exportSuggestionsToPDF(sampleSuggestions);
      
      toast({
        title: "PDF exportado com sucesso",
        description: "O plano de ações foi exportado como PDF.",
      });
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast({
        title: "Erro ao exportar PDF",
        description: error instanceof Error ? error.message : "Não foi possível exportar o documento.",
        variant: "destructive"
      });
    }
  }

  useEffect(() => {
    fetchWorkflow();
    fetchSteps();
    fetchProfiles();
  }, [id]);

  if (isLoading) {
    return (
      <MultiTenantWrapper>
        <ModulePageWrapper gradient="blue">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </ModulePageWrapper>
      </MultiTenantWrapper>
    );
  }

  if (!workflow) {
    return (
      <MultiTenantWrapper>
        <ModulePageWrapper gradient="blue">
          <div className="p-6">
            <Card className="p-12 text-center">
              <Workflow className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Fluxo de trabalho não encontrado
              </h3>
              <Button asChild className="mt-4">
                <Link to="/admin/workflows">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar para workflows
                </Link>
              </Button>
            </Card>
          </div>
        </ModulePageWrapper>
      </MultiTenantWrapper>
    );
  }

  return (
    <MultiTenantWrapper>
      <ModulePageWrapper gradient="blue">
        <ModuleHeader
          icon={Workflow}
          title={workflow.title}
          description="Gerencie as etapas e tarefas deste fluxo de trabalho"
          gradient="blue"
          badges={[
            { icon: Workflow, label: workflow.status === "active" ? "Ativo" : "Rascunho" },
            { icon: Calendar, label: new Date(workflow.created_at).toLocaleDateString("pt-BR") }
          ]}
        />

        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <Button variant="outline" asChild>
              <Link to="/admin/workflows">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Link>
            </Button>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleExportSuggestionsPDF}
                title="Exportar sugestões de IA para PDF"
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar Sugestões PDF
              </Button>
              
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={openCreateDialog}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Tarefa
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingStep ? "Editar Tarefa" : "Nova Tarefa"}
                  </DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Título *</Label>
                    <Input
                      id="title"
                      value={taskForm.title}
                      onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                      placeholder="Digite o título da tarefa"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={taskForm.description}
                      onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                      placeholder="Adicione detalhes sobre a tarefa"
                      rows={3}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="status">Status</Label>
                      <Select 
                        value={taskForm.status} 
                        onValueChange={(value: WorkflowStep["status"]) => setTaskForm({ ...taskForm, status: value })}
                      >
                        <SelectTrigger id="status">
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pendente">Pendente</SelectItem>
                          <SelectItem value="em_progresso">Em Progresso</SelectItem>
                          <SelectItem value="concluido">Concluído</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="priority">Prioridade</Label>
                      <Select 
                        value={taskForm.priority} 
                        onValueChange={(value) => setTaskForm({ ...taskForm, priority: value })}
                      >
                        <SelectTrigger id="priority">
                          <SelectValue placeholder="Selecione a prioridade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Baixa</SelectItem>
                          <SelectItem value="medium">Média</SelectItem>
                          <SelectItem value="high">Alta</SelectItem>
                          <SelectItem value="urgent">Urgente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="assigned_to">Atribuído a</Label>
                      <Select 
                        value={taskForm.assigned_to} 
                        onValueChange={(value) => setTaskForm({ ...taskForm, assigned_to: value })}
                      >
                        <SelectTrigger id="assigned_to">
                          <SelectValue placeholder="Selecione um usuário" />
                        </SelectTrigger>
                        <SelectContent>
                          {profiles.map((profile) => (
                            <SelectItem key={profile.id} value={profile.id}>
                              {profile.full_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="due_date">Data de Vencimento</Label>
                      <Input
                        id="due_date"
                        type="date"
                        value={taskForm.due_date}
                        onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={saveTask} disabled={isCreating || !taskForm.title.trim()}>
                    {isCreating ? "Salvando..." : editingStep ? "Atualizar" : "Criar"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            </div>
          </div>

          {/* Quick Add Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5" />
                🧱 Etapas do Workflow
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 items-end mb-6">
                <div className="flex-1">
                  <Input
                    placeholder="Adicionar tarefa rápida (pressione Enter)"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isCreating}
                  />
                </div>
                <Button 
                  onClick={addStep}
                  disabled={isCreating || !newTitle.trim()}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  {isCreating ? "Adicionando..." : "Adicionar"}
                </Button>
              </div>

              {/* Kanban Board with Drag & Drop */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                {STATUS_COLUMNS.map((statusColumn) => (
                  <Card 
                    key={statusColumn.value} 
                    className={`p-4 ${statusColumn.color}`}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, statusColumn.value)}
                  >
                    <h3 className="text-md font-semibold capitalize mb-3 flex items-center gap-2">
                      {statusColumn.value === "pendente" && "🟡"}
                      {statusColumn.value === "em_progresso" && "🔵"}
                      {statusColumn.value === "concluido" && "🟢"}
                      {statusColumn.label}
                      <Badge variant="secondary" className="ml-auto">
                        {steps.filter(s => s.status === statusColumn.value).length}
                      </Badge>
                    </h3>

                    <div className="space-y-2">
                      {steps
                        .filter(s => s.status === statusColumn.value)
                        .map((step) => (
                          <Card 
                            key={step.id} 
                            className="p-3 bg-white hover:shadow-md transition cursor-move"
                            draggable
                            onDragStart={(e) => handleDragStart(e, step)}
                          >
                            <div className="flex items-start gap-2 mb-2">
                              <GripVertical className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm mb-1 break-words">{step.title}</h4>
                                
                                {step.description && (
                                  <p className="text-xs text-muted-foreground mb-2 break-words">
                                    {step.description}
                                  </p>
                                )}
                                
                                {/* Metadata badges */}
                                <div className="flex flex-wrap gap-1 mb-2">
                                  {step.profiles?.full_name && (
                                    <Badge variant="outline" className="text-xs flex items-center gap-1">
                                      <User className="w-3 h-3" />
                                      {step.profiles.full_name}
                                    </Badge>
                                  )}
                                  
                                  {step.due_date && (
                                    <Badge variant="outline" className="text-xs flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      {new Date(step.due_date).toLocaleDateString("pt-BR")}
                                    </Badge>
                                  )}
                                  
                                  {step.priority && step.priority !== "medium" && (
                                    <Badge 
                                      variant={
                                        step.priority === "high" || step.priority === "urgent" 
                                          ? "destructive" 
                                          : "secondary"
                                      }
                                      className="text-xs flex items-center gap-1"
                                    >
                                      <AlertCircle className="w-3 h-3" />
                                      {step.priority}
                                    </Badge>
                                  )}
                                </div>
                                
                                {/* Action buttons */}
                                <div className="flex gap-1 flex-wrap">
                                  {statusColumn.value === "pendente" && (
                                    <Button
                                      size="sm"
                                      variant="default"
                                      onClick={() => updateStepStatus(step.id, "em_progresso")}
                                      className="text-xs h-7"
                                    >
                                      Iniciar
                                    </Button>
                                  )}
                                  
                                  {statusColumn.value === "em_progresso" && (
                                    <>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => updateStepStatus(step.id, "pendente")}
                                        className="text-xs h-7"
                                      >
                                        Voltar
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="default"
                                        onClick={() => updateStepStatus(step.id, "concluido")}
                                        className="text-xs h-7"
                                      >
                                        Concluir
                                      </Button>
                                    </>
                                  )}
                                  
                                  {statusColumn.value === "concluido" && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => updateStepStatus(step.id, "em_progresso")}
                                      className="text-xs h-7"
                                    >
                                      Reabrir
                                    </Button>
                                  )}
                                  
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => openEditDialog(step)}
                                    className="text-xs h-7 ml-auto"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </Button>
                                  
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setDeleteStepId(step.id)}
                                    className="text-xs h-7 text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))}
                      
                      {steps.filter(s => s.status === statusColumn.value).length === 0 && (
                        <div className="text-center py-8 text-sm text-muted-foreground">
                          Nenhuma tarefa
                          <div className="text-xs mt-1">
                            Arraste tarefas aqui ou crie uma nova
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Delete Confirmation Dialog */}
          <AlertDialog open={!!deleteStepId} onOpenChange={() => setDeleteStepId(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => deleteStepId && deleteStep(deleteStepId)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {workflow.description && (
            <Card>
              <CardHeader>
                <CardTitle>Descrição</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{workflow.description}</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Informações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground">Status</span>
                <span className={`text-sm px-2 py-1 rounded ${
                  workflow.status === "active" 
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}>
                  {workflow.status === "active" ? "Ativo" : "Rascunho"}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground">Data de Criação</span>
                <span className="text-sm">
                  {new Date(workflow.created_at).toLocaleString("pt-BR")}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">Última Atualização</span>
                <span className="text-sm">
                  {new Date(workflow.updated_at).toLocaleString("pt-BR")}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </ModulePageWrapper>
    </MultiTenantWrapper>
  );
}
