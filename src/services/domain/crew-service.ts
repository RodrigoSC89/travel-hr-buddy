/**
 * NAUTI ONE — Crew Domain Service
 */

import { supabase } from "@/integrations/supabase/client";
import { publishEvent } from "@/lib/events/event-bus";
import type { Database } from "@/integrations/supabase/types";

type CrewInsert = Database['public']['Tables']['crew_members']['Insert'];

export const CrewService = {
  async createCrewMember(crew: Record<string, unknown>) {
    const employeeId = `EMP-${Date.now().toString(36).toUpperCase()}`;
    const { data, error } = await supabase.from('crew_members').insert({
      ...crew,
      employee_id: employeeId,
    } as CrewInsert).select().single();
    if (error) throw error;

    await publishEvent({
      type: 'people.crew.created',
      payload: {
        crew_id: data.id,
        full_name: data.full_name,
        rank: data.rank,
        vessel_id: data.vessel_id,
      },
      sourceEntityType: 'crew_member',
      sourceEntityId: data.id,
    });

    return data;
  },
};
