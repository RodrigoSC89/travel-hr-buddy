/**
 * ONNX Predictive Maintenance Engine
 * ML model for equipment failure prediction with 30-day horizon
 */

import * as ort from 'onnxruntime-web';

export interface TelemetryReading {
  equipmentId: string;
  equipmentName: string;
  timestamp: Date;
  temperature: number;
  vibration: number;
  pressure: number;
  rpm: number;
  runningHours: number;
  oilQuality: number;
  humidity: number;
}

export interface FailurePrediction {
  equipmentId: string;
  equipmentName: string;
  failureProbability: number;
  predictedFailureDate: Date | null;
  daysToFailure: number | null;
  confidence: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  failureType: string;
  recommendedActions: string[];
  costImpact: number;
  downtimeHours: number;
}

export interface MaintenanceSchedule {
  equipmentId: string;
  scheduledDate: Date;
  maintenanceType: 'preventive' | 'predictive' | 'corrective';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedCost: number;
  estimatedDuration: number;
  requiredParts: string[];
  assignedTechnician?: string;
}

class ONNXPredictiveMaintenanceEngine {
  private session: ort.InferenceSession | null = null;
  private isLoaded = false;
  private readonly MODEL_PATH = '/models/nautilus_maintenance_predictor.onnx';
  
  // Equipment baselines for anomaly detection
  private baselines: Map<string, { temp: number; vibration: number; pressure: number }> = new Map();
  
  // Historical predictions for trend analysis
  private predictionHistory: Map<string, FailurePrediction[]> = new Map();

  async initialize(): Promise<boolean> {
    try {
      // Try to load ONNX model
      this.session = await ort.InferenceSession.create(this.MODEL_PATH, {
        executionProviders: ['wasm'],
        graphOptimizationLevel: 'all'
      });
      this.isLoaded = true;
      console.log('[ONNX-Maintenance] Model loaded successfully');
      return true;
    } catch (error) {
      console.warn('[ONNX-Maintenance] ONNX model not available, using heuristic fallback');
      this.isLoaded = false;
      return false;
    }
  }

  async predictFailure(telemetry: TelemetryReading[]): Promise<FailurePrediction[]> {
    const predictions: FailurePrediction[] = [];
    
    // Group by equipment
    const byEquipment = new Map<string, TelemetryReading[]>();
    for (const reading of telemetry) {
      const existing = byEquipment.get(reading.equipmentId) || [];
      existing.push(reading);
      byEquipment.set(reading.equipmentId, existing);
    }

    for (const [equipmentId, readings] of byEquipment) {
      const latest = readings[readings.length - 1];
      
      if (this.isLoaded && this.session) {
        // Use ONNX model
        const prediction = await this.runONNXInference(readings, latest);
        predictions.push(prediction);
      } else {
        // Fallback to heuristic analysis
        const prediction = this.heuristicPrediction(readings, latest);
        predictions.push(prediction);
      }
    }

    return predictions;
  }

  private async runONNXInference(
    readings: TelemetryReading[],
    latest: TelemetryReading
  ): Promise<FailurePrediction> {
    // Prepare input tensor: [temp, vibration, pressure, rpm, hours, oil, humidity, trend_temp, trend_vib, trend_pressure]
    const features = this.extractFeatures(readings);
    const inputTensor = new ort.Tensor('float32', features, [1, features.length]);

    try {
      const results = await this.session!.run({ input: inputTensor });
      const output = results.output.data as Float32Array;
      
      const failureProbability = output[0];
      const daysToFailure = Math.round(output[1] * 30); // Scaled to 30 days
      const failureTypeIndex = Math.round(output[2]);
      
      return this.buildPrediction(latest, failureProbability, daysToFailure, failureTypeIndex);
    } catch (error) {
      console.error('[ONNX-Maintenance] Inference error:', error);
      return this.heuristicPrediction(readings, latest);
    }
  }

  private extractFeatures(readings: TelemetryReading[]): Float32Array {
    const latest = readings[readings.length - 1];
    
    // Calculate trends (rate of change)
    const trends = this.calculateTrends(readings);
    
    // Get baseline deviations
    const baseline = this.getOrCreateBaseline(latest.equipmentId, readings);
    const tempDeviation = (latest.temperature - baseline.temp) / baseline.temp;
    const vibDeviation = (latest.vibration - baseline.vibration) / baseline.vibration;
    const pressDeviation = (latest.pressure - baseline.pressure) / baseline.pressure;

    return new Float32Array([
      latest.temperature / 100,
      latest.vibration / 10,
      latest.pressure / 1000,
      latest.rpm / 3000,
      latest.runningHours / 10000,
      latest.oilQuality / 100,
      latest.humidity / 100,
      trends.temperature,
      trends.vibration,
      trends.pressure,
      tempDeviation,
      vibDeviation,
      pressDeviation
    ]);
  }

