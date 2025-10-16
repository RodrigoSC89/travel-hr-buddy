/**
 * IMCA DP Technical Audit System - Type Definitions
 * Complete TypeScript types for IMCA audit data structures
 */

// Risk levels for non-conformities
export type RiskLevel = "Alto" | "Médio" | "Baixo";

// Priority levels for action items
export type PriorityLevel = "Crítico" | "Alto" | "Médio" | "Baixo";

// DP vessel classification
export type DPClass = "DP1" | "DP2" | "DP3";

// Audit status
export type AuditStatus = "draft" | "in_progress" | "completed" | "approved";

/**
 * Non-conformity identified during audit
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
 * Action item with prioritization and deadline
 */
export interface ActionItem {
  id: string;
  description: string;
  priority: PriorityLevel;
  responsible?: string;
  deadline: string;
  module: string;
}

/**
 * Evaluation result for a specific DP module
 */
export interface ModuleEvaluation {
  module: string;
  score: number;
  maxScore: number;
  status: "compliant" | "non-compliant" | "partial";
  observations: string;
  nonConformities: string[];
}

/**
 * International standards compliance
 */
export interface StandardCompliance {
  standard: string;
  description: string;
  compliant: boolean;
  observations: string;
}

/**
 * Complete audit report data structure
 */
export interface IMCAAuditReport {
  // Basic information
  id?: string;
  vesselName: string;
  dpClass: DPClass;
  location: string;
  auditDate: string;
  auditObjective: string;
  
  // Operational data (optional)
  incidentDetails?: string;
  environmentalConditions?: string;
  systemStatus?: string;
  
  // Results
  overallScore: number;
  maxScore: number;
  
  // Detailed evaluations
  moduleEvaluations: ModuleEvaluation[];
  nonConformities: NonConformity[];
  actionPlan: ActionItem[];
  standardsCompliance: StandardCompliance[];
  
  // Additional information
  summary: string;
  recommendations: string[];
  
  // Metadata
  generatedBy?: string;
  generatedAt: string;
  status: AuditStatus;
}

/**
 * Request payload for generating audit
 */
export interface IMCAAuditRequest {
  vesselName: string;
  dpClass: DPClass;
  location: string;
  auditObjective: string;
  incidentDetails?: string;
  environmentalConditions?: string;
  systemStatus?: string;
}

/**
 * Database record structure
 */
export interface IMCAAuditRecord {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  status: AuditStatus;
  audit_date?: string;
  score?: number;
  findings: IMCAAuditReport;
  recommendations?: string[];
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

/**
 * Standard DP modules evaluated in audits
 */
export const DP_MODULES = [
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

/**
 * International standards covered
 */
export const INTERNATIONAL_STANDARDS = [
  "IMCA M103 - Guidelines for Design and Operation of DP Vessels",
  "IMCA M117 - Training and Experience of Key DP Personnel",
  "IMCA M190 - DP Annual Trials Programmes",
  "IMCA M166 - Failure Modes and Effects Analysis",
  "IMCA M109 - DP-related Documentation",
  "IMCA M220 - Operational Activity Planning",
  "IMCA M140 - DP Capability Plots",
  "MSF 182 - Safe Operation of DP Offshore Supply Vessels",
  "MTS DP Operations - Marine Technology Society Guidance",
  "IMO MSC.1/Circ.1580 - IMO Guidelines for DP Systems"
] as const;

/**
 * Helper function to get risk level color
 */
export const getRiskLevelColor = (level: RiskLevel): string => {
  switch (level) {
    case "Alto":
      return "bg-red-500";
    case "Médio":
      return "bg-yellow-500";
    case "Baixo":
      return "bg-green-500";
    default:
      return "bg-gray-500";
  }
};

/**
 * Helper function to get priority level color
 */
export const getPriorityLevelColor = (level: PriorityLevel): string => {
  switch (level) {
    case "Crítico":
      return "bg-red-600";
    case "Alto":
      return "bg-orange-500";
    case "Médio":
      return "bg-blue-500";
    case "Baixo":
      return "bg-green-500";
    default:
      return "bg-gray-500";
  }
};

/**
 * Helper function to get deadline based on priority
 */
export const getDeadlineByPriority = (priority: PriorityLevel): string => {
  const now = new Date();
  let daysToAdd = 0;
  
  switch (priority) {
    case "Crítico":
      daysToAdd = 7;
      break;
    case "Alto":
      daysToAdd = 30;
      break;
    case "Médio":
      daysToAdd = 90;
      break;
    case "Baixo":
      daysToAdd = 180;
      break;
  }
  
  now.setDate(now.getDate() + daysToAdd);
  return now.toISOString().split('T')[0];
};

/**
 * Helper function to validate DP class
 */
export const isValidDPClass = (dpClass: string): dpClass is DPClass => {
  return ["DP1", "DP2", "DP3"].includes(dpClass);
};

/**
 * Helper function to format audit for export
 */
export const formatAuditForExport = (audit: IMCAAuditReport): string => {
  const lines: string[] = [];
  
  lines.push("# IMCA DP Technical Audit Report");
  lines.push("");
  lines.push(`**Vessel:** ${audit.vesselName}`);
  lines.push(`**DP Class:** ${audit.dpClass}`);
  lines.push(`**Location:** ${audit.location}`);
  lines.push(`**Audit Date:** ${audit.auditDate}`);
  lines.push(`**Objective:** ${audit.auditObjective}`);
  lines.push("");
  lines.push(`**Overall Score:** ${audit.overallScore}/${audit.maxScore}`);
  lines.push("");
  
  if (audit.incidentDetails) {
    lines.push("## Incident Details");
    lines.push(audit.incidentDetails);
    lines.push("");
  }
  
  lines.push("## Executive Summary");
  lines.push(audit.summary);
  lines.push("");
  
  lines.push("## Module Evaluations");
  audit.moduleEvaluations.forEach(module => {
    lines.push(`### ${module.module}`);
    lines.push(`**Score:** ${module.score}/${module.maxScore}`);
    lines.push(`**Status:** ${module.status}`);
    lines.push(`**Observations:** ${module.observations}`);
    lines.push("");
  });
  
  lines.push("## Non-Conformities");
  audit.nonConformities.forEach((nc, index) => {
    const riskIcon = nc.riskLevel === "Alto" ? "🔴" : 
                     nc.riskLevel === "Médio" ? "🟡" : "⚪";
    lines.push(`${index + 1}. ${riskIcon} **${nc.module}** (${nc.riskLevel})`);
    lines.push(`   - ${nc.description}`);
    lines.push(`   - Standard: ${nc.standard}`);
    lines.push(`   - Recommendation: ${nc.recommendation}`);
    lines.push("");
  });
  
  lines.push("## Action Plan");
  audit.actionPlan.forEach((action, index) => {
    lines.push(`${index + 1}. **${action.priority}** - ${action.description}`);
    lines.push(`   - Module: ${action.module}`);
    lines.push(`   - Deadline: ${action.deadline}`);
    if (action.responsible) {
      lines.push(`   - Responsible: ${action.responsible}`);
    }
    lines.push("");
  });
  
  lines.push("## Standards Compliance");
  audit.standardsCompliance.forEach(std => {
    const icon = std.compliant ? "✅" : "❌";
    lines.push(`${icon} **${std.standard}**`);
    lines.push(`   ${std.observations}`);
    lines.push("");
  });
  
  return lines.join("\n");
};
