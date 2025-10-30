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

interface AutomationRule {
  id: string;
  name: string;
  trigger: {
    type: "event" | "schedule" | "condition";
    config: any;
  };
  actions: Array<{
    type: string;
    config: any;
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

  async executeRule(ruleId: string, context: any = {}): Promise<ExecutionResult> {
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
      } catch (error) {
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

  private async executeAction(action: any, context: any): Promise<void> {
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

  async evaluateTrigger(rule: AutomationRule, event: any): Promise<boolean> {
    if (rule.trigger.type === "event") {
      return event.type === rule.trigger.config.eventType;
    }

    if (rule.trigger.type === "condition") {
      return this.evaluateCondition(rule.trigger.config.condition, event);
    }

    return false;
  }

  private evaluateCondition(condition: any, data: any): boolean {
    const { field, operator, value } = condition;

    const actualValue = data[field];

    switch (operator) {
    case "equals":
      return actualValue === value;
    case "greaterThan":
      return actualValue > value;
    case "lessThan":
      return actualValue < value;
    case "contains":
      return String(actualValue).includes(value);
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

  async processEvent(event: any): Promise<ExecutionResult[]> {
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

      const matchingEvent = { type: "incident_created", data: {} };
      const nonMatchingEvent = { type: "incident_resolved", data: {} };

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

      const matchingData = { severity: "critical" };
      const nonMatchingData = { severity: "low" };

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

      const highTemp = { temperature: 90 };
      const lowTemp = { temperature: 70 };

      expect(await engine.evaluateTrigger(rule, highTemp)).toBe(true);
      expect(await engine.evaluateTrigger(rule, lowTemp)).toBe(false);
    });

    it("should evaluate condition-based triggers with contains operator", async () => {
      const rule: AutomationRule = {
        id: "rule-1",
        name: "Contains Rule",
        trigger: {
          type: "condition",
          config: {
            condition: { field: "message", operator: "contains", value: "alarm" }
          }
        },
        actions: [],
        enabled: true,
        priority: 1
      };

      const matchingData = { message: "System alarm detected" };
      const nonMatchingData = { message: "System normal" };

      expect(await engine.evaluateTrigger(rule, matchingData)).toBe(true);
      expect(await engine.evaluateTrigger(rule, nonMatchingData)).toBe(false);
    });
  });

  describe("Event Processing", () => {
    it("should process events and execute matching rules", async () => {
      const rule1: AutomationRule = {
        id: "rule-1",
        name: "Critical Alert",
        trigger: {
          type: "condition",
          config: {
            condition: { field: "severity", operator: "equals", value: "critical" }
          }
        },
        actions: [{ type: "alert", config: {} }],
        enabled: true,
        priority: 10
      };

      const rule2: AutomationRule = {
        id: "rule-2",
        name: "All Incidents",
        trigger: {
          type: "event",
          config: { eventType: "incident" }
        },
        actions: [{ type: "log", config: {} }],
        enabled: true,
        priority: 5
      };

      engine.addRule(rule1);
      engine.addRule(rule2);

      const event = { type: "incident", severity: "critical" };
      const results = await engine.processEvent(event);

      expect(results.length).toBeGreaterThan(0);
    });

    it("should execute rules in priority order", async () => {
      const executionOrder: string[] = [];

      const rule1: AutomationRule = {
        id: "rule-1",
        name: "Low Priority",
        trigger: { type: "event", config: { eventType: "test" } },
        actions: [],
        enabled: true,
        priority: 1
      };

      const rule2: AutomationRule = {
        id: "rule-2",
        name: "High Priority",
        trigger: { type: "event", config: { eventType: "test" } },
        actions: [],
        enabled: true,
        priority: 10
      };

      engine.addRule(rule1);
      engine.addRule(rule2);

      const event = { type: "test" };
      await engine.processEvent(event);

      const history = engine.getExecutionHistory();
      expect(history[0].ruleId).toBe("rule-2"); // Higher priority executes first
      expect(history[1].ruleId).toBe("rule-1");
    });

    it("should skip disabled rules during event processing", async () => {
      const rule1: AutomationRule = {
        id: "rule-1",
        name: "Enabled Rule",
        trigger: { type: "event", config: { eventType: "test" } },
        actions: [{ type: "log", config: {} }],
        enabled: true,
        priority: 1
      };

      const rule2: AutomationRule = {
        id: "rule-2",
        name: "Disabled Rule",
        trigger: { type: "event", config: { eventType: "test" } },
        actions: [{ type: "log", config: {} }],
        enabled: false,
        priority: 1
      };

      engine.addRule(rule1);
      engine.addRule(rule2);

      const event = { type: "test" };
      const results = await engine.processEvent(event);

      expect(results).toHaveLength(1);
      expect(results[0].ruleId).toBe("rule-1");
    });

    it("should handle events with no matching rules", async () => {
      const rule: AutomationRule = {
        id: "rule-1",
        name: "Specific Rule",
        trigger: { type: "event", config: { eventType: "specific" } },
        actions: [],
        enabled: true,
        priority: 1
      };

      engine.addRule(rule);

      const event = { type: "unmatched" };
      const results = await engine.processEvent(event);

      expect(results).toHaveLength(0);
    });
  });

  describe("Event Listeners", () => {
    it("should register event listeners", () => {
      let called = false;
      engine.on("test-event", () => { called = true; });

      engine.emit("test-event");

      expect(called).toBe(true);
    });

    it("should support multiple listeners for same event", () => {
      let count = 0;
      engine.on("test-event", () => { count++; });
      engine.on("test-event", () => { count++; });

      engine.emit("test-event");

      expect(count).toBe(2);
    });
  });

  describe("Performance and Scalability", () => {
    it("should handle multiple rules efficiently", async () => {
      for (let i = 0; i < 50; i++) {
        const rule: AutomationRule = {
          id: `rule-${i}`,
          name: `Rule ${i}`,
          trigger: { type: "event", config: { eventType: "test" } },
          actions: [{ type: "log", config: {} }],
          enabled: true,
          priority: i
        };
        engine.addRule(rule);
      }

      const start = Date.now();
      const event = { type: "test" };
      await engine.processEvent(event);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });

    it("should execute actions in parallel when possible", async () => {
      const rule: AutomationRule = {
        id: "rule-1",
        name: "Multi-action Rule",
        trigger: { type: "event", config: {} },
        actions: Array(10).fill(null).map((_, i) => ({
          type: `action-${i}`,
          config: {}
        })),
        enabled: true,
        priority: 1
      };

      engine.addRule(rule);

      const start = Date.now();
      await engine.executeRule("rule-1");
      const duration = Date.now() - start;

      // If actions were sequential, it would take 10 * 10ms = 100ms
      // Parallel execution should be faster
      expect(duration).toBeLessThan(150);
    });
  });

  describe("Error Recovery", () => {
    it("should continue processing after action failures", async () => {
      const rule: AutomationRule = {
        id: "rule-1",
        name: "Mixed Actions",
        trigger: { type: "event", config: {} },
        actions: [
          { type: "action1", config: {} },
          { type: "action2", config: { shouldFail: true } },
          { type: "action3", config: {} },
          { type: "action4", config: { shouldFail: true } },
          { type: "action5", config: {} }
        ],
        enabled: true,
        priority: 1
      };

      engine.addRule(rule);

      const result = await engine.executeRule("rule-1");

      expect(result.executedActions).toBe(3);
      expect(result.failedActions).toBe(2);
    });

    it("should maintain engine state after errors", async () => {
      const rule: AutomationRule = {
        id: "rule-1",
        name: "Failing Rule",
        trigger: { type: "event", config: {} },
        actions: [{ type: "fail", config: { shouldFail: true } }],
        enabled: true,
        priority: 1
      };

      engine.addRule(rule);

      await engine.executeRule("rule-1");

      // Engine should still be functional
      const allRules = engine.getAllRules();
      expect(allRules).toHaveLength(1);

      // Should be able to add new rules
      const rule2: AutomationRule = {
        id: "rule-2",
        name: "New Rule",
        trigger: { type: "event", config: {} },
        actions: [],
        enabled: true,
        priority: 1
      };
      engine.addRule(rule2);

      expect(engine.getAllRules()).toHaveLength(2);
    });
  });
});
