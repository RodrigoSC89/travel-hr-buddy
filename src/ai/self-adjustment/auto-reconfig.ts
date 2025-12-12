/**
 * PATCH 589: Auto-Reconfiguration Protocols
 * 
 * Enables dynamic AI module reconfiguration based on operational conditions
 * Features:
 * - Trigger-based reconfiguration (failure, overload, repeated errors)
 * - Automatic model/configuration switching
 * - Before/after state logging
 * - Post-adjustment performance validation
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export type ReconfigTrigger = 
  | "failure_threshold_exceeded"
  | "performance_degradation"
  | "resource_overload"
  | "repeated_errors"
  | "manual_override"
  | "scheduled_optimization";

export type ConfigurationType = 
  | "model_switch"
  | "parameter_adjustment"
  | "strategy_change"
  | "resource_reallocation"
  | "priority_reorder";

export interface SystemConfiguration {
  configId: string;
  modelName: string;
  parameters: Record<string, any>;
  strategy: string;
  resourceAllocation: {
    cpu: number;
    memory: number;
    timeout: number;
  };
  priorities: Record<string, number>;
  timestamp: string;
}

export interface ReconfigurationTriggerEvent {
  triggerId: string;
  triggerType: ReconfigTrigger;
  reason: string;
  metrics: {
    errorRate?: number;
    performanceScore?: number;
    resourceUsage?: number;
    responseTime?: number;
  };
  threshold: number;
  actualValue: number;
  timestamp: string;
}

export interface ReconfigurationAction {
  actionId: string;
  triggerId: string;
  configurationType: ConfigurationType;
  beforeState: SystemConfiguration;
  afterState: SystemConfiguration;
  changes: Array<{
    field: string;
    oldValue: any;
    newValue: any;
    reason: string;
  }>;
  timestamp: string;
  status: "pending" | "applied" | "failed" | "reverted";
}

export interface PerformanceValidation {
  validationId: string;
  actionId: string;
  beforeMetrics: {
    accuracy: number;
    responseTime: number;
    errorRate: number;
    throughput: number;
  };
  afterMetrics: {
    accuracy: number;
    responseTime: number;
    errorRate: number;
    throughput: number;
  };
  improvement: {
    accuracy: number;
    responseTime: number;
    errorRate: number;
    throughput: number;
  };
  verdict: "success" | "mixed" | "failure";
  recommendation: string;
  timestamp: string;
}

export class AutoReconfigurationEngine {
  private currentConfig: SystemConfiguration | null = null;
  private configHistory: SystemConfiguration[] = [];
  private triggers: ReconfigurationTriggerEvent[] = [];
  private actions: ReconfigurationAction[] = [];
  private validations: PerformanceValidation[] = [];

  // Thresholds for automatic reconfiguration
  private thresholds = {
    errorRate: 0.15, // 15%
    performanceScore: 60, // out of 100
    resourceUsage: 0.9, // 90%
    responseTime: 5000, // 5 seconds
    consecutiveFailures: 3,
  };

  /**
   * Initialize with default configuration
   */
  async initialize(): Promise<void> {
    const defaultConfig: SystemConfiguration = {
      configId: `config-${Date.now()}`,
      modelName: "gpt-4",
      parameters: {
        temperature: 0.7,
        maxTokens: 2000,
        topP: 0.9,
      },
      strategy: "balanced",
      resourceAllocation: {
        cpu: 2,
        memory: 4096,
        timeout: 30000,
      },
      priorities: {
        accuracy: 8,
        speed: 7,
        cost: 6,
      },
      timestamp: new Date().toISOString(),
    });

    this.currentConfig = defaultConfig;
    this.configHistory.push(defaultConfig);
    await this.storeConfiguration(defaultConfig);
  }

  /**
   * Monitor system and detect reconfiguration triggers
   */
  async monitorAndTrigger(currentMetrics: {
    errorRate: number;
    performanceScore: number;
    resourceUsage: number;
    responseTime: number;
    consecutiveFailures: number;
  }): Promise<ReconfigurationTriggerEvent | null> {
    // Check error rate
    if (currentMetrics.errorRate > this.thresholds.errorRate) {
      return await this.createTrigger({
        triggerType: "failure_threshold_exceeded",
        reason: `Error rate ${(currentMetrics.errorRate * 100).toFixed(1)}% exceeds threshold ${(this.thresholds.errorRate * 100).toFixed(1)}%`,
        metrics: { errorRate: currentMetrics.errorRate },
        threshold: this.thresholds.errorRate,
        actualValue: currentMetrics.errorRate,
      });
    }

    // Check performance degradation
    if (currentMetrics.performanceScore < this.thresholds.performanceScore) {
      return await this.createTrigger({
        triggerType: "performance_degradation",
        reason: `Performance score ${currentMetrics.performanceScore} below threshold ${this.thresholds.performanceScore}`,
        metrics: { performanceScore: currentMetrics.performanceScore },
        threshold: this.thresholds.performanceScore,
        actualValue: currentMetrics.performanceScore,
      });
    }

    // Check resource overload
    if (currentMetrics.resourceUsage > this.thresholds.resourceUsage) {
      return await this.createTrigger({
        triggerType: "resource_overload",
        reason: `Resource usage ${(currentMetrics.resourceUsage * 100).toFixed(1)}% exceeds threshold ${(this.thresholds.resourceUsage * 100).toFixed(1)}%`,
        metrics: { resourceUsage: currentMetrics.resourceUsage },
        threshold: this.thresholds.resourceUsage,
        actualValue: currentMetrics.resourceUsage,
      });
    }

    // Check repeated errors
    if (currentMetrics.consecutiveFailures >= this.thresholds.consecutiveFailures) {
      return await this.createTrigger({
        triggerType: "repeated_errors",
        reason: `${currentMetrics.consecutiveFailures} consecutive failures detected`,
        metrics: { errorRate: currentMetrics.errorRate },
        threshold: this.thresholds.consecutiveFailures,
        actualValue: currentMetrics.consecutiveFailures,
      });
    }

    return null;
  }

  /**
   * Create a reconfiguration trigger event
   */
  private async createTrigger(
    data: Omit<ReconfigurationTriggerEvent, "triggerId" | "timestamp">
  ): Promise<ReconfigurationTriggerEvent> {
    const trigger: ReconfigurationTriggerEvent = {
      ...data,
      triggerId: `trigger-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
    });

    this.triggers.push(trigger);
    await this.storeTrigger(trigger);

    return trigger;
  }

  /**
   * Execute automatic reconfiguration based on trigger
   */
  async executeReconfiguration(
    trigger: ReconfigurationTriggerEvent
  ): Promise<ReconfigurationAction> {
    if (!this.currentConfig) {
      throw new Error("No current configuration available");
    }

    const beforeState = { ...this.currentConfig };
    const afterState = this.determineNewConfiguration(trigger, beforeState);

    const action: ReconfigurationAction = {
      actionId: `action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      triggerId: trigger.triggerId,
      configurationType: this.determineConfigurationType(trigger),
      beforeState,
      afterState,
      changes: this.calculateChanges(beforeState, afterState),
      timestamp: new Date().toISOString(),
      status: "pending",
    });

    try {
      // Apply the new configuration
      this.currentConfig = afterState;
      this.configHistory.push(afterState);
      action.status = "applied";

      await this.storeConfiguration(afterState);
      await this.storeAction(action);

      this.actions.push(action);

      return action;
    } catch (error) {
      action.status = "failed";
      await this.storeAction(action);
      throw error;
    }
  }

  /**
   * Determine new configuration based on trigger
   */
  private determineNewConfiguration(
    trigger: ReconfigurationTriggerEvent,
    currentConfig: SystemConfiguration
  ): SystemConfiguration {
    const newConfig = { ...currentConfig };
    newConfig.configId = `config-${Date.now()}`;
    newConfig.timestamp = new Date().toISOString();

    switch (trigger.triggerType) {
    case "failure_threshold_exceeded":
      // Switch to more conservative model
      newConfig.modelName = "gpt-3.5-turbo";
      newConfig.parameters.temperature = 0.3;
      newConfig.strategy = "conservative";
      break;

    case "performance_degradation":
      // Optimize for performance
      newConfig.parameters.temperature = 0.5;
      newConfig.parameters.maxTokens = 1500;
      newConfig.priorities.accuracy = 9;
      newConfig.priorities.speed = 8;
      break;

    case "resource_overload":
      // Reduce resource allocation
      newConfig.resourceAllocation.memory = Math.floor(
        currentConfig.resourceAllocation.memory * 0.75
      );
      newConfig.parameters.maxTokens = Math.floor(
        currentConfig.parameters.maxTokens * 0.8
      );
      newConfig.priorities.cost = 9;
      break;

    case "repeated_errors":
      // Switch to fallback model with safer parameters
      newConfig.modelName = "gpt-3.5-turbo";
      newConfig.parameters.temperature = 0.2;
      newConfig.parameters.maxTokens = 1000;
      newConfig.strategy = "safe";
      break;

    case "manual_override":
    case "scheduled_optimization":
      // Keep current config with minor optimizations
      newConfig.parameters.temperature = Math.min(
        1.0,
        currentConfig.parameters.temperature + 0.1
      );
      break;
    }

    return newConfig;
  }

  /**
   * Determine configuration type from trigger
   */
  private determineConfigurationType(
    trigger: ReconfigurationTriggerEvent
  ): ConfigurationType {
    switch (trigger.triggerType) {
    case "failure_threshold_exceeded":
    case "repeated_errors":
      return "model_switch";
    case "performance_degradation":
      return "parameter_adjustment";
    case "resource_overload":
      return "resource_reallocation";
    default:
      return "strategy_change";
    }
  }

  /**
   * Calculate changes between configurations
   */
  private calculateChanges(
    before: SystemConfiguration,
    after: SystemConfiguration
  ): Array<{
    field: string;
    oldValue: any;
    newValue: any;
    reason: string;
  }> {
    const changes: Array<{
      field: string;
      oldValue: any;
      newValue: any;
      reason: string;
    }> = [];

    if (before.modelName !== after.modelName) {
      changes.push({
        field: "modelName",
        oldValue: before.modelName,
        newValue: after.modelName,
        reason: "Model switched for improved reliability",
      });
    }

    if (before.strategy !== after.strategy) {
      changes.push({
        field: "strategy",
        oldValue: before.strategy,
        newValue: after.strategy,
        reason: "Strategy adjusted based on performance",
      });
    }

    // Check parameter changes
    for (const key in after.parameters) {
      if (before.parameters[key] !== after.parameters[key]) {
        changes.push({
          field: `parameters.${key}`,
          oldValue: before.parameters[key],
          newValue: after.parameters[key],
          reason: "Parameter optimized for better performance",
        });
      }
    }

    return changes;
  }

  /**
   * Validate performance after reconfiguration
   */
  async validatePerformance(
    actionId: string,
    beforeMetrics: PerformanceValidation["beforeMetrics"],
    afterMetrics: PerformanceValidation["afterMetrics"]
  ): Promise<PerformanceValidation> {
    const improvement = {
      accuracy: afterMetrics.accuracy - beforeMetrics.accuracy,
      responseTime: beforeMetrics.responseTime - afterMetrics.responseTime, // Lower is better
      errorRate: beforeMetrics.errorRate - afterMetrics.errorRate, // Lower is better
      throughput: afterMetrics.throughput - beforeMetrics.throughput,
    });

    // Determine verdict
    let verdict: PerformanceValidation["verdict"];
    const positiveImprovements = [
      improvement.accuracy > 0,
      improvement.responseTime > 0,
      improvement.errorRate > 0,
      improvement.throughput > 0,
    ].filter(Boolean).length;

    if (positiveImprovements >= 3) {
      verdict = "success";
    } else if (positiveImprovements >= 2) {
      verdict = "mixed";
    } else {
      verdict = "failure";
    }

    // Generate recommendation
    let recommendation: string;
    if (verdict === "success") {
      recommendation = "Reconfiguration successful. Keep new configuration.";
    } else if (verdict === "mixed") {
      recommendation = "Reconfiguration shows mixed results. Monitor closely and consider fine-tuning.";
    } else {
      recommendation = "Reconfiguration unsuccessful. Consider reverting to previous configuration.";
    }

    const validation: PerformanceValidation = {
      validationId: `validation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      actionId,
      beforeMetrics,
      afterMetrics,
      improvement,
      verdict,
      recommendation,
      timestamp: new Date().toISOString(),
    });

    this.validations.push(validation);
    await this.storeValidation(validation);

    // If validation fails, consider reverting
    if (verdict === "failure") {
      await this.revertConfiguration(actionId);
    }

    return validation;
  }

  /**
   * Revert to previous configuration
   */
  private async revertConfiguration(actionId: string): Promise<void> {
    const action = this.actions.find(a => a.actionId === actionId);
    if (!action) {
      throw new Error("Action not found");
    }

    this.currentConfig = action.beforeState;
    this.configHistory.push(action.beforeState);

    action.status = "reverted";
    await this.storeAction(action);
  }

  /**
   * Get current configuration
   */
  getCurrentConfiguration(): SystemConfiguration | null {
    return this.currentConfig;
  }

  /**
   * Get configuration history
   */
  getConfigurationHistory(): SystemConfiguration[] {
    return [...this.configHistory];
  }

  /**
   * Get all triggers
   */
  getTriggers(): ReconfigurationTriggerEvent[] {
    return [...this.triggers];
  }

  /**
   * Get all actions
   */
  getActions(): ReconfigurationAction[] {
    return [...this.actions];
  }

  /**
   * Get all validations
   */
  getValidations(): PerformanceValidation[] {
    return [...this.validations];
  }

  /**
   * Export reconfiguration logs
   */
  exportLogs(): {
    triggers: ReconfigurationTriggerEvent[];
    actions: ReconfigurationAction[];
    validations: PerformanceValidation[];
    currentConfig: SystemConfiguration | null;
    configHistory: SystemConfiguration[];
    } {
    return {
      triggers: this.triggers,
      actions: this.actions,
      validations: this.validations,
      currentConfig: this.currentConfig,
      configHistory: this.configHistory,
    });
  }

  /**
   * Storage methods
   */
  private async storeConfiguration(config: SystemConfiguration): Promise<void> {
    try {
      await (supabase as any).from("ai_configurations").insert({
        config_id: config.configId,
        model_name: config.modelName,
        parameters: config.parameters,
        strategy: config.strategy,
        resource_allocation: config.resourceAllocation,
        priorities: config.priorities,
        timestamp: config.timestamp,
      });
    } catch (error) {
      logger.error("Failed to store configuration", { error });
    }
  }

  private async storeTrigger(trigger: ReconfigurationTriggerEvent): Promise<void> {
    try {
      await (supabase as any).from("ai_reconfig_triggers").insert({
        trigger_id: trigger.triggerId,
        trigger_type: trigger.triggerType,
        reason: trigger.reason,
        metrics: trigger.metrics,
        threshold: trigger.threshold,
        actual_value: trigger.actualValue,
        timestamp: trigger.timestamp,
      });
    } catch (error) {
      logger.error("Failed to store trigger", { error });
    }
  }

  private async storeAction(action: ReconfigurationAction): Promise<void> {
    try {
      await (supabase as any).from("ai_reconfig_actions").insert({
        action_id: action.actionId,
        trigger_id: action.triggerId,
        configuration_type: action.configurationType,
        before_state: action.beforeState,
        after_state: action.afterState,
        changes: action.changes,
        status: action.status,
        timestamp: action.timestamp,
      });
    } catch (error) {
      logger.error("Failed to store action", { error });
    }
  }

  private async storeValidation(validation: PerformanceValidation): Promise<void> {
    try {
      await (supabase as any).from("ai_performance_validations").insert({
        validation_id: validation.validationId,
        action_id: validation.actionId,
        before_metrics: validation.beforeMetrics,
        after_metrics: validation.afterMetrics,
        improvement: validation.improvement,
        verdict: validation.verdict,
        recommendation: validation.recommendation,
        timestamp: validation.timestamp,
      });
    } catch (error) {
      logger.error("Failed to store validation", { error });
    }
  }
}

// Export singleton instance
export const autoReconfigEngine = new AutoReconfigurationEngine();
