/**
 * Workflow Suggestion Templates
 * 
 * This file contains predefined suggestion templates that will be automatically
 * associated with new workflows to provide immediate guidance and best practices.
 */

export interface WorkflowSuggestionTemplate {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  suggestion_type: 'checklist' | 'compliance' | 'optimization' | 'reminder';
  origin_source: 'template' | 'ai_generated' | 'historical';
  metadata?: Record<string, unknown>;
}

/**
 * Default suggestion templates that will be added to every new workflow
 */
export const workflowSuggestionTemplates: WorkflowSuggestionTemplate[] = [
  {
    title: "Definir Responsáveis",
    description: "Atribuir responsáveis para cada etapa crítica do workflow para garantir accountability e clareza nas responsabilidades.",
    priority: "high",
    suggestion_type: "checklist",
    origin_source: "template",
    metadata: {
      category: "setup",
      estimated_time: "15 minutes"
    }
  },
  {
    title: "Estabelecer Prazos",
    description: "Definir datas de vencimento realistas para as tarefas principais, considerando dependências e recursos disponíveis.",
    priority: "high",
    suggestion_type: "checklist",
    origin_source: "template",
    metadata: {
      category: "planning",
      estimated_time: "20 minutes"
    }
  },
  {
    title: "Configurar Notificações",
    description: "Ativar alertas automáticos para deadlines próximos e mudanças de status para manter todos informados.",
    priority: "medium",
    suggestion_type: "optimization",
    origin_source: "template",
    metadata: {
      category: "automation",
      estimated_time: "10 minutes"
    }
  },
  {
    title: "Revisar Conformidade Regulatória",
    description: "Verificar se todas as etapas do workflow atendem aos requisitos legais e normas da indústria marítima (ISM Code, STCW, etc).",
    priority: "urgent",
    suggestion_type: "compliance",
    origin_source: "template",
    metadata: {
      category: "compliance",
      regulations: ["ISM Code", "STCW", "MLC 2006"],
      estimated_time: "30 minutes"
    }
  },
  {
    title: "Documentar Procedimentos",
    description: "Adicionar descrições detalhadas e instruções passo a passo para cada etapa do processo.",
    priority: "medium",
    suggestion_type: "checklist",
    origin_source: "template",
    metadata: {
      category: "documentation",
      estimated_time: "25 minutes"
    }
  },
  {
    title: "Definir Métricas de Sucesso",
    description: "Estabelecer KPIs e critérios claros para medir a eficácia e eficiência do workflow.",
    priority: "medium",
    suggestion_type: "optimization",
    origin_source: "template",
    metadata: {
      category: "metrics",
      estimated_time: "15 minutes"
    }
  },
  {
    title: "Planejar Checkpoints de Revisão",
    description: "Agendar pontos de verificação periódicos para avaliar progresso e fazer ajustes necessários.",
    priority: "medium",
    suggestion_type: "reminder",
    origin_source: "template",
    metadata: {
      category: "monitoring",
      suggested_frequency: "weekly",
      estimated_time: "10 minutes"
    }
  },
  {
    title: "Integrar com Sistemas Existentes",
    description: "Conectar o workflow com outros sistemas (ERP, SGSO, etc) para evitar duplicação de trabalho e garantir sincronização de dados.",
    priority: "low",
    suggestion_type: "optimization",
    origin_source: "template",
    metadata: {
      category: "integration",
      estimated_time: "45 minutes"
    }
  },
  {
    title: "Treinar Equipe",
    description: "Organizar sessão de treinamento para garantir que todos os envolvidos entendam o novo processo e suas responsabilidades.",
    priority: "high",
    suggestion_type: "checklist",
    origin_source: "template",
    metadata: {
      category: "training",
      estimated_time: "60 minutes"
    }
  },
  {
    title: "Backup e Contingência",
    description: "Estabelecer procedimentos alternativos e designar substitutos para garantir continuidade em caso de ausências ou problemas.",
    priority: "medium",
    suggestion_type: "compliance",
    origin_source: "template",
    metadata: {
      category: "risk_management",
      estimated_time: "20 minutes"
    }
  }
];
