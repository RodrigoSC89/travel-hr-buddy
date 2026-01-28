/**
 * Advanced Anomaly Detection Engine
 * Statistical and ML-based anomaly detection for maritime operations
 */

export interface DataPoint {
  timestamp: string;
  value: number;
  metadata?: Record<string, unknown>;
}

export interface AnomalyResult {
  detected: boolean;
  confidence: number;
  anomaly_score: number;
  expected_range: { min: number; max: number };
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'statistical' | 'pattern' | 'contextual' | 'collective';
  description: string;
  recommendations: string[];
}

export interface TimeSeriesAnalysis {
  trend: 'increasing' | 'decreasing' | 'stable';
  seasonality: boolean;
  volatility: number;
  outliers: DataPoint[];
  forecast_7d: number[];
  confidence_intervals: { upper: number[]; lower: number[] };
}

export interface AnomalyDetectorConfig {
  window_size: number;
  sensitivity: 'low' | 'medium' | 'high';
  z_score_threshold: number;
  iqr_multiplier: number;
  enable_pattern_detection: boolean;
  enable_contextual_detection: boolean;
}

class AnomalyDetectorEngine {
  private config: AnomalyDetectorConfig = {
    window_size: 50,
    sensitivity: 'medium',
    z_score_threshold: 2.5,
    iqr_multiplier: 1.5,
    enable_pattern_detection: true,
    enable_contextual_detection: true
  };

  private history: Map<string, DataPoint[]> = new Map();

