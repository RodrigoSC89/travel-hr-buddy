import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import type { Json } from "@/integrations/supabase/types";

export interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  status: "pending" | "in_progress" | "completed" | "failed" | "skipped";
  assignee?: string;
  dueDate?: string;
  duration?: number;
  order: number;
  dependencies?: string[];
  metadata?: Record<string, any>;
}

export interface Workflow {
  id: string;
  name: string;
  description: string | null;
  category: "hr" | "finance" | "operations" | "marketing" | "maintenance" | "compliance" | "custom";
  status: "draft" | "active" | "paused" | "completed" | "archived";
  progress: number;
  steps: WorkflowStep[];
  created_at: string;
  updated_at: string;
  created_by: string;
  organization_id?: string;
  estimated_duration?: number;
  actual_duration?: number;
  priority: "low" | "medium" | "high" | "urgent";
  tags?: string[];
  ai_suggestions?: any[];
}

export interface AutomationRule {
  id: string;
  rule_name: string;
  description: string | null;
  trigger_type: string;
  trigger_config: Json;
  actions: Json;
  conditions: Json | null;
  is_active: boolean;
  execution_count: number;
  last_executed_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  organization_id: string | null;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  steps: WorkflowStep[];
  estimated_duration: number;
  tags: string[];
}

