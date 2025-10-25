/**
 * PATCH 173.0 - Sensor Integration
 * Reads data from sonar, proximity, and collision sensors
 */

import { logger } from "@/lib/logger";

export interface SensorReading {
  sensorId: string;
  timestamp: Date;
  value: number;
  unit: string;
}

export interface SonarReading extends SensorReading {
  type: "sonar";
  distance: number; // meters
  bearing: number; // degrees
  confidence: number; // 0-1
}

export interface ProximitySensorReading extends SensorReading {
  type: "proximity";
  distance: number; // meters
  zone: "front" | "rear" | "port" | "starboard";
}

export interface CollisionSensorReading extends SensorReading {
  type: "collision";
  detected: boolean;
  severity: "none" | "warning" | "critical";
  contactPoint: string;
}

export type AnySensorReading = SonarReading | ProximitySensorReading | CollisionSensorReading;

export interface SensorData {
  botId: string;
  sonar: SonarReading[];
  proximity: ProximitySensorReading[];
  collision: CollisionSensorReading[];
  lastUpdate: Date;
}

class SensorIntegration {
  private sensorData: Map<string, SensorData> = new Map();
  private maxReadingsPerSensor = 100;

  /**
   * Initialize sensors for a bot
   */
  initializeSensors(botId: string): void {
    if (!this.sensorData.has(botId)) {
      this.sensorData.set(botId, {
        botId,
        sonar: [],
        proximity: [],
        collision: [],
        lastUpdate: new Date()
      });

      logger.info(`[Sensor Integration] Sensors initialized for bot ${botId}`);
    }
  }

  /**
   * Process sonar reading
   */
  processSonarReading(botId: string, reading: Omit<SonarReading, "value" | "unit" | "timestamp" | "type">): void {
    const data = this.sensorData.get(botId);
    if (!data) {
      this.initializeSensors(botId);
      return this.processSonarReading(botId, reading);
    }

    const sonarReading: SonarReading = {
      ...reading,
      type: "sonar",
      value: reading.distance,
      unit: "meters",
      timestamp: new Date()
    };

    data.sonar.unshift(sonarReading);
    if (data.sonar.length > this.maxReadingsPerSensor) {
      data.sonar = data.sonar.slice(0, this.maxReadingsPerSensor);
    }

    data.lastUpdate = new Date();
  }

  /**
   * Process proximity sensor reading
   */
  processProximityReading(botId: string, reading: Omit<ProximitySensorReading, "value" | "unit" | "timestamp" | "type">): void {
    const data = this.sensorData.get(botId);
    if (!data) {
      this.initializeSensors(botId);
      return this.processProximityReading(botId, reading);
    }

    const proximityReading: ProximitySensorReading = {
      ...reading,
      type: "proximity",
      value: reading.distance,
      unit: "meters",
      timestamp: new Date()
    };

    data.proximity.unshift(proximityReading);
    if (data.proximity.length > this.maxReadingsPerSensor) {
      data.proximity = data.proximity.slice(0, this.maxReadingsPerSensor);
    }

    data.lastUpdate = new Date();
  }

  /**
   * Process collision sensor reading
   */
  processCollisionReading(botId: string, reading: Omit<CollisionSensorReading, "value" | "unit" | "timestamp" | "type">): void {
    const data = this.sensorData.get(botId);
    if (!data) {
      this.initializeSensors(botId);
      return this.processCollisionReading(botId, reading);
    }

    const collisionReading: CollisionSensorReading = {
      ...reading,
      type: "collision",
      value: reading.detected ? 1 : 0,
      unit: "boolean",
      timestamp: new Date()
    };

    data.collision.unshift(collisionReading);
    if (data.collision.length > this.maxReadingsPerSensor) {
      data.collision = data.collision.slice(0, this.maxReadingsPerSensor);
    }

    data.lastUpdate = new Date();

    if (reading.detected && reading.severity !== "none") {
      logger.warn(`[Sensor Integration] Collision detected on bot ${botId}:`, {
        severity: reading.severity,
        contactPoint: reading.contactPoint
      });
    }
  }

  /**
   * Get latest sensor data for a bot
   */
  getSensorData(botId: string): SensorData | null {
    return this.sensorData.get(botId) || null;
  }

  /**
   * Get obstacles from sensor readings
   */
  getObstacles(botId: string): { distance: number; bearing: number }[] {
    const data = this.sensorData.get(botId);
    if (!data) {
      return [];
    }

    // Combine sonar and proximity readings
    const obstacles: { distance: number; bearing: number }[] = [];

    // From sonar
    data.sonar.forEach(reading => {
      if (reading.distance < 100 && reading.confidence > 0.5) {
        obstacles.push({
          distance: reading.distance,
          bearing: reading.bearing
        });
      }
    });

    // From proximity sensors (convert zones to bearings)
    const zoneToBearing: Record<string, number> = {
      front: 0,
      starboard: 90,
      rear: 180,
      port: 270
    };

    data.proximity.forEach(reading => {
      if (reading.distance < 50) {
        obstacles.push({
          distance: reading.distance,
          bearing: zoneToBearing[reading.zone]
        });
      }
    });

    return obstacles;
  }

  /**
   * Check for critical conditions
   */
  checkCriticalConditions(botId: string): {
    hasCritical: boolean;
    issues: string[];
  } {
    const data = this.sensorData.get(botId);
    const issues: string[] = [];

    if (!data) {
      return { hasCritical: false, issues };
    }

    // Check for critical collisions
    const recentCollisions = data.collision.filter(
      r => Date.now() - r.timestamp.getTime() < 5000 // Last 5 seconds
    );

    if (recentCollisions.some(r => r.severity === "critical")) {
      issues.push("Critical collision detected");
    }

    // Check for very close obstacles
    const closeObstacles = data.sonar.filter(r => r.distance < 5); // Less than 5 meters
    if (closeObstacles.length > 0) {
      issues.push(`${closeObstacles.length} obstacle(s) within 5 meters`);
    }

    return {
      hasCritical: issues.length > 0,
      issues
    };
  }

  /**
   * Clear sensor data for a bot
   */
  clearSensorData(botId: string): void {
    this.sensorData.delete(botId);
    logger.info(`[Sensor Integration] Sensor data cleared for bot ${botId}`);
  }

  /**
   * Reset all sensor data
   */
  reset(): void {
    this.sensorData.clear();
    logger.info("[Sensor Integration] All sensor data cleared");
  }
}

// Export singleton instance
export const sensorIntegration = new SensorIntegration();
