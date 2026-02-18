/**
 * NAUTI ONE — Maintenance Domain Service
 */

import { supabase } from "@/integrations/supabase/client";
import { publishEvent, logAuditEvent } from "@/lib/events/event-bus";

export const MaintenanceService = {
  async createWorkOrder(wo: Record<string, unknown>) {
    const { data, error } = await (supabase.from as Function)('pms_work_orders').insert(wo).select().single();
    if (error) throw error;

    await publishEvent({
      type: 'maintenance.work_order.created',
      payload: {
        work_order_id: data.id,
        vessel_id: data.vessel_id,
        priority: data.priority,
        due_date: data.due_date,
      },
      sourceEntityType: 'work_order',
      sourceEntityId: data.id,
    });

    return data;
  },

  async completeWorkOrder(id: string, completionData: Record<string, unknown>) {
    const { data, error } = await (supabase.from as Function)('pms_work_orders')
      .update({ ...completionData, status: 'completed', completed_date: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;

    await publishEvent({
      type: 'maintenance.work_order.completed',
      payload: {
        work_order_id: data.id,
        vessel_id: data.vessel_id,
        actual_cost: data.actual_cost,
        completion_date: data.completed_date,
      },
      sourceEntityType: 'work_order',
      sourceEntityId: data.id,
    });

    return data;
  },

  async listByVessel(vesselId: string) {
    const { data, error } = await (supabase.from as Function)('pms_work_orders')
      .select('*')
      .eq('vessel_id', vesselId)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw error;
    return data ?? [];
  },
};
