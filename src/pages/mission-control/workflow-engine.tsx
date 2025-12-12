import { useEffect, useState, useCallback } from "react";;
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Workflow, Play, Pause, RotateCcw, CheckCircle, 
  AlertCircle, Clock, Loader2, Plus, Trash2 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface WorkflowStep {
  name: string;
  type: "ai_analysis" | "database_query" | "notification";
  description: string;
  requires_approval: boolean;
  prompt?: string;
  table?: string;
  select?: string;
}

interface WorkflowDefinition {
  id?: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  created_by?: string;
}

const WorkflowEngine = () => {
  const { toast } = useToast();
  const [workflows, setWorkflows] = useState<WorkflowDefinition[]>([]);
  const [activeExecution, setActiveExecution] = useState<unknown>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newWorkflow, setNewWorkflow] = useState<WorkflowDefinition>({
    name: "",
    description: "",
    steps: [],
  });

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    const { data, error } = await supabase
      .from("nautilus_workflows" as unknown)
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
    } else {
      setWorkflows((data || []) as unknown);
    }
  };

  const createWorkflow = async () => {
    if (!newWorkflow.name || newWorkflow.steps.length === 0) {
      toast({
        title: "Erro",
        description: "Workflow precisa de nome e pelo menos um passo",
        variant: "destructive",
      };
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase.from("nautilus_workflows" as unknown).insert({
      name: newWorkflow.name,
      description: newWorkflow.description,
      steps: newWorkflow.steps,
      created_by: user?.id,
    };

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível criar workflow",
        variant: "destructive",
      };
    } else {
      toast({
        title: "Workflow criado",
        description: "Workflow salvo com sucesso",
      };
      setIsCreating(false);
      setNewWorkflow({ name: "", description: "", steps: [] });
      loadWorkflows();
    }
  };

  const executeWorkflow = async (workflowId: string) => {
    const { data, error } = await supabase.functions.invoke("workflow-execute" as unknown, {
      body: {
        workflow_id: workflowId,
        action: "execute",
      },
    };

    if (error) {
      toast({
        title: "Erro",
        description: "Falha ao executar workflow",
        variant: "destructive",
      };
    } else {
      setActiveExecution(data);
      toast({
        title: "Workflow iniciado",
        description: "Execução em andamento",
      };
    }
  };

  const addStep = () => {
    setNewWorkflow({
      ...newWorkflow,
      steps: [
        ...newWorkflow.steps,
        {
          name: "",
          type: "ai_analysis",
          description: "",
          requires_approval: false,
        },
      ],
    };
  };

  const removeStep = (index: number) => {
    setNewWorkflow({
      ...newWorkflow,
      steps: newWorkflow.steps.filter((_, i) => i !== index),
    };
  };

  const updateStep = (index: number, field: string, value: unknown: unknown: unknown) => {
    const updatedSteps = [...newWorkflow.steps];
    updatedSteps[index] = { ...updatedSteps[index], [field]: value };
    setNewWorkflow({ ...newWorkflow, steps: updatedSteps });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Workflow className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">AI Workflow Engine</h1>
            <p className="text-sm text-muted-foreground">
              Execute workflows multi-step com aprovação e rollback
            </p>
          </div>
        </div>
        <Button onClick={handleSetIsCreating}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Workflow
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Workflows Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workflows.length}</div>
            <p className="text-xs text-muted-foreground">Total criados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Execuções Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Workflows executados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Taxa de Sucesso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">100%</div>
            <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
          </CardContent>
        </Card>
      </div>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Criar Novo Workflow</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nome do Workflow</Label>
              <Input
                value={newWorkflow.name}
                onChange={handleChange}
                placeholder="Ex: Análise Diária de Saúde"
              />
            </div>

            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                value={newWorkflow.description}
                onChange={handleChange}
                placeholder="Descreva o objetivo deste workflow"
                rows={2}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Passos do Workflow</Label>
                <Button size="sm" variant="outline" onClick={addStep}>
                  <Plus className="h-3 w-3 mr-1" />
                  Adicionar Passo
                </Button>
              </div>

              <ScrollArea className="h-[300px]">
                <div className="space-y-3">
                  {newWorkflow.steps.map((step, index) => (
                    <Card key={index}>
                      <CardContent className="pt-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <Badge>Passo {index + 1}</Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleremoveStep}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>

                        <Input
                          value={step.name}
                          onChange={handleChange}
                          placeholder="Nome do passo"
                        />

                        <Select
                          value={step.type}
                          onValueChange={(value) => updateStep(index, "type", value}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ai_analysis">Análise IA</SelectItem>
                            <SelectItem value="database_query">Consulta DB</SelectItem>
                            <SelectItem value="notification">Notificação</SelectItem>
                          </SelectContent>
                        </Select>

                        <Textarea
                          value={step.description}
                          onChange={handleChange}
                          placeholder="Descrição ou prompt"
                          rows={2}
                        />

                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={step.requires_approval}
                            onChange={handleChange}
                            className="rounded"
                          />
                          <Label className="text-sm">Requer aprovação manual</Label>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <div className="flex gap-2">
              <Button onClick={createWorkflow}>Criar Workflow</Button>
              <Button variant="outline" onClick={handleSetIsCreating}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Workflows Disponíveis</CardTitle>
        </CardHeader>
        <CardContent>
          {workflows.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum workflow criado ainda
            </div>
          ) : (
            <div className="space-y-3">
              {workflows.map((workflow) => (
                <Card key={workflow.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold">{workflow.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {workflow.description}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline">{workflow.steps.length} passos</Badge>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleexecuteWorkflow}
                        disabled={!!activeExecution}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Executar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
});

export default WorkflowEngine;
