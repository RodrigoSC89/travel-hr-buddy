/**
 * Predictive Maintenance ML - Nautilus One v3.2.0
 * Machine learning-powered failure prediction and anomaly detection
 */

// Types
interface Equipment {
  id: string;
  name: string;
  type: string;
  lastMaintenance: Date;
  operatingHours: number;
  installDate: Date;
  criticality: 'critical' | 'high' | 'medium' | 'low';
  status: 'operational' | 'degraded' | 'failed';
}

interface SensorData {
  sensorId: string;
  equipmentId: string;
  timestamp: Date;
  type: 'temperature' | 'vibration' | 'pressure' | 'flow' | 'voltage' | 'current';
  value: number;
  unit: string;
  normalRange: { min: number; max: number };
}

interface FailurePrediction {
  equipmentId: string;
  probability: number;
  daysUntilFailure: number;
  confidence: number;
  recommendation: {
    urgency: 'critical' | 'high' | 'medium' | 'low';
    action: string;
    reason: string;
  };
  estimatedCost: {
    preventive: number;
    reactive: number;
    savings: number;
  };
}

interface Anomaly {
  sensorId: string;
  equipmentId: string;
  value: number;
  expected: { min: number; max: number };
  deviation: number;
  severity: 'critical' | 'warning' | 'info';
  action: string;
}

interface MaintenanceSchedule {
  equipmentId: string;
  equipmentName: string;
  scheduledDate: Date;
  type: 'preventive' | 'predictive' | 'corrective';
  priority: number;
  estimatedDuration: number; // hours
  requiredParts: string[];
  estimatedCost: number;
}

// ML Model weights (simplified - in production use TensorFlow.js)
const FAILURE_WEIGHTS = {
  operatingHours: 0.3,
  timeSinceLastMaintenance: 0.25,
  sensorAnomalies: 0.25,
  age: 0.1,
  historicalFailures: 0.1,
};

// Equipment-specific failure rates (mean time between failures in hours)
const MTBF_BY_TYPE: Record<string, number> = {
  'main_engine': 20000,
  'generator': 15000,
  'pump': 10000,
  'compressor': 12000,
  'crane': 8000,
  'hvac': 18000,
  'steering': 25000,
  'navigation': 30000,
  default: 15000,
};

export class PredictiveMaintenanceML {
  private static sensorHistory: Map<string, SensorData[]> = new Map();
  
  // Predict failure probability for equipment
  static async predictFailure(
    equipment: Equipment,
    sensorData: SensorData[]
  ): Promise<FailurePrediction> {
    // Store sensor history
    const key = equipment.id;
    const existing = this.sensorHistory.get(key) || [];
    this.sensorHistory.set(key, [...existing, ...sensorData].slice(-1000));
    
    // Calculate failure probability using weighted factors
    const features = this.extractFeatures(equipment, sensorData);
    const probability = this.calculateFailureProbability(features);
    
    // Estimate days until failure
    const daysUntilFailure = this.estimateDaysUntilFailure(
      probability,
      equipment
    );
    
    // Calculate confidence based on data quality
    const confidence = this.calculateConfidence(sensorData.length);
    
    // Generate recommendation
    const recommendation = this.generateRecommendation(probability, daysUntilFailure);
    
    // Estimate costs
    const estimatedCost = this.estimateCosts(equipment, daysUntilFailure);
    
    return {
      equipmentId: equipment.id,
      probability: probability * 100,
      daysUntilFailure,
      confidence,
      recommendation,
      estimatedCost,
    };
  }
  
  // Detect anomalies in sensor data
  static detectAnomalies(sensorData: SensorData[]): Anomaly[] {
    const anomalies: Anomaly[] = [];
    
    for (const data of sensorData) {
      // Check against normal range
      if (data.value < data.normalRange.min || data.value > data.normalRange.max) {
        const deviation = this.calculateDeviation(data);
        
        anomalies.push({
          sensorId: data.sensorId,
          equipmentId: data.equipmentId,
          value: data.value,
          expected: data.normalRange,
          deviation,
          severity: this.calculateSeverity(deviation),
          action: this.suggestAction(data, deviation),
        });
      }
      
      // Check for trend anomalies
      const trendAnomaly = this.detectTrendAnomaly(data);
      if (trendAnomaly) {
        anomalies.push(trendAnomaly);
      }
    }
    
    return anomalies;
  }
  
