/**
 * IMCA DP Technical Audit System - Type Definitions
 * Comprehensive type definitions for Dynamic Positioning vessel audits
 * following IMCA, IMO, and MTS international standards
 */

// DP Class Types
export type DPClass = "DP1" | "DP2" | "DP3";

// Risk Levels for Non-Conformities
export type RiskLevel = "Alto" | "Médio" | "Baixo";

// Priority Levels for Action Items
export type PriorityLevel = "Crítico" | "Alto" | "Médio" | "Baixo";

// International Standards Reference
export interface IMCAStandard {
  code: string;
  title: string;
  description: string;
}

// Complete list of IMCA, IMO, and MTS Standards
export const IMCA_STANDARDS: IMCAStandard[] = [
  { code: "IMCA M 103", title: "IMCA M 103", description: "Guidelines for DP Operations" },
  { code: "IMCA M 117", title: "IMCA M 117", description: "DP Vessel Design Philosophy Guidelines" },
  { code: "IMCA M 190", title: "IMCA M 190", description: "Guidance on Failure Modes & Effects Analyses (FMEAs)" },
  { code: "IMCA M 166", title: "IMCA M 166", description: "Guidance on DP Annual Trials Programmes" },
  { code: "IMCA M 109", title: "IMCA M 109", description: "Competence Assurance and Assessment" },
  { code: "IMCA M 220", title: "IMCA M 220", description: "Guidance on DP Related Incidents" },
  { code: "IMCA M 140", title: "IMCA M 140", description: "FMEA Management Guide" },
  { code: "MSF 182", title: "MSF 182", description: "Marine Safety Forum" },
  { code: "MTS DP Operations", title: "MTS DP Operations", description: "Marine Technology Society DP Guidelines" },
  { code: "IMO MSC.1/Circ.1580", title: "IMO MSC.1/Circ.1580", description: "Guidelines for vessels and units with dynamic positioning systems" }
];

// DP System Modules to be Evaluated
export interface DPModule {
  id: string;
  name: string;
  description: string;
}

export const DP_MODULES: DPModule[] = [
  { id: "control", name: "Sistemas de Controle DP", description: "Control systems and automation" },
  { id: "propulsion", name: "Propulsão e Thrusters", description: "Propulsion systems and thrusters" },
  { id: "power", name: "Geração de Energia", description: "Power generation and distribution" },
  { id: "sensors", name: "Sistemas de Referência", description: "Position reference sensors" },
  { id: "communications", name: "Comunicações", description: "Communication systems" },
  { id: "personnel", name: "Pessoal e Competências", description: "Personnel competence and training" },
  { id: "fmea", name: "FMEA", description: "Failure Modes and Effects Analysis" },
  { id: "trials", name: "Trials Anuais", description: "Annual DP trials" },
  { id: "documentation", name: "Documentação", description: "Technical documentation and manuals" },
  { id: "pms", name: "PMS", description: "Planned Maintenance System" },
  { id: "capability", name: "Capability Plots", description: "DP capability analysis" },
  { id: "planning", name: "Planejamento Operacional", description: "Operational planning and procedures" }
];

// Module Evaluation Result
export interface ModuleEvaluation {
  moduleId: string;
  moduleName: string;
  score: number; // 0-100
  findings: string;
  recommendations: string[];
}

// Non-Conformity Item
export interface NonConformity {
  id: string;
  standard: string;
  module: string;
  description: string;
  riskLevel: RiskLevel;
  evidence?: string;
}

// Corrective Action Item
export interface ActionItem {
  id: string;
  description: string;
  priority: PriorityLevel;
  deadline: string; // ISO date string
  responsible?: string;
  relatedNonConformity?: string;
}

// Basic Audit Input Data
export interface AuditBasicData {
  vesselName: string;
  dpClass: DPClass;
  location: string;
  auditObjective: string;
}

// Optional Operational Data
export interface AuditOperationalData {
  incidentDetails?: string;
  environmentalConditions?: string;
  systemStatus?: string;
  recentChanges?: string;
}

// Complete IMCA Audit Input
export interface IMCAAuditInput extends AuditBasicData {
  operationalData?: AuditOperationalData;
}

// AI-Generated Audit Report
export interface IMCAAuditReport {
  // Metadata
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  
  // Basic Information
  vesselName: string;
  dpClass: DPClass;
  location: string;
  auditDate: string;
  auditObjective: string;
  
  // Operational Context (optional)
  operationalData?: AuditOperationalData;
  
  // Overall Assessment
  overallScore: number; // 0-100
  executiveSummary: string;
  
  // Standards Compliance
  standardsEvaluated: string[];
  
  // Module Evaluations (12 modules)
  moduleEvaluations: ModuleEvaluation[];
  
  // Non-Conformities
  nonConformities: NonConformity[];
  
  // Action Plan
  actionPlan: ActionItem[];
  
  // Additional Findings
  observations?: string;
  strengths?: string[];
  weaknesses?: string[];
}

