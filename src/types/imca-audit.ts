// IMCA DP Technical Audit Types
// Following IMCA M103, M117, M190, M166, M109, M220, M140 and other international standards

export type DPClass = "DP1" | "DP2" | "DP3";

export type RiskLevel = "Alto" | "Médio" | "Baixo";

export type Priority = "Crítico" | "Alto" | "Médio" | "Baixo";

export interface StandardReference {
  code: string;
  name: string;
  description: string;
}

export interface ModuleEvaluation {
  moduleName: string;
  score: number; // 0-100
  findings: string[];
  recommendations: string[];
  complianceStatus: "Compliant" | "Partial" | "Non-Compliant";
}

export interface NonConformity {
  id: string;
  module: string;
  description: string;
  riskLevel: RiskLevel;
  standard: string;
  finding: string;
  recommendation: string;
}

export interface ActionItem {
  id: string;
  priority: Priority;
  description: string;
  responsibleParty: string;
  deadline: Date;
  relatedNonConformity: string;
}

export interface OperationalData {
  incidentDetails?: string;
  environmentalConditions?: string;
  systemStatus?: string;
  crewQualifications?: string;
  maintenanceHistory?: string;
}

export interface IMCAAuditInput {
  vesselName: string;
  dpClass: DPClass;
  location: string;
  auditObjective: string;
  operationalData?: OperationalData;
}

export interface IMCAAuditReport {
  id: string;
  vesselName: string;
  dpClass: DPClass;
  location: string;
  auditObjective: string;
  auditDate: Date;
  overallScore: number;
  standards: StandardReference[];
  moduleEvaluations: ModuleEvaluation[];
  nonConformities: NonConformity[];
  actionPlan: ActionItem[];
  operationalData?: OperationalData;
  summary: string;
  conclusion: string;
}

// Standard DP system modules to evaluate
export const DP_MODULES = [
  "DP Control System",
  "Propulsion System",
  "Power Generation System",
  "Position Reference Sensors",
  "Environmental Sensors",
  "Communications & Alarms",
  "Personnel Competence",
  "FMEA & Trials",
  "Annual DP Trials",
  "Documentation & Records",
  "Planned Maintenance System",
  "Capability Plots",
  "Operational Planning"
] as const;

// IMCA and international standards
export const IMCA_STANDARDS: StandardReference[] = [
  {
    code: "IMCA M103",
    name: "Guidelines for the Design and Operation of Dynamically Positioned Vessels",
    description: "Core DP vessel design and operational guidelines"
  },
  {
    code: "IMCA M117",
    name: "The Training and Experience of Key DP Personnel",
    description: "Personnel competency requirements for DP operations"
  },
  {
    code: "IMCA M190",
    name: "Guidance on Failure Modes and Effects Analyses (FMEAs)",
    description: "FMEA requirements and best practices"
  },
  {
    code: "IMCA M166",
    name: "Guidance on Simultaneous Operations (SIMOPS)",
    description: "Requirements for managing simultaneous DP operations"
  },
  {
    code: "IMCA M109",
    name: "Specification for DP Capability Plots",
    description: "Standards for DP capability plot generation and validation"
  },
  {
    code: "IMCA M220",
    name: "Guidance on DP Electrical Power and Control Systems",
    description: "Requirements for DP electrical systems"
  },
  {
    code: "IMCA M140",
    name: "Specification for DP Operations",
    description: "Operational procedures and best practices"
  },
  {
    code: "MSF 182",
    name: "Marine Safety Forum - DP Operations",
    description: "Industry best practices for DP operations"
  },
  {
    code: "MTS DP",
    name: "MTS DP Vessel Design Philosophy Guidelines",
    description: "Design philosophy and system architecture requirements"
  },
  {
    code: "IMO MSC.1/Circ.1580",
    name: "Guidelines for Vessels with Dynamic Positioning Systems",
    description: "IMO international requirements for DP vessels"
  }
];

// Helper functions

/**
 * Get deadline date from priority level with UTC midnight normalization
 * This ensures consistent, timezone-independent deadline calculations
 */
export function getDeadlineFromPriority(priority: Priority): Date {
  const daysMap: Record<Priority, number> = {
    Crítico: 7,
    Alto: 30,
    Médio: 90,
    Baixo: 180,
  };

  const days = daysMap[priority] ?? 30;

  // Use UTC midnight to avoid timezone offsets affecting day calculations
  const now = new Date();
  const utcMidnightToday = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate()
  );
  const utcMidnightDeadline = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + days
  );

  return new Date(utcMidnightDeadline);
}