export const useWorkflows = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch workflows from database
  const fetchWorkflows = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // First try to get from nautilus_workflows
      const { data: dbWorkflows, error: workflowError } = await supabase
        .from("nautilus_workflows")
        .select("*")
        .order("created_at", { ascending: false });

      if (workflowError) {
        console.error("Error fetching workflows:", workflowError);
      }

      // Map database workflows to our interface
      const mappedWorkflows: Workflow[] = (dbWorkflows || []).map((w: any) => ({
        id: w.id,
        name: w.name,
        description: w.description,
        category: w.steps?.category || "custom",
        status: w.steps?.status || "draft",
        progress: calculateProgress(w.steps?.steps || []),
        steps: w.steps?.steps || [],
        created_at: w.created_at,
        updated_at: w.updated_at,
        created_by: w.created_by,
        priority: w.steps?.priority || "medium",
        estimated_duration: w.steps?.estimated_duration,
        tags: w.steps?.tags || [],
      }));

      // If no workflows, add sample data
      if (mappedWorkflows.length === 0) {
        setWorkflows(getSampleWorkflows());
      } else {
        setWorkflows(mappedWorkflows);
      }
    } catch (err) {
      console.error("Error:", err);
      setWorkflows(getSampleWorkflows());
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Fetch automation rules
  const fetchAutomationRules = useCallback(async () => {
    try {
      const { data, error: ruleError } = await supabase
        .from("automation_rules")
        .select("*")
        .order("created_at", { ascending: false });

      if (ruleError) {
        console.error("Error fetching rules:", ruleError);
        setAutomationRules(getSampleRules());
        return;
      }

      if (data && data.length > 0) {
        setAutomationRules(data);
      } else {
        setAutomationRules(getSampleRules());
      }
    } catch (err) {
      console.error("Error:", err);
      setAutomationRules(getSampleRules());
    }
  }, [user]);

  useEffect(() => {
    const loadData = async () => {
      await fetchWorkflows();
      await fetchAutomationRules();
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Create a new workflow
  const createWorkflow = useCallback(async (workflow: Partial<Workflow>) => {
    if (!user) {
      toast({ title: "Erro", description: "Usuário não autenticado", variant: "destructive" });
      return null;
    }

    try {
      const stepsData = {
        category: workflow.category || "custom",
        status: workflow.status || "draft",
        priority: workflow.priority || "medium",
        steps: (workflow.steps || []).map(s => ({ ...s })),
        estimated_duration: workflow.estimated_duration || 0,
        tags: workflow.tags || [],
      } as Json;

      const newWorkflow = {
        name: workflow.name || "Novo Workflow",
        description: workflow.description || "",
        created_by: user.id,
        steps: stepsData,
      };

      const { data, error } = await supabase
        .from("nautilus_workflows")
        .insert([newWorkflow])
        .select()
        .single();

      if (error) throw error;

      toast({ title: "Sucesso", description: "Workflow criado com sucesso!" });
      await fetchWorkflows();
      return data;
    } catch (err: any) {
      console.error("Error creating workflow:", err);
      toast({ title: "Erro", description: "Falha ao criar workflow", variant: "destructive" });
      return null;
    }
  }, [user, toast, fetchWorkflows]);

  // Update workflow
  const updateWorkflow = useCallback(async (id: string, updates: Partial<Workflow>) => {
    try {
      const currentWorkflow = workflows.find(w => w.id === id);
      if (!currentWorkflow) return;

      const stepsUpdate = {
        category: updates.category || currentWorkflow.category,
        status: updates.status || currentWorkflow.status,
        priority: updates.priority || currentWorkflow.priority,
        steps: (updates.steps || currentWorkflow.steps).map(s => ({ ...s })),
        estimated_duration: updates.estimated_duration || currentWorkflow.estimated_duration,
        tags: updates.tags || currentWorkflow.tags,
      } as Json;

      const { error } = await supabase
        .from("nautilus_workflows")
        .update({
          name: updates.name || currentWorkflow.name,
          description: updates.description || currentWorkflow.description,
          steps: stepsUpdate,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      toast({ title: "Sucesso", description: "Workflow atualizado!" });
      await fetchWorkflows();
    } catch (err) {
      console.error("Error updating workflow:", err);
      // Update locally if database fails
      setWorkflows(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w));
      toast({ title: "Atualizado localmente", description: "Workflow atualizado" });
    }
  }, [workflows, toast, fetchWorkflows]);

  // Delete workflow
  const deleteWorkflow = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from("nautilus_workflows")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setWorkflows(prev => prev.filter(w => w.id !== id));
      toast({ title: "Sucesso", description: "Workflow excluído!" });
    } catch (err) {
      console.error("Error deleting workflow:", err);
      toast({ title: "Erro", description: "Falha ao excluir workflow", variant: "destructive" });
    }
  }, [toast]);

  // Start workflow
  const startWorkflow = useCallback(async (id: string) => {
    await updateWorkflow(id, { status: "active" });
  }, [updateWorkflow]);

  // Pause workflow
  const pauseWorkflow = useCallback(async (id: string) => {
    await updateWorkflow(id, { status: "paused" });
  }, [updateWorkflow]);

  // Toggle automation rule
  const toggleAutomationRule = useCallback(async (id: string) => {
    try {
      const rule = automationRules.find(r => r.id === id);
      if (!rule) return;

      const { error } = await supabase
        .from("automation_rules")
        .update({ 
          is_active: !rule.is_active,
          updated_at: new Date().toISOString()
        })
        .eq("id", id);

      if (error) throw error;

      setAutomationRules(prev => prev.map(r => 
        r.id === id ? { ...r, is_active: !r.is_active } : r
      ));

      toast({ 
        title: "Regra atualizada", 
        description: `Automação ${!rule.is_active ? "ativada" : "desativada"}`
      });
    } catch (err) {
      console.error("Error toggling rule:", err);
      // Update locally
      setAutomationRules(prev => prev.map(r => 
        r.id === id ? { ...r, is_active: !r.is_active } : r
      ));
      toast({ title: "Atualizado", description: "Status alterado" });
    }
  }, [automationRules, toast]);

  // Create automation rule
  const createAutomationRule = useCallback(async (rule: Partial<AutomationRule>) => {
    if (!user) return null;

    try {
      const newRule = {
        rule_name: rule.rule_name || "Nova Regra",
        description: rule.description || "",
        trigger_type: rule.trigger_type || "manual",
        trigger_config: rule.trigger_config || {},
        actions: rule.actions || {},
        conditions: rule.conditions || null,
        is_active: rule.is_active ?? false,
        execution_count: 0,
        created_by: user.id,
      };

      const { data, error } = await supabase
        .from("automation_rules")
        .insert(newRule)
        .select()
        .single();

      if (error) throw error;

      toast({ title: "Sucesso", description: "Regra de automação criada!" });
      await fetchAutomationRules();
      return data;
    } catch (err) {
      console.error("Error creating rule:", err);
      toast({ title: "Erro", description: "Falha ao criar regra", variant: "destructive" });
      return null;
    }
  }, [user, toast, fetchAutomationRules]);

  // Export workflows
  const exportWorkflows = useCallback(() => {
    const data = {
      workflows,
      automationRules,
      exportedAt: new Date().toISOString(),
      exportedBy: user?.email,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `workflows-export-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({ title: "Exportado", description: "Workflows exportados com sucesso!" });
  }, [workflows, automationRules, user, toast]);

  return {
    workflows,
    automationRules,
    isLoading,
    error,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    startWorkflow,
    pauseWorkflow,
    toggleAutomationRule,
    createAutomationRule,
    exportWorkflows,
    refetch: fetchWorkflows,
  };
};

// Helper function
function calculateProgress(steps: WorkflowStep[]): number {
  if (!steps || steps.length === 0) return 0;
  const completed = steps.filter(s => s.status === "completed").length;
  return Math.round((completed / steps.length) * 100);
}

// Sample data
function getSampleWorkflows(): Workflow[] {
  return [
    {
      id: "sample-1",
      name: "Processo de Onboarding",
      description: "Fluxo completo de integração de novos funcionários",
      category: "hr",
      status: "active",
      progress: 65,
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      created_by: "Admin",
      estimated_duration: 2880,
      priority: "high",
      tags: ["rh", "onboarding", "novo-funcionario"],
      steps: [
        { id: "s1", name: "Criação de Usuário", description: "Criar conta no sistema", status: "completed", assignee: "TI", order: 1, duration: 30 },
        { id: "s2", name: "Documentação", description: "Coleta de documentos pessoais", status: "completed", assignee: "RH", order: 2, duration: 120 },
        { id: "s3", name: "Treinamento Inicial", description: "Curso de integração", status: "in_progress", assignee: "Supervisor", order: 3 },
        { id: "s4", name: "Avaliação 30 dias", description: "Primeira avaliação de desempenho", status: "pending", assignee: "Gerente", order: 4, dependencies: ["s3"] },
      ],
    },
    {
      id: "sample-2",
      name: "Aprovação de Despesas",
      description: "Fluxo de aprovação para reembolsos e despesas",
      category: "finance",
      status: "active",
      progress: 75,
      created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      created_by: "Financeiro",
      estimated_duration: 480,
      priority: "medium",
      tags: ["financeiro", "despesas", "aprovação"],
      steps: [
        { id: "s5", name: "Submissão", description: "Funcionário submete despesa", status: "completed", assignee: "Funcionário", order: 1 },
        { id: "s6", name: "Revisão Supervisor", description: "Aprovação do supervisor direto", status: "completed", assignee: "Supervisor", order: 2 },
        { id: "s7", name: "Aprovação Financeira", description: "Validação do departamento financeiro", status: "in_progress", assignee: "Financeiro", order: 3 },
        { id: "s8", name: "Pagamento", description: "Processamento do reembolso", status: "pending", assignee: "Tesouraria", order: 4 },
      ],
    },
    {
      id: "sample-3",
      name: "Manutenção Preventiva",
      description: "Rotina de manutenção de equipamentos críticos",
      category: "maintenance",
      status: "paused",
      progress: 40,
      created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      created_by: "Operações",
      estimated_duration: 720,
      priority: "high",
      tags: ["manutenção", "equipamentos", "preventiva"],
      steps: [
        { id: "s9", name: "Inspeção Visual", description: "Verificação inicial dos equipamentos", status: "completed", assignee: "Técnico", order: 1 },
        { id: "s10", name: "Testes Funcionais", description: "Execução de testes operacionais", status: "failed", assignee: "Especialista", order: 2 },
      ],
    },
  ];
}

function getSampleRules(): AutomationRule[] {
  return [
    {
      id: "rule-1",
      rule_name: "Auto-aprovação Despesas Baixo Valor",
      description: "Aprova automaticamente despesas abaixo de R$ 100",
      trigger_type: "expense_submitted",
      trigger_config: { event: "expense.created" },
      actions: { type: "auto_approve", notify: true },
      conditions: { amount: { operator: "lt", value: 100 } },
      is_active: true,
      execution_count: 47,
      last_executed_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      created_by: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      organization_id: null,
    },
    {
      id: "rule-2",
      rule_name: "Notificação Certificado Vencendo",
      description: "Envia alerta 30 dias antes do vencimento",
      trigger_type: "schedule",
      trigger_config: { cron: "0 9 * * *" },
      actions: { type: "send_notification", template: "certificate_expiry" },
      conditions: { days_to_expiry: { operator: "lte", value: 30 } },
      is_active: true,
      execution_count: 12,
      last_executed_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      created_by: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      organization_id: null,
    },
    {
      id: "rule-3",
      rule_name: "Escalação de Tickets",
      description: "Escala tickets não resolvidos em 24h",
      trigger_type: "schedule",
      trigger_config: { interval: "1h" },
      actions: { type: "escalate", to: "manager" },
      conditions: { hours_open: { operator: "gt", value: 24 } },
      is_active: false,
      execution_count: 8,
      last_executed_at: null,
      created_by: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      organization_id: null,
    },
  ];
}