  /**
   * Configure anomaly detection parameters
   */
  configure(config: Partial<AnomalyDetectorConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Detect anomalies in single data point
   */
  detectPointAnomaly(
    seriesId: string,
    dataPoint: DataPoint,
    historicalData?: DataPoint[]
  ): AnomalyResult {
    const history = historicalData || this.history.get(seriesId) || [];
    
    // Update history
    const updatedHistory = [...history, dataPoint].slice(-this.config.window_size);
    this.history.set(seriesId, updatedHistory);

    if (updatedHistory.length < 10) {
      return this.noAnomalyResult('Insufficient historical data');
    }

    // Statistical anomaly detection
    const statisticalResult = this.detectStatisticalAnomaly(dataPoint, updatedHistory);
    
    // Pattern-based detection
    const patternResult = this.config.enable_pattern_detection 
      ? this.detectPatternAnomaly(dataPoint, updatedHistory)
      : this.noAnomalyResult('Pattern detection disabled');

    // Contextual detection
    const contextualResult = this.config.enable_contextual_detection
      ? this.detectContextualAnomaly(dataPoint, updatedHistory)
      : this.noAnomalyResult('Contextual detection disabled');

    // Combine results
    return this.combineDetectionResults([
      statisticalResult,
      patternResult,
      contextualResult
    ]);
  }

  /**
   * Detect anomalies in multiple series (collective anomaly detection)
   */
  detectCollectiveAnomalies(
    seriesData: Map<string, DataPoint[]>
  ): Map<string, AnomalyResult> {
    const results = new Map<string, AnomalyResult>();

    // Detect individual anomalies first
    seriesData.forEach((data, seriesId) => {
      if (data.length > 0) {
        const latest = data[data.length - 1];
        const result = this.detectPointAnomaly(seriesId, latest, data.slice(0, -1));
        results.set(seriesId, result);
      }
    });

    // Look for collective patterns
    const anomalousSeriesCount = Array.from(results.values()).filter(r => r.detected).length;
    const totalSeries = results.size;

    if (anomalousSeriesCount > totalSeries * 0.5) {
      // More than 50% of series showing anomalies - likely systematic issue
      results.forEach((result, seriesId) => {
        if (result.detected) {
          results.set(seriesId, {
            ...result,
            type: 'collective',
            severity: this.escalateSeverity(result.severity),
            description: `${result.description} (part of collective anomaly affecting ${anomalousSeriesCount}/${totalSeries} metrics)`
          });
        }
      });
    }

    return results;
  }

  /**
   * Analyze time series for trends and forecasting
   */
  analyzeTimeSeries(data: DataPoint[]): TimeSeriesAnalysis {
    if (data.length < 14) {
      throw new Error('Insufficient data for time series analysis (minimum 14 points required)');
    }

    const values = data.map(d => d.value);
    
    // Trend analysis
    const trend = this.detectTrend(values);
    
    // Seasonality detection (simplified)
    const seasonality = this.detectSeasonality(values);
    
    // Volatility calculation
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const volatility = Math.sqrt(variance) / mean;
    
    // Outlier detection
    const outliers = this.detectOutliers(data);
    
    // Simple forecasting (7 days)
    const forecast = this.generateForecast(values, 7);
    
    // Confidence intervals (95%)
    const stdDev = Math.sqrt(variance);
    const upperCI = forecast.map(f => f + 1.96 * stdDev);
    const lowerCI = forecast.map(f => f - 1.96 * stdDev);

    return {
      trend,
      seasonality,
      volatility: Math.round(volatility * 1000) / 1000,
      outliers,
      forecast_7d: forecast.map(f => Math.round(f * 100) / 100),
      confidence_intervals: {
        upper: upperCI.map(u => Math.round(u * 100) / 100),
        lower: lowerCI.map(l => Math.round(l * 100) / 100)
      }
    };
  }

  private detectStatisticalAnomaly(point: DataPoint, history: DataPoint[]): AnomalyResult {
    const values = history.map(d => d.value);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const stdDev = Math.sqrt(values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length);

    // Z-score detection
    const zScore = Math.abs(point.value - mean) / stdDev;
    const zScoreAnomaly = zScore > this.config.z_score_threshold;

    // IQR detection
    const sortedValues = [...values].sort((a, b) => a - b);
    const q1 = sortedValues[Math.floor(sortedValues.length * 0.25)];
    const q3 = sortedValues[Math.floor(sortedValues.length * 0.75)];
    const iqr = q3 - q1;
    const lowerBound = q1 - this.config.iqr_multiplier * iqr;
    const upperBound = q3 + this.config.iqr_multiplier * iqr;
    const iqrAnomaly = point.value < lowerBound || point.value > upperBound;

    const detected = zScoreAnomaly || iqrAnomaly;
    
    if (!detected) {
      return this.noAnomalyResult('Within statistical norms');
    }

    const anomalyScore = Math.max(zScore / this.config.z_score_threshold, 
      Math.max((lowerBound - point.value) / iqr, (point.value - upperBound) / iqr) / this.config.iqr_multiplier);

    return {
      detected: true,
      confidence: Math.min(0.95, anomalyScore / 2),
      anomaly_score: Math.round(anomalyScore * 100) / 100,
      expected_range: { min: lowerBound, max: upperBound },
      severity: this.calculateSeverity(anomalyScore),
      type: 'statistical',
      description: `Statistical anomaly: value ${point.value} deviates ${Math.round(zScore * 100) / 100} standard deviations from mean`,
      recommendations: this.generateRecommendations('statistical', anomalyScore)
    };
  }

  private detectPatternAnomaly(point: DataPoint, history: DataPoint[]): AnomalyResult {
    if (history.length < 20) {
      return this.noAnomalyResult('Insufficient data for pattern detection');
    }

    // Look for pattern breaks
    const recentTrend = this.calculateTrend(history.slice(-10).map(d => d.value));
    const expectedValue = this.predictNextValue(history.map(d => d.value));
    const deviation = Math.abs(point.value - expectedValue) / expectedValue;

    if (deviation > 0.15) { // 15% deviation from expected
      return {
        detected: true,
        confidence: Math.min(0.9, deviation * 2),
        anomaly_score: deviation,
        expected_range: { 
          min: expectedValue * 0.85, 
          max: expectedValue * 1.15 
        },
        severity: this.calculateSeverity(deviation * 2),
        type: 'pattern',
        description: `Pattern anomaly: expected ~${expectedValue.toFixed(2)}, got ${point.value}`,
        recommendations: this.generateRecommendations('pattern', deviation)
      };
    }

    return this.noAnomalyResult('Pattern within expected range');
  }

  private detectContextualAnomaly(point: DataPoint, history: DataPoint[]): AnomalyResult {
    // Context-based detection using metadata
    if (!point.metadata) {
      return this.noAnomalyResult('No contextual metadata available');
    }

    // Find similar contexts in history
    const similarContexts = history.filter(h => 
      h.metadata && this.isSimilarContext(point.metadata!, h.metadata)
    );

    if (similarContexts.length < 5) {
      return this.noAnomalyResult('Insufficient contextual data');
    }

    const contextualMean = similarContexts.reduce((sum, d) => sum + d.value, 0) / similarContexts.length;
    const contextualStdDev = Math.sqrt(
      similarContexts.reduce((sum, d) => sum + Math.pow(d.value - contextualMean, 2), 0) / similarContexts.length
    );

    const contextualZScore = Math.abs(point.value - contextualMean) / contextualStdDev;

    if (contextualZScore > 2) {
      return {
        detected: true,
        confidence: Math.min(0.85, contextualZScore / 3),
        anomaly_score: contextualZScore,
        expected_range: { 
          min: contextualMean - 2 * contextualStdDev, 
          max: contextualMean + 2 * contextualStdDev 
        },
        severity: this.calculateSeverity(contextualZScore / 2),
        type: 'contextual',
        description: `Contextual anomaly: unusual value for similar operating conditions`,
        recommendations: this.generateRecommendations('contextual', contextualZScore)
      };
    }

    return this.noAnomalyResult('Normal for current context');
  }

  private combineDetectionResults(results: AnomalyResult[]): AnomalyResult {
    const detectedResults = results.filter(r => r.detected);
    
    if (detectedResults.length === 0) {
      return results[0] || this.noAnomalyResult('No anomalies detected');
    }

    // Use the highest confidence result as primary
    const primary = detectedResults.reduce((max, current) => 
      current.confidence > max.confidence ? current : max
    );

    // Combine recommendations
    const allRecommendations = [...new Set(detectedResults.flatMap(r => r.recommendations))];

    return {
      ...primary,
      confidence: Math.min(0.98, primary.confidence + detectedResults.length * 0.05),
      description: detectedResults.length > 1 
        ? `Multiple anomaly types detected: ${detectedResults.map(r => r.type).join(', ')}`
        : primary.description,
      recommendations: allRecommendations
    };
  }

  private noAnomalyResult(reason: string): AnomalyResult {
    return {
      detected: false,
      confidence: 0.8,
      anomaly_score: 0,
      expected_range: { min: 0, max: 0 },
      severity: 'low',
      type: 'statistical',
      description: reason,
      recommendations: []
    };
  }

  private calculateSeverity(score: number): AnomalyResult['severity'] {
    if (score > 3) return 'critical';
    if (score > 2) return 'high';
    if (score > 1) return 'medium';
    return 'low';
  }

  private escalateSeverity(severity: AnomalyResult['severity']): AnomalyResult['severity'] {
    switch (severity) {
      case 'low': return 'medium';
      case 'medium': return 'high';
      case 'high': return 'critical';
      case 'critical': return 'critical';
    }
  }

  private generateRecommendations(type: string, score: number): string[] {
    const recommendations: string[] = [];

    if (score > 2) {
      recommendations.push('Immediate inspection required');
      recommendations.push('Notify operations team');
    } else if (score > 1.5) {
      recommendations.push('Schedule inspection within 24 hours');
      recommendations.push('Increase monitoring frequency');
    } else {
      recommendations.push('Continue monitoring');
    }

    switch (type) {
      case 'statistical':
        recommendations.push('Check sensor calibration');
        break;
      case 'pattern':
        recommendations.push('Review recent operational changes');
        break;
      case 'contextual':
        recommendations.push('Compare with similar equipment');
        break;
    }

    return recommendations;
  }

  private detectTrend(values: number[]): TimeSeriesAnalysis['trend'] {
    if (values.length < 5) return 'stable';

    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));

    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    const change = (secondAvg - firstAvg) / firstAvg;

