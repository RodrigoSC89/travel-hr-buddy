/**
 * Crew Turnover Prediction Engine
 * ML identifica tripulantes com risco de saída e sugere ações de retenção
 * Nível: Assistivo
 */

export interface CrewMemberProfile {
  id: string;
  name: string;
  position: string;
  department: string;
  hireDate: Date;
  contractEndDate: Date;
  age: number;
  nationality: string;
  yearsOfExperience: number;
  currentVesselTenure: number;
  totalTenure: number;
  performanceScores: number[];
  trainingCompletionRate: number;
  certificationStatus: 'valid' | 'expiring_soon' | 'expired';
  lastPromotionDate: Date | null;
  salaryBand: 'below_market' | 'market_rate' | 'above_market';
  overtimeHours: number;
  restViolations: number;
  incidentInvolvement: number;
  feedbackSentiment: number;
  engagementScore: number;
  absenceRate: number;
  familyStatus: 'single' | 'married' | 'with_children';
  homeDistance: 'local' | 'domestic' | 'international';
}

export interface RiskFactor {
  factor: string;
  impact: number;
  category: 'compensation' | 'workload' | 'career' | 'personal' | 'engagement' | 'compliance';
  description: string;
  trend: 'improving' | 'stable' | 'worsening';
}

export interface RetentionAction {
  action: string;
  category: 'compensation' | 'development' | 'worklife' | 'recognition' | 'career';
  priority: 'immediate' | 'short_term' | 'medium_term';
  estimatedCost: number;
  expectedImpact: number;
  implementationTime: string;
  responsibleDepartment: string;
}

export interface TurnoverPrediction {
  crewMemberId: string;
  crewMemberName: string;
  position: string;
  turnoverRisk: number;
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  predictedDepartureWindow: string;
  topRiskFactors: RiskFactor[];
  retentionRecommendations: RetentionAction[];
  estimatedReplacementCost: number;
  confidence: number;
  lastUpdated: Date;
}

export interface TeamTurnoverAnalysis {
  department: string;
  totalCrew: number;
  atRiskCount: number;
  averageRiskScore: number;
  predictedTurnoverRate: number;
  topRiskFactors: string[];
  recommendations: string[];
  estimatedImpact: {
    operationalRisk: number;
    replacementCost: number;
    knowledgeLoss: 'low' | 'medium' | 'high';
  };
}

class TurnoverPredictionEngine {
  private readonly REPLACEMENT_COST_MULTIPLIER = 1.5;
  private readonly BASE_SALARY_BY_POSITION: Record<string, number> = {
    'captain': 120000,
    'chief_officer': 90000,
    'second_officer': 70000,
    'chief_engineer': 110000,
    'second_engineer': 80000,
    'able_seaman': 45000,
    'oiler': 40000,
    'cook': 35000,
    'default': 50000
  };

  predictTurnover(profile: CrewMemberProfile): TurnoverPrediction {
    const riskFactors = this.analyzeRiskFactors(profile);
    const turnoverRisk = this.calculateTurnoverRisk(riskFactors);
    const riskLevel = this.categorizeRisk(turnoverRisk);
    const recommendations = this.generateRetentionRecommendations(riskFactors, profile);

    return {
      crewMemberId: profile.id,
      crewMemberName: profile.name,
      position: profile.position,
      turnoverRisk,
      riskLevel,
      predictedDepartureWindow: this.predictDepartureWindow(turnoverRisk, profile),
      topRiskFactors: riskFactors.slice(0, 5),
      retentionRecommendations: recommendations,
      estimatedReplacementCost: this.calculateReplacementCost(profile),
      confidence: this.calculateConfidence(profile),
      lastUpdated: new Date()
    };
  }

