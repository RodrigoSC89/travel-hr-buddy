/**
 * PATCH 514 - Auto-Executors (Mission Autoexec)
 * Intelligent auto-execution of missions based on event triggers
 * Reduces reaction time and enables proactive automatic actions
 */

export interface EventTrigger {
  id: string;
  name: string;
  type: "failure" | "anomaly" | "deadline" | "threshold" | "custom";
  condition: string;
  description: string;
  enabled: boolean;
}

export interface AutoExecRule {
  id: string;
  triggerId: string;
  actionType: string;
  actionParams: Record<string, any>;
  priority: number;
  rollbackEnabled: boolean;
  maxRetries: number;
  enabled: boolean;
  createdAt: string;
}

export interface ExecutionLog {
  id: string;
  ruleId: string;
  triggerId: string;
  status: "pending" | "running" | "success" | "failed" | "rolled_back";
  startTime: string;
  endTime?: string;
  result?: any;
  error?: string;
  rollbackLog?: string;
}

class AutoExecEngine {
  private rules: Map<string, AutoExecRule> = new Map();
  private triggers: Map<string, EventTrigger> = new Map();
  private executionLogs: ExecutionLog[] = [];
  private activeExecutions: Map<string, ExecutionLog> = new Map();

  constructor() {
    this.initializeDefaultTriggers();
  }

  private initializeDefaultTriggers() {
    // Default system triggers
    const defaultTriggers: EventTrigger[] = [
      {
        id: "trigger-failure",
        name: "Mission Failure",
        type: "failure",
        condition: "mission.status === 'failed'",
        description: "Triggered when a mission fails",
        enabled: true,
      },
      {
        id: "trigger-anomaly",
        name: "Anomaly Detection",
        type: "anomaly",
        condition: "metrics.anomaly_score > 0.8",
        description: "Triggered when system detects an anomaly",
        enabled: true,
      },
      {
        id: "trigger-deadline",
        name: "Deadline Approaching",
        type: "deadline",
        condition: "mission.deadline - now() < 3600",
        description: "Triggered when deadline is within 1 hour",
        enabled: true,
      },
      {
        id: "trigger-threshold",
        name: "Threshold Exceeded",
        type: "threshold",
        condition: "metrics.value > threshold",
        description: "Triggered when a metric exceeds threshold",
        enabled: true,
      },
    ];

    defaultTriggers.forEach((trigger) => this.triggers.set(trigger.id, trigger));
  }

