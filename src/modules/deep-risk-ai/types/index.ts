/**
 * PATCH 455 - Deep Risk AI Types
 */

export interface RiskPrediction {
  id: string;
  source: string;
  riskType: string;
  severity: "low" | "medium" | "high" | "critical";
  confidence: number;
  description: string;
  predictedAt: string;
  metadata: Record<string, unknown>;
}

export interface Anomaly {
  id: string;
  dataSource: string;
  anomalyType: string;
  riskScore: number;
  detectedAt: string;
  value: number;
  expectedValue: number;
  deviation: number;
  metadata: Record<string, unknown>;
}
