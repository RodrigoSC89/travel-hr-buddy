/**
 * 💚 Wellness Prediction Engine - Crew Health & Wellbeing AI
 * PATCH REVOLUTION v2.1
 * 
 * Análise de fadiga/stress via wearables e padrões de comunicação
 * REFACTORED: Removed database dependencies, uses simulated data
 */

import { logger } from "@/lib/logger";

export interface WellnessMetrics {
  crewMemberId: string;
  date: Date;
  
  // Physical metrics
  heartRateAvg: number;
  heartRateVariability: number;
  sleepHours: number;
  sleepQuality: number; // 0-100
  stepCount: number;
  activeMinutes: number;
  
  // Stress indicators
  stressLevel: number; // 0-100
  fatigueIndex: number; // 0-100
  recoveryScore: number; // 0-100
  
  // Communication patterns
  responseTimeAvg: number; // minutes
  messageVolume: number;
  sentimentScore: number; // -1 to 1
  
  // Work patterns
  hoursOnDuty: number;
  breaksTaken: number;
  tasksCompleted: number;
  incidentsReported: number;
}

export interface WellnessAlert {
  id: string;
  crewMemberId: string;
  crewMemberName: string;
  alertType: WellnessAlertType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  recommendation: string;
  createdAt: Date;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
}

export type WellnessAlertType = 
  | 'fatigue'
  | 'stress'
  | 'sleep_deprivation'
  | 'overwork'
  | 'isolation'
  | 'burnout_risk'
  | 'health_concern'
  | 'mental_health';

export interface CrewWellnessProfile {
  crewMemberId: string;
  name: string;
  position: string;
  vessel: string;
  
  // Current state
  overallWellnessScore: number; // 0-100
  currentStatus: 'excellent' | 'good' | 'fair' | 'concerning' | 'critical';
  
  // Trends
  wellnessTrend: 'improving' | 'stable' | 'declining';
  trendDays: number;
  
  // Specific scores
  physicalScore: number;
  mentalScore: number;
  socialScore: number;
  workLifeBalanceScore: number;
  
  // Risk factors
  riskFactors: string[];
  
  // Recommendations
  priorityRecommendations: string[];
  
  // History
  lastAssessmentDate: Date;
  consecutiveDaysAtSea: number;
}

export interface WellnessTrend {
  date: Date;
  wellnessScore: number;
  stressLevel: number;
  fatigueIndex: number;
  sleepQuality: number;
}

export interface VesselWellnessReport {
  vesselId: string;
  vesselName: string;
  reportDate: Date;
  
  // Aggregate scores
  avgWellnessScore: number;
  avgStressLevel: number;
  avgFatigueIndex: number;
  
  // Crew status breakdown
  excellentCount: number;
  goodCount: number;
  fairCount: number;
  concerningCount: number;
  criticalCount: number;
  
  // Active alerts
  activeAlerts: number;
  highPriorityAlerts: number;
  
  // Recommendations
  vesselRecommendations: string[];
}

// Thresholds for alerts
const ALERT_THRESHOLDS = {
  fatigue: { high: 70, critical: 85 },
  stress: { high: 65, critical: 80 },
  sleepQuality: { low: 50, critical: 35 },
  sleepHours: { low: 5, critical: 4 },
  hoursOnDuty: { high: 12, critical: 14 },
  daysAtSea: { warning: 90, critical: 120 },
  heartRateVariability: { low: 30, critical: 20 },
};

// Simulated crew wellness data
const SIMULATED_CREW_PROFILES: Record<string, CrewWellnessProfile> = {
  'default': {
    crewMemberId: 'crew-001',
    name: 'João Silva',
    position: 'Capitão',
    vessel: 'MV Atlantic Star',
    overallWellnessScore: 78,
    currentStatus: 'good',
    wellnessTrend: 'stable',
    trendDays: 7,
    physicalScore: 82,
    mentalScore: 75,
    socialScore: 80,
    workLifeBalanceScore: 72,
    riskFactors: [],
    priorityRecommendations: ['Manter rotinas atuais - indicadores positivos'],
    lastAssessmentDate: new Date(),
    consecutiveDaysAtSea: 45,
  }
};

// Stored wellness data (in-memory simulation)
const wellnessDataStore: Map<string, WellnessMetrics[]> = new Map();
const alertsStore: WellnessAlert[] = [];

class WellnessPredictor {
  
