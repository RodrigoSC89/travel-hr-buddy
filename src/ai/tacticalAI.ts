/**
 * PATCH 207.0 - Tactical AI Core
 * Tactical decision system that acts on alerts, predictions or context
 * to make real-time operational decisions
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import { predictiveEngine, ModuleRiskScore } from "./predictiveEngine";
import { systemWatchdog } from "./watchdog";

export type TacticalAction = 
  | "restart_module"
  | "shift_load"
  | "scale_up"
  | "scale_down"
  | "notify_human"
  | "enable_fallback"
  | "disable_feature"
  | "clear_cache"
  | "no_action";

export type DecisionPriority = "low" | "medium" | "high" | "critical";

export interface TacticalDecision {
  id: string;
  timestamp: Date;
  moduleName: string;
  action: TacticalAction;
  priority: DecisionPriority;
  reason: string;
  context: Record<string, any>;
  executed: boolean;
  success?: boolean;
  error?: string;
  manualOverride?: boolean;
}

export interface DecisionRule {
  id: string;
  name: string;
  condition: (context: TacticalContext) => boolean;
  action: TacticalAction;
  priority: DecisionPriority;
  requiresConfirmation: boolean;
}

export interface TacticalContext {
  moduleName: string;
  prediction?: ModuleRiskScore;
  watchdogAlerts: any[];
  activeModules: string[];
  systemLoad: number;
  recentDecisions: TacticalDecision[];
}

class TacticalAI {
  private isActive = false;
  private decisionQueue: TacticalDecision[] = [];
  private executionInterval: NodeJS.Timeout | null = null;
  private rules: DecisionRule[] = [];
  private manualOverrides = new Map<string, boolean>();

  constructor() {
    this.initializeRules();
  }

  /**
   * Initialize decision rules
   */
  private initializeRules(): void {
    this.rules = [
      // Critical: Restart module on critical risk
      {
        id: "restart-critical",
        name: "Restart Module on Critical Risk",
        condition: (ctx) => {
          return ctx.prediction?.riskLevel === "critical" && 
                 ctx.prediction.forecastEvent === "incident";
        },
        action: "restart_module",
        priority: "critical",
        requiresConfirmation: false,
      },

      // High: Enable fallback on predicted downtime
      {
        id: "fallback-downtime",
        name: "Enable Fallback on Downtime Prediction",
        condition: (ctx) => {
          return ctx.prediction?.forecastEvent === "downtime" &&
                 (ctx.prediction?.riskScore ?? 0) >= 60;
        },
        action: "enable_fallback",
        priority: "high",
        requiresConfirmation: false,
      },

      // High: Scale up on overload prediction
      {
        id: "scale-overload",
        name: "Scale Up on Overload Prediction",
        condition: (ctx) => {
          return ctx.prediction?.forecastEvent === "overload" &&
                 ctx.prediction.confidence > 0.7;
        },
        action: "scale_up",
        priority: "high",
        requiresConfirmation: true,
      },

      // Medium: Notify human on high risk
      {
        id: "notify-high-risk",
        name: "Notify Human on High Risk",
        condition: (ctx) => {
          return ctx.prediction?.riskLevel === "high" &&
                 !ctx.recentDecisions.some(d => 
                   d.moduleName === ctx.moduleName && 
                   d.action === "notify_human" &&
                   Date.now() - d.timestamp.getTime() < 30 * 60 * 1000 // 30 min
                 );
        },
        action: "notify_human",
        priority: "medium",
        requiresConfirmation: false,
      },

      // Medium: Clear cache on multiple errors
      {
        id: "clear-cache-errors",
        name: "Clear Cache on Multiple Errors",
        condition: (ctx) => {
          return ctx.watchdogAlerts.length > 5 &&
                 (ctx.prediction?.riskScore ?? 0) > 40;
        },
        action: "clear_cache",
        priority: "medium",
        requiresConfirmation: false,
      },

      // Low: Shift load to backup
      {
        id: "shift-load-backup",
        name: "Shift Load to Backup",
        condition: (ctx) => {
          return ctx.prediction?.riskLevel === "high" &&
                 ctx.systemLoad > 0.8 &&
                 ctx.activeModules.length > 1;
        },
        action: "shift_load",
        priority: "low",
        requiresConfirmation: true,
      },
    ];
  }

  /**
   * Start tactical AI
   */
  start(): void {
    if (this.isActive) {
      logger.warn("[TacticalAI] Already running");
      return;
    }

    this.isActive = true;
    logger.info("[TacticalAI] Starting Tactical AI Core...");

    // Process decision queue periodically
    this.executionInterval = setInterval(() => {
      this.processDecisionQueue();
    }, 10000); // Every 10 seconds

    logger.info("[TacticalAI] Tactical AI Core is active");
  }

  /**
   * Stop tactical AI
   */
  stop(): void {
    if (!this.isActive) return;

    this.isActive = false;
    if (this.executionInterval) {
      clearInterval(this.executionInterval);
      this.executionInterval = null;
    }

    logger.info("[TacticalAI] Tactical AI stopped");
  }

  /**
   * Evaluate and make tactical decision
   */
  async evaluateAndDecide(moduleName: string): Promise<TacticalDecision[]> {
    logger.info(`[TacticalAI] Evaluating tactical decisions for: ${moduleName}`);

    try {
      // Build context
      const context = await this.buildContext(moduleName);

      // Check manual override
      if (this.manualOverrides.has(moduleName)) {
        logger.info(`[TacticalAI] Manual override active for ${moduleName}`);
        return [];
      }

      // Evaluate rules
      const decisions: TacticalDecision[] = [];
      for (const rule of this.rules) {
        try {
          if (rule.condition(context)) {
            const decision = this.createDecision(moduleName, rule, context);
            decisions.push(decision);
            
            // Add to queue if doesn't require confirmation
            if (!rule.requiresConfirmation) {
              this.decisionQueue.push(decision);
            }

            // Save to audit trail
            await this.saveDecision(decision);
          }
        } catch (error) {
          logger.error(`[TacticalAI] Error evaluating rule ${rule.id}:`, error);
        }
      }

      return decisions;
    } catch (error) {
      logger.error(`[TacticalAI] Failed to evaluate decisions for ${moduleName}:`, error);
      return [];
    }
  }

  /**
   * Build decision context
   */
  private async buildContext(moduleName: string): Promise<TacticalContext> {
    // Get prediction
    const prediction = await predictiveEngine.predictModuleRisk(moduleName);

    // Get watchdog alerts
    const watchdogStats = systemWatchdog.getStats();
    const watchdogAlerts: any[] = []; // Would fetch from watchdog

    // Get active modules
    const { data: activeModulesData } = await (supabase as any)
      .from("system_metrics")
      .select("metric_name")
      .gte("recorded_at", new Date(Date.now() - 5 * 60 * 1000).toISOString());
    
    const activeModules = [...new Set(((activeModulesData as any[]) || []).map((m: any) => String(m.metric_name)))] as string[];

    // Calculate system load (simplified)
    const systemLoad = Math.min(watchdogStats.totalErrors / 10, 1);

    // Get recent decisions
    const { data: recentDecisionsData } = await (supabase as any)
      .from("tactical_decisions")
      .select("*")
      .eq("module_name", moduleName)
      .gte("created_at", new Date(Date.now() - 60 * 60 * 1000).toISOString())
      .order("created_at", { ascending: false })
      .limit(10);

    const recentDecisions: TacticalDecision[] = ((recentDecisionsData || []) as any[]).map((d: any) => ({
      id: d.id || d.decision_id || "",
      timestamp: new Date(d.created_at || Date.now()),
      moduleName: d.module_name || "",
      action: (d.action_taken || "no_action") as TacticalAction,
      priority: (d.priority || "low") as DecisionPriority,
      reason: d.trigger_type || "Unknown",
      context: typeof d.context === "object" && d.context !== null ? d.context : {},
      executed: d.executed_at != null,
      success: d.success ?? undefined,
      error: d.error_message ?? undefined,
      manualOverride: d.override_by != null,
    }));

    return {
      moduleName,
      prediction,
      watchdogAlerts,
      activeModules,
      systemLoad,
      recentDecisions,
    });
  }

  /**
   * Create decision from rule
   */
  private createDecision(
    moduleName: string,
    rule: DecisionRule,
    context: TacticalContext
  ): TacticalDecision {
    return {
      id: this.generateDecisionId(),
      timestamp: new Date(),
      moduleName,
      action: rule.action,
      priority: rule.priority,
      reason: `Rule: ${rule.name}`,
      context: {
        riskScore: context.prediction?.riskScore,
        forecastEvent: context.prediction?.forecastEvent,
        systemLoad: context.systemLoad,
      },
      executed: false,
    });
  }

  /**
   * Generate unique decision ID
   */
  private generateDecisionId(): string {
    return `decision-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Save decision to audit trail
   */
  private async saveDecision(decision: TacticalDecision): Promise<void> {
    try {
      const { error } = await (supabase as any)
        .from("tactical_decisions")
        .insert({
          decision_id: decision.id,
          module_name: decision.moduleName,
          action_taken: decision.action,
          trigger_type: "ai_prediction",
          priority: decision.priority,
          context: decision.context,
          success: decision.success,
          created_at: decision.timestamp.toISOString(),
        });

      if (error) {
        logger.error("[TacticalAI] Failed to save decision:", error);
      }
    } catch (error) {
      logger.error("[TacticalAI] Error saving decision:", error);
    }
  }

  /**
   * Process decision queue
   */
  private async processDecisionQueue(): Promise<void> {
    if (!this.isActive || this.decisionQueue.length === 0) return;

    logger.info(`[TacticalAI] Processing ${this.decisionQueue.length} decisions...`);

    // Sort by priority
    this.decisionQueue.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    // Process top priority decision
    const decision = this.decisionQueue.shift();
    if (!decision) return;

    await this.executeDecision(decision);
  }

  /**
   * Execute a tactical decision
   */
  private async executeDecision(decision: TacticalDecision): Promise<void> {
    logger.info(`[TacticalAI] Executing decision: ${decision.action} for ${decision.moduleName}`);

    try {
      let success = false;

      switch (decision.action) {
      case "restart_module":
        success = await this.restartModule(decision.moduleName);
        break;

      case "shift_load":
        success = await this.shiftLoad(decision.moduleName);
        break;

      case "scale_up":
        success = await this.scaleUp(decision.moduleName);
        break;

      case "scale_down":
        success = await this.scaleDown(decision.moduleName);
        break;

      case "enable_fallback":
        success = await this.enableFallback(decision.moduleName);
        break;

      case "disable_feature":
        success = await this.disableFeature(decision.moduleName);
        break;

      case "clear_cache":
        success = await this.clearCache(decision.moduleName);
        break;

      case "notify_human":
        success = await this.notifyHuman(decision);
        break;

      default:
        logger.warn(`[TacticalAI] Unknown action: ${decision.action}`);
        success = false;
      }

      // Update decision status
      decision.executed = true;
      decision.success = success;

      // Update in database
      await supabase
        .from("tactical_decisions")
        .update({
          executed: true,
          success,
          executed_at: new Date().toISOString(),
        })
        .eq("id", decision.id);

      logger.info(`[TacticalAI] Decision executed: ${success ? "SUCCESS" : "FAILED"}`);
    } catch (error) {
      decision.executed = true;
      decision.success = false;
      decision.error = error instanceof Error ? error.message : "Unknown error";

      logger.error("[TacticalAI] Failed to execute decision:", error);

      // Update with error
      await supabase
        .from("tactical_decisions")
        .update({
          executed: true,
          success: false,
          error: decision.error,
          executed_at: new Date().toISOString(),
        })
        .eq("id", decision.id);
    }
  }

  /**
   * Action: Restart module
   */
  private async restartModule(moduleName: string): Promise<boolean> {
    logger.info(`[TacticalAI] Restarting module: ${moduleName}`);
    // Implementation would trigger actual module restart
    return true;
  }

  /**
   * Action: Shift load to backup
   */
  private async shiftLoad(moduleName: string): Promise<boolean> {
    logger.info(`[TacticalAI] Shifting load for module: ${moduleName}`);
    // Implementation would redistribute traffic
    return true;
  }

  /**
   * Action: Scale up resources
   */
  private async scaleUp(moduleName: string): Promise<boolean> {
    logger.info(`[TacticalAI] Scaling up module: ${moduleName}`);
    // Implementation would increase resources
    return true;
  }

  /**
   * Action: Scale down resources
   */
  private async scaleDown(moduleName: string): Promise<boolean> {
    logger.info(`[TacticalAI] Scaling down module: ${moduleName}`);
    // Implementation would decrease resources
    return true;
  }

  /**
   * Action: Enable fallback mode
   */
  private async enableFallback(moduleName: string): Promise<boolean> {
    logger.info(`[TacticalAI] Enabling fallback for module: ${moduleName}`);
    // Implementation would activate fallback systems
    return true;
  }

  /**
   * Action: Disable feature
   */
  private async disableFeature(moduleName: string): Promise<boolean> {
    logger.info(`[TacticalAI] Disabling feature: ${moduleName}`);
    // Implementation would disable problematic feature
    return true;
  }

  /**
   * Action: Clear cache
   */
  private async clearCache(moduleName: string): Promise<boolean> {
    logger.info(`[TacticalAI] Clearing cache for module: ${moduleName}`);
    // Implementation would clear module-specific cache
    return true;
  }

  /**
   * Action: Notify human operator
   */
  private async notifyHuman(decision: TacticalDecision): Promise<boolean> {
    logger.info(`[TacticalAI] Notifying human about: ${decision.moduleName}`);
    
    try {
      // Send notification through multiple channels
      await (supabase as any)
        .from("notifications")
        .insert({
          user_id: "system",
          message: `${decision.reason} - Module: ${decision.moduleName}`,
          priority: decision.priority,
          created_at: new Date().toISOString(),
        });

      return true;
    } catch (error) {
      logger.error("[TacticalAI] Failed to notify human:", error);
      return false;
    }
  }

  /**
   * Set manual override for a module
   */
  setManualOverride(moduleName: string, enabled: boolean): void {
    if (enabled) {
      this.manualOverrides.set(moduleName, true);
      logger.info(`[TacticalAI] Manual override enabled for ${moduleName}`);
    } else {
      this.manualOverrides.delete(moduleName);
      logger.info(`[TacticalAI] Manual override disabled for ${moduleName}`);
    }
  }

  /**
   * Get decision history
   */
  async getDecisionHistory(moduleName?: string, limit = 50): Promise<TacticalDecision[]> {
    try {
      let query = supabase
        .from("tactical_decisions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (moduleName) {
        query = query.eq("module_name", moduleName);
      }

      const { data, error } = await query;

      if (error) throw error;

      return ((data || []) as any[]).map((d: any) => ({
        id: d.id || d.decision_id || "",
        timestamp: new Date(d.created_at || Date.now()),
        moduleName: d.module_name || "",
        action: (d.action_taken || "no_action") as TacticalAction,
        priority: (d.priority || "low") as DecisionPriority,
        reason: d.trigger_type || "Unknown",
        context: typeof d.context === "object" && d.context !== null ? d.context : {},
        executed: d.executed_at != null,
        success: d.success ?? undefined,
        error: d.error_message ?? undefined,
        manualOverride: d.override_by != null,
      }));
    } catch (error) {
      logger.error("[TacticalAI] Failed to fetch decision history:", error);
      return [];
    }
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      isActive: this.isActive,
      queueLength: this.decisionQueue.length,
      totalRules: this.rules.length,
      manualOverrides: this.manualOverrides.size,
    });
  }
}

// Export singleton instance
export const tacticalAI = new TacticalAI();
