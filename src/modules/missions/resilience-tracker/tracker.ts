// @ts-nocheck
/**
 * PATCH 579 - Mission Resilience Tracker
 * Track mission resilience based on failures, responses, and recovery
 * 
 * Features:
 * - Track failures, responses, and recovery times
 * - Calculate resilience index per mission
 * - Generate event-based reports
 * - Integration with Tactical Response and Situational Awareness
 * - Exportable reports (JSON, CSV, PDF)
 */

import { BridgeLink } from "@/core/BridgeLink";
import { situationalAwareness } from "@/ai/situational-awareness";
import { tacticalResponse } from "@/ai/tactical-response";
import {
  FailureEvent,
  ResponseAction,
  RecoveryMetrics,
  MissionResilienceIndex,
  ResilienceComponents,
  EventReport,
  ResilienceTrendPoint,
  ResilienceTrackerConfig,
  FailureSeverity,
  ResponseEffectiveness,
  RecoveryStatus,
} from "./types";

/**
 * Mission Resilience Tracker class
 */
export class MissionResilienceTracker {
  private static instances: Map<string, MissionResilienceTracker> = new Map();
  
  private config: ResilienceTrackerConfig;
  private failures: Map<string, FailureEvent> = new Map();
  private responses: Map<string, ResponseAction[]> = new Map();
  private recoveries: Map<string, RecoveryMetrics> = new Map();
  private resilienceHistory: ResilienceTrendPoint[] = [];
  private currentIndex: MissionResilienceIndex | null = null;
  private reportGenerationTimer: NodeJS.Timeout | null = null;

  private constructor(config: ResilienceTrackerConfig) {
    this.config = config;
  }

  /**
   * Get or create tracker instance for a mission
   */
  public static getInstance(config: ResilienceTrackerConfig): MissionResilienceTracker {
    const existing = MissionResilienceTracker.instances.get(config.missionId);
    if (existing) {
      return existing;
    }

    const instance = new MissionResilienceTracker(config);
    MissionResilienceTracker.instances.set(config.missionId, instance);
    return instance;
  }

  /**
   * Initialize the tracker
   */
  public async initialize(): Promise<void> {
    // Set up event listeners for integrations
    if (this.config.integrations.situationalAwareness) {
      this.setupSituationalAwarenessIntegration();
    }

    if (this.config.integrations.tacticalResponse) {
      this.setupTacticalResponseIntegration();
    }

    // Start real-time tracking if enabled
    if (this.config.enableRealTimeTracking) {
      this.startRealTimeTracking();
    }

    // Calculate initial resilience index
    await this.calculateResilienceIndex();

    console.log(`[ResilienceTracker] Initialized for mission ${this.config.missionId}`);
    
    BridgeLink.emit("resilience-tracker:initialized", "ResilienceTracker", {
      missionId: this.config.missionId,
      timestamp: Date.now(),
    });
  }

  /**
   * Record a failure event
   */
  public async recordFailure(failure: FailureEvent): Promise<void> {
    this.failures.set(failure.id, failure);
    
    console.log(`[ResilienceTracker] Recorded failure: ${failure.description}`);
    
    // Initialize response array for this failure
    this.responses.set(failure.id, []);
    
    // Recalculate resilience index
    await this.calculateResilienceIndex();
    
    // Check if alert thresholds are exceeded
    this.checkAlertThresholds();
    
    BridgeLink.emit("resilience-tracker:failure-recorded", "ResilienceTracker", {
      missionId: this.config.missionId,
      failureId: failure.id,
      severity: failure.severity,
      timestamp: Date.now(),
    });
  }

  /**
   * Record a response action
   */
  public async recordResponse(response: ResponseAction): Promise<void> {
    const failureResponses = this.responses.get(response.failureEventId) || [];
    failureResponses.push(response);
    this.responses.set(response.failureEventId, failureResponses);
    
    console.log(`[ResilienceTracker] Recorded response: ${response.description}`);
    
    // Recalculate resilience index
    await this.calculateResilienceIndex();
    
    BridgeLink.emit("resilience-tracker:response-recorded", "ResilienceTracker", {
      missionId: this.config.missionId,
      failureId: response.failureEventId,
      responseId: response.id,
      timestamp: Date.now(),
    });
  }

