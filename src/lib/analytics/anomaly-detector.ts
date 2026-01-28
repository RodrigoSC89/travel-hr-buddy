/**
 * Anomaly Detection Engine
 * Phase 4: Premium Analytics - Statistical and ML-based anomaly detection
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export interface DataPoint {
  timestamp: Date;
  value: number;
  metadata?: Record<string, unknown>;
}

export interface Anomaly {
  id: string;
  timestamp: Date;
  value: number;
  expectedValue: number;
  deviation: number;
  deviationPercent: number;
  severity: "low" | "medium" | "high" | "critical";
  type: "spike" | "drop" | "trend_break" | "pattern_anomaly";
  confidence: number;
  metadata?: Record<string, unknown>;
}

export interface DetectionConfig {
  zScoreThreshold: number;
  iqrMultiplier: number;
  minDataPoints: number;
  seasonalityPeriod?: number;
  trendWindow: number;
}

export interface DetectionResult {
  anomalies: Anomaly[];
  statistics: {
    mean: number;
    stdDev: number;
    median: number;
    q1: number;
    q3: number;
    iqr: number;
  };
  processedPoints: number;
  detectionTime: number;
}

/**
 * Statistical Anomaly Detector
 * Uses Z-score, IQR, and trend analysis for anomaly detection
 */
export class AnomalyDetector {
  private config: DetectionConfig;

  constructor(config?: Partial<DetectionConfig>) {
    this.config = {
      zScoreThreshold: config?.zScoreThreshold ?? 2.5,
      iqrMultiplier: config?.iqrMultiplier ?? 1.5,
      minDataPoints: config?.minDataPoints ?? 10,
      seasonalityPeriod: config?.seasonalityPeriod,
      trendWindow: config?.trendWindow ?? 5,
    };
  }

  /**
   * Calculate basic statistics
   */
  private calculateStatistics(values: number[]): {
    mean: number;
    stdDev: number;
    median: number;
    q1: number;
    q3: number;
    iqr: number;
  } {
    const sorted = [...values].sort((a, b) => a - b);
    const n = sorted.length;

    const mean = values.reduce((a, b) => a + b, 0) / n;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
    const stdDev = Math.sqrt(variance);

    const median = n % 2 === 0 ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 : sorted[Math.floor(n / 2)];

    const q1Index = Math.floor(n * 0.25);
    const q3Index = Math.floor(n * 0.75);
    const q1 = sorted[q1Index];
    const q3 = sorted[q3Index];
    const iqr = q3 - q1;

    return { mean, stdDev, median, q1, q3, iqr };
  }

  /**
   * Calculate Z-score for a value
   */
  private calculateZScore(value: number, mean: number, stdDev: number): number {
    if (stdDev === 0) return 0;
    return (value - mean) / stdDev;
  }

  /**
   * Determine anomaly severity based on deviation
   */
  private determineSeverity(deviationPercent: number): Anomaly["severity"] {
    const absDeviation = Math.abs(deviationPercent);
    if (absDeviation > 100) return "critical";
    if (absDeviation > 50) return "high";
    if (absDeviation > 25) return "medium";
    return "low";
  }

  /**
   * Determine anomaly type
   */
  private determineType(
    value: number,
    expectedValue: number,
    trendDirection: number
  ): Anomaly["type"] {
    const deviation = value - expectedValue;

    if (Math.abs(trendDirection) > 0.5) {
      return "trend_break";
    }

    if (deviation > 0) {
      return "spike";
    }

    return "drop";
  }

