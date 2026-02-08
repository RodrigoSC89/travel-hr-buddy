/**
 * PATCH 567 - AI Auto-Tuning Engine
 * Continuous learning system that adjusts AI parameters based on real usage
 * Fixed: Uses ai_feedback_scores (real table) instead of non-existent ai_feedback/action_logs
 */

import { logger } from "@/lib/logger";
import { supabase } from "@/integrations/supabase/client";

export interface AutoTuningConfig {
  thresholds: {
    confidence_min: number;
    accuracy_target: number;
    response_time_max: number;
  };
  weights: {
    user_feedback: number;
    accuracy: number;
    speed: number;
  };
  rules: {
    auto_adjust_enabled: boolean;
    learning_rate: number;
    rollback_on_degradation: boolean;
  };
}

export interface TuningMetrics {
  total_decisions: number;
  accepted_decisions: number;
  rejected_decisions: number;
  avg_confidence: number;
  avg_response_time: number;
  accuracy_rate: number;
}

export interface ModelSnapshot {
  id: string;
  config: AutoTuningConfig;
  metrics: TuningMetrics;
  timestamp: Date;
  performance_score: number;
}

class AutoTuningEngine {
  private currentConfig: AutoTuningConfig;
  private snapshots: ModelSnapshot[] = [];
  private isRunning = false;
  private processingInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.currentConfig = {
      thresholds: {
        confidence_min: 0.7,
        accuracy_target: 0.85,
        response_time_max: 2000,
      },
      weights: {
        user_feedback: 0.4,
        accuracy: 0.4,
        speed: 0.2,
      },
      rules: {
        auto_adjust_enabled: true,
        learning_rate: 0.1,
        rollback_on_degradation: true,
      },
    };
  }

  async start() {
    if (this.isRunning) {
      logger.warn("[AutoTuning] Engine already running");
      return;
    }

    this.isRunning = true;
    logger.info("[AutoTuning] Starting auto-tuning engine...");

    await this.loadConfiguration();

    this.processingInterval = setInterval(
      () => this.processAndTune(),
      21600000
    );

    await this.processAndTune();
  }

  stop() {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
    this.isRunning = false;
    logger.info("[AutoTuning] Engine stopped");
  }

  private async processAndTune() {
    logger.info("[AutoTuning] Processing logs and tuning parameters...");

    try {
      const feedbackMetrics = await this.analyzeFeedbackLogs();

      const metrics: TuningMetrics = {
        total_decisions: feedbackMetrics.total,
        accepted_decisions: feedbackMetrics.accepted,
        rejected_decisions: feedbackMetrics.rejected,
        avg_confidence: feedbackMetrics.avg_confidence,
        avg_response_time: feedbackMetrics.avg_time,
        accuracy_rate: feedbackMetrics.total > 0 
          ? feedbackMetrics.accepted / feedbackMetrics.total 
          : 0.5,
      };

      await this.createSnapshot(metrics);

      if (this.currentConfig.rules.auto_adjust_enabled) {
        await this.adjustParameters(metrics);
      }

      await this.saveConfiguration();

      logger.info("[AutoTuning] Tuning completed:", metrics);
    } catch (error) {
      logger.error("[AutoTuning] Error during processing:", error);
    }
  }

  private async analyzeFeedbackLogs(): Promise<{
    total: number;
    accepted: number;
    rejected: number;
    avg_confidence: number;
    avg_time: number;
  }> {
    try {
      const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();

      // Use real table: ai_feedback_scores
      const { data: feedback, error } = await supabase
        .from("ai_feedback_scores")
        .select("*")
        .gte("created_at", sixHoursAgo);

      if (error) {
        logger.error("[AutoTuning] Error fetching feedback:", error);
        return { total: 0, accepted: 0, rejected: 0, avg_confidence: 0.7, avg_time: 1000 };
      }

      const total = feedback?.length || 0;
      // self_score > 0.7 = accepted, otherwise rejected
      const accepted = feedback?.filter((f) => (f.self_score || 0) > 0.7).length || 0;
      const rejected = total - accepted;
      
      const confidences = feedback?.map((f) => f.self_score || 0.7) || [0.7];
      const avg_confidence = confidences.reduce((a, b) => a + b, 0) / confidences.length;

      return {
        total,
        accepted,
        rejected,
        avg_confidence,
        avg_time: 1000,
      };
    } catch (error) {
      logger.error("[AutoTuning] Error analyzing feedback:", error);
      return { total: 0, accepted: 0, rejected: 0, avg_confidence: 0.7, avg_time: 1000 };
    }
  }

  private async adjustParameters(metrics: TuningMetrics) {
    const learningRate = this.currentConfig.rules.learning_rate;

    if (metrics.accuracy_rate < this.currentConfig.thresholds.accuracy_target) {
      this.currentConfig.thresholds.confidence_min = Math.max(
        0.5,
        this.currentConfig.thresholds.confidence_min - learningRate * 0.1
      );
    } else if (metrics.accuracy_rate > this.currentConfig.thresholds.accuracy_target + 0.1) {
      this.currentConfig.thresholds.confidence_min = Math.min(
        0.95,
        this.currentConfig.thresholds.confidence_min + learningRate * 0.05
      );
    }

    const feedbackScore = metrics.accuracy_rate;
    const speedScore = Math.max(0, 1 - metrics.avg_response_time / this.currentConfig.thresholds.response_time_max);
    
    if (feedbackScore > speedScore) {
      this.currentConfig.weights.user_feedback = Math.min(
        0.6,
        this.currentConfig.weights.user_feedback + learningRate * 0.05
      );
      this.currentConfig.weights.speed = Math.max(
        0.1,
        this.currentConfig.weights.speed - learningRate * 0.05
      );
    }

    logger.info("[AutoTuning] Adjusted parameters:", {
      thresholds: this.currentConfig.thresholds,
      weights: this.currentConfig.weights,
    });
  }

  private async createSnapshot(metrics: TuningMetrics) {
    const performanceScore = 
      metrics.accuracy_rate * this.currentConfig.weights.accuracy +
      (1 - metrics.avg_response_time / 3000) * this.currentConfig.weights.speed +
      (metrics.avg_confidence) * this.currentConfig.weights.user_feedback;

    const snapshot: ModelSnapshot = {
      id: `snapshot_${Date.now()}`,
      config: { ...this.currentConfig },
      metrics: { ...metrics },
      timestamp: new Date(),
      performance_score: performanceScore,
    };

    this.snapshots.push(snapshot);

    if (this.snapshots.length > 30) {
      this.snapshots = this.snapshots.slice(-30);
    }

    try {
      localStorage.setItem("ai_tuning_snapshots", JSON.stringify(this.snapshots));
    } catch (error) {
      logger.error("[AutoTuning] Error saving snapshot:", error);
    }
  }

  async rollback() {
    if (this.snapshots.length < 2) {
      logger.warn("[AutoTuning] No previous snapshot to rollback to");
      return false;
    }

    const previousSnapshot = this.snapshots[this.snapshots.length - 2];
    this.currentConfig = { ...previousSnapshot.config };

    logger.info("[AutoTuning] Rolled back to snapshot:", previousSnapshot.id);
    await this.saveConfiguration();

    return true;
  }

  private async loadConfiguration() {
    try {
      const saved = localStorage.getItem("ai_tuning_config");
      if (saved) {
        this.currentConfig = JSON.parse(saved);
      }

      const savedSnapshots = localStorage.getItem("ai_tuning_snapshots");
      if (savedSnapshots) {
        this.snapshots = JSON.parse(savedSnapshots);
      }
    } catch (error) {
      logger.error("[AutoTuning] Error loading configuration:", error);
    }
  }

  private async saveConfiguration() {
    try {
      localStorage.setItem("ai_tuning_config", JSON.stringify(this.currentConfig));
    } catch (error) {
      logger.error("[AutoTuning] Error saving configuration:", error);
    }
  }

  getConfig(): AutoTuningConfig {
    return { ...this.currentConfig };
  }

  getSnapshots(): ModelSnapshot[] {
    return [...this.snapshots];
  }

  async getCurrentMetrics(): Promise<TuningMetrics> {
    const feedbackMetrics = await this.analyzeFeedbackLogs();

    return {
      total_decisions: feedbackMetrics.total,
      accepted_decisions: feedbackMetrics.accepted,
      rejected_decisions: feedbackMetrics.rejected,
      avg_confidence: feedbackMetrics.avg_confidence,
      avg_response_time: feedbackMetrics.avg_time,
      accuracy_rate: feedbackMetrics.total > 0 
        ? feedbackMetrics.accepted / feedbackMetrics.total 
        : 0.5,
    };
  }
}

export const autoTuningEngine = new AutoTuningEngine();