  analyzeTeam(profiles: CrewMemberProfile[], department?: string): TeamTurnoverAnalysis {
    const filtered = department 
      ? profiles.filter(p => p.department === department)
      : profiles;

    const predictions = filtered.map(p => this.predictTurnover(p));
    const atRiskPredictions = predictions.filter(p => p.riskLevel !== 'low');

    const allFactors = predictions.flatMap(p => p.topRiskFactors);
    const factorCounts = new Map<string, number>();
    allFactors.forEach(f => {
      factorCounts.set(f.factor, (factorCounts.get(f.factor) || 0) + 1);
    });

    const topFactors = [...factorCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([factor]) => factor);

    const avgRisk = predictions.length > 0 
      ? predictions.reduce((sum, p) => sum + p.turnoverRisk, 0) / predictions.length
      : 0;
    const predictedTurnover = filtered.length > 0 
      ? (atRiskPredictions.length / filtered.length) * 100
      : 0;

    return {
      department: department || 'All Departments',
      totalCrew: filtered.length,
      atRiskCount: atRiskPredictions.length,
      averageRiskScore: Math.round(avgRisk),
      predictedTurnoverRate: Math.round(predictedTurnover * 10) / 10,
      topRiskFactors: topFactors,
      recommendations: this.generateTeamRecommendations(topFactors, atRiskPredictions),
      estimatedImpact: {
        operationalRisk: this.calculateOperationalRisk(atRiskPredictions),
        replacementCost: atRiskPredictions.reduce((sum, p) => sum + p.estimatedReplacementCost, 0),
        knowledgeLoss: this.assessKnowledgeLoss(atRiskPredictions)
      }
    };
  }

  private analyzeRiskFactors(profile: CrewMemberProfile): RiskFactor[] {
    const factors: RiskFactor[] = [];

    if (profile.salaryBand === 'below_market') {
      factors.push({
        factor: 'Salário abaixo do mercado',
        impact: 35,
        category: 'compensation',
        description: 'Remuneração 15-25% abaixo da média do mercado para a posição',
        trend: 'stable'
      });
    }

    if (profile.overtimeHours > 60) {
      factors.push({
        factor: 'Carga de trabalho excessiva',
        impact: 30,
        category: 'workload',
        description: `Média de ${profile.overtimeHours}h extras/mês - risco de burnout`,
        trend: profile.overtimeHours > 80 ? 'worsening' : 'stable'
      });
    }

    if (profile.restViolations > 3) {
      factors.push({
        factor: 'Violações de descanso frequentes',
        impact: 28,
        category: 'workload',
        description: `${profile.restViolations} violações nos últimos 12 meses`,
        trend: 'worsening'
      });
    }

    const monthsSincePromotion = profile.lastPromotionDate
      ? this.monthsBetween(profile.lastPromotionDate, new Date())
      : profile.totalTenure;

    if (monthsSincePromotion > 36 && profile.performanceScores.slice(-3).every(s => s >= 80)) {
      factors.push({
        factor: 'Estagnação de carreira',
        impact: 32,
        category: 'career',
        description: 'Alto desempenho sem promoção há mais de 3 anos',
        trend: 'worsening'
      });
    }

    if (profile.trainingCompletionRate < 70) {
      factors.push({
        factor: 'Baixo investimento em desenvolvimento',
        impact: 18,
        category: 'career',
        description: 'Taxa de conclusão de treinamentos abaixo de 70%',
        trend: 'stable'
      });
    }

    if (profile.engagementScore < 50) {
      factors.push({
        factor: 'Baixo engajamento',
        impact: 40,
        category: 'engagement',
        description: `Score de engajamento: ${profile.engagementScore}/100`,
        trend: profile.engagementScore < 40 ? 'worsening' : 'stable'
      });
    }

    if (profile.feedbackSentiment < -0.3) {
      factors.push({
        factor: 'Sentimento negativo em feedbacks',
        impact: 25,
        category: 'engagement',
        description: 'Análise de NLP indica insatisfação recorrente',
        trend: 'worsening'
      });
    }

    if (profile.familyStatus === 'with_children' && profile.homeDistance === 'international') {
      factors.push({
        factor: 'Distância familiar',
        impact: 22,
        category: 'personal',
        description: 'Família em outro país - impacto na qualidade de vida',
        trend: 'stable'
      });
    }

    const monthsToContractEnd = this.monthsBetween(new Date(), profile.contractEndDate);
    if (monthsToContractEnd <= 3) {
      factors.push({
        factor: 'Contrato próximo do vencimento',
        impact: 45,
        category: 'compliance',
        description: `Contrato expira em ${monthsToContractEnd} meses`,
        trend: 'worsening'
      });
    }

    if (profile.totalTenure >= 12 && profile.totalTenure <= 24) {
      factors.push({
        factor: 'Período crítico de tenure',
        impact: 15,
        category: 'engagement',
        description: 'Período de 1-2 anos tem maior taxa de turnover',
        trend: 'stable'
      });
    }

    if (profile.performanceScores.length >= 3) {
      const recent = profile.performanceScores.slice(-3);
      const earlier = profile.performanceScores.slice(0, -3);
      const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
      const earlierAvg = earlier.length > 0 
        ? earlier.reduce((a, b) => a + b, 0) / earlier.length 
        : recentAvg;

      if (recentAvg < earlierAvg - 10) {
        factors.push({
          factor: 'Declínio de desempenho',
          impact: 20,
          category: 'engagement',
          description: 'Queda de performance nos últimos reviews',
          trend: 'worsening'
        });
      }
    }

    if (profile.absenceRate > 5) {
      factors.push({
        factor: 'Taxa de ausência elevada',
        impact: 18,
        category: 'engagement',
        description: `Taxa de ${profile.absenceRate}% acima da média`,
        trend: profile.absenceRate > 8 ? 'worsening' : 'stable'
      });
    }

    return factors.sort((a, b) => b.impact - a.impact);
  }

