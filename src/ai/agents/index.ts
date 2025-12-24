/**
 * 🤖 AI Agents - Central Registry & Orchestrator
 */

export * from "./types";
export * from "./BaseAgent";
export * from "./RiskSentinelAgent";
export * from "./ESGAdvisorAgent";
export * from "./AuditBotAgent";

import { getRiskSentinel, RiskSentinelAgent } from "./RiskSentinelAgent";
import { getESGAdvisor, ESGAdvisorAgent } from "./ESGAdvisorAgent";
import { getAuditBot, AuditBotAgent } from "./AuditBotAgent";
import type { AgentType, AgentContext, AgentDecision, AgentAction } from "./types";
import { logger } from "@/lib/logger";
import { BaseAgent } from "./BaseAgent";

export interface AgentOrchestrator {
  runAgent(type: AgentType, context: AgentContext): Promise<AgentDecision[]>;
  runAllAgents(context: AgentContext): Promise<Map<AgentType, AgentDecision[]>>;
  executeDecision(type: AgentType, decision: AgentDecision): Promise<AgentAction>;
  getAgentStatus(type: AgentType): string;
}

class AgentOrchestratorImpl implements AgentOrchestrator {
  private agents: Map<AgentType, BaseAgent>;

  constructor() {
    this.agents = new Map<AgentType, BaseAgent>([
      ["risk", getRiskSentinel()],
      ["esg", getESGAdvisor()],
      ["audit", getAuditBot()],
    ]);
  }

  async runAgent(type: AgentType, context: AgentContext): Promise<AgentDecision[]> {
    const agent = this.agents.get(type);
    if (!agent) {
      logger.warn(`[Orchestrator] Agent type ${type} not found`);
      return [];
    }

    try {
      logger.info(`[Orchestrator] Running ${type} agent`);
      await agent.observe(context);
      const decisions = await agent.decide();
      return decisions;
    } catch (error) {
      logger.error(`[Orchestrator] Failed to run ${type} agent`, { error });
      return [];
    }
  }

  async runAllAgents(context: AgentContext): Promise<Map<AgentType, AgentDecision[]>> {
    const results = new Map<AgentType, AgentDecision[]>();

    const promises = Array.from(this.agents.entries()).map(async ([type, _]) => {
      const decisions = await this.runAgent(type, context);
      results.set(type, decisions);
    });

    await Promise.all(promises);
    logger.info(`[Orchestrator] All agents completed`, { 
      agentCount: this.agents.size,
      totalDecisions: Array.from(results.values()).reduce((sum, d) => sum + d.length, 0)
    });

    return results;
  }

  async executeDecision(type: AgentType, decision: AgentDecision): Promise<AgentAction> {
    const agent = this.agents.get(type);
    if (!agent) {
      throw new Error(`Agent type ${type} not found`);
    }

    try {
      const action = await agent.act(decision);
      
      // If successful, let the agent learn
      if (action.status === "completed") {
        await agent.reflect(action, "success");
      } else if (action.status === "failed") {
        await agent.reflect(action, "failure");
      }

      return action;
    } catch (error) {
      logger.error(`[Orchestrator] Failed to execute decision`, { error, type, decision });
      throw error;
    }
  }

  getAgentStatus(type: AgentType): string {
    const agent = this.agents.get(type);
    return agent?.getStatus() || "unknown";
  }
}

// Singleton orchestrator
let orchestratorInstance: AgentOrchestratorImpl | null = null;

export function getAgentOrchestrator(): AgentOrchestrator {
  if (!orchestratorInstance) {
    orchestratorInstance = new AgentOrchestratorImpl();
  }
  return orchestratorInstance;
}
