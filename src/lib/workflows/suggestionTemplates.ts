// Workflow Suggestion Templates
// These templates are automatically seeded when a new workflow is created

export interface WorkflowSuggestionTemplate {
  etapa: string;
  tipo_sugestao: string;
  conteudo: string;
  criticidade: string;
  responsavel_sugerido: string;
  origem: string;
}

export const workflowSuggestionTemplates: WorkflowSuggestionTemplate[] = [
  {
    etapa: "Planejamento Inicial",
    tipo_sugestao: "Criar tarefa",
    conteudo: "Recomenda-se definir objetivos claros e mensuráveis para o workflow",
    criticidade: "alta",
    responsavel_sugerido: "Gestor do Projeto",
    origem: "Template Histórico"
  },
  {
    etapa: "Revisão de Documentos",
    tipo_sugestao: "Criar tarefa",
    conteudo: "Recomenda-se criar uma tarefa de validação dos documentos técnicos e regulamentares",
    criticidade: "alta",
    responsavel_sugerido: "Compliance Officer",
    origem: "Checklists"
  },
  {
    etapa: "Aprovação de Recursos",
    tipo_sugestao: "Ajustar prazo",
    conteudo: "Processos de aprovação financeira tipicamente requerem 3-5 dias úteis",
    criticidade: "média",
    responsavel_sugerido: "Gerente Financeiro",
    origem: "MMI"
  },
  {
    etapa: "Execução",
    tipo_sugestao: "Criar tarefa",
    conteudo: "Recomenda-se estabelecer pontos de controle (checkpoints) semanais para acompanhamento",
    criticidade: "média",
    responsavel_sugerido: "Coordenador de Projeto",
    origem: "Template Histórico"
  },
  {
    etapa: "Validação de Qualidade",
    tipo_sugestao: "Criar tarefa",
    conteudo: "Implementar revisão de qualidade antes da finalização do workflow",
    criticidade: "alta",
    responsavel_sugerido: "Analista de Qualidade",
    origem: "Audit Logs"
  },
  {
    etapa: "Comunicação com Stakeholders",
    tipo_sugestao: "Criar tarefa",
    conteudo: "Manter comunicação regular com todas as partes interessadas para transparência",
    criticidade: "média",
    responsavel_sugerido: "Gerente de Comunicação",
    origem: "Template Histórico"
  },
  {
    etapa: "Documentação Final",
    tipo_sugestao: "Criar tarefa",
    conteudo: "Garantir que toda a documentação esteja completa e arquivada adequadamente",
    criticidade: "alta",
    responsavel_sugerido: "Especialista em Documentação",
    origem: "Checklists"
  },
  {
    etapa: "Análise de Riscos",
    tipo_sugestao: "Criar tarefa",
    conteudo: "Identificar e mitigar riscos potenciais no início do workflow",
    criticidade: "alta",
    responsavel_sugerido: "Analista de Riscos",
    origem: "MMI"
  }
];
