/**
 * PATCH 206.0 - Predictive Engine
 * AI engine capable of forecasting failures, overloads or demands
 * DEBT-FIX: Removed (supabase as any) - using typed tables with fallbacks for non-existent tables
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export type ForecastEvent = "incident" | "downtime" | "overload" | "normal";
export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface ModuleRiskScore {
  moduleName: string;
  riskScore: number;
  riskLevel: RiskLevel;
  forecastEvent: ForecastEvent;
  confidence: number;
  factors: string[];
  predictedAt: Date;
}

export interface PredictiveMetrics {
  totalIncidents: number;
  avgResponseTime: number;
  errorRate: number;
  usagePattern: "stable" | "increasing" | "decreasing" | "volatile";
  lastIncidentTime?: Date;
}

export interface TrainingData {
  watchdogLogs: any[];
  usageStats: any[];
  incidentPatterns: any[];
}

class PredictiveEngine {
  private isTraining = false;
  private modelVersion = "1.0.0";
  private predictionCache = new Map<string, ModuleRiskScore>();
  private cacheTimeout = 5 * 60 * 1000;

  async trainModel(data?: TrainingData): Promise<void> {
    if (this.isTraining) {
      logger.warn("[PredictiveEngine] Training already in progress");
      return;
    }

    this.isTraining = true;
    logger.info("[PredictiveEngine] Starting model training...");

    try {
      const trainingData = data || await this.fetchTrainingData();
      const patterns = this.analyzePatterns(trainingData);
      await this.updateModelParameters(patterns);
      logger.info("[PredictiveEngine] Model training completed successfully");
    } catch (error) {
      logger.error("[PredictiveEngine] Training failed:", error);
      throw error;
    } finally {
      this.isTraining = false;
    }
  }

  private async fetchTrainingData(): Promise<TrainingData> {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();

      const { data: watchdogLogs } = await supabase
        .from("watchdog_logs")
        .select("*")
        .gte("created_at", thirtyDaysAgo)
        .order("created_at", { ascending: false });

      const { data: usageStats } = await supabase
        .from("system_metrics")
        .select("*")
        .gte("recorded_at", thirtyDaysAgo)
        .order("recorded_at", { ascending: false });

      const { data: incidentPatterns } = await supabase
        .from("incidents")
        .select("*")
        .gte("created_at", ninetyDaysAgo)
        .order("created_at", { ascending: false });

      return {
        watchdogLogs: watchdogLogs || [],
        usageStats: usageStats || [],
        incidentPatterns: incidentPatterns || [],
      };
    } catch (error) {
      logger.error("[PredictiveEngine] Failed to fetch training data:", error);
      return { watchdogLogs: [], usageStats: [], incidentPatterns: [] };
    }
  }

  private analyzePatterns(data: TrainingData): Record<string, any> {
    const patterns: Record<string, any> = {
      errorFrequency: {},
      moduleHealth: {},
      timePatterns: {},
    };

    data.watchdogLogs.forEach((log: any) => {
      const moduleName = log.module_name || "unknown";
      if (!patterns.errorFrequency[moduleName]) {
        patterns.errorFrequency[moduleName] = 0;
      }
      patterns.errorFrequency[moduleName]++;
    });

    data.incidentPatterns.forEach((incident: any) => {
      const moduleName = incident.module || "unknown";
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

  private async updateModelParameters(patterns: Record<string, any>): Promise<void> {
    try {
      // Store model config using ai_configurations table
      await supabase
        .from("ai_configurations")
        .upsert({
          config_key: "predictive_engine_params",
          config_value: {
            model_name: "predictive_engine",
            version: this.modelVersion,
            parameters: patterns,
          } as any,
          description: "Predictive engine model parameters",
          updated_at: new Date().toISOString(),
        });
    } catch (error) {
      logger.warn("[PredictiveEngine] Failed to save model parameters:", error);
    }
  }

  async predictModuleRisk(moduleName: string): Promise<ModuleRiskScore> {
    const cached = this.predictionCache.get(moduleName);
    if (cached && Date.now() - cached.predictedAt.getTime() < this.cacheTimeout) {
      return cached;
    }

    logger.info(`[PredictiveEngine] Calculating risk for module: ${moduleName}`);

    try {
      const metrics = await this.fetchModuleMetrics(moduleName);
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

      this.predictionCache.set(moduleName, prediction);
      await this.savePrediction(prediction);

      return prediction;
    } catch (error) {
      logger.error(`[PredictiveEngine] Failed to predict risk for ${moduleName}:`, error);
      throw error;
    }
  }

  private async fetchModuleMetrics(moduleName: string): Promise<PredictiveMetrics> {
    try {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      const { data: errors, count: errorCount } = await supabase
        .from("watchdog_logs")
        .select("*", { count: "exact" })
        .eq("module_name", moduleName)
        .gte("created_at", oneDayAgo);

      const { data: incidents } = await supabase
        .from("incidents")
        .select("*")
        .eq("module", moduleName)
        .gte("created_at", oneWeekAgo)
        .order("created_at", { ascending: false })
        .limit(1);

      const { data: usageStats } = await supabase
        .from("system_metrics")
        .select("*")
        .eq("metric_name", moduleName)
        .gte("recorded_at", oneDayAgo)
        .order("recorded_at", { ascending: false });

      const totalIncidents = incidents?.length || 0;
      const statsArr = usageStats || [];
      const avgResponseTime = statsArr.reduce((sum: number, stat: any) => sum + (stat.response_time || 0), 0) / Math.max(statsArr.length, 1);
      const errorRate = (errorCount || 0) / Math.max(statsArr.length, 1);

      let usagePattern: "stable" | "increasing" | "decreasing" | "volatile" = "stable";
      if (statsArr.length > 5) {
        const recentAvg = statsArr.slice(0, 5).reduce((sum: number, s: any) => sum + (s.request_count || 0), 0) / 5;
        const olderAvg = statsArr.slice(5).reduce((sum: number, s: any) => sum + (s.request_count || 0), 0) / Math.max(statsArr.length - 5, 1);
        const change = (recentAvg - olderAvg) / Math.max(olderAvg, 1);

        if (Math.abs(change) > 0.5) usagePattern = "volatile";
        else if (change > 0.2) usagePattern = "increasing";
        else if (change < -0.2) usagePattern = "decreasing";
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
      return { totalIncidents: 0, avgResponseTime: 0, errorRate: 0, usagePattern: "stable" };
    }
  }

  private calculateRiskScore(metrics: PredictiveMetrics): number {
    let score = 0;
    score += Math.min(metrics.errorRate * 100, 40);
    if (metrics.lastIncidentTime) {
      const hoursSinceIncident = (Date.now() - metrics.lastIncidentTime.getTime()) / (1000 * 60 * 60);
      if (hoursSinceIncident < 24) score += 30;
      else if (hoursSinceIncident < 168) score += 15;
    }
    if (metrics.avgResponseTime > 2000) score += 20;
    else if (metrics.avgResponseTime > 1000) score += 10;
    if (metrics.usagePattern === "volatile") score += 10;
    else if (metrics.usagePattern === "increasing") score += 5;
    return Math.min(Math.round(score), 100);
  }

  private getRiskLevel(score: number): RiskLevel {
    if (score >= 75) return "critical";
    if (score >= 50) return "high";
    if (score >= 25) return "medium";
    return "low";
  }

  private predictEvent(metrics: PredictiveMetrics, riskScore: number): ForecastEvent {
    if (riskScore >= 75) return metrics.usagePattern === "increasing" ? "overload" : "incident";
    if (riskScore >= 50) return metrics.avgResponseTime > 2000 ? "downtime" : "incident";
    return "normal";
  }

  private calculateConfidence(metrics: PredictiveMetrics): number {
    let confidence = 0.5;
    if (metrics.totalIncidents > 0) confidence += 0.2;
    if (metrics.avgResponseTime > 0) confidence += 0.15;
    if (metrics.errorRate > 0) confidence += 0.15;
    return Math.min(confidence, 1);
  }

  private identifyRiskFactors(metrics: PredictiveMetrics): string[] {
    const factors: string[] = [];
    if (metrics.errorRate > 0.1) factors.push("High error rate detected");
    if (metrics.avgResponseTime > 1000) factors.push("Elevated response times");
    if (metrics.usagePattern === "volatile") factors.push("Volatile usage patterns");
    if (metrics.usagePattern === "increasing") factors.push("Increasing demand");
    if (metrics.lastIncidentTime) {
      const hoursSince = (Date.now() - metrics.lastIncidentTime.getTime()) / (1000 * 60 * 60);
      if (hoursSince < 24) factors.push("Recent incident detected");
    }
    if (factors.length === 0) factors.push("System operating normally");
    return factors;
  }

  private async savePrediction(prediction: ModuleRiskScore): Promise<void> {
    try {
      // Save as ai_insights instead of non-existent predictive_events table
      const { error } = await supabase
        .from("ai_insights")
        .insert({
          title: `Risk Prediction: ${prediction.moduleName}`,
          description: `Risk score: ${prediction.riskScore}, Level: ${prediction.riskLevel}, Event: ${prediction.forecastEvent}`,
          category: "predictive_risk",
          priority: prediction.riskLevel === "critical" ? "critical" : prediction.riskLevel === "high" ? "high" : "medium",
          confidence: prediction.confidence,
          related_module: prediction.moduleName,
          actionable: prediction.riskLevel !== "low",
          user_id: (await supabase.auth.getUser()).data.user?.id || "system",
          metadata: {
            risk_score: prediction.riskScore,
            risk_level: prediction.riskLevel,
            forecast_event: prediction.forecastEvent,
            factors: prediction.factors,
            predicted_at: prediction.predictedAt.toISOString(),
          },
        });

      if (error) {
        logger.error("[PredictiveEngine] Failed to save prediction:", error);
      }
    } catch (error) {
      logger.error("[PredictiveEngine] Error saving prediction:", error);
    }
  }

  async predictAllModules(): Promise<ModuleRiskScore[]> {
    logger.info("[PredictiveEngine] Predicting risks for all modules...");

    try {
      const { data: modules } = await supabase
        .from("system_metrics")
        .select("metric_name")
        .gte("recorded_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      const uniqueModules = [...new Set((modules || []).map((m) => m.metric_name).filter((name): name is string => typeof name === "string"))];

      const predictions = await Promise.all(
        uniqueModules.map((moduleName) => this.predictModuleRisk(moduleName))
      );

      return predictions;
    } catch (error) {
      logger.error("[PredictiveEngine] Failed to predict all modules:", error);
      return [];
    }
  }

  async getRecentPredictions(limit = 50): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from("ai_insights")
        .select("*")
        .eq("category", "predictive_risk")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error("[PredictiveEngine] Failed to fetch predictions:", error);
      return [];
    }
  }

  clearCache(): void {
    this.predictionCache.clear();
    logger.info("[PredictiveEngine] Cache cleared");
  }
}

export const predictiveEngine = new PredictiveEngine();