// Database Record Type
export interface IMCAAuditRecord {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  status: "draft" | "in_progress" | "completed" | "approved";
  audit_date?: string;
  score?: number;
  findings: Record<string, any>; // JSONB field
  recommendations?: string[];
  metadata: Record<string, any>; // JSONB field - stores full audit report
  created_at: string;
  updated_at: string;
  
  // Extended fields
  navio?: string;
  norma?: string;
  item_auditado?: string;
  comentarios?: string;
  resultado?: "Conforme" | "Não Conforme" | "Parcialmente Conforme" | "Não Aplicável";
  data?: string;
}

// Helper functions
export const getRiskLevelColor = (level: RiskLevel): string => {
  switch (level) {
    case "Alto":
      return "bg-red-500 text-white";
    case "Médio":
      return "bg-yellow-500 text-white";
    case "Baixo":
      return "bg-green-500 text-white";
    default:
      return "bg-gray-500 text-white";
  }
};

export const getPriorityLevelColor = (level: PriorityLevel): string => {
  switch (level) {
    case "Crítico":
      return "bg-red-600 text-white";
    case "Alto":
      return "bg-orange-500 text-white";
    case "Médio":
      return "bg-blue-500 text-white";
    case "Baixo":
      return "bg-gray-500 text-white";
    default:
      return "bg-gray-400 text-white";
  }
};

export const getDeadlineFromPriority = (priority: PriorityLevel): string => {
  const today = new Date();
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
  
  const deadline = new Date(today);
  deadline.setDate(deadline.getDate() + daysToAdd);
  return deadline.toISOString().split('T')[0];
};

// Validation helpers
export const isValidDPClass = (dpClass: string): dpClass is DPClass => {
  return ["DP1", "DP2", "DP3"].includes(dpClass);
};

export const validateAuditInput = (input: IMCAAuditInput): string[] => {
  const errors: string[] = [];
  
  if (!input.vesselName || input.vesselName.trim().length === 0) {
    errors.push("Nome da embarcação é obrigatório");
  }
  
  if (!input.dpClass || !isValidDPClass(input.dpClass)) {
    errors.push("Classe DP inválida (deve ser DP1, DP2 ou DP3)");
  }
  
  if (!input.location || input.location.trim().length === 0) {
    errors.push("Localização é obrigatória");
  }
  
  if (!input.auditObjective || input.auditObjective.trim().length === 0) {
    errors.push("Objetivo da auditoria é obrigatório");
  }
  
  return errors;
};

// Export formatting helper
export const formatAuditToMarkdown = (report: IMCAAuditReport): string => {
  let markdown = `# Auditoria Técnica IMCA DP\n\n`;
  markdown += `## Informações Básicas\n\n`;
  markdown += `- **Embarcação:** ${report.vesselName}\n`;
  markdown += `- **Classe DP:** ${report.dpClass}\n`;
  markdown += `- **Localização:** ${report.location}\n`;
  markdown += `- **Data da Auditoria:** ${report.auditDate}\n`;
  markdown += `- **Objetivo:** ${report.auditObjective}\n`;
  markdown += `- **Pontuação Geral:** ${report.overallScore}/100\n\n`;
  
  markdown += `## Resumo Executivo\n\n${report.executiveSummary}\n\n`;
  
  markdown += `## Normas Avaliadas\n\n`;
  report.standardsEvaluated.forEach(standard => {
    markdown += `- ${standard}\n`;
  });
  markdown += `\n`;
  
  markdown += `## Avaliação por Módulo\n\n`;
  report.moduleEvaluations.forEach(module => {
    markdown += `### ${module.moduleName} (${module.score}/100)\n\n`;
    markdown += `${module.findings}\n\n`;
    if (module.recommendations.length > 0) {
      markdown += `**Recomendações:**\n`;
      module.recommendations.forEach(rec => {
        markdown += `- ${rec}\n`;
      });
      markdown += `\n`;
    }
  });
  
  markdown += `## Não Conformidades\n\n`;
  report.nonConformities.forEach((nc, index) => {
    const riskEmoji = nc.riskLevel === "Alto" ? "🔴" : nc.riskLevel === "Médio" ? "🟡" : "⚪";
    markdown += `${index + 1}. ${riskEmoji} **${nc.standard}** - ${nc.module}\n`;
    markdown += `   - ${nc.description}\n`;
    if (nc.evidence) {
      markdown += `   - *Evidência:* ${nc.evidence}\n`;
    }
    markdown += `\n`;
  });
  
  markdown += `## Plano de Ação\n\n`;
  report.actionPlan.forEach((action, index) => {
    markdown += `${index + 1}. **[${action.priority}]** ${action.description}\n`;
    markdown += `   - *Prazo:* ${action.deadline}\n`;
    if (action.responsible) {
      markdown += `   - *Responsável:* ${action.responsible}\n`;
    }
    markdown += `\n`;
  });
  
  if (report.observations) {
    markdown += `## Observações Adicionais\n\n${report.observations}\n\n`;
  }
  
  return markdown;
};
