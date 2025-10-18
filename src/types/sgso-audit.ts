// SGSO Audit Types
export type ComplianceStatus = 'compliant' | 'non_compliant' | 'partial' | 'pending';

export interface AIAnalysis {
  causa_provavel?: string;
  recomendacao?: string;
  impacto?: string;
}

export interface SGSOAuditItem {
  id: string;
  audit_id: string;
  requirement_number: number;
  requirement_title: string;
  description: string;
  compliance_status: ComplianceStatus;
  evidence?: string;
  ai_analysis?: AIAnalysis;
  created_at: string;
  updated_at: string;
}

export interface SGSOAudit {
  id: string;
  organization_id: string;
  audit_number: string;
  audit_type: 'internal' | 'external' | 'anp' | 'antaq' | 'classification_society' | 'client';
  audit_scope: string;
  audit_date: string;
  completion_date?: string;
  status: 'planned' | 'in_progress' | 'completed' | 'follow_up' | 'closed';
  vessel_id?: string;
  auditors?: any[];
  findings?: any[];
  non_conformities?: any[];
  observations?: any[];
  recommendations?: any[];
  overall_rating?: 'excellent' | 'good' | 'satisfactory' | 'needs_improvement' | 'unsatisfactory';
  corrective_actions_due?: string;
  report_file?: string;
  created_at: string;
  updated_at: string;
}

// 17 Official SGSO Requirements
export const SGSO_REQUIREMENTS = [
  {
    requirement_number: 1,
    requirement_title: "Política de Segurança e Meio Ambiente",
    description: "A embarcação deve possuir e divulgar uma política formal de segurança operacional e meio ambiente, aprovada pela alta direção, amplamente compreendida por todos os tripulantes."
  },
  {
    requirement_number: 2,
    requirement_title: "Identificação de Perigos e Avaliação de Riscos",
    description: "Processos sistemáticos de identificação de perigos operacionais e avaliação de riscos, incluindo matriz de riscos 5x5 e análise de tarefas críticas."
  },
  {
    requirement_number: 3,
    requirement_title: "Controle de Riscos",
    description: "Implementação de medidas de controle e mitigação de riscos identificados, incluindo controles de engenharia, administrativos e EPIs."
  },
  {
    requirement_number: 4,
    requirement_title: "Competência, Treinamento e Conscientização",
    description: "Gestão de competências e programas de treinamento contínuo para tripulação em segurança operacional, resposta a emergências e procedimentos SGSO."
  },
  {
    requirement_number: 5,
    requirement_title: "Comunicação e Consulta",
    description: "Canais de comunicação efetivos e processos de consulta sobre questões de segurança operacional com tripulação e partes interessadas."
  },
  {
    requirement_number: 6,
    requirement_title: "Documentação do SGSO",
    description: "Gestão documental do sistema de segurança, incluindo manuais, procedimentos, registros e controle de versões."
  },
  {
    requirement_number: 7,
    requirement_title: "Controle Operacional",
    description: "Procedimentos operacionais padronizados (POPs) e controles para operações críticas e rotineiras da embarcação."
  },
  {
    requirement_number: 8,
    requirement_title: "Preparação e Resposta a Emergências",
    description: "Planos de emergência documentados, exercícios periódicos de resposta a emergências e equipamentos de emergência adequados."
  },
  {
    requirement_number: 9,
    requirement_title: "Monitoramento e Medição",
    description: "Indicadores e métricas de segurança operacional, incluindo taxa de frequência de acidentes (LTIF), near miss e KPIs de segurança."
  },
  {
    requirement_number: 10,
    requirement_title: "Avaliação de Conformidade",
    description: "Processos de avaliação de conformidade com requisitos legais, regulatórios e normativos aplicáveis."
  },
  {
    requirement_number: 11,
    requirement_title: "Investigação de Incidentes",
    description: "Processos de investigação de incidentes, acidentes e near miss, incluindo análise de causa raiz e lições aprendidas."
  },
  {
    requirement_number: 12,
    requirement_title: "Análise Crítica pela Direção",
    description: "Revisões gerenciais periódicas do SGSO, incluindo análise de desempenho, adequação e oportunidades de melhoria."
  },
  {
    requirement_number: 13,
    requirement_title: "Gestão de Mudanças",
    description: "Processos de gestão de mudanças organizacionais, operacionais e tecnológicas com avaliação de impacto em segurança."
  },
  {
    requirement_number: 14,
    requirement_title: "Aquisição e Contratação",
    description: "Critérios de segurança em processos de aquisição de equipamentos e contratação de serviços terceirizados."
  },
  {
    requirement_number: 15,
    requirement_title: "Projeto e Construção",
    description: "Considerações de segurança em projetos de modificações, construções e instalações na embarcação."
  },
  {
    requirement_number: 16,
    requirement_title: "Informações de Segurança de Processo",
    description: "Gestão de informações críticas de segurança de processos operacionais, incluindo dados de equipamentos, substâncias perigosas e procedimentos."
  },
  {
    requirement_number: 17,
    requirement_title: "Integridade Mecânica",
    description: "Programas de manutenção preventiva e preditiva, inspeções periódicas e garantia de integridade de equipamentos críticos."
  }
] as const;

export type SGSORequirement = typeof SGSO_REQUIREMENTS[number];
