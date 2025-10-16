/**
 * IMCA Audit Service
 * Service layer for managing IMCA DP Technical Audits
 */

import { supabase } from "@/integrations/supabase/client";
import {
  IMCAAuditRequest,
  IMCAAuditReport,
  IMCAAuditRecord,
  AuditStatus,
  formatAuditForExport
} from "@/types/imca-audit";

/**
 * Generate a new IMCA audit report using AI
 */
export const generateIMCAAudit = async (
  request: IMCAAuditRequest
): Promise<IMCAAuditReport> => {
  try {
    const { data, error } = await supabase.functions.invoke("imca-audit-generator", {
      body: request
    });

    if (error) {
      console.error("Error generating audit:", error);
      throw new Error(error.message || "Failed to generate audit");
    }

    if (!data || !data.audit) {
      throw new Error("Invalid response from audit generator");
    }

    return data.audit as IMCAAuditReport;
  } catch (error) {
    console.error("Unexpected error generating audit:", error);
    throw error;
  }
};

/**
 * Save an audit report to the database
 */
export const saveIMCAAudit = async (
  audit: IMCAAuditReport,
  status: AuditStatus = "draft"
): Promise<IMCAAuditRecord> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("User not authenticated");
    }

    const record = {
      user_id: user.id,
      title: `${audit.vesselName} - ${audit.dpClass} - ${audit.auditDate}`,
      description: audit.auditObjective,
      status: status,
      audit_date: audit.auditDate,
      score: audit.overallScore,
      findings: audit,
      recommendations: audit.recommendations,
      metadata: {
        vesselName: audit.vesselName,
        dpClass: audit.dpClass,
        location: audit.location
      }
    };

    const { data, error } = await supabase
      .from("auditorias_imca")
      .insert(record)
      .select()
      .single();

    if (error) {
      console.error("Error saving audit:", error);
      throw new Error(error.message || "Failed to save audit");
    }

    return data as IMCAAuditRecord;
  } catch (error) {
    console.error("Unexpected error saving audit:", error);
    throw error;
  }
};

/**
 * Get all audits for the current user
 */
export const getIMCAAudits = async (): Promise<IMCAAuditRecord[]> => {
  try {
    const { data, error } = await supabase
      .from("auditorias_imca")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching audits:", error);
      throw new Error(error.message || "Failed to fetch audits");
    }

    return (data || []) as IMCAAuditRecord[];
  } catch (error) {
    console.error("Unexpected error fetching audits:", error);
    throw error;
  }
};

/**
 * Get a specific audit by ID
 */
export const getIMCAAuditById = async (id: string): Promise<IMCAAuditRecord> => {
  try {
    const { data, error } = await supabase
      .from("auditorias_imca")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching audit:", error);
      throw new Error(error.message || "Failed to fetch audit");
    }

    if (!data) {
      throw new Error("Audit not found");
    }

    return data as IMCAAuditRecord;
  } catch (error) {
    console.error("Unexpected error fetching audit:", error);
    throw error;
  }
};

/**
 * Update an existing audit
 */
export const updateIMCAAudit = async (
  id: string,
  updates: Partial<Omit<IMCAAuditRecord, "id" | "user_id" | "created_at">>
): Promise<IMCAAuditRecord> => {
  try {
    const { data, error } = await supabase
      .from("auditorias_imca")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating audit:", error);
      throw new Error(error.message || "Failed to update audit");
    }

    return data as IMCAAuditRecord;
  } catch (error) {
    console.error("Unexpected error updating audit:", error);
    throw error;
  }
};

/**
 * Delete an audit
 */
export const deleteIMCAAudit = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from("auditorias_imca")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting audit:", error);
      throw new Error(error.message || "Failed to delete audit");
    }
  } catch (error) {
    console.error("Unexpected error deleting audit:", error);
    throw error;
  }
};

/**
 * Export audit to Markdown format
 */
export const exportIMCAAudit = (audit: IMCAAuditReport): void => {
  const markdown = formatAuditForExport(audit);
  const blob = new Blob([markdown], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  link.download = `IMCA_Audit_${audit.vesselName}_${audit.auditDate}.md`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};
