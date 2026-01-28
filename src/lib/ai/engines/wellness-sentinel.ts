/**
 * Wellness Sentinel AI Engine
 * Análise de sentimentos em comunicações para detectar estresse/burnout
 */

export interface CommunicationAnalysis {
  message_id: string;
  crew_member_id: string;
  timestamp: string;
  sentiment_score: number; // -1 to 1
  emotion_labels: EmotionLabel[];
  stress_indicators: StressIndicator[];
  urgency_level: 'low' | 'medium' | 'high' | 'critical';
  keywords: string[];
}

export interface EmotionLabel {
  emotion: 'joy' | 'sadness' | 'anger' | 'fear' | 'surprise' | 'disgust' | 'neutral';
  confidence: number;
}

export interface StressIndicator {
  type: 'fatigue' | 'anxiety' | 'frustration' | 'isolation' | 'overwhelm' | 'conflict';
  severity: number; // 0-1
  evidence: string[];
}

export interface WellnessProfile {
  crew_member_id: string;
  crew_member_name: string;
  current_wellness_score: number; // 0-100
  trend: 'improving' | 'stable' | 'declining' | 'critical';
  trend_percentage: number;
  risk_factors: RiskFactor[];
  last_analysis: string;
  recommendations: WellnessRecommendation[];
  historical_scores: { date: string; score: number }[];
}

export interface RiskFactor {
  factor: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  detected_at: string;
}

export interface WellnessRecommendation {
  type: 'intervention' | 'monitoring' | 'support' | 'rest';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  action: string;
  rationale: string;
}

export interface TeamWellnessReport {
  vessel_id: string;
  vessel_name: string;
  report_date: string;
  overall_wellness_score: number;
  crew_at_risk: WellnessProfile[];
  team_dynamics: TeamDynamics;
  alerts: WellnessAlert[];
  trends: WellnessTrend[];
}

export interface TeamDynamics {
  cohesion_score: number;
  communication_health: number;
  conflict_indicators: number;
  morale_index: number;
}

export interface WellnessAlert {
  id: string;
  crew_member_id: string;
  crew_member_name: string;
  alert_type: 'burnout_risk' | 'stress_spike' | 'isolation' | 'conflict' | 'fatigue';
  severity: 'warning' | 'critical';
  message: string;
  created_at: string;
  recommended_action: string;
}

export interface WellnessTrend {
  metric: string;
  current_value: number;
  previous_value: number;
  change_percentage: number;
  direction: 'up' | 'down' | 'stable';
}

// Negative sentiment keywords (Portuguese & English)
const NEGATIVE_KEYWORDS = {
  stress: ['estresse', 'stress', 'estressado', 'stressed', 'pressão', 'pressure'],
  fatigue: ['cansado', 'tired', 'exausto', 'exhausted', 'fadiga', 'fatigue', 'esgotado'],
  anxiety: ['ansioso', 'anxious', 'preocupado', 'worried', 'nervoso', 'nervous'],
  frustration: ['frustrado', 'frustrated', 'irritado', 'annoyed', 'chateado'],
  isolation: ['sozinho', 'alone', 'isolado', 'isolated', 'solitário', 'lonely'],
  conflict: ['problema', 'problem', 'conflito', 'conflict', 'desentendimento', 'discussão']
};

const POSITIVE_KEYWORDS = [
  'bem', 'good', 'ótimo', 'great', 'excelente', 'excellent',
  'feliz', 'happy', 'motivado', 'motivated', 'animado', 'excited',
  'tranquilo', 'calm', 'satisfeito', 'satisfied', 'positivo', 'positive'
];

class WellnessSentinelEngine {
  /**
   * Analyze communication for sentiment and stress indicators
   */
  analyzeCommunication(
    messageId: string,
    crewMemberId: string,
    text: string,
    timestamp: string = new Date().toISOString()
  ): CommunicationAnalysis {
    const lowerText = text.toLowerCase();
    
    const sentimentScore = this.calculateSentimentScore(lowerText);
    const emotionLabels = this.detectEmotions(lowerText);
    const stressIndicators = this.detectStressIndicators(lowerText);
    const keywords = this.extractKeywords(lowerText);
    const urgencyLevel = this.determineUrgency(sentimentScore, stressIndicators);

    return {
      message_id: messageId,
      crew_member_id: crewMemberId,
      timestamp,
      sentiment_score: sentimentScore,
      emotion_labels: emotionLabels,
      stress_indicators: stressIndicators,
      urgency_level: urgencyLevel,
      keywords
    };
  }

