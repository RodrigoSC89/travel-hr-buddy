/**
 * Sistema Autônomo de Wellness Preditivo (SAWP)
 * Predictive crew wellness monitoring with burnout detection
 */

export interface CrewWellnessData {
  crewId: string;
  name: string;
  rank: string;
  timestamp: Date;
  metrics: WellnessMetrics;
  wearableData?: WearableData;
  behavioralData?: BehavioralData;
  workData?: WorkData;
}

export interface WellnessMetrics {
  overallScore: number; // 0-100
  moodScore: number; // 1-5
  fatigueLevel: number; // 1-10
  stressLevel: number; // 1-10
  satisfactionScore: number; // 1-5
  sleepQuality: number; // 0-100
}

export interface WearableData {
  heartRate: number;
  heartRateVariability: number;
  stepsToday: number;
  sleepHours: number;
  deepSleepPercent: number;
  remSleepPercent: number;
  restingHeartRate: number;
  bloodOxygen?: number;
}

export interface BehavioralData {
  phoneUnlocks: number;
  appUsageMinutes: number;
  socialInteractions: number;
  messagesSent: number;
  screenTimeHours: number;
}

export interface WorkData {
  hoursWorked: number;
  tasksCompleted: number;
  errorsCommitted: number;
  breaksTaken: number;
  overtimeHours: number;
  consecutiveWorkDays: number;
}

export interface BurnoutPrediction {
  crewId: string;
  riskScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  predictedDaysToBurnout: number;
  confidence: number;
  contributingFactors: ContributingFactor[];
  recommendations: WellnessRecommendation[];
  interventionUrgency: 'none' | 'low' | 'medium' | 'high' | 'immediate';
}

export interface ContributingFactor {
  factor: string;
  impact: number; // 0-100
  trend: 'improving' | 'stable' | 'declining';
  details: string;
}

export interface WellnessRecommendation {
  priority: number;
  type: 'rest' | 'rotation' | 'counseling' | 'medical' | 'workload' | 'social';
  action: string;
  expectedOutcome: string;
  estimatedRecoveryDays: number;
  roi?: { cost: number; benefit: number };
}

export interface WellnessTrend {
  crewId: string;
  period: '7d' | '14d' | '30d';
  metrics: {
    date: string;
    overallScore: number;
    moodScore: number;
    fatigueLevel: number;
  }[];
  trend: 'improving' | 'stable' | 'declining' | 'critical';
  forecast: { date: string; predictedScore: number }[];
}

export interface WellnessAlert {
  id: string;
  crewId: string;
  crewName: string;
  type: 'burnout_risk' | 'fatigue' | 'stress' | 'health' | 'isolation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  intervention?: string;
}

// Simulated crew wellness database
const crewWellnessHistory: Map<string, CrewWellnessData[]> = new Map();

/**
 * Wellness Predictive System
 */
export class WellnessPredictiveSystem {
  private alerts: WellnessAlert[] = [];
  private predictions: Map<string, BurnoutPrediction> = new Map();

  constructor() {
    this.initializeSampleData();
  }