  // Analyze metrics and predict wellness state
  async analyzeCrewWellness(
    crewMemberId: string,
    metrics: WellnessMetrics
  ): Promise<{ 
    wellnessScore: number; 
    alerts: WellnessAlert[];
    predictions: string[];
  }> {
    const alerts: WellnessAlert[] = [];
    const predictions: string[] = [];

    // Calculate component scores
    const physicalScore = this.calculatePhysicalScore(metrics);
    const mentalScore = this.calculateMentalScore(metrics);
    const workLifeScore = this.calculateWorkLifeScore(metrics);
    
    // Overall wellness score
    const wellnessScore = Math.round(
      physicalScore * 0.35 + 
      mentalScore * 0.35 + 
      workLifeScore * 0.30
    );

    // Check for fatigue alerts
    if (metrics.fatigueIndex >= ALERT_THRESHOLDS.fatigue.critical) {
      alerts.push(this.createAlert(crewMemberId, 'fatigue', 'critical', {
        title: 'Fadiga Crítica Detectada',
        description: `Índice de fadiga em ${metrics.fatigueIndex}%. Risco elevado de erros e acidentes.`,
        recommendation: 'Suspender tarefas críticas imediatamente. Garantir 8+ horas de descanso antes de retornar ao serviço.',
      }));
    } else if (metrics.fatigueIndex >= ALERT_THRESHOLDS.fatigue.high) {
      alerts.push(this.createAlert(crewMemberId, 'fatigue', 'high', {
        title: 'Nível de Fadiga Elevado',
        description: `Índice de fadiga em ${metrics.fatigueIndex}%. Desempenho pode estar comprometido.`,
        recommendation: 'Reduzir carga de trabalho e priorizar descanso nas próximas 24 horas.',
      }));
    }

    // Check for stress alerts
    if (metrics.stressLevel >= ALERT_THRESHOLDS.stress.critical) {
      alerts.push(this.createAlert(crewMemberId, 'stress', 'critical', {
        title: 'Estresse Crítico',
        description: `Nível de estresse em ${metrics.stressLevel}%. Saúde mental em risco.`,
        recommendation: 'Iniciar acompanhamento psicológico. Considerar afastamento temporário se persistir.',
      }));
      predictions.push('Alto risco de burnout nos próximos 30 dias se não houver intervenção');
    } else if (metrics.stressLevel >= ALERT_THRESHOLDS.stress.high) {
      alerts.push(this.createAlert(crewMemberId, 'stress', 'medium', {
        title: 'Estresse Elevado',
        description: `Nível de estresse em ${metrics.stressLevel}%.`,
        recommendation: 'Oferecer suporte emocional e revisar carga de trabalho.',
      }));
    }

    // Check for sleep deprivation
    if (metrics.sleepHours < ALERT_THRESHOLDS.sleepHours.critical) {
      alerts.push(this.createAlert(crewMemberId, 'sleep_deprivation', 'critical', {
        title: 'Privação de Sono Severa',
        description: `Apenas ${metrics.sleepHours} horas de sono. Capacidade cognitiva comprometida.`,
        recommendation: 'URGENTE: Garantir período de descanso mínimo de 10 horas antes de qualquer tarefa de segurança.',
      }));
    } else if (metrics.sleepHours < ALERT_THRESHOLDS.sleepHours.low || 
               metrics.sleepQuality < ALERT_THRESHOLDS.sleepQuality.low) {
      alerts.push(this.createAlert(crewMemberId, 'sleep_deprivation', 'medium', {
        title: 'Qualidade de Sono Insuficiente',
        description: `${metrics.sleepHours}h de sono com qualidade ${metrics.sleepQuality}%.`,
        recommendation: 'Revisar condições de acomodação e horários de turno.',
      }));
    }

    // Check for overwork
    if (metrics.hoursOnDuty >= ALERT_THRESHOLDS.hoursOnDuty.critical) {
      alerts.push(this.createAlert(crewMemberId, 'overwork', 'critical', {
        title: 'Excesso de Horas de Trabalho',
        description: `${metrics.hoursOnDuty} horas em serviço. Violação de limites de descanso.`,
        recommendation: 'VIOLAÇÃO MLC 2006: Encerrar turno imediatamente e registrar ocorrência.',
      }));
    } else if (metrics.hoursOnDuty >= ALERT_THRESHOLDS.hoursOnDuty.high) {
      alerts.push(this.createAlert(crewMemberId, 'overwork', 'high', {
        title: 'Horas de Trabalho Elevadas',
        description: `${metrics.hoursOnDuty} horas em serviço consecutivas.`,
        recommendation: 'Planejar descanso adequado e revisar escala.',
      }));
    }

    // Communication pattern analysis
    if (metrics.sentimentScore < -0.3 && metrics.messageVolume < 5) {
      alerts.push(this.createAlert(crewMemberId, 'isolation', 'medium', {
        title: 'Sinais de Isolamento Social',
        description: 'Comunicação reduzida e sentimento negativo detectado.',
        recommendation: 'Iniciar conversas informais e verificar bem-estar emocional.',
      }));
      predictions.push('Risco de problemas de saúde mental se isolamento persistir por mais 7 dias');
    }

    // Burnout risk prediction
    const burnoutRisk = this.calculateBurnoutRisk(metrics);
    if (burnoutRisk > 75) {
      alerts.push(this.createAlert(crewMemberId, 'burnout_risk', 'high', {
        title: 'Alto Risco de Burnout',
        description: `Indicadores apontam ${burnoutRisk}% de risco de burnout.`,
        recommendation: 'Avaliar possibilidade de licença ou redução significativa de responsabilidades.',
      }));
      predictions.push('Probabilidade de 60% de burnout nos próximos 60 dias sem intervenção');
    } else if (burnoutRisk > 50) {
      predictions.push('Risco moderado de burnout. Monitorar indicadores semanalmente.');
    }

    // Positive predictions
    if (wellnessScore > 80 && metrics.recoveryScore > 70) {
      predictions.push('Tripulante em excelente condição. Manter práticas atuais.');
    }

    // Store wellness data (in-memory)
    this.storeWellnessData(crewMemberId, metrics, wellnessScore, alerts.length);

    // Store alerts
    alerts.forEach(alert => alertsStore.push(alert));

    return { wellnessScore, alerts, predictions };
  }