  private calculateTurnoverRisk(factors: RiskFactor[]): number {
    if (factors.length === 0) return 10;

    let totalRisk = 0;
    let weight = 1;

    for (const factor of factors) {
      totalRisk += factor.impact * weight;
      weight *= 0.75;
    }

    return Math.min(100, Math.round(totalRisk));
  }

  private categorizeRisk(riskScore: number): TurnoverPrediction['riskLevel'] {
    if (riskScore >= 75) return 'critical';
    if (riskScore >= 50) return 'high';
    if (riskScore >= 30) return 'moderate';
    return 'low';
  }

  private predictDepartureWindow(risk: number, profile: CrewMemberProfile): string {
    const contractEnd = this.monthsBetween(new Date(), profile.contractEndDate);

    if (contractEnd <= 3) return 'Fim do contrato atual';
    if (risk >= 75) return '1-3 meses';
    if (risk >= 50) return '3-6 meses';
    if (risk >= 30) return '6-12 meses';
    return 'Mais de 12 meses';
  }

  private generateRetentionRecommendations(
    factors: RiskFactor[],
    profile: CrewMemberProfile
  ): RetentionAction[] {
    const actions: RetentionAction[] = [];

    for (const factor of factors.slice(0, 3)) {
      switch (factor.category) {
        case 'compensation':
          actions.push({
            action: 'Revisão salarial com ajuste de mercado',
            category: 'compensation',
            priority: 'immediate',
            estimatedCost: this.getBaseSalary(profile.position) * 0.15,
            expectedImpact: 25,
            implementationTime: '30 dias',
            responsibleDepartment: 'RH/Compensação'
          });
          break;

        case 'workload':
          actions.push({
            action: 'Reestruturação de escala e redistribuição de tarefas',
            category: 'worklife',
            priority: 'immediate',
            estimatedCost: 2000,
            expectedImpact: 20,
            implementationTime: '14 dias',
            responsibleDepartment: 'Operações'
          });
          break;

        case 'career':
          actions.push({
            action: 'Plano de desenvolvimento individual com path de promoção',
            category: 'career',
            priority: 'short_term',
            estimatedCost: 5000,
            expectedImpact: 30,
            implementationTime: '60 dias',
            responsibleDepartment: 'RH/T&D'
          });
          break;

        case 'engagement':
          actions.push({
            action: 'Programa de mentoria e reconhecimento',
            category: 'recognition',
            priority: 'short_term',
            estimatedCost: 1500,
            expectedImpact: 15,
            implementationTime: '30 dias',
            responsibleDepartment: 'RH'
          });
          break;

        case 'personal':
          actions.push({
            action: 'Benefício de passagem aérea familiar ampliado',
            category: 'worklife',
            priority: 'medium_term',
            estimatedCost: 4000,
            expectedImpact: 18,
            implementationTime: 'Próximo contrato',
            responsibleDepartment: 'RH/Benefícios'
          });
          break;
      }
    }

    if (factors.length > 0 && this.calculateTurnoverRisk(factors) >= 50) {
      actions.unshift({
        action: 'Stay interview com liderança imediata',
        category: 'recognition',
        priority: 'immediate',
        estimatedCost: 0,
        expectedImpact: 12,
        implementationTime: '7 dias',
        responsibleDepartment: 'Gestão Direta'
      });
    }

    return actions.slice(0, 5);
  }

