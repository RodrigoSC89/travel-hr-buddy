/**
 * Wellbeing NLP Analysis Engine
 * Análise de sentimento em feedbacks e comunicações para detectar burnout
 * Nível: Assistivo
 */

export interface CommunicationEntry {
  id: string;
  crewMemberId: string;
  type: 'feedback' | 'email' | 'chat' | 'survey' | 'incident_report' | 'voice_transcript';
  content: string;
  timestamp: Date;
  context: string | null;
}

export interface WellbeingAnalysis {
  crewMemberId: string;
  crewMemberName: string;
  overallScore: number; // 0-100 (100 = excellent wellbeing)
  burnoutRisk: 'low' | 'moderate' | 'high' | 'critical';
  sentimentTrend: 'improving' | 'stable' | 'declining';
  stressIndicators: StressIndicator[];
  emotionalState: EmotionalState;
  recommendations: WellbeingRecommendation[];
  alertsGenerated: WellbeingAlert[];
  lastAnalysis: Date;
  nextCheckRecommended: Date;
}

export interface StressIndicator {
  indicator: string;
  severity: 'low' | 'medium' | 'high';
  frequency: number; // occurrences in analysis period
  examples: string[];
  trend: 'improving' | 'stable' | 'worsening';
}

export interface EmotionalState {
  dominant: 'positive' | 'neutral' | 'negative' | 'mixed';
  emotions: Array<{
    emotion: string;
    score: number; // 0-1
    confidence: number;
  }>;
  volatility: 'stable' | 'moderate' | 'high';
}

export interface WellbeingRecommendation {
  type: 'immediate' | 'short_term' | 'preventive';
  action: string;
  rationale: string;
  responsible: string;
  priority: 'low' | 'medium' | 'high';
}

export interface WellbeingAlert {
  id: string;
  type: 'burnout_risk' | 'stress_spike' | 'isolation' | 'fatigue' | 'conflict';
  severity: 'warning' | 'concern' | 'critical';
  message: string;
  suggestedIntervention: string;
  createdAt: Date;
}

export interface TeamWellbeingReport {
  period: { start: Date; end: Date };
  vesselId: string;
  vesselName: string;
  crewCount: number;
  averageWellbeingScore: number;
  atRiskCount: number;
  criticalCount: number;
  topConcerns: string[];
  departmentAnalysis: Array<{
    department: string;
    avgScore: number;
    riskLevel: string;
    primaryConcern: string;
  }>;
  trends: {
    weeklyChange: number;
    monthlyChange: number;
    seasonalPattern: string | null;
  };
  recommendations: string[];
}

class WellbeingNLPEngine {
  private readonly NEGATIVE_KEYWORDS = new Set([
    'exausto', 'cansado', 'estressado', 'frustrado', 'sobrecarregado',
    'esgotado', 'desmotivado', 'insatisfeito', 'preocupado', 'ansioso',
    'irritado', 'desanimado', 'exaurido', 'pressionado', 'sufocado',
    'exhausted', 'tired', 'stressed', 'frustrated', 'overwhelmed',
    'burned out', 'demotivated', 'unsatisfied', 'worried', 'anxious'
  ]);

  private readonly POSITIVE_KEYWORDS = new Set([
    'satisfeito', 'motivado', 'feliz', 'realizado', 'confiante',
    'energizado', 'otimista', 'engajado', 'valorizado', 'apoiado',
    'satisfied', 'motivated', 'happy', 'fulfilled', 'confident',
    'energized', 'optimistic', 'engaged', 'valued', 'supported'
  ]);

  private readonly BURNOUT_PHRASES = [
    'não aguento mais',
    'preciso de uma pausa',
    'quero sair',
    'não consigo dormir',
    'muito cansado',
    'sem energia',
    'demais para mim',
    'cannot take it anymore',
    'need a break',
    'want to quit',
    'cannot sleep',
    'too tired',
    'no energy',
    'too much for me'
  ];

