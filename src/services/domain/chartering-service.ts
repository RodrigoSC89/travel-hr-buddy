/**
 * NAUTI ONE — Chartering Domain Service
 */

import { supabase } from "@/integrations/supabase/client";
import { publishEvent, logAuditEvent } from "@/lib/events/event-bus";

export const CharteringService = {
  async createCharterParty(cp: Record<string, unknown>) {
    const charterNumber = `CP-${Date.now().toString(36).toUpperCase()}`;
    const { data, error } = await (supabase.from as Function)('charter_parties').insert({
      ...cp,
      charter_number: charterNumber,
      status: 'negotiating',
    }).select().single();
    if (error) throw error;

    await publishEvent({
      type: 'finance.charter.created',
      payload: {
        charter_id: data.id,
        charter_number: charterNumber,
        charter_type: data.charter_type,
        charterer_name: data.charterer_name,
        vessel_id: data.vessel_id,
      },
      sourceEntityType: 'charter_party',
      sourceEntityId: data.id,
    });

    return data;
  },

  async updateStatus(id: string, status: string) {
    const { data, error } = await (supabase.from as Function)('charter_parties')
      .update({ status }).eq('id', id).select().single();
    if (error) throw error;

    await publishEvent({
      type: 'finance.charter.status_changed',
      payload: { charter_id: data.id, status, charter_type: data.charter_type },
      sourceEntityType: 'charter_party',
      sourceEntityId: data.id,
    });

    await logAuditEvent({
      entityType: 'charter_party', entityId: id,
      action: `charter.${status}`,
      diff: { status },
    });

    return data;
  },
};
