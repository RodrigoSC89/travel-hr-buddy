import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Workflow, WorkflowStep, WorkflowTemplate } from "./useWorkflows";

interface AISuggestion {
  id: string;
  type: "optimization" | "step_suggestion" | "risk_alert" | "automation";
  title: string;
  description: string;
  confidence: number;
  priority: "low" | "medium" | "high";
  action?: {
    type: string;
    payload: any;
  };
}

interface AIAnalysis {
  summary: string;
  bottlenecks: string[];
  recommendations: string[];
  riskAreas: string[];
  estimatedImpact: string;
}

export const useWorkflowAI = () => {
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);

  // Generate AI suggestions for a workflow
  const generateSuggestions = useCallback(async (workflow: Workflow): Promise<AISuggestion[]> => {
    setIsAnalyzing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("workflow-ai-assistant", {
        body: {
          action: "suggest",
          workflow: {
            name: workflow.name,
            description: workflow.description,
            category: workflow.category,
            steps: workflow.steps,
            status: workflow.status,
            priority: workflow.priority,
          },
        },
      });

      if (error) throw error;

      const aiSuggestions = data?.suggestions || generateLocalSuggestions(workflow);
      setSuggestions(aiSuggestions);
      return aiSuggestions;
    } catch (err) {
      console.error("AI suggestion error:", err);
      // Fallback to local suggestions
      const localSuggestions = generateLocalSuggestions(workflow);
      setSuggestions(localSuggestions);
      return localSuggestions;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  // Analyze workflow performance
  const analyzeWorkflow = useCallback(async (workflow: Workflow): Promise<AIAnalysis> => {
    setIsAnalyzing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("workflow-ai-assistant", {
        body: {
          action: "analyze",
          workflow: {
            name: workflow.name,
            description: workflow.description,
            category: workflow.category,
            steps: workflow.steps,
            progress: workflow.progress,
            priority: workflow.priority,
          },
        },
      });

      if (error) throw error;

      const aiAnalysis = data?.analysis || generateLocalAnalysis(workflow);
      setAnalysis(aiAnalysis);
      return aiAnalysis;
    } catch (err) {
      console.error("AI analysis error:", err);
      const localAnalysis = generateLocalAnalysis(workflow);
      setAnalysis(localAnalysis);
      return localAnalysis;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  // Generate workflow from description
  const generateWorkflowFromDescription = useCallback(async (description: string, category: string): Promise<Partial<Workflow> | null> => {
    setIsAnalyzing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("workflow-ai-assistant", {
        body: {
          action: "generate",
          prompt: description,
          category,
        },
      });

      if (error) throw error;

      toast({
        title: "Workflow gerado",
        description: "A IA criou um workflow baseado na sua descrição",
      });

      return data?.workflow || null;
    } catch (err) {
      console.error("AI generation error:", err);
      toast({
        title: "Erro na geração",
        description: "Usando template padrão",
        variant: "destructive",
      });
      return generateLocalWorkflow(description, category);
    } finally {
      setIsAnalyzing(false);
    }
  }, [toast]);

  // Optimize workflow steps
  const optimizeSteps = useCallback(async (steps: WorkflowStep[]): Promise<WorkflowStep[]> => {
    setIsAnalyzing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("workflow-ai-assistant", {
        body: {
          action: "optimize",
          steps,
        },
      });

      if (error) throw error;

      toast({
        title: "Etapas otimizadas",
        description: "As etapas foram reorganizadas para maior eficiência",
      });

      return data?.optimizedSteps || steps;
    } catch (err) {
      console.error("AI optimization error:", err);
      return steps;
    } finally {
      setIsAnalyzing(false);
    }
  }, [toast]);

  // Clear suggestions
  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setAnalysis(null);
  }, []);

  return {
    isAnalyzing,
    suggestions,
    analysis,
    generateSuggestions,
    analyzeWorkflow,
    generateWorkflowFromDescription,
    optimizeSteps,
    clearSuggestions,
  };
};

