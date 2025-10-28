/**
 * PATCH 428 - Sensors Hub Types
 */

export interface SensorReading {
  id: string;
  sensorId: string;
  sensorName: string;
  sensorType: "temperature" | "pressure" | "depth" | "humidity" | "flow";
  value: number;
  unit: string;
  minThreshold: number;
  maxThreshold: number;
  timestamp: string;
  location?: string;
  metadata?: Record<string, any>;
}

export interface SensorAlert {
  id: string;
  sensorId: string;
  sensorName: string;
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  value: number;
  threshold: number;
  acknowledged: boolean;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  createdAt: string;
}

export interface Sensor {
  id: string;
  name: string;
  type: "temperature" | "pressure" | "depth" | "humidity" | "flow";
  location: string;
  minThreshold: number;
  maxThreshold: number;
  unit: string;
  status: "active" | "inactive" | "maintenance";
  lastReading?: number;
  lastUpdate?: string;
}
