/**
 * Edge AI Core Types - Sprint 2 Type Safety
 * Strongly typed interfaces for edge AI operations
 */

import type { EdgeAITask, ModelFormat } from '@/ai/edge/edgeAICore';

// Route optimization types
export interface RouteOptimizationInput {
  waypoints: Array<{
    lat: number;
    lng: number;
    name?: string;
  }>;
  vesselId?: string;
  departureTime?: string;
  weatherConditions?: 'calm' | 'moderate' | 'rough';
}

export interface RouteOptimizationOutput {
  optimizedRoute: Array<{
    lat: number;
    lng: number;
    name?: string;
  }>;
  estimatedTime: number;
  fuelEfficiency: number;
  recommendations: string[];
}

// Failure detection types
export interface FailureDetectionInput {
  component: string;
  sensorReadings?: Record<string, number>;
  operatingHours?: number;
  lastMaintenanceDate?: string;
}

export interface FailureDetectionOutput {
  failureDetected: boolean;
  failureType: 'critical' | 'warning' | 'normal';
  affectedComponent: string;
  score: number;
  recommendations: string[];
}

// Quick response types
export interface QuickResponseInput {
  query: string;
  context?: string;
  language?: 'pt-BR' | 'en-US';
}

export interface QuickResponseOutput {
  response: string;
  contextUnderstood: boolean;
  requiresFollowup: boolean;
}

// Anomaly detection types
export interface AnomalyDetectionInput {
  metric: string;
  baseline: number;
  currentValue?: number;
  historicalData?: number[];
}

export interface AnomalyDetectionOutput {
  isAnomaly: boolean;
  anomalyScore: number;
  severity: 'critical' | 'high' | 'normal';
  details: {
    metric: string;
    deviation: number;
    baseline: number;
  };
}

// Predictive maintenance types
export interface PredictiveMaintenanceInput {
  equipmentId: string;
  operatingHours: number;
  lastMaintenanceDate?: string;
  sensorData?: Record<string, number>;
}

export interface PredictiveMaintenanceOutput {
  maintenanceNeeded: boolean;
  urgency: 'immediate' | 'soon' | 'routine';
  estimatedDaysUntilFailure: number;
  riskScore: number;
  recommendations: string[];
}

// Union types for inference
export type EdgeAIInput =
  | RouteOptimizationInput
  | FailureDetectionInput
  | QuickResponseInput
  | AnomalyDetectionInput
  | PredictiveMaintenanceInput;

export type EdgeAIOutput =
  | RouteOptimizationOutput
  | FailureDetectionOutput
  | QuickResponseOutput
  | AnomalyDetectionOutput
  | PredictiveMaintenanceOutput;

// GPU types - use native WebGPU types when available
export type WebGPUDeviceType = GPUDevice;
export type WebGPUAdapterType = GPUAdapter;

// Helper type for confidence calculation
export function hasScore(output: unknown): output is { score: number } {
  return typeof output === 'object' && output !== null && 'score' in output && typeof (output as Record<string, unknown>).score === 'number';
}
