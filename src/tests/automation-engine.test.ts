/**
 * PATCH 534 - Automation Engine Tests
 * Tests for automation rules, triggers, and workflow execution
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock Supabase
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: [], error: null })
        }),
        order: vi.fn().mockResolvedValue({ data: [], error: null })
      }),
      insert: vi.fn().mockResolvedValue({ error: null }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null })
      })
    })
  }
}));

interface TriggerConfig {
  eventType?: string;
  condition?: ConditionConfig;
}

interface ConditionConfig {
  field: string;
  operator: string;
  value: unknown;
}

interface ActionConfig {
  message?: string;
  recipient?: string;
  recipients?: string[];
  shouldFail?: boolean;
}

interface AutomationRule {
  id: string;
  name: string;
  trigger: {
    type: "event" | "schedule" | "condition";
    config: TriggerConfig;
  };
  actions: Array<{
    type: string;
    config: ActionConfig;
  }>;
  enabled: boolean;
  priority: number;
}

interface ExecutionResult {
  ruleId: string;
  success: boolean;
  executedActions: number;
  failedActions: number;
  duration: number;
  error?: string;
}

interface AutomationEvent {
  type: string;
  data?: Record<string, unknown>;
  [key: string]: unknown;
}

// Mock automation engine
class AutomationEngine {
  private rules: Map<string, AutomationRule> = new Map();
  private executionHistory: ExecutionResult[] = [];
  private listeners: Map<string, Array<() => void>> = new Map();

  addRule(rule: AutomationRule): void {
    this.rules.set(rule.id, rule);
  }

  removeRule(ruleId: string): void {
    this.rules.delete(ruleId);
  }

  getRule(ruleId: string): AutomationRule | undefined {
    return this.rules.get(ruleId);
  }

  getAllRules(): AutomationRule[] {
    return Array.from(this.rules.values());
  }

  enableRule(ruleId: string): void {
    const rule = this.rules.get(ruleId);
    if (rule) {
      rule.enabled = true;
    }
  }

  disableRule(ruleId: string): void {
    const rule = this.rules.get(ruleId);
    if (rule) {
      rule.enabled = false;
    }
  }

  async executeRule(ruleId: string, context: Record<string, unknown> = {}): Promise<ExecutionResult> {
    const startTime = Date.now();
    const rule = this.rules.get(ruleId);

    if (!rule) {
      return {
        ruleId,
        success: false,
        executedActions: 0,
        failedActions: 0,
        duration: 0,
        error: "Rule not found"
      };
    }

    if (!rule.enabled) {
      return {
        ruleId,
        success: false,
        executedActions: 0,
        failedActions: 0,
        duration: 0,
        error: "Rule is disabled"
      };
    }

    let executedActions = 0;
    let failedActions = 0;

    for (const action of rule.actions) {
      try {
        await this.executeAction(action, context);
        executedActions++;
      } catch {
        failedActions++;
      }
    }

    const duration = Date.now() - startTime;
    const result: ExecutionResult = {
      ruleId,
      success: failedActions === 0,
      executedActions,
      failedActions,
      duration
    };

    this.executionHistory.push(result);
    return result;
  }

  private async executeAction(action: { type: string; config: ActionConfig }, _context: Record<string, unknown>): Promise<void> {
    // Simulate action execution
    await new Promise(resolve => setTimeout(resolve, 10));

    // Simulate some actions failing based on config
    if (action.config?.shouldFail) {
      throw new Error("Action failed");
    }
  }

  on(event: string, callback: () => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  emit(event: string): void {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach(cb => cb());
  }

  async evaluateTrigger(rule: AutomationRule, event: AutomationEvent): Promise<boolean> {
    if (rule.trigger.type === "event") {
      return event.type === rule.trigger.config.eventType;
    }

    if (rule.trigger.type === "condition") {
      return this.evaluateCondition(rule.trigger.config.condition!, event);
    }

    return false;
  }

  private evaluateCondition(condition: ConditionConfig, data: Record<string, unknown>): boolean {
    const { field, operator, value } = condition;

    const actualValue = data[field];

    switch (operator) {
    case "equals":
      return actualValue === value;
    case "greaterThan":
      return (actualValue as number) > (value as number);
    case "lessThan":
      return (actualValue as number) < (value as number);
    case "contains":
      return String(actualValue).includes(value as string);
    default:
      return false;
    }
  }

  getExecutionHistory(): ExecutionResult[] {
    return [...this.executionHistory];
  }

  clearHistory(): void {
    this.executionHistory = [];
  }

  async processEvent(event: AutomationEvent): Promise<ExecutionResult[]> {
    const results: ExecutionResult[] = [];
    const enabledRules = Array.from(this.rules.values())
      .filter(r => r.enabled)
      .sort((a, b) => b.priority - a.priority);

    for (const rule of enabledRules) {
      const shouldExecute = await this.evaluateTrigger(rule, event);
      if (shouldExecute) {
        const result = await this.executeRule(rule.id, { event });
        results.push(result);
      }
    }

    return results;
  }
}

describe("Automation Engine Tests", () => {
  let engine: AutomationEngine;

  beforeEach(() => {
    engine = new AutomationEngine();
    vi.clearAllMocks();
  });

  afterEach(() => {
    engine.clearHistory();
  });

  describe("Rule Management", () => {
    it("should add a new automation rule", () => {
      const rule: AutomationRule = {
        id: "rule-1",
        name: "Test Rule",
        trigger: { type: "event", config: { eventType: "incident_created" } },
        actions: [{ type: "notify", config: { recipients: ["admin@example.com"] } }],
        enabled: true,
        priority: 1
      };

      engine.addRule(rule);

      const retrieved = engine.getRule("rule-1");
      expect(retrieved).toBeDefined();
      expect(retrieved?.name).toBe("Test Rule");
    });

    it("should remove an automation rule", () => {
      const rule: AutomationRule = {
        id: "rule-1",
        name: "Test Rule",
        trigger: { type: "event", config: {} },
        actions: [],
        enabled: true,
        priority: 1
      };

      engine.addRule(rule);
      engine.removeRule("rule-1");

      const retrieved = engine.getRule("rule-1");
      expect(retrieved).toBeUndefined();
    });

    it("should retrieve all rules", () => {
      const rule1: AutomationRule = {
        id: "rule-1",
        name: "Rule 1",
        trigger: { type: "event", config: {} },
        actions: [],
        enabled: true,
        priority: 1
      };

      const rule2: AutomationRule = {
        id: "rule-2",
        name: "Rule 2",
        trigger: { type: "schedule", config: {} },
        actions: [],
        enabled: true,
        priority: 2
      };

      engine.addRule(rule1);
      engine.addRule(rule2);

      const allRules = engine.getAllRules();
      expect(allRules).toHaveLength(2);
    });

    it("should enable and disable rules", () => {
      const rule: AutomationRule = {
        id: "rule-1",
        name: "Test Rule",
        trigger: { type: "event", config: {} },
        actions: [],
        enabled: true,
        priority: 1
      };

      engine.addRule(rule);
      engine.disableRule("rule-1");

      let retrieved = engine.getRule("rule-1");
      expect(retrieved?.enabled).toBe(false);

      engine.enableRule("rule-1");
      retrieved = engine.getRule("rule-1");
      expect(retrieved?.enabled).toBe(true);
    });

    it("should update existing rule when adding with same ID", () => {
      const rule1: AutomationRule = {
        id: "rule-1",
        name: "Original",
        trigger: { type: "event", config: {} },
        actions: [],
        enabled: true,
        priority: 1
      };

      const rule2: AutomationRule = {
        id: "rule-1",
        name: "Updated",
        trigger: { type: "event", config: {} },
        actions: [],
        enabled: true,
        priority: 2
      };

      engine.addRule(rule1);
      engine.addRule(rule2);

      const retrieved = engine.getRule("rule-1");
      expect(retrieved?.name).toBe("Updated");
    });
  });

  describe("Rule Execution", () => {
    it("should execute a rule successfully", async () => {
      const rule: AutomationRule = {
        id: "rule-1",
        name: "Test Rule",
        trigger: { type: "event", config: {} },
        actions: [
          { type: "log", config: { message: "Test" } },
          { type: "notify", config: { recipient: "user" } }
        ],
        enabled: true,
        priority: 1
      };

      engine.addRule(rule);

      const result = await engine.executeRule("rule-1");

      expect(result.success).toBe(true);
      expect(result.executedActions).toBe(2);
      expect(result.failedActions).toBe(0);
    });

    it("should not execute disabled rules", async () => {
      const rule: AutomationRule = {
        id: "rule-1",
        name: "Test Rule",
        trigger: { type: "event", config: {} },
        actions: [{ type: "log", config: {} }],
        enabled: false,
        priority: 1
      };

      engine.addRule(rule);

      const result = await engine.executeRule("rule-1");

      expect(result.success).toBe(false);
      expect(result.error).toContain("disabled");
    });

    it("should handle rule execution errors", async () => {
      const rule: AutomationRule = {
        id: "rule-1",
        name: "Test Rule",
        trigger: { type: "event", config: {} },
        actions: [
          { type: "action1", config: {} },
          { type: "action2", config: { shouldFail: true } },
          { type: "action3", config: {} }
        ],
        enabled: true,
        priority: 1
      };

      engine.addRule(rule);

      const result = await engine.executeRule("rule-1");

      expect(result.executedActions).toBe(2);
      expect(result.failedActions).toBe(1);
      expect(result.success).toBe(false);
    });

    it("should measure execution duration", async () => {
      const rule: AutomationRule = {
        id: "rule-1",
        name: "Test Rule",
        trigger: { type: "event", config: {} },
        actions: [{ type: "log", config: {} }],
        enabled: true,
        priority: 1
      };

      engine.addRule(rule);

      const result = await engine.executeRule("rule-1");

      expect(result.duration).toBeGreaterThan(0);
    });

    it("should return error for non-existent rule", async () => {
      const result = await engine.executeRule("non-existent");

      expect(result.success).toBe(false);
      expect(result.error).toContain("not found");
    });

    it("should track execution history", async () => {
      const rule: AutomationRule = {
        id: "rule-1",
        name: "Test Rule",
        trigger: { type: "event", config: {} },
        actions: [{ type: "log", config: {} }],
        enabled: true,
        priority: 1
      };

      engine.addRule(rule);

      await engine.executeRule("rule-1");
      await engine.executeRule("rule-1");

      const history = engine.getExecutionHistory();
      expect(history).toHaveLength(2);
    });
  });

  describe("Trigger Evaluation", () => {
    it("should evaluate event-based triggers", async () => {
      const rule: AutomationRule = {
        id: "rule-1",
        name: "Event Rule",
        trigger: {
          type: "event",
          config: { eventType: "incident_created" }
        },
        actions: [],
        enabled: true,
        priority: 1
      };

      const matchingEvent: AutomationEvent = { type: "incident_created", data: {} };
      const nonMatchingEvent: AutomationEvent = { type: "incident_resolved", data: {} };

      expect(await engine.evaluateTrigger(rule, matchingEvent)).toBe(true);
      expect(await engine.evaluateTrigger(rule, nonMatchingEvent)).toBe(false);
    });

    it("should evaluate condition-based triggers with equals operator", async () => {
      const rule: AutomationRule = {
        id: "rule-1",
        name: "Condition Rule",
        trigger: {
          type: "condition",
          config: {
            condition: { field: "severity", operator: "equals", value: "critical" }
          }
        },
        actions: [],
        enabled: true,
        priority: 1
      };

      const matchingData: AutomationEvent = { type: "test", severity: "critical" };
      const nonMatchingData: AutomationEvent = { type: "test", severity: "low" };

      expect(await engine.evaluateTrigger(rule, matchingData)).toBe(true);
      expect(await engine.evaluateTrigger(rule, nonMatchingData)).toBe(false);
    });

    it("should evaluate condition-based triggers with comparison operators", async () => {
      const rule: AutomationRule = {
        id: "rule-1",
        name: "Threshold Rule",
        trigger: {
          type: "condition",
          config: {
            condition: { field: "temperature", operator: "greaterThan", value: 80 }
          }
        },
        actions: [],
        enabled: true,
        priority: 1
      };

      const aboveThreshold: AutomationEvent = { type: "sensor", temperature: 85 };
      const belowThreshold: AutomationEvent = { type: "sensor", temperature: 75 };

      expect(await engine.evaluateTrigger(rule, aboveThreshold)).toBe(true);
      expect(await engine.evaluateTrigger(rule, belowThreshold)).toBe(false);
    });

    it("should evaluate contains operator", async () => {
      const rule: AutomationRule = {
        id: "rule-1",
        name: "Contains Rule",
        trigger: {
          type: "condition",
          config: {
            condition: { field: "message", operator: "contains", value: "error" }
          }
        },
        actions: [],
        enabled: true,
        priority: 1
      };

      const matchingData: AutomationEvent = { type: "log", message: "critical error occurred" };
      const nonMatchingData: AutomationEvent = { type: "log", message: "everything is fine" };

      expect(await engine.evaluateTrigger(rule, matchingData)).toBe(true);
      expect(await engine.evaluateTrigger(rule, nonMatchingData)).toBe(false);
    });

    it("should return false for schedule triggers without time evaluation", async () => {
      const rule: AutomationRule = {
        id: "rule-1",
        name: "Schedule Rule",
        trigger: {
          type: "schedule",
          config: {}
        },
        actions: [],
        enabled: true,
        priority: 1
      };

      const event: AutomationEvent = { type: "tick" };
      expect(await engine.evaluateTrigger(rule, event)).toBe(false);
    });
  });

  describe("Event Processing", () => {
    it("should process events and execute matching rules", async () => {
      const rule1: AutomationRule = {
        id: "rule-1",
        name: "Incident Rule",
        trigger: {
          type: "event",
          config: { eventType: "incident_created" }
        },
        actions: [{ type: "notify", config: { recipient: "admin" } }],
        enabled: true,
        priority: 1
      };

      const rule2: AutomationRule = {
        id: "rule-2",
        name: "Other Rule",
        trigger: {
          type: "event",
          config: { eventType: "maintenance_completed" }
        },
        actions: [{ type: "log", config: { message: "Done" } }],
        enabled: true,
        priority: 1
      };

      engine.addRule(rule1);
      engine.addRule(rule2);

      const results = await engine.processEvent({ type: "incident_created" });

      expect(results).toHaveLength(1);
      expect(results[0].ruleId).toBe("rule-1");
      expect(results[0].success).toBe(true);
    });

    it("should execute rules in priority order", async () => {
      const lowPriority: AutomationRule = {
        id: "low",
        name: "Low Priority",
        trigger: { type: "event", config: { eventType: "test" } },
        actions: [{ type: "log", config: {} }],
        enabled: true,
        priority: 1
      };

      const highPriority: AutomationRule = {
        id: "high",
        name: "High Priority",
        trigger: { type: "event", config: { eventType: "test" } },
        actions: [{ type: "log", config: {} }],
        enabled: true,
        priority: 10
      };

      engine.addRule(lowPriority);
      engine.addRule(highPriority);

      const results = await engine.processEvent({ type: "test" });

      expect(results).toHaveLength(2);
      expect(results[0].ruleId).toBe("high");
    });

    it("should skip disabled rules during event processing", async () => {
      const rule: AutomationRule = {
        id: "rule-1",
        name: "Disabled Rule",
        trigger: { type: "event", config: { eventType: "test" } },
        actions: [{ type: "log", config: {} }],
        enabled: false,
        priority: 1
      };

      engine.addRule(rule);

      const results = await engine.processEvent({ type: "test" });

      expect(results).toHaveLength(0);
    });
  });

  describe("Event System", () => {
    it("should register and emit events", () => {
      const callback = vi.fn();
      engine.on("ruleExecuted", callback);
      engine.emit("ruleExecuted");

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it("should support multiple listeners for same event", () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      engine.on("ruleExecuted", callback1);
      engine.on("ruleExecuted", callback2);
      engine.emit("ruleExecuted");

      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).toHaveBeenCalledTimes(1);
    });
  });

  describe("History Management", () => {
    it("should clear execution history", async () => {
      const rule: AutomationRule = {
        id: "rule-1",
        name: "Test",
        trigger: { type: "event", config: {} },
        actions: [{ type: "log", config: {} }],
        enabled: true,
        priority: 1
      };

      engine.addRule(rule);
      await engine.executeRule("rule-1");

      expect(engine.getExecutionHistory()).toHaveLength(1);

      engine.clearHistory();

      expect(engine.getExecutionHistory()).toHaveLength(0);
    });
  });
});
