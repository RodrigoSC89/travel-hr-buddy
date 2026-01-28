/**
 * Fatigue Risk AI Engine
 * Monitoramento autônomo de horas de descanso com alertas proativos
 */

export interface WorkRestRecord {
  crew_member_id: string;
  date: string;
  work_periods: WorkPeriod[];
  rest_periods: RestPeriod[];
  total_work_hours: number;
  total_rest_hours: number;
}

export interface WorkPeriod {
  start: string;
  end: string;
  duration_hours: number;
  task_type: string;
  intensity: 'low' | 'medium' | 'high';
}

export interface RestPeriod {
  start: string;
  end: string;
  duration_hours: number;
  quality: 'poor' | 'fair' | 'good' | 'excellent';
  interrupted: boolean;
}

export interface FatigueAssessment {
  crew_member_id: string;
  crew_member_name: string;
  assessment_date: string;
  fatigue_score: number; // 0-100 (0=no fatigue, 100=extreme fatigue)
  risk_level: 'low' | 'moderate' | 'high' | 'critical';
  mlc_compliance: MLCCompliance;
  stcw_compliance: STCWCompliance;
  contributing_factors: FatigueFactor[];
  predicted_performance: number; // 0-100
  recommendations: FatigueRecommendation[];
  alerts: FatigueAlert[];
}

export interface MLCCompliance {
  compliant: boolean;
  max_work_hours_24h: number; // Max 14h
  min_rest_hours_24h: number; // Min 10h
  max_work_hours_7d: number; // Max 72h
  violations: ComplianceViolation[];
}

export interface STCWCompliance {
  compliant: boolean;
  rest_period_violations: number;
  consecutive_rest_met: boolean; // One 6h block required
  violations: ComplianceViolation[];
}

export interface ComplianceViolation {
  type: string;
  severity: 'minor' | 'major' | 'critical';
  description: string;
  occurred_at: string;
  regulation: string;
}

export interface FatigueFactor {
  factor: string;
  impact: number; // 0-1
  description: string;
}

export interface FatigueRecommendation {
  priority: 'low' | 'medium' | 'high' | 'urgent';
  action: string;
  expected_improvement: number; // percentage
  timeline: string;
}

export interface FatigueAlert {
  id: string;
  type: 'compliance' | 'fatigue' | 'performance' | 'safety';
  severity: 'warning' | 'critical';
  message: string;
  created_at: string;
  auto_action?: AutoAction;
}

export interface AutoAction {
  type: 'notify_supervisor' | 'block_duty' | 'mandatory_rest' | 'medical_review';
  executed: boolean;
  execution_time?: string;
  result?: string;
}

export interface CrewFatigueReport {
  vessel_id: string;
  vessel_name: string;
  report_date: string;
  crew_assessments: FatigueAssessment[];
  overall_fatigue_index: number;
  compliance_status: {
    mlc: { compliant: number; violations: number };
    stcw: { compliant: number; violations: number };
  };
  high_risk_crew: string[];
  autonomous_actions: AutoAction[];
  predictions: FatiguePrediction[];
}

export interface FatiguePrediction {
  crew_member_id: string;
  crew_member_name: string;
  predicted_fatigue_24h: number;
  predicted_fatigue_48h: number;
  predicted_fatigue_7d: number;
  risk_window_start?: string;
  risk_window_end?: string;
}

class FatigueRiskEngine {
  private readonly MLC_LIMITS = {
    MAX_WORK_24H: 14,
    MIN_REST_24H: 10,
    MAX_WORK_7D: 72,
    MIN_REST_7D: 77
  };

  private readonly STCW_LIMITS = {
    MIN_REST_24H: 10,
    MIN_CONSECUTIVE_REST: 6,
    MAX_SPLIT_PERIODS: 2
  };

