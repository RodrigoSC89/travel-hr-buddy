/**
 * IMCA DP Technical Audit Type Definitions
 * Following IMCA, IMO, and MTS international standards
 */

export type DPClass = "DP1" | "DP2" | "DP3";
export type OperationType = "navio" | "terra";
export type RiskLevel = "Alto" | "Médio" | "Baixo";
export type AuditStatus = "draft" | "completed" | "reviewed";

/**
 * IMCA/IMO/MTS Standards Catalog
 */
export interface IMCAStandard {
  code: string;
  name: string;
  description: string;
  category: "design" | "operation" | "training" | "testing" | "documentation" | "planning";
}

export const IMCA_STANDARDS: IMCAStandard[] = [
  {
    code: "IMCA M103",
    name: "Design & Operation",
    description: "Guidelines for the Design and Operation of Dynamically Positioned Vessels",
    category: "design"
  },
  {
    code: "IMCA M117",
    name: "Personnel Training",
    description: "Code of Practice for the Training and Experience of Key DP Personnel",
    category: "training"
  },
  {
    code: "IMCA M190",
    name: "Annual Trials",
    description: "Code of Practice for Developing and Conducting DP Annual Trials Programmes",
    category: "testing"
  },
  {
    code: "IMCA M166",
    name: "FMEA",
    description: "Code of Practice on Failure Modes and Effects Analysis",
    category: "design"
  },
  {
    code: "IMCA M109",
    name: "Documentation",
    description: "Guide to DP-related Documentation",
    category: "documentation"
  },
  {
    code: "IMCA M220",
    name: "Operations Planning",
    description: "Guidance on Operational Activity Planning",
    category: "planning"
  },
  {
    code: "IMCA M140",
    name: "Capability Plots",
    description: "Specification for DP Capability Plots",
    category: "design"
  },
  {
    code: "MSF 182",
    name: "OSV Operations",
    description: "International Guidelines for the Safe Operation of Dynamically Positioned Offshore Supply Vessels",
    category: "operation"
  },
  {
    code: "MTS DP Operations",
    name: "Guidance",
    description: "DP Operations Guidance (Marine Technology Society)",
    category: "operation"
  },
  {
    code: "IMO MSC.1/Circ.1580",
    name: "Regulations",
    description: "Guidelines for Vessels with Dynamic Positioning Systems",
    category: "design"
  }
];

/**
 * Audit modules to be evaluated
 */
export const AUDIT_MODULES = [
  "Sistema de Controle DP",
  "Sistema de Propulsão",
  "Sensores de Posicionamento",
  "Rede e Comunicações",
  "Pessoal DP",
  "Logs e Históricos",
  "FMEA",
  "Testes Anuais",
  "Documentação",
  "Power Management System",
  "Capability Plots",
  "Planejamento Operacional"
] as const;

export type AuditModule = typeof AUDIT_MODULES[number];

/**
 * Non-conformity found during audit
 */
export interface NonConformity {
  module: AuditModule;
  standard: string;
  description: string;
  riskLevel: RiskLevel;
  probableCauses: string[];
  correctiveAction: string;
  verificationRequirements: string;
}

/**
 * Action plan item with prioritization
 */
export interface ActionPlanItem {
  priority: "Crítico" | "Alto" | "Médio" | "Baixo";
  action: string;
  recommendedDeadline: string;
  responsibleParty: string;
  verificationMethod: string;
}

/**
 * Basic vessel/operation data
 */
export interface AuditBasicData {
  vesselName: string;
  operationType: OperationType;
  location: string;
  dpClass: DPClass;
  auditObjective: string;
  auditDate: string;
}

/**
 * Operational data from incident or operation
 */
export interface AuditOperationalData {
  incidentDescription?: string;
  environmentalConditions?: string;
  systemStatus?: string;
  operatorActions?: string;
  tamActivation?: boolean;
  logCompleteness?: string;
  additionalNotes?: string;
}

/**
 * Complete audit report structure
 */
export interface IMCAAuditReport {
  id?: string;
  basicData: AuditBasicData;
  operationalData?: AuditOperationalData;
  context: string;
  modulesAudited: AuditModule[];
  standardsApplied: string[];
  nonConformities: NonConformity[];
  actionPlan: ActionPlanItem[];
  summary: string;
  recommendations: string;
  status: AuditStatus;
  generatedAt: string;
  generatedBy?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

/**
 * Audit generation request
 */
export interface AuditGenerationRequest {
  basicData: AuditBasicData;
  operationalData?: AuditOperationalData;
  includeAllModules?: boolean;
  specificModules?: AuditModule[];
}

/**
 * Audit statistics for dashboard
 */
export interface AuditStatistics {
  totalAudits: number;
  auditsByDPClass: Record<DPClass, number>;
  auditsByStatus: Record<AuditStatus, number>;
  averageNonConformities: number;
  criticalIssues: number;
}
