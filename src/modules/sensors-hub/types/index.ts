/**
 * PATCH 428 + 453 - Sensors Hub Types
 */

export interface SensorReading {
  id: string;
  name: string;
  type: "temperature" | "pressure" | "depth" | "humidity" | "flow" | "wind" | "sonar";
  value: number;
  unit?: string;
  status: "active" | "inactive" | "warning" | "error";
  location: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface SensorAlert {
  id: string;
  sensorId: string;
  sensorName: string;
  severity: "info" | "warning" | "critical";
  message: string;
  timestamp: string;
  acknowledged?: boolean;
  metadata?: Record<string, any>;
}

export interface Sensor {
  id: string;
  name: string;
  type: "temperature" | "pressure" | "depth" | "humidity" | "flow" | "wind" | "sonar";
  location: string;
  minThreshold: number;
  maxThreshold: number;
  unit: string;
  status: "active" | "inactive" | "maintenance";
  lastReading?: number;
  lastUpdate?: string;
}

export interface SensorEvent {
  id: string;
  sensorId: string;
  eventType: string;
  severity: "info" | "warning" | "error" | "critical";
  message: string;
  timestamp: string;
  metadata?: Record<string, any>;
}