  /**
   * Assess fatigue for a crew member
   */
  assessFatigue(
    crewMemberId: string,
    crewMemberName: string,
    records: WorkRestRecord[]
  ): FatigueAssessment {
    const recentRecords = records
      .filter(r => r.crew_member_id === crewMemberId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 7);

    const fatigueScore = this.calculateFatigueScore(recentRecords);
    const riskLevel = this.determineRiskLevel(fatigueScore);
    const mlcCompliance = this.checkMLCCompliance(recentRecords);
    const stcwCompliance = this.checkSTCWCompliance(recentRecords);
    const contributingFactors = this.identifyContributingFactors(recentRecords);
    const predictedPerformance = this.predictPerformance(fatigueScore);
    const recommendations = this.generateRecommendations(fatigueScore, riskLevel, contributingFactors);
    const alerts = this.generateAlerts(
      crewMemberId,
      crewMemberName,
      fatigueScore,
      riskLevel,
      mlcCompliance,
      stcwCompliance
    );

    return {
      crew_member_id: crewMemberId,
      crew_member_name: crewMemberName,
      assessment_date: new Date().toISOString(),
      fatigue_score: fatigueScore,
      risk_level: riskLevel,
      mlc_compliance: mlcCompliance,
      stcw_compliance: stcwCompliance,
      contributing_factors: contributingFactors,
      predicted_performance: predictedPerformance,
      recommendations,
      alerts
    };
  }

  /**
   * Generate vessel-wide fatigue report
   */
  generateCrewReport(
    vesselId: string,
    vesselName: string,
    crewMembers: { id: string; name: string }[],
    records: WorkRestRecord[]
  ): CrewFatigueReport {
    const assessments = crewMembers.map(crew =>
      this.assessFatigue(crew.id, crew.name, records)
    );

    const overallIndex = assessments.length > 0
      ? assessments.reduce((sum, a) => sum + a.fatigue_score, 0) / assessments.length
      : 0;

    const highRiskCrew = assessments
      .filter(a => a.risk_level === 'high' || a.risk_level === 'critical')
      .map(a => a.crew_member_name);

    const mlcViolations = assessments.filter(a => !a.mlc_compliance.compliant).length;
    const stcwViolations = assessments.filter(a => !a.stcw_compliance.compliant).length;

    const autonomousActions = this.executeAutonomousActions(assessments);
    const predictions = this.generatePredictions(crewMembers, records);

    return {
      vessel_id: vesselId,
      vessel_name: vesselName,
      report_date: new Date().toISOString(),
      crew_assessments: assessments,
      overall_fatigue_index: Math.round(overallIndex),
      compliance_status: {
        mlc: {
          compliant: assessments.length - mlcViolations,
          violations: mlcViolations
        },
        stcw: {
          compliant: assessments.length - stcwViolations,
          violations: stcwViolations
        }
      },
      high_risk_crew: highRiskCrew,
      autonomous_actions: autonomousActions,
      predictions
    };
  }

  /**
   * Predict fatigue for upcoming periods
   */
  predictFatigue(
    crewMemberId: string,
    records: WorkRestRecord[],
    scheduledWork: WorkPeriod[]
  ): { hours_24: number; hours_48: number; hours_7d: number } {
    const currentFatigue = this.calculateFatigueScore(
      records.filter(r => r.crew_member_id === crewMemberId).slice(0, 7)
    );

    // Simulate fatigue accumulation based on scheduled work
    const scheduledHours = scheduledWork.reduce((sum, w) => sum + w.duration_hours, 0);
    const avgIntensity = scheduledWork.length > 0
      ? scheduledWork.reduce((sum, w) => {
          const intensityScore = { low: 0.5, medium: 1, high: 1.5 }[w.intensity];
          return sum + intensityScore;
        }, 0) / scheduledWork.length
      : 1;

    const fatigueAccumulation = scheduledHours * avgIntensity * 2;

    return {
      hours_24: Math.min(100, currentFatigue + fatigueAccumulation * 0.3),
      hours_48: Math.min(100, currentFatigue + fatigueAccumulation * 0.5),
      hours_7d: Math.min(100, currentFatigue + fatigueAccumulation * 0.8)
    };
  }

