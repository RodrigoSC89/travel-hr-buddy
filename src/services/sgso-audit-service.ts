import { supabase } from "@/integrations/supabase/client";

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
 * DB record type for audit items
 */
type AuditItemDBRecord = {
  id: string;
  requirement_number: number;
  requirement_title: string;
  compliance_status: string;
  evidence: string | null;
  comment: string | null;
};

/**
 * Submit a new SGSO audit with items
 */
export async function submitSGSOAudit(
  vesselId: string,
  auditorId: string,
  items: AuditItem[]
): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: audit, error: auditError } = await (supabase
    .from("sgso_audits") as any)
    .insert({
      vessel_id: vesselId,
      auditor_id: auditorId
    })
    .select()
    .single();

  if (auditError) {
    throw new Error(`Erro ao criar auditoria: ${auditError.message}`);
  }

  const itemsPayload = items.map(item => ({
    audit_id: audit.id,
    ...item
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: itemsError } = await (supabase
    .from("sgso_audit_items") as any)
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

  // Map DB records to typed SGSOAudit with proper type assertions
  return (audits || []).map(audit => ({
    id: audit.id,
    audit_date: audit.audit_date,
    auditor_id: audit.auditor_id,
    sgso_audit_items: (audit.sgso_audit_items as unknown as AuditItemDBRecord[] || []).map(item => ({
      requirement_number: item.requirement_number,
      requirement_title: item.requirement_title,
      compliance_status: item.compliance_status as AuditItem['compliance_status'],
      evidence: item.evidence || '',
      comment: item.comment || '',
    })),
  }));
}
