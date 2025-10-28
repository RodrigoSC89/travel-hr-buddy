/**
 * PATCH 441 - Sensor Data Service
 * Handles sensor data storage, normalization, and anomaly detection
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import type { SensorData } from "../sensorStream";

export interface NormalizedSensorData {
  id?: string;
  sensor_id: string;
  sensor_name: string;
  sensor_type: string;
  value: number;
  unit: string;
  normalized_value?: number;
  timestamp: string;
  location?: { latitude: number; longitude: number };
  is_anomaly?: boolean;
  anomaly_score?: number;
  metadata?: Record<string, any>;
}

export interface SensorAlert {
  id?: string;
  sensor_id: string;
  sensor_name: string;
  alert_type: "anomaly" | "threshold_exceeded" | "offline" | "calibration_needed";
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  value?: number;
  threshold?: number;
  timestamp: string;
  acknowledged?: boolean;
  resolved?: boolean;
}

class SensorDataService {
  /**
   * Store sensor data in the database
   */
  async storeSensorData(
    data: SensorData,
    sensorName: string
  ): Promise<void> {
    try {
      const normalizedData: NormalizedSensorData = {
        sensor_id: data.sensorId,
        sensor_name: sensorName,
        sensor_type: data.type,
        value: data.value,
        unit: data.unit,
        timestamp: data.timestamp.toISOString(),
        location: data.location,
      };

      const { error } = await supabase
        .from("sensor_data_normalized")
        .insert(normalizedData);

      if (error) {
        logger.error("Failed to store sensor data", { error: error.message });
        throw error;
      }

      logger.debug("Sensor data stored", { sensorId: data.sensorId });
    } catch (error) {
      logger.error("Error storing sensor data", error);
      throw error;
    }
  }

  /**
   * Store multiple sensor readings
   */
  async storeBatchSensorData(
    dataPoints: Array<{ data: SensorData; sensorName: string }>
  ): Promise<void> {
    try {
      const normalizedDataPoints = dataPoints.map(({ data, sensorName }) => ({
        sensor_id: data.sensorId,
        sensor_name: sensorName,
        sensor_type: data.type,
        value: data.value,
        unit: data.unit,
        timestamp: data.timestamp.toISOString(),
        location: data.location,
      }));

      const { error } = await supabase
        .from("sensor_data_normalized")
        .insert(normalizedDataPoints);

      if (error) {
        logger.error("Failed to store batch sensor data", { error: error.message });
        throw error;
      }

      logger.debug("Batch sensor data stored", { count: dataPoints.length });
    } catch (error) {
      logger.error("Error storing batch sensor data", error);
      throw error;
    }
  }

  /**
   * Detect anomalies and create alerts
   */
  async detectAnomalies(
    sensorId: string,
    sensorName: string,
    value: number,
    threshold: number
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc("detect_sensor_anomaly", {
        p_sensor_id: sensorId,
        p_value: value,
        p_threshold: threshold,
      });

      if (error) {
        logger.error("Failed to detect anomaly", { error: error.message });
        return false;
      }

      if (data === true) {
        await this.createAlert({
          sensor_id: sensorId,
          sensor_name: sensorName,
          alert_type: "anomaly",
          severity: value > threshold ? "critical" : "high",
          message: `Anomaly detected: value ${value.toFixed(2)} exceeds normal range`,
          value,
          threshold,
          timestamp: new Date().toISOString(),
        });
        return true;
      }

      return false;
    } catch (error) {
      logger.error("Error detecting anomalies", error);
      return false;
    }
  }

  /**
   * Create a sensor alert
   */
  async createAlert(alert: SensorAlert): Promise<void> {
    try {
      const { error } = await supabase.from("sensor_alerts").insert(alert);

      if (error) {
        logger.error("Failed to create alert", { error: error.message });
        throw error;
      }

      logger.info("Sensor alert created", { 
        sensorId: alert.sensor_id, 
        severity: alert.severity 
      });
    } catch (error) {
      logger.error("Error creating alert", error);
      throw error;
    }
  }

  /**
   * Get recent sensor data
   */
  async getRecentData(
    sensorId: string,
    limit: number = 100
  ): Promise<NormalizedSensorData[]> {
    try {
      const { data, error } = await supabase
        .from("sensor_data_normalized")
        .select("*")
        .eq("sensor_id", sensorId)
        .order("timestamp", { ascending: false })
        .limit(limit);

      if (error) {
        logger.error("Failed to fetch sensor data", { error: error.message });
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error("Error fetching sensor data", error);
      throw error;
    }
  }

  /**
   * Get unresolved alerts
   */
  async getUnresolvedAlerts(): Promise<SensorAlert[]> {
    try {
      const { data, error } = await supabase
        .from("sensor_alerts")
        .select("*")
        .eq("resolved", false)
        .order("timestamp", { ascending: false })
        .limit(50);

      if (error) {
        logger.error("Failed to fetch alerts", { error: error.message });
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error("Error fetching alerts", error);
      throw error;
    }
  }

  /**
   * Acknowledge an alert
   */
  async acknowledgeAlert(alertId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("sensor_alerts")
        .update({
          acknowledged: true,
          acknowledged_by: userId,
          acknowledged_at: new Date().toISOString(),
        })
        .eq("id", alertId);

      if (error) {
        logger.error("Failed to acknowledge alert", { error: error.message });
        throw error;
      }

      logger.info("Alert acknowledged", { alertId, userId });
    } catch (error) {
      logger.error("Error acknowledging alert", error);
      throw error;
    }
  }

  /**
   * Resolve an alert
   */
  async resolveAlert(alertId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("sensor_alerts")
        .update({
          resolved: true,
          resolved_at: new Date().toISOString(),
        })
        .eq("id", alertId);

      if (error) {
        logger.error("Failed to resolve alert", { error: error.message });
        throw error;
      }

      logger.info("Alert resolved", { alertId });
    } catch (error) {
      logger.error("Error resolving alert", error);
      throw error;
    }
  }

  /**
   * Get sensor statistics
   */
  async getSensorStats(sensorId: string): Promise<{
    count: number;
    avgValue: number;
    minValue: number;
    maxValue: number;
    anomalyCount: number;
  } | null> {
    try {
      const { data, error } = await supabase
        .from("sensor_data_normalized")
        .select("value, is_anomaly")
        .eq("sensor_id", sensorId)
        .gte("timestamp", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (error) {
        logger.error("Failed to fetch sensor stats", { error: error.message });
        return null;
      }

      if (!data || data.length === 0) {
        return null;
      }

      const values = data.map((d) => d.value);
      const anomalyCount = data.filter((d) => d.is_anomaly).length;

      return {
        count: data.length,
        avgValue: values.reduce((a, b) => a + b, 0) / values.length,
        minValue: Math.min(...values),
        maxValue: Math.max(...values),
        anomalyCount,
      };
    } catch (error) {
      logger.error("Error fetching sensor stats", error);
      return null;
    }
  }
}

export const sensorDataService = new SensorDataService();
