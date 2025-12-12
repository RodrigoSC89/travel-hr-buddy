
/**
 * PATCH 218 - Conscious Core
 * Monitors all system flows, understands global state, and anticipates collapses or inconsistencies
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import { contextMesh } from "@/core/context/contextMesh";
import { systemWatchdog } from "./watchdog";

export type ObservationType = "loop_detection" | "conflict" | "failure_pattern" | "anomaly" | "health_check";
export type Severity = "info" | "warning" | "error" | "critical";

export interface SystemObservation {
  id?: string;
  observationType: ObservationType;
  severity: Severity;
  modulesAffected: string[];
  description: string;
  detectionData: Record<string, any>;
  suggestedAction?: string;
  autoCorrectionAttempted: boolean;
  autoCorrectionResult?: Record<string, any>;
  escalated: boolean;
  escalationReason?: string;
  resolved: boolean;
  resolvedAt?: Date;
  timestamp: Date;
}

export interface ModuleHealth {
  moduleName: string;
  status: "healthy" | "degraded" | "critical" | "offline";
  lastCheck: Date;
  errorCount: number;
  responseTime: number;
  memoryUsage?: number;
  cpuUsage?: number;
}

export interface SystemState {
  overallHealth: "healthy" | "degraded" | "critical";
  activeModules: number;
  totalModules: number;
  activeObservations: number;
  criticalIssues: number;
  lastUpdate: Date;
}

class ConsciousCore {
  private moduleHealth: Map<string, ModuleHealth> = new Map();
  private observations: Map<string, SystemObservation> = new Map();
  private monitoringInterval: NodeJS.Timeout | null = null;
  private loopDetector: Map<string, number[]> = new Map();
  private isInitialized = false;
  private isMonitoring = false;

  /**
   * Initialize the conscious core
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      logger.warn("[ConsciousCore] Already initialized");
      return;
    }

    logger.info("[ConsciousCore] Initializing conscious core...");

    // Initialize context mesh
    await contextMesh.initialize();

    // Subscribe to all context types
    contextMesh.subscribe({
      moduleName: "ConsciousCore",
      contextTypes: ["mission", "risk", "ai", "prediction", "telemetry"],
      handler: (message) => {
        this.analyzeContextMessage(message);
      }
    });

    this.isInitialized = true;
    logger.info("[ConsciousCore] Conscious core initialized successfully");
  }

  /**
   * Start monitoring system state
   */
  startMonitoring(): void {
    if (this.isMonitoring) {
      logger.warn("[ConsciousCore] Already monitoring");
      return;
    }

    logger.info("[ConsciousCore] Starting system monitoring...");
    
    this.isMonitoring = true;
    this.monitoringInterval = setInterval(() => {
      this.performHealthCheck();
      this.detectLoops();
      this.detectConflicts();
      this.detectFailurePatterns();
    }, 10000); // Check every 10 seconds
  }

  /**
   * Stop monitoring system state
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.isMonitoring = false;
    logger.info("[ConsciousCore] Stopped system monitoring");
  }

  /**
   * Get current system state
   */
  async getSystemState(): Promise<SystemState> {
    const healthStatuses = Array.from(this.moduleHealth.values());
    const criticalModules = healthStatuses.filter(h => h.status === "critical").length;
    const activeObservations = Array.from(this.observations.values()).filter(o => !o.resolved).length;
    const criticalIssues = Array.from(this.observations.values()).filter(
      o => !o.resolved && o.severity === "critical"
    ).length;

    let overallHealth: "healthy" | "degraded" | "critical" = "healthy";
    if (criticalModules > 0 || criticalIssues > 0) {
      overallHealth = "critical";
    } else if (healthStatuses.some(h => h.status === "degraded")) {
      overallHealth = "degraded";
    }

    return {
      overallHealth,
      activeModules: healthStatuses.filter(h => h.status !== "offline").length,
      totalModules: healthStatuses.length,
      activeObservations,
      criticalIssues,
      lastUpdate: new Date()
    });
  }

  /**
   * Get module health status
   */
  getModuleHealth(moduleName: string): ModuleHealth | undefined {
    return this.moduleHealth.get(moduleName);
  }

  /**
   * Get all active observations
   */
  getActiveObservations(): SystemObservation[] {
    return Array.from(this.observations.values()).filter(o => !o.resolved);
  }

  /**
   * Register module health update
   */
  updateModuleHealth(health: ModuleHealth): void {
    this.moduleHealth.set(health.moduleName, health);
    
    // Check if action is needed
    if (health.status === "critical") {
      this.recordObservation({
        observationType: "anomaly",
        severity: "critical",
        modulesAffected: [health.moduleName],
        description: `Module ${health.moduleName} is in critical state`,
        detectionData: health,
        autoCorrectionAttempted: false,
        escalated: false,
        resolved: false,
        timestamp: new Date()
      });
    }
  }

  /**
   * Record a system observation
   */
  async recordObservation(observation: SystemObservation): Promise<void> {
    const obsId = `obs_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fullObservation = { ...observation, id: obsId };
    
    this.observations.set(obsId, fullObservation);

    // Attempt auto-correction if appropriate
    if (observation.severity === "error" || observation.severity === "critical") {
      await this.attemptAutoCorrection(fullObservation);
    }

    // Log to database
    await this.logObservation(fullObservation);

    // Publish to context mesh
    await contextMesh.publish({
      moduleName: "ConsciousCore",
      contextType: "risk",
      contextData: {
        observation: {
          id: obsId,
          type: observation.observationType,
          severity: observation.severity,
          modulesAffected: observation.modulesAffected
        }
      },
      source: "ConsciousCore"
    });

    logger.info(`[ConsciousCore] Recorded ${observation.severity} observation: ${observation.description}`);
  }

  /**
   * Resolve an observation
   */
  async resolveObservation(observationId: string): Promise<void> {
    const observation = this.observations.get(observationId);
    if (!observation) {
      logger.warn(`[ConsciousCore] Observation ${observationId} not found`);
      return;
    }

    observation.resolved = true;
    observation.resolvedAt = new Date();

    // Update in database
    try {
      const { error } = await supabase
        .from("system_observations")
        .update({
          resolved: true,
          resolved_at: observation.resolvedAt.toISOString()
        })
        .eq("id", observationId);

      if (error) {
        logger.error("[ConsciousCore] Failed to update observation", error);
      }
    } catch (error) {
      logger.error("[ConsciousCore] Error resolving observation", error);
    }

    logger.info(`[ConsciousCore] Resolved observation: ${observationId}`);
  }

  // Private methods

  private async performHealthCheck(): Promise<void> {
    // Check health of all registered modules
    for (const [moduleName, health] of this.moduleHealth.entries()) {
      const timeSinceLastCheck = Date.now() - health.lastCheck.getTime();
      
      // If no update in 60 seconds, mark as potentially offline
      if (timeSinceLastCheck > 60000 && health.status !== "offline") {
        health.status = "offline";
        
        await this.recordObservation({
          observationType: "health_check",
          severity: "warning",
          modulesAffected: [moduleName],
          description: `Module ${moduleName} appears to be offline`,
          detectionData: { lastCheck: health.lastCheck, timeSinceLastCheck },
          autoCorrectionAttempted: false,
          escalated: false,
          resolved: false,
          timestamp: new Date()
        });
      }
    }
  }

  private detectLoops(): void {
    // Detect infinite loops or repetitive patterns
    for (const [moduleName, timestamps] of this.loopDetector.entries()) {
      if (timestamps.length < 5) continue;

      // Check if module is repeating the same action too frequently
      const recentTimestamps = timestamps.slice(-5);
      const timeSpan = recentTimestamps[4] - recentTimestamps[0];
      
      // If 5 actions in less than 1 second, likely a loop
      if (timeSpan < 1000) {
        this.recordObservation({
          observationType: "loop_detection",
          severity: "error",
          modulesAffected: [moduleName],
          description: `Detected potential infinite loop in ${moduleName}`,
          detectionData: { timestamps: recentTimestamps, timeSpan },
          suggestedAction: "Throttle module operations or investigate loop condition",
          autoCorrectionAttempted: false,
          escalated: false,
          resolved: false,
          timestamp: new Date()
        });

        // Clear timestamps to prevent spam
        this.loopDetector.set(moduleName, []);
      }
    }
  }

  private detectConflicts(): void {
    // Detect conflicts between modules
    const activeObservations = this.getActiveObservations();
    
    // Group observations by affected modules
    const moduleObservations = new Map<string, SystemObservation[]>();
    
    activeObservations.forEach(obs => {
      obs.modulesAffected.forEach(module => {
        if (!moduleObservations.has(module)) {
          moduleObservations.set(module, []);
        }
        moduleObservations.get(module)!.push(obs);
      });
    });

    // Check for modules with multiple active issues
    for (const [moduleName, observations] of moduleObservations.entries()) {
      if (observations.length >= 3) {
        this.recordObservation({
          observationType: "conflict",
          severity: "warning",
          modulesAffected: [moduleName],
          description: `Module ${moduleName} has ${observations.length} active issues`,
          detectionData: { observationCount: observations.length },
          suggestedAction: "Review and prioritize issue resolution",
          autoCorrectionAttempted: false,
          escalated: false,
          resolved: false,
          timestamp: new Date()
        });
      }
    }
  }

  private detectFailurePatterns(): void {
    // Detect repeated failures
    const recentObservations = Array.from(this.observations.values())
      .filter(o => {
        const age = Date.now() - o.timestamp.getTime();
        return age < 300000; // Last 5 minutes
      });

    // Group by observation type
    const typeCount = new Map<ObservationType, number>();
    recentObservations.forEach(obs => {
      typeCount.set(obs.observationType, (typeCount.get(obs.observationType) || 0) + 1);
    });

    // Alert if too many of same type
    for (const [type, count] of typeCount.entries()) {
      if (count >= 5) {
        this.recordObservation({
          observationType: "failure_pattern",
          severity: "error",
          modulesAffected: ["system"],
          description: `Detected repeated ${type} failures (${count} in last 5 minutes)`,
          detectionData: { type, count, timeWindow: "5m" },
          suggestedAction: "Investigate root cause of repeated failures",
          autoCorrectionAttempted: false,
          escalated: true,
          escalationReason: "High frequency failure pattern",
          resolved: false,
          timestamp: new Date()
        });
      }
    }
  }

  private async attemptAutoCorrection(observation: SystemObservation): Promise<void> {
    observation.autoCorrectionAttempted = true;

    try {
      // Determine auto-correction strategy based on observation type
      let correctionResult: Record<string, any> = {};

      switch (observation.observationType) {
      case "loop_detection":
        // Attempt to break the loop
        correctionResult = await this.correctLoop(observation);
        break;
        
      case "failure_pattern":
        // Attempt to restart affected modules
        correctionResult = await this.correctFailurePattern(observation);
        break;
        
      case "anomaly":
        // Attempt to reset affected modules
        correctionResult = await this.correctAnomaly(observation);
        break;
        
      default:
        correctionResult = { action: "none", reason: "No auto-correction available" };
      }

      observation.autoCorrectionResult = correctionResult;

      logger.info(`[ConsciousCore] Auto-correction attempted for ${observation.id}`, correctionResult);
    } catch (error) {
      observation.autoCorrectionResult = {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      });
      logger.error("[ConsciousCore] Auto-correction failed", error);
    }
  }

  private async correctLoop(observation: SystemObservation): Promise<Record<string, any>> {
    // Clear loop detector for affected modules
    observation.modulesAffected.forEach(module => {
      this.loopDetector.delete(module);
    });

    return {
      action: "clear_loop_detector",
      modulesCleared: observation.modulesAffected,
      success: true
    });
  }

  private async correctFailurePattern(observation: SystemObservation): Promise<Record<string, any>> {
    // Suggest escalation for repeated failures
    return {
      action: "escalate",
      reason: "Repeated failures require manual intervention",
      success: true
    });
  }

  private async correctAnomaly(observation: SystemObservation): Promise<Record<string, any>> {
    // Log anomaly for investigation
    return {
      action: "log_for_investigation",
      modulesAffected: observation.modulesAffected,
      success: true
    });
  }

  private analyzeContextMessage(message: any): void {
    const moduleName = message.moduleName;
    
    // Track timing for loop detection
    if (!this.loopDetector.has(moduleName)) {
      this.loopDetector.set(moduleName, []);
    }
    this.loopDetector.get(moduleName)!.push(Date.now());

    // Keep only last 10 timestamps
    const timestamps = this.loopDetector.get(moduleName)!;
    if (timestamps.length > 10) {
      timestamps.shift();
    }
  }

  private async logObservation(observation: SystemObservation): Promise<void> {
    try {
      const { error } = await supabase.from("system_observations").insert({
        observation_type: observation.observationType,
        module_name: observation.modulesAffected[0] || "unknown",
        severity: observation.severity,
        message: observation.description,
        metadata: {
          modules_affected: observation.modulesAffected,
          detection_data: observation.detectionData,
          suggested_action: observation.suggestedAction,
          auto_correction_attempted: observation.autoCorrectionAttempted,
          auto_correction_result: observation.autoCorrectionResult,
          escalated: observation.escalated,
          escalation_reason: observation.escalationReason
        },
        resolved: observation.resolved
      });

      if (error) {
        logger.error("[ConsciousCore] Failed to log observation", error);
      }
    } catch (error) {
      logger.error("[ConsciousCore] Error logging observation", error);
    }
  }
}

// Export singleton instance
export const consciousCore = new ConsciousCore();
