/**
 * PATCH 588: Evolution Tracker
 * Tracks and documents AI behavior evolution over time
 * DEBT-FIX: Removed (supabase as any) - ai_versions/ai_cognitive_progress/ai_version_comparisons
 * don't exist. Using ai_behavior_snapshots for metrics and in-memory for versions.
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
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  responseTime: number;
  decisionQuality: number;
  errorRate: number;
  confidenceCalibration: number;
  resourceEfficiency: number;
  timestamp: string;
  sampleSize: number;
}

export interface CognitiveProgress {
  versionId: string;
  capability: string;
  proficiencyLevel: number;
  improvementRate: number;
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
   * Create a new AI version (in-memory, ai_versions table doesn't exist)
   */
  async createVersion(data: Omit<AIVersion, "versionId" | "timestamp">): Promise<AIVersion> {
    const version: AIVersion = {
      ...data,
      versionId: `v-${Date.now()}-${crypto.randomUUID().slice(0, 9)}`,
      timestamp: new Date().toISOString(),
    };

    this.versions.set(version.versionId, version);

    logger.info("AI version created", {
      versionId: version.versionId,
      versionNumber: version.versionNumber,
      description: version.description,
    });

    return version;
  }

  /**
   * Record performance metrics using ai_behavior_snapshots table
   */
  async recordMetrics(
    versionId: string,
    metrics: Omit<PerformanceMetrics, "versionId" | "timestamp">
  ): Promise<void> {
    const record: PerformanceMetrics = {
      ...metrics,
      versionId,
      timestamp: new Date().toISOString(),
    };

    if (!this.metrics.has(versionId)) {
      this.metrics.set(versionId, []);
    }
    this.metrics.get(versionId)!.push(record);

    // Store in ai_behavior_snapshots (typed table)
    try {
      await supabase.from("ai_behavior_snapshots").insert({
        module_name: `evolution-tracker-${versionId}`,
        model_version: versionId,
        snapshot_date: new Date().toISOString().split("T")[0],
        accuracy_score: record.accuracy,
        precision_score: record.precision,
        recall_score: record.recall,
        f1_score: record.f1Score,
        confidence_avg: record.confidenceCalibration,
        decisions_count: record.sampleSize,
        correct_decisions: Math.round(record.sampleSize * (record.accuracy / 100)),
        learning_rate: record.resourceEfficiency / 100,
        metadata: {
          response_time: record.responseTime,
          decision_quality: record.decisionQuality,
          error_rate: record.errorRate,
        },
      });
    } catch (error) {
      logger.error("Failed to record metrics", error);
    }
  }

  /**
   * Track cognitive progress (in-memory, ai_cognitive_progress doesn't exist)
   */
  async trackProgress(
    versionId: string,
    capability: string,
    proficiencyLevel: number,
    comparedToVersion: string | null = null
  ): Promise<void> {
    let improvementRate = 0;

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
    };

    if (!this.cognitiveProgress.has(versionId)) {
      this.cognitiveProgress.set(versionId, []);
    }
    this.cognitiveProgress.get(versionId)!.push(progress);

    logger.debug("Cognitive progress tracked", {
      versionId,
      capability,
      proficiencyLevel,
      improvementRate,
    });
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
        improvement: v1Metrics.errorRate - v2Metrics.errorRate,
        improvementPercentage: ((v1Metrics.errorRate - v2Metrics.errorRate) / v1Metrics.errorRate) * 100,
      },
    ];

    const significantChanges = metricsComparison
      .filter(m => Math.abs(m.improvementPercentage) > 5)
      .map(m => 
        `${m.metric}: ${m.improvementPercentage > 0 ? "+" : ""}${m.improvementPercentage.toFixed(1)}%`
      );

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
    };

    logger.info("Version comparison completed", {
      version1: v1.versionNumber,
      version2: v2.versionNumber,
      avgImprovement: avgImprovement.toFixed(1),
    });

    return report;
  }

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
    };
  }

  private getLatestMetrics(versionId: string): PerformanceMetrics | null {
    const versionMetrics = this.metrics.get(versionId);
    if (!versionMetrics || versionMetrics.length === 0) {
      return null;
    }

    return versionMetrics[versionMetrics.length - 1];
  }

  exportAuditData(): {
    versions: AIVersion[];
    metrics: Record<string, PerformanceMetrics[]>;
    progress: Record<string, CognitiveProgress[]>;
    summary: {
      totalVersions: number;
      firstVersion: string;
      currentVersion: string;
      overallImprovement: number;
    };
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
    };
  }

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

  getCognitiveCapabilitiesSummary(): Array<{
    capability: string;
    currentLevel: number;
    trend: "improving" | "stable" | "declining";
    versionsTracked: number;
  }> {
    const capabilities = new Map<string, CognitiveProgress[]>();

    for (const [_, progressList] of this.cognitiveProgress) {
      for (const progress of progressList) {
        if (!capabilities.has(progress.capability)) {
          capabilities.set(progress.capability, []);
        }
        capabilities.get(progress.capability)!.push(progress);
      }
    }

    return Array.from(capabilities.entries()).map(([capability, progressList]) => {
      const sorted = progressList.sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      const currentLevel = sorted[sorted.length - 1].proficiencyLevel;
      let trend: "improving" | "stable" | "declining" = "stable";

      if (sorted.length >= 2) {
        const recentChange = sorted[sorted.length - 1].proficiencyLevel - sorted[sorted.length - 2].proficiencyLevel;
        if (recentChange > 2) trend = "improving";
        else if (recentChange < -2) trend = "declining";
      }

      return {
        capability,
        currentLevel,
        trend,
        versionsTracked: sorted.length,
      };
    });
  }
}

export const evolutionTracker = new EvolutionTracker();