  /**
   * Add a new auto-execution rule
   */
  addRule(rule: Omit<AutoExecRule, "id" | "createdAt">): AutoExecRule {
    const newRule: AutoExecRule = {
      ...rule,
      id: `rule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };

    this.rules.set(newRule.id, newRule);
    return newRule;
  }

  /**
   * Add a custom event trigger
   */
  addTrigger(trigger: Omit<EventTrigger, "id">): EventTrigger {
    const newTrigger: EventTrigger = {
      ...trigger,
      id: `trigger-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    this.triggers.set(newTrigger.id, newTrigger);
    return newTrigger;
  }

  /**
   * Check if an event matches any trigger
   */
  async checkTriggers(event: any): Promise<EventTrigger[]> {
    const matchedTriggers: EventTrigger[] = [];

    for (const trigger of this.triggers.values()) {
      if (!trigger.enabled) continue;

      // Evaluate trigger condition
      const matched = await this.evaluateTrigger(trigger, event);
      if (matched) {
        matchedTriggers.push(trigger);
      }
    }

    return matchedTriggers;
  }

  /**
   * Evaluate if a trigger condition is met
   */
  private async evaluateTrigger(trigger: EventTrigger, event: any): Promise<boolean> {
    try {
      // Simple condition evaluation
      // In production, use a safe expression evaluator
      switch (trigger.type) {
        case "failure":
          return event.status === "failed" || event.error !== undefined;
        case "anomaly":
          return event.anomalyScore > 0.8;
        case "deadline":
          if (event.deadline) {
            const deadline = new Date(event.deadline).getTime();
            const now = Date.now();
            return deadline - now < 3600000; // 1 hour
          }
          return false;
        case "threshold":
          return event.value > (event.threshold || 100);
        default:
          return false;
      }
    } catch (error) {
      console.error("Error evaluating trigger:", error);
      return false;
    }
  }

  /**
   * Execute rules associated with triggered events
   */
  async executeTriggeredRules(triggers: EventTrigger[], context: any): Promise<ExecutionLog[]> {
    const executions: ExecutionLog[] = [];

    for (const trigger of triggers) {
      const associatedRules = Array.from(this.rules.values())
        .filter((rule) => rule.triggerId === trigger.id && rule.enabled)
        .sort((a, b) => b.priority - a.priority); // Higher priority first

      for (const rule of associatedRules) {
        const execution = await this.executeRule(rule, context);
        executions.push(execution);
      }
    }

    return executions;
  }

  /**
   * Execute a single rule
   */
  private async executeRule(rule: AutoExecRule, context: any): Promise<ExecutionLog> {
    const executionLog: ExecutionLog = {
      id: `exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ruleId: rule.id,
      triggerId: rule.triggerId,
      status: "pending",
      startTime: new Date().toISOString(),
    };

    this.activeExecutions.set(executionLog.id, executionLog);

    try {
      executionLog.status = "running";

      // Execute the action
      const result = await this.performAction(rule.actionType, rule.actionParams, context);

      executionLog.status = "success";
      executionLog.result = result;
      executionLog.endTime = new Date().toISOString();
    } catch (error: any) {
      executionLog.status = "failed";
      executionLog.error = error.message;
      executionLog.endTime = new Date().toISOString();

      // Attempt rollback if enabled
      if (rule.rollbackEnabled) {
        try {
          await this.performRollback(rule, context);
          executionLog.status = "rolled_back";
          executionLog.rollbackLog = "Rollback successful";
        } catch (rollbackError: any) {
          executionLog.rollbackLog = `Rollback failed: ${rollbackError.message}`;
        }
      }
    }

    this.activeExecutions.delete(executionLog.id);
    this.executionLogs.push(executionLog);

    return executionLog;
  }

  /**
   * Perform the actual action
   */
  private async performAction(
    actionType: string,
    params: Record<string, any>,
    context: any
  ): Promise<any> {
    // Simulate action execution
    await new Promise((resolve) => setTimeout(resolve, 1000));

    switch (actionType) {
      case "restart_service":
        return { action: "restart_service", service: params.service, status: "restarted" };
      case "send_alert":
        return { action: "send_alert", recipient: params.recipient, sent: true };
      case "scale_resources":
        return { action: "scale_resources", from: params.current, to: params.target };
      case "run_diagnostic":
        return { action: "run_diagnostic", diagnostics: "completed" };
      default:
        return { action: actionType, executed: true };
    }
  }

  /**
   * Perform rollback of an action
   */
  private async performRollback(rule: AutoExecRule, context: any): Promise<void> {
    // Simulate rollback
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log(`Rolling back action: ${rule.actionType}`);
  }

  /**
   * Get all rules
   */
  getRules(): AutoExecRule[] {
    return Array.from(this.rules.values());
  }

  /**
   * Get all triggers
   */
  getTriggers(): EventTrigger[] {
    return Array.from(this.triggers.values());
  }

  /**
   * Get execution logs
   */
  getExecutionLogs(limit: number = 100): ExecutionLog[] {
    return this.executionLogs.slice(-limit);
  }

  /**
   * Get active executions
   */
  getActiveExecutions(): ExecutionLog[] {
    return Array.from(this.activeExecutions.values());
  }

  /**
   * Update rule status
   */
  updateRule(ruleId: string, updates: Partial<AutoExecRule>): boolean {
    const rule = this.rules.get(ruleId);
    if (!rule) return false;

    this.rules.set(ruleId, { ...rule, ...updates });
    return true;
  }

  /**
   * Delete a rule
   */
  deleteRule(ruleId: string): boolean {
    return this.rules.delete(ruleId);
  }
}

// Singleton instance
export const autoExecEngine = new AutoExecEngine();