  // Generate optimal maintenance schedule
  static async generateOptimalSchedule(
    equipment: Equipment[],
    constraints: {
      maxSimultaneous: number;
      preferredPorts: string[];
      budgetLimit: number;
      timeHorizon: number; // days
    }
  ): Promise<MaintenanceSchedule[]> {
    const schedule: MaintenanceSchedule[] = [];
    
    // Get predictions for all equipment
    const predictions = await Promise.all(
      equipment.map(async (eq) => {
        const sensorData = this.sensorHistory.get(eq.id) || [];
        return this.predictFailure(eq, sensorData);
      })
    );
    
    // Sort by urgency (combining probability and days until failure)
    const ranked = predictions
      .map((pred, index) => ({
        equipment: equipment[index],
        prediction: pred,
        urgencyScore: this.calculateUrgencyScore(pred),
      }))
      .sort((a, b) => b.urgencyScore - a.urgencyScore);
    
    // Schedule maintenance within constraints
    let currentBudget = 0;
    const scheduledDates: Date[] = [];
    
    for (const item of ranked) {
      if (currentBudget + item.prediction.estimatedCost.preventive > constraints.budgetLimit) {
        continue;
      }
      
      // Find optimal date
      const scheduledDate = this.findOptimalDate(
        item.prediction.daysUntilFailure,
        scheduledDates,
        constraints.maxSimultaneous
      );
      
      if (scheduledDate.getTime() <= Date.now() + constraints.timeHorizon * 24 * 60 * 60 * 1000) {
        schedule.push({
          equipmentId: item.equipment.id,
          equipmentName: item.equipment.name,
          scheduledDate,
          type: item.prediction.daysUntilFailure < 30 ? 'predictive' : 'preventive',
          priority: this.mapUrgencyToPriority(item.urgencyScore),
          estimatedDuration: this.estimateMaintenanceDuration(item.equipment),
          requiredParts: this.estimateRequiredParts(item.equipment),
          estimatedCost: item.prediction.estimatedCost.preventive,
        });
        
        scheduledDates.push(scheduledDate);
        currentBudget += item.prediction.estimatedCost.preventive;
      }
    }
    
    return schedule;
  }
  
  // Real-time monitoring
  static monitorInRealTime(
    sensorData: SensorData,
    onAnomaly: (anomaly: Anomaly) => void
  ): void {
    // Check for anomalies
    const anomalies = this.detectAnomalies([sensorData]);
    
    for (const anomaly of anomalies) {
      onAnomaly(anomaly);
    }
    
    // Store for trend analysis
    const key = sensorData.equipmentId;
    const existing = this.sensorHistory.get(key) || [];
    this.sensorHistory.set(key, [...existing, sensorData].slice(-1000));
  }
  
