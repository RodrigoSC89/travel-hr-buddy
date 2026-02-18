/**
 * NAUTI ONE — Compliance Domain Service
 */

import { supabase } from "@/integrations/supabase/client";
import { publishEvent } from "@/lib/events/event-bus";

export const ComplianceService = {
  async createFinding(finding: Record<string, unknown>) {
    const { data, error } = await (supabase.from as Function)('sire2_findings').insert(finding).select().single();
    if (error) throw error;

    await publishEvent({
      type: 'compliance.finding.created',
      payload: {
        finding_id: data.id,
        audit_id: data.inspection_id,
        vessel_id: data.vessel_id,
        severity: data.severity,
        category: data.category,
      },
      sourceEntityType: 'finding',
      sourceEntityId: data.id,
    });

    return data;
  },

  async closeFinding(id: string, resolution: Record<string, unknown>) {
    const { data, error } = await (supabase.from as Function)('sire2_findings')
      .update({ ...resolution, status: 'closed' })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;

    await publishEvent({
      type: 'compliance.finding.closed',
      payload: { finding_id: data.id, resolution },
      sourceEntityType: 'finding',
      sourceEntityId: data.id,
    });

    return data;
  },

  async checkExpiringCertificates(vesselId: string, daysAhead = 30) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    const { data, error } = await (supabase.from as Function)('crew_certifications')
      .select('*, crew_members(full_name, vessel_id)')
      .lte('expiry_date', futureDate.toISOString())
      .gte('expiry_date', new Date().toISOString())
      .order('expiry_date');

    if (error) throw error;
    return data ?? [];
  },
};