  /**
   * Record recovery metrics
   */
  public async recordRecovery(recovery: RecoveryMetrics): Promise<void> {
    this.recoveries.set(recovery.failureEventId, recovery);
    
    console.log(`[ResilienceTracker] Recorded recovery for failure ${recovery.failureEventId}`);
    
    // Recalculate resilience index
    await this.calculateResilienceIndex();
    
    // Check recovery time threshold
    if (recovery.recoveryDuration && recovery.recoveryDuration > this.config.alertThresholds.maxRecoveryTime) {
      BridgeLink.emit("resilience-tracker:recovery-threshold-exceeded", "ResilienceTracker", {
        missionId: this.config.missionId,
        failureId: recovery.failureEventId,
        recoveryDuration: recovery.recoveryDuration,
        threshold: this.config.alertThresholds.maxRecoveryTime,
      });
    }
    
    BridgeLink.emit("resilience-tracker:recovery-recorded", "ResilienceTracker", {
      missionId: this.config.missionId,
      failureId: recovery.failureEventId,
      status: recovery.status,
      timestamp: Date.now(),
    });
  }

  /**
   * Calculate mission resilience index
   */
  public async calculateResilienceIndex(): Promise<MissionResilienceIndex> {
    const components = this.calculateResilienceComponents();
    
    // Calculate overall score (weighted average)
    const weights = {
      failurePrevention: 0.25,
      responseEffectiveness: 0.25,
      recoverySpeed: 0.25,
      systemRedundancy: 0.15,
      crewReadiness: 0.10,
    };
    
    const overallScore =
      components.failurePreventionScore * weights.failurePrevention +
      components.responseEffectivenessScore * weights.responseEffectiveness +
      components.recoverySpeedScore * weights.recoverySpeed +
      components.systemRedundancyScore * weights.systemRedundancy +
      components.crewReadinessScore * weights.crewReadiness;
    
    // Calculate trend
    const previousScore = this.currentIndex?.overallScore || overallScore;
    const scoreDiff = overallScore - previousScore;
    let trend: "improving" | "stable" | "declining" = "stable";
    
    if (Math.abs(scoreDiff) > 5) {
      trend = scoreDiff > 0 ? "improving" : "declining";
    }
    
    const trendPercentage = previousScore > 0 ? (scoreDiff / previousScore) * 100 : 0;
    
    // Calculate failure statistics
    const failures = Array.from(this.failures.values());
    const criticalFailures = failures.filter(f => f.severity === "critical").length;
    
    // Calculate recovery statistics
    const recoveries = Array.from(this.recoveries.values());
    const completedRecoveries = recoveries.filter(r => r.status === "recovered");
    const failedRecoveries = recoveries.filter(r => r.status === "failed");
    
    const averageRecoveryTime = completedRecoveries.length > 0
      ? completedRecoveries.reduce((sum, r) => sum + (r.recoveryDuration || 0), 0) / completedRecoveries.length
      : 0;
    
    const index: MissionResilienceIndex = {
      missionId: this.config.missionId,
      timestamp: Date.now(),
      overallScore,
      components,
      trend,
      trendPercentage,
      totalFailures: failures.length,
      criticalFailures,
      averageRecoveryTime,
      successfulRecoveries: completedRecoveries.length,
      failedRecoveries: failedRecoveries.length,
    };
    
    this.currentIndex = index;
    
    // Add to history
    this.resilienceHistory.push({
      timestamp: index.timestamp,
      score: index.overallScore,
      eventCount: failures.length,
      recoveryRate: failures.length > 0 
        ? completedRecoveries.length / failures.length 
        : 1.0,
    });
    
    // Keep history manageable
    if (this.resilienceHistory.length > 10000) {
      this.resilienceHistory = this.resilienceHistory.slice(-5000);
    }
    
    BridgeLink.emit("resilience-tracker:index-updated", "ResilienceTracker", {
      missionId: this.config.missionId,
      score: overallScore,
      trend,
      timestamp: Date.now(),
    });
    
    return index;
  }

