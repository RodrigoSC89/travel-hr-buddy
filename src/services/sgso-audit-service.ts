import { supabase } from "@/integrations/supabase/client";

/**
 * SGSO Audit Item representing a single requirement in an audit
 */
export type AuditItem = {
  requirement_number: number;
  requirement_title: string;
  compliance_status: 'compliant' | 'partial' | 'non-compliant';
  evidence: string;
  comment: string;
};

/**
 * SGSO Audit Response with nested items
 */
export type SGSOAudit = {
  id: string;
  audit_date: string;
  auditor_id: string;
  sgso_audit_items: AuditItem[];
};

/**
 * Submit a new SGSO audit with items
 * 
 * Creates a new audit record and associated audit items in a transactional manner.
 * Returns the ID of the created audit on success.
 * 
 * @param vesselId - UUID of the vessel being audited
 * @param auditorId - UUID of the auditor conducting the audit
 * @param items - Array of audit items with compliance data
 * @returns Promise<string> - ID of the created audit
 * @throws Error if audit creation or items insertion fails
 */
export async function submitSGSOAudit(
  vesselId: string,
  auditorId: string,
  items: AuditItem[]
): Promise<string> {
  const { data: audit, error: auditError } = await supabase
    .from('sgso_audits')
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

  const { error: itemsError } = await supabase
    .from('sgso_audit_items')
    .insert(itemsPayload);

  if (itemsError) {
    throw new Error(`Erro ao salvar itens: ${itemsError.message}`);
  }

  return audit.id;
}

/**
 * Load SGSO audits for a specific vessel
 * 
 * Retrieves all audits for a vessel with nested audit items,
 * ordered by audit date (newest first).
 * 
 * @param vesselId - UUID of the vessel
 * @returns Promise<SGSOAudit[]> - Array of audits with nested items
 * @throws Error if query fails
 */
export async function loadSGSOAudit(vesselId: string): Promise<SGSOAudit[]> {
  const { data: audits, error } = await supabase
    .from('sgso_audits')
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
    .eq('vessel_id', vesselId)
    .order('audit_date', { ascending: false });

  if (error) {
    throw new Error(`Erro ao carregar auditorias: ${error.message}`);
  }

  return audits as SGSOAudit[];
}
