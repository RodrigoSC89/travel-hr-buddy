/**
 * 💚 Wellness Prediction Engine - Crew Health & Wellbeing AI
 * PATCH REVOLUTION v3.0 - Full DB Integration
 * 
 * Análise de fadiga/stress via wearables e padrões de comunicação
 * Uses: crew_wellness_metrics, wellness_alerts tables
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import { 
  crewWellnessMetricsTable, 
  wellnessAlertsTable,
  type CrewWellnessMetricDB,
  type WellnessAlertDB
} from "@/lib/supabase/dynamic-tables";

export interface WellnessMetrics {
  crewMemberId: string;
  date: Date;
  heartRateAvg: number;
  heartRateVariability: number;
  sleepHours: number;
  sleepQuality: number;
  stepCount: number;
  activeMinutes: number;
  stressLevel: number;
  fatigueIndex: number;
  recoveryScore: number;
  responseTimeAvg: number;
  messageVolume: number;
  sentimentScore: number;
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
  | 'fatigue' | 'stress' | 'sleep_deprivation' | 'overwork'
  | 'isolation' | 'burnout_risk' | 'health_concern' | 'mental_health';

export interface CrewWellnessProfile {
  crewMemberId: string;
  name: string;
  position: string;
  vessel: string;
  overallWellnessScore: number;
  currentStatus: 'excellent' | 'good' | 'fair' | 'concerning' | 'critical';
  wellnessTrend: 'improving' | 'stable' | 'declining';
  trendDays: number;
  physicalScore: number;
  mentalScore: number;
  socialScore: number;
  workLifeBalanceScore: number;
  riskFactors: string[];
  priorityRecommendations: string[];
  lastAssessmentDate: Date;
  consecutiveDaysAtSea: number;
}

export interface VesselWellnessReport {
  vesselId: string;
  vesselName: string;
  reportDate: Date;
  avgWellnessScore: number;
  avgStressLevel: number;
  avgFatigueIndex: number;
  excellentCount: number;
  goodCount: number;
  fairCount: number;
  concerningCount: number;
  criticalCount: number;
  activeAlerts: number;
  highPriorityAlerts: number;
  vesselRecommendations: string[];
}

const ALERT_THRESHOLDS = {
  fatigue: { high: 70, critical: 85 },
  stress: { high: 65, critical: 80 },
  sleepQuality: { low: 50, critical: 35 },
  sleepHours: { low: 5, critical: 4 },
  hoursOnDuty: { high: 12, critical: 14 },
  daysAtSea: { warning: 90, critical: 120 },
  heartRateVariability: { low: 30, critical: 20 },
};

class WellnessPredictor {
  
  private async getOrganizationId(): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase
        .from('organization_users')
        .select('organization_id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .limit(1)
        .maybeSingle();
      return data?.organization_id || null;
    } catch {
      return null;
    }
  }

  async analyzeCrewWellness(crewMemberId: string, metrics: WellnessMetrics): Promise<{ 
    wellnessScore: number; 
    alerts: WellnessAlert[];
    predictions: string[];
  }> {
    const alerts: WellnessAlert[] = [];
    const predictions: string[] = [];

    const physicalScore = this.calculatePhysicalScore(metrics);
    const mentalScore = this.calculateMentalScore(metrics);
    const workLifeScore = this.calculateWorkLifeScore(metrics);
    
    const wellnessScore = Math.round(physicalScore * 0.35 + mentalScore * 0.35 + workLifeScore * 0.30);

    // Check fatigue
    if (metrics.fatigueIndex >= ALERT_THRESHOLDS.fatigue.critical) {
      alerts.push(this.createAlert(crewMemberId, 'fatigue', 'critical', {
        title: 'Fadiga Crítica Detectada',
        description: `Índice de fadiga em ${metrics.fatigueIndex}%. Risco elevado.`,
        recommendation: 'Suspender tarefas críticas. Garantir 8+ horas de descanso.',
      }));
    } else if (metrics.fatigueIndex >= ALERT_THRESHOLDS.fatigue.high) {
      alerts.push(this.createAlert(crewMemberId, 'fatigue', 'high', {
        title: 'Fadiga Elevada',
        description: `Índice de fadiga em ${metrics.fatigueIndex}%.`,
        recommendation: 'Reduzir carga de trabalho nas próximas 24 horas.',
      }));
    }

    // Check stress
    if (metrics.stressLevel >= ALERT_THRESHOLDS.stress.critical) {
      alerts.push(this.createAlert(crewMemberId, 'stress', 'critical', {
        title: 'Estresse Crítico',
        description: `Nível de estresse em ${metrics.stressLevel}%.`,
        recommendation: 'Iniciar acompanhamento psicológico.',
      }));
      predictions.push('Alto risco de burnout nos próximos 30 dias');
    }

    // Check sleep
    if (metrics.sleepHours < ALERT_THRESHOLDS.sleepHours.critical) {
      alerts.push(this.createAlert(crewMemberId, 'sleep_deprivation', 'critical', {
        title: 'Privação de Sono Severa',
        description: `Apenas ${metrics.sleepHours} horas de sono.`,
        recommendation: 'URGENTE: Garantir 10 horas de descanso.',
      }));
    }

    // Check overwork
    if (metrics.hoursOnDuty >= ALERT_THRESHOLDS.hoursOnDuty.critical) {
      alerts.push(this.createAlert(crewMemberId, 'overwork', 'critical', {
        title: 'Excesso de Trabalho',
        description: `${metrics.hoursOnDuty} horas em serviço - violação MLC 2006.`,
        recommendation: 'Encerrar turno imediatamente.',
      }));
    }

    if (wellnessScore > 80) {
      predictions.push('Tripulante em excelente condição.');
    }

    // Store in database
    await this.storeWellnessData(crewMemberId, metrics, wellnessScore, alerts.length);
    await this.storeAlerts(crewMemberId, alerts);

    return { wellnessScore, alerts, predictions };
  }

  private calculatePhysicalScore(metrics: WellnessMetrics): number {
    let score = 100;
    const sleepScore = (metrics.sleepHours / 8) * 100 * (metrics.sleepQuality / 100);
    score = score * 0.6 + sleepScore * 0.4;
    if (metrics.stepCount < 3000) score -= 10;
    if (metrics.heartRateVariability < ALERT_THRESHOLDS.heartRateVariability.low) score -= 15;
    score = score * 0.7 + metrics.recoveryScore * 0.3;
    return Math.min(100, Math.max(0, score));
  }

  private calculateMentalScore(metrics: WellnessMetrics): number {
    let score = 100;
    score -= metrics.stressLevel * 0.5;
    score -= metrics.fatigueIndex * 0.3;
    score += metrics.sentimentScore * 15;
    if (metrics.messageVolume < 5) score -= 10;
    return Math.min(100, Math.max(0, score));
  }

  private calculateWorkLifeScore(metrics: WellnessMetrics): number {
    let score = 100;
    if (metrics.hoursOnDuty > 10) score -= (metrics.hoursOnDuty - 10) * 8;
    const expectedBreaks = Math.floor(metrics.hoursOnDuty / 4);
    if (metrics.breaksTaken < expectedBreaks) score -= (expectedBreaks - metrics.breaksTaken) * 10;
    return Math.min(100, Math.max(0, score));
  }

  private createAlert(crewMemberId: string, type: WellnessAlertType, severity: WellnessAlert['severity'], 
    details: { title: string; description: string; recommendation: string }): WellnessAlert {
    return { id: crypto.randomUUID(), crewMemberId, crewMemberName: '', alertType: type, severity, ...details, createdAt: new Date() };
  }

  private async storeWellnessData(crewMemberId: string, metrics: WellnessMetrics, wellnessScore: number, alertCount: number): Promise<void> {
    try {
      const organizationId = await this.getOrganizationId();
      const { error } = await crewWellnessMetricsTable.insert({
        crew_member_id: crewMemberId,
        organization_id: organizationId,
        date: metrics.date.toISOString(),
        wellness_score: wellnessScore,
        fatigue_index: metrics.fatigueIndex,
        stress_level: metrics.stressLevel,
        sleep_hours: metrics.sleepHours,
        sleep_quality: metrics.sleepQuality,
        recovery_score: metrics.recoveryScore,
        hours_on_duty: metrics.hoursOnDuty,
        sentiment_score: metrics.sentimentScore,
        heart_rate_avg: metrics.heartRateAvg,
        heart_rate_variability: metrics.heartRateVariability,
        step_count: metrics.stepCount,
        active_minutes: metrics.activeMinutes,
        breaks_taken: metrics.breaksTaken,
        tasks_completed: metrics.tasksCompleted,
        incidents_reported: metrics.incidentsReported,
        message_volume: metrics.messageVolume,
        response_time_avg: metrics.responseTimeAvg,
        alert_count: alertCount,
      });
      if (error) logger.warn('Failed to store wellness data', { error: error.message });
    } catch (error) {
      logger.warn('Failed to store wellness data', { error });
    }
  }

  private async storeAlerts(crewMemberId: string, alerts: WellnessAlert[]): Promise<void> {
    if (alerts.length === 0) return;
    try {
      const organizationId = await this.getOrganizationId();
      const alertRecords = alerts.map(alert => ({
        crew_member_id: crewMemberId,
        organization_id: organizationId,
        alert_type: alert.alertType,
        severity: alert.severity,
        title: alert.title,
        description: alert.description,
        recommendation: alert.recommendation,
        is_active: true,
      }));
      const { error } = await wellnessAlertsTable.insert(alertRecords);
      if (error) logger.warn('Failed to store alerts', { error: error.message });
    } catch (error) {
      logger.warn('Failed to store alerts', { error });
    }
  }

  async getCrewProfile(crewMemberId: string): Promise<CrewWellnessProfile | null> {
    try {
      const { data: crewMember } = await supabase
        .from('crew_members')
        .select('full_name, position, vessel_id, vessels(name)')
        .eq('id', crewMemberId)
        .maybeSingle();

      if (!crewMember) return null;

      // Get recent wellness metrics
      const { data: metrics } = await crewWellnessMetricsTable.selectWithFilter('*', [
        { column: 'crew_member_id', operator: 'eq', value: crewMemberId }
      ]);

      const sortedMetrics = ((metrics || []) as CrewWellnessMetricDB[])
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      const latestMetric = sortedMetrics[0];
      const trend = this.calculateTrend(sortedMetrics.slice(0, 14));

      const overallScore = latestMetric?.wellness_score || 75;

      return {
        crewMemberId,
        name: crewMember.full_name || 'N/A',
        position: crewMember.position || 'N/A',
        vessel: (crewMember.vessels as unknown as { name: string })?.name || 'N/A',
        overallWellnessScore: overallScore,
        currentStatus: this.getStatusFromScore(overallScore),
        wellnessTrend: trend.direction,
        trendDays: trend.days,
        physicalScore: Math.round((latestMetric?.recovery_score || 75) * 0.5 + (latestMetric?.sleep_quality || 75) * 0.5),
        mentalScore: Math.round(100 - (latestMetric?.stress_level || 25)),
        socialScore: Math.round((latestMetric?.sentiment_score || 0) * 50 + 50),
        workLifeBalanceScore: Math.round(100 - (((latestMetric?.hours_on_duty || 8) - 8) * 10)),
        riskFactors: this.identifyRiskFactors(latestMetric),
        priorityRecommendations: this.generateRecommendations(latestMetric),
        lastAssessmentDate: latestMetric?.date ? new Date(latestMetric.date) : new Date(),
        consecutiveDaysAtSea: 30,
      };
    } catch (error) {
      logger.error('Failed to get crew profile', error as Error);
      return null;
    }
  }

  private calculateTrend(metrics: CrewWellnessMetricDB[]): { direction: 'improving' | 'stable' | 'declining'; days: number } {
    if (metrics.length < 7) return { direction: 'stable', days: metrics.length };
    const recent = metrics.slice(0, 7);
    const older = metrics.slice(7, 14);
    const recentAvg = recent.reduce((sum, m) => sum + (m.wellness_score || 0), 0) / recent.length;
    const olderAvg = older.length > 0 ? older.reduce((sum, m) => sum + (m.wellness_score || 0), 0) / older.length : recentAvg;
    const diff = recentAvg - olderAvg;
    if (diff > 5) return { direction: 'improving', days: 7 };
    if (diff < -5) return { direction: 'declining', days: 7 };
    return { direction: 'stable', days: 7 };
  }

  private getStatusFromScore(score: number): CrewWellnessProfile['currentStatus'] {
    if (score >= 85) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 55) return 'fair';
    if (score >= 40) return 'concerning';
    return 'critical';
  }

  private identifyRiskFactors(metrics: CrewWellnessMetricDB | undefined): string[] {
    if (!metrics) return [];
    const factors: string[] = [];
    if (metrics.fatigue_index && metrics.fatigue_index > 60) factors.push('Fadiga elevada');
    if (metrics.stress_level && metrics.stress_level > 60) factors.push('Estresse elevado');
    if (metrics.sleep_quality && metrics.sleep_quality < 50) factors.push('Qualidade de sono ruim');
    return factors;
  }

  private generateRecommendations(metrics: CrewWellnessMetricDB | undefined): string[] {
    if (!metrics) return ['Iniciar monitoramento de bem-estar'];
    const recs: string[] = [];
    if (metrics.sleep_quality && metrics.sleep_quality < 60) recs.push('Otimizar ambiente de sono');
    if (metrics.stress_level && metrics.stress_level > 60) recs.push('Implementar pausas de relaxamento');
    if (metrics.fatigue_index && metrics.fatigue_index > 60) recs.push('Reduzir carga de trabalho');
    return recs.length > 0 ? recs : ['Manter rotinas atuais'];
  }

  async getVesselReport(vesselId: string): Promise<VesselWellnessReport | null> {
    try {
      const { data: vessel } = await supabase.from('vessels').select('name').eq('id', vesselId).maybeSingle();
      const { data: crewMembers } = await supabase.from('crew_members').select('id').eq('vessel_id', vesselId);

      if (!crewMembers || crewMembers.length === 0) {
        return {
          vesselId, vesselName: vessel?.name || 'Unknown', reportDate: new Date(),
          avgWellnessScore: 0, avgStressLevel: 0, avgFatigueIndex: 0,
          excellentCount: 0, goodCount: 0, fairCount: 0, concerningCount: 0, criticalCount: 0,
          activeAlerts: 0, highPriorityAlerts: 0,
          vesselRecommendations: ['Nenhum tripulante registrado'],
        };
      }

      const crewIds = crewMembers.map(c => c.id);
      const { data: allMetrics } = await crewWellnessMetricsTable.select('*');
      const metrics = ((allMetrics || []) as CrewWellnessMetricDB[]).filter(m => crewIds.includes(m.crew_member_id));

      // Get latest per crew member
      const latestMap = new Map<string, CrewWellnessMetricDB>();
      metrics.forEach(m => {
        const existing = latestMap.get(m.crew_member_id);
        if (!existing || new Date(m.date) > new Date(existing.date)) {
          latestMap.set(m.crew_member_id, m);
        }
      });
      const latestMetrics = Array.from(latestMap.values());

      const avgWellness = latestMetrics.reduce((s, m) => s + (m.wellness_score || 0), 0) / (latestMetrics.length || 1);
      const avgStress = latestMetrics.reduce((s, m) => s + (m.stress_level || 0), 0) / (latestMetrics.length || 1);
      const avgFatigue = latestMetrics.reduce((s, m) => s + (m.fatigue_index || 0), 0) / (latestMetrics.length || 1);

      const counts = { excellent: 0, good: 0, fair: 0, concerning: 0, critical: 0 };
      latestMetrics.forEach(m => { counts[this.getStatusFromScore(m.wellness_score || 0)]++; });

      const { data: alerts } = await wellnessAlertsTable.selectWithFilter('*', [{ column: 'is_active', operator: 'eq', value: true }]);
      const crewAlerts = ((alerts || []) as WellnessAlertDB[]).filter(a => crewIds.includes(a.crew_member_id));

      return {
        vesselId, vesselName: vessel?.name || 'Unknown', reportDate: new Date(),
        avgWellnessScore: Math.round(avgWellness),
        avgStressLevel: Math.round(avgStress),
        avgFatigueIndex: Math.round(avgFatigue),
        excellentCount: counts.excellent, goodCount: counts.good, fairCount: counts.fair,
        concerningCount: counts.concerning, criticalCount: counts.critical,
        activeAlerts: crewAlerts.length,
        highPriorityAlerts: crewAlerts.filter(a => ['high', 'critical'].includes(a.severity)).length,
        vesselRecommendations: avgStress > 50 ? ['Implementar programa de gerenciamento de estresse'] : ['Tripulação saudável'],
      };
    } catch (error) {
      logger.error('Failed to generate vessel report', error as Error);
      return null;
    }
  }

  async syncWearableData(crewMemberId: string, wearableType: string, data: Partial<WellnessMetrics>): Promise<void> {
    const metrics: WellnessMetrics = {
      crewMemberId, date: new Date(),
      heartRateAvg: data.heartRateAvg || 72, heartRateVariability: data.heartRateVariability || 45,
      sleepHours: data.sleepHours || 7, sleepQuality: data.sleepQuality || 70,
      stepCount: data.stepCount || 5000, activeMinutes: data.activeMinutes || 30,
      stressLevel: data.stressLevel || 40, fatigueIndex: data.fatigueIndex || 35,
      recoveryScore: data.recoveryScore || 65, responseTimeAvg: data.responseTimeAvg || 15,
      messageVolume: data.messageVolume || 10, sentimentScore: data.sentimentScore || 0.2,
      hoursOnDuty: data.hoursOnDuty || 8, breaksTaken: data.breaksTaken || 3,
      tasksCompleted: data.tasksCompleted || 5, incidentsReported: data.incidentsReported || 0,
    };
    await this.analyzeCrewWellness(crewMemberId, metrics);
    logger.info('Wearable data synced', { crewMemberId, wearableType });
  }

  async getActiveAlerts(crewMemberId?: string): Promise<WellnessAlert[]> {
    try {
      const { data } = await wellnessAlertsTable.selectWithFilter('*', [{ column: 'is_active', operator: 'eq', value: true }]);
      const alerts = ((data || []) as WellnessAlertDB[])
        .filter(a => !crewMemberId || a.crew_member_id === crewMemberId)
        .map(a => ({
          id: a.id,
          crewMemberId: a.crew_member_id,
          crewMemberName: '',
          alertType: a.alert_type as WellnessAlertType,
          severity: a.severity as WellnessAlert['severity'],
          title: a.title,
          description: a.description || '',
          recommendation: a.recommendation || '',
          createdAt: new Date(a.created_at),
          acknowledgedAt: a.acknowledged_at ? new Date(a.acknowledged_at) : undefined,
          acknowledgedBy: a.acknowledged_by || undefined,
        }));
      return alerts;
    } catch (error) {
      logger.error('Failed to fetch alerts', error as Error);
      return [];
    }
  }

  async acknowledgeAlert(alertId: string, acknowledgedBy: string): Promise<boolean> {
    try {
      const { error } = await wellnessAlertsTable.update(alertId, {
        is_active: false,
        acknowledged_at: new Date().toISOString(),
        acknowledged_by: acknowledgedBy,
      } as never);
      return !error;
    } catch {
      return false;
    }
  }
}

export const wellnessPredictor = new WellnessPredictor();
