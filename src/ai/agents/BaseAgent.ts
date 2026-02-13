/**
 * 🤖 Base Agent Class
 * Classe base para todos os agentes autônomos
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import type {
  AgentType,
  AgentStatus,
  AgentConfig,
  AgentContext,
  AgentObservation,
  AgentDecision,
  AgentAction,
  AgentMemory,
  AgentMetrics,
} from "./types";

export abstract class BaseAgent {
  protected config: AgentConfig;
  protected status: AgentStatus = "idle";
  protected currentContext?: AgentContext;
  protected observations: AgentObservation[] = [];
  protected decisions: AgentDecision[] = [];
  protected memories: AgentMemory[] = [];

  constructor(config: AgentConfig) {
    this.config = config;
    logger.info(`[${config.name}] Agent initialized`, { type: config.type });
  }

  // Abstract methods to be implemented by specific agents
  abstract analyze(observations: AgentObservation[]): Promise<AgentDecision[]>;
  abstract execute(decision: AgentDecision): Promise<AgentAction>;
  abstract learn(action: AgentAction, outcome: "success" | "failure"): Promise<void>;

  // Lifecycle methods
  async observe(context: AgentContext): Promise<AgentObservation[]> {
    this.status = "analyzing";
    this.currentContext = context;

    try {
      const observations = await this.gatherObservations(context);
      this.observations = observations;
      return observations;
    } catch (error) {
      logger.error(`[${this.config.name}] Observation failed`, { error });
      throw error;
    }
  }

  protected abstract gatherObservations(context: AgentContext): Promise<AgentObservation[]>;

  async decide(): Promise<AgentDecision[]> {
    if (this.observations.length === 0) {
      return [];
    }

    this.status = "deciding";

    try {
      const decisions = await this.analyze(this.observations);
      this.decisions = decisions;

      // Log decisions
      for (const decision of decisions) {
        await this.logDecision(decision);
      }

      return decisions;
    } catch (error) {
      logger.error(`[${this.config.name}] Decision failed`, { error });
      throw error;
    }
  }

  async act(decision: AgentDecision): Promise<AgentAction> {
    this.status = "executing";

    try {
      // Check if requires approval
      if (decision.requiresApproval && !decision.autoExecute) {
        return {
          id: crypto.randomUUID(),
          decisionId: decision.id,
          type: "alert",
          status: "pending",
        };
      }

      // Check confidence threshold for auto-execution
      if (decision.confidenceScore < this.config.autoExecutionThreshold) {
        return {
          id: crypto.randomUUID(),
          decisionId: decision.id,
          type: "escalation",
          status: "pending",
        };
      }

      const action = await this.execute(decision);
      await this.logAction(action);

      return action;
    } catch (error) {
      logger.error(`[${this.config.name}] Action failed`, { error, decision });
      throw error;
    }
  }

  async reflect(action: AgentAction, outcome: "success" | "failure"): Promise<void> {
    if (!this.config.learningEnabled) return;

    this.status = "learning";

    try {
      await this.learn(action, outcome);

      const memory: AgentMemory = {
        id: crypto.randomUUID(),
        agentType: this.config.type,
        context: JSON.stringify(this.currentContext),
        outcome,
        learnings: [],
        confidence: outcome === "success" ? 0.8 : 0.2,
        createdAt: new Date(),
      };

      this.memories.push(memory);
      await this.saveMemory(memory);
    } catch (error) {
      logger.error(`[${this.config.name}] Learning failed`, { error });
    } finally {
      this.status = "idle";
    }
  }

  // Persistence methods
  protected async logDecision(decision: AgentDecision): Promise<void> {
    try {
      await supabase.from("ai_commands").insert({
        command_type: `agent_decision_${this.config.type}`,
        command_text: decision.action,
        command_hash: decision.id,
        source_module: "ai-agents",
        execution_status: decision.requiresApproval ? "pending_approval" : "queued",
        parameters: {
          agentType: this.config.type,
          reasoning: decision.reasoning,
          confidence: decision.confidenceScore,
          impact: decision.impact,
        },
      });
    } catch (error) {
      logger.warn(`[${this.config.name}] Failed to log decision`, { error });
    }
  }

  protected async logAction(action: AgentAction): Promise<void> {
    try {
      await supabase.from("ai_commands").update({
        execution_status: action.status,
        result: action.result as unknown as import("@/integrations/supabase/types").Json,
        error_details: action.error,
        completed_at: action.executedAt?.toISOString(),
      }).eq("command_hash", action.decisionId);
    } catch (error) {
      logger.warn(`[${this.config.name}] Failed to log action`, { error });
    }
  }

  protected async saveMemory(memory: AgentMemory): Promise<void> {
    try {
      await supabase.from("ai_memory_events").insert({
        event_type: `agent_learning_${this.config.type}`,
        event_data: {
          context: memory.context,
          outcome: memory.outcome,
          learnings: memory.learnings,
        },
        confidence: memory.confidence,
      });
    } catch (error) {
      logger.warn(`[${this.config.name}] Failed to save memory`, { error });
    }
  }

  // Utility methods
  getStatus(): AgentStatus {
    return this.status;
  }

  getConfig(): AgentConfig {
    return this.config;
  }

  async getMetrics(): Promise<AgentMetrics> {
    try {
      const { data } = await supabase
        .from("ai_commands")
        .select("execution_status, execution_time_ms")
        .eq("source_module", "ai-agents")
        .like("command_type", `agent_%_${this.config.type}`)
        .limit(100);

      const total = data?.length || 0;
      const successful = data?.filter(d => d.execution_status === "completed").length || 0;
      const avgTime = total > 0 
        ? (data?.reduce((acc, d) => acc + (d.execution_time_ms || 0), 0) || 0) / total 
        : 0;

      return {
        totalDecisions: total,
        successRate: total > 0 ? successful / total : 0,
        avgConfidence: 0.75,
        avgResponseTime: avgTime,
        autoExecutionRate: 0.6,
        learningImprovements: this.memories.length,
      };
    } catch {
      return {
        totalDecisions: 0,
        successRate: 0,
        avgConfidence: 0,
        avgResponseTime: 0,
        autoExecutionRate: 0,
        learningImprovements: 0,
      };
    }
  }
}
