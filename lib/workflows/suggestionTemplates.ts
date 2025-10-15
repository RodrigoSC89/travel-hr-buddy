// File: /lib/workflows/suggestionTemplates.ts

/**
 * Workflow Suggestion Template
 * 
 * Represents a reusable template for workflow suggestions that can be used
 * as starting points for new action plans and internal audits.
 */
export interface WorkflowSuggestionTemplate {
  etapa: string;
  tipo_sugestao: string;
  conteudo: string;
  criticidade: "Alta" | "Média" | "Baixa";
  responsavel_sugerido: string;
  origem: string;
}

/**
 * Historical workflow suggestion templates
 * 
 * These templates can be reused as starting points for new workflows,
 * helping to learn from previous best practices and provide contextual
 * suggestions for new action plans and audits.
 */
export const workflowSuggestionTemplates: WorkflowSuggestionTemplate[] = [
  {
    etapa: "Verificar status de sensores redundantes",
    tipo_sugestao: "Criar tarefa",
    conteudo: "Revisar o funcionamento dos sensores de backup de posição e heading conforme item 3.2.4 do ASOG.",
    criticidade: "Alta",
    responsavel_sugerido: "Oficial de Náutica",
    origem: "Template Histórico",
  },
  {
    etapa: "Atualizar documento de FMEA embarcado",
    tipo_sugestao: "Criar tarefa",
    conteudo: "Verificar se o FMEA a bordo está com a versão mais recente do fabricante (última revisão técnica)",
    criticidade: "Média",
    responsavel_sugerido: "Engenharia Onshore",
    origem: "Template Histórico",
  },
  {
    etapa: "Revisar checklists incompletos no último mês",
    tipo_sugestao: "Ajustar prazo",
    conteudo: "Revisar preenchimento dos checklists de entrada na zona de 500m. IPCLV abaixo de 90%.",
    criticidade: "Alta",
    responsavel_sugerido: "Supervisor de DP",
    origem: "Template Histórico",
  },
];

// Essas sugestões podem ser reutilizadas como ponto de partida para novos planos de ação ou auditorias internas.
