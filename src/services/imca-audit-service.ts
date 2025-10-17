/**
 * IMCA Audit Service Layer
 * Handles all interactions with the IMCA audit backend
 */

import { supabase } from "@/integrations/supabase/client";
import type { IMCAAuditRequest, IMCAAuditResult } from "@/types/imca-audit";
import { exportAuditToMarkdown } from "@/types/imca-audit";

/**
 * Generate a new IMCA audit using AI analysis
 */
export async function generateIMCAAudit(
  request: IMCAAuditRequest
): Promise<IMCAAuditResult> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("User not authenticated");
    }

    // Call the edge function to generate the audit
    const { data, error } = await supabase.functions.invoke(
      "imca-audit-generator",
      {
        body: request,
      }
    );

    if (error) {
      console.error("Error generating IMCA audit:", error);
      throw new Error(error.message || "Failed to generate audit");
    }

    if (!data) {
      throw new Error("No data returned from audit generation");
    }

    return {
      ...data,
      auditDate: new Date(data.auditDate),
      actionPlan: data.actionPlan.map((action: any) => ({
        ...action,
        deadline: new Date(action.deadline),
      })),
    };
  } catch (error) {
    console.error("Error in generateIMCAAudit:", error);
    throw error;
  }
}

/**
 * Save audit result to database
 */
export async function saveIMCAAudit(
  audit: IMCAAuditResult
): Promise<IMCAAuditResult> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
      .from("auditorias_imca")
      .insert({
        user_id: user.id,
        vessel_name: audit.vesselName,
        dp_class: audit.dpClass,
        location: audit.location,
        audit_objective: audit.auditObjective,
        audit_date: audit.auditDate.toISOString(),
        overall_score: audit.overallScore,
        audit_data: {
          standards: audit.standards,
          modules: audit.modules,
          nonConformities: audit.nonConformities,
          actionPlan: audit.actionPlan.map((action) => ({
            ...action,
            deadline: action.deadline.toISOString(),
          })),
          summary: audit.summary,
        },
      })
      .select()
      .single();

    if (error) {
      console.error("Error saving IMCA audit:", error);
      throw new Error(error.message || "Failed to save audit");
    }

    return {
      ...audit,
      id: data.id,
      userId: user.id,
    };
  } catch (error) {
    console.error("Error in saveIMCAAudit:", error);
    throw error;
  }
}

/**
 * Get all audits for current user
 */
export async function getIMCAAudits(): Promise<IMCAAuditResult[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
      .from("auditorias_imca")
      .select("*")
      .eq("user_id", user.id)
      .order("audit_date", { ascending: false });

    if (error) {
      console.error("Error fetching IMCA audits:", error);
      throw new Error(error.message || "Failed to fetch audits");
    }

    return (data || []).map((record) => ({
      id: record.id,
      vesselName: record.vessel_name,
      dpClass: record.dp_class,
      location: record.location,
      auditObjective: record.audit_objective,
      auditDate: new Date(record.audit_date),
      overallScore: record.overall_score,
      standards: record.audit_data.standards || [],
      modules: record.audit_data.modules || [],
      nonConformities: record.audit_data.nonConformities || [],
      actionPlan: (record.audit_data.actionPlan || []).map((action: any) => ({
        ...action,
        deadline: new Date(action.deadline),
      })),
      summary: record.audit_data.summary || "",
      userId: record.user_id,
    }));
  } catch (error) {
    console.error("Error in getIMCAAudits:", error);
    throw error;
  }
}

/**
 * Get a specific audit by ID
 */
export async function getIMCAAudit(id: string): Promise<IMCAAuditResult | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
      .from("auditorias_imca")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null; // Not found
      }
      console.error("Error fetching IMCA audit:", error);
      throw new Error(error.message || "Failed to fetch audit");
    }

    return {
      id: data.id,
      vesselName: data.vessel_name,
      dpClass: data.dp_class,
      location: data.location,
      auditObjective: data.audit_objective,
      auditDate: new Date(data.audit_date),
      overallScore: data.overall_score,
      standards: data.audit_data.standards || [],
      modules: data.audit_data.modules || [],
      nonConformities: data.audit_data.nonConformities || [],
      actionPlan: (data.audit_data.actionPlan || []).map((action: any) => ({
        ...action,
        deadline: new Date(action.deadline),
      })),
      summary: data.audit_data.summary || "",
      userId: data.user_id,
    };
  } catch (error) {
    console.error("Error in getIMCAAudit:", error);
    throw error;
  }
}

/**
 * Update an existing audit
 */
export async function updateIMCAAudit(
  id: string,
  audit: Partial<IMCAAuditResult>
): Promise<IMCAAuditResult | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("User not authenticated");
    }

    const updateData: any = {};
    
    if (audit.vesselName) updateData.vessel_name = audit.vesselName;
    if (audit.dpClass) updateData.dp_class = audit.dpClass;
    if (audit.location) updateData.location = audit.location;
    if (audit.auditObjective) updateData.audit_objective = audit.auditObjective;
    if (audit.overallScore !== undefined) updateData.overall_score = audit.overallScore;
    
    if (audit.standards || audit.modules || audit.nonConformities || audit.actionPlan || audit.summary) {
      updateData.audit_data = {};
      if (audit.standards) updateData.audit_data.standards = audit.standards;
      if (audit.modules) updateData.audit_data.modules = audit.modules;
      if (audit.nonConformities) updateData.audit_data.nonConformities = audit.nonConformities;
      if (audit.actionPlan) {
        updateData.audit_data.actionPlan = audit.actionPlan.map((action) => ({
          ...action,
          deadline: action.deadline.toISOString(),
        }));
      }
      if (audit.summary) updateData.audit_data.summary = audit.summary;
    }

    const { data, error } = await supabase
      .from("auditorias_imca")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating IMCA audit:", error);
      throw new Error(error.message || "Failed to update audit");
    }

    return {
      id: data.id,
      vesselName: data.vessel_name,
      dpClass: data.dp_class,
      location: data.location,
      auditObjective: data.audit_objective,
      auditDate: new Date(data.audit_date),
      overallScore: data.overall_score,
      standards: data.audit_data.standards || [],
      modules: data.audit_data.modules || [],
      nonConformities: data.audit_data.nonConformities || [],
      actionPlan: (data.audit_data.actionPlan || []).map((action: any) => ({
        ...action,
        deadline: new Date(action.deadline),
      })),
      summary: data.audit_data.summary || "",
      userId: data.user_id,
    };
  } catch (error) {
    console.error("Error in updateIMCAAudit:", error);
    throw error;
  }
}

/**
 * Delete an audit
 */
export async function deleteIMCAAudit(id: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("User not authenticated");
    }

    const { error } = await supabase
      .from("auditorias_imca")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error deleting IMCA audit:", error);
      throw new Error(error.message || "Failed to delete audit");
    }

    return true;
  } catch (error) {
    console.error("Error in deleteIMCAAudit:", error);
    return false;
  }
}

/**
 * Export audit as Markdown file
 */
export function exportIMCAAuditAsMarkdown(audit: IMCAAuditResult): void {
  try {
    const markdown = exportAuditToMarkdown(audit);
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `auditoria-imca-${audit.vesselName.replace(/\s+/g, "-")}-${audit.auditDate.toISOString().split("T")[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error exporting audit as Markdown:", error);
    throw error;
  }
}
