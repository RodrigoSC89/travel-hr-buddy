
/**
 * PATCH 586: Multi-Level Coordination Engine
 * 
 * Coordinates decisions across different hierarchical levels:
 * - Strategic: Long-term planning and mission goals
 * - Operational: Medium-term resource allocation and execution
 * - Tactical: Short-term immediate actions and responses
 * 
 * Features:
 * - Hierarchical decision structure with fallback
 * - Conflict resolution between levels
 * - Priority-based objective management
 * - Per-layer decision logging
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
  constraints: Record<string, any>;
  timestamp: string;
  confidence: number;
  dependencies: string[];
}

export interface LevelContext {
  level: DecisionLevel;
  objectives: Objective[];
  availableResources: string[];
  constraints: Record<string, any>;
  timeHorizon: number; // in hours
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
  details: Record<string, any>;
  outcome: string;
}

export class MultiLevelCoordinationEngine {
  private decisions: Map<string, Decision> = new Map();
  private conflicts: ConflictResolution[] = [];
  private logs: CoordinationLog[] = [];

  /**
   * Strategic level: Long-term planning (weeks to months)
   */
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
      confidence: this.assessConfidence(context, "strategic"),
      dependencies: [],
    };

    this.decisions.set(decision.id, decision);
    await this.logDecision(decision, "Strategic decision made");

    return decision;
  }

  /**
   * Operational level: Medium-term execution (days to weeks)
   */
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
      confidence: this.assessConfidence(context, "operational"),
      dependencies: strategicDecision ? [strategicDecision.id] : [],
    };

    // Check for conflicts with strategic level
    if (strategicDecision) {
      const conflict = this.detectConflict(decision, strategicDecision);
      if (conflict) {
        const resolution = await this.resolveConflict([decision, strategicDecision]);
        return resolution;
      }
    }

    this.decisions.set(decision.id, decision);
    await this.logDecision(decision, "Operational decision made");

    return decision;
  }

  /**
   * Tactical level: Immediate actions (minutes to hours)
   */
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
      confidence: this.assessConfidence(context, "tactical"),
      dependencies: operationalDecision ? [operationalDecision.id] : [],
    };

    // Check for conflicts with operational level
    if (operationalDecision) {
      const conflict = this.detectConflict(decision, operationalDecision);
      if (conflict) {
        const resolution = await this.resolveConflict([decision, operationalDecision]);
        return resolution;
      }
    }

    this.decisions.set(decision.id, decision);
    await this.logDecision(decision, "Tactical decision made");

    return decision;
  }

  /**
   * Coordinate decisions across all levels with fallback
   */
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
      // Make strategic decision first
      const strategicDecision = await this.makeStrategicDecision(
        strategicContext,
        missionGoals
      );

      // Make operational decision aligned with strategic
      const operationalDecision = await this.makeOperationalDecision(
        operationalContext,
        strategicDecision
      );

      // Make tactical decision aligned with operational
      const tacticalDecision = await this.makeTacticalDecision(
        tacticalContext,
        operationalDecision
      );

      // Final conflict check across all levels
      await this.performFinalConflictCheck([
        strategicDecision,
        operationalDecision,
        tacticalDecision,
      ]);

      return {
        strategic: strategicDecision,
        operational: operationalDecision,
        tactical: tacticalDecision,
        conflicts: this.conflicts,
      };
    } catch (error) {
      // Fallback to tactical-only decision in case of coordination failure
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

  /**
   * Detect conflicts between decisions at different levels
   */
  private detectConflict(decision1: Decision, decision2: Decision): boolean {
    // Resource conflicts
    const resourceOverlap = decision1.resources.filter(r =>
      decision2.resources.includes(r)
    );
    if (resourceOverlap.length > 0) {
      return true;
    }

    // Objective conflicts (opposing priorities)
    if (decision1.priority > 8 && decision2.priority > 8) {
      // Both high priority but at different levels - potential conflict
      return true;
    }

    // Constraint violations
    if (this.violatesConstraints(decision1, decision2)) {
      return true;
    }

    return false;
  }

  /**
   * Resolve conflicts between decisions (higher level wins)
   */
  private async resolveConflict(decisions: Decision[]): Promise<Decision> {
    const levelPriority = { strategic: 3, operational: 2, tactical: 1 };
    
    // Sort by level priority (strategic > operational > tactical)
    const sorted = decisions.sort(
      (a, b) => levelPriority[b.level] - levelPriority[a.level]
    );

    const winner = sorted[0];
    const overridden = sorted[sorted.length - 1];

    const resolution: ConflictResolution = {
      conflictId: `conflict-${Date.now()}`,
      conflictingDecisions: decisions.map(d => d.id),
      resolution: winner,
      rationale: `${winner.level} level decision takes precedence due to hierarchy. ${overridden.level} level decision conflicts with ${winner.level} objectives.`,
      overriddenLevel: overridden.level,
      timestamp: new Date().toISOString(),
    };

    this.conflicts.push(resolution);
    await this.logConflictResolution(resolution);

    return winner;
  }

  /**
   * Perform final conflict check across all levels
   */
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

  /**
   * Calculate priority based on level and context
   */
  private calculatePriority(context: LevelContext, level: DecisionLevel): number {
    const basePriority = {
      strategic: 7,
      operational: 5,
      tactical: 8, // Higher for immediate response
    };

    let priority = basePriority[level];

    // Adjust based on objectives
    const urgentObjectives = context.objectives.filter(
      obj => obj.priority > 8 && obj.status === "pending"
    );
    if (urgentObjectives.length > 0) {
      priority += 2;
    }

    return Math.min(10, priority);
  }

  /**
   * Select the top priority objective
   */
  private selectTopObjective(objectives: Objective[]): string {
    if (objectives.length === 0) {
      return "No specific objective";
    }

    const sorted = objectives
      .filter(obj => obj.status !== "completed")
      .sort((a, b) => b.priority - a.priority);

    return sorted[0]?.description || "No active objective";
  }

  /**
   * Check if decisions violate constraints
   */
  private violatesConstraints(decision1: Decision, decision2: Decision): boolean {
    // Check budget constraints
    if (decision1.constraints.budget && decision2.constraints.budget) {
      const totalBudget = decision1.constraints.budget + decision2.constraints.budget;
      if (totalBudget > decision1.constraints.maxBudget) {
        return true;
      }
    }

    // Check timeline conflicts
    if (decision1.constraints.deadline && decision2.constraints.deadline) {
      if (decision1.constraints.deadline < decision2.constraints.deadline) {
        // Note: timeHorizon is not part of Decision type, using constraints instead
        const timeHorizon1 = decision1.constraints.timeHorizon || 0;
        const timeHorizon2 = decision2.constraints.timeHorizon || 0;
        return timeHorizon1 + timeHorizon2 > (decision1.constraints.maxTimeHorizon || Infinity);
      }
    }

    return false;
  }

  /**
   * Planning methods for each level
   */
  private planStrategicAction(context: LevelContext, goals: string[]): string {
    return `Execute long-term strategy aligned with goals: ${goals.join(", ")}`;
  }

  private planOperationalAction(
    context: LevelContext,
    strategic?: Decision
  ): string {
    if (strategic) {
      return `Implement operational plan supporting: ${strategic.objective}`;
    }
    return "Execute operational plan based on available resources";
  }

  private planTacticalAction(context: LevelContext): string {
    return `Execute immediate action for: ${this.selectTopObjective(context.objectives)}`;
  }

  /**
   * Resource allocation for each level
   */
  private allocateStrategicResources(context: LevelContext): string[] {
    return context.availableResources.filter(r => 
      r.includes("long-term") || r.includes("strategic")
    );
  }

  private allocateOperationalResources(context: LevelContext): string[] {
    return context.availableResources.filter(r =>
      r.includes("operational") || r.includes("execution")
    );
  }

  private allocateTacticalResources(context: LevelContext): string[] {
    return context.availableResources.filter(r =>
      r.includes("tactical") || r.includes("immediate")
    );
  }

  /**
   * Assess confidence based on context completeness
   */
  private assessConfidence(context: LevelContext, level: DecisionLevel): number {
    let confidence = 0.7;

    if (context.objectives.length > 0) confidence += 0.1;
    if (context.availableResources.length > 2) confidence += 0.1;
    if (Object.keys(context.constraints).length > 0) confidence += 0.1;

    return Math.min(1.0, confidence);
  }

  /**
   * Logging methods
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
      await (supabase as any).from("coordination_log").insert({
        level: decision.level,
        event_type: "decision",
        decision_id: decision.id,
        details: log.details,
        outcome,
        timestamp: log.timestamp,
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
      await (supabase as any).from("coordination_log").insert({
        level: resolution.resolution.level,
        event_type: "conflict",
        decision_id: resolution.resolution.id,
        details: log.details,
        outcome: resolution.rationale,
        timestamp: log.timestamp,
      });
    } catch (error) {
      logger.error("[MultiLevelCoordination] Failed to log conflict resolution:", error);
    }
  }

  private async logEvent(
    eventType: CoordinationLog["eventType"],
    level: DecisionLevel,
    details: Record<string, any>
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
      await (supabase as any).from("coordination_log").insert({
        level,
        event_type: eventType,
        decision_id: null,
        details,
        outcome: log.outcome,
        timestamp: log.timestamp,
      });
    } catch (error) {
      logger.error("[MultiLevelCoordination] Failed to log event:", error);
    }
  }

  /**
   * Get logs for a specific level or all levels
   */
  getLogs(level?: DecisionLevel): CoordinationLog[] {
    if (level) {
      return this.logs.filter(log => log.level === level);
    }
    return [...this.logs];
  }

  /**
   * Get all decisions
   */
  getDecisions(level?: DecisionLevel): Decision[] {
    const allDecisions = Array.from(this.decisions.values());
    if (level) {
      return allDecisions.filter(d => d.level === level);
    }
    return allDecisions;
  }

  /**
   * Get all conflicts
   */
  getConflicts(): ConflictResolution[] {
    return [...this.conflicts];
  }

  /**
   * Export decision hierarchy for visualization
   */
  exportHierarchy(): Record<string, any> {
    return {
      strategic: this.getDecisions("strategic"),
      operational: this.getDecisions("operational"),
      tactical: this.getDecisions("tactical"),
      conflicts: this.conflicts,
      logs: this.logs,
    };
  }
}

// Export singleton instance
export const multiLevelEngine = new MultiLevelCoordinationEngine();
