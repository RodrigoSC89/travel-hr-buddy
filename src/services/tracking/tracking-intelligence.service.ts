/**
 * Tracking & Telemetry Intelligence Service
 * Real-time vessel tracking, IoT sensors, telemetry analytics
 */

import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

// ── Types ──────────────────────────────────────────────────────
export interface VesselTrackingPosition {
  id: string;
  vesselId: string;
  vesselName: string;
  vesselType: string;
  imo: string;
  latitude: number;
  longitude: number;
  speedKnots: number | null;
  heading: number | null;
  engineStatus: string | null;
  fuelLevel: number | null;
  recordedAt: string | null;
}

export interface IoTSensor {
  id: string;
  sensorId: string;
  sensorType: string;
  status: string | null;
  currentValue: number | null;
  unit: string | null;
  location: string | null;
  vesselId: string | null;
  lastReadingAt: string | null;
  thresholds: any;
}

export interface IoTAlert {
  id: string;
  sensorId: string;
  alertType: string;
  severity: string;
  message: string;
  recommendedAction: string | null;
  acknowledged: boolean | null;
  resolved: boolean | null;
  createdAt: string;
}

export interface TelemetryInsight {
  id: string;
  title: string;
  description: string;
  insightType: string;
  sensorId: string | null;
  confidence: number | null;
  priority: number | null;
  predictedIssue: string | null;
  recommendedAction: string | null;
  status: string | null;
  createdAt: string;
}

export interface TelemetryAlert {
  id: string;
  sensorId: string;
  alertType: string;
  severity: string;
  message: string;
  acknowledged: boolean | null;
  resolved: boolean | null;
  createdAt: string;
}

export interface TrackingDashboardData {
  positions: VesselTrackingPosition[];
  sensors: IoTSensor[];
  iotAlerts: IoTAlert[];
  telemetryAlerts: TelemetryAlert[];
  insights: TelemetryInsight[];
  stats: {
    totalVessels: number;
    trackedVessels: number;
    totalSensors: number;
    activeSensors: number;
    criticalAlerts: number;
    pendingInsights: number;
  };
}

// ── Service ────────────────────────────────────────────────────
export class TrackingIntelligenceService {

  async getDashboardData(): Promise<TrackingDashboardData> {
    const [positionsRes, sensorsRes, iotAlertsRes, telAlertsRes, insightsRes] = await Promise.all([
      this.fetchPositions(),
      this.fetchSensors(),
      this.fetchIoTAlerts(),
      this.fetchTelemetryAlerts(),
      this.fetchInsights(),
    ]);

    const activeSensors = sensorsRes.filter(s => s.status === 'active' || s.status === 'online').length;
    const criticalAlerts = [
      ...iotAlertsRes.filter(a => a.severity === 'critical' && !a.resolved),
      ...telAlertsRes.filter(a => a.severity === 'critical' && !a.resolved),
    ].length;

    return {
      positions: positionsRes,
      sensors: sensorsRes,
      iotAlerts: iotAlertsRes,
      telemetryAlerts: telAlertsRes,
      insights: insightsRes,
      stats: {
        totalVessels: positionsRes.length,
        trackedVessels: positionsRes.filter(p => p.latitude !== 0).length,
        totalSensors: sensorsRes.length,
        activeSensors,
        criticalAlerts,
        pendingInsights: insightsRes.filter(i => i.status === 'pending' || i.status === 'active').length,
      },
    };
  }

