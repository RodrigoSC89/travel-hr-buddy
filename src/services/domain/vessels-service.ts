/**
 * NAUTI ONE — Vessels Domain Service
 */

import { supabase } from "@/integrations/supabase/client";
import { fromUntyped } from "@/integrations/supabase/untyped-client";
import { publishEvent, logAuditEvent } from "@/lib/events/event-bus";

export const VesselsService = {
  async getById(id: string) {
    const { data, error } = await supabase.from('vessels').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  },

  async list(orgId?: string) {
    let query = supabase.from('vessels').select('*').order('name');
    if (orgId) query = query.eq('organization_id', orgId);
    const { data, error } = await query;
    if (error) throw error;
    return data ?? [];
  },

  async getRelatedRecords(vesselId: string) {
    const [voyages, workOrders, alerts, crew] = await Promise.all([
      supabase.from('voyages').select('id, voyage_number, status').eq('vessel_id', vesselId).limit(10),
      fromUntyped('pms_work_orders').select('id, work_order_number, status, priority').eq('vessel_id', vesselId).limit(10),
      fromUntyped('soc_alerts').select('id, title, severity, status, created_at').eq('vessel_id', vesselId).limit(10),
      supabase.from('crew_members').select('id, full_name, rank, status').eq('vessel_id', vesselId).limit(20),
    ]);

    return {
      voyages: voyages.data ?? [],
      workOrders: workOrders.data ?? [],
      alerts: alerts.data ?? [],
      crew: crew.data ?? [],
    };
  },

  async create(vessel: Record<string, unknown>) {
    const { data, error } = await supabase.from('vessels')
      .insert(vessel as any)
      .select()
      .single();
    if (error) throw error;

    await publishEvent({
      type: 'vessel.created',
      payload: { vessel_id: data.id, name: data.name, vessel_type: data.vessel_type },
      sourceEntityType: 'vessel',
      sourceEntityId: data.id,
    });

    return data;
  },

  async update(id: string, updates: Record<string, unknown>) {
    const { data, error } = await supabase.from('vessels')
      .update(updates as any)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;

    await logAuditEvent({
      entityType: 'vessel',
      entityId: id,
      action: 'vessel.updated',
      diff: updates,
    });

    return data;
  },
};
