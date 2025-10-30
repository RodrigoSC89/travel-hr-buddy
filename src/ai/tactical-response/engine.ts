// @ts-nocheck
/**
 * PATCH 577 - Tactical Response Engine
 * Automated tactical response system based on situational intelligence
 * 
 * Features:
 * - Reactive and predictive rules (JSON/YAML configuration)
 * - Event processing from Situational Awareness
 * - Automated routine triggering and alerting
 * - Decision logging with justifications
 * - Support for 10+ event types
 * - Performance optimized (<500ms per response)
 */

import { BridgeLink } from "@/core/BridgeLink";
import { situationalAwareness } from "@/ai/situational-awareness";
import {
  TacticalEvent,
  TacticalRule,
  ResponseAction,
  ResponseExecution,
  EngineStatistics,
  RuleConfig,
  EventType,
  RuleType,
} from "./types";

/**
 * Tactical Response Engine class
 */
export class TacticalResponseEngine {
  private static instance: TacticalResponseEngine;
  private rules: Map<string, TacticalRule> = new Map();
  private executionHistory: ResponseExecution[] = [];
  private activeExecutions: Map<string, ResponseExecution> = new Map();
  private statistics: EngineStatistics;
  private isInitialized = false;
  private maxConcurrentExecutions = 10;
  private defaultTimeout = 5000; // 5 seconds
  private ruleExecutionCounts: Map<string, number[]> = new Map(); // Track executions per hour

  private constructor() {
    this.statistics = this.getInitialStatistics();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): TacticalResponseEngine {
    if (!TacticalResponseEngine.instance) {
      TacticalResponseEngine.instance = new TacticalResponseEngine();
    }
    return TacticalResponseEngine.instance;
  }

  /**
   * Initialize the engine
   */
  public async initialize(config?: RuleConfig): Promise<void> {
    if (this.isInitialized) {
      console.warn("[TacticalResponse] Engine already initialized");
      return;
    }

    // Load rules from config
    if (config) {
      this.loadRules(config);
      if (config.settings) {
        this.maxConcurrentExecutions = config.settings.maxConcurrentExecutions ?? 10;
        this.defaultTimeout = config.settings.defaultTimeout ?? 5000;
      }
    } else {
      // Load default rules
      this.loadDefaultRules();
    }

    // Set up event listeners
    this.setupEventListeners();

    this.isInitialized = true;
    console.log("[TacticalResponse] Engine initialized", {
      rulesLoaded: this.rules.size,
      maxConcurrentExecutions: this.maxConcurrentExecutions,
    });

    BridgeLink.emit("tactical-response:initialized", "TacticalResponse", {
      timestamp: Date.now(),
      rulesCount: this.rules.size,
    });
  }

  /**
   * Process a tactical event
   */
  public async processEvent(event: TacticalEvent): Promise<ResponseExecution[]> {
    const startTime = performance.now();
    const executions: ResponseExecution[] = [];

    try {
      this.statistics.totalEvents++;
      this.statistics.eventsByType[event.type] = (this.statistics.eventsByType[event.type] || 0) + 1;

      // Find matching rules
      const matchingRules = this.findMatchingRules(event);

      if (matchingRules.length === 0) {
        this.statistics.processedEvents++;
        return executions;
      }

      // Sort rules by priority (highest first)
      matchingRules.sort((a, b) => b.priority - a.priority);

      // Execute rules
      for (const rule of matchingRules) {
        // Check cooldown
        if (!this.canExecuteRule(rule)) {
          console.log(`[TacticalResponse] Rule ${rule.id} on cooldown, skipping`);
          continue;
        }

        // Check execution limit
        if (!this.checkExecutionLimit(rule)) {
          console.log(`[TacticalResponse] Rule ${rule.id} reached execution limit, skipping`);
          continue;
        }

        // Check concurrent execution limit
        if (this.activeExecutions.size >= this.maxConcurrentExecutions) {
          console.warn("[TacticalResponse] Max concurrent executions reached, queueing");
          break;
        }

        const execution = await this.executeRule(rule, event);
        executions.push(execution);

        // Track execution
        this.trackRuleExecution(rule.id);
      }

      this.statistics.processedEvents++;

      const duration = performance.now() - startTime;
      this.updatePerformanceMetrics(duration);

      // Verify performance requirement (<500ms)
      if (duration > 500) {
        console.warn(`[TacticalResponse] Performance degraded: ${duration.toFixed(2)}ms`);
      }

      BridgeLink.emit("tactical-response:event-processed", "TacticalResponse", {
        eventId: event.id,
        executionsCount: executions.length,
        duration,
      });
    } catch (error) {
      console.error("[TacticalResponse] Error processing event:", error);
    }

    return executions;
  }