  /**
   * Detect anomalies in a dataset using multiple methods
   */
  detect(data: DataPoint[]): DetectionResult {
    const startTime = performance.now();

    if (data.length < this.config.minDataPoints) {
      logger.warn("[AnomalyDetector] Insufficient data points", {
        provided: data.length,
        required: this.config.minDataPoints,
      });
      return {
        anomalies: [],
        statistics: { mean: 0, stdDev: 0, median: 0, q1: 0, q3: 0, iqr: 0 },
        processedPoints: 0,
        detectionTime: performance.now() - startTime,
      };
    }

    const values = data.map((d) => d.value);
    const stats = this.calculateStatistics(values);

    const anomalies: Anomaly[] = [];

    // IQR bounds
    const lowerBound = stats.q1 - this.config.iqrMultiplier * stats.iqr;
    const upperBound = stats.q3 + this.config.iqrMultiplier * stats.iqr;

    // Calculate trend for each point
    const trends: number[] = [];
    for (let i = 0; i < data.length; i++) {
      if (i < this.config.trendWindow) {
        trends.push(0);
      } else {
        const windowValues = values.slice(i - this.config.trendWindow, i);
        const trend =
          (values[i] - windowValues[0]) /
          (windowValues[0] || 1) /
          this.config.trendWindow;
        trends.push(trend);
      }
    }

    // Detect anomalies
    for (let i = 0; i < data.length; i++) {
      const point = data[i];
      const value = point.value;
      const zScore = this.calculateZScore(value, stats.mean, stats.stdDev);
      const isZScoreAnomaly = Math.abs(zScore) > this.config.zScoreThreshold;
      const isIQRAnomaly = value < lowerBound || value > upperBound;

      if (isZScoreAnomaly || isIQRAnomaly) {
        const deviation = value - stats.mean;
        const deviationPercent = stats.mean !== 0 ? (deviation / stats.mean) * 100 : 0;
        const confidence = Math.min(1, Math.abs(zScore) / 5);

        anomalies.push({
          id: `anomaly_${i}_${Date.now()}`,
          timestamp: point.timestamp,
          value,
          expectedValue: stats.mean,
          deviation,
          deviationPercent,
          severity: this.determineSeverity(deviationPercent),
          type: this.determineType(value, stats.mean, trends[i]),
          confidence,
          metadata: point.metadata,
        });
      }
    }

    const detectionTime = performance.now() - startTime;

    logger.info("[AnomalyDetector] Detection complete", {
      points: data.length,
      anomalies: anomalies.length,
      timeMs: detectionTime.toFixed(2),
    });

    return {
      anomalies,
      statistics: stats,
      processedPoints: data.length,
      detectionTime,
    };
  }

  /**
   * Real-time anomaly check for a single value
   */
  checkRealtime(
    value: number,
    historicalValues: number[]
  ): { isAnomaly: boolean; details: Partial<Anomaly> | null } {
    if (historicalValues.length < this.config.minDataPoints) {
      return { isAnomaly: false, details: null };
    }

    const stats = this.calculateStatistics(historicalValues);
    const zScore = this.calculateZScore(value, stats.mean, stats.stdDev);

    const lowerBound = stats.q1 - this.config.iqrMultiplier * stats.iqr;
    const upperBound = stats.q3 + this.config.iqrMultiplier * stats.iqr;

    const isZScoreAnomaly = Math.abs(zScore) > this.config.zScoreThreshold;
    const isIQRAnomaly = value < lowerBound || value > upperBound;

    if (isZScoreAnomaly || isIQRAnomaly) {
      const deviation = value - stats.mean;
      const deviationPercent = stats.mean !== 0 ? (deviation / stats.mean) * 100 : 0;

      return {
        isAnomaly: true,
        details: {
          value,
          expectedValue: stats.mean,
          deviation,
          deviationPercent,
          severity: this.determineSeverity(deviationPercent),
          type: deviation > 0 ? "spike" : "drop",
          confidence: Math.min(1, Math.abs(zScore) / 5),
        },
      };
    }

    return { isAnomaly: false, details: null };
  }

  /**
   * Detect anomalies from raw data array
   * Use this method with pre-fetched data from Supabase
   */
  detectFromData(
    rawData: Array<{ timestamp: string | Date; value: number }>
  ): DetectionResult {
    const dataPoints: DataPoint[] = rawData.map((row) => ({
      timestamp: new Date(row.timestamp),
      value: Number(row.value),
    }));

    return this.detect(dataPoints);
  }
}

// Singleton instance with maritime-optimized thresholds
export const anomalyDetector = new AnomalyDetector({
  zScoreThreshold: 2.5,
  iqrMultiplier: 1.5,
  minDataPoints: 10,
  trendWindow: 7,
});

/**
 * Maritime-specific anomaly detection presets
 */
export const maritimeAnomalyPresets = {
  fuelConsumption: new AnomalyDetector({
    zScoreThreshold: 2.0,
    iqrMultiplier: 1.3,
    minDataPoints: 7,
    trendWindow: 3,
  }),
  crewHours: new AnomalyDetector({
    zScoreThreshold: 3.0, // More lenient for work hours
    iqrMultiplier: 2.0,
    minDataPoints: 14,
    trendWindow: 7,
  }),
  maintenanceCosts: new AnomalyDetector({
    zScoreThreshold: 2.5,
    iqrMultiplier: 1.5,
    minDataPoints: 12,
    trendWindow: 4,
  }),
  vesselSpeed: new AnomalyDetector({
    zScoreThreshold: 2.0,
    iqrMultiplier: 1.2,
    minDataPoints: 5,
    trendWindow: 3,
  }),
};