  private initializeSampleData(): void {
    const sampleCrew = [
      { id: 'crew-001', name: 'Carlos Silva', rank: 'Chief Officer' },
      { id: 'crew-002', name: 'Ana Santos', rank: 'Second Engineer' },
      { id: 'crew-003', name: 'Roberto Lima', rank: 'Bosun' },
      { id: 'crew-004', name: 'Maria Costa', rank: 'Chief Cook' }
    ];

    for (const crew of sampleCrew) {
      const history: CrewWellnessData[] = [];
      
      // Generate 30 days of historical data
      for (let day = 30; day >= 0; day--) {
        const date = new Date();
        date.setDate(date.getDate() - day);
        
        // Simulate declining wellness for crew-003 (burnout risk)
        const isBurnoutRisk = crew.id === 'crew-003';
        const baseScore = isBurnoutRisk ? 85 - day * 1.5 : 75 + Math.random() * 15;
        
        history.push({
          crewId: crew.id,
          name: crew.name,
          rank: crew.rank,
          timestamp: date,
          metrics: {
            overallScore: Math.max(30, Math.min(100, baseScore + Math.random() * 10 - 5)),
            moodScore: isBurnoutRisk ? Math.max(1, 4 - day * 0.08) : 3 + Math.random() * 1.5,
            fatigueLevel: isBurnoutRisk ? Math.min(10, 3 + day * 0.2) : 3 + Math.random() * 3,
            stressLevel: isBurnoutRisk ? Math.min(10, 2 + day * 0.25) : 2 + Math.random() * 4,
            satisfactionScore: isBurnoutRisk ? Math.max(1, 4 - day * 0.06) : 3.5 + Math.random(),
            sleepQuality: isBurnoutRisk ? Math.max(40, 80 - day * 1) : 70 + Math.random() * 20
          },
          wearableData: {
            heartRate: isBurnoutRisk ? 72 + day * 0.3 : 68 + Math.random() * 10,
            heartRateVariability: isBurnoutRisk ? Math.max(20, 55 - day * 0.8) : 45 + Math.random() * 15,
            stepsToday: isBurnoutRisk ? Math.max(2000, 8000 - day * 150) : 6000 + Math.random() * 4000,
            sleepHours: isBurnoutRisk ? Math.max(4, 7.5 - day * 0.07) : 6.5 + Math.random() * 1.5,
            deepSleepPercent: isBurnoutRisk ? Math.max(10, 22 - day * 0.3) : 18 + Math.random() * 8,
            remSleepPercent: isBurnoutRisk ? Math.max(12, 23 - day * 0.25) : 20 + Math.random() * 8,
            restingHeartRate: isBurnoutRisk ? 62 + day * 0.2 : 58 + Math.random() * 8
          },
          workData: {
            hoursWorked: isBurnoutRisk ? 10 + Math.random() * 4 : 8 + Math.random() * 2,
            tasksCompleted: isBurnoutRisk ? Math.max(3, 12 - day * 0.2) : 10 + Math.random() * 5,
            errorsCommitted: isBurnoutRisk ? Math.floor(day * 0.1) : Math.floor(Math.random() * 2),
            breaksTaken: isBurnoutRisk ? Math.max(1, 4 - Math.floor(day * 0.1)) : 3 + Math.floor(Math.random() * 2),
            overtimeHours: isBurnoutRisk ? 2 + Math.random() * 2 : Math.random() * 2,
            consecutiveWorkDays: isBurnoutRisk ? Math.min(21, 5 + day) : 3 + Math.floor(Math.random() * 5)
          }
        });
      }
      
      crewWellnessHistory.set(crew.id, history);
    }
  }