  /**
   * Calculate resilience components
   */
  private calculateResilienceComponents(): ResilienceComponents {
    const failures = Array.from(this.failures.values());
    const allResponses = Array.from(this.responses.values()).flat();
    const recoveries = Array.from(this.recoveries.values());
    
    // Failure Prevention Score: based on failure frequency and severity
    const recentPeriod = Date.now() - 24 * 60 * 60 * 1000; // Last 24 hours
    const recentFailures = failures.filter(f => f.timestamp > recentPeriod);
    const criticalRecentFailures = recentFailures.filter(f => f.severity === "critical").length;
    
    const failurePreventionScore = Math.max(0, 100 - (recentFailures.length * 10) - (criticalRecentFailures * 20));
    
    // Response Effectiveness Score: based on response success and speed
    const successfulResponses = allResponses.filter(r => r.success).length;
    const responseEffectivenessScore = allResponses.length > 0
      ? (successfulResponses / allResponses.length) * 100
      : 100;
    
    // Recovery Speed Score: based on average recovery time
    const completedRecoveries = recoveries.filter(r => r.status === "recovered");
    const avgRecoveryTime = completedRecoveries.length > 0
      ? completedRecoveries.reduce((sum, r) => sum + (r.recoveryDuration || 0), 0) / completedRecoveries.length
      : 0;
    
    // Score based on recovery time (faster is better)
    // Target: < 30 min = 100, > 2 hours = 0
    const targetTime = 30 * 60 * 1000; // 30 minutes
    const maxTime = 2 * 60 * 60 * 1000; // 2 hours
    const recoverySpeedScore = avgRecoveryTime === 0 ? 100 :
      Math.max(0, 100 - ((avgRecoveryTime - targetTime) / (maxTime - targetTime)) * 100);
    
    // System Redundancy Score: based on system diversity in failures
    const affectedSystems = new Set(failures.flatMap(f => f.affectedSystems));
    const systemRedundancyScore = Math.max(0, 100 - (affectedSystems.size * 5));
    
    // Crew Readiness Score: based on crew-initiated successful responses
    const crewResponses = allResponses.filter(r => r.initiatedBy === "crew");
    const successfulCrewResponses = crewResponses.filter(r => r.success).length;
    const crewReadinessScore = crewResponses.length > 0
      ? (successfulCrewResponses / crewResponses.length) * 100
      : 80; // Default score if no crew responses yet
    
    return {
      failurePreventionScore,
      responseEffectivenessScore,
      recoverySpeedScore,
      systemRedundancyScore,
      crewReadinessScore,
    };
  }

  /**
   * Generate event-based report
   */
  public async generateReport(
    startTime?: number,
    endTime?: number
  ): Promise<EventReport> {
    const end = endTime || Date.now();
    const start = startTime || end - 24 * 60 * 60 * 1000; // Last 24 hours by default
    
    const periodFailures = Array.from(this.failures.values()).filter(
      f => f.timestamp >= start && f.timestamp <= end
    );
    
    // Aggregate statistics
    const eventsByCategory: Record<string, number> = {};
    const eventsBySeverity: Record<FailureSeverity, number> = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    };
    
    periodFailures.forEach(failure => {
      eventsByCategory[failure.category] = (eventsByCategory[failure.category] || 0) + 1;
      eventsBySeverity[failure.severity]++;
    });
    
    // Calculate average response and recovery times
    const periodResponses = Array.from(this.responses.entries())
      .filter(([failureId]) => {
        const failure = this.failures.get(failureId);
        return failure && failure.timestamp >= start && failure.timestamp <= end;
      })
      .flatMap(([, responses]) => responses);
    
    const averageResponseTime = periodResponses.length > 0
      ? periodResponses.reduce((sum, r) => sum + r.duration, 0) / periodResponses.length
      : 0;
    
    const periodRecoveries = Array.from(this.recoveries.entries())
      .filter(([failureId]) => {
        const failure = this.failures.get(failureId);
        return failure && failure.timestamp >= start && failure.timestamp <= end;
      })
      .map(([, recovery]) => recovery);
    
    const averageRecoveryTime = periodRecoveries.length > 0
      ? periodRecoveries.reduce((sum, r) => sum + (r.recoveryDuration || 0), 0) / periodRecoveries.length
      : 0;
    