  /**
   * Build wellness profile from communication history
   */
  buildWellnessProfile(
    crewMemberId: string,
    crewMemberName: string,
    analyses: CommunicationAnalysis[],
    previousScores: { date: string; score: number }[] = []
  ): WellnessProfile {
    const recentAnalyses = analyses
      .filter(a => a.crew_member_id === crewMemberId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 30); // Last 30 communications

    const currentScore = this.calculateWellnessScore(recentAnalyses);
    const previousScore = previousScores.length > 0 
      ? previousScores[previousScores.length - 1].score 
      : currentScore;
    
    const trend = this.determineTrend(currentScore, previousScore);
    const trendPercentage = previousScore > 0 
      ? ((currentScore - previousScore) / previousScore) * 100 
      : 0;

    const riskFactors = this.identifyRiskFactors(recentAnalyses);
    const recommendations = this.generateRecommendations(currentScore, riskFactors, trend);

    return {
      crew_member_id: crewMemberId,
      crew_member_name: crewMemberName,
      current_wellness_score: currentScore,
      trend,
      trend_percentage: Math.round(trendPercentage * 10) / 10,
      risk_factors: riskFactors,
      last_analysis: recentAnalyses[0]?.timestamp || new Date().toISOString(),
      recommendations,
      historical_scores: [
        ...previousScores,
        { date: new Date().toISOString().split('T')[0], score: currentScore }
      ].slice(-30)
    };
  }

  /**
   * Generate team wellness report
   */
  generateTeamReport(
    vesselId: string,
    vesselName: string,
    profiles: WellnessProfile[]
  ): TeamWellnessReport {
    const overallScore = profiles.length > 0
      ? profiles.reduce((sum, p) => sum + p.current_wellness_score, 0) / profiles.length
      : 100;

    const crewAtRisk = profiles
      .filter(p => p.current_wellness_score < 60 || p.trend === 'critical')
      .sort((a, b) => a.current_wellness_score - b.current_wellness_score);

    const teamDynamics = this.analyzeTeamDynamics(profiles);
    const alerts = this.generateAlerts(profiles);
    const trends = this.calculateTrends(profiles);

    return {
      vessel_id: vesselId,
      vessel_name: vesselName,
      report_date: new Date().toISOString(),
      overall_wellness_score: Math.round(overallScore),
      crew_at_risk: crewAtRisk,
      team_dynamics: teamDynamics,
      alerts,
      trends
    };
  }

  private calculateSentimentScore(text: string): number {
    let score = 0;
    let matches = 0;

    // Check negative keywords
    for (const [category, keywords] of Object.entries(NEGATIVE_KEYWORDS)) {
      for (const keyword of keywords) {
        if (text.includes(keyword)) {
          score -= 0.2;
          matches++;
        }
      }
    }

    // Check positive keywords
    for (const keyword of POSITIVE_KEYWORDS) {
      if (text.includes(keyword)) {
        score += 0.2;
        matches++;
      }
    }

    // Normalize and clamp
    if (matches > 0) {
      score = score / Math.sqrt(matches); // Diminishing returns
    }

    return Math.max(-1, Math.min(1, score));
  }

  private detectEmotions(text: string): EmotionLabel[] {
    const emotions: EmotionLabel[] = [];

    // Simplified emotion detection based on keywords
    const emotionPatterns: Record<EmotionLabel['emotion'], string[]> = {
      joy: ['feliz', 'happy', 'alegre', 'contente', 'ótimo', 'great'],
      sadness: ['triste', 'sad', 'desanimado', 'down', 'deprimido'],
      anger: ['irritado', 'angry', 'furioso', 'bravo', 'raiva'],
      fear: ['medo', 'fear', 'afraid', 'assustado', 'preocupado'],
      surprise: ['surpreso', 'surprised', 'chocado', 'shocked'],
      disgust: ['nojo', 'disgust', 'horrível', 'terrible'],
      neutral: []
    };

    let hasEmotion = false;
    for (const [emotion, patterns] of Object.entries(emotionPatterns)) {
      if (emotion === 'neutral') continue;
      
      const matches = patterns.filter(p => text.includes(p)).length;
      if (matches > 0) {
        hasEmotion = true;
        emotions.push({
          emotion: emotion as EmotionLabel['emotion'],
          confidence: Math.min(0.9, 0.5 + matches * 0.15)
        });
      }
    }

    if (!hasEmotion) {
      emotions.push({ emotion: 'neutral', confidence: 0.7 });
    }

    return emotions.sort((a, b) => b.confidence - a.confidence);
  }

