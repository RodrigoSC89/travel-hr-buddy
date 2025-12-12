/**
 * PATCH 567 - AI Auto-Tuning Engine
 * Continuous learning system that adjusts AI parameters based on real usage
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
    // Default configuration
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
    });
  }

  /**
   * Start the auto-tuning engine
   */
  async start() {
    if (this.isRunning) {
      logger.warn("[AutoTuning] Engine already running");
      return;
    }

    this.isRunning = true;
    logger.info("[AutoTuning] Starting auto-tuning engine...");

    // Load saved configuration
    await this.loadConfiguration();

    // Process logs every 6 hours (21600000 ms)
    this.processingInterval = setInterval(
      () => this.processAndTune(),
      21600000
    );

    // Run initial processing
    await this.processAndTune();
  }

  /**
   * Stop the engine
   */
  stop() {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
    this.isRunning = false;
    logger.info("[AutoTuning] Engine stopped");
  }

  /**
   * Process logs and adjust parameters
   */
  private async processAndTune() {
    logger.info("[AutoTuning] Processing logs and tuning parameters...");

    try {
      // Fetch recent AI feedback logs
      const feedbackMetrics = await this.analyzeFeedbackLogs();
      
      // Fetch action logs
      const actionMetrics = await this.analyzeActionLogs();

      // Combine metrics
      const metrics: TuningMetrics = {
        total_decisions: feedbackMetrics.total + actionMetrics.total,
        accepted_decisions: feedbackMetrics.accepted + actionMetrics.accepted,
        rejected_decisions: feedbackMetrics.rejected + actionMetrics.rejected,
        avg_confidence: (feedbackMetrics.avg_confidence + actionMetrics.avg_confidence) / 2,
        avg_response_time: (feedbackMetrics.avg_time + actionMetrics.avg_time) / 2,
        accuracy_rate: feedbackMetrics.total > 0 
          ? feedbackMetrics.accepted / feedbackMetrics.total 
          : 0.5,
      });

      // Create snapshot before adjustments
      await this.createSnapshot(metrics);

      // Adjust parameters if auto-tuning is enabled
      if (this.currentConfig.rules.auto_adjust_enabled) {
        await this.adjustParameters(metrics);
      }

      // Save updated configuration
      await this.saveConfiguration();

      logger.info("[AutoTuning] Tuning completed:", metrics);
    } catch (error) {
      logger.error("[AutoTuning] Error during processing:", error);
    }
  }

  /**
   * Analyze AI feedback logs
   */
  private async analyzeFeedbackLogs(): Promise<{
    total: number;
    accepted: number;
    rejected: number;
    avg_confidence: number;
    avg_time: number;
  }> {
    try {
      const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();

      const { data: feedback, error } = await (supabase as any)
        .from("ai_feedback")
        .select("*")
        .gte("created_at", sixHoursAgo);

      if (error) {
        logger.error("[AutoTuning] Error fetching feedback:", error);
        return { total: 0, accepted: 0, rejected: 0, avg_confidence: 0.7, avg_time: 1000 };
      }

      const total = feedback?.length || 0;
      const accepted = feedback?.filter((f: any) => f.operator_action === "accepted").length || 0;
      const rejected = feedback?.filter((f: any) => f.operator_action === "rejected").length || 0;
      
      const confidences = feedback?.map((f: any) => f.confidence_score || 0.7) || [0.7];
      const avg_confidence = confidences.reduce((a: number, b: number) => a + b, 0) / confidences.length;

      return {
        total,
        accepted,
        rejected,
        avg_confidence,
        avg_time: 1000, // Default
      });
    } catch (error) {
      logger.error("[AutoTuning] Error analyzing feedback:", error);
      return { total: 0, accepted: 0, rejected: 0, avg_confidence: 0.7, avg_time: 1000 };
    }
  }

  /**
   * Analyze action logs
   */
  private async analyzeActionLogs(): Promise<{
    total: number;
    accepted: number;
    rejected: number;
    avg_confidence: number;
    avg_time: number;
  }> {
    try {
      const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();

      const { data: actions, error } = await (supabase as any)
        .from("action_logs")
        .select("*")
        .gte("created_at", sixHoursAgo);

      if (error) {
        logger.error("[AutoTuning] Error fetching actions:", error);
        return { total: 0, accepted: 0, rejected: 0, avg_confidence: 0.7, avg_time: 1000 };
      }

      const total = actions?.length || 0;
      const accepted = actions?.filter((a: any) => a.status === "success").length || 0;
      const rejected = actions?.filter((a: any) => a.status === "failed").length || 0;

      return {
        total,
        accepted,
        rejected,
        avg_confidence: 0.75,
        avg_time: 1200,
      });
    } catch (error) {
      logger.error("[AutoTuning] Error analyzing actions:", error);
      return { total: 0, accepted: 0, rejected: 0, avg_confidence: 0.7, avg_time: 1000 };
    }
  }

  /**
   * Adjust parameters based on metrics
   */
  private async adjustParameters(metrics: TuningMetrics) {
    const learningRate = this.currentConfig.rules.learning_rate;

    // Adjust confidence threshold based on accuracy
    if (metrics.accuracy_rate < this.currentConfig.thresholds.accuracy_target) {
      // Lower confidence threshold to be more permissive
      this.currentConfig.thresholds.confidence_min = Math.max(
        0.5,
        this.currentConfig.thresholds.confidence_min - learningRate * 0.1
      );
      logger.info(
        "[AutoTuning] Lowered confidence threshold to",
        this.currentConfig.thresholds.confidence_min
      );
    } else if (metrics.accuracy_rate > this.currentConfig.thresholds.accuracy_target + 0.1) {
      // Raise confidence threshold to be more strict
      this.currentConfig.thresholds.confidence_min = Math.min(
        0.95,
        this.currentConfig.thresholds.confidence_min + learningRate * 0.05
      );
      logger.info(
        "[AutoTuning] Raised confidence threshold to",
        this.currentConfig.thresholds.confidence_min
      );
    }

    // Adjust weights based on performance
    const feedbackScore = metrics.accuracy_rate;
    const speedScore = Math.max(0, 1 - metrics.avg_response_time / this.currentConfig.thresholds.response_time_max);
    
    // Rebalance weights towards better performing factors
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

  /**
   * Create a snapshot of current configuration and metrics
   */
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
    });

    this.snapshots.push(snapshot);

    // Keep only last 30 snapshots
    if (this.snapshots.length > 30) {
      this.snapshots = this.snapshots.slice(-30);
    }

    // Save to localStorage
    try {
      localStorage.setItem("ai_tuning_snapshots", JSON.stringify(this.snapshots));
      logger.info(`[AutoTuning] Snapshot created: ${snapshot.id}, Score: ${performanceScore.toFixed(3)}`);
    } catch (error) {
      logger.error("[AutoTuning] Error saving snapshot:", error);
    }
  }

  /**
   * Rollback to previous configuration
   */
  async rollback() {
    if (this.snapshots.length < 2) {
      logger.warn("[AutoTuning] No previous snapshot to rollback to");
      return false;
    }

    // Get second-to-last snapshot (last one is current)
    const previousSnapshot = this.snapshots[this.snapshots.length - 2];
    this.currentConfig = { ...previousSnapshot.config };

    logger.info("[AutoTuning] Rolled back to snapshot:", previousSnapshot.id);
    await this.saveConfiguration();

    return true;
  }

  /**
   * Load configuration from storage
   */
  private async loadConfiguration() {
    try {
      const saved = localStorage.getItem("ai_tuning_config");
      if (saved) {
        this.currentConfig = JSON.parse(saved);
        logger.info("[AutoTuning] Configuration loaded");
      }

      const savedSnapshots = localStorage.getItem("ai_tuning_snapshots");
      if (savedSnapshots) {
        this.snapshots = JSON.parse(savedSnapshots);
        logger.info(`[AutoTuning] Loaded ${this.snapshots.length} snapshots`);
      }
    } catch (error) {
      logger.error("[AutoTuning] Error loading configuration:", error);
    }
  }

  /**
   * Save configuration to storage
   */
  private async saveConfiguration() {
    try {
      localStorage.setItem("ai_tuning_config", JSON.stringify(this.currentConfig));
      logger.info("[AutoTuning] Configuration saved");
    } catch (error) {
      logger.error("[AutoTuning] Error saving configuration:", error);
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): AutoTuningConfig {
    return { ...this.currentConfig };
  }

  /**
   * Get all snapshots
   */
  getSnapshots(): ModelSnapshot[] {
    return [...this.snapshots];
  }

  /**
   * Get current metrics
   */
  async getCurrentMetrics(): Promise<TuningMetrics> {
    const feedbackMetrics = await this.analyzeFeedbackLogs();
    const actionMetrics = await this.analyzeActionLogs();

    return {
      total_decisions: feedbackMetrics.total + actionMetrics.total,
      accepted_decisions: feedbackMetrics.accepted + actionMetrics.accepted,
      rejected_decisions: feedbackMetrics.rejected + actionMetrics.rejected,
      avg_confidence: (feedbackMetrics.avg_confidence + actionMetrics.avg_confidence) / 2,
      avg_response_time: (feedbackMetrics.avg_time + actionMetrics.avg_time) / 2,
      accuracy_rate: feedbackMetrics.total > 0 
        ? feedbackMetrics.accepted / feedbackMetrics.total 
        : 0.5,
    });
  }
}

// Export singleton instance
export const autoTuningEngine = new AutoTuningEngine();
