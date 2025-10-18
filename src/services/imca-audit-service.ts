import { supabase } from "@/integrations/supabase/client";
import type { IMCAAuditReport, IMCAAuditInput } from "@/types/imca-audit";

/**
 * Generate a new IMCA audit report using AI
 */
export async function generateIMCAAudit(
  input: IMCAAuditInput
): Promise<IMCAAuditReport> {
  try {
    const { data, error } = await supabase.functions.invoke(
      "imca-audit-generator",
      {
        body: input,
      }
    );

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error generating IMCA audit:", error);
    throw error;
  }
}

/**
 * Save audit report to database
 */
export async function saveAudit(report: IMCAAuditReport): Promise<string> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("auditorias_imca")
      .insert({
        user_id: user.id,
        vessel_name: report.vesselName,
        dp_class: report.dpClass,
        location: report.location,
        audit_objective: report.auditObjective,
        audit_date: report.auditDate.toISOString(),
        overall_score: report.overallScore,
        report_data: report,
      })
      .select()
      .single();

    if (error) throw error;
    return data.id;
  } catch (error) {
    console.error("Error saving audit:", error);
    throw error;
  }
}

/**
 * Get all audits for current user
 */
export async function getAudits(): Promise<IMCAAuditReport[]> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("auditorias_imca")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return (data || []).map((row) => ({
      ...(row.report_data as IMCAAuditReport),
      id: row.id,
    }));
  } catch (error) {
    console.error("Error fetching audits:", error);
    throw error;
  }
}

/**
 * Get a single audit by ID
 */
export async function getAudit(id: string): Promise<IMCAAuditReport | null> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("auditorias_imca")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error) throw error;

    return {
      ...(data.report_data as IMCAAuditReport),
      id: data.id,
    };
  } catch (error) {
    console.error("Error fetching audit:", error);
    return null;
  }
}

/**
 * Update an existing audit
 */
export async function updateAudit(
  id: string,
  report: Partial<IMCAAuditReport>
): Promise<boolean> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("User not authenticated");

    const { error } = await supabase
      .from("auditorias_imca")
      .update({
        report_data: report,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error updating audit:", error);
    return false;
  }
}

/**
 * Delete an audit
 */
export async function deleteAudit(id: string): Promise<boolean> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("User not authenticated");

    const { error } = await supabase
      .from("auditorias_imca")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting audit:", error);
    return false;
  }
}

/**
 * Export audit as Markdown
 */
export async function exportAuditMarkdown(
  report: IMCAAuditReport
): Promise<Blob> {
  const { formatAuditAsMarkdown } = await import("@/types/imca-audit");
  const markdown = formatAuditAsMarkdown(report);
  return new Blob([markdown], { type: "text/markdown" });
}

/**
 * Download audit as Markdown file
 */
export function downloadAuditMarkdown(
  report: IMCAAuditReport,
  filename?: string
): void {
  import("@/types/imca-audit").then(({ formatAuditAsMarkdown }) => {
    const markdown = formatAuditAsMarkdown(report);
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename || `IMCA_Audit_${report.vesselName}_${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
}