/**
 * Get color for risk level display
 */
export function getRiskLevelColor(level: RiskLevel): string {
  const colorMap: Record<RiskLevel, string> = {
    Alto: "text-red-600",
    Médio: "text-yellow-600",
    Baixo: "text-gray-600",
  };
  return colorMap[level];
}

/**
 * Get badge color for priority level
 */
export function getPriorityColor(priority: Priority): string {
  const colorMap: Record<Priority, string> = {
    Crítico: "bg-red-600",
    Alto: "bg-orange-600",
    Médio: "bg-yellow-600",
    Baixo: "bg-blue-600",
  };
  return colorMap[priority];
}

/**
 * Format audit report as Markdown for export
 */
export function formatAuditAsMarkdown(report: IMCAAuditReport): string {
  const sections: string[] = [];

  // Header
  sections.push(`# IMCA DP Technical Audit Report`);
  sections.push(`\n## Vessel Information`);
  sections.push(`- **Vessel**: ${report.vesselName}`);
  sections.push(`- **DP Class**: ${report.dpClass}`);
  sections.push(`- **Location**: ${report.location}`);
  sections.push(`- **Audit Date**: ${report.auditDate.toLocaleDateString('pt-BR')}`);
  sections.push(`- **Overall Score**: ${report.overallScore}/100`);
  sections.push(`\n## Audit Objective`);
  sections.push(report.auditObjective);

  // Standards
  sections.push(`\n## Standards Applied`);
  report.standards.forEach((std) => {
    sections.push(`- **${std.code}**: ${std.name}`);
  });

  // Module Evaluations
  sections.push(`\n## Module Evaluations`);
  report.moduleEvaluations.forEach((mod) => {
    sections.push(`\n### ${mod.moduleName} (${mod.score}/100)`);
    sections.push(`**Status**: ${mod.complianceStatus}`);
    if (mod.findings.length > 0) {
      sections.push(`\n**Findings**:`);
      mod.findings.forEach((f) => sections.push(`- ${f}`));
    }
    if (mod.recommendations.length > 0) {
      sections.push(`\n**Recommendations**:`);
      mod.recommendations.forEach((r) => sections.push(`- ${r}`));
    }
  });

  // Non-Conformities
  if (report.nonConformities.length > 0) {
    sections.push(`\n## Non-Conformities`);
    report.nonConformities.forEach((nc) => {
      const icon = nc.riskLevel === "Alto" ? "🔴" : nc.riskLevel === "Médio" ? "🟡" : "⚪";
      sections.push(`\n### ${icon} ${nc.module}`);
      sections.push(`**Risk Level**: ${nc.riskLevel}`);
      sections.push(`**Standard**: ${nc.standard}`);
      sections.push(`**Finding**: ${nc.finding}`);
      sections.push(`**Recommendation**: ${nc.recommendation}`);
    });
  }

  // Action Plan
  if (report.actionPlan.length > 0) {
    sections.push(`\n## Action Plan`);
    report.actionPlan.forEach((action, index) => {
      sections.push(`\n### ${index + 1}. ${action.description}`);
      sections.push(`- **Priority**: ${action.priority}`);
      sections.push(`- **Responsible**: ${action.responsibleParty}`);
      sections.push(`- **Deadline**: ${action.deadline.toLocaleDateString('pt-BR')}`);
    });
  }

  // Summary and Conclusion
  sections.push(`\n## Summary`);
  sections.push(report.summary);
  sections.push(`\n## Conclusion`);
  sections.push(report.conclusion);

  return sections.join('\n');
}

/**
 * Calculate days until deadline
 */
export function getDaysUntilDeadline(deadline: Date): number {
  const now = new Date();
  const diffTime = deadline.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Validate IMCA audit input
 */
export function validateAuditInput(input: IMCAAuditInput): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!input.vesselName || input.vesselName.trim().length === 0) {
    errors.push("Vessel name is required");
  }

  if (!input.dpClass) {
    errors.push("DP class is required");
  }

  if (!input.location || input.location.trim().length === 0) {
    errors.push("Location is required");
  }

  if (!input.auditObjective || input.auditObjective.trim().length === 0) {
    errors.push("Audit objective is required");
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
