/**
 * PATCH 206.0 - Predictive Engine
 * AI engine capable of forecasting failures, overloads or demands
 * based on historical logs and real-time data
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export type ForecastEvent = 'incident' | 'downtime' | 'overload' | 'normal';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface ModuleRiskScore {
  moduleName: string;
  riskScore: number; // 0-100
  riskLevel: RiskLevel;
  forecastEvent: ForecastEvent;
  confidence: number; // 0-1
  factors: string[];
  predictedAt: Date;
}

export interface PredictiveMetrics {
  totalIncidents: number;
  avgResponseTime: number;
  errorRate: number;
  usagePattern: 'stable' | 'increasing' | 'decreasing' | 'volatile';
  lastIncidentTime?: Date;
}

export interface TrainingData {
  watchdogLogs: any[];
  usageStats: any[];
  incidentPatterns: any[];
}

class PredictiveEngine {
  private isTraining = false;
  private modelVersion = '1.0.0';
  private predictionCache = new Map<string, ModuleRiskScore>();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  /**
   * Train model using historical data
   */
  async trainModel(data?: TrainingData): Promise<void> {
    if (this.isTraining) {
      logger.warn('[PredictiveEngine] Training already in progress');
      return;
    }

    this.isTraining = true;
    logger.info('[PredictiveEngine] Starting model training...');

    try {
      // Fetch training data if not provided
      const trainingData = data || await this.fetchTrainingData();

      // Analyze patterns
      const patterns = this.analyzePatterns(trainingData);
      
      // Update model parameters
      await this.updateModelParameters(patterns);

      logger.info('[PredictiveEngine] Model training completed successfully');
    } catch (error) {
      logger.error('[PredictiveEngine] Training failed:', error);
      throw error;
    } finally {
      this.isTraining = false;
    }
  }

  /**
   * Fetch training data from various sources
   */
  private async fetchTrainingData(): Promise<TrainingData> {
    try {
      // Fetch watchdog logs (last 30 days)
      const { data: watchdogLogs } = await (supabase as any)
        .from('watchdog_logs')
        .select('*')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .from('watchdog_logs')
        .select('*')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      // Fetch usage statistics
      const { data: usageStats } = await (supabase as any)
        .from('system_metrics')
        .select('*')
        .gte('recorded_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('recorded_at', { ascending: false });

      // Fetch past incidents
      const { data: incidentPatterns } = await (supabase as any)
        .from('incidents')
        .select('*')
        .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      return {
        watchdogLogs: watchdogLogs || [],
        usageStats: usageStats || [],
        incidentPatterns: incidentPatterns || [],
      };
    } catch (error) {
      logger.error('[PredictiveEngine] Failed to fetch training data:', error);
      return {
        watchdogLogs: [],
        usageStats: [],
        incidentPatterns: [],
      };
    }
  }

  /**
   * Analyze patterns in training data
   */
  private analyzePatterns(data: TrainingData): Record<string, any> {
    const patterns: Record<string, any> = {
      errorFrequency: {},
      moduleHealth: {},
      timePatterns: {},
    };

    // Analyze error frequency by module
    data.watchdogLogs.forEach((log: any) => {
      const moduleName = log.module_name || 'unknown';
      if (!patterns.errorFrequency[moduleName]) {
        patterns.errorFrequency[moduleName] = 0;
      }
      patterns.errorFrequency[moduleName]++;
    });

    // Analyze incident patterns
    data.incidentPatterns.forEach((incident: any) => {
      const moduleName = incident.module || 'unknown';
      if (!patterns.moduleHealth[moduleName]) {
        patterns.moduleHealth[moduleName] = {
          incidents: 0,
          avgResolutionTime: 0,
          severity: [],
        };
      }
      patterns.moduleHealth[moduleName].incidents++;
      patterns.moduleHealth[moduleName].severity.push(incident.severity);
    });

    return patterns;
  }

  /**
   * Update model parameters based on patterns
   */
  private async updateModelParameters(patterns: Record<string, any>): Promise<void> {
    try {
      await (supabase as any)
        .from('ai_model_config')
        .upsert({
          model_name: 'predictive_engine',
          version: this.modelVersion,
          parameters: patterns,
          updated_at: new Date().toISOString(),
        });
    } catch (error) {
      logger.warn('[PredictiveEngine] Failed to save model parameters:', error);
    }
  }

  /**
   * Calculate risk score for a specific module
   */
  async predictModuleRisk(moduleName: string): Promise<ModuleRiskScore> {
    // Check cache first
    const cached = this.predictionCache.get(moduleName);
    if (cached && Date.now() - cached.predictedAt.getTime() < this.cacheTimeout) {
      return cached;
    }

    logger.info(`[PredictiveEngine] Calculating risk for module: ${moduleName}`);

    try {
      // Fetch recent metrics for the module
      const metrics = await this.fetchModuleMetrics(moduleName);

      // Calculate risk score
      const riskScore = this.calculateRiskScore(metrics);
      const riskLevel = this.getRiskLevel(riskScore);
      const forecastEvent = this.predictEvent(metrics, riskScore);
      const confidence = this.calculateConfidence(metrics);
      const factors = this.identifyRiskFactors(metrics);

      const prediction: ModuleRiskScore = {
        moduleName,
        riskScore,
        riskLevel,
        forecastEvent,
        confidence,
        factors,
        predictedAt: new Date(),
      };

      // Cache the prediction
      this.predictionCache.set(moduleName, prediction);

      // Save to Supabase
      await this.savePrediction(prediction);

      return prediction;
    } catch (error) {
      logger.error(`[PredictiveEngine] Failed to predict risk for ${moduleName}:`, error);
      throw error;
    }
  }

  /**
   * Fetch metrics for a specific module
   */
  private async fetchModuleMetrics(moduleName: string): Promise<PredictiveMetrics> {
    try {
      // Fetch recent errors
      const { data: errors, count: errorCount } = await (supabase as any)
        .from('watchdog_logs')
        .select('*', { count: 'exact' })
        .eq('module_name', moduleName)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
        .from('watchdog_logs')
        .select('*', { count: 'exact' })
        .eq('module_name', moduleName)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      // Fetch recent incidents
      const { data: incidents } = await (supabase as any)
        .from('incidents')
        .select('*')
        .eq('module', moduleName)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(1);
        .from('incidents')
        .select('*')
        .eq('module', moduleName)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(1);

      // Fetch usage stats
      const { data: usageStats } = await (supabase as any)
        .from('system_metrics')
        .select('*')
        .eq('metric_name', moduleName)
        .gte('recorded_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('recorded_at', { ascending: false });

      // Calculate metrics
      const totalIncidents = incidents?.length || 0;
      const avgResponseTime = (usageStats as any[])?.reduce((sum, stat: any) => sum + (stat.response_time || 0), 0) / ((usageStats as any[])?.length || 1);
      const errorRate = (errorCount || 0) / Math.max(usageStats?.length || 1, 1);
      
      // Determine usage pattern
      let usagePattern: 'stable' | 'increasing' | 'decreasing' | 'volatile' = 'stable';
      if (usageStats && (usageStats as any[]).length > 5) {
        const recentAvg = (usageStats as any[]).slice(0, 5).reduce((sum, s: any) => sum + (s.request_count || 0), 0) / 5;
        const olderAvg = (usageStats as any[]).slice(5).reduce((sum, s: any) => sum + (s.request_count || 0), 0) / Math.max((usageStats as any[]).length - 5, 1);
        const change = (recentAvg - olderAvg) / Math.max(olderAvg, 1);
        
        if (Math.abs(change) > 0.5) usagePattern = 'volatile';
        else if (change > 0.2) usagePattern = 'increasing';
        else if (change < -0.2) usagePattern = 'decreasing';
      }

      return {
        totalIncidents,
        avgResponseTime,
        errorRate,
        usagePattern,
        lastIncidentTime: incidents?.[0]?.created_at ? new Date(incidents[0].created_at) : undefined,
      };
    } catch (error) {
      logger.error(`[PredictiveEngine] Failed to fetch metrics for ${moduleName}:`, error);
      return {
        totalIncidents: 0,
        avgResponseTime: 0,
        errorRate: 0,
        usagePattern: 'stable',
      };
    }
  }

  /**
   * Calculate risk score (0-100)
   */
  private calculateRiskScore(metrics: PredictiveMetrics): number {
    let score = 0;

    // Factor 1: Error rate (40% weight)
    score += Math.min(metrics.errorRate * 100, 40);

    // Factor 2: Recent incidents (30% weight)
    if (metrics.lastIncidentTime) {
      const hoursSinceIncident = (Date.now() - metrics.lastIncidentTime.getTime()) / (1000 * 60 * 60);
      if (hoursSinceIncident < 24) {
        score += 30;
      } else if (hoursSinceIncident < 168) {
        score += 15;
      }
    }

    // Factor 3: Response time (20% weight)
    if (metrics.avgResponseTime > 2000) {
      score += 20;
    } else if (metrics.avgResponseTime > 1000) {
      score += 10;
    }

    // Factor 4: Usage pattern (10% weight)
    if (metrics.usagePattern === 'volatile') {
      score += 10;
    } else if (metrics.usagePattern === 'increasing') {
      score += 5;
    }

    return Math.min(Math.round(score), 100);
  }

  /**
   * Determine risk level from score
   */
  private getRiskLevel(score: number): RiskLevel {
    if (score >= 75) return 'critical';
    if (score >= 50) return 'high';
    if (score >= 25) return 'medium';
    return 'low';
  }

  /**
   * Predict event type based on metrics
   */
  private predictEvent(metrics: PredictiveMetrics, riskScore: number): ForecastEvent {
    if (riskScore >= 75) {
      return metrics.usagePattern === 'increasing' ? 'overload' : 'incident';
    }
    if (riskScore >= 50) {
      return metrics.avgResponseTime > 2000 ? 'downtime' : 'incident';
    }
    return 'normal';
  }

  /**
   * Calculate prediction confidence (0-1)
   */
  private calculateConfidence(metrics: PredictiveMetrics): number {
    let confidence = 0.5; // Base confidence

    // More data = higher confidence
    if (metrics.totalIncidents > 0) confidence += 0.2;
    if (metrics.avgResponseTime > 0) confidence += 0.15;
    if (metrics.errorRate > 0) confidence += 0.15;

    return Math.min(confidence, 1);
  }

  /**
   * Identify risk factors
   */
  private identifyRiskFactors(metrics: PredictiveMetrics): string[] {
    const factors: string[] = [];

    if (metrics.errorRate > 0.1) {
      factors.push('High error rate detected');
    }
    if (metrics.avgResponseTime > 1000) {
      factors.push('Elevated response times');
    }
    if (metrics.usagePattern === 'volatile') {
      factors.push('Volatile usage patterns');
    }
    if (metrics.usagePattern === 'increasing') {
      factors.push('Increasing demand');
    }
    if (metrics.lastIncidentTime) {
      const hoursSince = (Date.now() - metrics.lastIncidentTime.getTime()) / (1000 * 60 * 60);
      if (hoursSince < 24) {
        factors.push('Recent incident detected');
      }
    }
    if (factors.length === 0) {
      factors.push('System operating normally');
    }

    return factors;
  }

  /**
   * Save prediction to Supabase
   */
  private async savePrediction(prediction: ModuleRiskScore): Promise<void> {
    try {
      const { error } = await (supabase as any)
        .from('predictive_events')
        .insert({
          module_name: prediction.moduleName,
          risk_score: prediction.riskScore,
          risk_level: prediction.riskLevel,
          forecast_event: prediction.forecastEvent,
          confidence: prediction.confidence,
          factors: prediction.factors,
          predicted_at: prediction.predictedAt.toISOString(),
        });

      if (error) {
        logger.error('[PredictiveEngine] Failed to save prediction:', error);
      }
    } catch (error) {
      logger.error('[PredictiveEngine] Error saving prediction:', error);
    }
  }

  /**
   * Predict risks for all active modules
   */
  async predictAllModules(): Promise<ModuleRiskScore[]> {
    logger.info('[PredictiveEngine] Predicting risks for all modules...');

    try {
      // Fetch list of active modules
      const { data: modules } = await (supabase as any)
        .from('system_metrics')
        .select('module_name')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      const uniqueModules = [...new Set(modules?.map(m => m.module_name) || [])];

      // Predict for each module
      const predictions = await Promise.all(
        uniqueModules.map(moduleName => this.predictModuleRisk(moduleName))
      );

      return predictions;
    } catch (error) {
      logger.error('[PredictiveEngine] Failed to predict all modules:', error);
      return [];
    }
  }

  /**
   * Get recent predictions
   */
  async getRecentPredictions(limit = 50): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('predictive_events')
        .select('*')
        .order('predicted_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('[PredictiveEngine] Failed to fetch predictions:', error);
      return [];
    }
  }

  /**
   * Clear prediction cache
   */
  clearCache(): void {
    this.predictionCache.clear();
    logger.info('[PredictiveEngine] Cache cleared');
  }
}

// Export singleton instance
export const predictiveEngine = new PredictiveEngine();
