/**
 * Workflow Suggestion Templates
 * 
 * Pre-defined templates for workflow suggestions based on historical data
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
 * Based on common patterns and best practices
 */
export const workflowSuggestionTemplates: WorkflowSuggestionTemplate[] = [
  {
    etapa: "Verificar status de sensores redundantes",
    tipo_sugestao: "Criar tarefa",
    conteudo: "Verificar e validar o funcionamento de todos os sensores redundantes críticos do sistema de posicionamento dinâmico",
    criticidade: "Alta",
    responsavel_sugerido: "Oficial de Náutica",
    origem: "Template Histórico",
  },
  {
    etapa: "Atualizar documento de FMEA embarcado",
    tipo_sugestao: "Criar tarefa",
    conteudo: "Revisar e atualizar o documento de Análise de Modos e Efeitos de Falhas (FMEA) considerando as últimas mudanças no sistema",
    criticidade: "Média",
    responsavel_sugerido: "Engenharia Onshore",
    origem: "Template Histórico",
  },
  {
    etapa: "Revisar checklists incompletos no último mês",
    tipo_sugestao: "Ajustar prazo",
    conteudo: "Revisar e completar todos os checklists que ficaram pendentes ou incompletos no último mês, priorizando itens de segurança",
    criticidade: "Alta",
    responsavel_sugerido: "Supervisor de DP",
    origem: "Template Histórico",
  },
];