  private detectStressIndicators(text: string): StressIndicator[] {
    const indicators: StressIndicator[] = [];

    for (const [type, keywords] of Object.entries(NEGATIVE_KEYWORDS)) {
      const matches = keywords.filter(k => text.includes(k));
      if (matches.length > 0) {
        indicators.push({
          type: type as StressIndicator['type'],
          severity: Math.min(1, matches.length * 0.3),
          evidence: matches
        });
      }
    }

    return indicators.sort((a, b) => b.severity - a.severity);
  }

  private extractKeywords(text: string): string[] {
    const allKeywords = [
      ...Object.values(NEGATIVE_KEYWORDS).flat(),
      ...POSITIVE_KEYWORDS
    ];
    
    return allKeywords.filter(k => text.includes(k));
  }

  private determineUrgency(
    sentiment: number,
    indicators: StressIndicator[]
  ): CommunicationAnalysis['urgency_level'] {
    const maxSeverity = indicators.length > 0
      ? Math.max(...indicators.map(i => i.severity))
      : 0;

    if (sentiment < -0.7 || maxSeverity > 0.8) return 'critical';
    if (sentiment < -0.4 || maxSeverity > 0.5) return 'high';
    if (sentiment < -0.2 || maxSeverity > 0.3) return 'medium';
    return 'low';
  }

  private calculateWellnessScore(analyses: CommunicationAnalysis[]): number {
    if (analyses.length === 0) return 75; // Default score

    // Weight recent communications more heavily
    let weightedSum = 0;
    let totalWeight = 0;

    analyses.forEach((analysis, index) => {
      const weight = 1 / (index + 1); // More recent = higher weight
      const normalizedSentiment = (analysis.sentiment_score + 1) / 2; // 0-1
      
      // Factor in stress indicators
      const stressPenalty = analysis.stress_indicators.reduce(
        (sum, ind) => sum + ind.severity * 0.1, 0
      );
      
      const score = Math.max(0, normalizedSentiment - stressPenalty);
      weightedSum += score * weight;
      totalWeight += weight;
    });

    const avgScore = totalWeight > 0 ? weightedSum / totalWeight : 0.75;
    return Math.round(avgScore * 100);
  }

  private determineTrend(
    current: number,
    previous: number
  ): WellnessProfile['trend'] {
    const diff = current - previous;
    
    if (current < 40) return 'critical';
    if (diff > 10) return 'improving';
    if (diff < -10) return 'declining';
    return 'stable';
  }

  private identifyRiskFactors(analyses: CommunicationAnalysis[]): RiskFactor[] {
    const factors: RiskFactor[] = [];
    const indicatorCounts: Record<string, number> = {};

    analyses.forEach(a => {
      a.stress_indicators.forEach(ind => {
        indicatorCounts[ind.type] = (indicatorCounts[ind.type] || 0) + 1;
      });
    });

    for (const [type, count] of Object.entries(indicatorCounts)) {
      if (count >= 3) {
        const severity = count >= 10 ? 'critical' : count >= 6 ? 'high' : count >= 3 ? 'medium' : 'low';
        factors.push({
          factor: type,
          severity,
          description: this.getRiskDescription(type, count),
          detected_at: new Date().toISOString()
        });
      }
    }

    return factors.sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  }

  private getRiskDescription(type: string, count: number): string {
    const descriptions: Record<string, string> = {
      fatigue: `Sinais de fadiga detectados em ${count} comunicações`,
      anxiety: `Indicadores de ansiedade em ${count} mensagens`,
      frustration: `Frustração recorrente (${count} ocorrências)`,
      isolation: `Possível isolamento social (${count} menções)`,
      stress: `Níveis elevados de estresse (${count} indicadores)`,
      conflict: `Sinais de conflito interpessoal (${count} ocorrências)`
    };
    return descriptions[type] || `${type}: ${count} ocorrências`;
  }

  private generateRecommendations(
    score: number,
    riskFactors: RiskFactor[],
    trend: WellnessProfile['trend']
  ): WellnessRecommendation[] {
    const recommendations: WellnessRecommendation[] = [];

    if (score < 40 || trend === 'critical') {
      recommendations.push({
        type: 'intervention',
        priority: 'urgent',
        action: 'Agendar conversa imediata com supervisor ou psicólogo',
        rationale: 'Indicadores críticos de bem-estar detectados'
      });
    }

    if (score < 60) {
      recommendations.push({
        type: 'support',
        priority: 'high',
        action: 'Oferecer suporte adicional e verificar carga de trabalho',
        rationale: 'Score de bem-estar abaixo do ideal'
      });
    }

    riskFactors.forEach(factor => {
      if (factor.severity === 'critical' || factor.severity === 'high') {
        recommendations.push({
          type: factor.factor === 'fatigue' ? 'rest' : 'monitoring',
          priority: factor.severity === 'critical' ? 'urgent' : 'high',
          action: this.getActionForRisk(factor.factor),
          rationale: factor.description
        });
      }
    });

    if (trend === 'declining') {
      recommendations.push({
        type: 'monitoring',
        priority: 'medium',
        action: 'Aumentar frequência de check-ins',
        rationale: 'Tendência de declínio no bem-estar'
      });
    }

    return recommendations;
  }

