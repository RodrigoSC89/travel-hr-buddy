/**
 * TypeScript types for SGSO Audits and Audit Items
 * Based on ANP Resolution 43/2007 - 17 mandatory practices
 */

export type ComplianceStatus = 'compliant' | 'non_compliant' | 'partial' | 'pending';

export type AuditStatus = 'planned' | 'in_progress' | 'completed' | 'follow_up' | 'closed';

export interface AIAnalysis {
  causa_provavel?: string;
  recomendacao?: string;
  impacto?: string;
  analise_completa?: string;
  score?: number;
}

export interface SGSORequirement {
  requirement_number: number;
  requirement_title: string;
  description: string;
}

export interface SGSOAuditItem {
  id: string;
  audit_id: string;
  requirement_number: number;
  requirement_title: string;
  description: string;
  compliance_status: ComplianceStatus;
  evidence: string | null;
  ai_analysis: AIAnalysis;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface SGSOAudit {
  id: string;
  organization_id: string;
  audit_number: string;
  audit_type: string;
  audit_scope: string;
  audit_date: string;
  completion_date: string | null;
  status: AuditStatus;
  vessel_id: string | null;
  auditors: any[];
  findings: any[];
  non_conformities: any[];
  observations: any[];
  recommendations: any[];
  overall_rating: string | null;
  corrective_actions_due: string | null;
  report_file: string | null;
  created_at: string;
  updated_at: string;
}

export interface SGSOAuditWithItems extends SGSOAudit {
  items: SGSOAuditItem[];
}

// 17 Official SGSO Requirements as per ANP Resolution 43/2007
export const SGSO_REQUIREMENTS: SGSORequirement[] = [
  {
    requirement_number: 1,
    requirement_title: "Liderança e Responsabilidade",
    description: "A embarcação deve possuir e divulgar uma política formal de segurança operacional e meio ambiente, aprovada pela alta direção, amplamente compreendida por todos os tripulantes."
  },
  {
    requirement_number: 2,
    requirement_title: "Identificação de Perigos e Avaliação de Riscos",
    description: "Processos sistemáticos de identificação de perigos e avaliação de riscos operacionais devem estar implementados e documentados."
  },
  {
    requirement_number: 3,
    requirement_title: "Controle de Riscos",
    description: "Implementação efetiva de medidas de controle e mitigação de riscos identificados nas operações."
  },
  {
    requirement_number: 4,
    requirement_title: "Competência, Treinamento e Conscientização",
    description: "Gestão de competências e programas de treinamento devem assegurar que todos os tripulantes estejam aptos para suas funções."
  },
  {
    requirement_number: 5,
    requirement_title: "Comunicação e Consulta",
    description: "Canais de comunicação efetivos e processos de consulta sobre questões de segurança devem estar estabelecidos."
  },
  {
    requirement_number: 6,
    requirement_title: "Documentação do SGSO",
    description: "Sistema de gestão documental adequado para manter e controlar toda a documentação do SGSO."
  },
  {
    requirement_number: 7,
    requirement_title: "Controle Operacional",
    description: "Procedimentos operacionais e controles devem estar definidos e implementados para todas as operações críticas."
  },
  {
    requirement_number: 8,
    requirement_title: "Preparação e Resposta a Emergências",
    description: "Planos de emergência e resposta devem estar estabelecidos, testados e atualizados regularmente."
  },
  {
    requirement_number: 9,
    requirement_title: "Monitoramento e Medição",
    description: "Indicadores e métricas de desempenho de segurança devem ser definidos, monitorados e analisados."
  },
  {
    requirement_number: 10,
    requirement_title: "Avaliação de Conformidade",
    description: "Processos de avaliação de conformidade com requisitos legais e regulatórios devem estar implementados."
  },
  {
    requirement_number: 11,
    requirement_title: "Investigação de Incidentes",
    description: "Metodologia estruturada para investigação e análise de incidentes deve estar estabelecida e ser aplicada."
  },
  {
    requirement_number: 12,
    requirement_title: "Análise Crítica pela Direção",
    description: "Revisões gerenciais periódicas do SGSO devem ser realizadas para avaliar eficácia e identificar melhorias."
  },
  {
    requirement_number: 13,
    requirement_title: "Gestão de Mudanças",
    description: "Processos formais de gestão de mudanças organizacionais e operacionais devem estar implementados."
  },
  {
    requirement_number: 14,
    requirement_title: "Aquisição e Contratação",
    description: "Critérios de segurança devem ser considerados em todos os processos de aquisição e contratação."
  },
  {
    requirement_number: 15,
    requirement_title: "Projeto e Construção",
    description: "Aspectos de segurança devem ser considerados desde as fases iniciais de projeto e construção."
  },
  {
    requirement_number: 16,
    requirement_title: "Informações de Segurança de Processo",
    description: "Informações críticas de segurança de processos devem ser gerenciadas e mantidas atualizadas."
  },
  {
    requirement_number: 17,
    requirement_title: "Integridade Mecânica",
    description: "Programas de manutenção e integridade de equipamentos críticos devem estar estabelecidos e implementados."
  }
];
