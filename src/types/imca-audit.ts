/**
 * IMCA Technical Audit Types
 * For Dynamic Positioning (DP) vessel auditing following IMCA, IMO, and MTS standards
 */

export type RiskLevel = "Alto" | "Médio" | "Baixo";
export type AuditStatus = "Pendente" | "Em Andamento" | "Concluído" | "Revisão";
export type DPClass = "DP1" | "DP2" | "DP3";
export type OperationType = "Navio" | "Terra";

/**
 * IMCA Standards reference
 */
export interface IMCAStandard {
  code: string;
  title: string;
  description: string;
  category: string;
}

/**
 * Non-conformity identified during audit
 */
export interface NonConformity {
  id: string;
  module: string;
  description: string;
  standardReference: string[];
  riskLevel: RiskLevel;
  probableCauses: string[];
  correctiveActions: string[];
  deadline?: string;
  responsible?: string;
  status?: "Aberto" | "Em Tratamento" | "Resolvido";
}

/**
 * Module being audited
 */
export interface AuditModule {
  name: string;
  description: string;
  compliant: boolean;
  findings: string[];
  nonConformities: NonConformity[];
  recommendations: string[];
}

/**
 * Main Audit Report structure
 */
export interface IMCAAuditReport {
  id: string;
  vesselName: string;
  operationType: OperationType;
  location: string;
  dpClass: DPClass;
  auditDate: string;
  auditor: string;
  objective: string;
  status: AuditStatus;
  
  // Context and operational data
  operationalContext?: {
    weatherConditions?: string;
    operationDescription?: string;
    crewStatus?: string;
    incidentDescription?: string;
  };
  
  // Modules audited
  modules: AuditModule[];
  
  // Overall assessment
  overallCompliance: number; // percentage
  criticalIssues: number;
  totalNonConformities: number;
  
  // Action plan
  actionPlan: {
    criticalItems: NonConformity[];
    prioritizedActions: {
      priority: "Crítica" | "Alta" | "Média" | "Baixa";
      action: string;
      deadline: string;
      verification: string;
    }[];
  };
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  generatedBy?: "AI" | "Manual";
}

/**
 * Audit generation request
 */
export interface AuditGenerationRequest {
  vesselName: string;
  operationType: OperationType;
  location: string;
  dpClass: DPClass;
  objective: string;
  
  // Optional operational data for context
  operationalData?: {
    incidentDescription?: string;
    weatherConditions?: string;
    crewInformation?: string;
    systemStatus?: string;
    sensorData?: string;
    logData?: string;
  };
  
  // Standards to focus on
  focusStandards?: string[];
}

/**
 * IMCA Standards catalog
 */
export const IMCA_STANDARDS: IMCAStandard[] = [
  {
    code: "IMCA M103",
    title: "Guidelines for the Design and Operation of Dynamically Positioned Vessels",
    description: "Projeto, operação, redundância, CAM/TAM, tolerância a falhas, classificação DP1/2/3",
    category: "Design & Operation"
  },
  {
    code: "IMCA M117",
    title: "Code of Practice for the Training and Experience of Key DP Personnel",
    description: "Qualificação e experiência mínima para operadores, supervisores e técnicos DP",
    category: "Personnel & Training"
  },
  {
    code: "IMCA M190",
    title: "Code of Practice for Developing and Conducting DP Annual Trials Programmes",
    description: "Planejamento e execução de ensaios anuais DP, com testemunha independente",
    category: "Testing & Trials"
  },
  {
    code: "IMCA M166",
    title: "Code of Practice on Failure Modes and Effects Analysis (FMEA)",
    description: "Estrutura para análise de falhas e mitigação em sistemas DP",
    category: "Risk Analysis"
  },
  {
    code: "IMCA M109",
    title: "Guide to DP-related Documentation",
    description: "Requisitos de documentação: logs, históricos de falhas, versionamento, relatórios de ensaios",
    category: "Documentation"
  },
  {
    code: "IMCA M220",
    title: "Guidance on Operational Activity Planning",
    description: "Planejamento de operações com DP, incluindo atividades específicas e condições ambientais",
    category: "Operations Planning"
  },
  {
    code: "IMCA M140",
    title: "Specification for DP Capability Plots",
    description: "Geração e uso de gráficos de capacidade DP para avaliação de retenção de posição",
    category: "Technical Specifications"
  },
  {
    code: "MSF 182",
    title: "International Guidelines for the Safe Operation of Dynamically Positioned Offshore Supply Vessels",
    description: "Procedimentos operacionais seguros para embarcações OSV com DP",
    category: "OSV Operations"
  },
  {
    code: "MTS DP Operations",
    title: "DP Operations Guidance (Marine Technology Society)",
    description: "Práticas recomendadas para operação de embarcações DP, incluindo cenários e fallback modes",
    category: "Operations Guidance"
  },
  {
    code: "IMO MSC.1/Circ.1580",
    title: "Guidelines for Vessels with Dynamic Positioning Systems",
    description: "Requisitos técnicos para tolerância a falhas, classificação e operação de embarcações com DP",
    category: "IMO Regulations"
  }
];

/**
 * Standard audit modules
 */
export const STANDARD_AUDIT_MODULES = [
  "Sistema de Controle DP",
  "Sistema de Propulsão",
  "Sensores de Posicionamento",
  "Rede e Comunicações",
  "Pessoal DP",
  "Logs e Históricos",
  "FMEA",
  "Testes Anuais",
  "Documentação",
  "Power Management System (PMS)",
  "Capability Plots",
  "Operational Planning"
];