  private calculateTrends(readings: TelemetryReading[]): { temperature: number; vibration: number; pressure: number } {
    if (readings.length < 2) {
      return { temperature: 0, vibration: 0, pressure: 0 };
    }

    const recentReadings = readings.slice(-10);
    const first = recentReadings[0];
    const last = recentReadings[recentReadings.length - 1];
    const timeDiff = (last.timestamp.getTime() - first.timestamp.getTime()) / (1000 * 60 * 60); // hours

    if (timeDiff === 0) return { temperature: 0, vibration: 0, pressure: 0 };

    return {
      temperature: (last.temperature - first.temperature) / timeDiff,
      vibration: (last.vibration - first.vibration) / timeDiff,
      pressure: (last.pressure - first.pressure) / timeDiff
    };
  }

  private getOrCreateBaseline(
    equipmentId: string,
    readings: TelemetryReading[]
  ): { temp: number; vibration: number; pressure: number } {
    if (this.baselines.has(equipmentId)) {
      return this.baselines.get(equipmentId)!;
    }

    // Calculate baseline from historical data (first 20% of readings or first reading)
    const baselineReadings = readings.slice(0, Math.max(1, Math.floor(readings.length * 0.2)));
    const baseline = {
      temp: baselineReadings.reduce((sum, r) => sum + r.temperature, 0) / baselineReadings.length,
      vibration: baselineReadings.reduce((sum, r) => sum + r.vibration, 0) / baselineReadings.length,
      pressure: baselineReadings.reduce((sum, r) => sum + r.pressure, 0) / baselineReadings.length
    };

    this.baselines.set(equipmentId, baseline);
    return baseline;
  }

  private heuristicPrediction(
    readings: TelemetryReading[],
    latest: TelemetryReading
  ): FailurePrediction {
    const trends = this.calculateTrends(readings);
    const baseline = this.getOrCreateBaseline(latest.equipmentId, readings);

    // Calculate anomaly scores
    const tempAnomaly = Math.abs(latest.temperature - baseline.temp) / baseline.temp;
    const vibAnomaly = Math.abs(latest.vibration - baseline.vibration) / baseline.vibration;
    const pressAnomaly = Math.abs(latest.pressure - baseline.pressure) / baseline.pressure;

    // Weighted failure probability
    const weights = { temp: 0.3, vib: 0.4, press: 0.2, oil: 0.1 };
    let failureProbability = 
      weights.temp * Math.min(tempAnomaly * 2, 1) +
      weights.vib * Math.min(vibAnomaly * 2, 1) +
      weights.press * Math.min(pressAnomaly * 2, 1) +
      weights.oil * (1 - latest.oilQuality / 100);

    // Adjust for trends
    if (trends.temperature > 0.5 || trends.vibration > 0.2) {
      failureProbability = Math.min(failureProbability * 1.5, 1);
    }

    // Estimate days to failure based on trend extrapolation
    let daysToFailure: number | null = null;
    if (failureProbability > 0.2) {
      daysToFailure = Math.round(30 * (1 - failureProbability));
    }

    // Determine failure type
    const failureTypeIndex = this.determineFailureType(tempAnomaly, vibAnomaly, pressAnomaly, latest.oilQuality);

    return this.buildPrediction(latest, failureProbability, daysToFailure, failureTypeIndex);
  }

  private determineFailureType(
    tempAnomaly: number,
    vibAnomaly: number,
    pressAnomaly: number,
    oilQuality: number
  ): number {
    // 0: bearing, 1: seal, 2: pump, 3: motor, 4: general
    if (vibAnomaly > tempAnomaly && vibAnomaly > pressAnomaly) return 0; // Bearing
    if (pressAnomaly > 0.3 && oilQuality < 50) return 1; // Seal leak
    if (pressAnomaly > 0.4) return 2; // Pump failure
    if (tempAnomaly > 0.4) return 3; // Motor overheating
    return 4; // General wear
  }

  private buildPrediction(
    latest: TelemetryReading,
    failureProbability: number,
    daysToFailure: number | null,
    failureTypeIndex: number
  ): FailurePrediction {
    const failureTypes = ['Bearing Failure', 'Seal Leak', 'Pump Failure', 'Motor Overheating', 'General Wear'];
    const failureType = failureTypes[failureTypeIndex] || 'Unknown';

    const riskLevel: FailurePrediction['riskLevel'] = 
      failureProbability > 0.75 ? 'critical' :
      failureProbability > 0.5 ? 'high' :
      failureProbability > 0.25 ? 'medium' : 'low';

    const recommendedActions = this.getRecommendedActions(failureType, riskLevel);
    const costImpact = this.estimateCostImpact(failureType, riskLevel);
    const downtimeHours = this.estimateDowntime(failureType, riskLevel);

    return {
      equipmentId: latest.equipmentId,
      equipmentName: latest.equipmentName,
      failureProbability,
      predictedFailureDate: daysToFailure ? new Date(Date.now() + daysToFailure * 24 * 60 * 60 * 1000) : null,
      daysToFailure,
      confidence: 0.85 - (failureProbability * 0.1), // Higher probability = slightly lower confidence
      riskLevel,
      failureType,
      recommendedActions,
      costImpact,
      downtimeHours
    };
  }

