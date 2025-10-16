// IMCA DP Technical Audit System Types
// Comprehensive type definitions for AI-powered DP vessel audits

/**
 * DP Class types according to IMCA standards
 */
export type DPClass = "DP1" | "DP2" | "DP3";

/**
 * Risk levels for non-conformities
 */
export type RiskLevel = "Alto" | "Médio" | "Baixo";

/**
 * Priority levels for action items
 */
export type PriorityLevel = "Crítico" | "Alto" | "Médio" | "Baixo";

/**
 * Audit status
 */
export type AuditStatus = "draft" | "in_progress" | "completed" | "approved";

/**
 * International standards covered by the audit
 */
export interface IMCAStandard {
  code: string;
  title: string;
  description: string;
}

/**
 * DP system modules evaluated in the audit
 */
export interface DPModule {
  name: string;
  description: string;
  score?: number;
  conformities?: string[];
  nonConformities?: string[];
}

/**
 * Non-conformity identified in the audit
 */
export interface NonConformity {
  id: string;
  module: string;
  description: string;
  standard: string;
  riskLevel: RiskLevel;
  evidence?: string;
  recommendation: string;
}

/**
 * Action item in the correction plan
 */
export interface ActionItem {
  id: string;
  description: string;
  priority: PriorityLevel;
  deadline: string;
  responsible?: string;
  relatedNonConformity?: string;
}

/**
 * Basic audit data input
 */
export interface AuditBasicData {
  vesselName: string;
  dpClass: DPClass;
  location: string;
  auditObjective: string;
}

/**
 * Operational data input (optional)
 */
export interface AuditOperationalData {
  incidentDetails?: string;
  environmentalConditions?: string;
  systemStatus?: string;
  operationalNotes?: string;
}

/**
 * Complete audit result from AI generation
 */
export interface AuditResult {
  id?: string;
  vesselName: string;
  dpClass: DPClass;
  location: string;
  auditDate: string;
  auditObjective: string;
  overallScore: number;
  standards: IMCAStandard[];
  modules: DPModule[];
  nonConformities: NonConformity[];
  actionPlan: ActionItem[];
  summary: string;
  recommendations: string[];
  generatedAt: string;
}

/**
 * Request payload for audit generation
 */
export interface GenerateAuditRequest {
  basicData: AuditBasicData;
  operationalData?: AuditOperationalData;
}

/**
 * Database record structure
 */
export interface AuditRecord {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: AuditStatus;
  audit_date: string | null;
  score: number | null;
  findings: AuditResult;
  recommendations: string[];
  metadata: {
    vesselName: string;
    dpClass: DPClass;
    location: string;
    generatedAt: string;
  };
  created_at: string;
  updated_at: string;
}

/**
 * The 10 international standards covered
 */
export const IMCA_STANDARDS: IMCAStandard[] = [
  {
    code: "IMCA M103",
    title: "Guidelines for Design and Operation of DP Vessels",
    description: "Core guidelines for DP system design and operational procedures"
  },
  {
    code: "IMCA M117",
    title: "Training and Experience of Key DP Personnel",
    description: "Requirements for DP operator qualifications and training"
  },
  {
    code: "IMCA M190",
    title: "DP Annual Trials Programmes",
    description: "Annual testing requirements for DP systems"
  },
  {
    code: "IMCA M166",
    title: "Failure Modes and Effects Analysis",
    description: "FMEA requirements for DP systems"
  },
  {
    code: "IMCA M109",
    title: "DP-related Documentation",
    description: "Documentation requirements for DP operations"
  },
  {
    code: "IMCA M220",
    title: "Operational Activity Planning",
    description: "Planning requirements for DP operations"
  },
  {
    code: "IMCA M140",
    title: "DP Capability Plots",
    description: "Requirements for DP capability analysis and plots"
  },
  {
    code: "MSF 182",
    title: "Safe Operation of DP Offshore Supply Vessels",
    description: "Safety requirements for DP OSV operations"
  },
  {
    code: "MTS DP Operations",
    title: "Marine Technology Society DP Guidance",
    description: "MTS guidelines for DP operations"
  },
  {
    code: "IMO MSC.1/Circ.1580",
    title: "IMO Guidelines for DP Systems",
    description: "International Maritime Organization DP guidelines"
  }
];

