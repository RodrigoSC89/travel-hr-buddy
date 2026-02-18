/**
 * NAUTI ONE — Tracking Domain Service
 */

import { supabase } from "@/integrations/supabase/client";
import { publishEvent } from "@/lib/events/event-bus";

export const TrackingService = {
  async createAlert(alert: Record<string, unknown>) {
    // Try telemetry_alerts first (for sensor/geofence alerts), fallback to soc_alerts
    const table = alert.sensor_id ? 'telemetry_alerts' : 'soc_alerts';
    const { data, error } = await (supabase.from as Function)(table).insert(alert).select().single();
    if (error) throw error;

    await publishEvent({
      type: 'tracking.alert.created',
      payload: {
        alert_id: data.id,
        vessel_id: data.vessel_id,
        alert_type: data.alert_type ?? alert.alert_type,
        severity: data.severity ?? alert.severity,
        message: data.message ?? alert.message,
      },
      sourceEntityType: 'alert',
      sourceEntityId: data.id,
    });

    return data;
  },

  async reportConnectivityDegraded(vesselId: string, provider: string, signalQuality: number) {
    await publishEvent({
      type: 'tracking.connectivity.degraded',
      payload: { vessel_id: vesselId, provider, signal_quality: signalQuality, last_seen_at: new Date().toISOString() },
      sourceEntityType: 'vessel',
      sourceEntityId: vesselId,
    });
  },

  async getVesselPositions(vesselId: string, limit = 100) {
    const { data, error } = await (supabase.from as Function)('vessel_positions')
      .select('*')
      .eq('vessel_id', vesselId)
      .order('timestamp', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data ?? [];
  },
};