  private calculateReplacementCost(profile: CrewMemberProfile): number {
    const baseSalary = this.getBaseSalary(profile.position);
    const tenureMultiplier = Math.min(2, 1 + profile.totalTenure / 60);
    return Math.round(baseSalary * this.REPLACEMENT_COST_MULTIPLIER * tenureMultiplier);
  }

  private getBaseSalary(position: string): number {
    const normalizedPosition = position.toLowerCase().replace(/\s+/g, '_');
    return this.BASE_SALARY_BY_POSITION[normalizedPosition] || 
           this.BASE_SALARY_BY_POSITION['default'];
  }

  private calculateConfidence(profile: CrewMemberProfile): number {
    let confidence = 0.75;

    if (profile.performanceScores.length >= 6) confidence += 0.1;
    if (profile.totalTenure > 12) confidence += 0.05;
    if (profile.feedbackSentiment !== 0) confidence += 0.05;
    if (profile.engagementScore > 0) confidence += 0.05;

    return Math.min(0.95, confidence);
  }

  private generateTeamRecommendations(
    topFactors: string[],
    atRiskPredictions: TurnoverPrediction[]
  ): string[] {
    const recommendations: string[] = [];

    if (topFactors.includes('Salário abaixo do mercado')) {
      recommendations.push('Realizar pesquisa salarial e ajustar bandas de compensação');
    }
    if (topFactors.includes('Carga de trabalho excessiva')) {
      recommendations.push('Revisar distribuição de escalas e considerar contratações');
    }
    if (topFactors.includes('Estagnação de carreira')) {
      recommendations.push('Implementar programa de sucessão e trilhas de carreira');
    }
    if (topFactors.includes('Baixo engajamento')) {
      recommendations.push('Aplicar pesquisa de clima e criar grupos focais');
    }

    if (atRiskPredictions.length > 3) {
      recommendations.push('Priorizar stay interviews com tripulantes críticos');
    }

    return recommendations;
  }

  private calculateOperationalRisk(predictions: TurnoverPrediction[]): number {
    const criticalPositions = ['captain', 'chief_officer', 'chief_engineer'];
    const criticalAtRisk = predictions.filter(p => 
      criticalPositions.some(pos => p.position.toLowerCase().includes(pos))
    );

    if (criticalAtRisk.length >= 2) return 90;
    if (criticalAtRisk.length === 1) return 60;
    if (predictions.length >= 5) return 50;
    return 20;
  }

  private assessKnowledgeLoss(predictions: TurnoverPrediction[]): 'low' | 'medium' | 'high' {
    const highTenure = predictions.filter(p => p.estimatedReplacementCost > 100000);

    if (highTenure.length >= 3) return 'high';
    if (highTenure.length >= 1) return 'medium';
    return 'low';
  }

  private monthsBetween(date1: Date, date2: Date): number {
    const months = (date2.getFullYear() - date1.getFullYear()) * 12;
    return months + date2.getMonth() - date1.getMonth();
  }
}

export const turnoverPredictionEngine = new TurnoverPredictionEngine();