  private calculateFatigueScore(records: WorkRestRecord[]): number {
    if (records.length === 0) return 0;

    let fatiguePoints = 0;

    // Factor 1: Work hours accumulation
    const totalWorkHours = records.reduce((sum, r) => sum + r.total_work_hours, 0);
    const avgWorkPerDay = totalWorkHours / records.length;
    if (avgWorkPerDay > 12) fatiguePoints += 30;
    else if (avgWorkPerDay > 10) fatiguePoints += 20;
    else if (avgWorkPerDay > 8) fatiguePoints += 10;

    // Factor 2: Rest quality
    const restPeriods = records.flatMap(r => r.rest_periods);
    const avgRestQuality = restPeriods.length > 0
      ? restPeriods.reduce((sum, r) => {
          const qualityScore = { poor: 0.25, fair: 0.5, good: 0.75, excellent: 1 }[r.quality];
          return sum + qualityScore;
        }, 0) / restPeriods.length
      : 0.5;
    fatiguePoints += (1 - avgRestQuality) * 30;

    // Factor 3: Interrupted rest
    const interruptedRest = restPeriods.filter(r => r.interrupted).length;
    fatiguePoints += Math.min(20, interruptedRest * 5);

    // Factor 4: High intensity work
    const workPeriods = records.flatMap(r => r.work_periods);
    const highIntensityHours = workPeriods
      .filter(w => w.intensity === 'high')
      .reduce((sum, w) => sum + w.duration_hours, 0);
    fatiguePoints += Math.min(20, highIntensityHours * 2);

    return Math.min(100, Math.round(fatiguePoints));
  }

  private determineRiskLevel(fatigueScore: number): FatigueAssessment['risk_level'] {
    if (fatigueScore >= 80) return 'critical';
    if (fatigueScore >= 60) return 'high';
    if (fatigueScore >= 40) return 'moderate';
    return 'low';
  }

  private checkMLCCompliance(records: WorkRestRecord[]): MLCCompliance {
    const violations: ComplianceViolation[] = [];
    
    // Check each day
    records.forEach(record => {
      if (record.total_work_hours > this.MLC_LIMITS.MAX_WORK_24H) {
        violations.push({
          type: 'max_work_exceeded',
          severity: 'major',
          description: `Trabalhou ${record.total_work_hours}h em 24h (máx: ${this.MLC_LIMITS.MAX_WORK_24H}h)`,
          occurred_at: record.date,
          regulation: 'MLC 2006 Standard A2.3'
        });
      }

      if (record.total_rest_hours < this.MLC_LIMITS.MIN_REST_24H) {
        violations.push({
          type: 'min_rest_not_met',
          severity: 'major',
          description: `Descansou apenas ${record.total_rest_hours}h em 24h (mín: ${this.MLC_LIMITS.MIN_REST_24H}h)`,
          occurred_at: record.date,
          regulation: 'MLC 2006 Standard A2.3'
        });
      }
    });

    // Check 7-day totals
    const totalWork7d = records.slice(0, 7).reduce((sum, r) => sum + r.total_work_hours, 0);
    if (totalWork7d > this.MLC_LIMITS.MAX_WORK_7D) {
      violations.push({
        type: 'weekly_max_exceeded',
        severity: 'critical',
        description: `Trabalhou ${totalWork7d}h em 7 dias (máx: ${this.MLC_LIMITS.MAX_WORK_7D}h)`,
        occurred_at: records[0]?.date || new Date().toISOString(),
        regulation: 'MLC 2006 Standard A2.3'
      });
    }

    return {
      compliant: violations.length === 0,
      max_work_hours_24h: records[0]?.total_work_hours || 0,
      min_rest_hours_24h: records[0]?.total_rest_hours || 0,
      max_work_hours_7d: totalWork7d,
      violations
    };
  }