  // Calculate physical health score
  private calculatePhysicalScore(metrics: WellnessMetrics): number {
    let score = 100;

    // Sleep impact (40% of physical score)
    const sleepScore = (metrics.sleepHours / 8) * 100 * (metrics.sleepQuality / 100);
    score = score * 0.6 + sleepScore * 0.4;

    // Activity impact
    if (metrics.stepCount < 3000) score -= 10;
    if (metrics.activeMinutes < 30) score -= 5;

    // Heart rate variability (indicator of autonomic health)
    if (metrics.heartRateVariability < ALERT_THRESHOLDS.heartRateVariability.low) {
      score -= 15;
    }

    // Recovery score
    score = score * 0.7 + metrics.recoveryScore * 0.3;

    return Math.min(100, Math.max(0, score));
  }

  // Calculate mental health score
  private calculateMentalScore(metrics: WellnessMetrics): number {
    let score = 100;

    // Stress impact (inverse relationship)
    score -= metrics.stressLevel * 0.5;

    // Fatigue impact
    score -= metrics.fatigueIndex * 0.3;

    // Sentiment from communications
    score += metrics.sentimentScore * 15;

    // Social interaction (message volume as proxy)
    if (metrics.messageVolume < 5) score -= 10;
    else if (metrics.messageVolume > 20) score += 5;

    return Math.min(100, Math.max(0, score));
  }

  // Calculate work-life balance score
  private calculateWorkLifeScore(metrics: WellnessMetrics): number {
    let score = 100;

    // Hours on duty impact
    if (metrics.hoursOnDuty > 10) score -= (metrics.hoursOnDuty - 10) * 8;

    // Breaks impact
    const expectedBreaks = Math.floor(metrics.hoursOnDuty / 4);
    if (metrics.breaksTaken < expectedBreaks) {
      score -= (expectedBreaks - metrics.breaksTaken) * 10;
    }

    // Response time (faster might indicate always-on mentality)
    if (metrics.responseTimeAvg < 5) score -= 10;

    return Math.min(100, Math.max(0, score));
  }

  // Calculate burnout risk
  private calculateBurnoutRisk(metrics: WellnessMetrics): number {
    let risk = 0;

    // High stress is primary indicator
    risk += metrics.stressLevel * 0.4;

    // Chronic fatigue
    risk += metrics.fatigueIndex * 0.3;

    // Poor recovery
    risk += (100 - metrics.recoveryScore) * 0.15;

    // Poor sleep
    risk += (100 - metrics.sleepQuality) * 0.1;

    // Low sentiment
    if (metrics.sentimentScore < 0) {
      risk += Math.abs(metrics.sentimentScore) * 20;
    }

    return Math.min(100, Math.max(0, risk));
  }

