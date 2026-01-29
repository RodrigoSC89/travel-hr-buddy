/**
 * Predictive IoT Analytics Engine
 * Análise preditiva com ML para dados de sensores IoT
 * INÉDITO: Previsão de falhas e anomalias em tempo real
 */

import { logger } from '@/lib/logger';
import type { SensorReading } from './IoTConnector';

interface AnomalyResult {
  sensorId: string;
  sensorType: string;
  isAnomaly: boolean;
  anomalyScore: number;
  deviation: number;
  expectedValue: number;
  actualValue: number;
  confidence: number;
  recommendation: string;
}

interface PredictionResult {
  sensorId: string;
  sensorType: string;
  currentValue: number;
  predictedValue: number;
  predictionHorizon: string;
  trend: 'increasing' | 'stable' | 'decreasing';
  failureProbability: number;
  estimatedTimeToFailure: string | null;
  confidence: number;
}

interface HealthScore {
  vesselId: string;
  overallScore: number;
  systemScores: Record<string, number>;
  criticalIssues: string[];
  recommendations: string[];
  lastUpdated: Date;
}

interface TimeSeriesPoint {
  timestamp: Date;
  value: number;
}

class PredictiveIoTAnalytics {
  private historicalData: Map<string, TimeSeriesPoint[]> = new Map();
  private baselineStats: Map<string, { mean: number; std: number; min: number; max: number }> = new Map();
  private ewmaState: Map<string, number> = new Map();
  private anomalyThreshold = 2.5; // Z-score threshold
  
  /**
   * Processa reading e detecta anomalias em tempo real
   */
  analyzeReading(reading: SensorReading): AnomalyResult {
    const key = `${reading.vesselId}:${reading.sensorId}`;
    
    // Armazenar em histórico
    this.storeReading(key, reading);
    
    // Obter baseline
    const baseline = this.getOrComputeBaseline(key);
    
    // Calcular z-score
    const zScore = baseline.std > 0 
      ? (reading.value - baseline.mean) / baseline.std 
      : 0;
    
    // Detectar anomalia
    const isAnomaly = Math.abs(zScore) > this.anomalyThreshold;
    const anomalyScore = Math.min(Math.abs(zScore) / 5, 1);
    
    // Gerar recomendação
    const recommendation = this.generateRecommendation(reading, isAnomaly, zScore);
    
    return {
      sensorId: reading.sensorId,
      sensorType: reading.type,
      isAnomaly,
      anomalyScore,
      deviation: zScore,
      expectedValue: baseline.mean,
      actualValue: reading.value,
      confidence: Math.min(this.getHistoricalData(key).length / 100, 1),
      recommendation,
    };
  }
  
  /**
   * Previsão de valores futuros usando EWMA
   */
  predictFutureValue(reading: SensorReading, horizonMinutes: number = 60): PredictionResult {
    const key = `${reading.vesselId}:${reading.sensorId}`;
    const history = this.getHistoricalData(key);
    
    // Calcular EWMA
    const alpha = 0.3;
    const currentEwma = this.ewmaState.get(key) || reading.value;
    const newEwma = alpha * reading.value + (1 - alpha) * currentEwma;
    this.ewmaState.set(key, newEwma);
    
    // Calcular tendência
    const recentValues = history.slice(-10);
    const trend = this.calculateTrend(recentValues);
    
    // Prever valor futuro
    const trendMultiplier = horizonMinutes / 60;
    const predictedValue = newEwma + trend.slope * trendMultiplier;
    
    // Calcular probabilidade de falha
    const baseline = this.getOrComputeBaseline(key);
    const failureProbability = this.calculateFailureProbability(
      reading.type,
      predictedValue,
      baseline
    );
    
    // Estimar tempo até falha
    const estimatedTimeToFailure = failureProbability > 0.5 
      ? this.estimateTimeToFailure(reading.type, reading.value, trend.slope, baseline)
      : null;
    
    return {
      sensorId: reading.sensorId,
      sensorType: reading.type,
      currentValue: reading.value,
      predictedValue,
      predictionHorizon: `${horizonMinutes} minutes`,
      trend: trend.slope > 0.1 ? 'increasing' : trend.slope < -0.1 ? 'decreasing' : 'stable',
      failureProbability,
      estimatedTimeToFailure,
      confidence: Math.min(history.length / 50, 1),
    };
  }
  
