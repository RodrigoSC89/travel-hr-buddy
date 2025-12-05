/**
 * Predictive Maintenance AI System - PATCH 950
 * Offline-first predictive maintenance with embedded AI
 */

import { getCachedData, cacheData } from '@/lib/offline/sync-queue';

export interface MaintenanceHistory {
  equipmentId: string;
  timestamp: Date;
  type: 'preventive' | 'corrective' | 'emergency';
  description: string;
  hoursWorked: number;
  cost?: number;
  partReplaced?: string;
}

export interface EquipmentMetrics {
  equipmentId: string;
  name: string;
  operatingHours: number;
  cycleCount: number;
  lastMaintenance: Date;
  avgTimeBetweenFailures: number;
  vibrationLevel?: number;
  temperature?: number;
  oilPressure?: number;
  fuelConsumption?: number;
}

export interface PredictionResult {
  equipmentId: string;
  equipmentName: string;
  riskScore: number; // 0-100
  predictedFailureDate?: Date;
  confidence: number;
  recommendedAction: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  reasoning: string[];
  estimatedCost?: number;
  partsNeeded?: string[];
}

export interface AnomalyPattern {
  type: string;
  description: string;
  occurrences: number;
  lastOccurrence: Date;
  severity: number;
}

// Weibull distribution parameters for different equipment types
const EQUIPMENT_PROFILES: Record<string, { beta: number; eta: number; minHours: number }> = {
  engine: { beta: 2.5, eta: 15000, minHours: 500 },
  pump: { beta: 2.0, eta: 8000, minHours: 200 },
  generator: { beta: 2.2, eta: 12000, minHours: 400 },
  compressor: { beta: 1.8, eta: 6000, minHours: 150 },
  hydraulic: { beta: 2.3, eta: 10000, minHours: 300 },
  electrical: { beta: 1.5, eta: 20000, minHours: 100 },
  default: { beta: 2.0, eta: 10000, minHours: 250 }
};

class PredictiveMaintenanceEngine {
  private historyCache: Map<string, MaintenanceHistory[]> = new Map();
  private metricsCache: Map<string, EquipmentMetrics> = new Map();
  private anomalyPatterns: Map<string, AnomalyPattern[]> = new Map();

  /**
   * Calculate failure probability using Weibull distribution
   */
  private calculateWeibullProbability(
    operatingHours: number,
    beta: number,
    eta: number
  ): number {
    // F(t) = 1 - e^(-(t/eta)^beta)
    return 1 - Math.exp(-Math.pow(operatingHours / eta, beta));
  }

  /**
   * Calculate remaining useful life
   */
  private calculateRUL(
    operatingHours: number,
    beta: number,
    eta: number,
    targetReliability: number = 0.9
  ): number {
    // Solve for t where R(t) = targetReliability
    // R(t) = e^(-(t/eta)^beta)
    // t = eta * (-ln(R))^(1/beta)
    const targetTime = eta * Math.pow(-Math.log(targetReliability), 1 / beta);
    return Math.max(0, targetTime - operatingHours);
  }

