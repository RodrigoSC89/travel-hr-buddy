/**
 * IMCA DP Technical Audit System - Type Definitions
 * Comprehensive types for Dynamic Positioning vessel audits
 * Following IMCA, IMO, and MTS international standards
 */

export type DPClass = "DP1" | "DP2" | "DP3";

export type RiskLevel = "Alto" | "Médio" | "Baixo";

export type Priority = "Crítico" | "Alto" | "Médio" | "Baixo";

export interface NonConformity {
  module: string;
  description: string;
  standard: string;
  riskLevel: RiskLevel;
  recommendation: string;
}

export interface ActionItem {
  priority: Priority;
  description: string;
  responsible: string;
  deadline: Date;
  status: "pending" | "in_progress" | "completed";
}

export interface ModuleEvaluation {
  name: string;
  score: number;
  observations: string;
  nonConformities: NonConformity[];
}

export interface StandardCompliance {
  standard: string;
  description: string;
  compliant: boolean;
  observations: string;
}

export interface OperationalData {
  incidentDetails?: string;
  environmentalConditions?: string;
  systemStatus?: string;
}

export interface IMCAAuditRequest {
  vesselName: string;
  dpClass: DPClass;
  location: string;
  auditObjective: string;
  operationalData?: OperationalData;
}

export interface IMCAAuditResult {
  id?: string;
  vesselName: string;
  dpClass: DPClass;
  location: string;
  auditObjective: string;
  auditDate: Date;
  overallScore: number;
  standards: StandardCompliance[];
  modules: ModuleEvaluation[];
  nonConformities: NonConformity[];
  actionPlan: ActionItem[];
  summary: string;
  userId?: string;
}

/**
 * International standards for DP operations
 */
export const IMCA_STANDARDS = [
  "IMCA M103 - Guidelines for the Design and Operation of Dynamically Positioned Vessels",
  "IMCA M117 - The Training and Experience of Key DP Personnel",
  "IMCA M190 - Guidance on Failure Modes and Effects Analyses (FMEAs)",
  "IMCA M166 - Guidance on Simultaneous Operations (SIMOPs)",
  "IMCA M109 - International Guidelines for the Safe Operation of Dynamically Positioned Offshore Supply Vessels",
  "IMCA M220 - Guidance on DP Electrical Power and Control Systems",
  "IMCA M140 - Specification for DP Capability Plots",
  "MSF 182 - Code of Practice for the Safe Operation of Dynamically Positioned Classed Surface Vessels",
  "MTS DP Operations Guidance",
  "IMO MSC.1/Circ.1580 - Guidelines for Vessels with Dynamic Positioning Systems",
];

/**
 * DP System modules to evaluate
 */
export const DP_MODULES = [
  "Sistema de Controle DP",
  "Sistema de Propulsão",
  "Geração de Energia",
  "Sensores de Referência",
  "Sistema de Comunicação",
  "Capacitação de Pessoal",
  "FMEA Atualizado",
  "Provas Anuais",
  "Documentação Técnica",
  "Sistema de PMS",
  "Capability Plots",
  "Planejamento Operacional",
];

/**
 * Get color for risk level display
 */
export function getRiskLevelColor(level: RiskLevel): string {
  const colors: Record<RiskLevel, string> = {
    Alto: "destructive",
    Médio: "warning",
    Baixo: "secondary",
  };
  return colors[level];
}

/**
 * Get color for priority level display
 */
export function getPriorityColor(priority: Priority): string {
  const colors: Record<Priority, string> = {
    Crítico: "destructive",
    Alto: "destructive",
    Médio: "warning",
    Baixo: "secondary",
  };
  return colors[priority];
}

/**
 * Calculate deadline from priority level
 * Uses UTC midnight to avoid timezone-related off-by-one errors
 * @param priority - Priority level
 * @returns Deadline date
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
 * Validate DP class
 */
export function isValidDPClass(dpClass: string): dpClass is DPClass {
  return ["DP1", "DP2", "DP3"].includes(dpClass);
}

/**
 * Export audit to Markdown format
 */
export function exportAuditToMarkdown(audit: IMCAAuditResult): string {
  const riskEmoji: Record<RiskLevel, string> = {
    Alto: "🔴",
    Médio: "🟡",
    Baixo: "⚪",
  };

  let markdown = `# Auditoria Técnica IMCA - ${audit.vesselName}\n\n`;
  markdown += `**Classe DP:** ${audit.dpClass}\n`;
  markdown += `**Local:** ${audit.location}\n`;
  markdown += `**Data:** ${audit.auditDate.toLocaleDateString("pt-BR")}\n`;
  markdown += `**Objetivo:** ${audit.auditObjective}\n`;
  markdown += `**Pontuação Geral:** ${audit.overallScore}/100\n\n`;

  markdown += `## Resumo Executivo\n\n${audit.summary}\n\n`;

  markdown += `## Conformidade com Normas\n\n`;
  audit.standards.forEach((std) => {
    const status = std.compliant ? "✅" : "❌";
    markdown += `${status} **${std.standard}**\n`;
    if (std.observations) {
      markdown += `   ${std.observations}\n`;
    }
    markdown += `\n`;
  });

  markdown += `## Avaliação dos Módulos\n\n`;
  audit.modules.forEach((module) => {
    markdown += `### ${module.name} - ${module.score}/10\n`;
    markdown += `${module.observations}\n\n`;
  });

  markdown += `## Não Conformidades\n\n`;
  audit.nonConformities.forEach((nc, index) => {
    markdown += `### ${index + 1}. ${nc.module} ${riskEmoji[nc.riskLevel]}\n`;
    markdown += `**Risco:** ${nc.riskLevel}\n`;
    markdown += `**Norma:** ${nc.standard}\n`;
    markdown += `**Descrição:** ${nc.description}\n`;
    markdown += `**Recomendação:** ${nc.recommendation}\n\n`;
  });

  markdown += `## Plano de Ação\n\n`;
  audit.actionPlan.forEach((action, index) => {
    markdown += `### ${index + 1}. ${action.description}\n`;
    markdown += `**Prioridade:** ${action.priority}\n`;
    markdown += `**Responsável:** ${action.responsible}\n`;
    markdown += `**Prazo:** ${action.deadline.toLocaleDateString("pt-BR")}\n`;
    markdown += `**Status:** ${action.status}\n\n`;
  });

  return markdown;
}