  /**
   * Predict burnout risk for a crew member
   */
  async predictBurnout(crewId: string): Promise<BurnoutPrediction> {
    const history = crewWellnessHistory.get(crewId);
    if (!history || history.length === 0) {
      throw new Error(`No wellness data found for crew ${crewId}`);
    }

    const recent = history.slice(-14); // Last 14 days
    const latest = recent[recent.length - 1];
    
    // Calculate risk score based on multiple factors
    const factors: ContributingFactor[] = [];
    let riskScore = 0;

    // Heart Rate Variability trend
    const hrvTrend = this.calculateTrend(recent.map(d => d.wearableData?.heartRateVariability || 50));
    if (hrvTrend < -0.5) {
      riskScore += 20;
      factors.push({
        factor: 'Heart Rate Variability',
        impact: 20,
        trend: 'declining',
        details: 'HRV has been declining significantly, indicating chronic stress'
      });
    }

    // Sleep quality trend
    const sleepTrend = this.calculateTrend(recent.map(d => d.metrics.sleepQuality));
    if (sleepTrend < -0.3) {
      riskScore += 25;
      factors.push({
        factor: 'Sleep Quality',
        impact: 25,
        trend: 'declining',
        details: `Sleep quality decreased to ${latest.metrics.sleepQuality.toFixed(0)}%`
      });
    }

    // Mood trend
    const moodTrend = this.calculateTrend(recent.map(d => d.metrics.moodScore * 20));
    if (moodTrend < -0.4) {
      riskScore += 20;
      factors.push({
        factor: 'Mood',
        impact: 20,
        trend: 'declining',
        details: `Mood score dropped to ${latest.metrics.moodScore.toFixed(1)}/5`
      });
    }

    // Workload
    const avgHours = recent.reduce((s, d) => s + (d.workData?.hoursWorked || 8), 0) / recent.length;
    if (avgHours > 10) {
      riskScore += 15;
      factors.push({
        factor: 'Workload',
        impact: 15,
        trend: 'stable',
        details: `Average ${avgHours.toFixed(1)} hours/day over 14 days`
      });
    }

    // Error rate
    const errorRate = recent.reduce((s, d) => s + (d.workData?.errorsCommitted || 0), 0) / recent.length;
    if (errorRate > 1) {
      riskScore += 10;
      factors.push({
        factor: 'Performance',
        impact: 10,
        trend: 'declining',
        details: `Error rate increased to ${errorRate.toFixed(1)}/day`
      });
    }

    // Consecutive work days
    const consecutiveDays = latest.workData?.consecutiveWorkDays || 0;
    if (consecutiveDays > 14) {
      riskScore += 10;
      factors.push({
        factor: 'Rest Deficit',
        impact: 10,
        trend: 'declining',
        details: `${consecutiveDays} consecutive work days without adequate rest`
      });
    }

    riskScore = Math.min(100, riskScore);
    const riskLevel = riskScore >= 70 ? 'critical' : riskScore >= 50 ? 'high' : riskScore >= 30 ? 'medium' : 'low';
    const daysToBurnout = riskScore >= 70 ? 7 : riskScore >= 50 ? 21 : riskScore >= 30 ? 45 : 90;

    const recommendations = this.generateRecommendations(riskLevel, factors);

    const prediction: BurnoutPrediction = {
      crewId,
      riskScore,
      riskLevel,
      predictedDaysToBurnout: daysToBurnout,
      confidence: 0.84,
      contributingFactors: factors,
      recommendations,
      interventionUrgency: riskScore >= 70 ? 'immediate' : riskScore >= 50 ? 'high' : riskScore >= 30 ? 'medium' : 'none'
    };

    this.predictions.set(crewId, prediction);

    // Generate alert if high risk
    if (riskScore >= 50) {
      this.createAlert(crewId, latest.name, riskScore, riskLevel);
    }

    return prediction;
  }

  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;
    
    const n = values.length;
    const xMean = (n - 1) / 2;
    const yMean = values.reduce((a, b) => a + b, 0) / n;
    
    let numerator = 0;
    let denominator = 0;
    
    for (let i = 0; i < n; i++) {
      numerator += (i - xMean) * (values[i] - yMean);
      denominator += (i - xMean) ** 2;
    }
    