  /**
   * Detect patterns in maintenance history
   */
  private detectPatterns(history: MaintenanceHistory[]): AnomalyPattern[] {
    const patterns: AnomalyPattern[] = [];
    
    if (history.length < 3) return patterns;

    // Group by type
    const byType = history.reduce((acc, h) => {
      acc[h.type] = acc[h.type] || [];
      acc[h.type].push(h);
      return acc;
    }, {} as Record<string, MaintenanceHistory[]>);

    // Detect frequent emergency repairs
    if (byType.emergency && byType.emergency.length >= 2) {
      patterns.push({
        type: 'frequent_emergency',
        description: 'Multiple emergency repairs detected',
        occurrences: byType.emergency.length,
        lastOccurrence: new Date(Math.max(...byType.emergency.map(h => h.timestamp.getTime()))),
        severity: Math.min(100, byType.emergency.length * 25)
      });
    }

    // Detect decreasing time between failures
    const sortedHistory = [...history].sort((a, b) => 
      a.timestamp.getTime() - b.timestamp.getTime()
    );
    
    const intervals: number[] = [];
    for (let i = 1; i < sortedHistory.length; i++) {
      intervals.push(
        (sortedHistory[i].timestamp.getTime() - sortedHistory[i - 1].timestamp.getTime()) / 
        (1000 * 60 * 60 * 24)
      );
    }

    if (intervals.length >= 2) {
      const trend = intervals[intervals.length - 1] - intervals[0];
      if (trend < -7) { // Decreasing by more than 7 days
        patterns.push({
          type: 'decreasing_mtbf',
          description: 'Time between failures is decreasing',
          occurrences: intervals.length,
          lastOccurrence: sortedHistory[sortedHistory.length - 1].timestamp,
          severity: Math.min(100, Math.abs(trend) * 5)
        });
      }
    }

    // Detect repeated part replacements
    const partCounts = history
      .filter(h => h.partReplaced)
      .reduce((acc, h) => {
        acc[h.partReplaced!] = (acc[h.partReplaced!] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    Object.entries(partCounts).forEach(([part, count]) => {
      if (count >= 3) {
        patterns.push({
          type: 'repeated_part_failure',
          description: `Part "${part}" replaced ${count} times`,
          occurrences: count,
          lastOccurrence: history
            .filter(h => h.partReplaced === part)
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0].timestamp,
          severity: Math.min(100, count * 20)
        });
      }
    });

    return patterns;
  }

  /**
   * Analyze sensor data for anomalies
   */
  private analyzeSensorData(metrics: EquipmentMetrics): string[] {
    const anomalies: string[] = [];

    if (metrics.vibrationLevel !== undefined && metrics.vibrationLevel > 4.5) {
      anomalies.push(`Vibração elevada: ${metrics.vibrationLevel.toFixed(1)} mm/s (limite: 4.5)`);
    }

    if (metrics.temperature !== undefined && metrics.temperature > 85) {
      anomalies.push(`Temperatura alta: ${metrics.temperature}°C (limite: 85°C)`);
    }

    if (metrics.oilPressure !== undefined && metrics.oilPressure < 30) {
      anomalies.push(`Pressão de óleo baixa: ${metrics.oilPressure} PSI (mínimo: 30)`);
    }

    if (metrics.fuelConsumption !== undefined) {
      // Compare with baseline (simplified)
      const baselineConsumption = 50; // L/h baseline
      const deviation = ((metrics.fuelConsumption - baselineConsumption) / baselineConsumption) * 100;
      if (deviation > 15) {
        anomalies.push(`Consumo de combustível ${deviation.toFixed(0)}% acima do normal`);
      }
    }

    return anomalies;
  }

  /**
   * Generate prediction for equipment
   */
  async predict(
    metrics: EquipmentMetrics,
    history: MaintenanceHistory[] = []
  ): Promise<PredictionResult> {
    // Determine equipment profile
    const profileKey = Object.keys(EQUIPMENT_PROFILES).find(key => 
      metrics.name.toLowerCase().includes(key)
    ) || 'default';
    const profile = EQUIPMENT_PROFILES[profileKey];

    // Calculate base failure probability
    const baseProbability = this.calculateWeibullProbability(
      metrics.operatingHours,
      profile.beta,
      profile.eta
    );

    // Calculate RUL
    const rul = this.calculateRUL(
      metrics.operatingHours,
      profile.beta,
      profile.eta
    );

    // Detect patterns
    const patterns = this.detectPatterns(history);
    this.anomalyPatterns.set(metrics.equipmentId, patterns);

    // Analyze sensor data
    const sensorAnomalies = this.analyzeSensorData(metrics);

    // Calculate adjusted risk score
    let riskScore = baseProbability * 100;
    
    // Adjust for patterns
    patterns.forEach(p => {
      riskScore += p.severity * 0.1;
    });

    // Adjust for sensor anomalies
    riskScore += sensorAnomalies.length * 10;

    // Adjust for time since last maintenance
    const daysSinceLastMaintenance = 
      (Date.now() - metrics.lastMaintenance.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceLastMaintenance > 90) {
      riskScore += (daysSinceLastMaintenance - 90) * 0.5;
    }

    // Cap risk score
    riskScore = Math.min(100, Math.max(0, riskScore));

    // Determine urgency
    let urgency: PredictionResult['urgency'] = 'low';
    if (riskScore > 80) urgency = 'critical';
    else if (riskScore > 60) urgency = 'high';
    else if (riskScore > 40) urgency = 'medium';

    // Build reasoning
    const reasoning: string[] = [];
    reasoning.push(`Horas de operação: ${metrics.operatingHours}h (perfil: ${profileKey})`);
    reasoning.push(`Probabilidade base de falha: ${(baseProbability * 100).toFixed(1)}%`);
    reasoning.push(`Vida útil remanescente estimada: ${rul.toFixed(0)}h`);
    
    if (patterns.length > 0) {
      reasoning.push(`Padrões detectados: ${patterns.map(p => p.type).join(', ')}`);
    }
    
    sensorAnomalies.forEach(a => reasoning.push(a));

    // Determine recommended action
    let recommendedAction = 'Monitoramento contínuo';
    const partsNeeded: string[] = [];
    
    if (urgency === 'critical') {
      recommendedAction = 'MANUTENÇÃO IMEDIATA NECESSÁRIA - Parar equipamento';
      partsNeeded.push('Kit de reparo completo', 'Óleo lubrificante', 'Filtros');
    } else if (urgency === 'high') {
      recommendedAction = 'Agendar manutenção preventiva em 7 dias';
      partsNeeded.push('Filtros', 'Juntas');
    } else if (urgency === 'medium') {
      recommendedAction = 'Planejar manutenção para próximas 4 semanas';
    }

    // Calculate predicted failure date
    const predictedFailureDate = rul > 0 
      ? new Date(Date.now() + rul * 60 * 60 * 1000)
      : undefined;

    // Estimate cost based on urgency
    const estimatedCost = urgency === 'critical' ? 25000 
      : urgency === 'high' ? 15000 
      : urgency === 'medium' ? 8000 
      : 3000;

    const result: PredictionResult = {
      equipmentId: metrics.equipmentId,
      equipmentName: metrics.name,
      riskScore,
      predictedFailureDate,
      confidence: Math.max(0.5, 0.95 - (patterns.length * 0.05)),
      recommendedAction,
      urgency,
      reasoning,
      estimatedCost,
      partsNeeded: partsNeeded.length > 0 ? partsNeeded : undefined
    };

    // Cache result
    await cacheData(`prediction_${metrics.equipmentId}`, result, 60 * 60 * 1000);

    return result;
  }

  /**
   * Batch predict for multiple equipment
   */
  async predictAll(
    equipmentList: EquipmentMetrics[],
    historyMap: Map<string, MaintenanceHistory[]>
  ): Promise<PredictionResult[]> {
    const results = await Promise.all(
      equipmentList.map(eq => 
        this.predict(eq, historyMap.get(eq.equipmentId) || [])
      )
    );

    // Sort by risk score
    return results.sort((a, b) => b.riskScore - a.riskScore);
  }

  /**
   * Get anomaly patterns for equipment
   */
  getAnomalyPatterns(equipmentId: string): AnomalyPattern[] {
    return this.anomalyPatterns.get(equipmentId) || [];
  }

  /**
   * Generate maintenance schedule based on predictions
   */
  generateSchedule(predictions: PredictionResult[]): {
    week: PredictionResult[];
    month: PredictionResult[];
    quarter: PredictionResult[];
  } {
    const now = Date.now();
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    const oneMonth = 30 * 24 * 60 * 60 * 1000;
    const oneQuarter = 90 * 24 * 60 * 60 * 1000;

    return {
      week: predictions.filter(p => 
        p.urgency === 'critical' || p.urgency === 'high' ||
        (p.predictedFailureDate && p.predictedFailureDate.getTime() - now < oneWeek)
      ),
      month: predictions.filter(p => 
        p.urgency === 'medium' ||
        (p.predictedFailureDate && 
         p.predictedFailureDate.getTime() - now >= oneWeek &&
         p.predictedFailureDate.getTime() - now < oneMonth)
      ),
      quarter: predictions.filter(p => 
        p.urgency === 'low' ||
        (p.predictedFailureDate && 
         p.predictedFailureDate.getTime() - now >= oneMonth &&
         p.predictedFailureDate.getTime() - now < oneQuarter)
      )
    };
  }
}

export const predictiveMaintenanceEngine = new PredictiveMaintenanceEngine();
