/**
 * PATCH 453 - Sensors Service
 * Complete sensor data management with mocked sensors
 */

import { supabase } from "@/integrations/supabase/client";
import type { SensorReading, SensorAlert, SensorEvent } from "../types";

export class SensorsService {
  
  // ==================== Sensor Readings ====================
  
  async getLatestReadings(): Promise<SensorReading[]> {
    // Mock sensor data - simulates real sensors
    const now = new Date().toISOString();
    return [
      {
        id: "temp-001",
        name: "Temperature Sensor 1",
        type: "temperature",
        value: 22 + Math.random() * 5,
        status: "active",
        location: "Engine Room",
        timestamp: now
      },
      {
        id: "press-001",
        name: "Pressure Sensor 1",
        type: "pressure",
        value: 1013 + Math.random() * 10 - 5,
        status: "active",
        location: "Main Deck",
        timestamp: now
      },
      {
        id: "humid-001",
        name: "Humidity Sensor 1",
        type: "humidity",
        value: 60 + Math.random() * 20,
        status: "active",
        location: "Cargo Hold",
        timestamp: now
      },
      {
        id: "wind-001",
        name: "Wind Sensor 1",
        type: "wind",
        value: 5 + Math.random() * 10,
        status: "active",
        location: "Upper Deck",
        timestamp: now
      },
      {
        id: "sonar-001",
        name: "Sonar Depth Sensor",
        type: "sonar",
        value: 150 + Math.random() * 50,
        status: "active",
        location: "Hull",
        timestamp: now
      },
      {
        id: "temp-002",
        name: "Temperature Sensor 2",
        type: "temperature",
        value: 45 + Math.random() * 5, // High temp to trigger alert
        status: "warning",
        location: "Generator Room",
        timestamp: now
      }
    ];
  }

  async saveSensorReading(reading: {
    sensorId: string;
    value: number;
    metadata?: Record<string, any>;
  }): Promise<void> {
    try {
      const { error } = await (supabase as any)
        .from("sensor_readings")
        .insert({
          sensor_id: reading.sensorId,
          value: reading.value,
          timestamp: new Date().toISOString(),
          metadata: reading.metadata || {}
        });

      if (error) throw error;

      // Check for critical thresholds and create alerts if needed
      await this.checkThresholds(reading.sensorId, reading.value);
    } catch (error) {
      console.error("Error saving sensor reading:", error);
      throw error;
    }
  }

  // ==================== Sensor Alerts ====================

  async getActiveAlerts(): Promise<SensorAlert[]> {
    // Simulate alerts based on sensor readings
    const readings = await this.getLatestReadings();
    const alerts: SensorAlert[] = [];

    readings.forEach(reading => {
      // Check for critical thresholds
      if (reading.type === "temperature" && reading.value > 40) {
        alerts.push({
          id: `alert-${reading.id}`,
          sensorId: reading.id,
          sensorName: reading.name,
          severity: "critical",
          message: `Temperature exceeds safe threshold: ${reading.value.toFixed(1)}°C`,
          timestamp: reading.timestamp
        });
      } else if (reading.type === "pressure" && (reading.value < 990 || reading.value > 1020)) {
        alerts.push({
          id: `alert-${reading.id}`,
          sensorId: reading.id,
          sensorName: reading.name,
          severity: "warning",
          message: `Pressure out of normal range: ${reading.value.toFixed(1)} hPa`,
          timestamp: reading.timestamp
        });
      } else if (reading.type === "humidity" && (reading.value < 30 || reading.value > 80)) {
        alerts.push({
          id: `alert-${reading.id}`,
          sensorId: reading.id,
          sensorName: reading.name,
          severity: "warning",
          message: `Humidity out of normal range: ${reading.value.toFixed(1)}%`,
          timestamp: reading.timestamp
        });
      }
    });

    return alerts;
  }

  async dismissAlert(alertId: string): Promise<void> {
    try {
      const { error } = await (supabase as any)
        .from("sensor_alerts")
        .update({ acknowledged: true })
        .eq("id", alertId);

      if (error) throw error;
    } catch (error) {
      console.error("Error dismissing alert:", error);
      throw error;
    }
  }

  // ==================== Sensor Events ====================

  async logEvent(event: {
    sensorId: string;
    eventType: string;
    severity: "info" | "warning" | "error" | "critical";
    message: string;
    metadata?: Record<string, any>;
  }): Promise<void> {
    try {
      const { error } = await (supabase as any)
        .from("sensor_events")
        .insert({
          sensor_id: event.sensorId,
          event_type: event.eventType,
          severity: event.severity,
          message: event.message,
          timestamp: new Date().toISOString(),
          metadata: event.metadata || {}
        });

      if (error) throw error;
    } catch (error) {
      console.error("Error logging sensor event:", error);
      throw error;
    }
  }

  async getEvents(filters?: {
    sensorId?: string;
    severity?: string;
    limit?: number;
  }): Promise<SensorEvent[]> {
    try {
      let query = (supabase as any)
        .from("sensor_events")
        .select("*")
        .order("timestamp", { ascending: false });

      if (filters?.sensorId) query = query.eq("sensor_id", filters.sensorId);
      if (filters?.severity) query = query.eq("severity", filters.severity);
      if (filters?.limit) query = query.limit(filters.limit);

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map((d: any) => ({
        id: d.id,
        sensorId: d.sensor_id,
        eventType: d.event_type,
        severity: d.severity as SensorEvent["severity"],
        message: d.message,
        timestamp: d.timestamp,
        metadata: d.metadata || {}
      }));
    } catch (error) {
      console.error("Error fetching sensor events:", error);
      return [];
    }
  }

  // ==================== Helper Methods ====================

  private async checkThresholds(sensorId: string, value: number): Promise<void> {
    // Implement threshold checking logic
    // This would query sensor configuration and create alerts if thresholds are exceeded
    console.log(`Checking thresholds for sensor ${sensorId}: ${value}`);
  }
}

export const sensorService = new SensorsService();
export const sensorsService = new SensorsService(); // Backwards compatibility
