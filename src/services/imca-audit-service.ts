/**
 * IMCA Audit Service
 * Service layer for IMCA DP Technical Audit operations
 * Handles CRUD operations, AI generation, and export functionality
 */

import { supabase } from "@/integrations/supabase/client";
import type {
  IMCAAuditInput,
  IMCAAuditReport,
  IMCAAuditRecord,
  DPClass,
} from "@/types/imca-audit";
import { formatAuditToMarkdown } from "@/types/imca-audit";

/**
 * Generate a new IMCA audit using AI
 * Calls the Supabase edge function to generate audit report
 */
export async function generateIMCAAudit(
  input: IMCAAuditInput
): Promise<IMCAAuditReport | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase.functions.invoke("imca-audit-generator", {
      body: input,
    });

    if (error) {
      console.error("Error generating IMCA audit:", error);
      throw error;
    }

    if (!data || !data.report) {
      throw new Error("No audit report generated");
    }

    return data.report as IMCAAuditReport;
  } catch (error) {
    console.error("Error in generateIMCAAudit:", error);
    return null;
  }
}

/**
 * Save an audit report to the database
 */
export async function saveIMCAAudit(
  report: IMCAAuditReport
): Promise<IMCAAuditRecord | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("User not authenticated");
    }

    const record: Partial<IMCAAuditRecord> = {
      user_id: user.id,
      title: `Auditoria IMCA ${report.dpClass} - ${report.vesselName}`,
      description: report.auditObjective,
      status: "completed",
      audit_date: report.auditDate,
      score: report.overallScore,
      findings: {
        moduleEvaluations: report.moduleEvaluations,
        nonConformities: report.nonConformities,
      },
      recommendations: report.actionPlan.map(action => action.description),
      metadata: report as any,
      navio: report.vesselName,
      norma: report.standardsEvaluated.join(", "),
      item_auditado: `Auditoria Técnica ${report.dpClass}`,
      comentarios: report.executiveSummary,
      resultado: report.overallScore >= 80 ? "Conforme" : 
                 report.overallScore >= 60 ? "Parcialmente Conforme" : 
                 "Não Conforme",
      data: report.auditDate,
    };

    const { data, error } = await supabase
      .from("auditorias_imca")
      .insert(record)
      .select()
      .single();

    if (error) {
      console.error("Error saving audit:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error in saveIMCAAudit:", error);
    return null;
  }
}

/**
 * Get a specific audit by ID
 */
export async function getIMCAAudit(id: string): Promise<IMCAAuditRecord | null> {
  try {
    const { data, error } = await supabase
      .from("auditorias_imca")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching audit:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in getIMCAAudit:", error);
    return null;
  }
}

/**
 * Get all audits for the current user
 */
export async function getIMCAAudits(): Promise<IMCAAuditRecord[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from("auditorias_imca")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching audits:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error in getIMCAAudits:", error);
    return [];
  }
}

/**
 * Update an existing audit
 */
export async function updateIMCAAudit(
  id: string,
  updates: Partial<IMCAAuditRecord>
): Promise<IMCAAuditRecord | null> {
  try {
    const { data, error } = await supabase
      .from("auditorias_imca")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating audit:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in updateIMCAAudit:", error);
    return null;
  }
}

/**
 * Delete an audit
 */
export async function deleteIMCAAudit(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("auditorias_imca")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting audit:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in deleteIMCAAudit:", error);
    return false;
  }
}

/**
 * Export audit report to Markdown
 */
export function exportAuditToMarkdown(report: IMCAAuditReport): string {
  return formatAuditToMarkdown(report);
}

/**
 * Download audit as Markdown file
 */
export function downloadAuditMarkdown(report: IMCAAuditReport): void {
  const markdown = exportAuditToMarkdown(report);
  const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `auditoria-imca-${report.vesselName}-${report.auditDate}.md`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
