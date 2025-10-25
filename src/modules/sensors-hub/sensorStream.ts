/**
 * PATCH 174.0 - Sensor Stream
 * MQTT-based data ingestion for remote sensors
 */

import { logger } from "@/lib/logger";

export interface SensorData {
  sensorId: string;
  type: "temperature" | "pressure" | "motion" | "climate" | "water_quality";
  value: number;
  unit: string;
  timestamp: Date;
  location?: { latitude: number; longitude: number };
}

class SensorStream {
  private activeStreams: Map<string, SensorData[]> = new Map();
  private maxHistory = 1000;

  /**
   * Process incoming sensor data
   */
  ingestData(data: SensorData): void {
    const history = this.activeStreams.get(data.sensorId) || [];
    history.unshift(data);

    if (history.length > this.maxHistory) {
      history.pop();
    }

    this.activeStreams.set(data.sensorId, history);
    logger.debug(`[Sensor Stream] Data ingested from ${data.sensorId}`);
  }

  /**
   * Get sensor history
   */
  getHistory(sensorId: string, limit: number = 100): SensorData[] {
    const history = this.activeStreams.get(sensorId) || [];
    return history.slice(0, limit);
  }

  /**
   * Get latest reading
   */
  getLatest(sensorId: string): SensorData | null {
    const history = this.activeStreams.get(sensorId);
    return history && history.length > 0 ? history[0] : null;
  }

  /**
   * List active sensors
   */
  listActiveSensors(): string[] {
    return Array.from(this.activeStreams.keys());
  }
}

export const sensorStream = new SensorStream();