  private getActionForRisk(factor: string): string {
    const actions: Record<string, string> = {
      fatigue: 'Revisar escala de descanso e considerar folga adicional',
      anxiety: 'Oferecer sessão com profissional de saúde mental',
      frustration: 'Identificar causas e mediar conflitos se necessário',
      isolation: 'Promover atividades de integração com a equipe',
      stress: 'Avaliar redistribuição de tarefas',
      conflict: 'Mediar situação e promover diálogo'
    };
    return actions[factor] || 'Monitorar situação';
  }

  private analyzeTeamDynamics(profiles: WellnessProfile[]): TeamDynamics {
    const avgScore = profiles.length > 0
      ? profiles.reduce((sum, p) => sum + p.current_wellness_score, 0) / profiles.length
      : 100;

    const declining = profiles.filter(p => p.trend === 'declining' || p.trend === 'critical').length;
    const conflictRisks = profiles.filter(p => 
      p.risk_factors.some(r => r.factor === 'conflict')
    ).length;

    return {
      cohesion_score: Math.max(0, 100 - declining * 10),
      communication_health: Math.round(avgScore),
      conflict_indicators: conflictRisks,
      morale_index: Math.round(avgScore * 0.9 + (100 - declining * 5) * 0.1)
    };
  }

  private generateAlerts(profiles: WellnessProfile[]): WellnessAlert[] {
    const alerts: WellnessAlert[] = [];

    profiles.forEach(profile => {
      if (profile.trend === 'critical' || profile.current_wellness_score < 40) {
        alerts.push({
          id: `alert_${profile.crew_member_id}_${Date.now()}`,
          crew_member_id: profile.crew_member_id,
          crew_member_name: profile.crew_member_name,
          alert_type: 'burnout_risk',
          severity: 'critical',
          message: `${profile.crew_member_name} apresenta sinais críticos de burnout`,
          created_at: new Date().toISOString(),
          recommended_action: 'Intervenção imediata necessária'
        });
      } else if (profile.trend === 'declining') {
        alerts.push({
          id: `alert_${profile.crew_member_id}_${Date.now()}`,
          crew_member_id: profile.crew_member_id,
          crew_member_name: profile.crew_member_name,
          alert_type: 'stress_spike',
          severity: 'warning',
          message: `${profile.crew_member_name} mostra tendência de declínio no bem-estar`,
          created_at: new Date().toISOString(),
          recommended_action: 'Monitoramento aumentado recomendado'
        });
      }

      profile.risk_factors
        .filter(r => r.severity === 'critical')
        .forEach(risk => {
          alerts.push({
            id: `alert_${profile.crew_member_id}_${risk.factor}_${Date.now()}`,
            crew_member_id: profile.crew_member_id,
            crew_member_name: profile.crew_member_name,
            alert_type: risk.factor as WellnessAlert['alert_type'],
            severity: 'critical',
            message: risk.description,
            created_at: new Date().toISOString(),
            recommended_action: this.getActionForRisk(risk.factor)
          });
        });
    });

    return alerts.sort((a, b) => {
      const severityOrder = { critical: 0, warning: 1 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  }

  private calculateTrends(profiles: WellnessProfile[]): WellnessTrend[] {
    const current = profiles.reduce((sum, p) => sum + p.current_wellness_score, 0) / (profiles.length || 1);
    
    const previousScores = profiles.flatMap(p => p.historical_scores.slice(-7));
    const previous = previousScores.length > 0
      ? previousScores.reduce((sum, s) => sum + s.score, 0) / previousScores.length
      : current;

    const change = previous > 0 ? ((current - previous) / previous) * 100 : 0;

    return [
      {
        metric: 'Wellness Score Médio',
        current_value: Math.round(current),
        previous_value: Math.round(previous),
        change_percentage: Math.round(change * 10) / 10,
        direction: change > 2 ? 'up' : change < -2 ? 'down' : 'stable'
      },
      {
        metric: 'Tripulantes em Risco',
        current_value: profiles.filter(p => p.current_wellness_score < 60).length,
        previous_value: 0,
        change_percentage: 0,
        direction: 'stable'
      }
    ];
  }
}

export const wellnessSentinelEngine = new WellnessSentinelEngine();
