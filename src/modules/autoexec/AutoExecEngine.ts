/**
 * PATCH 514: Auto-Execution Engine
 * Event-driven execution system with automatic rollback and retry logic
 */

export type TriggerType = "failure" | "anomaly" | "deadline" | "threshold";
export type ActionType = "restart_service" | "scale_resources" | "alert" | "rollback" | "custom";

export interface AutoExecTrigger {
  id: string;
  type: TriggerType;
  name: string;
  condition: (event: any) => boolean;
  enabled: boolean;
  metadata?: Record<string, any>;
}

export interface AutoExecRule {
  id: string;
  triggerId: string;
  actionType: ActionType;
  priority: number; // 1-10, higher = more important
  rollbackEnabled: boolean;
  maxRetries: number;
  retryDelay: number; // milliseconds
  action: (context: any) => Promise<any>;
  rollback?: (context: any) => Promise<void>;
  enabled: boolean;
}

export interface ExecutionRecord {
  id: string;
  ruleId: string;
  triggerId: string;
  startTime: Date;
  endTime?: Date;
  status: "pending" | "running" | "success" | "failed" | "rolled_back";
  attempts: number;
  result?: any;
  error?: string;
  context: any;
}

class AutoExecEngine {
  private static instance: AutoExecEngine;
  private triggers: Map<string, AutoExecTrigger> = new Map();
  private rules: Map<string, AutoExecRule> = new Map();
  private executionHistory: ExecutionRecord[] = [];
  private activeExecutions: Map<string, ExecutionRecord> = new Map();

  private constructor() {
    this.initializeDefaultTriggers();
  }

  static getInstance(): AutoExecEngine {
    if (!AutoExecEngine.instance) {
      AutoExecEngine.instance = new AutoExecEngine();
    }
    return AutoExecEngine.instance;
  }

  /**
   * Initialize default triggers
   */
  private initializeDefaultTriggers(): void {
    this.addTrigger({
      id: "trigger-failure",
      type: "failure",
      name: "Service Failure",
      condition: (event) => event.type === "error" && event.severity === "critical",
      enabled: true,
    });

    this.addTrigger({
      id: "trigger-anomaly",
      type: "anomaly",
      name: "Anomaly Detection",
      condition: (event) => event.anomalyScore > 0.8,
      enabled: true,
    });

    this.addTrigger({
      id: "trigger-deadline",
      type: "deadline",
      name: "Deadline Approaching",
      condition: (event) => {
        if (!event.deadline) return false;
        const timeLeft = new Date(event.deadline).getTime() - Date.now();
        return timeLeft < 3600000 && timeLeft > 0; // Less than 1 hour
      },
      enabled: true,
    });

    this.addTrigger({
      id: "trigger-threshold",
      type: "threshold",
      name: "Threshold Exceeded",
      condition: (event) => event.value > event.threshold,
      enabled: true,
    });
  }

  /**
   * Add a new trigger
   */
  addTrigger(trigger: AutoExecTrigger): void {
    this.triggers.set(trigger.id, trigger);
  }

