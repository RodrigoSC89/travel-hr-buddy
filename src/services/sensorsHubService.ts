/**
 * PATCH 538 - Sensors Hub Service
 * Real-time sensor monitoring with MQTT/HTTP ingestion
 * Schema-aligned version
 */
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

// Types aligned with database schema
type SensorType = "temperature" | "pressure" | "humidity" | "motion" | "gps" | "depth" | "speed" | "wind" | "wave" | "current" | "other";
type SensorStatus = "normal" | "warning" | "critical" | "offline";

interface SensorLogDB {
  id: string;
  sensor_id: string;
  sensor_type: string;
  value: number;
  unit: string | null;
  timestamp: string;
  vessel_id: string | null;
  organization_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

interface SensorAlertDB {
  id: string;
  sensor_id: string;
  sensor_type: string;
  alert_type: string;
  severity: string;
  message: string;
  value: number | null;
  threshold: number | null;
  acknowledged: boolean;
  acknowledged_by: string | null;
  acknowledged_at: string | null;
  vessel_id: string | null;
  organization_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  resolved_at: string | null;
}

class SensorsHubService {
  private simulationInterval: ReturnType<typeof setInterval> | null = null;

  startSimulation(): void {
    if (this.simulationInterval) return;
    this.simulationInterval = setInterval(() => {
      this.ingestSimulatedData();
    }, 2000);
  }

  stopSimulation(): void {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
  }

  private async ingestSimulatedData(): Promise<void> {
    const sensorTypes: Array<{ id: string; name: string; type: SensorType; unit: string }> = [
      { id: "temp-001", name: "Engine Temperature", type: "temperature", unit: "°C" },
      { id: "press-001", name: "Hydraulic Pressure", type: "pressure", unit: "bar" },
      { id: "depth-001", name: "Depth Sensor", type: "depth", unit: "m" },
      { id: "wind-001", name: "Wind Speed", type: "wind", unit: "knots" },
      { id: "wave-001", name: "Wave Height", type: "wave", unit: "m" },
    ];

    const logs = sensorTypes.map(sensor => {
      const baseValue = this.getBaseValue(sensor.type);
      const variance = baseValue * 0.1;
      const sensorSeed = sensor.id.charCodeAt(0) + sensor.id.charCodeAt(sensor.id.length - 1);
      const value = baseValue + Math.sin(Date.now() / 10000 + sensorSeed) * variance * 0.5;
      const status = this.getSensorStatus(sensor.type, value);

      return {
        sensor_id: sensor.id,
        sensor_type: sensor.type,
        value: Math.round(value * 100) / 100,
        unit: sensor.unit,
        metadata: { simulation: true, sensor_name: sensor.name, status },
      };
    });

    await supabase.from("sensor_logs").insert(logs);

    for (const log of logs) {
      const status = (log.metadata as { status: SensorStatus }).status;
      if (status === "warning" || status === "critical") {
        await this.createAlert(log, status);
      }
    }
  }

  private getBaseValue(type: SensorType): number {
    const baseValues: Record<SensorType, number> = {
      temperature: 75, pressure: 150, humidity: 60, motion: 5, gps: 0,
      depth: 50, speed: 15, wind: 20, wave: 2.5, current: 1.5, other: 50,
    };
    return baseValues[type] || 50;
  }

  private getSensorStatus(type: SensorType, value: number): SensorStatus {
    const thresholds: Record<SensorType, { warning: number; critical: number }> = {
      temperature: { warning: 85, critical: 95 }, pressure: { warning: 180, critical: 200 },
      humidity: { warning: 80, critical: 90 }, motion: { warning: 7, critical: 9 },
      gps: { warning: 10, critical: 20 }, depth: { warning: 80, critical: 100 },
      speed: { warning: 25, critical: 30 }, wind: { warning: 30, critical: 40 },
      wave: { warning: 4, critical: 6 }, current: { warning: 3, critical: 4 },
      other: { warning: 80, critical: 95 },
    };
    const threshold = thresholds[type];
    if (value >= threshold.critical) return "critical";
    if (value >= threshold.warning) return "warning";
    return "normal";
  }

  private async createAlert(log: { sensor_id: string; sensor_type: string; value: number; unit: string }, status: SensorStatus): Promise<void> {
    const { data: existingAlert } = await supabase
      .from("sensor_alerts")
      .select("*")
      .eq("sensor_id", log.sensor_id)
      .eq("acknowledged", false)
      .maybeSingle();

    if (existingAlert) return;

    await supabase.from("sensor_alerts").insert([{
      sensor_id: log.sensor_id,
      sensor_type: log.sensor_type,
      alert_type: `${log.sensor_type}_threshold`,
      severity: status === "critical" ? "critical" : "warning",
      message: `Sensor ${log.sensor_id} reading ${log.value} ${log.unit} is ${status}`,
      value: log.value,
      acknowledged: false,
    }]);
  }

  async getSensorLogs(limit = 100, sensorType?: SensorType): Promise<SensorLogDB[]> {
    let query = supabase
      .from("sensor_logs")
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(limit);

    if (sensorType) {
      query = query.eq("sensor_type", sensorType);
    }

    const { data, error } = await query;
    if (error) {
      logger.error("Error fetching sensor logs", error as Error, { sensorType, limit });
      return [];
    }
    return (data || []) as SensorLogDB[];
  }

  async getActiveAlerts(): Promise<SensorAlertDB[]> {
    const { data, error } = await supabase
      .from("sensor_alerts")
      .select("*")
      .eq("acknowledged", false)
      .order("created_at", { ascending: false });

    if (error) {
      logger.error("Error fetching alerts", error as Error);
      return [];
    }
    return (data || []) as SensorAlertDB[];
  }

  async acknowledgeAlert(alertId: string): Promise<boolean> {
    const { data: userData } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("sensor_alerts")
      .update({
        acknowledged: true,
        acknowledged_by: userData?.user?.id,
        acknowledged_at: new Date().toISOString(),
      })
      .eq("id", alertId);
    return !error;
  }

  async getStatistics(): Promise<{
    totalSensors: number;
    activeSensors: number;
    totalReadings: number;
    activeAlerts: number;
    criticalAlerts: number;
  }> {
    const [logs, alerts] = await Promise.all([
      this.getSensorLogs(1000),
      this.getActiveAlerts(),
    ]);
    const uniqueSensors = new Set(logs.map(l => l.sensor_id));
    return {
      totalSensors: uniqueSensors.size,
      activeSensors: uniqueSensors.size,
      totalReadings: logs.length,
      activeAlerts: alerts.length,
      criticalAlerts: alerts.filter(a => a.severity === "critical").length,
    };
  }

  async getLatestReadings(): Promise<SensorLogDB[]> {
    const { data, error } = await supabase
      .from("sensor_logs")
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(100);

    if (error) {
      logger.error("Error fetching latest readings", error as Error);
      return [];
    }

    const uniqueSensors = new Map<string, SensorLogDB>();
    ((data || []) as SensorLogDB[]).forEach((log) => {
      if (!uniqueSensors.has(log.sensor_id)) {
        uniqueSensors.set(log.sensor_id, log);
      }
    });
    return Array.from(uniqueSensors.values());
  }
}

export const sensorsHubService = new SensorsHubService();