  // Create alert object
  private createAlert(
    crewMemberId: string,
    type: WellnessAlertType,
    severity: WellnessAlert['severity'],
    details: { title: string; description: string; recommendation: string }
  ): WellnessAlert {
    return {
      id: crypto.randomUUID(),
      crewMemberId,
      crewMemberName: '', // Will be filled when fetching
      alertType: type,
      severity,
      ...details,
      createdAt: new Date(),
    };
  }

  // Store wellness data (in-memory)
  private storeWellnessData(
    crewMemberId: string,
    metrics: WellnessMetrics,
    _wellnessScore: number,
    _alertCount: number
  ): void {
    const existing = wellnessDataStore.get(crewMemberId) || [];
    existing.push(metrics);
    wellnessDataStore.set(crewMemberId, existing.slice(-30)); // Keep last 30 records
    logger.info('Wellness data stored', { crewMemberId });
  }

  // Get crew wellness profile (simulated)
  async getCrewProfile(crewMemberId: string): Promise<CrewWellnessProfile | null> {
    try {
      // Return simulated profile with some randomization
      const baseProfile = SIMULATED_CREW_PROFILES['default'];
      
      // Check if we have stored metrics
      const storedMetrics = wellnessDataStore.get(crewMemberId);
      
      if (storedMetrics && storedMetrics.length > 0) {
        const latest = storedMetrics[storedMetrics.length - 1];
        const physicalScore = this.calculatePhysicalScore(latest);
        const mentalScore = this.calculateMentalScore(latest);
        const workLifeScore = this.calculateWorkLifeScore(latest);
        const overallScore = Math.round(physicalScore * 0.35 + mentalScore * 0.35 + workLifeScore * 0.30);
        
        return {
          ...baseProfile,
          crewMemberId,
          overallWellnessScore: overallScore,
          currentStatus: this.getStatusFromScore(overallScore),
          physicalScore: Math.round(physicalScore),
          mentalScore: Math.round(mentalScore),
          workLifeBalanceScore: Math.round(workLifeScore),
          lastAssessmentDate: latest.date,
        };
      }
      
      return {
        ...baseProfile,
        crewMemberId,
      };
    } catch (error) {
      logger.error('Failed to get crew profile', error as Error);
      return null;
    }
  }

