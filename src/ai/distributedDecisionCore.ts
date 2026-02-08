/**
 * PATCH 217 - Distributed Decision Core
 * Enables local autonomous decision-making with escalation to collective when conflicts arise
 * DEBT-FIX: Removed (supabase as any) - decision_history has different schema, using distributed_decisions
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import { contextMesh, ContextType } from "@/core/context/contextMesh";

export type DecisionLevel = "local" | "escalated" | "delegated" | "collaborative";
export type DecisionStatus = "pending" | "executing" | "completed" | "failed" | "timeout";
export type DecisionPriority = "low" | "medium" | "high" | "critical";

export interface DecisionContext {
  moduleName: string;
  decisionType: string;
  contextData: Record<string, any>;
  constraints?: Record<string, any>;
  dependencies?: string[];
}

export interface Decision {
  id: string;
  moduleName: string;
  decisionLevel: DecisionLevel;
  decisionType: string;
  context: DecisionContext;
  action: string;
  priority: DecisionPriority;
  status: DecisionStatus;
  timeoutMs: number;
  executed: boolean;
  success?: boolean;
  errorMessage?: string;
  simulationResults?: SimulationResult[];
  escalationReason?: string;
  timestamp: Date;
  executedAt?: Date;
}

export interface SimulationResult {
  scenario: string;
  outcome: string;
  confidence: number;
  risks: string[];
  benefits: string[];
}

export interface DecisionRule {
  id: string;
  name: string;
  moduleName: string;
  priority: DecisionPriority;
  condition: (context: DecisionContext) => boolean | Promise<boolean>;
  action: (context: DecisionContext) => string | Promise<string>;
  requiresEscalation: boolean;
  timeoutMs?: number;
}

class DistributedDecisionCore {
  private rules: Map<string, DecisionRule> = new Map();
  private pendingDecisions: Map<string, Decision> = new Map();
  private decisionCallbacks: Map<string, (decision: Decision) => void> = new Map();
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      logger.warn("[DistributedDecisionCore] Already initialized");
      return;
    }

    logger.info("[DistributedDecisionCore] Initializing distributed decision core...");

    await contextMesh.initialize();

    contextMesh.subscribe({
      moduleName: "DistributedDecisionCore",
      contextTypes: ["ai", "mission", "risk"],
      handler: (message) => {
        this.handleContextUpdate(message.contextData);
      }
    });

    this.isInitialized = true;
    logger.info("[DistributedDecisionCore] Distributed decision core initialized successfully");
  }

  registerRule(rule: DecisionRule): void {
    this.rules.set(rule.id, rule);
    logger.debug(`[DistributedDecisionCore] Registered rule: ${rule.name} for ${rule.moduleName}`);
  }

  unregisterRule(ruleId: string): void {
    this.rules.delete(ruleId);
    logger.debug(`[DistributedDecisionCore] Unregistered rule: ${ruleId}`);
  }

  async makeDecision(context: DecisionContext): Promise<Decision> {
    const decisionId = `dec_${Date.now()}_${crypto.randomUUID().slice(0, 9)}`;
    
    const applicableRules = await this.findApplicableRules(context);
    
    if (applicableRules.length === 0) {
      logger.warn(`[DistributedDecisionCore] No applicable rules for ${context.moduleName}`);
      return this.createDefaultDecision(decisionId, context);
    }

    const sortedRules = this.sortRulesByPriority(applicableRules);
    const topRule = sortedRules[0];

    if (topRule.requiresEscalation || applicableRules.length > 1) {
      return await this.escalateDecision(decisionId, context, applicableRules);
    }

    return await this.executeLocalDecision(decisionId, context, topRule);
  }

  async executeDecisionWithTimeout(decision: Decision): Promise<Decision> {
    return new Promise((resolve) => {
      const timeoutId = setTimeout(() => {
        if (decision.status === "executing") {
          decision.status = "timeout";
          decision.errorMessage = `Decision timed out after ${decision.timeoutMs}ms`;
          logger.warn(`[DistributedDecisionCore] Decision ${decision.id} timed out`);
          resolve(decision);
        }
      }, decision.timeoutMs);

      this.executeDecision(decision)
        .then((result) => {
          clearTimeout(timeoutId);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          decision.status = "failed";
          decision.errorMessage = error.message;
          resolve(decision);
        });
    });
  }

  async runSimulations(context: DecisionContext): Promise<SimulationResult[]> {
    const simulations: SimulationResult[] = [];

    try {
      const scenarios = this.generateScenarios(context);

      const simulationPromises = scenarios.map(async (scenario) => {
        try {
          const result = await this.simulateScenario(scenario, context);
          return result;
        } catch (error) {
          logger.error(`[DistributedDecisionCore] Simulation failed for scenario: ${scenario}`, error);
          return null;
        }
      });

      const results = await Promise.all(simulationPromises);
      simulations.push(...results.filter((r): r is SimulationResult => r !== null));

      logger.debug(`[DistributedDecisionCore] Completed ${simulations.length} simulations`);
    } catch (error) {
      logger.error("[DistributedDecisionCore] Failed to run simulations", error);
    }

    return simulations;
  }

  /**
   * Log decision to database using distributed_decisions table
   */
  async logDecision(decision: Decision): Promise<void> {
    try {
      const { error } = await supabase.from("distributed_decisions").insert({
        decision_level: decision.decisionLevel,
        decision_type: decision.decisionType,
        context: decision.context as any,
        priority: decision.priority,
        decision_status: decision.status,
        confidence: decision.success ? 1.0 : 0.0,
        outcome: decision.action,
        escalation_reason: decision.escalationReason,
        simulation_result: decision.simulationResults as any,
        executed_at: decision.executedAt?.toISOString(),
      });

      if (error) {
        logger.error("[DistributedDecisionCore] Failed to log decision", error);
      }

      await contextMesh.publish({
        moduleName: decision.moduleName,
        contextType: "ai" as ContextType,
        contextData: {
          decision: {
            id: decision.id,
            level: decision.decisionLevel,
            type: decision.decisionType,
            status: decision.status,
            success: decision.success
          }
        },
        source: "DistributedDecisionCore"
      });
    } catch (error) {
      logger.error("[DistributedDecisionCore] Error logging decision", error);
    }
  }

  /**
   * Get decision history from distributed_decisions table
   */
  async getDecisionHistory(
    moduleName?: string,
    limit: number = 100
  ): Promise<Decision[]> {
    try {
      let query = supabase
        .from("distributed_decisions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (moduleName) {
        query = query.eq("decision_type", moduleName);
      }

      const { data, error } = await query;

      if (error) {
        logger.error("[DistributedDecisionCore] Failed to get decision history", error);
        return [];
      }

      return (data || []).map(row => this.mapRowToDecision(row));
    } catch (error) {
      logger.error("[DistributedDecisionCore] Error getting decision history", error);
      return [];
    }
  }

  // Private methods

  private async findApplicableRules(context: DecisionContext): Promise<DecisionRule[]> {
    const applicable: DecisionRule[] = [];

    for (const rule of this.rules.values()) {
      if (rule.moduleName !== context.moduleName) continue;

      try {
        const matches = await rule.condition(context);
        if (matches) {
          applicable.push(rule);
        }
      } catch (error) {
        logger.error(`[DistributedDecisionCore] Error evaluating rule ${rule.id}`, error);
      }
    }

    return applicable;
  }

  private sortRulesByPriority(rules: DecisionRule[]): DecisionRule[] {
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    return rules.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
  }

  private async executeLocalDecision(
    decisionId: string,
    context: DecisionContext,
    rule: DecisionRule
  ): Promise<Decision> {
    const action = await rule.action(context);

    const decision: Decision = {
      id: decisionId,
      moduleName: context.moduleName,
      decisionLevel: "local",
      decisionType: context.decisionType,
      context,
      action,
      priority: rule.priority,
      status: "executing",
      timeoutMs: rule.timeoutMs || 5000,
      executed: false,
      timestamp: new Date()
    };

    this.pendingDecisions.set(decisionId, decision);

    const result = await this.executeDecisionWithTimeout(decision);
    
    await this.logDecision(result);

    this.pendingDecisions.delete(decisionId);
    
    return result;
  }

  private async escalateDecision(
    decisionId: string,
    context: DecisionContext,
    conflictingRules: DecisionRule[]
  ): Promise<Decision> {
    logger.info(`[DistributedDecisionCore] Escalating decision for ${context.moduleName}`);

    const simulations = await this.runSimulations(context);

    const decision: Decision = {
      id: decisionId,
      moduleName: context.moduleName,
      decisionLevel: "escalated",
      decisionType: context.decisionType,
      context,
      action: "escalated_to_collective",
      priority: "high",
      status: "pending",
      timeoutMs: 30000,
      executed: false,
      simulationResults: simulations,
      escalationReason: `${conflictingRules.length} conflicting rules found`,
      timestamp: new Date()
    };

    await contextMesh.publish({
      moduleName: context.moduleName,
      contextType: "ai" as ContextType,
      contextData: {
        escalation: {
          decisionId,
          reason: decision.escalationReason,
          simulations
        }
      },
      source: "DistributedDecisionCore"
    });

    await this.logDecision(decision);

    return decision;
  }

  private createDefaultDecision(decisionId: string, context: DecisionContext): Decision {
    return {
      id: decisionId,
      moduleName: context.moduleName,
      decisionLevel: "local",
      decisionType: context.decisionType,
      context,
      action: "no_action",
      priority: "low",
      status: "completed",
      timeoutMs: 1000,
      executed: true,
      success: true,
      timestamp: new Date(),
      executedAt: new Date()
    };
  }

  private async executeDecision(decision: Decision): Promise<Decision> {
    decision.status = "executing";
    decision.executed = true;
    decision.executedAt = new Date();

    try {
      await new Promise(resolve => setTimeout(resolve, 100));

      decision.status = "completed";
      decision.success = true;
      
      return decision;
    } catch (error) {
      decision.status = "failed";
      decision.success = false;
      decision.errorMessage = error instanceof Error ? error.message : "Unknown error";
      
      return decision;
    }
  }

  private generateScenarios(context: DecisionContext): string[] {
    return [
      "optimistic",
      "pessimistic",
      "balanced",
      "high_risk",
      "low_risk"
    ];
  }

  private async simulateScenario(
    scenario: string,
    context: DecisionContext
  ): Promise<SimulationResult> {
    const confidence = 0.5 + Math.random() * 0.5;

    return {
      scenario,
      outcome: `Simulated outcome for ${scenario}`,
      confidence,
      risks: [`Risk A for ${scenario}`, `Risk B for ${scenario}`],
      benefits: [`Benefit A for ${scenario}`, `Benefit B for ${scenario}`]
    };
  }

  private handleContextUpdate(contextData: Record<string, any>): void {
    logger.debug("[DistributedDecisionCore] Received context update", contextData);
  }

  private mapRowToDecision(row: any): Decision {
    return {
      id: row.id,
      moduleName: row.decision_type,
      decisionLevel: row.decision_level,
      decisionType: row.decision_type,
      context: row.context || {},
      action: row.outcome || "no_action",
      priority: row.priority,
      status: row.decision_status || "completed",
      timeoutMs: 5000,
      executed: true,
      success: row.decision_status === "completed",
      errorMessage: undefined,
      simulationResults: row.simulation_result,
      escalationReason: row.escalation_reason,
      timestamp: new Date(row.created_at),
      executedAt: row.executed_at ? new Date(row.executed_at) : undefined
    };
  }
}

export const distributedDecisionCore = new DistributedDecisionCore();
