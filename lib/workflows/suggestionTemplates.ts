/**
 * Workflow Suggestion Templates
 * 
 * Provides predefined templates for workflow suggestions based on historical patterns
 * and best practices for maritime operations and DP system maintenance.
 */

export interface WorkflowSuggestionTemplate {
  etapa: string;
  tipo_sugestao: string;
  conteudo: string;
  criticidade: "Alta" | "Média" | "Baixa";
  responsavel_sugerido: string;
  origem: string;
}

export const workflowSuggestionTemplates: WorkflowSuggestionTemplate[] = [
  {
    etapa: "Verificar status de sensores redundantes",
    tipo_sugestao: "Criar tarefa",
    conteudo: "Verificar a redundância e funcionamento dos sensores críticos do sistema DP, incluindo giros, sensores de vento e referências de posicionamento.",
    criticidade: "Alta",
    responsavel_sugerido: "Oficial de Náutica",
    origem: "Template Histórico",
  },
  {
    etapa: "Atualizar documento de FMEA embarcado",
    tipo_sugestao: "Criar tarefa",
    conteudo: "Revisar e atualizar o documento de FMEA (Failure Mode and Effects Analysis) da embarcação de acordo com as últimas modificações e incidentes registrados.",
    criticidade: "Média",
    responsavel_sugerido: "Engenharia Onshore",
    origem: "Template Histórico",
  },
  {
    etapa: "Revisar checklists incompletos no último mês",
    tipo_sugestao: "Ajustar prazo",
    conteudo: "Analisar os checklists que não foram completados no prazo e ajustar prazos futuros ou redistribuir responsabilidades conforme necessário.",
    criticidade: "Alta",
    responsavel_sugerido: "Supervisor de DP",
    origem: "Template Histórico",
  },
];
