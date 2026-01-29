/**
 * 🔧 Predictive Maintenance Engine with TensorFlow.js
 * NAUTILUS ONE v5.0 - Revolutionary Maritime Maintenance
 * 
 * ML-powered maintenance prediction using sensor data,
 * historical patterns, and Weibull distribution analysis
 */

import * as tf from '@tensorflow/tfjs';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export interface SensorReading {
  equipmentId: string;
  timestamp: Date;
  vibration: number; // mm/s
  temperature: number; // celsius
  pressure: number; // bar
  oilLevel: number; // percentage
  rpm: number;
  loadFactor: number; // percentage
  noise: number; // dB
}

export interface EquipmentHealth {
  equipmentId: string;
  name: string;
  type: 'engine' | 'pump' | 'generator' | 'compressor' | 'hydraulic' | 'electrical';
  operatingHours: number;
  cycleCount: number;
  lastMaintenance: Date;
  lastInspection: Date;
  location: string;
  criticality: 'high' | 'medium' | 'low';
}

export interface MaintenanceRecord {
  id: string;
  equipmentId: string;
  date: Date;
  type: 'preventive' | 'corrective' | 'emergency' | 'condition_based';
  description: string;
  hoursWorked: number;
  cost: number;
  partsReplaced: string[];
  technician: string;
  outcome: 'success' | 'partial' | 'failure';
}

export interface FailurePrediction {
  equipmentId: string;
  equipmentName: string;
  failureProbability: number; // 0-100
  estimatedDaysUntilFailure: number;
  confidence: number; // 0-100
  urgency: 'critical' | 'high' | 'medium' | 'low';
  predictedFailureMode: string;
  riskFactors: { factor: string; contribution: number; trend: 'increasing' | 'stable' | 'decreasing' }[];
  recommendedAction: string;
  estimatedRepairCost: number;
  estimatedDowntime: number; // hours
  preventiveCost: number;
  aiReasoning: string[];
}

export interface MaintenancePlan {
  vesselId: string;
  generatedAt: Date;
  totalPredictedFailures: number;
  criticalItems: FailurePrediction[];
  schedule: ScheduledMaintenance[];
  estimatedTotalCost: number;
  estimatedTotalDowntime: number;
  spareParts: { partNumber: string; description: string; quantity: number; urgency: string }[];
  crewAssignments: { crew: string; tasks: string[] }[];
  savings: {
    preventive: number;
    avoidedDowntime: number;
    extendedLifespan: number;
    total: number;
  };
}

export interface ScheduledMaintenance {
  id: string;
  equipmentId: string;
  equipmentName: string;
  scheduledDate: Date;
  priority: 'critical' | 'high' | 'medium' | 'low';
  type: string;
  estimatedDuration: number; // hours
  assignedTo: string;
  parts: string[];
  cost: number;
}

// Weibull parameters for equipment types
const WEIBULL_PARAMS: Record<string, { beta: number; eta: number }> = {
  engine: { beta: 2.5, eta: 15000 },
  pump: { beta: 2.0, eta: 8000 },
  generator: { beta: 2.2, eta: 12000 },
  compressor: { beta: 1.8, eta: 6000 },
  hydraulic: { beta: 2.3, eta: 10000 },
  electrical: { beta: 1.5, eta: 20000 }
};

// Threshold values for anomaly detection
const THRESHOLDS = {
  vibration: { warning: 4.5, critical: 7.0 }, // mm/s
  temperature: { warning: 85, critical: 105 }, // celsius
  pressure: { warning: 0.8, critical: 0.6 }, // ratio to normal
  oilLevel: { warning: 30, critical: 15 }, // percentage
  noise: { warning: 85, critical: 95 } // dB
};

class PredictiveMaintenanceMLEngine {
  private model: tf.LayersModel | null = null;
  private isModelLoaded = false;
  private sensorHistory: Map<string, SensorReading[]> = new Map();