/**
 * The 12 critical DP system modules
 */
export const DP_MODULES: string[] = [
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
];

/**
 * Risk level colors for UI
 */
export const RISK_COLORS: Record<RiskLevel, string> = {
  "Alto": "text-red-500",
  "Médio": "text-yellow-500",
  "Baixo": "text-gray-500"
};

/**
 * Priority level colors for UI
 */
export const PRIORITY_COLORS: Record<PriorityLevel, string> = {
  "Crítico": "text-red-500",
  "Alto": "text-orange-500",
  "Médio": "text-yellow-500",
  "Baixo": "text-blue-500"
};

/**
 * Helper function to validate DP class
 */
export function isValidDPClass(value: string): value is DPClass {
  return ["DP1", "DP2", "DP3"].includes(value);
}

/**
 * Helper function to get risk level badge color
 */
export function getRiskLevelColor(level: RiskLevel): string {
  return RISK_COLORS[level] || "text-gray-500";
}

/**
 * Helper function to get priority level badge color
 */
export function getPriorityLevelColor(level: PriorityLevel): string {
  return PRIORITY_COLORS[level] || "text-gray-500";
}

/**
 * Helper function to format audit for export
 */
export function formatAuditForExport(audit: AuditResult): string {
  const lines: string[] = [];
  
  lines.push(`# Auditoria IMCA - ${audit.vesselName}`);
  lines.push(`\n## Dados Gerais`);
  lines.push(`- **Embarcação**: ${audit.vesselName}`);
  lines.push(`- **Classe DP**: ${audit.dpClass}`);
  lines.push(`- **Local**: ${audit.location}`);
  lines.push(`- **Data**: ${audit.auditDate}`);
  lines.push(`- **Objetivo**: ${audit.auditObjective}`);
  lines.push(`- **Pontuação Geral**: ${audit.overallScore}/100`);
  
  lines.push(`\n## Normas Avaliadas`);
  audit.standards.forEach(std => {
    lines.push(`- **${std.code}**: ${std.title}`);
  });
  
  lines.push(`\n## Módulos Avaliados`);
  audit.modules.forEach(mod => {
    lines.push(`\n### ${mod.name}`);
    if (mod.score !== undefined) {
      lines.push(`**Pontuação**: ${mod.score}/100`);
    }
    if (mod.conformities && mod.conformities.length > 0) {
      lines.push(`\n**Conformidades**:`);
      mod.conformities.forEach(c => lines.push(`- ${c}`));
    }
    if (mod.nonConformities && mod.nonConformities.length > 0) {
      lines.push(`\n**Não Conformidades**:`);
      mod.nonConformities.forEach(nc => lines.push(`- ${nc}`));
    }
  });
  
  lines.push(`\n## Não Conformidades`);
  audit.nonConformities.forEach((nc, index) => {
    lines.push(`\n### ${index + 1}. ${nc.description}`);
    lines.push(`- **Módulo**: ${nc.module}`);
    lines.push(`- **Norma**: ${nc.standard}`);
    lines.push(`- **Nível de Risco**: ${nc.riskLevel}`);
    lines.push(`- **Recomendação**: ${nc.recommendation}`);
  });
  
  lines.push(`\n## Plano de Ação`);
  audit.actionPlan.forEach((action, index) => {
    lines.push(`\n### ${index + 1}. ${action.description}`);
    lines.push(`- **Prioridade**: ${action.priority}`);
    lines.push(`- **Prazo**: ${action.deadline}`);
    if (action.responsible) {
      lines.push(`- **Responsável**: ${action.responsible}`);
    }
  });
  
  lines.push(`\n## Resumo`);
  lines.push(audit.summary);
  
  lines.push(`\n## Recomendações`);
  audit.recommendations.forEach(rec => {
    lines.push(`- ${rec}`);
  });
  
  lines.push(`\n---`);
  lines.push(`*Gerado em: ${audit.generatedAt}*`);
  
  return lines.join('\n');
}
