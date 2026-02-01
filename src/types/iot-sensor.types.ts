/**
 * IoT Sensor Types - Sprint 2 Type Safety
 * Strongly typed interfaces for IoT sensor operations
 */

// Sensor processing request
export interface SensorProcessingRequest {
  sensorData: SensorDataPayload;
  vesselId: string;
  sensorType: string;
}

// Sensor data payload
export interface SensorDataPayload {
  id: string;
  sensorType: string;
  value: number;
  unit: string;
  timestamp: Date | string;
  status: 'normal' | 'warning' | 'critical';
  location: string;
  metadata?: Record<string, unknown>;
}

// Sensor processing response
export interface SensorProcessingResponse {
  processed: boolean;
  alerts: SensorAlert[];
  predictions?: SensorPrediction[];
  recommendations?: string[];
}

// Sensor alert
export interface SensorAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  message: string;
  value: number;
  unit: string;
  sensorId: string;
  timestamp: string;
}

// Sensor prediction
export interface SensorPrediction {
  metric: string;
  predictedValue: number;
  confidence: number;
  timeHorizon: string;
}

// Alert state for component
export interface ComponentAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  message: string;
  value: number;
  unit: string;
}