    if (change > 0.05) return 'increasing';
    if (change < -0.05) return 'decreasing';
    return 'stable';
  }

  private detectSeasonality(values: number[]): boolean {
    // Simplified seasonality detection using autocorrelation
    if (values.length < 24) return false;

    const periods = [7, 14, 24]; // Check for weekly, bi-weekly, daily patterns
    
    for (const period of periods) {
      if (values.length < period * 2) continue;
      
      let correlation = 0;
      const validPairs = Math.floor(values.length / period) - 1;
      
      for (let i = 0; i < validPairs * period; i++) {
        const current = values[i];
        const lagged = values[i + period];
        correlation += current * lagged;
      }
      
      correlation /= (validPairs * period);
      
      if (correlation > 0.7) { // Strong correlation indicates seasonality
        return true;
      }
    }

    return false;
  }

  private detectOutliers(data: DataPoint[]): DataPoint[] {
    const values = data.map(d => d.value);
    const sorted = [...values].sort((a, b) => a - b);
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;

    return data.filter(d => d.value < lowerBound || d.value > upperBound);
  }

  private generateForecast(values: number[], days: number): number[] {
    // Simple linear trend forecast
    const n = values.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = values;

    // Calculate linear regression
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Generate forecast
    const forecast: number[] = [];
    for (let i = 0; i < days; i++) {
      const futureX = n + i;
      const futureY = slope * futureX + intercept;
      forecast.push(futureY);
    }

    return forecast;
  }

  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;
    
    const n = values.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * values[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);

    return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  }

  private predictNextValue(values: number[]): number {
    const trend = this.calculateTrend(values);
    const lastValue = values[values.length - 1];
    return lastValue + trend;
  }

  private isSimilarContext(context1: Record<string, unknown>, context2: Record<string, unknown>): boolean {
    const keys = Object.keys(context1);
    const matchingKeys = keys.filter(key => context1[key] === context2[key]);
    return matchingKeys.length / keys.length > 0.5; // 50% context similarity
  }
}

export const anomalyDetector = new AnomalyDetectorEngine();