  private readonly ISOLATION_PHRASES = [
    'sozinho',
    'ninguém me entende',
    'isolado',
    'saudade de casa',
    'longe da família',
    'alone',
    'no one understands',
    'isolated',
    'miss home',
    'far from family'
  ];

  async analyzeCrewWellbeing(
    crewMemberId: string,
    crewMemberName: string,
    communications: CommunicationEntry[]
  ): Promise<WellbeingAnalysis> {
    const recentComms = this.filterRecentCommunications(communications, 30);
    
    // Analyze sentiment across all communications
    const sentimentResults = recentComms.map(c => this.analyzeSentiment(c.content));
    const avgSentiment = this.calculateAverageSentiment(sentimentResults);
    
    // Detect stress indicators
    const stressIndicators = this.detectStressIndicators(recentComms);
    
    // Analyze emotional state
    const emotionalState = this.analyzeEmotionalState(sentimentResults);
    
    // Calculate burnout risk
    const burnoutRisk = this.calculateBurnoutRisk(stressIndicators, avgSentiment, emotionalState);
    
    // Determine sentiment trend
    const sentimentTrend = this.calculateSentimentTrend(communications);
    
    // Calculate overall wellbeing score
    const overallScore = this.calculateWellbeingScore(avgSentiment, burnoutRisk, stressIndicators);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(burnoutRisk, stressIndicators, emotionalState);
    
    // Generate alerts if needed
    const alerts = this.generateAlerts(burnoutRisk, stressIndicators, crewMemberName);

    return {
      crewMemberId,
      crewMemberName,
      overallScore,
      burnoutRisk,
      sentimentTrend,
      stressIndicators,
      emotionalState,
      recommendations,
      alertsGenerated: alerts,
      lastAnalysis: new Date(),
      nextCheckRecommended: this.calculateNextCheck(burnoutRisk)
    };
  }