  /**
   * Initialize or load the TensorFlow.js model
   */
  async initializeModel(): Promise<void> {
    if (this.isModelLoaded) return;

    try {
      // Try to load pre-trained model
      this.model = await tf.loadLayersModel('/models/predictive-maintenance/model.json');
      this.isModelLoaded = true;
      logger.info('Loaded pre-trained predictive maintenance model');
    } catch {
      // Create new model if none exists
      this.model = this.createModel();
      this.isModelLoaded = true;
      logger.info('Created new predictive maintenance model');
    }
  }

  /**
   * Create a neural network model for failure prediction
   */
  private createModel(): tf.LayersModel {
    const model = tf.sequential();

    // Input layer - 10 features
    model.add(tf.layers.dense({
      inputShape: [10],
      units: 64,
      activation: 'relu',
      kernelRegularizer: tf.regularizers.l2({ l2: 0.01 })
    }));

    // Hidden layers
    model.add(tf.layers.dropout({ rate: 0.3 }));
    model.add(tf.layers.dense({ units: 32, activation: 'relu' }));
    model.add(tf.layers.dropout({ rate: 0.2 }));
    model.add(tf.layers.dense({ units: 16, activation: 'relu' }));

    // Output layer - failure probability and days until failure
    model.add(tf.layers.dense({ units: 2, activation: 'sigmoid' }));

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['mae']
    });

    return model;
  }

  /**
   * Extract features from sensor readings and equipment data
   */
  private extractFeatures(equipment: EquipmentHealth, readings: SensorReading[]): number[] {
    if (readings.length === 0) {
      // Return default features if no readings
      return [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5];
    }

    const latest = readings[readings.length - 1];
    const params = WEIBULL_PARAMS[equipment.type] || WEIBULL_PARAMS.engine;

    // Normalize operating hours
    const normalizedHours = Math.min(equipment.operatingHours / params.eta, 1);

    // Calculate days since last maintenance
    const daysSinceMaint = (Date.now() - equipment.lastMaintenance.getTime()) / (24 * 60 * 60 * 1000);
    const normalizedMaint = Math.min(daysSinceMaint / 365, 1);

    // Normalize sensor readings
    const normVibration = Math.min(latest.vibration / 10, 1);
    const normTemp = Math.min((latest.temperature - 20) / 100, 1);
    const normPressure = latest.pressure / 50;
    const normOil = latest.oilLevel / 100;
    const normRPM = latest.rpm / 3000;
    const normLoad = latest.loadFactor / 100;
    const normNoise = Math.min((latest.noise - 60) / 50, 1);

    // Calculate trend from history
    const trend = this.calculateTrend(readings);

    return [
      normalizedHours,
      normalizedMaint,
      normVibration,
      normTemp,
      normPressure,
      normOil,
      normRPM,
      normLoad,
      normNoise,
      trend
    ];
  }

  /**
   * Calculate overall trend from sensor history
   */
  private calculateTrend(readings: SensorReading[]): number {
    if (readings.length < 2) return 0.5;

    const recent = readings.slice(-10);
    let trendScore = 0;
    let count = 0;

    // Check vibration trend
    const vibrations = recent.map(r => r.vibration);
    if (vibrations.length >= 2) {
      const vibTrend = (vibrations[vibrations.length - 1] - vibrations[0]) / Math.max(vibrations[0], 1);
      trendScore += vibTrend > 0.1 ? 0.3 : vibTrend < -0.1 ? -0.1 : 0;
      count++;
    }

    // Check temperature trend
    const temps = recent.map(r => r.temperature);
    if (temps.length >= 2) {
      const tempTrend = (temps[temps.length - 1] - temps[0]) / Math.max(temps[0], 1);
      trendScore += tempTrend > 0.05 ? 0.3 : tempTrend < -0.05 ? -0.1 : 0;
      count++;
    }

    return count > 0 ? Math.min(Math.max((trendScore / count) + 0.5, 0), 1) : 0.5;
  }

  /**
   * Predict failure using ML model
   */
  async predictWithML(equipment: EquipmentHealth, readings: SensorReading[]): Promise<[number, number]> {
    await this.initializeModel();

    if (!this.model) {
      throw new Error('Model not initialized');
    }

    const features = this.extractFeatures(equipment, readings);
    const inputTensor = tf.tensor2d([features]);

    const prediction = this.model.predict(inputTensor) as tf.Tensor;
    const [failureProbability, daysNormalized] = await prediction.data();

    inputTensor.dispose();
    prediction.dispose();

    // Denormalize days (assume max 365 days)
    const daysUntilFailure = daysNormalized * 365;

    return [failureProbability * 100, daysUntilFailure];
  }

  /**
   * Calculate Weibull-based failure probability
   */
  private calculateWeibullProbability(
    operatingHours: number,
    beta: number,
    eta: number
  ): number {
    return (1 - Math.exp(-Math.pow(operatingHours / eta, beta))) * 100;
  }

  /**
   * Detect anomalies in sensor readings
   */
  private detectAnomalies(readings: SensorReading[]): { factor: string; contribution: number; trend: 'increasing' | 'stable' | 'decreasing' }[] {
    if (readings.length === 0) return [];

    const latest = readings[readings.length - 1];
    const anomalies: { factor: string; contribution: number; trend: 'increasing' | 'stable' | 'decreasing' }[] = [];

    // Check vibration
    if (latest.vibration > THRESHOLDS.vibration.critical) {
      anomalies.push({ factor: 'High vibration levels', contribution: 30, trend: 'increasing' });
    } else if (latest.vibration > THRESHOLDS.vibration.warning) {
      anomalies.push({ factor: 'Elevated vibration', contribution: 15, trend: 'increasing' });
    }

    // Check temperature
    if (latest.temperature > THRESHOLDS.temperature.critical) {
      anomalies.push({ factor: 'Critical temperature', contribution: 35, trend: 'increasing' });
    } else if (latest.temperature > THRESHOLDS.temperature.warning) {
      anomalies.push({ factor: 'High temperature', contribution: 20, trend: 'increasing' });
    }

    // Check oil level
    if (latest.oilLevel < THRESHOLDS.oilLevel.critical) {
      anomalies.push({ factor: 'Critical oil level', contribution: 25, trend: 'decreasing' });
    } else if (latest.oilLevel < THRESHOLDS.oilLevel.warning) {
      anomalies.push({ factor: 'Low oil level', contribution: 10, trend: 'decreasing' });
    }

    // Check noise
    if (latest.noise > THRESHOLDS.noise.critical) {
      anomalies.push({ factor: 'Excessive noise', contribution: 20, trend: 'increasing' });
    } else if (latest.noise > THRESHOLDS.noise.warning) {
      anomalies.push({ factor: 'Increased noise', contribution: 10, trend: 'stable' });
    }

    return anomalies;
  }

  /**
   * Predict failures for single equipment
   */
  async predictFailure(
    equipment: EquipmentHealth,
    readings: SensorReading[],
    history: MaintenanceRecord[]
  ): Promise<FailurePrediction> {
    const params = WEIBULL_PARAMS[equipment.type] || WEIBULL_PARAMS.engine;

    // Get ML prediction
    let mlProbability = 0;
    let mlDays = 180;

    try {
      [mlProbability, mlDays] = await this.predictWithML(equipment, readings);
    } catch (error) {
      logger.warn('ML prediction failed, using statistical model', { error });
    }

    // Get Weibull prediction
    const weibullProbability = this.calculateWeibullProbability(
      equipment.operatingHours,
      params.beta,
      params.eta
    );

    // Combine predictions (weighted average)
    const combinedProbability = readings.length > 0
      ? (mlProbability * 0.6 + weibullProbability * 0.4)
      : weibullProbability;

    // Detect anomalies
    const riskFactors = this.detectAnomalies(readings);

    // Add time-based risk factors
    const daysSinceMaint = (Date.now() - equipment.lastMaintenance.getTime()) / (24 * 60 * 60 * 1000);
    if (daysSinceMaint > 180) {
      riskFactors.push({
        factor: `${Math.round(daysSinceMaint)} days since last maintenance`,
        contribution: Math.min(daysSinceMaint / 10, 20),
        trend: 'increasing'
      });
    }

    // Calculate urgency
    let urgency: FailurePrediction['urgency'] = 'low';
    if (combinedProbability > 80 || mlDays < 7) urgency = 'critical';
    else if (combinedProbability > 60 || mlDays < 30) urgency = 'high';
    else if (combinedProbability > 40 || mlDays < 90) urgency = 'medium';

    // Generate recommendation
    let recommendation = 'Continue monitoring';
    let preventiveCost = 500;
    let repairCost = 5000;
    let downtime = 4;

    if (urgency === 'critical') {
      recommendation = 'Schedule immediate maintenance. Risk of imminent failure.';
      preventiveCost = 2000;
      repairCost = 15000;
      downtime = 24;
    } else if (urgency === 'high') {
      recommendation = 'Plan maintenance within 2 weeks. Degradation detected.';
      preventiveCost = 1500;
      repairCost = 10000;
      downtime = 16;
    } else if (urgency === 'medium') {
      recommendation = 'Schedule maintenance in next port call. Monitor closely.';
      preventiveCost = 1000;
      repairCost = 7000;
      downtime = 8;
    }

    // Determine failure mode
    let failureMode = 'General wear and tear';
    if (riskFactors.some(r => r.factor.includes('vibration'))) {
      failureMode = 'Bearing failure / mechanical imbalance';
    } else if (riskFactors.some(r => r.factor.includes('temperature'))) {
      failureMode = 'Overheating / cooling system failure';
    } else if (riskFactors.some(r => r.factor.includes('oil'))) {
      failureMode = 'Lubrication failure';
    }

    // Generate AI reasoning
    const reasoning: string[] = [
      `Operating hours: ${equipment.operatingHours.toLocaleString()} (${Math.round(equipment.operatingHours / params.eta * 100)}% of expected life)`,
      `Weibull reliability: ${(100 - weibullProbability).toFixed(1)}%`,
    ];

    if (readings.length > 0) {
      reasoning.push(`ML model confidence: ${mlProbability.toFixed(1)}% failure probability`);
      reasoning.push(`Estimated ${Math.round(mlDays)} days until intervention needed`);
    }

    riskFactors.forEach(rf => {
      reasoning.push(`Risk: ${rf.factor} (${rf.contribution}% contribution, ${rf.trend})`);
    });

    return {
      equipmentId: equipment.equipmentId,
      equipmentName: equipment.name,
      failureProbability: Math.round(combinedProbability * 10) / 10,
      estimatedDaysUntilFailure: Math.round(mlDays),
      confidence: readings.length > 5 ? 85 : readings.length > 0 ? 70 : 55,
      urgency,
      predictedFailureMode: failureMode,
      riskFactors,
      recommendedAction: recommendation,
      estimatedRepairCost: repairCost,
      estimatedDowntime: downtime,
      preventiveCost,
      aiReasoning: reasoning
    };
  }

  /**
   * Predict failures for all equipment on a vessel
   */
  async predictAllFailures(vesselId: string): Promise<FailurePrediction[]> {
    logger.info('Running predictive maintenance analysis', { vesselId });

    // Fetch equipment list (mock data for demo)
    const equipment = await this.getVesselEquipment(vesselId);
    const predictions: FailurePrediction[] = [];

    for (const equip of equipment) {
      const readings = this.sensorHistory.get(equip.equipmentId) || this.generateMockReadings();
      const history = await this.getMaintenanceHistory(equip.equipmentId);

      const prediction = await this.predictFailure(equip, readings, history);
      predictions.push(prediction);
    }

    // Sort by urgency and probability
    const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    predictions.sort((a, b) => {
      const urgencyDiff = urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
      if (urgencyDiff !== 0) return urgencyDiff;
      return b.failureProbability - a.failureProbability;
    });

    logger.info('Predictive maintenance analysis complete', {
      vesselId,
      totalEquipment: equipment.length,
      criticalItems: predictions.filter(p => p.urgency === 'critical').length
    });

    return predictions;
  }

  /**
   * Generate optimized maintenance plan
   */
  async generateMaintenancePlan(vesselId: string): Promise<MaintenancePlan> {
    const predictions = await this.predictAllFailures(vesselId);
    const criticalItems = predictions.filter(p => p.urgency === 'critical' || p.urgency === 'high');

    // Generate schedule
    const schedule: ScheduledMaintenance[] = predictions
      .filter(p => p.urgency !== 'low')
      .map((pred, idx) => ({
        id: `maint-${Date.now()}-${idx}`,
        equipmentId: pred.equipmentId,
        equipmentName: pred.equipmentName,
        scheduledDate: new Date(Date.now() + pred.estimatedDaysUntilFailure * 0.7 * 24 * 60 * 60 * 1000),
        priority: pred.urgency,
        type: 'Preventive maintenance',
        estimatedDuration: pred.estimatedDowntime / 2, // Preventive is faster
        assignedTo: 'Chief Engineer',
        parts: this.getRequiredParts(pred.predictedFailureMode),
        cost: pred.preventiveCost
      }));

    // Calculate totals
    const totalCost = schedule.reduce((sum, s) => sum + s.cost, 0);
    const totalDowntime = schedule.reduce((sum, s) => sum + s.estimatedDuration, 0);

    // Calculate savings
    const avoidedRepairCost = predictions.reduce((sum, p) => 
      p.urgency !== 'low' ? sum + (p.estimatedRepairCost - p.preventiveCost) : sum, 0
    );
    const avoidedDowntimeCost = predictions.reduce((sum, p) =>
      p.urgency !== 'low' ? sum + (p.estimatedDowntime - p.estimatedDowntime / 2) * 1000 : sum, 0
    );

    return {
      vesselId,
      generatedAt: new Date(),
      totalPredictedFailures: predictions.length,
      criticalItems,
      schedule,
      estimatedTotalCost: totalCost,
      estimatedTotalDowntime: totalDowntime,
      spareParts: this.consolidateParts(schedule),
      crewAssignments: [
        { crew: 'Chief Engineer', tasks: schedule.filter((_, i) => i % 2 === 0).map(s => s.equipmentName) },
        { crew: '2nd Engineer', tasks: schedule.filter((_, i) => i % 2 === 1).map(s => s.equipmentName) }
      ],
      savings: {
        preventive: avoidedRepairCost,
        avoidedDowntime: avoidedDowntimeCost,
        extendedLifespan: Math.round(avoidedRepairCost * 0.3),
        total: avoidedRepairCost + avoidedDowntimeCost + Math.round(avoidedRepairCost * 0.3)
      }
    };
  }

  /**
   * Get required parts for a failure mode
   */
  private getRequiredParts(failureMode: string): string[] {
    if (failureMode.includes('Bearing')) {
      return ['Bearing set', 'Lubricant', 'Seals'];
    } else if (failureMode.includes('temperature') || failureMode.includes('cooling')) {
      return ['Coolant', 'Thermostat', 'Gaskets'];
    } else if (failureMode.includes('oil') || failureMode.includes('Lubrication')) {
      return ['Oil filter', 'Lubricant', 'O-rings'];
    }
    return ['General maintenance kit', 'Lubricant'];
  }

  /**
   * Consolidate parts from all scheduled maintenance
   */
  private consolidateParts(schedule: ScheduledMaintenance[]): MaintenancePlan['spareParts'] {
    const partMap = new Map<string, { quantity: number; urgency: string }>();

    schedule.forEach(s => {
      s.parts.forEach(part => {
        const existing = partMap.get(part);
        if (existing) {
          existing.quantity++;
          if (s.priority === 'critical') existing.urgency = 'critical';
        } else {
          partMap.set(part, { quantity: 1, urgency: s.priority });
        }
      });
    });

    return Array.from(partMap.entries()).map(([part, data]) => ({
      partNumber: `PN-${part.replace(/\s/g, '-').toUpperCase()}`,
      description: part,
      quantity: data.quantity,
      urgency: data.urgency
    }));
  }

  /**
   * Get vessel equipment (mock implementation)
   */
  private async getVesselEquipment(vesselId: string): Promise<EquipmentHealth[]> {
    // In production, would fetch from database
    return [
      {
        equipmentId: 'eng-001',
        name: 'Main Engine #1',
        type: 'engine',
        operatingHours: 12500,
        cycleCount: 8500,
        lastMaintenance: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        lastInspection: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        location: 'Engine Room',
        criticality: 'high'
      },
      {
        equipmentId: 'gen-001',
        name: 'Generator #1',
        type: 'generator',
        operatingHours: 9800,
        cycleCount: 6200,
        lastMaintenance: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        lastInspection: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        location: 'Generator Room',
        criticality: 'high'
      },
      {
        equipmentId: 'pump-001',
        name: 'Bilge Pump',
        type: 'pump',
        operatingHours: 5200,
        cycleCount: 15000,
        lastMaintenance: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        lastInspection: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        location: 'Lower Deck',
        criticality: 'medium'
      },
      {
        equipmentId: 'hyd-001',
        name: 'Hydraulic System',
        type: 'hydraulic',
        operatingHours: 7800,
        cycleCount: 12000,
        lastMaintenance: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000),
        lastInspection: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
        location: 'Deck Equipment',
        criticality: 'high'
      },
      {
        equipmentId: 'comp-001',
        name: 'Air Compressor',
        type: 'compressor',
        operatingHours: 4500,
        cycleCount: 22000,
        lastMaintenance: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        lastInspection: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        location: 'Engine Room',
        criticality: 'medium'
      }
    ];
  }

  /**
   * Get maintenance history for equipment
   */
  private async getMaintenanceHistory(equipmentId: string): Promise<MaintenanceRecord[]> {
    try {
      const { data } = await supabase
        .from('maintenance_tasks')
        .select('*')
        .eq('equipment_id', equipmentId)
        .order('created_at', { ascending: false })
        .limit(10);

      return (data || []).map(task => ({
        id: task.id,
        equipmentId: equipmentId,
        date: new Date(task.created_at),
        type: 'preventive' as const,
        description: task.description || '',
        hoursWorked: 4,
        cost: 500,
        partsReplaced: [],
        technician: 'Chief Engineer',
        outcome: 'success' as const
      }));
    } catch {
      return [];
    }
  }

  /**
   * Generate mock sensor readings for demo
   */
  private generateMockReadings(): SensorReading[] {
    const readings: SensorReading[] = [];
    const now = Date.now();

    // Deterministic sensor readings using sine/cosine for realistic patterns
    for (let i = 0; i < 24; i++) {
      const hourFactor = i / 24;
      const sinFactor = Math.sin(i * 0.5);
      const cosFactor = Math.cos(i * 0.3);
      
      readings.push({
        equipmentId: 'demo',
        timestamp: new Date(now - (24 - i) * 60 * 60 * 1000),
        vibration: 3.5 + sinFactor * 1.5 + hourFactor * 0.5,
        temperature: 72 + cosFactor * 8 + hourFactor * 5,
        pressure: 35 + sinFactor * 5,
        oilLevel: 75 - Math.abs(cosFactor) * 5 - hourFactor * 5,
        rpm: 2000 + sinFactor * 200,
        loadFactor: 72 + cosFactor * 12,
        noise: 77 + sinFactor * 8
      });
    }

    return readings;
  }

  /**
   * Add sensor reading to history
   */
  addSensorReading(reading: SensorReading): void {
    const history = this.sensorHistory.get(reading.equipmentId) || [];
    history.push(reading);
    
    // Keep last 1000 readings
    if (history.length > 1000) {
      history.shift();
    }
    
    this.sensorHistory.set(reading.equipmentId, history);
  }
}

export const predictiveMaintenanceMLEngine = new PredictiveMaintenanceMLEngine();