    // Build event details
    const events = periodFailures.map(failure => {
      const responses = this.responses.get(failure.id) || [];
      const recovery = this.recoveries.get(failure.id);
      
      // Calculate resilience impact
      const severityImpact = {
        critical: -30,
        high: -20,
        medium: -10,
        low: -5,
      };
      
      const responseBonus = responses.filter(r => r.success).length * 5;
      const recoveryBonus = recovery?.status === "recovered" ? 10 : 0;
      
      const resilienceImpact = severityImpact[failure.severity] + responseBonus + recoveryBonus;
      
      return {
        failure,
        responses,
        recovery,
        resilienceImpact,
      };
    });
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(events);
    
    const report: EventReport = {
      id: `report-${Date.now()}`,
      missionId: this.config.missionId,
      generatedAt: Date.now(),
      period: { start, end },
      summary: {
        totalEvents: periodFailures.length,
        eventsByCategory,
        eventsBySeverity,
        averageResponseTime,
        averageRecoveryTime,
      },
      events,
      recommendations,
    };
    
    console.log(`[ResilienceTracker] Generated report for mission ${this.config.missionId}`);
    
    BridgeLink.emit("resilience-tracker:report-generated", "ResilienceTracker", {
      missionId: this.config.missionId,
      reportId: report.id,
      eventCount: periodFailures.length,
      timestamp: Date.now(),
    });
    
