/**
 * PATCH 209.0 - Evolution AI Connector
 * Self-evolving feedback loop between usage logs, human feedback,
 * and AI behavior refinement
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import { predictiveEngine } from "./predictiveEngine";
import { adaptiveMetricsEngine } from "./adaptiveMetrics";

export interface TrainingDelta {
  component: string;
  metric: string;
  oldValue: number;
  newValue: number;
  confidence: number;
  timestamp: Date;
}

export interface PerformanceScore {
  overall: number;
  prediction: number;
  adaptation: number;
  tactical: number;
  timestamp: Date;
  trend: 'improving' | 'stable' | 'degrading';
}

export interface FeedbackInsight {
  category: string;
  pattern: string;
  frequency: number;
  impact: 'high' | 'medium' | 'low';
  recommendation: string;
}

export interface EvolutionReport {
  trainingDeltas: TrainingDelta[];
  performanceScore: PerformanceScore;
  insights: FeedbackInsight[];
  evolutionScore: number;
  generatedAt: Date;
}

class EvoAIConnector {
  private isActive = false;
  private batchInterval: NodeJS.Timeout | null = null;
  private batchIntervalHours = 24;
  private patternDeviationThreshold = 0.25; // 25%

  /**
   * Start evolution connector
   */
  start(): void {
    if (this.isActive) {
      logger.warn('[EvoAI] Already running');
      return;
    }

    this.isActive = true;
    logger.info('[EvoAI] Starting Evolution AI Connector...');

    // Process insights periodically
    this.batchInterval = setInterval(() => {
      this.processBatchInsights();
    }, this.batchIntervalHours * 60 * 60 * 1000);

    // Process initial batch
    setTimeout(() => this.processBatchInsights(), 5000);

    logger.info('[EvoAI] Evolution AI Connector is active');
  }

  /**
   * Stop evolution connector
   */
  stop(): void {
    if (!this.isActive) return;

    this.isActive = false;
    if (this.batchInterval) {
      clearInterval(this.batchInterval);
      this.batchInterval = null;
    }

    logger.info('[EvoAI] Evolution AI Connector stopped');
  }

  /**
   * Process batch insights
   */
  private async processBatchInsights(): Promise<void> {
    if (!this.isActive) return;

    logger.info('[EvoAI] Processing batch insights...');

    try {
      // Sync data from all sources
      const feedbackData = await this.syncFeedbackCore();
      const predictiveData = await this.syncPredictiveEngine();
      const adaptiveData = await this.syncAdaptiveMetrics();

      // Generate insights
      const insights = await this.generateInsights(feedbackData, predictiveData, adaptiveData);

      // Calculate performance score
      const performanceScore = await this.calculatePerformanceScore();

      // Generate training deltas
      const trainingDeltas = await this.generateTrainingDeltas(insights);

      // Create evolution report
      const report: EvolutionReport = {
        trainingDeltas,
        performanceScore,
        insights,
        evolutionScore: this.calculateEvolutionScore(performanceScore, insights),
        generatedAt: new Date(),
      };

      // Save report
      await this.saveEvolutionReport(report);

      // Check if fine-tuning is needed
      const patternDeviation = await this.calculatePatternDeviation(insights);
      if (patternDeviation > this.patternDeviationThreshold) {
        logger.warn(`[EvoAI] Pattern deviation: ${(patternDeviation * 100).toFixed(1)}% - Fine-tuning recommended`);
        await this.triggerFineTune(report);
      }

      logger.info('[EvoAI] Batch insights processed successfully');
    } catch (error) {
      logger.error('[EvoAI] Failed to process batch insights:', error);
    }
  }

  /**
   * Sync feedback core data
   */
  private async syncFeedbackCore(): Promise<any[]> {
    try {
      const { data } = await supabase
        .from('user_feedback')
        .select('*')
        .gte('created_at', new Date(Date.now() - this.batchIntervalHours * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      return data || [];
    } catch (error) {
      logger.error('[EvoAI] Failed to sync feedback core:', error);
      return [];
    }
  }

  /**
   * Sync predictive engine data
   */
  private async syncPredictiveEngine(): Promise<any[]> {
    try {
      const predictions = await predictiveEngine.getRecentPredictions(1000);
      return predictions;
    } catch (error) {
      logger.error('[EvoAI] Failed to sync predictive engine:', error);
      return [];
    }
  }

  /**
   * Sync adaptive metrics data
   */
  private async syncAdaptiveMetrics(): Promise<any[]> {
    try {
      const history = await adaptiveMetricsEngine.getAdjustmentHistory(500);
      return history;
    } catch (error) {
      logger.error('[EvoAI] Failed to sync adaptive metrics:', error);
      return [];
    }
  }

  /**
   * Generate insights from synced data
   */
  private async generateInsights(
    feedbackData: any[],
    predictiveData: any[],
    adaptiveData: any[]
  ): Promise<FeedbackInsight[]> {
    const insights: FeedbackInsight[] = [];

    // Analyze feedback patterns
    const feedbackPatterns = this.analyzeFeedbackPatterns(feedbackData);
    insights.push(...feedbackPatterns);

    // Analyze prediction accuracy
    const predictionInsights = this.analyzePredictionAccuracy(predictiveData);
    insights.push(...predictionInsights);

    // Analyze adaptation effectiveness
    const adaptationInsights = this.analyzeAdaptationEffectiveness(adaptiveData);
    insights.push(...adaptationInsights);

    return insights;
  }

  /**
   * Analyze feedback patterns
   */
  private analyzeFeedbackPatterns(feedbackData: any[]): FeedbackInsight[] {
    const insights: FeedbackInsight[] = [];
    const patterns = new Map<string, number>();

    // Count feedback by category
    feedbackData.forEach(feedback => {
      const category = feedback.category || 'general';
      patterns.set(category, (patterns.get(category) || 0) + 1);
    });

    // Generate insights for frequent patterns
    patterns.forEach((count: number, category: string) => {
      if (count > 5) {
        insights.push({
          category: 'user_feedback',
          pattern: `Frequent ${category} feedback`,
          frequency: count,
          impact: count > 20 ? 'high' : count > 10 ? 'medium' : 'low',
          recommendation: `Review and address ${category} concerns`,
        });
      }
    });

    return insights;
  }

  /**
   * Analyze prediction accuracy
   */
  private analyzePredictionAccuracy(predictiveData: any[]): FeedbackInsight[] {
    const insights: FeedbackInsight[] = [];

    if (predictiveData.length === 0) return insights;

    // Calculate average confidence
    const avgConfidence = predictiveData.reduce((sum, p) => sum + (p.confidence || 0), 0) / predictiveData.length;

    // Analyze risk distribution
    const riskLevels = predictiveData.reduce((acc, p) => {
      acc[p.risk_level] = (acc[p.risk_level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    if (avgConfidence < 0.6) {
      insights.push({
        category: 'prediction',
        pattern: 'Low prediction confidence',
        frequency: predictiveData.length,
        impact: 'high',
        recommendation: 'Increase training data or refine prediction model',
      });
    }

    if (riskLevels.critical > predictiveData.length * 0.2) {
      insights.push({
        category: 'prediction',
        pattern: 'High critical risk rate',
        frequency: riskLevels.critical,
        impact: 'high',
        recommendation: 'Review critical risk thresholds and system stability',
      });
    }

    return insights;
  }

  /**
   * Analyze adaptation effectiveness
   */
  private analyzeAdaptationEffectiveness(adaptiveData: any[]): FeedbackInsight[] {
    const insights: FeedbackInsight[] = [];

    if (adaptiveData.length === 0) return insights;

    // Count adjustments by parameter
    const paramAdjustments = adaptiveData.reduce((acc, adj) => {
      acc[adj.parameter_name] = (acc[adj.parameter_name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Identify frequently adjusted parameters
    (Object.entries(paramAdjustments) as Array<[string, number]>).forEach(([param, count]) => {
      if (count > 10) {
        insights.push({
          category: 'adaptation',
          pattern: `Frequent ${param} adjustments`,
          frequency: count,
          impact: 'medium',
          recommendation: `Review ${param} baseline and adjustment rules`,
        });
      }
    });

    return insights;
  }

  /**
   * Calculate performance score
   */
  private async calculatePerformanceScore(): Promise<PerformanceScore> {
    // Fetch recent metrics
    const { data: recentMetrics } = await supabase
      .from('system_metrics')
      .select('*')
      .gte('recorded_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('recorded_at', { ascending: false });

    const { data: oldMetrics } = await supabase
      .from('system_metrics')
      .select('*')
      .gte('recorded_at', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString())
      .lt('recorded_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    // Calculate scores (simplified)
    const recentArray = (recentMetrics ?? []) as any[];
    const oldArray = (oldMetrics ?? []) as any[];
    const recentAvg = recentArray.reduce((sum, m: any) => sum + (m.value ?? 0.5), 0) / Math.max(recentArray.length || 1, 1);
    const oldAvg = oldArray.reduce((sum, m: any) => sum + (m.value ?? 0.5), 0) / Math.max(oldArray.length || 1, 1);

    const trend = recentAvg > oldAvg * 1.05 ? 'improving' : recentAvg < oldAvg * 0.95 ? 'degrading' : 'stable';

    return {
      overall: Math.min(recentAvg, 1),
      prediction: 0.8, // Would calculate from prediction accuracy
      adaptation: 0.75, // Would calculate from adaptation success rate
      tactical: 0.85, // Would calculate from tactical decision success rate
      timestamp: new Date(),
      trend,
    };
  }

  /**
   * Generate training deltas
   */
  private async generateTrainingDeltas(insights: FeedbackInsight[]): Promise<TrainingDelta[]> {
    const deltas: TrainingDelta[] = [];

    // Generate deltas based on insights
    insights.forEach(insight => {
      if (insight.impact === 'high') {
        deltas.push({
          component: insight.category,
          metric: insight.pattern,
          oldValue: 0, // Would fetch from history
          newValue: 0, // Would calculate recommended value
          confidence: 0.7,
          timestamp: new Date(),
        });
      }
    });

    return deltas;
  }

  /**
   * Calculate evolution score
   */
  private calculateEvolutionScore(
    performanceScore: PerformanceScore,
    insights: FeedbackInsight[]
  ): number {
    const baseScore = performanceScore.overall * 100;
    const trendBonus = performanceScore.trend === 'improving' ? 10 : performanceScore.trend === 'degrading' ? -10 : 0;
    const insightPenalty = insights.filter(i => i.impact === 'high').length * 5;

    return Math.max(0, Math.min(100, baseScore + trendBonus - insightPenalty));
  }

  /**
   * Save evolution report
   */
  private async saveEvolutionReport(report: EvolutionReport): Promise<void> {
    try {
      // Correlate records with a cycle id
      const cycleId = (globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2));

      // Save training deltas snapshot
      await (supabase as any)
        .from('training_deltas')
        .insert({
          cycle_id: cycleId,
          module_name: 'evo_ai',
          metric_name: 'composite',
          source: 'evo_ai_connector',
          deltas: report.trainingDeltas,
          created_at: new Date().toISOString(),
        });

      // Save performance score
      await (supabase as any)
        .from('performance_scores')
        .insert({
          module_name: 'evo_ai',
          overall_score: report.performanceScore.overall,
          prediction_score: report.performanceScore.prediction,
          adaptation_score: report.performanceScore.adaptation,
          tactical_score: report.performanceScore.tactical,
          trend: report.performanceScore.trend,
          timestamp: report.performanceScore.timestamp.toISOString(),
        });

      // Save insights
      const insightRecords = report.insights.map(i => ({
        cycle_id: cycleId,
        category: i.category,
        pattern: i.pattern,
        frequency: i.frequency,
        impact: i.impact,
        recommendation: i.recommendation,
        generated_at: report.generatedAt.toISOString(),
      }));

      if (insightRecords.length > 0) {
        await (supabase as any).from('evolution_insights').insert(insightRecords);
      }

      logger.info('[EvoAI] Evolution report saved');
    } catch (error) {
      logger.error('[EvoAI] Failed to save evolution report:', error);
    }
  }

  /**
   * Calculate pattern deviation
   */
  private async calculatePatternDeviation(insights: FeedbackInsight[]): Promise<number> {
    // Calculate deviation based on high-impact insights
    const highImpactCount = insights.filter(i => i.impact === 'high').length;
    const totalInsights = insights.length || 1;

    return highImpactCount / totalInsights;
  }

  /**
   * Trigger LLM fine-tune
   */
  private async triggerFineTune(report: EvolutionReport): Promise<void> {
    logger.info('[EvoAI] Triggering LLM fine-tune...');

    try {
      // Save fine-tune request
      await (supabase as any)
        .from('fine_tune_requests')
        .insert({
          module_name: 'evo_ai',
          request_id: (globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)),
          trigger_reason: 'pattern_deviation_exceeded',
          deviation_percent: await this.calculatePatternDeviation(report.insights),
          training_data: {
            deltas: report.trainingDeltas,
            insights: report.insights,
          },
          status: 'pending',
          requested_at: new Date().toISOString(),
        });

      logger.info('[EvoAI] Fine-tune request created');
    } catch (error) {
      logger.error('[EvoAI] Failed to trigger fine-tune:', error);
    }
  }

  /**
   * Get latest evolution report
   */
  async getLatestReport(): Promise<EvolutionReport | null> {
    try {
      const { data: performanceData } = await supabase
        .from('performance_scores')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

      if (!performanceData) return null;

      const { data: insightsData } = await supabase
        .from('evolution_insights')
        .select('*')
        .gte('generated_at', new Date(Date.now() - this.batchIntervalHours * 60 * 60 * 1000).toISOString());

      const { data: deltasData } = await supabase
        .from('training_deltas')
        .select('*')
        .order('generated_at', { ascending: false })
        .limit(1)
        .single();

      const trainingDeltas = (deltasData?.deltas as unknown as TrainingDelta[]) || [];
      const performanceScore: PerformanceScore = {
        overall: performanceData.overall_score,
        prediction: performanceData.prediction_score ?? 0,
        adaptation: performanceData.adaptation_score ?? 0,
        tactical: performanceData.tactical_score ?? 0,
        timestamp: new Date(performanceData.timestamp ?? new Date().toISOString()),
        trend: (performanceData.trend ?? 'stable') as PerformanceScore['trend'],
      };

      const insights: FeedbackInsight[] = (insightsData || []).map(i => ({
        category: i.category,
        pattern: i.pattern,
        frequency: i.frequency,
        impact: (i.impact as FeedbackInsight['impact']) ?? 'low',
        recommendation: i.recommendation,
      }));

      return {
        trainingDeltas,
        performanceScore,
        insights,
        evolutionScore: this.calculateEvolutionScore(performanceScore, insights),
        generatedAt: new Date(performanceData.timestamp ?? new Date().toISOString()),
      };
    } catch (error) {
      logger.error('[EvoAI] Failed to fetch latest report:', error);
      return null;
    }
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      isActive: this.isActive,
      batchIntervalHours: this.batchIntervalHours,
      patternDeviationThreshold: this.patternDeviationThreshold * 100,
    };
  }
}

// Export singleton instance
export const evoAIConnector = new EvoAIConnector();