  /**
   * Add a new execution rule
   */
  addRule(rule: Omit<AutoExecRule, "id"> & { id?: string }): void {
    const ruleId = rule.id || `rule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const fullRule: AutoExecRule = {
      ...rule,
      id: ruleId,
      enabled: true,
    } as AutoExecRule;
    
    this.rules.set(ruleId, fullRule);
  }

  /**
   * Check which triggers match the event
   */
  async checkTriggers(event: any): Promise<AutoExecTrigger[]> {
    const matchedTriggers: AutoExecTrigger[] = [];

    for (const trigger of this.triggers.values()) {
      if (!trigger.enabled) continue;

      try {
        if (trigger.condition(event)) {
          matchedTriggers.push(trigger);
        }
      } catch (error) {
        console.error(`Error checking trigger ${trigger.id}:`, error);
      }
    }

    return matchedTriggers;
  }

  /**
   * Execute rules for triggered events
   */
  async executeTriggeredRules(
    triggers: AutoExecTrigger[],
    context: any
  ): Promise<ExecutionRecord[]> {
    const executions: ExecutionRecord[] = [];

    // Get rules for triggered events, sorted by priority
    const rulesToExecute = Array.from(this.rules.values())
      .filter(rule => rule.enabled && triggers.some(t => t.id === rule.triggerId))
      .sort((a, b) => b.priority - a.priority);

    for (const rule of rulesToExecute) {
      const execution = await this.executeRule(rule, context);
      executions.push(execution);
    }

    return executions;
  }

  /**
   * Execute a single rule with retry logic
   */
  private async executeRule(
    rule: AutoExecRule,
    context: any
  ): Promise<ExecutionRecord> {
    const executionId = `exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const record: ExecutionRecord = {
      id: executionId,
      ruleId: rule.id,
      triggerId: rule.triggerId,
      startTime: new Date(),
      status: "pending",
      attempts: 0,
      context,
    };

    this.activeExecutions.set(executionId, record);

    try {
      record.status = "running";
      let lastError: Error | null = null;

      // Retry loop
      for (let attempt = 1; attempt <= rule.maxRetries; attempt++) {
        record.attempts = attempt;

        try {
          const result = await rule.action(context);
          record.result = result;
          record.status = "success";
          record.endTime = new Date();
          break;
        } catch (error) {
          lastError = error as Error;
          
          if (attempt < rule.maxRetries) {
            // Wait before retrying
            await this.delay(rule.retryDelay);
          }
        }
      }

      // If all attempts failed
      if (record.status === "running") {
        record.status = "failed";
        record.error = lastError?.message || "Unknown error";
        record.endTime = new Date();

        // Attempt rollback if enabled
        if (rule.rollbackEnabled && rule.rollback) {
          try {
            await rule.rollback(context);
            record.status = "rolled_back";
          } catch (rollbackError) {
            console.error("Rollback failed:", rollbackError);
          }
        }
      }
    } catch (error) {
      record.status = "failed";
      record.error = (error as Error).message;
      record.endTime = new Date();
    }

    this.activeExecutions.delete(executionId);
    this.executionHistory.push(record);

    // Keep history limited to last 1000 entries
    if (this.executionHistory.length > 1000) {
      this.executionHistory = this.executionHistory.slice(-1000);
    }

    return record;
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get execution history
   */
  getExecutionHistory(limit?: number): ExecutionRecord[] {
    const history = [...this.executionHistory].reverse();
    return limit ? history.slice(0, limit) : history;
  }

  /**
   * Get active executions
   */
  getActiveExecutions(): ExecutionRecord[] {
    return Array.from(this.activeExecutions.values());
  }

  /**
   * Get all triggers
   */
  getTriggers(): AutoExecTrigger[] {
    return Array.from(this.triggers.values());
  }

  /**
   * Get all rules
   */
  getRules(): AutoExecRule[] {
    return Array.from(this.rules.values());
  }

  /**
   * Enable/disable trigger
   */
  setTriggerEnabled(triggerId: string, enabled: boolean): void {
    const trigger = this.triggers.get(triggerId);
    if (trigger) {
      trigger.enabled = enabled;
    }
  }

  /**
   * Enable/disable rule
   */
  setRuleEnabled(ruleId: string, enabled: boolean): void {
    const rule = this.rules.get(ruleId);
    if (rule) {
      rule.enabled = enabled;
    }
  }

  /**
   * Remove trigger
   */
  removeTrigger(triggerId: string): void {
    this.triggers.delete(triggerId);
  }

  /**
   * Remove rule
   */
  removeRule(ruleId: string): void {
    this.rules.delete(ruleId);
  }

  /**
   * Clear execution history
   */
  clearHistory(): void {
    this.executionHistory = [];
  }
}

// Export singleton instance
export const autoExecEngine = AutoExecEngine.getInstance();
