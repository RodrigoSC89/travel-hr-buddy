/**
 * useTurnoverPrediction Hook
 * Interface for crew turnover prediction
 */

import { useState, useCallback } from 'react';
import { toast } from 'sonner';

// Import types directly from the engine
import type { 
  CrewMemberProfile, 
  TurnoverPrediction, 
  TeamTurnoverAnalysis 
} from '@/lib/ai/engines/turnover-prediction';

// Re-export types for consumers
export type { CrewMemberProfile, TurnoverPrediction, TeamTurnoverAnalysis };

// Create engine instance inline since it's a class
class TurnoverPredictionEngineInstance {
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

  predictBatch(profiles: CrewMemberProfile[]): TurnoverPrediction[] {
    return profiles.map(p => this.predictTurnover(p));
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

  private analyzeRiskFactors(profile: CrewMemberProfile) {
    const factors: TurnoverPrediction['topRiskFactors'] = [];

    if (profile.salaryBand === 'below_market') {
      factors.push({
        factor: 'Salário abaixo do mercado',
        impact: 35,
        category: 'compensation',
        description: 'Remuneração 15-25% abaixo da média do mercado',
        trend: 'stable'
      });
    }

    if (profile.overtimeHours > 60) {
      factors.push({
        factor: 'Carga de trabalho excessiva',
        impact: 30,
        category: 'workload',
        description: `Média de ${profile.overtimeHours}h extras/mês`,
        trend: profile.overtimeHours > 80 ? 'worsening' : 'stable'
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
        description: 'Análise de NLP indica insatisfação',
        trend: 'worsening'
      });
    }

    const monthsToEnd = this.monthsBetween(new Date(), profile.contractEndDate);
    if (monthsToEnd <= 3) {
      factors.push({
        factor: 'Contrato próximo do vencimento',
        impact: 45,
        category: 'compliance',
        description: `Expira em ${monthsToEnd} meses`,
        trend: 'worsening'
      });
    }

    return factors.sort((a, b) => b.impact - a.impact);
  }

  private calculateTurnoverRisk(factors: TurnoverPrediction['topRiskFactors']): number {
    if (factors.length === 0) return 10;
    let totalRisk = 0;
    let weight = 1;
    for (const factor of factors) {
      totalRisk += factor.impact * weight;
      weight *= 0.75;
    }
    return Math.min(100, Math.round(totalRisk));
  }

  private categorizeRisk(score: number): TurnoverPrediction['riskLevel'] {
    if (score >= 75) return 'critical';
    if (score >= 50) return 'high';
    if (score >= 30) return 'moderate';
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
    factors: TurnoverPrediction['topRiskFactors'],
    profile: CrewMemberProfile
  ): TurnoverPrediction['retentionRecommendations'] {
    const actions: TurnoverPrediction['retentionRecommendations'] = [];

    for (const factor of factors.slice(0, 3)) {
      if (factor.category === 'compensation') {
        actions.push({
          action: 'Revisão salarial com ajuste de mercado',
          category: 'compensation',
          priority: 'immediate',
          estimatedCost: this.getBaseSalary(profile.position) * 0.15,
          expectedImpact: 25,
          implementationTime: '30 dias',
          responsibleDepartment: 'RH/Compensação'
        });
      } else if (factor.category === 'workload') {
        actions.push({
          action: 'Reestruturação de escala',
          category: 'worklife',
          priority: 'immediate',
          estimatedCost: 2000,
          expectedImpact: 20,
          implementationTime: '14 dias',
          responsibleDepartment: 'Operações'
        });
      } else if (factor.category === 'engagement') {
        actions.push({
          action: 'Programa de mentoria e reconhecimento',
          category: 'recognition',
          priority: 'short_term',
          estimatedCost: 1500,
          expectedImpact: 15,
          implementationTime: '30 dias',
          responsibleDepartment: 'RH'
        });
      }
    }

    return actions.slice(0, 5);
  }

  private calculateReplacementCost(profile: CrewMemberProfile): number {
    const baseSalary = this.getBaseSalary(profile.position);
    const tenureMultiplier = Math.min(2, 1 + profile.totalTenure / 60);
    return Math.round(baseSalary * this.REPLACEMENT_COST_MULTIPLIER * tenureMultiplier);
  }

  private getBaseSalary(position: string): number {
    const normalized = position.toLowerCase().replace(/\s+/g, '_');
    return this.BASE_SALARY_BY_POSITION[normalized] || this.BASE_SALARY_BY_POSITION['default'];
  }

  private calculateConfidence(profile: CrewMemberProfile): number {
    let confidence = 0.75;
    if (profile.performanceScores.length >= 6) confidence += 0.1;
    if (profile.totalTenure > 12) confidence += 0.05;
    return Math.min(0.95, confidence);
  }

  private generateTeamRecommendations(
    topFactors: string[],
    atRiskPredictions: TurnoverPrediction[]
  ): string[] {
    const recs: string[] = [];
    if (topFactors.includes('Salário abaixo do mercado')) {
      recs.push('Realizar pesquisa salarial e ajustar bandas');
    }
    if (topFactors.includes('Carga de trabalho excessiva')) {
      recs.push('Revisar distribuição de escalas');
    }
    if (atRiskPredictions.length > 3) {
      recs.push('Priorizar stay interviews');
    }
    return recs;
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
    return (date2.getFullYear() - date1.getFullYear()) * 12 + date2.getMonth() - date1.getMonth();
  }
}

const turnoverEngine = new TurnoverPredictionEngineInstance();

export function useTurnoverPrediction() {
  const [isLoading, setIsLoading] = useState(false);
  const [predictions, setPredictions] = useState<TurnoverPrediction[]>([]);
  const [analytics, setAnalytics] = useState<TeamTurnoverAnalysis | null>(null);

  const analyzeCrew = useCallback((crewMembers: CrewMemberProfile[]) => {
    setIsLoading(true);
    try {
      const results = turnoverEngine.predictBatch(crewMembers);
      setPredictions(results);
      
      const highRisk = results.filter(r => r.riskLevel === 'critical' || r.riskLevel === 'high');
      if (highRisk.length > 0) {
        toast.warning(`${highRisk.length} tripulante(s) em risco de saída`);
      }
      
      const analyticsResult = turnoverEngine.analyzeTeam(crewMembers);
      setAnalytics(analyticsResult);
      
      return results;
    } catch (error) {
      console.error('[useTurnoverPrediction] Error:', error);
      toast.error('Erro na análise de turnover');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getHighRiskCrew = useCallback(() => {
    return predictions.filter(p => p.riskLevel === 'critical' || p.riskLevel === 'high');
  }, [predictions]);

  const getRetentionActions = useCallback(() => {
    return predictions.flatMap(p => p.retentionRecommendations);
  }, [predictions]);

  return {
    isLoading,
    predictions,
    analytics,
    analyzeCrew,
    getHighRiskCrew,
    getRetentionActions
  };
}
