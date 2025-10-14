"use client";

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Workflow, Calendar, User, CheckSquare, Plus, Pencil, Trash2, GripVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { MultiTenantWrapper } from "@/components/layout/multi-tenant-wrapper";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";

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

interface WorkflowStep {
  id: string
  workflow_id: string
  title: string
  description?: string
  status: "pendente" | "em_progresso" | "concluido"
  assigned_to?: string
  due_date?: string
  position: number
  created_at: string
  updated_at: string
}

interface Profile {
  id: string
  full_name?: string
  email?: string
}

export default function WorkflowDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [workflow, setWorkflow] = useState<SmartWorkflow | null>(null);
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [draggedStep, setDraggedStep] = useState<WorkflowStep | null>(null);
  const { toast } = useToast();

  // Dialog states for task management
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<WorkflowStep | null>(null);
  const [newStepData, setNewStepData] = useState({
    title: "",
    description: "",
    status: "pendente" as const,
    assigned_to: "",
    due_date: ""
  });

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

  async function fetchSteps() {
    if (!id) return;
    
    try {
      const { data, error } = await supabase
        .from("smart_workflow_steps")
        .select("*")
        .eq("workflow_id", id)
        .order("position", { ascending: true });
      
      if (error) throw error;
      setSteps(data || []);
    } catch (error) {
      console.error("Error fetching steps:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as tarefas",
        variant: "destructive"
      });
    }
  }

  async function fetchProfiles() {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .order("full_name", { ascending: true });
      
      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error("Error fetching profiles:", error);
    }
  }

  async function createStep() {
    if (!id || !newStepData.title.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira um título para a tarefa",
        variant: "destructive"
      });
      return;
    }

    try {
      const maxPosition = Math.max(...steps.filter(s => s.status === newStepData.status).map(s => s.position), -1);
      
      const { error } = await supabase
        .from("smart_workflow_steps")
        .insert({
          workflow_id: id,
          title: newStepData.title,
          description: newStepData.description || null,
          status: newStepData.status,
          assigned_to: newStepData.assigned_to || null,
          due_date: newStepData.due_date || null,
          position: maxPosition + 1
        });
      
      if (error) throw error;
      
      setNewStepData({
        title: "",
        description: "",
        status: "pendente",
        assigned_to: "",
        due_date: ""
      });
      setIsCreateDialogOpen(false);
      toast({
        title: "Sucesso",
        description: "Tarefa criada com sucesso!"
      });
      fetchSteps();
    } catch (error) {
      console.error("Error creating step:", error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a tarefa",
        variant: "destructive"
      });
    }
  }

  async function updateStep(stepId: string, updates: Partial<WorkflowStep>) {
    try {
      const { error } = await supabase
        .from("smart_workflow_steps")
        .update(updates)
        .eq("id", stepId);
      
      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Tarefa atualizada com sucesso!"
      });
      fetchSteps();
    } catch (error) {
      console.error("Error updating step:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a tarefa",
        variant: "destructive"
      });
    }
  }

  async function deleteStep(stepId: string) {
    if (!confirm("Tem certeza que deseja excluir esta tarefa?")) return;

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
    }
  }

  function handleDragStart(step: WorkflowStep) {
    setDraggedStep(step);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  async function handleDrop(newStatus: WorkflowStep["status"]) {
    if (!draggedStep) return;

    if (draggedStep.status !== newStatus) {
      await updateStep(draggedStep.id, { status: newStatus });
    }
    setDraggedStep(null);
  }

  function getAssignedUserName(userId?: string): string {
    if (!userId) return "Não atribuído";
    const profile = profiles.find(p => p.id === userId);
    return profile?.full_name || profile?.email || "Usuário";
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

  const stepsByStatus = {
    pendente: steps.filter(s => s.status === "pendente"),
    em_progresso: steps.filter(s => s.status === "em_progresso"),
    concluido: steps.filter(s => s.status === "concluido")
  };

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

            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Tarefa
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Nova Tarefa</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Título *</label>
                    <Input
                      value={newStepData.title}
                      onChange={(e) => setNewStepData({ ...newStepData, title: e.target.value })}
                      placeholder="Ex: Revisar documentação"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Descrição</label>
                    <Textarea
                      value={newStepData.description}
                      onChange={(e) => setNewStepData({ ...newStepData, description: e.target.value })}
                      placeholder="Detalhes da tarefa..."
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <Select
                      value={newStepData.status}
                      onValueChange={(value: "pendente" | "em_progresso" | "concluido") => setNewStepData({ ...newStepData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pendente">Pendente</SelectItem>
                        <SelectItem value="em_progresso">Em Progresso</SelectItem>
                        <SelectItem value="concluido">Concluído</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Atribuir a</label>
                    <Select
                      value={newStepData.assigned_to}
                      onValueChange={(value) => setNewStepData({ ...newStepData, assigned_to: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um usuário" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Ninguém</SelectItem>
                        {profiles.map((profile) => (
                          <SelectItem key={profile.id} value={profile.id}>
                            {profile.full_name || profile.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Data de Vencimento</label>
                    <Input
                      type="date"
                      value={newStepData.due_date}
                      onChange={(e) => setNewStepData({ ...newStepData, due_date: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={createStep}>
                    Criar Tarefa
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Kanban Board */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Pendente Column */}
            <div
              className="space-y-3"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop("pendente")}
            >
              <div className="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
                <h3 className="font-semibold flex items-center gap-2">
                  <CheckSquare className="w-4 h-4" />
                  Pendente
                </h3>
                <span className="text-sm text-muted-foreground">
                  {stepsByStatus.pendente.length}
                </span>
              </div>
              <div className="space-y-2 min-h-[200px]">
                {stepsByStatus.pendente.map((step) => (
                  <Card
                    key={step.id}
                    className="p-3 cursor-move hover:shadow-md transition"
                    draggable
                    onDragStart={() => handleDragStart(step)}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-2 flex-1">
                          <GripVertical className="w-4 h-4 text-muted-foreground mt-0.5" />
                          <h4 className="font-medium text-sm">{step.title}</h4>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingStep(step);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Pencil className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteStep(step.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      {step.description && (
                        <p className="text-xs text-muted-foreground">{step.description}</p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {step.assigned_to && (
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span>{getAssignedUserName(step.assigned_to)}</span>
                          </div>
                        )}
                        {step.due_date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(step.due_date).toLocaleDateString("pt-BR")}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Em Progresso Column */}
            <div
              className="space-y-3"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop("em_progresso")}
            >
              <div className="flex items-center justify-between p-3 bg-blue-100 rounded-lg">
                <h3 className="font-semibold flex items-center gap-2">
                  <CheckSquare className="w-4 h-4" />
                  Em Progresso
                </h3>
                <span className="text-sm text-muted-foreground">
                  {stepsByStatus.em_progresso.length}
                </span>
              </div>
              <div className="space-y-2 min-h-[200px]">
                {stepsByStatus.em_progresso.map((step) => (
                  <Card
                    key={step.id}
                    className="p-3 cursor-move hover:shadow-md transition"
                    draggable
                    onDragStart={() => handleDragStart(step)}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-2 flex-1">
                          <GripVertical className="w-4 h-4 text-muted-foreground mt-0.5" />
                          <h4 className="font-medium text-sm">{step.title}</h4>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingStep(step);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Pencil className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteStep(step.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      {step.description && (
                        <p className="text-xs text-muted-foreground">{step.description}</p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {step.assigned_to && (
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span>{getAssignedUserName(step.assigned_to)}</span>
                          </div>
                        )}
                        {step.due_date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(step.due_date).toLocaleDateString("pt-BR")}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Concluído Column */}
            <div
              className="space-y-3"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop("concluido")}
            >
              <div className="flex items-center justify-between p-3 bg-green-100 rounded-lg">
                <h3 className="font-semibold flex items-center gap-2">
                  <CheckSquare className="w-4 h-4" />
                  Concluído
                </h3>
                <span className="text-sm text-muted-foreground">
                  {stepsByStatus.concluido.length}
                </span>
              </div>
              <div className="space-y-2 min-h-[200px]">
                {stepsByStatus.concluido.map((step) => (
                  <Card
                    key={step.id}
                    className="p-3 cursor-move hover:shadow-md transition"
                    draggable
                    onDragStart={() => handleDragStart(step)}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-2 flex-1">
                          <GripVertical className="w-4 h-4 text-muted-foreground mt-0.5" />
                          <h4 className="font-medium text-sm">{step.title}</h4>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingStep(step);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Pencil className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteStep(step.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      {step.description && (
                        <p className="text-xs text-muted-foreground">{step.description}</p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {step.assigned_to && (
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span>{getAssignedUserName(step.assigned_to)}</span>
                          </div>
                        )}
                        {step.due_date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(step.due_date).toLocaleDateString("pt-BR")}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Edit Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editar Tarefa</DialogTitle>
              </DialogHeader>
              {editingStep && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Título *</label>
                    <Input
                      value={editingStep.title}
                      onChange={(e) => setEditingStep({ ...editingStep, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Descrição</label>
                    <Textarea
                      value={editingStep.description || ""}
                      onChange={(e) => setEditingStep({ ...editingStep, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <Select
                      value={editingStep.status}
                      onValueChange={(value: "pendente" | "em_progresso" | "concluido") => setEditingStep({ ...editingStep, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pendente">Pendente</SelectItem>
                        <SelectItem value="em_progresso">Em Progresso</SelectItem>
                        <SelectItem value="concluido">Concluído</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Atribuir a</label>
                    <Select
                      value={editingStep.assigned_to || ""}
                      onValueChange={(value) => setEditingStep({ ...editingStep, assigned_to: value || undefined })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um usuário" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Ninguém</SelectItem>
                        {profiles.map((profile) => (
                          <SelectItem key={profile.id} value={profile.id}>
                            {profile.full_name || profile.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Data de Vencimento</label>
                    <Input
                      type="date"
                      value={editingStep.due_date ? editingStep.due_date.split("T")[0] : ""}
                      onChange={(e) => setEditingStep({ ...editingStep, due_date: e.target.value })}
                    />
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => {
                  if (editingStep) {
                    updateStep(editingStep.id, {
                      title: editingStep.title,
                      description: editingStep.description,
                      status: editingStep.status,
                      assigned_to: editingStep.assigned_to,
                      due_date: editingStep.due_date
                    });
                    setIsEditDialogOpen(false);
                  }
                }}>
                  Salvar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

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
