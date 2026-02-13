/**
 * AI Agents Module
 */

export * from "./types";
export * from "./BaseAgent";
import { BaseAgent } from "./BaseAgent";
export * from "./RiskSentinelAgent";
export * from "./ESGAdvisorAgent";
export * from "./AuditBotAgent";

import { getRiskSentinel } from "./RiskSentinelAgent";
import { getESGAdvisor } from "./ESGAdvisorAgent";
import { getAuditBot } from "./AuditBotAgent";
import type { AgentType, AgentContext, AgentDecision, AgentAction } from "./types";

export interface AgentOrchestrator {
  agents: Map<string, BaseAgent>;
  runAgent: (type: AgentType, context: AgentContext) => Promise<AgentDecision[]>;
  runAllAgents: (context: AgentContext) => Promise<Map<AgentType, AgentDecision[]>>;
  executeDecision: (type: AgentType, decision: AgentDecision) => Promise<AgentAction>;
  getAgentStatus: () => Record<string, string>;
}

let orchestrator: AgentOrchestrator | null = null;

export function getAgentOrchestrator(): AgentOrchestrator {
  if (!orchestrator) {
    const agents = new Map<string, BaseAgent>();
    agents.set("risk", getRiskSentinel());
    agents.set("esg", getESGAdvisor());
    agents.set("audit", getAuditBot());

    orchestrator = {
      agents,
      runAgent: async (type, context) => {
        const agent = agents.get(type);
        if (!agent) return [];
        await agent.observe(context);
        return agent.decide();
      },
      runAllAgents: async (context) => {
        const results = new Map<AgentType, AgentDecision[]>();
        for (const [type, agent] of agents) {
          await agent.observe(context);
          results.set(type as AgentType, await agent.decide());
        }
        return results;
      },
      executeDecision: async (type, decision) => {
        const agent = agents.get(type);
        if (!agent) throw new Error(`Agent ${type} not found`);
        return agent.act(decision);
      },
      getAgentStatus: () => ({ risk: "active", esg: "active", audit: "active" })
    };
  }
  return orchestrator;
}