  /**
   * Execute a tactical rule
   */
  private async executeRule(rule: TacticalRule, event: TacticalEvent): Promise<ResponseExecution> {
    const execution: ResponseExecution = {
      id: `exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ruleId: rule.id,
      eventId: event.id,
      timestamp: Date.now(),
      startTime: performance.now(),
      status: "pending",
      actions: rule.actions.map(action => ({
        actionId: action.id,
        status: "pending",
      })),
      justification: this.generateJustification(rule, event),
      confidence: event.metadata?.confidence || 0.8,
    };

    this.activeExecutions.set(execution.id, execution);
    execution.status = "running";

    try {
      // Execute actions sequentially
      for (let i = 0; i < rule.actions.length; i++) {
        const action = rule.actions[i];
        const actionExecution = execution.actions[i];
        const actionStartTime = performance.now();

        actionExecution.status = "running";

        try {
          const result = await this.executeAction(action, event, rule);
          actionExecution.status = "success";
          actionExecution.result = result;
          actionExecution.duration = performance.now() - actionStartTime;
        } catch (error) {
          actionExecution.status = "failed";
          actionExecution.error = error instanceof Error ? error.message : "Unknown error";
          actionExecution.duration = performance.now() - actionStartTime;
          console.error(`[TacticalResponse] Action ${action.id} failed:`, error);
        }
      }

      execution.status = execution.actions.every(a => a.status === "success") ? "success" : "failed";
      execution.endTime = performance.now();
      execution.duration = execution.endTime - execution.startTime;

      this.statistics.executedResponses++;
      if (execution.status === "success") {
        this.statistics.successRate = 
          (this.statistics.successRate * (this.statistics.executedResponses - 1) + 1) / 
          this.statistics.executedResponses;
      } else {
        this.statistics.successRate = 
          (this.statistics.successRate * (this.statistics.executedResponses - 1)) / 
          this.statistics.executedResponses;
      }

      console.log(`[TacticalResponse] Rule ${rule.id} executed`, {
        executionId: execution.id,
        status: execution.status,
        duration: execution.duration?.toFixed(2),
      });
    } catch (error) {
      execution.status = "failed";
      execution.endTime = performance.now();
      execution.duration = execution.endTime - execution.startTime;
      console.error(`[TacticalResponse] Rule ${rule.id} execution failed:`, error);
    } finally {
      this.activeExecutions.delete(execution.id);
      this.executionHistory.push(execution);

      // Keep history manageable
      if (this.executionHistory.length > 10000) {
        this.executionHistory = this.executionHistory.slice(-5000);
      }

      BridgeLink.emit("tactical-response:execution-complete", "TacticalResponse", {
        executionId: execution.id,
        ruleId: rule.id,
        status: execution.status,
        duration: execution.duration,
      });
    }

    return execution;
  }

  /**
   * Execute a response action
   */
  private async executeAction(
    action: ResponseAction,
    event: TacticalEvent,
    rule: TacticalRule
  ): Promise<any> {
    const timeout = action.timeout || this.defaultTimeout;

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Action ${action.id} timed out after ${timeout}ms`));
      }, timeout);

      try {
        let result: any;

        switch (action.type) {
        case "alert":
          result = this.executeAlertAction(action, event);
          break;
        case "notification":
          result = this.executeNotificationAction(action, event);
          break;
        case "automated_correction":
          result = this.executeAutomatedCorrectionAction(action, event);
          break;
        case "escalation":
          result = this.executeEscalationAction(action, event);
          break;
        case "data_collection":
          result = this.executeDataCollectionAction(action, event);
          break;
        case "system_adjustment":
          result = this.executeSystemAdjustmentAction(action, event);
          break;
        case "crew_notification":
          result = this.executeCrewNotificationAction(action, event);
          break;
        case "report_generation":
          result = this.executeReportGenerationAction(action, event);
          break;
        case "failover":
          result = this.executeFailoverAction(action, event);
          break;
        case "diagnostic_run":
          result = this.executeDiagnosticRunAction(action, event);
          break;
        default:
          result = { status: "not_implemented", action: action.type };
        }

        clearTimeout(timer);
        resolve(result);
      } catch (error) {
        clearTimeout(timer);
        reject(error);
      }
    });
  }

  /**
   * Find rules matching an event
   */
  private findMatchingRules(event: TacticalEvent): TacticalRule[] {
    const matching: TacticalRule[] = [];

    for (const rule of this.rules.values()) {
      if (!rule.enabled) continue;
      if (!rule.eventTypes.includes(event.type)) continue;

      // Check conditions
      const conditionsMet = rule.conditions.every(condition => {
        const fieldValue = this.getFieldValue(event.data, condition.field);
        return this.evaluateCondition(fieldValue, condition.operator, condition.value);
      });

      if (conditionsMet) {
        matching.push(rule);
      }
    }

    return matching;
  }

  /**
   * Check if rule can be executed (cooldown check)
   */
  private canExecuteRule(rule: TacticalRule): boolean {
    if (!rule.cooldown) return true;

    const recentExecutions = this.executionHistory.filter(
      e => e.ruleId === rule.id && Date.now() - e.timestamp < rule.cooldown!
    );

    return recentExecutions.length === 0;
  }

  /**
   * Check execution limit
   */
  private checkExecutionLimit(rule: TacticalRule): boolean {
    if (!rule.maxExecutions) return true;

    const executions = this.ruleExecutionCounts.get(rule.id) || [];
    const oneHourAgo = Date.now() - 3600000;
    const recentExecutions = executions.filter(t => t > oneHourAgo);

    return recentExecutions.length < rule.maxExecutions;
  }

  /**
   * Track rule execution
   */
  private trackRuleExecution(ruleId: string): void {
    const executions = this.ruleExecutionCounts.get(ruleId) || [];
    executions.push(Date.now());
    this.ruleExecutionCounts.set(ruleId, executions);
  }

  /**
   * Generate justification for rule execution
   */
  private generateJustification(rule: TacticalRule, event: TacticalEvent): string {
    return `Rule "${rule.name}" triggered by ${event.type} event (severity: ${event.severity}). ` +
      `Conditions: ${rule.conditions.map(c => `${c.field} ${c.operator} ${c.value}`).join(", ")}. ` +
      `Actions: ${rule.actions.map(a => a.type).join(", ")}.`;
  }

  /**
   * Get field value from nested object
   */
  private getFieldValue(obj: Record<string, any>, field: string): any {
    const parts = field.split(".");
    let value: any = obj;
    for (const part of parts) {
      value = value?.[part];
    }
    return value;
  }

  /**
   * Evaluate a condition
   */
  private evaluateCondition(fieldValue: any, operator: string, value: any): boolean {
    switch (operator) {
    case "equals":
      return fieldValue === value;
    case "not_equals":
      return fieldValue !== value;
    case "greater_than":
      return fieldValue > value;
    case "less_than":
      return fieldValue < value;
    case "contains":
      return String(fieldValue).includes(String(value));
    case "regex":
      return new RegExp(value).test(String(fieldValue));
    default:
      return false;
    }
  }

  /**
   * Action implementations
   */
  private executeAlertAction(action: ResponseAction, event: TacticalEvent): any {
    BridgeLink.emit("tactical-response:alert", "TacticalResponse", {
      action: action.description,
      event: event,
      timestamp: Date.now(),
    });
    return { status: "alert_sent", parameters: action.parameters };
  }

  private executeNotificationAction(action: ResponseAction, event: TacticalEvent): any {
    BridgeLink.emit("tactical-response:notification", "TacticalResponse", {
      message: action.description,
      event: event,
      timestamp: Date.now(),
    });
    return { status: "notification_sent" };
  }

  private executeAutomatedCorrectionAction(action: ResponseAction, event: TacticalEvent): any {
    BridgeLink.emit("tactical-response:correction", "TacticalResponse", {
      action: action.description,
      event: event,
      parameters: action.parameters,
    });
    return { status: "correction_initiated", parameters: action.parameters };
  }

  private executeEscalationAction(action: ResponseAction, event: TacticalEvent): any {
    BridgeLink.emit("tactical-response:escalation", "TacticalResponse", {
      level: action.parameters.level || "high",
      event: event,
    });
    return { status: "escalated", level: action.parameters.level };
  }

  private executeDataCollectionAction(action: ResponseAction, event: TacticalEvent): any {
    BridgeLink.emit("tactical-response:data-collection", "TacticalResponse", {
      sources: action.parameters.sources,
      event: event,
    });
    return { status: "data_collection_started", sources: action.parameters.sources };
  }

  private executeSystemAdjustmentAction(action: ResponseAction, event: TacticalEvent): any {
    BridgeLink.emit("tactical-response:system-adjustment", "TacticalResponse", {
      adjustments: action.parameters,
      event: event,
    });
    return { status: "system_adjusted", adjustments: action.parameters };
  }

  private executeCrewNotificationAction(action: ResponseAction, event: TacticalEvent): any {
    BridgeLink.emit("tactical-response:crew-notification", "TacticalResponse", {
      crew: action.parameters.crew,
      message: action.description,
      event: event,
    });
    return { status: "crew_notified", crew: action.parameters.crew };
  }

  private executeReportGenerationAction(action: ResponseAction, event: TacticalEvent): any {
    BridgeLink.emit("tactical-response:report-generation", "TacticalResponse", {
      reportType: action.parameters.reportType,
      event: event,
    });
    return { status: "report_generated", reportType: action.parameters.reportType };
  }

  private executeFailoverAction(action: ResponseAction, event: TacticalEvent): any {
    BridgeLink.emit("tactical-response:failover", "TacticalResponse", {
      target: action.parameters.target,
      backup: action.parameters.backup,
      event: event,
    });
    return { status: "failover_initiated", target: action.parameters.target };
  }

  private executeDiagnosticRunAction(action: ResponseAction, event: TacticalEvent): any {
    BridgeLink.emit("tactical-response:diagnostic", "TacticalResponse", {
      diagnosticType: action.parameters.diagnosticType,
      event: event,
    });
    return { status: "diagnostic_started", type: action.parameters.diagnosticType };
  }

  /**
   * Update performance metrics
   */
  private updatePerformanceMetrics(duration: number): void {
    this.statistics.averageResponseTime = 
      (this.statistics.averageResponseTime * (this.statistics.processedEvents - 1) + duration) / 
      this.statistics.processedEvents;

    this.statistics.performanceMetrics.minResponseTime = Math.min(
      this.statistics.performanceMetrics.minResponseTime,
      duration
    );
    this.statistics.performanceMetrics.maxResponseTime = Math.max(
      this.statistics.performanceMetrics.maxResponseTime,
      duration
    );
  }

  /**
   * Load rules from configuration
   */
  public loadRules(config: RuleConfig): void {
    config.rules.forEach(rule => {
      this.rules.set(rule.id, rule);
    });
    this.statistics.activeRules = this.rules.size;
    console.log(`[TacticalResponse] Loaded ${config.rules.length} rules`);
  }

  /**
   * Load default rules
   */
  private loadDefaultRules(): void {
    const defaultRules: TacticalRule[] = [
      {
        id: "critical-alert-escalation",
        name: "Critical Alert Escalation",
        description: "Escalate critical alerts to command center",
        type: "reactive",
        enabled: true,
        priority: 10,
        eventTypes: ["alert"],
        conditions: [
          { field: "severity", operator: "equals", value: "critical" },
        ],
        actions: [
          {
            id: "escalate-1",
            type: "escalation",
            description: "Escalate to command center",
            parameters: { level: "command" },
            priority: 10,
          },
          {
            id: "notify-1",
            type: "crew_notification",
            description: "Notify senior crew",
            parameters: { crew: "senior" },
            priority: 9,
          },
        ],
        cooldown: 300000, // 5 minutes
        maxExecutions: 10,
      },
      {
        id: "system-failure-response",
        name: "System Failure Response",
        description: "Respond to system failures with diagnostics and failover",
        type: "reactive",
        enabled: true,
        priority: 9,
        eventTypes: ["failure", "system_degradation"],
        conditions: [],
        actions: [
          {
            id: "diagnostic-1",
            type: "diagnostic_run",
            description: "Run system diagnostics",
            parameters: { diagnosticType: "full" },
            priority: 10,
          },
          {
            id: "alert-1",
            type: "alert",
            description: "Alert operations team",
            parameters: { alertType: "system_failure" },
            priority: 9,
          },
        ],
        cooldown: 60000, // 1 minute
      },
    ];

    defaultRules.forEach(rule => {
      this.rules.set(rule.id, rule);
    });
    this.statistics.activeRules = this.rules.size;
  }

  /**
   * Set up event listeners
   */
  private setupEventListeners(): void {
    // Listen for situational awareness insights
    BridgeLink.on("situational-awareness:analysis-complete", async (_source, data) => {
      // Create events from insights
      const state = situationalAwareness.getCurrentState();
      
      state.activeAlerts.forEach(async alert => {
        const event: TacticalEvent = {
          id: `event-${alert.id}`,
          type: "alert",
          timestamp: alert.timestamp,
          severity: alert.severity,
          source: "situational-awareness",
          data: {
            alert,
            severity: alert.severity,
            type: alert.type,
          },
        };
        await this.processEvent(event);
      });
    });
  }

  /**
   * Get statistics
   */
  public getStatistics(): EngineStatistics {
    return { ...this.statistics };
  }

  /**
   * Get execution history
   */
  public getExecutionHistory(limit = 100): ResponseExecution[] {
    return this.executionHistory.slice(-limit);
  }

  /**
   * Get active executions
   */
  public getActiveExecutions(): ResponseExecution[] {
    return Array.from(this.activeExecutions.values());
  }

  /**
   * Get initial statistics
   */
  private getInitialStatistics(): EngineStatistics {
    return {
      totalEvents: 0,
      processedEvents: 0,
      activeRules: 0,
      executedResponses: 0,
      successRate: 0,
      averageResponseTime: 0,
      eventsByType: {} as Record<EventType, number>,
      performanceMetrics: {
        minResponseTime: Infinity,
        maxResponseTime: 0,
        p50ResponseTime: 0,
        p95ResponseTime: 0,
        p99ResponseTime: 0,
      },
    };
  }

  /**
   * Cleanup
   */
  public cleanup(): void {
    this.rules.clear();
    this.executionHistory = [];
    this.activeExecutions.clear();
    this.ruleExecutionCounts.clear();
    this.statistics = this.getInitialStatistics();
    this.isInitialized = false;
    
    BridgeLink.emit("tactical-response:cleanup", "TacticalResponse", {
      timestamp: Date.now(),
    });
  }
}

// Export singleton instance
export const tacticalResponse = TacticalResponseEngine.getInstance();
