/**
 * NAUTI ONE — ISM Compliance Domain Service
 */

import { supabase } from "@/integrations/supabase/client";
import { publishEvent, logAuditEvent } from "@/lib/events/event-bus";

export const ISMService = {
  async runGapAnalysis(elementId: string, assessmentData: Record<string, unknown>) {
    const { data, error } = await (supabase.from as Function)('ism_gap_analysis').insert({
      element_id: elementId,
      ...assessmentData,
      last_assessed_at: new Date().toISOString(),
    }).select().single();
    if (error) throw error;

    await publishEvent({
      type: 'compliance.gap_analysis.completed',
      payload: {
        gap_id: data.id,
        element_id: elementId,
        compliance_score: data.compliance_score,
        status: data.status,
      },
      sourceEntityType: 'audit',
      sourceEntityId: data.id,
    });

    return data;
  },

  async createCAPA(capa: Record<string, unknown>) {
    const { data, error } = await (supabase.from as Function)('ism_capa').insert(capa).select().single();
    if (error) throw error;

    await publishEvent({
      type: 'compliance.capa.created',
      payload: { capa_id: data.id, element_id: data.element_id, severity: data.severity },
      sourceEntityType: 'capa',
      sourceEntityId: data.id,
    });

    return data;
  },

  async updateCAPAStatus(id: string, status: string) {
    const updates: Record<string, unknown> = { status };
    if (status === 'closed') updates.completion_date = new Date().toISOString().split('T')[0];

    const { data, error } = await (supabase.from as Function)('ism_capa')
      .update(updates).eq('id', id).select().single();
    if (error) throw error;

    if (status === 'closed') {
      await publishEvent({
        type: 'compliance.capa.closed',
        payload: { capa_id: data.id, element_id: data.element_id },
        sourceEntityType: 'capa',
        sourceEntityId: data.id,
      });
    }

    await logAuditEvent({
      entityType: 'capa', entityId: id,
      action: `capa.${status}`,
      diff: { status },
    });

    return data;
  },
};
