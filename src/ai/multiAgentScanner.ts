/**
 * PATCH 235 - Multi-Agent Performance Scanner
 * 
 * Monitors all AI agents, tracks performance metrics, maintains rankings,
 * and enables automatic agent switching on failure.
 * 
 * @module ai/multiAgentScanner
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export interface AIAgent {
  id: string;
  name: string;
  type: "llm" | "classifier" | "analyzer" | "predictor" | "optimizer";
  model_name: string;
  status: "active" | "standby" | "failed" | "maintenance";
  version: string;
}

export interface AgentMetrics {
  agent_id: string;
  response_time_ms: number;
  success_rate: number;
  error_count: number;
  total_requests: number;
  avg_confidence: number;
  uptime_percent: number;
  last_updated: string;
}

export interface AgentRanking {
  agent_id: string;
  agent_name: string;
  rank: number;
  overall_score: number;
  metrics: AgentMetrics;
  trending: "up" | "down" | "stable";
}

export interface FailoverEvent {
  from_agent_id: string;
  to_agent_id: string;
  reason: string;
  timestamp: string;
  success: boolean;
}

class MultiAgentScanner {
  private agents: Map<string, AIAgent> = new Map();
  private metrics: Map<string, AgentMetrics> = new Map();
  private scanInterval: number | null = null;

  /**
   * Initialize the multi-agent scanner
   */
  async initialize(): Promise<void> {
    logger.info("AgentScanner initializing");
    
    // Register default agents
    this.registerAgent({
      id: "agent-gemini-flash",
      name: "Gemini 2.5 Flash",
      type: "llm",
      model_name: "google/gemini-2.5-flash",
      status: "active",
      version: "2.5.0"
    });

    this.registerAgent({
      id: "agent-gemini-pro",
      name: "Gemini 2.5 Pro",
      type: "llm",
      model_name: "google/gemini-2.5-pro",
      status: "standby",
      version: "2.5.0"
    });

    this.registerAgent({
      id: "agent-gpt5",
      name: "GPT-5",
      type: "llm",
      model_name: "openai/gpt-5",
      status: "standby",
      version: "5.0.0"
    });

    this.registerAgent({
      id: "agent-tactical-ai",
      name: "Tactical AI",
      type: "analyzer",
      model_name: "nautilus-tactical-v1",
      status: "active",
      version: "1.0.0"
    });

    this.registerAgent({
      id: "agent-predictive",
      name: "Predictive Engine",
      type: "predictor",
      model_name: "nautilus-predictive-v1",
      status: "active",
      version: "1.0.0"
    });

    this.startScanning();
  }

  /**
   * Register an AI agent
   */
  registerAgent(agent: AIAgent): void {
    this.agents.set(agent.id, agent);
    
    // Initialize metrics
    this.metrics.set(agent.id, {
      agent_id: agent.id,
      response_time_ms: 0,
      success_rate: 100,
      error_count: 0,
      total_requests: 0,
      avg_confidence: 0.85,
      uptime_percent: 100,
      last_updated: new Date().toISOString()
    });

    logger.info("Registered agent", { name: agent.name });
  }

  /**
   * Start performance scanning
   */
  startScanning(intervalMs: number = 10000): void {
    if (this.scanInterval) {
      logger.warn("Already scanning");
      return;
    }

    logger.info("Started scanning");
    this.scanInterval = window.setInterval(() => {
      this.scanAllAgents();
    }, intervalMs);
  }

  /**
   * Stop performance scanning
   */
  stopScanning(): void {
    if (this.scanInterval) {
      clearInterval(this.scanInterval);
      this.scanInterval = null;
      logger.info("Stopped scanning");
    }
  }

  /**
   * Scan all agents and update metrics
   */
  async scanAllAgents(): Promise<void> {
    for (const [agentId, agent] of this.agents.entries()) {
      if (agent.status === "active") {
        await this.updateAgentMetrics(agentId);
      }
    }

    // Update rankings
    await this.updateRankings();
  }

  /**
   * Update metrics for a specific agent
   */
  private async updateAgentMetrics(agentId: string): Promise<void> {
    const current = this.metrics.get(agentId);
    if (!current) return;

    // Simulate metric updates (in production, these would be real measurements)
    const updated: AgentMetrics = {
      agent_id: agentId,
      response_time_ms: Math.random() * 2000 + 500,
      success_rate: Math.random() * 20 + 80, // 80-100%
      error_count: current.error_count + (Math.random() > 0.95 ? 1 : 0),
      total_requests: current.total_requests + Math.floor(Math.random() * 10),
      avg_confidence: Math.random() * 0.3 + 0.7, // 70-100%
      uptime_percent: Math.random() * 10 + 90, // 90-100%
      last_updated: new Date().toISOString()
    };

    this.metrics.set(agentId, updated);

    // Check for failure conditions
    if (updated.success_rate < 70 || updated.uptime_percent < 80) {
      await this.handleAgentFailure(agentId);
    }
  }

  /**
   * Handle agent failure and trigger failover
   */
  private async handleAgentFailure(agentId: string): Promise<void> {
    const failedAgent = this.agents.get(agentId);
    if (!failedAgent) return;

    logger.warn("Agent failure detected", { name: failedAgent.name });

    // Mark agent as failed
    failedAgent.status = "failed";
    this.agents.set(agentId, failedAgent);

    // Find replacement agent of same type
    const replacement = Array.from(this.agents.values()).find(
      a => a.type === failedAgent.type && 
           a.status === "standby" && 
           a.id !== agentId
    );

    if (replacement) {
      await this.failoverToAgent(agentId, replacement.id);
    }
  }

  /**
   * Failover to a replacement agent
   */
  private async failoverToAgent(fromAgentId: string, toAgentId: string): Promise<void> {
    const fromAgent = this.agents.get(fromAgentId);
    const toAgent = this.agents.get(toAgentId);

    if (!fromAgent || !toAgent) return;

    logger.info("Failing over agents", { from: fromAgent.name, to: toAgent.name });

    // Update statuses
    toAgent.status = "active";
    this.agents.set(toAgentId, toAgent);

    // Log failover event
    const event: FailoverEvent = {
      from_agent_id: fromAgentId,
      to_agent_id: toAgentId,
      reason: "Performance degradation detected",
      timestamp: new Date().toISOString(),
      success: true
    };

    await this.logFailoverEvent(event);
  }

  /**
   * Calculate and update agent rankings
   */
  private async updateRankings(): Promise<AgentRanking[]> {
    const rankings: AgentRanking[] = [];

    for (const [agentId, agent] of this.agents.entries()) {
      const metrics = this.metrics.get(agentId);
      if (!metrics) continue;

      // Calculate overall score
      const score = (
        metrics.success_rate * 0.3 +
        (1 - metrics.response_time_ms / 5000) * 100 * 0.2 +
        metrics.avg_confidence * 100 * 0.2 +
        metrics.uptime_percent * 0.3
      );

      rankings.push({
        agent_id: agentId,
        agent_name: agent.name,
        rank: 0, // Will be set after sorting
        overall_score: score,
        metrics: metrics,
        trending: "stable"
      });
    }

    // Sort by score and assign ranks
    rankings.sort((a, b) => b.overall_score - a.overall_score);
    rankings.forEach((r, idx) => r.rank = idx + 1);

    logger.info("Rankings updated", { 
      rankings: rankings.map(r => `${r.rank}. ${r.agent_name} (${r.overall_score.toFixed(1)})`).join(", ")
    });

    return rankings;
  }

  /**
   * Log failover event to database
   */
  private async logFailoverEvent(event: FailoverEvent): Promise<void> {
    try {
      await (supabase as any).from("agent_failover_log").insert({
        from_agent_id: event.from_agent_id,
        to_agent_id: event.to_agent_id,
        reason: event.reason,
        timestamp: event.timestamp,
        success: event.success
      });
    } catch (error) {
      logger.error("Failed to log failover", { error });
    }
  }

  /**
   * Get current rankings
   */
  async getRankings(): Promise<AgentRanking[]> {
    return this.updateRankings();
  }

  /**
   * Get agent by ID
   */
  getAgent(agentId: string): AIAgent | undefined {
    return this.agents.get(agentId);
  }

  /**
   * Get metrics for an agent
   */
  getMetrics(agentId: string): AgentMetrics | undefined {
    return this.metrics.get(agentId);
  }

  /**
   * Get all agents
   */
  getAllAgents(): AIAgent[] {
    return Array.from(this.agents.values());
  }
}

export const multiAgentScanner = new MultiAgentScanner();
