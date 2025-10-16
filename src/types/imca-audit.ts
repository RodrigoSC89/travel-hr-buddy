// ===========================
// IMCA Audit Type Definitions
// Complete TypeScript interfaces for IMCA DP Technical Audit System
// ===========================

export type DPClass = "DP1" | "DP2" | "DP3";

export type RiskLevel = "Alto" | "Médio" | "Baixo";

export type PriorityLevel = "Crítico" | "Alto" | "Médio" | "Baixo";

export type AuditStatus = "draft" | "in_progress" | "completed" | "approved";

export interface IMCAStandard {
  code: string;
  name: string;
  description: string;
}

export const IMCA_STANDARDS: IMCAStandard[] = [
  {
    code: "IMCA M103",
    name: "Guidelines for Design and Operation of DP Vessels",
    description: "Projeto, operação, redundância, CAM/TAM, tolerância a falhas, classificação DP1/2/3"
  },
  {
    code: "IMCA M117",
    name: "Training and Experience of Key DP Personnel",
    description: "Qualificação e experiência mínima para operadores, supervisores e técnicos DP"
  },
  {
    code: "IMCA M190",
    name: "DP Annual Trials Programmes",
    description: "Planejamento e execução de ensaios anuais DP, com testemunha independente"
  },
  {
    code: "IMCA M166",
    name: "Failure Modes and Effects Analysis (FMEA)",
    description: "Estrutura para análise de falhas e mitigação em sistemas DP"
  },
  {
    code: "IMCA M109",
    name: "DP-related Documentation",
    description: "Requisitos de documentação: logs, históricos de falhas, versionamento, relatórios"
  },
  {
    code: "IMCA M220",
    name: "Operational Activity Planning",
    description: "Planejamento operacional, análise de riscos ambientais e operacionais"
  },
  {
    code: "IMCA M140",
    name: "DP Capability Plots",
    description: "Gráficos de capacidade DP para diferentes condições ambientais"
  },
  {
    code: "MSF 182",
    name: "Safe Operation of DP Offshore Supply Vessels",
    description: "Operação segura de embarcações de suprimento offshore com DP"
  },
  {
    code: "MTS DP Operations",
    name: "Marine Technology Society DP Guidance",
    description: "Diretrizes da Sociedade de Tecnologia Marítima para operações DP"
  },
  {
    code: "IMO MSC.1/Circ.1580",
    name: "IMO Guidelines for DP Systems",
    description: "Diretrizes da Organização Marítima Internacional para sistemas DP"
  }
];

export type AuditModule =
  | "Sistema de Controle DP"
  | "Sistema de Propulsão"
  | "Sensores de Posicionamento"
  | "Rede e Comunicações"
  | "Pessoal DP"
  | "Logs e Históricos"
  | "FMEA"
  | "Testes Anuais"
  | "Documentação"
  | "Power Management System"
  | "Capability Plots"
  | "Planejamento Operacional";

export interface NonConformity {
  module: AuditModule;
  standard: string;
  description: string;
  riskLevel: RiskLevel;
  evidence?: string;
}

export interface CorrectiveAction {
  priority: PriorityLevel;
  description: string;
  deadline: string;
  responsible?: string;
}

export interface AuditBasicData {
  vesselName: string;
  dpClass: DPClass;
  location: string;
  auditObjective: string;
}

export interface AuditOperationalData {
  incidentDescription?: string;
  environmentalConditions?: string;
  systemStatus?: string;
  tamActivation?: boolean;
}

export interface AuditContext {
  summary: string;
  applicableStandards: string[];
}

export interface AuditReport {
  id?: string;
  user_id?: string;
  basicData: AuditBasicData;
  operationalData?: AuditOperationalData;
  context: AuditContext;
  nonConformities: NonConformity[];
  correctiveActions: CorrectiveAction[];
  generatedAt: string;
  status?: AuditStatus;
  score?: number;
}

export interface IMCAAuditGeneratorRequest {
  basicData: AuditBasicData;
  operationalData?: AuditOperationalData;
}

export interface IMCAAuditGeneratorResponse {
  success: boolean;
  audit?: AuditReport;
  error?: string;
}

export interface SavedAudit {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  status: AuditStatus;
  audit_date?: string;
  score?: number;
  findings: AuditReport;
  recommendations?: string[];
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}