  /**
   * Calcula score de saúde do navio
   */
  calculateVesselHealthScore(vesselId: string, readings: SensorReading[]): HealthScore {
    const systemScores: Record<string, number[]> = {};
    const criticalIssues: string[] = [];
    const recommendations: string[] = [];
    
    // Analisar cada reading
    for (const reading of readings) {
      const analysis = this.analyzeReading(reading);
      
      // Agrupar por sistema
      const system = this.getSensorSystem(reading.type);
      if (!systemScores[system]) {
        systemScores[system] = [];
      }
      
      // Converter anomaly score para health score (inverso)
      const healthScore = 1 - analysis.anomalyScore;
      systemScores[system].push(healthScore);
      
      // Identificar problemas críticos
      if (analysis.isAnomaly && analysis.anomalyScore > 0.7) {
        criticalIssues.push(`${reading.type}: ${analysis.recommendation}`);
      }
      
      // Coletar recomendações
      if (analysis.recommendation && !analysis.recommendation.includes('Normal')) {
        recommendations.push(analysis.recommendation);
      }
    }
    
    // Calcular scores por sistema
    const systemHealthScores: Record<string, number> = {};
    for (const [system, scores] of Object.entries(systemScores)) {
      systemHealthScores[system] = scores.reduce((a, b) => a + b, 0) / scores.length;
    }
    
    // Calcular score geral ponderado
    const weights: Record<string, number> = {
      engine: 0.35,
      fuel: 0.25,
      navigation: 0.20,
      environmental: 0.10,
      cargo: 0.10,
    };
    
    let overallScore = 0;
    let totalWeight = 0;
    for (const [system, score] of Object.entries(systemHealthScores)) {
      const weight = weights[system] || 0.1;
      overallScore += score * weight;
      totalWeight += weight;
    }
    overallScore = totalWeight > 0 ? overallScore / totalWeight : 0.5;
    
    return {
      vesselId,
      overallScore: Math.round(overallScore * 100) / 100,
      systemScores: systemHealthScores,
      criticalIssues: criticalIssues.slice(0, 5),
      recommendations: [...new Set(recommendations)].slice(0, 5),
      lastUpdated: new Date(),
    };
  }
  
  /**
   * Armazena reading no histórico
   */
  private storeReading(key: string, reading: SensorReading): void {
    const history = this.historicalData.get(key) || [];
    history.push({ timestamp: reading.timestamp, value: reading.value });
    
    // Manter últimas 1000 leituras
    if (history.length > 1000) {
      history.shift();
    }
    
    this.historicalData.set(key, history);
  }
  
  /**
   * Obtém histórico de dados
   */
  private getHistoricalData(key: string): TimeSeriesPoint[] {
    return this.historicalData.get(key) || [];
  }
  
  /**
   * Calcula ou obtém baseline estatístico
   */
  private getOrComputeBaseline(key: string): { mean: number; std: number; min: number; max: number } {
    const existing = this.baselineStats.get(key);
    const history = this.getHistoricalData(key);
    
    // Recalcular se temos dados novos suficientes
    if (!existing || history.length % 50 === 0) {
      const values = history.map(h => h.value);
      if (values.length === 0) {
        return { mean: 0, std: 1, min: 0, max: 100 };
      }
      
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
      const std = Math.sqrt(variance) || 1;
      const min = Math.min(...values);
      const max = Math.max(...values);
      
      const baseline = { mean, std, min, max };
      this.baselineStats.set(key, baseline);
      return baseline;
    }
    
    return existing;
  }
  