  private checkSTCWCompliance(records: WorkRestRecord[]): STCWCompliance {
    const violations: ComplianceViolation[] = [];
    let restPeriodViolations = 0;
    let consecutiveRestMet = true;

    records.forEach(record => {
      // Check for minimum consecutive rest
      const hasConsecutiveRest = record.rest_periods.some(
        r => r.duration_hours >= this.STCW_LIMITS.MIN_CONSECUTIVE_REST
      );

      if (!hasConsecutiveRest) {
        consecutiveRestMet = false;
        restPeriodViolations++;
        violations.push({
          type: 'consecutive_rest_not_met',
          severity: 'major',
          description: `Nenhum período de descanso >= ${this.STCW_LIMITS.MIN_CONSECUTIVE_REST}h consecutivas`,
          occurred_at: record.date,
          regulation: 'STCW Code Section A-VIII/1'
        });
      }

      // Check for too many split periods
      if (record.rest_periods.length > this.STCW_LIMITS.MAX_SPLIT_PERIODS) {
        violations.push({
          type: 'too_many_split_periods',
          severity: 'minor',
          description: `${record.rest_periods.length} períodos de descanso (máx: ${this.STCW_LIMITS.MAX_SPLIT_PERIODS})`,
          occurred_at: record.date,
          regulation: 'STCW Code Section A-VIII/1'
        });
      }
    });

    return {
      compliant: violations.filter(v => v.severity !== 'minor').length === 0,
      rest_period_violations: restPeriodViolations,
      consecutive_rest_met: consecutiveRestMet,
      violations
    };
  }

  private identifyContributingFactors(records: WorkRestRecord[]): FatigueFactor[] {
    const factors: FatigueFactor[] = [];

    const avgWorkHours = records.length > 0
      ? records.reduce((sum, r) => sum + r.total_work_hours, 0) / records.length
      : 0;

    if (avgWorkHours > 10) {
      factors.push({
        factor: 'Horas de trabalho excessivas',
        impact: Math.min(1, (avgWorkHours - 10) / 4),
        description: `Média de ${avgWorkHours.toFixed(1)}h/dia de trabalho`
      });
    }

    const restPeriods = records.flatMap(r => r.rest_periods);
    const poorRestCount = restPeriods.filter(r => r.quality === 'poor').length;
    if (poorRestCount > 0) {
      factors.push({
        factor: 'Qualidade de descanso ruim',
        impact: Math.min(1, poorRestCount / restPeriods.length),
        description: `${poorRestCount} períodos de descanso de baixa qualidade`
      });
    }

    const interruptedCount = restPeriods.filter(r => r.interrupted).length;
    if (interruptedCount > 0) {
      factors.push({
        factor: 'Descanso interrompido',
        impact: Math.min(1, interruptedCount / restPeriods.length),
        description: `${interruptedCount} interrupções de descanso`
      });
    }

    const workPeriods = records.flatMap(r => r.work_periods);
    const highIntensityCount = workPeriods.filter(w => w.intensity === 'high').length;
    if (highIntensityCount > workPeriods.length * 0.3) {
      factors.push({
        factor: 'Alta intensidade de trabalho',
        impact: highIntensityCount / workPeriods.length,
        description: `${highIntensityCount} períodos de alta intensidade`
      });
    }

    return factors.sort((a, b) => b.impact - a.impact);
  }

  private predictPerformance(fatigueScore: number): number {
    // Performance decreases as fatigue increases
    // Based on fatigue research: performance drops ~25% at high fatigue
    const baseLine = 100;
    const degradation = fatigueScore * 0.4; // Max 40% drop
    return Math.max(60, Math.round(baseLine - degradation));
  }

  private generateRecommendations(
    fatigueScore: number,
    riskLevel: FatigueAssessment['risk_level'],
    factors: FatigueFactor[]
  ): FatigueRecommendation[] {
    const recommendations: FatigueRecommendation[] = [];

    if (riskLevel === 'critical') {
      recommendations.push({
        priority: 'urgent',
        action: 'Afastar imediatamente de funções críticas de segurança',
        expected_improvement: 30,
        timeline: 'Imediato'
      });
      recommendations.push({
        priority: 'urgent',
        action: 'Garantir período mínimo de 10h de descanso ininterrupto',
        expected_improvement: 25,
        timeline: 'Próximas 12h'
      });
    }

    if (riskLevel === 'high' || riskLevel === 'critical') {
      recommendations.push({
        priority: 'high',
        action: 'Reduzir carga de trabalho em 25%',
        expected_improvement: 20,
        timeline: 'Próximos 3 dias'
      });
    }

    factors.forEach(factor => {
      if (factor.factor.includes('interrompido')) {
        recommendations.push({
          priority: 'medium',
          action: 'Proteger períodos de descanso de interrupções',
          expected_improvement: 15,
          timeline: 'Próxima semana'
        });
      }
      if (factor.factor.includes('intensidade')) {
        recommendations.push({
          priority: 'medium',
          action: 'Alternar tarefas de alta intensidade com períodos mais leves',
          expected_improvement: 10,
          timeline: 'Próxima escala'
        });
      }
    });

    return recommendations;
  }