  private filterRecentCommunications(
    communications: CommunicationEntry[],
    days: number
  ): CommunicationEntry[] {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return communications
      .filter(c => new Date(c.timestamp) >= cutoff)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  private analyzeSentiment(text: string): {
    score: number; // -1 to 1
    magnitude: number; // 0 to 1
    keywords: string[];
  } {
    const lowerText = text.toLowerCase();
    const words = lowerText.split(/\s+/);
    
    let positiveCount = 0;
    let negativeCount = 0;
    const foundKeywords: string[] = [];

    for (const word of words) {
      if (this.POSITIVE_KEYWORDS.has(word)) {
        positiveCount++;
        foundKeywords.push(word);
      }
      if (this.NEGATIVE_KEYWORDS.has(word)) {
        negativeCount++;
        foundKeywords.push(word);
      }
    }

    // Check for phrases
    for (const phrase of this.BURNOUT_PHRASES) {
      if (lowerText.includes(phrase)) {
        negativeCount += 3; // Phrases have more weight
        foundKeywords.push(phrase);
      }
    }

    for (const phrase of this.ISOLATION_PHRASES) {
      if (lowerText.includes(phrase)) {
        negativeCount += 2;
        foundKeywords.push(phrase);
      }
    }

    const total = positiveCount + negativeCount;
    const score = total > 0 
      ? (positiveCount - negativeCount) / total 
      : 0;
    
    const magnitude = Math.min(1, total / 10);

    return { score, magnitude, keywords: foundKeywords };
  }

  private calculateAverageSentiment(
    results: Array<{ score: number; magnitude: number; keywords: string[] }>
  ): number {
    if (results.length === 0) return 0;

    // Weight by magnitude (stronger sentiments count more)
    const weightedSum = results.reduce((sum, r) => sum + r.score * (0.5 + r.magnitude * 0.5), 0);
    const weightTotal = results.reduce((sum, r) => sum + (0.5 + r.magnitude * 0.5), 0);

    return weightTotal > 0 ? weightedSum / weightTotal : 0;
  }

  private detectStressIndicators(communications: CommunicationEntry[]): StressIndicator[] {
    const indicators: StressIndicator[] = [];
    const indicatorCounts = new Map<string, { count: number; examples: string[] }>();

    for (const comm of communications) {
      const lowerContent = comm.content.toLowerCase();

      // Check for workload indicators
      if (this.containsWorkloadStress(lowerContent)) {
        this.incrementIndicator(indicatorCounts, 'Sobrecarga de trabalho', comm.content);
      }

      // Check for rest/sleep issues
      if (this.containsSleepIssues(lowerContent)) {
        this.incrementIndicator(indicatorCounts, 'Problemas de descanso/sono', comm.content);
      }

      // Check for interpersonal issues
      if (this.containsInterpersonalIssues(lowerContent)) {
        this.incrementIndicator(indicatorCounts, 'Conflitos interpessoais', comm.content);
      }

      // Check for isolation/homesickness
      if (this.containsIsolation(lowerContent)) {
        this.incrementIndicator(indicatorCounts, 'Isolamento/saudade', comm.content);
      }

      // Check for uncertainty/anxiety
      if (this.containsAnxiety(lowerContent)) {
        this.incrementIndicator(indicatorCounts, 'Ansiedade/incerteza', comm.content);
      }
    }

    for (const [indicator, data] of indicatorCounts) {
      indicators.push({
        indicator,
        severity: this.calculateSeverity(data.count, communications.length),
        frequency: data.count,
        examples: data.examples.slice(0, 3),
        trend: 'stable' // Would need historical data for trend
      });
    }

    return indicators.sort((a, b) => b.frequency - a.frequency);
  }

  private incrementIndicator(
    map: Map<string, { count: number; examples: string[] }>,
    indicator: string,
    example: string
  ): void {
    const existing = map.get(indicator) || { count: 0, examples: [] };
    existing.count++;
    if (existing.examples.length < 5) {
      existing.examples.push(example.substring(0, 100));
    }
    map.set(indicator, existing);
  }

  private containsWorkloadStress(text: string): boolean {
    const patterns = [
      'muito trabalho', 'sobrecarregado', 'demais', 'não dá tempo',
      'horas extras', 'sem folga', 'too much work', 'overloaded',
      'no time', 'overtime', 'no break'
    ];
    return patterns.some(p => text.includes(p));
  }

  private containsSleepIssues(text: string): boolean {
    const patterns = [
      'não durmo', 'insônia', 'cansado', 'exausto', 'sem dormir',
      'cannot sleep', 'insomnia', 'tired', 'exhausted', 'no sleep'
    ];
    return patterns.some(p => text.includes(p));
  }

  private containsInterpersonalIssues(text: string): boolean {
    const patterns = [
      'conflito', 'briga', 'discussão', 'problema com', 'não gosto de',
      'difícil trabalhar', 'conflict', 'fight', 'argument', 'problem with',
      'difficult to work'
    ];
    return patterns.some(p => text.includes(p));
  }

  private containsIsolation(text: string): boolean {
    const patterns = [
      'sozinho', 'isolado', 'saudade', 'longe', 'família',
      'alone', 'isolated', 'miss', 'far from', 'family'
    ];
    return patterns.some(p => text.includes(p));
  }

  private containsAnxiety(text: string): boolean {
    const patterns = [
      'preocupado', 'ansioso', 'medo', 'nervoso', 'incerto',
      'worried', 'anxious', 'afraid', 'nervous', 'uncertain'
    ];
    return patterns.some(p => text.includes(p));
  }

  private calculateSeverity(count: number, total: number): 'low' | 'medium' | 'high' {
    const ratio = count / Math.max(1, total);
    if (ratio > 0.3) return 'high';
    if (ratio > 0.15) return 'medium';
    return 'low';
  }

  private analyzeEmotionalState(
    sentimentResults: Array<{ score: number; magnitude: number; keywords: string[] }>
  ): EmotionalState {
    const emotions: Array<{ emotion: string; score: number; confidence: number }> = [];

    // Aggregate emotions from keywords
    const emotionCounts = new Map<string, number>();
    
    for (const result of sentimentResults) {
      for (const keyword of result.keywords) {
        emotionCounts.set(keyword, (emotionCounts.get(keyword) || 0) + 1);
      }
    }

    // Map keywords to emotions
    const emotionMapping: Record<string, string> = {
      'exausto': 'exhaustion', 'cansado': 'fatigue', 'estressado': 'stress',
      'frustrado': 'frustration', 'ansioso': 'anxiety', 'satisfeito': 'satisfaction',
      'motivado': 'motivation', 'feliz': 'happiness'
    };

    for (const [keyword, count] of emotionCounts) {
      const emotion = emotionMapping[keyword] || keyword;
      emotions.push({
        emotion,
        score: Math.min(1, count / sentimentResults.length),
        confidence: 0.7 + Math.random() * 0.2
      });
    }

    // Determine dominant state
    const avgScore = this.calculateAverageSentiment(sentimentResults);
    let dominant: EmotionalState['dominant'];
    
    if (avgScore > 0.3) dominant = 'positive';
    else if (avgScore < -0.3) dominant = 'negative';
    else if (Math.abs(avgScore) < 0.1) dominant = 'neutral';
    else dominant = 'mixed';

    // Calculate volatility
    const scores = sentimentResults.map(r => r.score);
    const variance = this.calculateVariance(scores);
    const volatility = variance > 0.3 ? 'high' : variance > 0.15 ? 'moderate' : 'stable';

    return {
      dominant,
      emotions: emotions.slice(0, 5).sort((a, b) => b.score - a.score),
      volatility
    };
  }

  private calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    return values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  }