// Local fallback functions
function generateLocalSuggestions(workflow: Workflow): AISuggestion[] {
  const suggestions: AISuggestion[] = [];
  
  // Check for pending steps
  const pendingSteps = workflow.steps.filter(s => s.status === "pending");
  if (pendingSteps.length > 2) {
    suggestions.push({
      id: `sug-${Date.now()}-1`,
      type: "optimization",
      title: "Muitas etapas pendentes",
      description: `Existem ${pendingSteps.length} etapas aguardando. Considere paralelizar algumas atividades.`,
      confidence: 85,
      priority: "medium",
    });
  }

  // Check for failed steps
  const failedSteps = workflow.steps.filter(s => s.status === "failed");
  if (failedSteps.length > 0) {
    suggestions.push({
      id: `sug-${Date.now()}-2`,
      type: "risk_alert",
      title: "Etapas com falha detectadas",
      description: `${failedSteps.length} etapa(s) falharam e precisam de atenção imediata.`,
      confidence: 95,
      priority: "high",
    });
  }

  // Suggest automation for repetitive workflows
  if (workflow.category === "hr" || workflow.category === "finance") {
    suggestions.push({
      id: `sug-${Date.now()}-3`,
      type: "automation",
      title: "Potencial para automação",
      description: "Este workflow pode ser parcialmente automatizado para reduzir tempo manual.",
      confidence: 70,
      priority: "low",
    });
  }

  // Low progress warning
  if (workflow.progress < 30 && workflow.status === "active") {
    suggestions.push({
      id: `sug-${Date.now()}-4`,
      type: "risk_alert",
      title: "Progresso baixo",
      description: "O workflow está ativo mas com pouco progresso. Verifique possíveis bloqueios.",
      confidence: 80,
      priority: "medium",
    });
  }

  return suggestions;
}

function generateLocalAnalysis(workflow: Workflow): AIAnalysis {
  const completedSteps = workflow.steps.filter(s => s.status === "completed").length;
  const totalSteps = workflow.steps.length;
  const failedSteps = workflow.steps.filter(s => s.status === "failed");

  return {
    summary: `Workflow "${workflow.name}" com ${completedSteps}/${totalSteps} etapas concluídas (${workflow.progress}% de progresso).`,
    bottlenecks: failedSteps.length > 0 
      ? [`Etapa "${failedSteps[0]?.name}" está bloqueando o progresso`]
      : [],
    recommendations: [
      "Definir responsáveis claros para cada etapa",
      "Configurar alertas automáticos para prazos",
      "Documentar dependências entre etapas",
    ],
    riskAreas: workflow.priority === "high" || workflow.priority === "urgent"
      ? ["Prazo crítico - monitoramento contínuo recomendado"]
      : [],
    estimatedImpact: workflow.progress < 50 
      ? "Alto impacto potencial se não for acompanhado de perto"
      : "Impacto moderado - workflow progredindo normalmente",
  };
}

function generateLocalWorkflow(description: string, category: string): Partial<Workflow> {
  const defaultSteps: WorkflowStep[] = [
    { id: "step-1", name: "Inicialização", description: "Preparação inicial do processo", status: "pending", order: 1 },
    { id: "step-2", name: "Execução Principal", description: "Etapa principal do workflow", status: "pending", order: 2 },
    { id: "step-3", name: "Revisão", description: "Revisão e validação", status: "pending", order: 3 },
    { id: "step-4", name: "Conclusão", description: "Finalização do processo", status: "pending", order: 4 },
  ];

  return {
    name: description.slice(0, 50) || "Novo Workflow",
    description: description,
    category: category as any,
    status: "draft",
    priority: "medium",
    steps: defaultSteps,
    progress: 0,
    estimated_duration: 480, // 8 hours default
    tags: [category],
  };
}