  // Private: Extract features from equipment and sensors
  private static extractFeatures(
    equipment: Equipment,
    sensorData: SensorData[]
  ): Record<string, number> {
    const now = new Date();
    const hoursSinceLastMaintenance = equipment.lastMaintenance
      ? (now.getTime() - equipment.lastMaintenance.getTime()) / (1000 * 60 * 60)
      : equipment.operatingHours;
    
    const ageInYears = (now.getTime() - equipment.installDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
    
    // Count sensor anomalies
    const anomalyCount = sensorData.filter(
      s => s.value < s.normalRange.min || s.value > s.normalRange.max
    ).length;
    
    return {
      operatingHours: equipment.operatingHours,
      hoursSinceLastMaintenance,
      ageInYears,
      anomalyCount,
      anomalyRatio: sensorData.length > 0 ? anomalyCount / sensorData.length : 0,
    };
  }
  
  // Private: Calculate failure probability
  private static calculateFailureProbability(features: Record<string, number>): number {
    // Simplified logistic regression
    const mtbf = MTBF_BY_TYPE['default'];
    
    // Operating hours factor
    const hoursRatio = features.operatingHours / mtbf;
    const hoursFactor = 1 / (1 + Math.exp(-5 * (hoursRatio - 0.8)));
    
    // Maintenance factor
    const maintenanceRatio = features.hoursSinceLastMaintenance / (mtbf * 0.2);
    const maintenanceFactor = 1 / (1 + Math.exp(-3 * (maintenanceRatio - 1)));
    
    // Anomaly factor
    const anomalyFactor = features.anomalyRatio;
    
    // Age factor
    const ageFactor = 1 / (1 + Math.exp(-0.5 * (features.ageInYears - 10)));
    
    // Weighted combination
    const probability = 
      FAILURE_WEIGHTS.operatingHours * hoursFactor +
      FAILURE_WEIGHTS.timeSinceLastMaintenance * maintenanceFactor +
      FAILURE_WEIGHTS.sensorAnomalies * anomalyFactor +
      FAILURE_WEIGHTS.age * ageFactor;
    
    return Math.min(1, Math.max(0, probability));
  }
  
  // Private: Estimate days until failure
  private static estimateDaysUntilFailure(
    probability: number,
    equipment: Equipment
  ): number {
    const mtbf = MTBF_BY_TYPE[equipment.type] || MTBF_BY_TYPE['default'];
    const remainingHours = mtbf * (1 - probability);
    const remainingDays = remainingHours / 24;
    
    return Math.max(1, Math.round(remainingDays));
  }
  
  // Private: Calculate confidence
  private static calculateConfidence(sampleSize: number): number {
    // More data = higher confidence
    const minSamples = 10;
    const optimalSamples = 100;
    
    if (sampleSize < minSamples) return 0.3;
    if (sampleSize >= optimalSamples) return 0.95;
    
    return 0.3 + (0.65 * (sampleSize - minSamples) / (optimalSamples - minSamples));
  }
  
  // Private: Generate recommendation
  private static generateRecommendation(
    probability: number,
    days: number
  ): { urgency: 'critical' | 'high' | 'medium' | 'low'; action: string; reason: string } {
    if (probability > 0.8 && days < 30) {
      return {
        urgency: 'critical',
        action: 'Schedule immediate maintenance',
        reason: 'High failure probability within 30 days',
      };
    } else if (probability > 0.6 && days < 60) {
      return {
        urgency: 'high',
        action: 'Plan maintenance within next port call',
        reason: 'Moderate failure risk within 60 days',
      };
    } else if (probability > 0.4) {
      return {
        urgency: 'medium',
        action: 'Include in next scheduled maintenance window',
        reason: 'Early warning signs detected',
      };
    } else {
      return {
        urgency: 'low',
        action: 'Monitor sensors, continue normal operations',
        reason: 'Normal operational parameters',
      };
    }
  }
  
  // Private: Estimate costs
  private static estimateCosts(
    equipment: Equipment,
    daysUntilFailure: number
  ): { preventive: number; reactive: number; savings: number } {
    // Base costs by equipment criticality
    const baseCosts: Record<string, { preventive: number; reactive: number }> = {
      critical: { preventive: 50000, reactive: 250000 },
      high: { preventive: 20000, reactive: 100000 },
      medium: { preventive: 5000, reactive: 25000 },
      low: { preventive: 1000, reactive: 5000 },
    };
    
    const costs = baseCosts[equipment.criticality] || baseCosts['medium'];
    
    // Adjust reactive cost based on urgency
    const urgencyMultiplier = daysUntilFailure < 7 ? 2 : daysUntilFailure < 30 ? 1.5 : 1;
    const adjustedReactive = costs.reactive * urgencyMultiplier;
    
    return {
      preventive: costs.preventive,
      reactive: adjustedReactive,
      savings: adjustedReactive - costs.preventive,
    };
  }
  
  // Private: Calculate deviation
  private static calculateDeviation(data: SensorData): number {
    const range = data.normalRange.max - data.normalRange.min;
    const mid = (data.normalRange.max + data.normalRange.min) / 2;
    return Math.abs(data.value - mid) / (range / 2);
  }
  
  // Private: Calculate severity
  private static calculateSeverity(deviation: number): 'critical' | 'warning' | 'info' {
    if (deviation > 2) return 'critical';
    if (deviation > 1.5) return 'warning';
    return 'info';
  }
  
  // Private: Suggest action for anomaly
  private static suggestAction(data: SensorData, deviation: number): string {
    if (deviation > 2) {
      return `Immediate inspection required for ${data.type} sensor`;
    } else if (deviation > 1.5) {
      return `Schedule inspection of ${data.type} sensor within 24 hours`;
    } else {
      return `Monitor ${data.type} readings closely`;
    }
  }
  
  // Private: Detect trend anomaly
  private static detectTrendAnomaly(data: SensorData): Anomaly | null {
    const history = this.sensorHistory.get(data.equipmentId) || [];
    const relevantHistory = history
      .filter(h => h.sensorId === data.sensorId)
      .slice(-20);
    
    if (relevantHistory.length < 5) return null;
    
    // Calculate trend
    const values = relevantHistory.map(h => h.value);
    const avgOld = values.slice(0, 5).reduce((a, b) => a + b, 0) / 5;
    const avgNew = values.slice(-5).reduce((a, b) => a + b, 0) / 5;
    const trendChange = (avgNew - avgOld) / avgOld;
    
    // Alert if significant trend change (>20%)
    if (Math.abs(trendChange) > 0.2) {
      return {
        sensorId: data.sensorId,
        equipmentId: data.equipmentId,
        value: data.value,
        expected: data.normalRange,
        deviation: Math.abs(trendChange),
        severity: Math.abs(trendChange) > 0.5 ? 'warning' : 'info',
        action: `${data.type} showing ${trendChange > 0 ? 'upward' : 'downward'} trend of ${Math.round(Math.abs(trendChange) * 100)}%`,
      };
    }
    
    return null;
  }
  
  // Private: Calculate urgency score
  private static calculateUrgencyScore(prediction: FailurePrediction): number {
    return (prediction.probability / 100) * (90 / prediction.daysUntilFailure);
  }
  
  // Private: Find optimal maintenance date
  private static findOptimalDate(
    daysUntilFailure: number,
    scheduledDates: Date[],
    maxSimultaneous: number
  ): Date {
    // Schedule at 70% of days until failure
    const targetDate = new Date(Date.now() + daysUntilFailure * 0.7 * 24 * 60 * 60 * 1000);
    
    // Check for conflicts
    let currentDate = targetDate;
    let attempts = 0;
    
    while (attempts < 30) {
      const sameDay = scheduledDates.filter(
        d => Math.abs(d.getTime() - currentDate.getTime()) < 24 * 60 * 60 * 1000
      );
      
      if (sameDay.length < maxSimultaneous) {
        return currentDate;
      }
      
      // Try next day
      currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
      attempts++;
    }
    
    return targetDate;
  }
  
  // Private: Map urgency to priority
  private static mapUrgencyToPriority(urgencyScore: number): number {
    if (urgencyScore > 0.8) return 1;
    if (urgencyScore > 0.6) return 2;
    if (urgencyScore > 0.4) return 3;
    if (urgencyScore > 0.2) return 4;
    return 5;
  }
  
  // Private: Estimate maintenance duration
  private static estimateMaintenanceDuration(equipment: Equipment): number {
    const durationByType: Record<string, number> = {
      'main_engine': 48,
      'generator': 24,
      'pump': 8,
      'compressor': 16,
      'crane': 24,
      'hvac': 12,
      'steering': 8,
      'navigation': 4,
    };
    
    return durationByType[equipment.type] || 12;
  }
  
  // Private: Estimate required parts
  private static estimateRequiredParts(equipment: Equipment): string[] {
    const partsByType: Record<string, string[]> = {
      'main_engine': ['Oil filters', 'Fuel filters', 'Gaskets', 'Belts'],
      'generator': ['Oil filters', 'Brushes', 'Bearings'],
      'pump': ['Seals', 'Impeller', 'Bearings'],
      'compressor': ['Filters', 'Valves', 'Gaskets'],
      'crane': ['Wire rope', 'Hydraulic seals', 'Bearings'],
      'hvac': ['Filters', 'Refrigerant', 'Belts'],
      'steering': ['Hydraulic oil', 'Seals'],
      'navigation': ['Spare boards', 'Fuses'],
    };
    
    return partsByType[equipment.type] || ['General maintenance kit'];
  }
}

export default PredictiveMaintenanceML;