  private calculateBurnoutRisk(
    indicators: StressIndicator[],
    avgSentiment: number,
    emotionalState: EmotionalState
  ): WellbeingAnalysis['burnoutRisk'] {
    let riskScore = 0;

    // Factor 1: Number and severity of stress indicators
    for (const indicator of indicators) {
      riskScore += indicator.severity === 'high' ? 15 :
                   indicator.severity === 'medium' ? 8 : 3;
    }

    // Factor 2: Negative sentiment
    if (avgSentiment < -0.5) riskScore += 25;
    else if (avgSentiment < -0.25) riskScore += 15;
    else if (avgSentiment < 0) riskScore += 5;

    // Factor 3: Emotional volatility
    if (emotionalState.volatility === 'high') riskScore += 15;
    else if (emotionalState.volatility === 'moderate') riskScore += 5;

    // Factor 4: Dominant negative emotions
    if (emotionalState.dominant === 'negative') riskScore += 20;

    // Categorize risk
    if (riskScore >= 60) return 'critical';
    if (riskScore >= 40) return 'high';
    if (riskScore >= 20) return 'moderate';
    return 'low';
  }

  private calculateSentimentTrend(
    communications: CommunicationEntry[]
  ): WellbeingAnalysis['sentimentTrend'] {
    if (communications.length < 4) return 'stable';

    // Split into halves
    const sorted = [...communications].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    const midpoint = Math.floor(sorted.length / 2);
    
    const olderHalf = sorted.slice(0, midpoint);
    const newerHalf = sorted.slice(midpoint);

    const olderSentiment = this.calculateAverageSentiment(
      olderHalf.map(c => this.analyzeSentiment(c.content))
    );
    const newerSentiment = this.calculateAverageSentiment(
      newerHalf.map(c => this.analyzeSentiment(c.content))
    );

    const change = newerSentiment - olderSentiment;
    
    if (change > 0.15) return 'improving';
    if (change < -0.15) return 'declining';
    return 'stable';
  }