  private async fetchPositions(): Promise<VesselTrackingPosition[]> {
    const { data: tracking } = await supabase
      .from('vessel_tracking')
      .select('*')
      .order('recorded_at', { ascending: false })
      .limit(100);

    const { data: vessels } = await supabase
      .from('vessels')
      .select('id, name, imo_number, vessel_type')
      .limit(50);

    if (!tracking) return [];

    // Get latest position per vessel
    const vesselMap = new Map<string, VesselTrackingPosition>();
    for (const t of tracking) {
      if (!t.vessel_id || vesselMap.has(t.vessel_id)) continue;
      const vessel = (vessels || []).find((v: any) => v.id === t.vessel_id);
      vesselMap.set(t.vessel_id, {
        id: t.id,
        vesselId: t.vessel_id,
        vesselName: vessel?.name || 'Embarcação Desconhecida',
        vesselType: vessel?.vessel_type || 'N/A',
        imo: vessel?.imo_number || 'N/A',
        latitude: t.latitude,
        longitude: t.longitude,
        speedKnots: t.speed_knots,
        heading: t.heading,
        engineStatus: t.engine_status,
        fuelLevel: t.fuel_level,
        recordedAt: t.recorded_at,
      });
    }

    return Array.from(vesselMap.values());
  }

  private async fetchSensors(): Promise<IoTSensor[]> {
    const { data } = await supabase
      .from('iot_sensors')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(100);

    return (data || []).map((s: any) => ({
      id: s.id,
      sensorId: s.sensor_id,
      sensorType: s.sensor_type,
      status: s.status,
      currentValue: s.current_value,
      unit: s.unit,
      location: s.location,
      vesselId: s.vessel_id,
      lastReadingAt: s.last_reading_at,
      thresholds: s.thresholds,
    }));
  }

  private async fetchIoTAlerts(): Promise<IoTAlert[]> {
    const { data } = await supabase
      .from('iot_sensor_alerts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    return (data || []).map((a: any) => ({
      id: a.id,
      sensorId: a.sensor_id,
      alertType: a.alert_type,
      severity: a.severity,
      message: a.message,
      recommendedAction: a.recommended_action,
      acknowledged: a.acknowledged,
      resolved: a.resolved,
      createdAt: a.created_at,
    }));
  }

  private async fetchTelemetryAlerts(): Promise<TelemetryAlert[]> {
    const { data } = await supabase
      .from('telemetry_alerts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    return (data || []).map((a: any) => ({
      id: a.id,
      sensorId: a.sensor_id,
      alertType: a.alert_type,
      severity: a.severity,
      message: a.message,
      acknowledged: a.acknowledged,
      resolved: a.resolved,
      createdAt: a.created_at,
    }));
  }

  private async fetchInsights(): Promise<TelemetryInsight[]> {
    const { data } = await supabase
      .from('telemetry_insights')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(30);

    return (data || []).map((i: any) => ({
      id: i.id,
      title: i.title,
      description: i.description,
      insightType: i.insight_type,
      sensorId: i.sensor_id,
      confidence: i.confidence,
      priority: i.priority,
      predictedIssue: i.predicted_issue,
      recommendedAction: i.recommended_action,
      status: i.status,
      createdAt: i.created_at,
    }));
  }

  async runAIAnalysis(): Promise<string | null> {
    try {
      const { data, error } = await supabase.functions.invoke('tracking-intelligence', {
        body: { action: 'tracking_ai_analysis' },
      });
      if (error) throw error;
      return data?.data?.analysis || null;
    } catch (err) {
      logger.error('Tracking AI analysis error', err as Error);
      return null;
    }
  }

  async acknowledgeAlert(alertId: string, table: 'iot_sensor_alerts' | 'telemetry_alerts'): Promise<boolean> {
    const { error } = await supabase
      .from(table)
      .update({ acknowledged: true, acknowledged_at: new Date().toISOString() })
      .eq('id', alertId);
    return !error;
  }

  async resolveAlert(alertId: string, table: 'iot_sensor_alerts' | 'telemetry_alerts'): Promise<boolean> {
    const updateData: Record<string, any> = { resolved: true, resolved_at: new Date().toISOString() };
    const { error } = await supabase
      .from(table)
      .update(updateData)
      .eq('id', alertId);
    return !error;
  }
}

export const trackingIntelligence = new TrackingIntelligenceService();