    return denominator !== 0 ? numerator / denominator : 0;
  }

  private generateRecommendations(
    riskLevel: BurnoutPrediction['riskLevel'],
    factors: ContributingFactor[]
  ): WellnessRecommendation[] {
    const recommendations: WellnessRecommendation[] = [];

    if (riskLevel === 'critical' || riskLevel === 'high') {
      recommendations.push({
        priority: 1,
        type: 'rest',
        action: 'Approve 5-7 day leave immediately',
        expectedOutcome: 'Break stress cycle, allow recovery',
        estimatedRecoveryDays: 7,
        roi: { cost: 5000, benefit: 180000 }
      });
    }

    if (factors.some(f => f.factor.includes('Sleep'))) {
      recommendations.push({
        priority: 2,
        type: 'workload',
        action: 'Adjust shift schedule to allow 7+ hours sleep',
        expectedOutcome: 'Improve sleep quality by 30%',
        estimatedRecoveryDays: 14
      });
    }

    if (factors.some(f => f.factor.includes('Workload'))) {
      recommendations.push({
        priority: 2,
        type: 'rotation',
        action: 'Redistribute tasks or add temporary crew support',
        expectedOutcome: 'Reduce workload to sustainable levels',
        estimatedRecoveryDays: 7
      });
    }

    if (factors.some(f => f.factor.includes('Mood'))) {
      recommendations.push({
        priority: 3,
        type: 'counseling',
        action: 'Schedule counseling session with ship psychologist',
        expectedOutcome: 'Identify root causes, provide coping strategies',
        estimatedRecoveryDays: 21
      });
    }

    recommendations.push({
      priority: 4,
      type: 'social',
      action: 'Encourage participation in crew social activities',
      expectedOutcome: 'Reduce isolation, improve morale',
      estimatedRecoveryDays: 14
    });

    return recommendations;
  }

  private createAlert(
    crewId: string,
    crewName: string,
    riskScore: number,
    severity: 'low' | 'medium' | 'high' | 'critical'
  ): void {
    const alert: WellnessAlert = {
      id: `alert-${Date.now()}`,
      crewId,
      crewName,
      type: 'burnout_risk',
      severity,
      message: `${crewName} has ${riskScore}% burnout risk. Immediate intervention recommended.`,
      timestamp: new Date(),
      acknowledged: false
    };

    this.alerts.unshift(alert);
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(0, 100);
    }
  }

  /**
   * Get wellness trend for a crew member
   */
  getWellnessTrend(crewId: string, period: '7d' | '14d' | '30d' = '14d'): WellnessTrend {
    const history = crewWellnessHistory.get(crewId);
    if (!history) {
      throw new Error(`No wellness data for crew ${crewId}`);
    }

    const days = period === '7d' ? 7 : period === '14d' ? 14 : 30;
    const data = history.slice(-days);

    const trend = this.calculateTrend(data.map(d => d.metrics.overallScore));
    const trendLabel = trend > 0.3 ? 'improving' : trend < -0.5 ? 'critical' : trend < -0.2 ? 'declining' : 'stable';

    // Forecast next 7 days
    const forecast = [];
    const lastScore = data[data.length - 1].metrics.overallScore;
    for (let i = 1; i <= 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      forecast.push({
        date: date.toISOString().split('T')[0],
        predictedScore: Math.max(0, Math.min(100, lastScore + trend * i * 2))
      });
    }

    return {
      crewId,
      period,
      metrics: data.map(d => ({
        date: d.timestamp.toISOString().split('T')[0],
        overallScore: d.metrics.overallScore,
        moodScore: d.metrics.moodScore,
        fatigueLevel: d.metrics.fatigueLevel
      })),
      trend: trendLabel,
      forecast
    };
  }

  /**
   * Get all active alerts
   */
  getAlerts(acknowledged?: boolean): WellnessAlert[] {
    if (acknowledged === undefined) return this.alerts;
    return this.alerts.filter(a => a.acknowledged === acknowledged);
  }

  /**
   * Acknowledge an alert
   */
  acknowledgeAlert(alertId: string, intervention?: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      alert.intervention = intervention;
    }
  }

  /**
   * Get all crew IDs with data
   */
  getAllCrewIds(): string[] {
    return Array.from(crewWellnessHistory.keys());
  }

  /**
   * Get latest wellness data for a crew member
   */
  getLatestWellness(crewId: string): CrewWellnessData | undefined {
    const history = crewWellnessHistory.get(crewId);
    return history?.[history.length - 1];
  }

  /**
   * Get fleet-wide wellness statistics
   */
  getFleetStatistics(): {
    totalCrew: number;
    avgWellnessScore: number;
    highRiskCount: number;
    criticalAlerts: number;
    avgSleepQuality: number;
    avgFatigue: number;
  } {
    const crewIds = this.getAllCrewIds();
    let totalScore = 0;
    let totalSleep = 0;
    let totalFatigue = 0;
    let highRisk = 0;

    for (const crewId of crewIds) {
      const latest = this.getLatestWellness(crewId);
      if (latest) {
        totalScore += latest.metrics.overallScore;
        totalSleep += latest.metrics.sleepQuality;
        totalFatigue += latest.metrics.fatigueLevel;
      }
      
      const prediction = this.predictions.get(crewId);
      if (prediction && (prediction.riskLevel === 'high' || prediction.riskLevel === 'critical')) {
        highRisk++;
      }
    }

    return {
      totalCrew: crewIds.length,
      avgWellnessScore: crewIds.length > 0 ? totalScore / crewIds.length : 0,
      highRiskCount: highRisk,
      criticalAlerts: this.alerts.filter(a => a.severity === 'critical' && !a.acknowledged).length,
      avgSleepQuality: crewIds.length > 0 ? totalSleep / crewIds.length : 0,
      avgFatigue: crewIds.length > 0 ? totalFatigue / crewIds.length : 0
    };
  }
}

// Export singleton
export const wellnessPredictive = new WellnessPredictiveSystem();
