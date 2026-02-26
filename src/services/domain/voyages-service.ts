/**
 * NAUTI ONE — Voyages Domain Service
 */

import { supabase } from "@/integrations/supabase/client";
import { fromUntyped } from "@/integrations/supabase/untyped-client";
import type { Database } from "@/integrations/supabase/types";

type VoyageInsert = Database['public']['Tables']['voyages']['Insert'];
type VoyageUpdate = Database['public']['Tables']['voyages']['Update'];
import { publishEvent } from "@/lib/events/event-bus";

export const VoyagesService = {
  async getById(id: string) {
    const { data, error } = await supabase.from('voyages').select('*, vessels(name, imo_number)').eq('id', id).single();
    if (error) throw error;
    return data;
  },

  async listByVessel(vesselId: string) {
    const { data, error } = await supabase.from('voyages')
      .select('*')
      .eq('vessel_id', vesselId)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw error;
    return data ?? [];
  },

  async create(voyage: Record<string, unknown>) {
    const { data, error } = await supabase.from('voyages')
      .insert(voyage as VoyageInsert)
      .select()
      .single();
    if (error) throw error;

    await publishEvent({
      type: 'voyage.created',
      payload: {
        voyage_id: data.id,
        vessel_id: data.vessel_id,
        voyage_number: data.voyage_number,
      },
      sourceEntityType: 'voyage',
      sourceEntityId: data.id,
    });

    return data;
  },

  async complete(id: string, completionData: Record<string, unknown>) {
    const { data, error } = await supabase.from('voyages')
      .update({ ...completionData, status: 'completed' } as VoyageUpdate)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;

    await publishEvent({
      type: 'voyage.completed',
      payload: {
        voyage_id: data.id,
        vessel_id: data.vessel_id,
        actual_arrival: data.actual_arrival,
      },
      sourceEntityType: 'voyage',
      sourceEntityId: data.id,
    });

    return data;
  },

  async getRelatedCosts(voyageId: string) {
    const [expenses, bunkers] = await Promise.all([
      fromUntyped('expenses').select('id, description, amount, currency, category').eq('voyage_id', voyageId),
      supabase.from('bunker_operations').select('id, fuel_type, quantity_mt, total_cost').eq('voyage_id', voyageId),
    ]);

    return {
      expenses: expenses.data ?? [],
      bunkers: bunkers.data ?? [],
    };
  },
};