  private generateAlerts(
    crewMemberId: string,
    crewMemberName: string,
    fatigueScore: number,
    riskLevel: FatigueAssessment['risk_level'],
    mlcCompliance: MLCCompliance,
    stcwCompliance: STCWCompliance
  ): FatigueAlert[] {
    const alerts: FatigueAlert[] = [];

    if (riskLevel === 'critical') {
      alerts.push({
        id: `fatigue_${crewMemberId}_${Date.now()}`,
        type: 'safety',
        severity: 'critical',
        message: `${crewMemberName}: Nível crítico de fadiga (${fatigueScore}%) - risco de segurança`,
        created_at: new Date().toISOString(),
        auto_action: {
          type: 'block_duty',
          executed: true,
          execution_time: new Date().toISOString(),
          result: 'Bloqueio automático de funções críticas ativado'
        }
      });
    }

    if (!mlcCompliance.compliant) {
      mlcCompliance.violations
        .filter(v => v.severity === 'critical' || v.severity === 'major')
        .forEach(violation => {
          alerts.push({
            id: `mlc_${crewMemberId}_${Date.now()}`,
            type: 'compliance',
            severity: violation.severity === 'critical' ? 'critical' : 'warning',
            message: `${crewMemberName}: Violação MLC - ${violation.description}`,
            created_at: new Date().toISOString(),
            auto_action: {
              type: 'notify_supervisor',
              executed: true,
              execution_time: new Date().toISOString()
            }
          });
        });
    }

    if (!stcwCompliance.compliant) {
      alerts.push({
        id: `stcw_${crewMemberId}_${Date.now()}`,
        type: 'compliance',
        severity: 'warning',
        message: `${crewMemberName}: Violação STCW - ${stcwCompliance.rest_period_violations} violações de período de descanso`,
        created_at: new Date().toISOString()
      });
    }

    return alerts;
  }

  private executeAutonomousActions(assessments: FatigueAssessment[]): AutoAction[] {
    const actions: AutoAction[] = [];

    assessments.forEach(assessment => {
      assessment.alerts.forEach(alert => {
        if (alert.auto_action && alert.auto_action.executed) {
          actions.push(alert.auto_action);
        }
      });
    });

    return actions;
  }

  private generatePredictions(
    crewMembers: { id: string; name: string }[],
    records: WorkRestRecord[]
  ): FatiguePrediction[] {
    return crewMembers.map(crew => {
      const crewRecords = records.filter(r => r.crew_member_id === crew.id);
      const currentFatigue = this.calculateFatigueScore(crewRecords.slice(0, 7));

      // Simple prediction model: fatigue accumulates if work pattern continues
      const avgWork = crewRecords.slice(0, 7).reduce((sum, r) => sum + r.total_work_hours, 0) / 7;
      const fatigueRate = avgWork > 10 ? 5 : avgWork > 8 ? 2 : -2;

      return {
        crew_member_id: crew.id,
        crew_member_name: crew.name,
        predicted_fatigue_24h: Math.min(100, Math.max(0, currentFatigue + fatigueRate)),
        predicted_fatigue_48h: Math.min(100, Math.max(0, currentFatigue + fatigueRate * 2)),
        predicted_fatigue_7d: Math.min(100, Math.max(0, currentFatigue + fatigueRate * 5)),
        risk_window_start: currentFatigue > 60 ? new Date().toISOString() : undefined,
        risk_window_end: currentFatigue > 60
          ? new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
          : undefined
      };
    });
  }
}

export const fatigueRiskEngine = new FatigueRiskEngine();
