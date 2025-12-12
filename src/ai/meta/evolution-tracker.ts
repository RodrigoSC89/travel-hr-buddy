/**
 * PATCH 588: Evolution Tracker
 * 
 * Tracks and documents AI behavior evolution over time
 * Features:
 * - Internal AI version history
 * - Accuracy comparison between versions
 * - Cognitive progress visualization
 * - Audit-ready data export
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export interface AIVersion {
  versionId: string;
  versionNumber: string;
  description: string;
  changes: string[];
  timestamp: string;
  parentVersionId: string | null;
}

export interface PerformanceMetrics {
  versionId: string;
  accuracy: number; // 0-100
  precision: number; // 0-100
  recall: number; // 0-100
  f1Score: number; // 0-100
  responseTime: number; // milliseconds
  decisionQuality: number; // 0-100
  errorRate: number; // 0-100
  confidenceCalibration: number; // 0-100 (how well confidence matches actual performance)
  resourceEfficiency: number; // 0-100
  timestamp: string;
  sampleSize: number;
}

export interface CognitiveProgress {
  versionId: string;
  capability: string;
  proficiencyLevel: number; // 0-100
  improvementRate: number; // percentage per time period
  benchmarkScore: number;
  comparedToVersion: string | null;
  timestamp: string;
}

export interface EvolutionTimeline {
  versions: AIVersion[];
  metricsHistory: PerformanceMetrics[];
  progressData: CognitiveProgress[];
  milestones: Array<{
    versionId: string;
    achievement: string;
    timestamp: string;
  }>;
}

export interface ComparisonReport {
  version1: string;
  version2: string;
  metricsComparison: {
    metric: string;
    version1Value: number;
    version2Value: number;
    improvement: number;
    improvementPercentage: number;
  }[];
  significantChanges: string[];
  recommendation: string;
  timestamp: string;
}

export class EvolutionTracker {
  private versions: Map<string, AIVersion> = new Map();
  private metrics: Map<string, PerformanceMetrics[]> = new Map();
  private cognitiveProgress: Map<string, CognitiveProgress[]> = new Map();
  private currentVersion: string | null = null;

  /**
   * Initialize with a base version
   */
  async initialize(): Promise<void> {
    const baseVersion = await this.createVersion({
      versionNumber: "1.0.0",
      description: "Initial AI version",
      changes: ["Base implementation"],
      parentVersionId: null,
    });

    this.currentVersion = baseVersion.versionId;
  }

  /**
   * Create a new AI version
   */
  async createVersion(data: Omit<AIVersion, "versionId" | "timestamp">): Promise<AIVersion> {
    const version: AIVersion = {
      ...data,
      versionId: `v-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
    });

    this.versions.set(version.versionId, version);

    // Store in database
    try {
      await (supabase as any).from("ai_versions").insert({
        version_id: version.versionId,
        version_number: version.versionNumber,
        description: version.description,
        changes: version.changes,
        parent_version_id: version.parentVersionId,
        timestamp: version.timestamp,
      });
    } catch (error) {
      logger.error("Failed to store version", error);
    }

    return version;
  }

  /**
   * Record performance metrics for a version
   */
  async recordMetrics(
    versionId: string,
    metrics: Omit<PerformanceMetrics, "versionId" | "timestamp">
  ): Promise<void> {
    const record: PerformanceMetrics = {
      ...metrics,
      versionId,
      timestamp: new Date().toISOString(),
    });

    if (!this.metrics.has(versionId)) {
      this.metrics.set(versionId, []);
    }
    this.metrics.get(versionId)!.push(record);

    // Store in database
    try {
      await (supabase as any).from("ai_performance_metrics").insert({
        version_id: record.versionId,
        accuracy: record.accuracy,
        precision: record.precision,
        recall: record.recall,
        f1_score: record.f1Score,
        response_time: record.responseTime,
        decision_quality: record.decisionQuality,
        error_rate: record.errorRate,
        confidence_calibration: record.confidenceCalibration,
        resource_efficiency: record.resourceEfficiency,
        sample_size: record.sampleSize,
        timestamp: record.timestamp,
      });
    } catch (error) {
      logger.error("Failed to record metrics", error);
    }
  }

  /**
   * Track cognitive progress for a capability
   */
  async trackProgress(
    versionId: string,
    capability: string,
    proficiencyLevel: number,
    comparedToVersion: string | null = null
  ): Promise<void> {
    let improvementRate = 0;

    // Calculate improvement rate if comparing to previous version
    if (comparedToVersion && this.cognitiveProgress.has(comparedToVersion)) {
      const previousProgress = this.cognitiveProgress
        .get(comparedToVersion)!
        .find(p => p.capability === capability);

      if (previousProgress) {
        improvementRate = 
          ((proficiencyLevel - previousProgress.proficiencyLevel) / 
          previousProgress.proficiencyLevel) * 100;
      }
    }

    const progress: CognitiveProgress = {
      versionId,
      capability,
      proficiencyLevel,
      improvementRate,
      benchmarkScore: proficiencyLevel,
      comparedToVersion,
      timestamp: new Date().toISOString(),
    });

    if (!this.cognitiveProgress.has(versionId)) {
      this.cognitiveProgress.set(versionId, []);
    }
    this.cognitiveProgress.get(versionId)!.push(progress);

    // Store in database
    try {
      await (supabase as any).from("ai_cognitive_progress").insert({
        version_id: progress.versionId,
        capability: progress.capability,
        proficiency_level: progress.proficiencyLevel,
        improvement_rate: progress.improvementRate,
        benchmark_score: progress.benchmarkScore,
        compared_to_version: progress.comparedToVersion,
        timestamp: progress.timestamp,
      });
    } catch (error) {
      logger.error("Failed to track progress", error);
    }
  }

  /**
   * Compare two versions
   */
  async compareVersions(
    version1Id: string,
    version2Id: string
  ): Promise<ComparisonReport> {
    const v1 = this.versions.get(version1Id);
    const v2 = this.versions.get(version2Id);

    if (!v1 || !v2) {
      throw new Error("One or both versions not found");
    }

    const v1Metrics = this.getLatestMetrics(version1Id);
    const v2Metrics = this.getLatestMetrics(version2Id);

    if (!v1Metrics || !v2Metrics) {
      throw new Error("Metrics not available for comparison");
    }

    // Compare key metrics
    const metricsComparison = [
      {
        metric: "Accuracy",
        version1Value: v1Metrics.accuracy,
        version2Value: v2Metrics.accuracy,
        improvement: v2Metrics.accuracy - v1Metrics.accuracy,
        improvementPercentage: ((v2Metrics.accuracy - v1Metrics.accuracy) / v1Metrics.accuracy) * 100,
      },
      {
        metric: "Precision",
        version1Value: v1Metrics.precision,
        version2Value: v2Metrics.precision,
        improvement: v2Metrics.precision - v1Metrics.precision,
        improvementPercentage: ((v2Metrics.precision - v1Metrics.precision) / v1Metrics.precision) * 100,
      },
      {
        metric: "Recall",
        version1Value: v1Metrics.recall,
        version2Value: v2Metrics.recall,
        improvement: v2Metrics.recall - v1Metrics.recall,
        improvementPercentage: ((v2Metrics.recall - v1Metrics.recall) / v1Metrics.recall) * 100,
      },
      {
        metric: "F1 Score",
        version1Value: v1Metrics.f1Score,
        version2Value: v2Metrics.f1Score,
        improvement: v2Metrics.f1Score - v1Metrics.f1Score,
        improvementPercentage: ((v2Metrics.f1Score - v1Metrics.f1Score) / v1Metrics.f1Score) * 100,
      },
      {
        metric: "Decision Quality",
        version1Value: v1Metrics.decisionQuality,
        version2Value: v2Metrics.decisionQuality,
        improvement: v2Metrics.decisionQuality - v1Metrics.decisionQuality,
        improvementPercentage: ((v2Metrics.decisionQuality - v1Metrics.decisionQuality) / v1Metrics.decisionQuality) * 100,
      },
      {
        metric: "Error Rate",
        version1Value: v1Metrics.errorRate,
        version2Value: v2Metrics.errorRate,
        improvement: v1Metrics.errorRate - v2Metrics.errorRate, // Lower is better
        improvementPercentage: ((v1Metrics.errorRate - v2Metrics.errorRate) / v1Metrics.errorRate) * 100,
      },
    ];

    // Identify significant changes
    const significantChanges = metricsComparison
      .filter(m => Math.abs(m.improvementPercentage) > 5)
      .map(m => 
        `${m.metric}: ${m.improvementPercentage > 0 ? "+" : ""}${m.improvementPercentage.toFixed(1)}%`
      );

    // Generate recommendation
    const avgImprovement = metricsComparison.reduce(
      (sum, m) => sum + m.improvementPercentage, 0
    ) / metricsComparison.length;

    let recommendation: string;
    if (avgImprovement > 10) {
      recommendation = `Version ${v2.versionNumber} shows significant improvement (${avgImprovement.toFixed(1)}%). Recommend deployment.`;
    } else if (avgImprovement > 0) {
      recommendation = `Version ${v2.versionNumber} shows modest improvement (${avgImprovement.toFixed(1)}%). Consider deployment based on specific needs.`;
    } else {
      recommendation = `Version ${v2.versionNumber} shows regression (${avgImprovement.toFixed(1)}%). Not recommended for deployment.`;
    }

    const report: ComparisonReport = {
      version1: v1.versionNumber,
      version2: v2.versionNumber,
      metricsComparison,
      significantChanges,
      recommendation,
      timestamp: new Date().toISOString(),
    });

    // Store comparison report
    await this.storeComparisonReport(report);

    return report;
  }

  /**
   * Get evolution timeline
   */
  getEvolutionTimeline(): EvolutionTimeline {
    const versions = Array.from(this.versions.values()).sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const metricsHistory: PerformanceMetrics[] = [];
    for (const [_, metrics] of this.metrics) {
      metricsHistory.push(...metrics);
    }
    metricsHistory.sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const progressData: CognitiveProgress[] = [];
    for (const [_, progress] of this.cognitiveProgress) {
      progressData.push(...progress);
    }

    // Identify milestones (versions with significant improvements)
    const milestones: Array<{
      versionId: string;
      achievement: string;
      timestamp: string;
    }> = [];

    for (let i = 1; i < versions.length; i++) {
      const currentMetrics = this.getLatestMetrics(versions[i].versionId);
      const previousMetrics = this.getLatestMetrics(versions[i - 1].versionId);

      if (currentMetrics && previousMetrics) {
        const accuracyImprovement = currentMetrics.accuracy - previousMetrics.accuracy;
        if (accuracyImprovement > 10) {
          milestones.push({
            versionId: versions[i].versionId,
            achievement: `Significant accuracy improvement: +${accuracyImprovement.toFixed(1)}%`,
            timestamp: versions[i].timestamp,
          });
        }
      }
    }

    return {
      versions,
      metricsHistory,
      progressData,
      milestones,
    });
  }

  /**
   * Get latest metrics for a version
   */
  private getLatestMetrics(versionId: string): PerformanceMetrics | null {
    const versionMetrics = this.metrics.get(versionId);
    if (!versionMetrics || versionMetrics.length === 0) {
      return null;
    }

    return versionMetrics[versionMetrics.length - 1];
  }

  /**
   * Store comparison report
   */
  private async storeComparisonReport(report: ComparisonReport): Promise<void> {
    try {
      await (supabase as any).from("ai_version_comparisons").insert({
        version_1: report.version1,
        version_2: report.version2,
        metrics_comparison: report.metricsComparison,
        significant_changes: report.significantChanges,
        recommendation: report.recommendation,
        timestamp: report.timestamp,
      });
    } catch (error) {
      logger.error("Failed to store comparison report", error);
    }
  }

  /**
   * Export data for audit
   */
  exportAuditData(): {
    versions: AIVersion[];
    metrics: Record<string, PerformanceMetrics[]>;
    progress: Record<string, CognitiveProgress[]>;
    summary: {
      totalVersions: number;
      firstVersion: string;
      currentVersion: string;
      overallImprovement: number;
    });
    } {
    const versions = Array.from(this.versions.values());
    const metricsData: Record<string, PerformanceMetrics[]> = {};
    const progressData: Record<string, CognitiveProgress[]> = {};

    for (const [versionId, metrics] of this.metrics) {
      metricsData[versionId] = metrics;
    }

    for (const [versionId, progress] of this.cognitiveProgress) {
      progressData[versionId] = progress;
    }

    // Calculate overall improvement
    const sortedVersions = versions.sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    let overallImprovement = 0;
    if (sortedVersions.length >= 2) {
      const firstMetrics = this.getLatestMetrics(sortedVersions[0].versionId);
      const latestMetrics = this.getLatestMetrics(
        sortedVersions[sortedVersions.length - 1].versionId
      );

      if (firstMetrics && latestMetrics) {
        overallImprovement = latestMetrics.accuracy - firstMetrics.accuracy;
      }
    }

    return {
      versions,
      metrics: metricsData,
      progress: progressData,
      summary: {
        totalVersions: versions.length,
        firstVersion: sortedVersions[0]?.versionNumber || "N/A",
        currentVersion: sortedVersions[sortedVersions.length - 1]?.versionNumber || "N/A",
        overallImprovement,
      },
    });
  }

  /**
   * Get performance trend for a metric
   */
  getPerformanceTrend(metricName: keyof PerformanceMetrics): Array<{
    versionId: string;
    versionNumber: string;
    value: number;
    timestamp: string;
  }> {
    const trend: Array<{
      versionId: string;
      versionNumber: string;
      value: number;
      timestamp: string;
    }> = [];

    for (const version of this.versions.values()) {
      const metrics = this.getLatestMetrics(version.versionId);
      if (metrics && metricName in metrics) {
        trend.push({
          versionId: version.versionId,
          versionNumber: version.versionNumber,
          value: metrics[metricName] as number,
          timestamp: metrics.timestamp,
        });
      }
    }

    return trend.sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }

  /**
   * Get cognitive capabilities summary
   */
  getCognitiveCapabilitiesSummary(): Array<{
    capability: string;
    currentLevel: number;
    trend: "improving" | "stable" | "declining";
    versionsTracked: number;
  }> {
    const capabilitiesMap = new Map<string, CognitiveProgress[]>();

    // Group progress by capability
    for (const progressList of this.cognitiveProgress.values()) {
      for (const progress of progressList) {
        if (!capabilitiesMap.has(progress.capability)) {
          capabilitiesMap.set(progress.capability, []);
        }
        capabilitiesMap.get(progress.capability)!.push(progress);
      }
    }

    const summary: Array<{
      capability: string;
      currentLevel: number;
      trend: "improving" | "stable" | "declining";
      versionsTracked: number;
    }> = [];

    for (const [capability, progressList] of capabilitiesMap) {
      const sorted = progressList.sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      const currentLevel = sorted[sorted.length - 1].proficiencyLevel;
      const avgImprovement = sorted.reduce((sum, p) => sum + p.improvementRate, 0) / sorted.length;

      let trend: "improving" | "stable" | "declining";
      if (avgImprovement > 5) {
        trend = "improving";
      } else if (avgImprovement < -5) {
        trend = "declining";
      } else {
        trend = "stable";
      }

      summary.push({
        capability,
        currentLevel,
        trend,
        versionsTracked: sorted.length,
      });
    }

    return summary;
  }

  /**
   * Set current version
   */
  setCurrentVersion(versionId: string): void {
    if (!this.versions.has(versionId)) {
      throw new Error(`Version ${versionId} not found`);
    }
    this.currentVersion = versionId;
  }

  /**
   * Get current version
   */
  getCurrentVersion(): AIVersion | null {
    if (!this.currentVersion) return null;
    return this.versions.get(this.currentVersion) || null;
  }
}

// Export singleton instance
export const evolutionTracker = new EvolutionTracker();
