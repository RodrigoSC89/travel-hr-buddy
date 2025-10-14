"use client";

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Workflow, Calendar, User, CheckSquare, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { MultiTenantWrapper } from "@/components/layout/multi-tenant-wrapper";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { format } from "date-fns";

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
  due_date?: string
  assigned_to?: string
  assigned_to_name?: string
  position: number
  priority?: string
  created_at: string
  updated_at: string
}

interface WorkflowStepWithProfile {
  id: string
  workflow_id: string
  title: string
  description?: string
  status: "pendente" | "em_progresso" | "concluido"
  due_date?: string
  assigned_to?: string
  position: number
  priority?: string
  created_at: string
  updated_at: string
  profiles?: {
    full_name?: string
  } | null
}

export default function WorkflowDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [workflow, setWorkflow] = useState<SmartWorkflow | null>(null);
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newStepTitle, setNewStepTitle] = useState("");
  const [isCreatingStep, setIsCreatingStep] = useState(false);
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

  async function fetchSteps() {
    if (!id) return;
    
    try {
      // Fetch steps with profile information for assigned users
      const { data, error } = await supabase
        .from("smart_workflow_steps")
        .select(`
          *,
          profiles:assigned_to (
            full_name
          )
        `)
        .eq("workflow_id", id)
        .order("position", { ascending: true });
      
      if (error) throw error;
      
      // Map the data to include assigned_to_name
      const stepsWithNames = (data || []).map((step: WorkflowStepWithProfile) => ({
        ...step,
        assigned_to_name: step.profiles?.full_name || null
      }));
      
      setSteps(stepsWithNames);
    } catch (error) {
      console.error("Error fetching steps:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as etapas",
        variant: "destructive"
      });
    }
  }

  async function createStep() {
    if (!newStepTitle.trim() || !id) return;
    
    try {
      setIsCreatingStep(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("smart_workflow_steps")
        .insert({
          title: newStepTitle,
          workflow_id: id,
          assigned_to: user?.id,
          position: steps.length,
          status: "pendente"
        });
      
      if (error) throw error;
      
      setNewStepTitle("");
      toast({
        title: "Sucesso",
        description: "Etapa criada com sucesso!"
      });
      fetchSteps();
    } catch (error) {
      console.error("Error creating step:", error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a etapa",
        variant: "destructive"
      });
    } finally {
      setIsCreatingStep(false);
    }
  }

  async function updateStepTitle(stepId: string, newTitle: string) {
    try {
      const { error } = await supabase
        .from("smart_workflow_steps")
        .update({ title: newTitle })
        .eq("id", stepId);
      
      if (error) throw error;
    } catch (error) {
      console.error("Error updating step:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a etapa",
        variant: "destructive"
      });
    }
  }

  async function updateStepStatus(stepId: string, newStatus: "pendente" | "em_progresso" | "concluido") {
    try {
      const { error } = await supabase
        .from("smart_workflow_steps")
        .update({ status: newStatus })
        .eq("id", stepId);
      
      if (error) throw error;
      
      // Update local state
      setSteps(prev => 
        prev.map(step => 
          step.id === stepId ? { ...step, status: newStatus } : step
        )
      );
      
      toast({
        title: "Sucesso",
        description: "Status atualizado com sucesso!"
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status",
        variant: "destructive"
      });
    }
  }

  useEffect(() => {
    fetchWorkflow();
    fetchSteps();
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
          </div>

          {/* Create new step */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Nova Etapa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="Título da nova etapa..."
                  value={newStepTitle}
                  onChange={e => setNewStepTitle(e.target.value)}
                  onKeyPress={e => e.key === "Enter" && createStep()}
                  disabled={isCreatingStep}
                />
                <Button 
                  onClick={createStep}
                  disabled={isCreatingStep || !newStepTitle.trim()}
                >
                  {isCreatingStep ? "Criando..." : "Criar"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Kanban Board */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5" />
                Quadro Kanban
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Pendente Column */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <h3 className="font-semibold">Pendente</h3>
                    <Badge variant="secondary" className="ml-auto">
                      {steps.filter(s => s.status === "pendente").length}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    {steps
                      .filter(s => s.status === "pendente")
                      .map(step => (
                        <Card key={step.id} className="p-3">
                          <Input
                            className="font-medium w-full border-b border-transparent focus:border-gray-300 bg-transparent mb-2 px-0"
                            value={step.title}
                            onChange={e => {
                              setSteps(prev =>
                                prev.map(item =>
                                  item.id === step.id ? { ...item, title: e.target.value } : item
                                )
                              );
                            }}
                            onBlur={() => updateStepTitle(step.id, step.title)}
                          />
                          
                          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                            <Badge 
                              className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                            >
                              {step.status.replace("_", " ")}
                            </Badge>
                            {step.due_date && (
                              <span className="flex items-center gap-1">
                                🗓️ {format(new Date(step.due_date), "dd/MM/yyyy")}
                              </span>
                            )}
                          </div>
                          
                          <p className="text-xs text-muted-foreground mt-2">
                            Responsável: {step.assigned_to_name || "Não atribuído"}
                          </p>
                          
                          <div className="flex gap-1 mt-3">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 text-xs"
                              onClick={() => updateStepStatus(step.id, "em_progresso")}
                            >
                              Iniciar
                            </Button>
                          </div>
                        </Card>
                      ))}
                  </div>
                </div>

                {/* Em Progresso Column */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <h3 className="font-semibold">Em Progresso</h3>
                    <Badge variant="secondary" className="ml-auto">
                      {steps.filter(s => s.status === "em_progresso").length}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    {steps
                      .filter(s => s.status === "em_progresso")
                      .map(step => (
                        <Card key={step.id} className="p-3">
                          <Input
                            className="font-medium w-full border-b border-transparent focus:border-gray-300 bg-transparent mb-2 px-0"
                            value={step.title}
                            onChange={e => {
                              setSteps(prev =>
                                prev.map(item =>
                                  item.id === step.id ? { ...item, title: e.target.value } : item
                                )
                              );
                            }}
                            onBlur={() => updateStepTitle(step.id, step.title)}
                          />
                          
                          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                            <Badge 
                              className="bg-blue-100 text-blue-800 hover:bg-blue-200"
                            >
                              {step.status.replace("_", " ")}
                            </Badge>
                            {step.due_date && (
                              <span className="flex items-center gap-1">
                                🗓️ {format(new Date(step.due_date), "dd/MM/yyyy")}
                              </span>
                            )}
                          </div>
                          
                          <p className="text-xs text-muted-foreground mt-2">
                            Responsável: {step.assigned_to_name || "Não atribuído"}
                          </p>
                          
                          <div className="flex gap-1 mt-3">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 text-xs"
                              onClick={() => updateStepStatus(step.id, "pendente")}
                            >
                              Voltar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 text-xs"
                              onClick={() => updateStepStatus(step.id, "concluido")}
                            >
                              Concluir
                            </Button>
                          </div>
                        </Card>
                      ))}
                  </div>
                </div>

                {/* Concluído Column */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <h3 className="font-semibold">Concluído</h3>
                    <Badge variant="secondary" className="ml-auto">
                      {steps.filter(s => s.status === "concluido").length}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    {steps
                      .filter(s => s.status === "concluido")
                      .map(step => (
                        <Card key={step.id} className="p-3 opacity-75">
                          <Input
                            className="font-medium w-full border-b border-transparent focus:border-gray-300 bg-transparent mb-2 px-0"
                            value={step.title}
                            onChange={e => {
                              setSteps(prev =>
                                prev.map(item =>
                                  item.id === step.id ? { ...item, title: e.target.value } : item
                                )
                              );
                            }}
                            onBlur={() => updateStepTitle(step.id, step.title)}
                          />
                          
                          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                            <Badge 
                              className="bg-green-100 text-green-800 hover:bg-green-200"
                            >
                              {step.status.replace("_", " ")}
                            </Badge>
                            {step.due_date && (
                              <span className="flex items-center gap-1">
                                🗓️ {format(new Date(step.due_date), "dd/MM/yyyy")}
                              </span>
                            )}
                          </div>
                          
                          <p className="text-xs text-muted-foreground mt-2">
                            Responsável: {step.assigned_to_name || "Não atribuído"}
                          </p>
                          
                          <div className="flex gap-1 mt-3">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 text-xs"
                              onClick={() => updateStepStatus(step.id, "em_progresso")}
                            >
                              Reabrir
                            </Button>
                          </div>
                        </Card>
                      ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

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
