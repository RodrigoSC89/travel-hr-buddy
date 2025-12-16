/**
 * PATCH 570 - Weekly Evolution Trigger + Watchdog Integration
 * Automated performance monitoring and PATCH suggestion system
 */

import { logger } from "@/lib/logger";
import { autoTuningEngine, TuningMetrics } from "./auto-tuning-engine";

export interface PerformanceAudit {
  id: string;
  timestamp: Date;
  metrics: TuningMetrics;
  performance_score: number;
  anomalies: string[];
  recommendations: string[];
  suggested_patch?: string;
}

export interface WeeklyReport {
  week_start: Date;
  week_end: Date;
  audits: PerformanceAudit[];
  overall_trend: "improving" | "stable" | "degrading";
  critical_issues: string[];
  patch_suggestions: string[];
}

class EvolutionTrigger {
  private isActive = false;
  private weeklyInterval: NodeJS.Timeout | null = null;
  private audits: PerformanceAudit[] = [];
  private performanceThreshold = 0.75; // Minimum acceptable performance score

  /**
   * Start the evolution trigger
   */
  start() {
    if (this.isActive) {
      logger.warn("[EvolutionTrigger] Already running");
      return;
    }

    this.isActive = true;
    logger.info("[EvolutionTrigger] Starting weekly evolution trigger...");

    // Run audit weekly (604800000 ms = 7 days)
    this.weeklyInterval = setInterval(
      () => this.runWeeklyAudit(),
      604800000
    );

    // Run initial audit
    this.runWeeklyAudit();
  }

  /**
   * Stop the trigger
   */
  stop() {
    if (this.weeklyInterval) {
      clearInterval(this.weeklyInterval);
      this.weeklyInterval = null;
    }
    this.isActive = false;
    logger.info("[EvolutionTrigger] Stopped");
  }

  /**
   * Run weekly performance audit
   */
  private async runWeeklyAudit() {
    logger.info("[EvolutionTrigger] Running weekly performance audit...");

    try {
      // Get current metrics from auto-tuning engine
      const metrics = await autoTuningEngine.getCurrentMetrics();
      const config = autoTuningEngine.getConfig();

      // Calculate performance score
      const performanceScore = this.calculatePerformanceScore(metrics, config);

      // Detect anomalies
      const anomalies = this.detectAnomalies(metrics, config);

      // Generate recommendations
      const recommendations = this.generateRecommendations(metrics, anomalies);

      // Create audit record
      const audit: PerformanceAudit = {
        id: `audit_${Date.now()}`,
        timestamp: new Date(),
        metrics,
        performance_score: performanceScore,
        anomalies,
        recommendations,
      };

      // Check if performance is degrading
      if (performanceScore < this.performanceThreshold) {
        audit.suggested_patch = this.generatePatchSuggestion(metrics, anomalies);
        
        // Alert watchdog
        this.alertWatchdog(audit);
      }

      this.audits.push(audit);

      // Keep only last 12 weeks of audits
      if (this.audits.length > 12) {
        this.audits = this.audits.slice(-12);
      }

      // Save to storage
      this.saveAudits();

      logger.info("[EvolutionTrigger] Weekly audit completed. Score:", performanceScore.toFixed(3));
    } catch (error) {
      logger.error("[EvolutionTrigger] Error during weekly audit:", error);
    }
  }

  /**
   * Calculate overall performance score
   */
  private calculatePerformanceScore(metrics: TuningMetrics, config: any): number {
    const accuracyScore = metrics.accuracy_rate;
    const confidenceScore = metrics.avg_confidence;
    const speedScore = Math.max(0, 1 - metrics.avg_response_time / 3000);
    
    return (
      accuracyScore * 0.4 +
      confidenceScore * 0.4 +
      speedScore * 0.2
    );
  }

  /**
   * Detect performance anomalies
   */
  private detectAnomalies(metrics: TuningMetrics, config: any): string[] {
    const anomalies: string[] = [];

    // Check if accuracy is below target
    if (metrics.accuracy_rate < config.thresholds.accuracy_target) {
      anomalies.push(
        `Low accuracy: ${(metrics.accuracy_rate * 100).toFixed(1)}% (target: ${
          (config.thresholds.accuracy_target * 100).toFixed(1)
        }%)`
      );
    }

    // Check if confidence is too low
    if (metrics.avg_confidence < config.thresholds.confidence_min) {
      anomalies.push(
        `Low confidence: ${(metrics.avg_confidence * 100).toFixed(1)}% (min: ${
          (config.thresholds.confidence_min * 100).toFixed(1)
        }%)`
      );
    }

    // Check if response time is too high
    if (metrics.avg_response_time > config.thresholds.response_time_max) {
      anomalies.push(
        `Slow response: ${metrics.avg_response_time.toFixed(0)}ms (max: ${
          config.thresholds.response_time_max
        }ms)`
      );
    }

    // Check rejection rate
    const rejectionRate = metrics.total_decisions > 0
      ? metrics.rejected_decisions / metrics.total_decisions
      : 0;

    if (rejectionRate > 0.3) {
      anomalies.push(
        `High rejection rate: ${(rejectionRate * 100).toFixed(1)}% of decisions rejected`
      );
    }

    return anomalies;
  }

