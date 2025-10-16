/**
 * IMCA Audit Service
 * Handles audit generation, storage, and export
 */

import { supabase } from "@/integrations/supabase/client";
import type {
  IMCAAuditReport,
  AuditGenerationRequest,
  AuditStatistics
} from "@/types/imca-audit";
import { IMCA_STANDARDS } from "@/types/imca-audit";

/**
 * Generate a technical audit using AI
 */
export async function generateAudit(
  request: AuditGenerationRequest
): Promise<IMCAAuditReport> {
  try {
    const response = await supabase.functions.invoke("imca-audit-generator", {
      body: request
    });

    if (response.error) {
      throw new Error(response.error.message || "Failed to generate audit");
    }

    return response.data as IMCAAuditReport;
  } catch (error) {
    console.error("Error generating audit:", error);
    throw error;
  }
}

/**
 * Save audit to database
 */
export async function saveAudit(
  audit: IMCAAuditReport,
  userId?: string
): Promise<string> {
  try {
    const { data, error } = await supabase
      .from("imca_audits")
      .insert({
        vessel_name: audit.basicData.vesselName,
        operation_type: audit.basicData.operationType,
        location: audit.basicData.location,
        dp_class: audit.basicData.dpClass,
        audit_objective: audit.basicData.auditObjective,
        audit_date: audit.basicData.auditDate,
        audit_data: audit,
        status: audit.status,
        generated_by: userId,
        generated_at: new Date().toISOString()
      })
      .select("id")
      .single();

    if (error) throw error;

    return data.id;
  } catch (error) {
    console.error("Error saving audit:", error);
    throw error;
  }
}

/**
 * Load audit from database
 */
export async function loadAudit(auditId: string): Promise<IMCAAuditReport> {
  try {
    const { data, error } = await supabase
      .from("imca_audits")
      .select("*")
      .eq("id", auditId)
      .single();

    if (error) throw error;

    return data.audit_data as IMCAAuditReport;
  } catch (error) {
    console.error("Error loading audit:", error);
    throw error;
  }
}

/**
 * List all audits for current user
 */
export async function listAudits(
  limit = 50,
  offset = 0
): Promise<IMCAAuditReport[]> {
  try {
    const { data, error } = await supabase
      .from("imca_audits")
      .select("audit_data")
      .order("generated_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return (data || []).map(row => row.audit_data as IMCAAuditReport);
  } catch (error) {
    console.error("Error listing audits:", error);
    throw error;
  }
}

/**
 * Get audit statistics
 */
export async function getAuditStatistics(): Promise<AuditStatistics> {
  try {
    const { data, error } = await supabase
      .from("imca_audit_statistics")
      .select("*")
      .single();

    if (error) throw error;

    return data as AuditStatistics;
  } catch (error) {
    console.error("Error fetching statistics:", error);
    return {
      totalAudits: 0,
      auditsByDPClass: { DP1: 0, DP2: 0, DP3: 0 },
      auditsByStatus: { draft: 0, completed: 0, reviewed: 0 },
      averageNonConformities: 0,
      criticalIssues: 0
    };
  }
}

/**
 * Export audit to Markdown format
 */
export function exportAuditToMarkdown(audit: IMCAAuditReport): string {
  const { basicData, operationalData, nonConformities, actionPlan } = audit;

  let markdown = `# Auditoria Técnica IMCA - ${basicData.vesselName}\n\n`;
  
  // Basic Information
  markdown += "## Informações Básicas\n\n";
  markdown += `- **Embarcação/Operação:** ${basicData.vesselName}\n`;
  markdown += `- **Tipo:** ${operationalData ? "Navio" : "Terra"}\n`;
  markdown += `- **Localização:** ${basicData.location}\n`;
  markdown += `- **Classe DP:** ${basicData.dpClass}\n`;
  markdown += `- **Data da Auditoria:** ${basicData.auditDate}\n`;
  markdown += `- **Objetivo:** ${basicData.auditObjective}\n\n`;

  // Operational Data (if present)
  if (operationalData?.incidentDescription) {
    markdown += "## Dados Operacionais\n\n";
    markdown += `**Descrição do Incidente:**\n${operationalData.incidentDescription}\n\n`;
    if (operationalData.environmentalConditions) {
      markdown += `**Condições Ambientais:**\n${operationalData.environmentalConditions}\n\n`;
    }
    if (operationalData.systemStatus) {
      markdown += `**Status do Sistema:**\n${operationalData.systemStatus}\n\n`;
    }
    if (operationalData.operatorActions) {
      markdown += `**Ações do Operador:**\n${operationalData.operatorActions}\n\n`;
    }
    if (operationalData.tamActivation !== undefined) {
      markdown += `**TAM Ativado:** ${operationalData.tamActivation ? "Sim" : "Não"}\n\n`;
    }
  }

  // Context
  markdown += "## Contexto da Auditoria\n\n";
  markdown += `${audit.context}\n\n`;

  // Standards Applied
  markdown += "## Normas Aplicadas\n\n";
  audit.standardsApplied.forEach(std => {
    const standard = IMCA_STANDARDS.find(s => s.code === std);
    if (standard) {
      markdown += `- **${standard.code}** - ${standard.name}: ${standard.description}\n`;
    }
  });
  markdown += "\n";

  // Modules Audited
  markdown += "## Módulos Auditados\n\n";
  audit.modulesAudited.forEach(module => {
    markdown += `- ${module}\n`;
  });
  markdown += "\n";

  // Non-conformities
  markdown += "## Não-Conformidades Identificadas\n\n";
  nonConformities.forEach((nc, index) => {
    markdown += `### ${index + 1}. ${nc.module}\n\n`;
    markdown += `**Norma:** ${nc.standard}\n\n`;
    markdown += `**Nível de Risco:** ${nc.riskLevel}\n\n`;
    markdown += `**Descrição:**\n${nc.description}\n\n`;
    markdown += "**Causas Prováveis:**\n";
    nc.probableCauses.forEach(cause => {
      markdown += `- ${cause}\n`;
    });
    markdown += "\n";
    markdown += `**Ação Corretiva:**\n${nc.correctiveAction}\n\n`;
    markdown += `**Requisitos de Verificação:**\n${nc.verificationRequirements}\n\n`;
    markdown += "---\n\n";
  });

  // Action Plan
  markdown += "## Plano de Ação Priorizado\n\n";
  actionPlan.forEach((item, index) => {
    markdown += `### ${index + 1}. [${item.priority}] ${item.action}\n\n`;
    markdown += `- **Prazo Recomendado:** ${item.recommendedDeadline}\n`;
    markdown += `- **Responsável:** ${item.responsibleParty}\n`;
    markdown += `- **Método de Verificação:** ${item.verificationMethod}\n\n`;
  });

  // Summary
  markdown += "## Resumo\n\n";
  markdown += `${audit.summary}\n\n`;

  // Recommendations
  markdown += "## Recomendações\n\n";
  markdown += `${audit.recommendations}\n\n`;

  // Footer
  markdown += "---\n\n";
  markdown += `*Relatório gerado em: ${audit.generatedAt}*\n`;
  if (audit.generatedBy) {
    markdown += `*Gerado por: ${audit.generatedBy}*\n`;
  }

  return markdown;
}

/**
 * Download audit as Markdown file
 */
export function downloadAuditMarkdown(audit: IMCAAuditReport): void {
  const markdown = exportAuditToMarkdown(audit);
  const blob = new Blob([markdown], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `auditoria-imca-${audit.basicData.vesselName.replace(/\s+/g, "-").toLowerCase()}-${new Date().toISOString().split("T")[0]}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
