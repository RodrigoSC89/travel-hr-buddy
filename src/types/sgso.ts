// SGSO Audit Types
export interface SGSOAudit {
  id: string;
  organization_id?: string;
  vessel_id?: string;
  auditor_id?: string;
  audit_number?: string;
  audit_date: Date | string;
  status: 'planned' | 'in_progress' | 'completed' | 'follow_up' | 'closed';
  created_at?: Date | string;
  updated_at?: Date | string;
}

export interface SGSOAuditItem {
  id?: string;
  audit_id: string;
  requirement_number: number;
  requirement_title: string;
  description: string;
  compliance_status: 'compliant' | 'non-compliant' | 'partial' | null;
  evidence: string;
  ai_analysis?: AIAnalysis;
  created_at?: Date | string;
  updated_at?: Date | string;
}

export interface AIAnalysis {
  causa_provavel?: string;
  recomendacao?: string;
  impacto?: string;
}

export interface SGSORequirement {
  requirement_number: number;
  requirement_title: string;
  description: string;
}

export const SGSO_REQUIREMENTS: SGSORequirement[] = [
  {
    requirement_number: 1,
    requirement_title: "Política de Segurança e Meio Ambiente",
    description: "A embarcação deve possuir e divulgar uma política formal de segurança operacional e meio ambiente, aprovada pela alta direção, amplamente compreendida por todos os tripulantes."
  },
  {
    requirement_number: 2,
    requirement_title: "Identificação de Perigos e Avaliação de Riscos",
    description: "Processos sistemáticos de identificação e avaliação de riscos operacionais e ambientais, com documentação adequada e revisão periódica."
  },
  {
    requirement_number: 3,
    requirement_title: "Controle de Riscos",
    description: "Implementação de medidas de controle e mitigação de riscos identificados, com hierarquia de controles (eliminação, substituição, engenharia, administrativa, EPIs)."
  },
  {
    requirement_number: 4,
    requirement_title: "Competência, Treinamento e Conscientização",
    description: "Gestão de competências e programas de treinamento para todos os tripulantes, com registros de qualificação, treinamentos periódicos e avaliações de eficácia."
  },
  {
    requirement_number: 5,
    requirement_title: "Comunicação e Consulta",
    description: "Canais de comunicação e consulta sobre segurança, garantindo fluxo de informações entre tripulação, gestão e partes interessadas."
  },
  {
    requirement_number: 6,
    requirement_title: "Documentação do SGSO",
    description: "Gestão documental do sistema de segurança, incluindo manual SGSO, procedimentos operacionais, registros e controle de documentos."
  },
  {
    requirement_number: 7,
    requirement_title: "Controle Operacional",
    description: "Procedimentos operacionais e controles para atividades críticas, incluindo permissões de trabalho, inspeções e checklists."
  },
  {
    requirement_number: 8,
    requirement_title: "Preparação e Resposta a Emergências",
    description: "Planos de emergência e resposta para diferentes cenários, com treinamentos, simulados periódicos e recursos adequados."
  },
  {
    requirement_number: 9,
    requirement_title: "Monitoramento e Medição",
    description: "Indicadores e métricas de segurança (KPIs), monitoramento contínuo de desempenho e análise de tendências."
  },
  {
    requirement_number: 10,
    requirement_title: "Avaliação de Conformidade",
    description: "Avaliação de conformidade regulatória com normas IBAMA, ANP, ANTAQ e outros requisitos legais aplicáveis."
  },
  {
    requirement_number: 11,
    requirement_title: "Investigação de Incidentes",
    description: "Processos de investigação e análise de incidentes, acidentes e quase-acidentes, com identificação de causas raiz e lições aprendidas."
  },
  {
    requirement_number: 12,
    requirement_title: "Análise Crítica pela Direção",
    description: "Revisões gerenciais periódicas do SGSO, avaliando eficácia, necessidades de mudança e alocação de recursos."
  },
  {
    requirement_number: 13,
    requirement_title: "Gestão de Mudanças",
    description: "Processos de gestão de mudanças organizacionais, operacionais ou tecnológicas, com avaliação de riscos e controles."
  },
  {
    requirement_number: 14,
    requirement_title: "Aquisição e Contratação",
    description: "Critérios de segurança em aquisições de equipamentos, materiais e contratação de serviços, incluindo qualificação de fornecedores."
  },
  {
    requirement_number: 15,
    requirement_title: "Projeto e Construção",
    description: "Segurança em projetos e construções, considerando análise de riscos desde a fase de concepção até a operação."
  },
  {
    requirement_number: 16,
    requirement_title: "Informações de Segurança de Processo",
    description: "Gestão de informações críticas de segurança, incluindo dados técnicos, limites operacionais e procedimentos de segurança de processo."
  },
  {
    requirement_number: 17,
    requirement_title: "Integridade Mecânica",
    description: "Manutenção e integridade de equipamentos críticos, com programas de manutenção preventiva, inspeções e testes periódicos."
  }
];
