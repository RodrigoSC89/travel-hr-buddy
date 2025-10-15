// File: /lib/workflows/suggestionTemplates.ts

/**
 * Workflow Suggestion Template Type
 * Defines the structure of historical workflow suggestions that can be reused
 */
export interface WorkflowSuggestionTemplate {
  etapa: string;
  tipo_sugestao: string;
  conteudo: string;
  criticidade: 'Alta' | 'Média' | 'Baixa';
  responsavel_sugerido: string;
  origem: string;
}

/**
 * Historical Workflow Suggestion Templates
 * 
 * These templates serve as seeds for creating new workflows and action plans.
 * They can be:
 * - Pre-loaded when opening a new workflow
 * - Used as best practices in audits
 * - Suggested dynamically by AI Copilot
 * 
 * Benefits:
 * 💾 Reuse previous suggestions as models
 * 🧠 Learn from what worked best
 * ⚡ Offer contextual suggestions right away when creating a new flow
 */
export const workflowSuggestionTemplates: WorkflowSuggestionTemplate[] = [
  {
    etapa: 'Verificar status de sensores redundantes',
    tipo_sugestao: 'Criar tarefa',
    conteudo: 'Revisar o funcionamento dos sensores de backup de posição e heading conforme item 3.2.4 do ASOG.',
    criticidade: 'Alta',
    responsavel_sugerido: 'Oficial de Náutica',
    origem: 'Template Histórico',
  },
  {
    etapa: 'Atualizar documento de FMEA embarcado',
    tipo_sugestao: 'Criar tarefa',
    conteudo: 'Verificar se o FMEA a bordo está com a versão mais recente do fabricante (última revisão técnica)',
    criticidade: 'Média',
    responsavel_sugerido: 'Engenharia Onshore',
    origem: 'Template Histórico',
  },
  {
    etapa: 'Revisar checklists incompletos no último mês',
    tipo_sugestao: 'Ajustar prazo',
    conteudo: 'Revisar preenchimento dos checklists de entrada na zona de 500m. IPCLV abaixo de 90%.',
    criticidade: 'Alta',
    responsavel_sugerido: 'Supervisor de DP',
    origem: 'Template Histórico',
  },
];

/**
 * Get templates by criticality level
 */
export const getTemplatesByCriticality = (
  criticidade: 'Alta' | 'Média' | 'Baixa'
): WorkflowSuggestionTemplate[] => {
  return workflowSuggestionTemplates.filter(
    (template) => template.criticidade === criticidade
  );
};

/**
 * Get templates by suggestion type
 */
export const getTemplatesBySuggestionType = (
  tipo: string
): WorkflowSuggestionTemplate[] => {
  return workflowSuggestionTemplates.filter(
    (template) => template.tipo_sugestao === tipo
  );
};

/**
 * Get templates by responsible party
 */
export const getTemplatesByResponsible = (
  responsavel: string
): WorkflowSuggestionTemplate[] => {
  return workflowSuggestionTemplates.filter(
    (template) => template.responsavel_sugerido === responsavel
  );
};

// Essas sugestões podem ser reutilizadas como ponto de partida para novos planos de ação ou auditorias internas.