  // Get status label from score
  private getStatusFromScore(score: number): CrewWellnessProfile['currentStatus'] {
    if (score >= 85) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 55) return 'fair';
    if (score >= 40) return 'concerning';
    return 'critical';
  }

  // Generate personalized recommendations
  private generateRecommendations(
    metrics: { 
      fatigue_index?: number; 
      stress_level?: number; 
      sleep_quality?: number; 
      sleep_hours?: number;
    } | null,
    daysAtSea: number,
    _riskFactors: string[]
  ): string[] {
    const recommendations: string[] = [];

    if (!metrics) {
      return ['Iniciar monitoramento de bem-estar com wearables'];
    }

    if (metrics.sleep_quality && metrics.sleep_quality < 60) {
      recommendations.push('Otimizar ambiente de sono: temperatura, ruído, iluminação');
    }

    if (metrics.sleep_hours && metrics.sleep_hours < 6) {
      recommendations.push('Ajustar escala para garantir mínimo de 7 horas de sono');
    }

    if (metrics.stress_level && metrics.stress_level > 60) {
      recommendations.push('Implementar pausas de relaxamento de 10 minutos a cada 3 horas');
      recommendations.push('Considerar sessão com psicólogo ocupacional');
    }

    if (metrics.fatigue_index && metrics.fatigue_index > 60) {
      recommendations.push('Reduzir carga de trabalho temporariamente');
      recommendations.push('Garantir intervalos adequados entre turnos');
    }

    if (daysAtSea > 90) {
      recommendations.push('Priorizar para próxima licença em terra');
      recommendations.push('Oferecer comunicação extra com família');
    }

    if (recommendations.length === 0) {
      recommendations.push('Manter rotinas atuais - indicadores positivos');
    }

    return recommendations.slice(0, 4);
  }

  // Get vessel wellness report (simulated)
  async getVesselReport(vesselId: string): Promise<VesselWellnessReport | null> {
    try {
      // Simulated vessel report
      const vesselNames: Record<string, string> = {
        'vessel-001': 'MV Atlantic Star',
        'vessel-002': 'MV Pacific Explorer',
        'vessel-003': 'MV Caribbean Queen',
      };

      const vesselName = vesselNames[vesselId] || `Vessel ${vesselId.slice(-4)}`;

      // Generate simulated metrics
      const crewCount = 15 + Math.floor(Math.random() * 10);
      const avgWellness = 65 + Math.floor(Math.random() * 25);
      const avgStress = 30 + Math.floor(Math.random() * 30);
      const avgFatigue = 25 + Math.floor(Math.random() * 35);

      // Distribute crew across status categories
      const excellent = Math.floor(crewCount * 0.2);
      const good = Math.floor(crewCount * 0.4);
      const fair = Math.floor(crewCount * 0.25);
      const concerning = Math.floor(crewCount * 0.1);
      const critical = crewCount - excellent - good - fair - concerning;

      // Generate recommendations
      const recommendations: string[] = [];
      
      if (avgStress > 50) {
        recommendations.push('Implementar programa de gerenciamento de estresse para toda tripulação');
      }
      if (avgFatigue > 50) {
        recommendations.push('Revisar escalas de trabalho - níveis de fadiga elevados');
      }
      if (concerning + critical > crewCount * 0.2) {
        recommendations.push('ATENÇÃO: Mais de 20% da tripulação com bem-estar comprometido');
      }
      if (recommendations.length === 0) {
        recommendations.push('Tripulação apresenta níveis saudáveis de bem-estar');
      }

      return {
        vesselId,
        vesselName,
        reportDate: new Date(),
        avgWellnessScore: avgWellness,
        avgStressLevel: avgStress,
        avgFatigueIndex: avgFatigue,
        excellentCount: excellent,
        goodCount: good,
        fairCount: fair,
        concerningCount: concerning,
        criticalCount: Math.max(0, critical),
        activeAlerts: alertsStore.filter(a => !a.acknowledgedAt).length,
        highPriorityAlerts: alertsStore.filter(a => !a.acknowledgedAt && ['high', 'critical'].includes(a.severity)).length,
        vesselRecommendations: recommendations,
      };
    } catch (error) {
      logger.error('Failed to generate vessel report', error as Error);
      return null;
    }
  }

  // Integrate with wearable data
  async syncWearableData(
    crewMemberId: string,
    wearableType: 'apple_watch' | 'fitbit' | 'garmin' | 'whoop' | 'generic',
    data: Partial<WellnessMetrics>
  ): Promise<void> {
    try {
      const metrics: WellnessMetrics = {
        crewMemberId,
        date: new Date(),
        heartRateAvg: data.heartRateAvg || 72,
        heartRateVariability: data.heartRateVariability || 45,
        sleepHours: data.sleepHours || 7,
        sleepQuality: data.sleepQuality || 70,
        stepCount: data.stepCount || 5000,
        activeMinutes: data.activeMinutes || 30,
        stressLevel: data.stressLevel || 40,
        fatigueIndex: data.fatigueIndex || 35,
        recoveryScore: data.recoveryScore || 65,
        responseTimeAvg: data.responseTimeAvg || 15,
        messageVolume: data.messageVolume || 10,
        sentimentScore: data.sentimentScore || 0.2,
        hoursOnDuty: data.hoursOnDuty || 8,
        breaksTaken: data.breaksTaken || 3,
        tasksCompleted: data.tasksCompleted || 5,
        incidentsReported: data.incidentsReported || 0,
      };

      // Analyze the synced data
      const analysis = await this.analyzeCrewWellness(crewMemberId, metrics);

      logger.info('Wearable data synced', { crewMemberId, wearableType, alertCount: analysis.alerts.length });
    } catch (error) {
      logger.error('Failed to sync wearable data', error as Error);
      throw error;
    }
  }

  // Get active alerts
  getActiveAlerts(crewMemberId?: string): WellnessAlert[] {
    const active = alertsStore.filter(a => !a.acknowledgedAt);
    if (crewMemberId) {
      return active.filter(a => a.crewMemberId === crewMemberId);
    }
    return active;
  }

  // Acknowledge alert
  acknowledgeAlert(alertId: string, acknowledgedBy: string): boolean {
    const alert = alertsStore.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledgedAt = new Date();
      alert.acknowledgedBy = acknowledgedBy;
      return true;
    }
    return false;
  }
}

export const wellnessPredictor = new WellnessPredictor();
