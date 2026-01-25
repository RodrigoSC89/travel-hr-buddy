import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import type { Database } from "@/integrations/supabase/types";

/**
 * SGSO Audit Submission Service - Refactored
 * Removed all @ts-ignore and eslint-disable suppressions
 * Using proper Supabase types for type safety
 */

// Type aliases from Supabase schema
type SGSOAuditInsert = Database['public']['Tables']['sgso_audits']['Insert'];
type SGSOAuditItemInsert = Database['public']['Tables']['sgso_audit_items']['Insert'];

export interface SGSOAuditItem {
  requirement_number: number;
  requirement_title: string;
  compliance_status: string;
  evidence: string;
  comment: string;
}

/**
 * Submits SGSO audit data to Supabase
 * @param vesselId - ID of the vessel being audited
 * @param userId - ID of the user performing the audit
 * @param auditItems - Array of audit items
 * @returns Promise that resolves when submission is complete
 */
export async function submitSGSOAudit(
  vesselId: string,
  userId: string,
  auditItems: SGSOAuditItem[]
): Promise<void> {
  logger.info("Submitting SGSO audit", { vesselId, userId, itemCount: auditItems.length });

  // Create the audit record with proper typing
  const auditInsert: SGSOAuditInsert = {
    vessel_id: vesselId,
    auditor_id: userId,
    audit_date: new Date().toISOString(),
    status: "completed",
  };

  const { data: auditRecord, error: auditError } = await supabase
    .from("sgso_audits")
    .insert(auditInsert)
    .select()
    .single();

  if (auditError || !auditRecord) {
    const errorMessage = auditError?.message ?? "Unknown error";
    logger.error("Error creating SGSO audit record", { error: auditError });
    throw new Error(`Failed to create audit record: ${errorMessage}`);
  }

  // Insert all audit items with proper typing
  const itemsToInsert: SGSOAuditItemInsert[] = auditItems.map(item => ({
    audit_id: auditRecord.id,
    requirement_number: item.requirement_number,
    requirement_title: item.requirement_title,
    compliance_status: item.compliance_status,
    evidence: item.evidence,
    comment: item.comment,
  }));

  const { error: itemsError } = await supabase
    .from("sgso_audit_items")
    .insert(itemsToInsert);

  if (itemsError) {
    logger.error("Error inserting SGSO audit items", { error: itemsError });
    throw new Error(`Failed to insert audit items: ${itemsError.message}`);
  }

  logger.info("SGSO audit submitted successfully", { auditId: auditRecord.id });
}