  private calculateWellbeingScore(
    avgSentiment: number,
    burnoutRisk: WellbeingAnalysis['burnoutRisk'],
    indicators: StressIndicator[]
  ): number {
    // Start with sentiment-based score (0-100 scale)
    let score = Math.round((avgSentiment + 1) * 50); // Convert -1..1 to 0..100

    // Deduct for burnout risk
    const riskDeduction = {
      'critical': 35,
      'high': 25,
      'moderate': 15,
      'low': 0
    };
    score -= riskDeduction[burnoutRisk];

    // Deduct for stress indicators
    const indicatorDeduction = indicators.reduce((sum, i) => {
      return sum + (i.severity === 'high' ? 8 : i.severity === 'medium' ? 4 : 1);
    }, 0);
    score -= Math.min(20, indicatorDeduction);

    return Math.max(0, Math.min(100, score));
  }

  private generateRecommendations(
    burnoutRisk: WellbeingAnalysis['burnoutRisk'],
    indicators: StressIndicator[],
    emotionalState: EmotionalState
  ): WellbeingRecommendation[] {
    const recommendations: WellbeingRecommendation[] = [];

    // Critical burnout risk
    if (burnoutRisk === 'critical') {
      recommendations.push({
        type: 'immediate',
        action: 'Conversa imediata com liderança e suporte psicológico',
        rationale: 'Risco crítico de burnout detectado - intervenção urgente necessária',
        responsible: 'Master/HR',
        priority: 'high'
      });
    }

    // High burnout risk
    if (burnoutRisk === 'high' || burnoutRisk === 'critical') {
      recommendations.push({
        type: 'immediate',
        action: 'Reavaliar carga de trabalho e escala de descanso',
        rationale: 'Indicadores de esgotamento significativos',
        responsible: 'Chief Officer',
        priority: 'high'
      });
    }

    // Address specific indicators
    for (const indicator of indicators.filter(i => i.severity !== 'low').slice(0, 2)) {
      if (indicator.indicator.includes('trabalho') || indicator.indicator.includes('workload')) {
        recommendations.push({
          type: 'short_term',
          action: 'Redistribuir tarefas e revisar prioridades',
          rationale: indicator.indicator,
          responsible: 'Department Head',
          priority: 'medium'
        });
      }

      if (indicator.indicator.includes('sono') || indicator.indicator.includes('sleep')) {
        recommendations.push({
          type: 'immediate',
          action: 'Verificar conformidade com horas de descanso MLC',
          rationale: indicator.indicator,
          responsible: 'Safety Officer',
          priority: 'high'
        });
      }

      if (indicator.indicator.includes('Isolamento') || indicator.indicator.includes('isolation')) {
        recommendations.push({
          type: 'short_term',
          action: 'Facilitar comunicação com família e atividades sociais',
          rationale: indicator.indicator,
          responsible: 'Welfare Officer',
          priority: 'medium'
        });
      }
    }

    // Preventive recommendations for moderate risk
    if (burnoutRisk === 'moderate') {
      recommendations.push({
        type: 'preventive',
        action: 'Check-in regular de wellbeing (semanal)',
        rationale: 'Monitoramento proativo para prevenir escalada',
        responsible: 'Direct Supervisor',
        priority: 'medium'
      });
    }

    return recommendations.slice(0, 5);
  }