  private getRecommendedActions(failureType: string, riskLevel: string): string[] {
    const actions: string[] = [];

    switch (failureType) {
      case 'Bearing Failure':
        actions.push('Schedule bearing inspection');
        actions.push('Check lubrication levels');
        actions.push('Monitor vibration frequency');
        break;
      case 'Seal Leak':
        actions.push('Inspect seal integrity');
        actions.push('Check for oil contamination');
        actions.push('Prepare replacement seals');
        break;
      case 'Pump Failure':
        actions.push('Check pump pressure differential');
        actions.push('Inspect impeller condition');
        actions.push('Verify motor coupling alignment');
        break;
      case 'Motor Overheating':
        actions.push('Check cooling system');
        actions.push('Verify electrical connections');
        actions.push('Inspect winding insulation');
        break;
      default:
        actions.push('Perform general inspection');
        actions.push('Review maintenance logs');
    }

    if (riskLevel === 'critical' || riskLevel === 'high') {
      actions.unshift('URGENT: Schedule immediate inspection');
      actions.push('Prepare spare parts inventory');
    }

    return actions;
  }

  private estimateCostImpact(failureType: string, riskLevel: string): number {
    const baseCosts: Record<string, number> = {
      'Bearing Failure': 5000,
      'Seal Leak': 3000,
      'Pump Failure': 15000,
      'Motor Overheating': 20000,
      'General Wear': 2000
    };

    const riskMultiplier = {
      'low': 1,
      'medium': 1.5,
      'high': 2.5,
      'critical': 4
    };

    return (baseCosts[failureType] || 5000) * (riskMultiplier[riskLevel as keyof typeof riskMultiplier] || 1);
  }

  private estimateDowntime(failureType: string, riskLevel: string): number {
    const baseDowntime: Record<string, number> = {
      'Bearing Failure': 8,
      'Seal Leak': 4,
      'Pump Failure': 24,
      'Motor Overheating': 48,
      'General Wear': 2
    };

    const multiplier = riskLevel === 'critical' ? 2 : riskLevel === 'high' ? 1.5 : 1;
    return (baseDowntime[failureType] || 8) * multiplier;
  }

  generateMaintenanceSchedule(predictions: FailurePrediction[]): MaintenanceSchedule[] {
    return predictions
      .filter(p => p.riskLevel !== 'low')
      .sort((a, b) => b.failureProbability - a.failureProbability)
      .map(prediction => ({
        equipmentId: prediction.equipmentId,
        scheduledDate: prediction.predictedFailureDate 
          ? new Date(prediction.predictedFailureDate.getTime() - 7 * 24 * 60 * 60 * 1000) // 7 days before
          : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        maintenanceType: prediction.riskLevel === 'critical' ? 'corrective' : 'predictive',
        priority: prediction.riskLevel === 'critical' ? 'urgent' : 
                  prediction.riskLevel === 'high' ? 'high' : 'medium',
        estimatedCost: prediction.costImpact * 0.3, // Preventive costs less
        estimatedDuration: prediction.downtimeHours * 0.5,
        requiredParts: this.getRequiredParts(prediction.failureType)
      }));
  }

  private getRequiredParts(failureType: string): string[] {
    const parts: Record<string, string[]> = {
      'Bearing Failure': ['Roller bearing kit', 'Grease', 'Seals'],
      'Seal Leak': ['Mechanical seal', 'O-rings', 'Gaskets'],
      'Pump Failure': ['Impeller', 'Shaft sleeve', 'Packing'],
      'Motor Overheating': ['Fan blade', 'Thermal paste', 'Winding wire'],
      'General Wear': ['Lubricant', 'Filters', 'Fasteners']
    };
    return parts[failureType] || ['General maintenance kit'];
  }

  getSystemHealth(): { status: string; modelsLoaded: boolean; equipmentMonitored: number } {
    return {
      status: this.isLoaded ? 'operational' : 'fallback',
      modelsLoaded: this.isLoaded,
      equipmentMonitored: this.baselines.size
    };
  }
}

export const onnxPredictiveMaintenanceEngine = new ONNXPredictiveMaintenanceEngine();