  /**
   * Calcula tendência de série temporal
   */
  private calculateTrend(points: TimeSeriesPoint[]): { slope: number; intercept: number } {
    if (points.length < 2) {
      return { slope: 0, intercept: points[0]?.value || 0 };
    }
    
    const n = points.length;
    const xValues = points.map((_, i) => i);
    const yValues = points.map(p => p.value);
    
    const sumX = xValues.reduce((a, b) => a + b, 0);
    const sumY = yValues.reduce((a, b) => a + b, 0);
    const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
    const sumXX = xValues.reduce((sum, x) => sum + x * x, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    return { slope: slope || 0, intercept };
  }
  
  /**
   * Calcula probabilidade de falha
   */
  private calculateFailureProbability(
    sensorType: string,
    predictedValue: number,
    baseline: { mean: number; std: number; min: number; max: number }
  ): number {
    // Limites críticos por tipo de sensor
    const criticalLimits: Record<string, { min: number; max: number }> = {
      temperature: { min: -10, max: 120 },
      pressure: { min: 0, max: 400 },
      engine: { min: 0, max: 2500 },
      fuel: { min: 5, max: 100 },
      speed: { min: 0, max: 30 },
    };
    
    const limits = criticalLimits[sensorType] || { min: baseline.min - baseline.std * 3, max: baseline.max + baseline.std * 3 };
    
    // Calcular proximidade dos limites
    const range = limits.max - limits.min;
    let failureProb = 0;
    
    if (predictedValue <= limits.min) {
      failureProb = 1;
    } else if (predictedValue >= limits.max) {
      failureProb = 1;
    } else {
      // Calcular distância relativa do limite mais próximo
      const distFromMin = (predictedValue - limits.min) / range;
      const distFromMax = (limits.max - predictedValue) / range;
      const minDist = Math.min(distFromMin, distFromMax);
      
      // Probabilidade aumenta quando se aproxima dos limites
      failureProb = Math.max(0, 1 - minDist * 3);
    }
    
    return Math.min(failureProb, 1);
  }
  
  /**
   * Estima tempo até falha
   */
  private estimateTimeToFailure(
    sensorType: string,
    currentValue: number,
    trendSlope: number,
    baseline: { mean: number; std: number; min: number; max: number }
  ): string | null {
    if (Math.abs(trendSlope) < 0.01) {
      return null; // Tendência muito fraca
    }
    
    // Limite crítico
    const criticalLimit = trendSlope > 0 
      ? baseline.max + baseline.std * 2 
      : baseline.min - baseline.std * 2;
    
    // Tempo em unidades de amostragem até atingir o limite
    const timeToLimit = Math.abs((criticalLimit - currentValue) / trendSlope);
    
    if (timeToLimit > 1440) { // > 24h
      return `${Math.round(timeToLimit / 1440)} days`;
    } else if (timeToLimit > 60) {
      return `${Math.round(timeToLimit / 60)} hours`;
    } else {
      return `${Math.round(timeToLimit)} minutes`;
    }
  }
  
  /**
   * Gera recomendação baseada em análise
   */
  private generateRecommendation(reading: SensorReading, isAnomaly: boolean, zScore: number): string {
    if (!isAnomaly) {
      return `Normal operation - ${reading.type} within expected range`;
    }
    
    const direction = zScore > 0 ? 'high' : 'low';
    const severity = Math.abs(zScore) > 4 ? 'Critical' : Math.abs(zScore) > 3 ? 'High' : 'Moderate';
    
    const recommendations: Record<string, Record<string, string>> = {
      temperature: {
        high: 'Check cooling systems and ventilation. Consider reducing engine load.',
        low: 'Verify heating systems. Check for sensor malfunction.',
      },
      pressure: {
        high: 'Inspect pressure relief valves. Check for blockages in lines.',
        low: 'Check for leaks in the system. Verify pump operation.',
      },
      engine: {
        high: 'Reduce throttle. Check governor and fuel injection system.',
        low: 'Verify fuel supply. Check for mechanical issues.',
      },
      fuel: {
        high: 'Verify sensor calibration. Check for contamination.',
        low: 'Schedule refueling. Check for leaks or increased consumption.',
      },
      speed: {
        high: 'Verify propeller condition. Check for current/wind effects.',
        low: 'Check engine performance. Inspect hull for fouling.',
      },
    };
    
    const typeRecs = recommendations[reading.type] || { high: 'Investigate cause', low: 'Investigate cause' };
    return `${severity}: ${reading.type} is ${direction}. ${typeRecs[direction]}`;
  }
  
  /**
   * Mapeia tipo de sensor para sistema do navio
   */
  private getSensorSystem(sensorType: string): string {
    const systemMap: Record<string, string> = {
      temperature: 'engine',
      pressure: 'engine',
      engine: 'engine',
      fuel: 'fuel',
      speed: 'navigation',
      heading: 'navigation',
      gps: 'navigation',
      wind: 'environmental',
      humidity: 'environmental',
      cargo: 'cargo',
    };
    return systemMap[sensorType] || 'other';
  }
  
  /**
   * Limpa dados antigos para liberar memória
   */
  cleanup(maxAgeHours: number = 24): void {
    const cutoff = Date.now() - maxAgeHours * 60 * 60 * 1000;
    
    this.historicalData.forEach((history, key) => {
      const filtered = history.filter(h => h.timestamp.getTime() > cutoff);
      if (filtered.length === 0) {
        this.historicalData.delete(key);
        this.baselineStats.delete(key);
        this.ewmaState.delete(key);
      } else {
        this.historicalData.set(key, filtered);
      }
    });
  }
}

export const predictiveIoTAnalytics = new PredictiveIoTAnalytics();
export type { AnomalyResult, PredictionResult, HealthScore };
export default predictiveIoTAnalytics;
