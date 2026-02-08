/**
 * PATCH 586: Multi-Level Coordination Engine
 * 
 * Coordinates decisions across different hierarchical levels:
 * - Strategic: Long-term planning and mission goals
 * - Operational: Medium-term resource allocation and execution
 * - Tactical: Short-term immediate actions and responses
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export type DecisionLevel = "strategic" | "operational" | "tactical";

export interface Decision {
  id: string;
  level: DecisionLevel;
  priority: number;
  objective: string;
  action: string;
  resources: string[];
  constraints: Record<string, unknown>;
  timestamp: string;
  confidence: number;
  dependencies: string[];
}

export interface LevelContext {
  level: DecisionLevel;
  objectives: Objective[];
  availableResources: string[];
  constraints: Record<string, unknown>;
  timeHorizon: number;
}

export interface Objective {
  id: string;
  description: string;
  priority: number;
  deadline: string;
  status: "pending" | "in_progress" | "completed" | "blocked";
}

export interface ConflictResolution {
  conflictId: string;
  conflictingDecisions: string[];
  resolution: Decision;
  rationale: string;
  overriddenLevel: DecisionLevel;
  timestamp: string;
}

export interface CoordinationLog {
  timestamp: string;
  level: DecisionLevel;
  eventType: "decision" | "conflict" | "fallback" | "escalation";
  details: Record<string, unknown>;
  outcome: string;
}

export class MultiLevelCoordinationEngine {
  private decisions: Map<string, Decision> = new Map();
  private conflicts: ConflictResolution[] = [];
  private logs: CoordinationLog[] = [];

  async makeStrategicDecision(
    context: LevelContext,
    missionGoals: string[]
  ): Promise<Decision> {
    const decision: Decision = {
      id: `strategic-${Date.now()}`,
      level: "strategic",
      priority: this.calculatePriority(context, "strategic"),
      objective: this.selectTopObjective(context.objectives),
      action: this.planStrategicAction(context, missionGoals),
      resources: this.allocateStrategicResources(context),
      constraints: context.constraints,
      timestamp: new Date().toISOString(),
      confidence: this.assessConfidence(context),
      dependencies: [],
    };

    this.decisions.set(decision.id, decision);
    await this.logDecision(decision, "Strategic decision made");

    return decision;
  }

  async makeOperationalDecision(
    context: LevelContext,
    strategicDecision?: Decision
  ): Promise<Decision> {
    const decision: Decision = {
      id: `operational-${Date.now()}`,
      level: "operational",
      priority: this.calculatePriority(context, "operational"),
      objective: this.selectTopObjective(context.objectives),
      action: this.planOperationalAction(context, strategicDecision),
      resources: this.allocateOperationalResources(context),
      constraints: context.constraints,
      timestamp: new Date().toISOString(),
      confidence: this.assessConfidence(context),
      dependencies: strategicDecision ? [strategicDecision.id] : [],
    };

    if (strategicDecision) {
      const conflict = this.detectConflict(decision, strategicDecision);
      if (conflict) {
        return await this.resolveConflict([decision, strategicDecision]);
      }
    }

    this.decisions.set(decision.id, decision);
    await this.logDecision(decision, "Operational decision made");

    return decision;
  }

  async makeTacticalDecision(
    context: LevelContext,
    operationalDecision?: Decision
  ): Promise<Decision> {
    const decision: Decision = {
      id: `tactical-${Date.now()}`,
      level: "tactical",
      priority: this.calculatePriority(context, "tactical"),
      objective: this.selectTopObjective(context.objectives),
      action: this.planTacticalAction(context),
      resources: this.allocateTacticalResources(context),
      constraints: context.constraints,
      timestamp: new Date().toISOString(),
      confidence: this.assessConfidence(context),
      dependencies: operationalDecision ? [operationalDecision.id] : [],
    };

    if (operationalDecision) {
      const conflict = this.detectConflict(decision, operationalDecision);
      if (conflict) {
        return await this.resolveConflict([decision, operationalDecision]);
      }
    }

    this.decisions.set(decision.id, decision);
    await this.logDecision(decision, "Tactical decision made");

    return decision;
  }

  async coordinateDecisions(
    strategicContext: LevelContext,
    operationalContext: LevelContext,
    tacticalContext: LevelContext,
    missionGoals: string[]
  ): Promise<{
    strategic: Decision;
    operational: Decision;
    tactical: Decision;
    conflicts: ConflictResolution[];
  }> {
    try {
      const strategicDecision = await this.makeStrategicDecision(strategicContext, missionGoals);
      const operationalDecision = await this.makeOperationalDecision(operationalContext, strategicDecision);
      const tacticalDecision = await this.makeTacticalDecision(tacticalContext, operationalDecision);

      await this.performFinalConflictCheck([strategicDecision, operationalDecision, tacticalDecision]);

      return {
        strategic: strategicDecision,
        operational: operationalDecision,
        tactical: tacticalDecision,
        conflicts: this.conflicts,
      };
    } catch (error) {
      await this.logEvent("fallback", "tactical", {
        error: (error as Error).message,
        fallbackReason: "Coordination failure across levels",
      });

      const fallbackDecision = await this.makeTacticalDecision(tacticalContext);
      
      return {
        strategic: fallbackDecision,
        operational: fallbackDecision,
        tactical: fallbackDecision,
        conflicts: [],
      };
    }
  }

  private detectConflict(decision1: Decision, decision2: Decision): boolean {
    const resourceOverlap = decision1.resources.filter(r => decision2.resources.includes(r));
    if (resourceOverlap.length > 0) return true;
    if (decision1.priority > 8 && decision2.priority > 8) return true;
    if (this.violatesConstraints(decision1, decision2)) return true;
    return false;
  }

  private async resolveConflict(decisions: Decision[]): Promise<Decision> {
    const levelPriority = { strategic: 3, operational: 2, tactical: 1 };
    
    const sorted = decisions.sort(
      (a, b) => levelPriority[b.level] - levelPriority[a.level]
    );

    const winner = sorted[0];
    const overridden = sorted[sorted.length - 1];

    const resolution: ConflictResolution = {
      conflictId: `conflict-${Date.now()}`,
      conflictingDecisions: decisions.map(d => d.id),
      resolution: winner,
      rationale: `${winner.level} level decision takes precedence due to hierarchy.`,
      overriddenLevel: overridden.level,
      timestamp: new Date().toISOString(),
    };

    this.conflicts.push(resolution);
    await this.logConflictResolution(resolution);

    return winner;
  }

  private async performFinalConflictCheck(decisions: Decision[]): Promise<void> {
    for (let i = 0; i < decisions.length; i++) {
      for (let j = i + 1; j < decisions.length; j++) {
        const conflict = this.detectConflict(decisions[i], decisions[j]);
        if (conflict) {
          await this.resolveConflict([decisions[i], decisions[j]]);
        }
      }
    }
  }

  private calculatePriority(context: LevelContext, level: DecisionLevel): number {
    const basePriority = { strategic: 7, operational: 5, tactical: 8 };
    let priority = basePriority[level];

    const urgentObjectives = context.objectives.filter(
      obj => obj.priority > 8 && obj.status === "pending"
    );
    if (urgentObjectives.length > 0) priority += 2;

    return Math.min(10, priority);
  }

  private selectTopObjective(objectives: Objective[]): string {
    if (objectives.length === 0) return "No specific objective";

    const sorted = objectives
      .filter(obj => obj.status !== "completed")
      .sort((a, b) => b.priority - a.priority);

    return sorted[0]?.description || "No active objective";
  }

  private violatesConstraints(decision1: Decision, decision2: Decision): boolean {
    const c1 = decision1.constraints as Record<string, number>;
    const c2 = decision2.constraints as Record<string, number>;
    
    if (c1.budget && c2.budget) {
      const totalBudget = c1.budget + c2.budget;
      if (totalBudget > (c1.maxBudget || Infinity)) return true;
    }
    return false;
  }

  private planStrategicAction(_context: LevelContext, goals: string[]): string {
    return `Execute long-term strategy aligned with goals: ${goals.join(", ")}`;
  }

  private planOperationalAction(_context: LevelContext, strategic?: Decision): string {
    if (strategic) return `Implement operational plan supporting: ${strategic.objective}`;
    return "Execute operational plan based on available resources";
  }

  private planTacticalAction(context: LevelContext): string {
    return `Execute immediate action for: ${this.selectTopObjective(context.objectives)}`;
  }

  private allocateStrategicResources(context: LevelContext): string[] {
    return context.availableResources.filter(r => r.includes("long-term") || r.includes("strategic"));
  }

  private allocateOperationalResources(context: LevelContext): string[] {
    return context.availableResources.filter(r => r.includes("operational") || r.includes("execution"));
  }

  private allocateTacticalResources(context: LevelContext): string[] {
    return context.availableResources.filter(r => r.includes("tactical") || r.includes("immediate"));
  }

  private assessConfidence(context: LevelContext): number {
    let confidence = 0.7;
    if (context.objectives.length > 0) confidence += 0.1;
    if (context.availableResources.length > 2) confidence += 0.1;
    if (Object.keys(context.constraints).length > 0) confidence += 0.1;
    return Math.min(1.0, confidence);
  }

  /**
   * Log to ai_audit_logs table (exists in typed schema)
   */
  private async logDecision(decision: Decision, outcome: string): Promise<void> {
    const log: CoordinationLog = {
      timestamp: new Date().toISOString(),
      level: decision.level,
      eventType: "decision",
      details: {
        decisionId: decision.id,
        objective: decision.objective,
        action: decision.action,
        priority: decision.priority,
        confidence: decision.confidence,
      },
      outcome,
    };

    this.logs.push(log);

    try {
      await supabase.from("ai_audit_logs").insert({
        user_input: `coordination:${decision.level}:${decision.id}`,
        ai_response: outcome,
        interaction_type: "coordination_decision",
        module_name: "multi_level_engine",
        confidence_score: decision.confidence,
      });
    } catch (error) {
      logger.error("[MultiLevelCoordination] Failed to log decision:", error);
    }
  }

  private async logConflictResolution(resolution: ConflictResolution): Promise<void> {
    const log: CoordinationLog = {
      timestamp: resolution.timestamp,
      level: resolution.resolution.level,
      eventType: "conflict",
      details: {
        conflictId: resolution.conflictId,
        conflictingDecisions: resolution.conflictingDecisions,
        resolutionId: resolution.resolution.id,
        overriddenLevel: resolution.overriddenLevel,
      },
      outcome: resolution.rationale,
    };

    this.logs.push(log);

    try {
      await supabase.from("ai_audit_logs").insert({
        user_input: `conflict:${resolution.conflictId}`,
        ai_response: resolution.rationale,
        interaction_type: "conflict_resolution",
        module_name: "multi_level_engine",
      });
    } catch (error) {
      logger.error("[MultiLevelCoordination] Failed to log conflict resolution:", error);
    }
  }

  private async logEvent(
    eventType: CoordinationLog["eventType"],
    level: DecisionLevel,
    details: Record<string, unknown>
  ): Promise<void> {
    const log: CoordinationLog = {
      timestamp: new Date().toISOString(),
      level,
      eventType,
      details,
      outcome: `${eventType} at ${level} level`,
    };

    this.logs.push(log);

    try {
      await supabase.from("ai_audit_logs").insert({
        user_input: `event:${eventType}:${level}`,
        ai_response: log.outcome,
        interaction_type: eventType,
        module_name: "multi_level_engine",
      });
    } catch (error) {
      logger.error("[MultiLevelCoordination] Failed to log event:", error);
    }
  }

  getLogs(level?: DecisionLevel): CoordinationLog[] {
    if (level) return this.logs.filter(log => log.level === level);
    return [...this.logs];
  }

  getDecisions(level?: DecisionLevel): Decision[] {
    const allDecisions = Array.from(this.decisions.values());
    if (level) return allDecisions.filter(d => d.level === level);
    return allDecisions;
  }

  getConflicts(): ConflictResolution[] {
    return [...this.conflicts];
  }

  exportHierarchy(): Record<string, unknown> {
    return {
      strategic: this.getDecisions("strategic"),
      operational: this.getDecisions("operational"),
      tactical: this.getDecisions("tactical"),
      conflicts: this.conflicts,
      logs: this.logs,
    };
  }
}

export const multiLevelEngine = new MultiLevelCoordinationEngine();