// Export templates
export const workflowTemplates: WorkflowTemplate[] = [
  {
    id: "tpl-onboarding",
    name: "Onboarding de Funcionários",
    description: "Processo completo de integração de novos colaboradores",
    category: "hr",
    estimated_duration: 2880,
    tags: ["rh", "onboarding"],
    steps: [
      { id: "t1-1", name: "Preparação de documentação", description: "Coleta de documentos pessoais", status: "pending", order: 1 },
      { id: "t1-2", name: "Criação de acessos", description: "Configurar e-mail e sistemas", status: "pending", order: 2 },
      { id: "t1-3", name: "Treinamento inicial", description: "Curso de integração", status: "pending", order: 3 },
      { id: "t1-4", name: "Entrega de equipamentos", description: "Notebook, crachá, materiais", status: "pending", order: 4 },
      { id: "t1-5", name: "Apresentação à equipe", description: "Reunião com time", status: "pending", order: 5 },
      { id: "t1-6", name: "Treinamento específico", description: "Capacitação da função", status: "pending", order: 6 },
      { id: "t1-7", name: "Acompanhamento inicial", description: "Check-ins semanais", status: "pending", order: 7 },
      { id: "t1-8", name: "Avaliação de período", description: "Avaliação 30/60/90 dias", status: "pending", order: 8 },
    ],
  },
  {
    id: "tpl-expense",
    name: "Aprovação de Despesas",
    description: "Fluxo de aprovação para reembolsos e despesas",
    category: "finance",
    estimated_duration: 480,
    tags: ["financeiro", "aprovação"],
    steps: [
      { id: "t2-1", name: "Submissão", description: "Funcionário submete despesa", status: "pending", order: 1 },
      { id: "t2-2", name: "Validação inicial", description: "Verificação de documentos", status: "pending", order: 2 },
      { id: "t2-3", name: "Aprovação gerencial", description: "Aprovação do gestor", status: "pending", order: 3 },
      { id: "t2-4", name: "Processamento", description: "Cadastro no financeiro", status: "pending", order: 4 },
    ],
  },
  {
    id: "tpl-purchase",
    name: "Processo de Compras",
    description: "Fluxo completo de aquisição de materiais e serviços",
    category: "operations",
    estimated_duration: 1440,
    tags: ["compras", "aquisição"],
    steps: [
      { id: "t3-1", name: "Requisição", description: "Solicitação de compra", status: "pending", order: 1 },
      { id: "t3-2", name: "Cotação", description: "Pesquisa de fornecedores", status: "pending", order: 2 },
      { id: "t3-3", name: "Aprovação", description: "Aprovação orçamentária", status: "pending", order: 3 },
      { id: "t3-4", name: "Pedido", description: "Emissão do pedido", status: "pending", order: 4 },
      { id: "t3-5", name: "Recebimento", description: "Conferência de materiais", status: "pending", order: 5 },
      { id: "t3-6", name: "Pagamento", description: "Processamento do pagamento", status: "pending", order: 6 },
    ],
  },
  {
    id: "tpl-marketing",
    name: "Campanha de Marketing",
    description: "Planejamento e execução de campanhas",
    category: "marketing",
    estimated_duration: 4320,
    tags: ["marketing", "campanha"],
    steps: [
      { id: "t4-1", name: "Briefing", description: "Definição de objetivos", status: "pending", order: 1 },
      { id: "t4-2", name: "Planejamento", description: "Estratégia e cronograma", status: "pending", order: 2 },
      { id: "t4-3", name: "Criação", description: "Desenvolvimento de materiais", status: "pending", order: 3 },
      { id: "t4-4", name: "Revisão", description: "Aprovação de conteúdo", status: "pending", order: 4 },
      { id: "t4-5", name: "Lançamento", description: "Publicação da campanha", status: "pending", order: 5 },
      { id: "t4-6", name: "Monitoramento", description: "Acompanhamento de resultados", status: "pending", order: 6 },
      { id: "t4-7", name: "Otimização", description: "Ajustes e melhorias", status: "pending", order: 7 },
      { id: "t4-8", name: "Relatório", description: "Análise de performance", status: "pending", order: 8 },
      { id: "t4-9", name: "Encerramento", description: "Documentação final", status: "pending", order: 9 },
      { id: "t4-10", name: "Retrospectiva", description: "Lições aprendidas", status: "pending", order: 10 },
    ],
  },
  {
    id: "tpl-maintenance",
    name: "Manutenção Preventiva",
    description: "Rotina de manutenção de equipamentos",
    category: "maintenance",
    estimated_duration: 720,
    tags: ["manutenção", "preventiva"],
    steps: [
      { id: "t5-1", name: "Agendamento", description: "Programação da manutenção", status: "pending", order: 1 },
      { id: "t5-2", name: "Inspeção visual", description: "Verificação inicial", status: "pending", order: 2 },
      { id: "t5-3", name: "Testes funcionais", description: "Testes de operação", status: "pending", order: 3 },
      { id: "t5-4", name: "Manutenção", description: "Execução dos reparos", status: "pending", order: 4 },
      { id: "t5-5", name: "Documentação", description: "Registro de atividades", status: "pending", order: 5 },
    ],
  },
  {
    id: "tpl-performance",
    name: "Avaliação de Desempenho",
    description: "Ciclo completo de avaliação de performance",
    category: "hr",
    estimated_duration: 2160,
    tags: ["rh", "avaliação"],
    steps: [
      { id: "t6-1", name: "Preparação", description: "Definição de critérios", status: "pending", order: 1 },
      { id: "t6-2", name: "Autoavaliação", description: "Funcionário se avalia", status: "pending", order: 2 },
      { id: "t6-3", name: "Avaliação gestor", description: "Gestor avalia equipe", status: "pending", order: 3 },
      { id: "t6-4", name: "Calibração", description: "Alinhamento de notas", status: "pending", order: 4 },
      { id: "t6-5", name: "Feedback", description: "Reunião de feedback", status: "pending", order: 5 },
      { id: "t6-6", name: "PDI", description: "Plano de desenvolvimento", status: "pending", order: 6 },
      { id: "t6-7", name: "Acompanhamento", description: "Follow-up trimestral", status: "pending", order: 7 },
    ],
  },
];