    return report;
  }

  /**
   * Generate recommendations based on events
   */
  private generateRecommendations(events: EventReport["events"]): string[] {
    const recommendations: string[] = [];
    
    // Check for recurring failures
    const categoryCount: Record<string, number> = {};
    events.forEach(e => {
      categoryCount[e.failure.category] = (categoryCount[e.failure.category] || 0) + 1;
    });
    
    Object.entries(categoryCount).forEach(([category, count]) => {
      if (count >= 3) {
        recommendations.push(
          `High frequency of ${category} failures detected (${count} occurrences). Consider preventive maintenance or system upgrade.`
        );
      }
    });
    
    // Check for slow responses
    const slowResponses = events.filter(e => 
      e.responses.some(r => r.duration > 5 * 60 * 1000) // > 5 minutes
    );
    
    if (slowResponses.length > events.length * 0.3) {
      recommendations.push(
        "Response times are consistently slow. Review and optimize response procedures."
      );
    }
    
    // Check for failed recoveries
    const failedRecoveries = events.filter(e => e.recovery?.status === "failed");
    
    if (failedRecoveries.length > 0) {
      recommendations.push(
        `${failedRecoveries.length} recovery attempt(s) failed. Review recovery procedures and system redundancy.`
      );
    }
    
    // Check for critical failures
    const criticalFailures = events.filter(e => e.failure.severity === "critical");
    
    if (criticalFailures.length > 0) {
      recommendations.push(
        `${criticalFailures.length} critical failure(s) occurred. Immediate review and corrective action required.`
      );
    }
    
    if (recommendations.length === 0) {
      recommendations.push("System resilience is within acceptable parameters. Continue monitoring.");
    }
    
    return recommendations;
  }

  /**
   * Export report to various formats
   */
  public async exportReport(report: EventReport, format: "json" | "csv" | "pdf"): Promise<string> {
    switch (format) {
    case "json":
      return JSON.stringify(report, null, 2);
      
    case "csv":
      return this.exportToCsv(report);
      
    case "pdf":
      // PDF export would require a PDF library
      // For now, return a placeholder
      return `PDF export for report ${report.id} (implementation pending)`;
      
    default:
      throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Export report to CSV
   */
  private exportToCsv(report: EventReport): string {
    const rows: string[] = [];
    
    // Header
    rows.push("Timestamp,Category,Severity,Description,Responses,Recovery Status,Recovery Time,Resilience Impact");
    
    // Data rows
    report.events.forEach(event => {
      const row = [
        new Date(event.failure.timestamp).toISOString(),
        event.failure.category,
        event.failure.severity,
        `"${event.failure.description}"`,
        event.responses.length,
        event.recovery?.status || "N/A",
        event.recovery?.recoveryDuration || "N/A",
        event.resilienceImpact,
      ].join(",");
      rows.push(row);
    });
    
    return rows.join("\n");
  }

  /**
   * Get current resilience index
   */
  public getCurrentIndex(): MissionResilienceIndex | null {
    return this.currentIndex;
  }

  /**
   * Get resilience history
   */
  public getHistory(limit = 100): ResilienceTrendPoint[] {
    return this.resilienceHistory.slice(-limit);
  }

  /**
   * Set up Situational Awareness integration
   */
  private setupSituationalAwarenessIntegration(): void {
    BridgeLink.on("situational-awareness:analysis-complete", async (_source, data) => {
      const state = situationalAwareness.getCurrentState();
      
      // Check for critical alerts that might indicate failures
      state.activeAlerts
        .filter(alert => alert.severity === "critical" || alert.severity === "high")
        .forEach(async alert => {
          const failure: FailureEvent = {
            id: `failure-${alert.id}`,
            missionId: this.config.missionId,
            timestamp: alert.timestamp,
            severity: alert.severity as FailureSeverity,
            category: alert.affectedSystems[0] || "unknown",
            description: alert.title,
            affectedSystems: alert.affectedSystems,
            detected_by: "ai",
            context: { alert },
          };
          
          await this.recordFailure(failure);
        });
    });
  }

  /**
   * Set up Tactical Response integration
   */
  private setupTacticalResponseIntegration(): void {
    BridgeLink.on("tactical-response:execution-complete", async (_source, data) => {
      const execution = data as any;
      
      if (execution.status === "success" || execution.status === "failed") {
        const response: ResponseAction = {
          id: execution.executionId,
          failureEventId: execution.eventId || "unknown",
          timestamp: Date.now(),
          initiatedBy: "ai",
          actionType: "tactical_response",
          description: `Tactical response executed: ${execution.ruleId}`,
          success: execution.status === "success",
          duration: execution.duration || 0,
          effectiveness: execution.status === "success" ? "good" : "poor",
        };
        
        // Only record if we have a corresponding failure
        if (this.failures.has(response.failureEventId)) {
          await this.recordResponse(response);
        }
      }
    });
  }

  /**
   * Start real-time tracking
   */
  private startRealTimeTracking(): void {
    if (this.reportGenerationTimer) {
      return;
    }
    
    this.reportGenerationTimer = setInterval(
      async () => {
        await this.calculateResilienceIndex();
      },
      this.config.reportGenerationInterval
    );
    
    console.log(`[ResilienceTracker] Real-time tracking started for mission ${this.config.missionId}`);
  }

  /**
   * Stop real-time tracking
   */
  public stopRealTimeTracking(): void {
    if (this.reportGenerationTimer) {
      clearInterval(this.reportGenerationTimer);
      this.reportGenerationTimer = null;
      console.log(`[ResilienceTracker] Real-time tracking stopped for mission ${this.config.missionId}`);
    }
  }

  /**
   * Check alert thresholds
   */
  private checkAlertThresholds(): void {
    if (!this.currentIndex) return;
    
    const { overallScore, trendPercentage } = this.currentIndex;
    
    // Check critical score drop
    if (Math.abs(trendPercentage) > this.config.alertThresholds.criticalScoreDrop) {
      BridgeLink.emit("resilience-tracker:critical-drop-alert", "ResilienceTracker", {
        missionId: this.config.missionId,
        score: overallScore,
        drop: trendPercentage,
        timestamp: Date.now(),
      });
    }
    
    // Check minimum acceptable score
    if (overallScore < this.config.alertThresholds.minAcceptableScore) {
      BridgeLink.emit("resilience-tracker:low-score-alert", "ResilienceTracker", {
        missionId: this.config.missionId,
        score: overallScore,
        threshold: this.config.alertThresholds.minAcceptableScore,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Cleanup
   */
  public cleanup(): void {
    this.stopRealTimeTracking();
    this.failures.clear();
    this.responses.clear();
    this.recoveries.clear();
    this.resilienceHistory = [];
    this.currentIndex = null;
    
    MissionResilienceTracker.instances.delete(this.config.missionId);
    
    BridgeLink.emit("resilience-tracker:cleanup", "ResilienceTracker", {
      missionId: this.config.missionId,
      timestamp: Date.now(),
    });
  }
}

// Export helper function
export const getResilienceTracker = (config: ResilienceTrackerConfig): MissionResilienceTracker => {
  return MissionResilienceTracker.getInstance(config);
};
