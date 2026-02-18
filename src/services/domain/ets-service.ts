/**
 * NAUTI ONE — ETS/Emissions Domain Service
 */

import { supabase } from "@/integrations/supabase/client";
import { publishEvent } from "@/lib/events/event-bus";

export const ETSService = {
  async createRecord(rec: Record<string, unknown>) {
    const { data, error } = await (supabase.from as Function)('eu_ets_tracking').insert({
      ...rec,
      status: 'calculated',
    }).select().single();
    if (error) throw error;

    await publishEvent({
      type: 'finance.ets.record_created',
      payload: {
        record_id: data.id,
        vessel_id: data.vessel_id,
        total_co2_mt: data.total_co2_mt,
        total_cost_eur: data.total_cost_eur,
        reporting_year: data.reporting_year,
      },
      sourceEntityType: 'expense',
      sourceEntityId: data.id,
    });

    return data;
  },
};
