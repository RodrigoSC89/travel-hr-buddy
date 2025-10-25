/**
 * PATCH 174.0 - Sensor Registry
 * Manages sensor registration (ID, type, location)
 */

import { logger } from "@/lib/logger";

export interface SensorRegistration {
  id: string;
  name: string;
  type: "temperature" | "pressure" | "motion" | "climate" | "water_quality";
  location: { latitude: number; longitude: number };
  installDate: Date;
  status: "active" | "inactive" | "maintenance";
}

class SensorRegistry {
  private sensors: Map<string, SensorRegistration> = new Map();

  /**
   * Register new sensor
   */
  register(sensor: SensorRegistration): boolean {
    if (this.sensors.has(sensor.id)) {
      logger.warn(`[Sensor Registry] Sensor ${sensor.id} already registered`);
      return false;
    }

    this.sensors.set(sensor.id, sensor);
    logger.info(`[Sensor Registry] Sensor ${sensor.id} registered`);
    return true;
  }

  /**
   * Get sensor info
   */
  getSensor(id: string): SensorRegistration | null {
    return this.sensors.get(id) || null;
  }

  /**
   * List all sensors
   */
  listSensors(): SensorRegistration[] {
    return Array.from(this.sensors.values());
  }

  /**
   * Update sensor status
   */
  updateStatus(id: string, status: SensorRegistration["status"]): boolean {
    const sensor = this.sensors.get(id);
    if (!sensor) return false;

    sensor.status = status;
    return true;
  }
}

export const sensorRegistry = new SensorRegistry();
