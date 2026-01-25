import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

/**
 * SGSO Audit Service - Refactored
 * Removed @ts-ignore suppressions, using proper Supabase types
 */

// Type aliases from Supabase schema
type SGSOAuditRow = Database['public']['Tables']['sgso_audits']['Row'];
type SGSOAuditInsert = Database['public']['Tables']['sgso_audits']['Insert'];
type SGSOAuditItemRow = Database['public']['Tables']['sgso_audit_items']['Row'];
type SGSOAuditItemInsert = Database['public']['Tables']['sgso_audit_items']['Insert'];

/**
 * SGSO Audit Item representing a single requirement in an audit
 */
export type AuditItem = {
  requirement_number: number;
  requirement_title: string;
  compliance_status: "compliant" | "partial" | "non-compliant";
  evidence: string;
  comment: string;
};

/**
 * SGSO Audit Response with nested items
 */
export type SGSOAudit = {
  id: string;
  audit_date: string;
  auditor_id: string | null;
  sgso_audit_items: AuditItem[];
};

/**
 * Maps a database audit item row to the AuditItem type
 */
function mapAuditItem(item: SGSOAuditItemRow): AuditItem {
  return {
    requirement_number: item.requirement_number,
    requirement_title: item.requirement_title,
    compliance_status: item.compliance_status as AuditItem['compliance_status'],
    evidence: item.evidence ?? '',
    comment: item.comment ?? '',
  };
}

/**
 * Submit a new SGSO audit with items
 */
export async function submitSGSOAudit(
  vesselId: string,
  auditorId: string,
  items: AuditItem[]
): Promise<string> {
  const auditInsert: SGSOAuditInsert = {
    vessel_id: vesselId,
    auditor_id: auditorId,
    audit_date: new Date().toISOString(),
  };

  const { data: audit, error: auditError } = await supabase
    .from("sgso_audits")
    .insert(auditInsert)
    .select()
    .single();

  if (auditError) {
    throw new Error(`Erro ao criar auditoria: ${auditError.message}`);
  }

  const itemsPayload: SGSOAuditItemInsert[] = items.map(item => ({
    audit_id: audit.id,
    requirement_number: item.requirement_number,
    requirement_title: item.requirement_title,
    compliance_status: item.compliance_status,
    evidence: item.evidence,
    comment: item.comment,
  }));

  const { error: itemsError } = await supabase
    .from("sgso_audit_items")
    .insert(itemsPayload);

  if (itemsError) {
    throw new Error(`Erro ao salvar itens: ${itemsError.message}`);
  }

  return audit.id;
}

/**
 * Load SGSO audits for a specific vessel
 */
export async function loadSGSOAudit(vesselId: string): Promise<SGSOAudit[]> {
  const { data: audits, error } = await supabase
    .from("sgso_audits")
    .select(`
      id,
      audit_date,
      auditor_id,
      sgso_audit_items (
        id,
        requirement_number,
        requirement_title,
        compliance_status,
        evidence,
        comment
      )
    `)
    .eq("vessel_id", vesselId)
    .order("audit_date", { ascending: false });

  if (error) {
    throw new Error(`Erro ao carregar auditorias: ${error.message}`);
  }

  return (audits || []).map(audit => ({
    id: audit.id,
    audit_date: audit.audit_date,
    auditor_id: audit.auditor_id,
    sgso_audit_items: ((audit.sgso_audit_items as unknown as SGSOAuditItemRow[]) || [])
      .map(mapAuditItem),
  }));
}
