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
    conteudo: "Revisar status de todos os sensores redundantes do sistema DP",
    criticidade: "Alta",
    responsavel_sugerido: "Oficial de Náutica",
    origem: "Template Histórico",
  },
  {
    etapa: "Atualizar documento de FMEA embarcado",
    tipo_sugestao: "Criar tarefa",
    conteudo: "Atualizar documento de FMEA com base nas últimas manutenções e incidentes",
    criticidade: "Média",
    responsavel_sugerido: "Engenharia Onshore",
    origem: "Template Histórico",
  },
  {
    etapa: "Revisar checklists incompletos no último mês",
    tipo_sugestao: "Ajustar prazo",
    conteudo: "Revisar e ajustar prazos de checklists que ficaram incompletos no último mês",
    criticidade: "Alta",
    responsavel_sugerido: "Supervisor de DP",
    origem: "Template Histórico",
  },
];