  private generateAlerts(
    burnoutRisk: WellbeingAnalysis['burnoutRisk'],
    indicators: StressIndicator[],
    crewName: string
  ): WellbeingAlert[] {
    const alerts: WellbeingAlert[] = [];

    if (burnoutRisk === 'critical') {
      alerts.push({
        id: crypto.randomUUID(),
        type: 'burnout_risk',
        severity: 'critical',
        message: `⚠️ ALERTA CRÍTICO: ${crewName} apresenta alto risco de burnout`,
        suggestedIntervention: 'Intervenção imediata - conversa privada e avaliação de necessidade de afastamento',
        createdAt: new Date()
      });
    }

    if (burnoutRisk === 'high') {
      alerts.push({
        id: crypto.randomUUID(),
        type: 'burnout_risk',
        severity: 'concern',
        message: `⚠️ ${crewName} apresenta sinais de esgotamento significativos`,
        suggestedIntervention: 'Agendar conversa de suporte em 48h',
        createdAt: new Date()
      });
    }

    // Check for isolation
    if (indicators.some(i => i.indicator.includes('Isolamento') && i.severity === 'high')) {
      alerts.push({
        id: crypto.randomUUID(),
        type: 'isolation',
        severity: 'concern',
        message: `${crewName} apresenta sinais de isolamento social`,
        suggestedIntervention: 'Promover integração e facilitar contato com família',
        createdAt: new Date()
      });
    }

    return alerts;
  }

  private calculateNextCheck(burnoutRisk: WellbeingAnalysis['burnoutRisk']): Date {
    const intervals = {
      'critical': 3,  // 3 days
      'high': 7,      // 1 week
      'moderate': 14, // 2 weeks
      'low': 30       // 1 month
    };
    
    const days = intervals[burnoutRisk];
    return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  }

  generateTeamReport(
    vesselId: string,
    vesselName: string,
    analyses: WellbeingAnalysis[],
    period: { start: Date; end: Date }
  ): TeamWellbeingReport {
    const avgScore = analyses.reduce((sum, a) => sum + a.overallScore, 0) / analyses.length;
    const atRisk = analyses.filter(a => a.burnoutRisk === 'high' || a.burnoutRisk === 'moderate');
    const critical = analyses.filter(a => a.burnoutRisk === 'critical');

    // Identify top concerns across all analyses
    const concernCounts = new Map<string, number>();
    for (const analysis of analyses) {
      for (const indicator of analysis.stressIndicators) {
        concernCounts.set(
          indicator.indicator,
          (concernCounts.get(indicator.indicator) || 0) + indicator.frequency
        );
      }
    }
    const topConcerns = [...concernCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([concern]) => concern);

    return {
      period,
      vesselId,
      vesselName,
      crewCount: analyses.length,
      averageWellbeingScore: Math.round(avgScore),
      atRiskCount: atRisk.length,
      criticalCount: critical.length,
      topConcerns,
      departmentAnalysis: [], // Would need department data
      trends: {
        weeklyChange: 0, // Would need historical data
        monthlyChange: 0,
        seasonalPattern: null
      },
      recommendations: this.generateTeamRecommendations(analyses, topConcerns)
    };
  }

  private generateTeamRecommendations(
    analyses: WellbeingAnalysis[],
    topConcerns: string[]
  ): string[] {
    const recommendations: string[] = [];

    const criticalCount = analyses.filter(a => a.burnoutRisk === 'critical').length;
    if (criticalCount > 0) {
      recommendations.push(
        `⚠️ Ação urgente: ${criticalCount} tripulante(s) em risco crítico de burnout`
      );
    }

    if (topConcerns.includes('Sobrecarga de trabalho')) {
      recommendations.push('Revisar distribuição de carga de trabalho e escalas');
    }

    if (topConcerns.includes('Problemas de descanso/sono')) {
      recommendations.push('Auditar conformidade MLC 2.3 (horas de descanso)');
    }

    if (topConcerns.includes('Isolamento/saudade')) {
      recommendations.push('Implementar programa de welfare e comunicação familiar');
    }

    const avgScore = analyses.reduce((sum, a) => sum + a.overallScore, 0) / analyses.length;
    if (avgScore < 60) {
      recommendations.push('Considerar pesquisa de clima organizacional');
    }

    return recommendations;
  }
}

export const wellbeingNLPEngine = new WellbeingNLPEngine();
