/**
 * NAUTI ONE — PMS Domain Service
 * Planned Maintenance System — 5-level hierarchy
 */

import { supabase } from "@/integrations/supabase/client";
import { fromUntyped } from "@/integrations/supabase/untyped-client";
import { publishEvent, logAuditEvent } from "@/lib/events/event-bus";

export const PMSService = {
  async createSystem(system: Record<string, unknown>) {
    const { data, error } = await fromUntyped('pms_systems').insert(system).select().single();
    if (error) throw error;

    await publishEvent({
      type: 'maintenance.system.created',
      payload: { system_id: data.id, name: data.name, code: data.code, is_critical: data.is_critical },
      sourceEntityType: 'work_order',
      sourceEntityId: data.id,
    });

    return data;
  },

  async createWorkOrder(wo: Record<string, unknown>) {
    const woNumber = `WO-${Date.now().toString(36).toUpperCase()}`;
    const { data, error } = await fromUntyped('pms_work_orders').insert({
      ...wo,
      work_order_number: woNumber,
      status: 'draft',
      triggered_by: wo.triggered_by ?? 'manual',
    }).select().single();
    if (error) throw error;

    await publishEvent({
      type: 'maintenance.work_order.created',
      payload: { work_order_id: data.id, wo_number: woNumber, vessel_id: data.vessel_id, priority: data.priority },
      sourceEntityType: 'work_order',
      sourceEntityId: data.id,
    });

    return data;
  },

  async updateWorkOrderStatus(id: string, status: string) {
    const updates: Record<string, unknown> = { status };
    if (status === 'in_progress') updates.actual_start = new Date().toISOString();
    if (status === 'completed') updates.actual_end = new Date().toISOString();

    const { data, error } = await fromUntyped('pms_work_orders')
      .update(updates).eq('id', id).select().single();
    if (error) throw error;

    const eventType = status === 'completed'
      ? 'maintenance.work_order.completed' as const
      : 'maintenance.work_order.status_changed' as const;

    await publishEvent({
      type: eventType,
      payload: { work_order_id: data.id, status, vessel_id: data.vessel_id },
      sourceEntityType: 'work_order',
      sourceEntityId: data.id,
    });

    await logAuditEvent({
      entityType: 'work_order', entityId: id,
      action: `work_order.${status}`,
      diff: { status },
    });

    return data;
  },
};