  /**
   * Generate recommendations based on metrics and anomalies
   */
  private generateRecommendations(metrics: TuningMetrics, anomalies: string[]): string[] {
    const recommendations: string[] = [];

    if (anomalies.length === 0) {
      recommendations.push("Performance is optimal. Continue monitoring.");
      return recommendations;
    }

    // Accuracy recommendations
    if (metrics.accuracy_rate < 0.8) {
      recommendations.push("Consider retraining models with recent feedback data");
      recommendations.push("Review and adjust decision thresholds");
    }

    // Confidence recommendations
    if (metrics.avg_confidence < 0.7) {
      recommendations.push("Increase training data diversity");
      recommendations.push("Review feature engineering for better signal quality");
    }

    // Performance recommendations
    if (metrics.avg_response_time > 2000) {
      recommendations.push("Optimize model inference pipeline");
      recommendations.push("Consider caching frequently used predictions");
      recommendations.push("Review database query performance");
    }

    // Decision volume recommendations
    if (metrics.total_decisions < 10) {
      recommendations.push("Increase AI usage by enabling more automated features");
      recommendations.push("Review user adoption and training needs");
    }

    return recommendations;
  }

  /**
   * Generate a PATCH suggestion based on issues found
   */
  private generatePatchSuggestion(metrics: TuningMetrics, anomalies: string[]): string {
    const issues = anomalies.map(a => `- ${a}`).join("\n");
    const timestamp = new Date().toISOString().split("T")[0];

    return `
PATCH [AUTO-GENERATED] – AI Performance Optimization
🎯 Objetivo: Address performance degradation detected in weekly audit
📊 Metrics:
- Accuracy: ${(metrics.accuracy_rate * 100).toFixed(1)}%
- Confidence: ${(metrics.avg_confidence * 100).toFixed(1)}%
- Response Time: ${metrics.avg_response_time.toFixed(0)}ms
- Rejection Rate: ${((metrics.rejected_decisions / metrics.total_decisions) * 100).toFixed(1)}%

🔍 Issues Detected:
${issues}

🛠️ Recommended Actions:
- Review and retrain ML models
- Optimize inference pipeline
- Adjust decision thresholds
- Increase training data quality

Generated: ${timestamp}
    `.trim();
  }

  /**
   * Alert the System Watchdog about performance issues
   */
  private alertWatchdog(audit: PerformanceAudit) {
    logger.warn(
      "[EvolutionTrigger] Performance degradation detected. Alerting watchdog...",
      {
        score: audit.performance_score,
        anomalies: audit.anomalies,
      }
    );

    // In a real implementation, this would integrate with the actual watchdog
    // For now, we log the alert
    const alertMessage = `
AI Performance Alert:
- Score: ${audit.performance_score.toFixed(3)}
- Anomalies: ${audit.anomalies.length}
- Suggested PATCH: ${audit.suggested_patch ? "Yes" : "No"}
    `.trim();

    logger.warn(alertMessage);

    // Save alert to storage for watchdog to pick up
    try {
      const alerts = JSON.parse(localStorage.getItem("watchdog_alerts") || "[]");
      alerts.push({
        type: "performance_degradation",
        timestamp: audit.timestamp,
        data: audit,
      });
      localStorage.setItem("watchdog_alerts", JSON.stringify(alerts.slice(-50)));
    } catch (error) {
      logger.error("[EvolutionTrigger] Error saving watchdog alert:", error);
    }
  }

  /**
   * Save audits to storage
   */
  private saveAudits() {
    try {
      localStorage.setItem("evolution_audits", JSON.stringify(this.audits));
      logger.info(`[EvolutionTrigger] Saved ${this.audits.length} audits`);
    } catch (error) {
      logger.error("[EvolutionTrigger] Error saving audits:", error);
    }
  }

  /**
   * Load audits from storage
   */
  private loadAudits() {
    try {
      const saved = localStorage.getItem("evolution_audits");
      if (saved) {
        this.audits = JSON.parse(saved);
        logger.info(`[EvolutionTrigger] Loaded ${this.audits.length} audits`);
      }
    } catch (error) {
      logger.error("[EvolutionTrigger] Error loading audits:", error);
    }
  }

  /**
   * Get all audits
   */
  getAudits(): PerformanceAudit[] {
    return [...this.audits];
  }

  /**
   * Get weekly report
   */
  getWeeklyReport(): WeeklyReport | null {
    if (this.audits.length === 0) {
      return null;
    }

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentAudits = this.audits.filter(a => new Date(a.timestamp) >= weekAgo);

    if (recentAudits.length === 0) {
      return null;
    }

    // Determine trend
    const scores = recentAudits.map(a => a.performance_score);
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const trend = avgScore >= 0.85 ? "improving" : avgScore >= 0.75 ? "stable" : "degrading";

    // Collect critical issues and suggestions
    const criticalIssues = recentAudits.flatMap(a => a.anomalies);
    const patchSuggestions = recentAudits
      .filter(a => a.suggested_patch)
      .map(a => a.suggested_patch!);

    return {
      week_start: weekAgo,
      week_end: new Date(),
      audits: recentAudits,
      overall_trend: trend,
      critical_issues: [...new Set(criticalIssues)],
      patch_suggestions: [...new Set(patchSuggestions)],
    };
  }

  /**
   * Manually trigger an audit (for testing)
   */
  async triggerAuditNow() {
    logger.info("[EvolutionTrigger] Manual audit triggered");
    await this.runWeeklyAudit();
  }
}

// Export singleton instance
export const evolutionTrigger = new EvolutionTrigger();

// Auto-start on import (can be disabled for testing)
if (typeof window !== "undefined") {
  evolutionTrigger.start();
}
