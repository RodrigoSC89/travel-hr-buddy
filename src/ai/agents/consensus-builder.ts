// @ts-nocheck
/**
 * PATCH 584 - Strategic Consensus Builder
 * Mechanism for consensus between multiple AI agents
 * 
 * Features:
 * - Confidence score voting model
 * - Disagreement logging between agents
 * - Fallback rules for deadlocks
 * - Consensus recording with participation scores
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import type { Strategy } from "@/ai/strategy/predictive-engine";

export type AgentRole = 
  | "operational"
  | "financial"
  | "safety"
  | "strategic"
  | "risk_management"
  | "resource_optimization";

export type VoteValue = "strongly_support" | "support" | "neutral" | "oppose" | "strongly_oppose";
export type ConsensusStatus = "achieved" | "partial" | "failed" | "deadlock";

export interface Agent {
  id: string;
  name: string;
  role: AgentRole;
  confidenceLevel: number; // 0-100
  votingWeight: number; // 0-1
  specializations: string[];
  active: boolean;
  metadata?: Record<string, any>;
}

export interface AgentVote {
  agentId: string;
  agentName: string;
  agentRole: AgentRole;
  vote: VoteValue;
  confidenceScore: number; // 0-100
  reasoning: string;
  concerns?: string[];
  recommendations?: string[];
  timestamp: Date;
}

export interface Disagreement {
  id: string;
  consensusId: string;
  agentsInvolved: string[];
  issue: string;
  positions: Record<string, string>; // agentId -> position
  severity: "low" | "medium" | "high";
  resolved: boolean;
  resolution?: string;
  timestamp: Date;
}

export interface ConsensusResult {
  id: string;
  strategyId: string;
  strategy: Strategy;
  status: ConsensusStatus;
  participatingAgents: Agent[];
  votes: AgentVote[];
  consensusScore: number; // 0-100
  participationRate: number; // 0-100
  supportLevel: number; // -100 to 100
  disagreements: Disagreement[];
  finalDecision: "proceed" | "reject" | "modify" | "escalate";
  fallbackApplied: boolean;
  fallbackRule?: string;
  recommendations: string[];
  achievedAt: Date;
  missionId?: string;
  metadata?: Record<string, any>;
}

export interface FallbackRule {
  id: string;
  name: string;
  condition: string;
  action: "proceed" | "reject" | "escalate" | "random_tiebreaker" | "majority_wins";
  priority: number;
  description: string;
}

class StrategicConsensusBuilder {
  private isInitialized = false;
  private agents: Map<string, Agent> = new Map();
  private activeConsensus: Map<string, ConsensusResult> = new Map();
  private fallbackRules: FallbackRule[] = [];
  private disagreementLog: Disagreement[] = [];

  /**
   * Initialize the consensus builder
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      logger.warn("[ConsensusBuilder] Already initialized");
      return;
    }

    logger.info("[ConsensusBuilder] Initializing strategic consensus builder...");

    // Initialize agents
    await this.initializeAgents();

    // Load fallback rules
    this.initializeFallbackRules();

    this.isInitialized = true;
    logger.info("[ConsensusBuilder] Initialization complete");
  }

  /**
   * Build consensus for a strategy
   */
  async buildConsensus(
    strategy: Strategy,
    missionId?: string,
    requiredAgentRoles?: AgentRole[]
  ): Promise<ConsensusResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const consensusId = `consensus_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    logger.info("[ConsensusBuilder] Building consensus", {
      consensusId,
      strategyId: strategy.id,
      strategyType: strategy.type,
      missionId
    });

    // Select participating agents
    const participatingAgents = this.selectAgents(strategy, requiredAgentRoles);

    if (participatingAgents.length < 3) {
      throw new Error("Minimum 3 agents required for consensus building");
    }

    // Collect votes from each agent
    const votes = await this.collectVotes(strategy, participatingAgents);

    // Analyze disagreements
    const disagreements = this.analyzeDisagreements(votes, consensusId);

    // Calculate consensus metrics
    const consensusScore = this.calculateConsensusScore(votes);
    const participationRate = (votes.length / participatingAgents.length) * 100;
    const supportLevel = this.calculateSupportLevel(votes);

    // Determine consensus status
    const status = this.determineConsensusStatus(consensusScore, supportLevel, disagreements);

    // Determine final decision
    let finalDecision: "proceed" | "reject" | "modify" | "escalate";
    let fallbackApplied = false;
    let fallbackRule: string | undefined;

    if (status === "achieved") {
      finalDecision = supportLevel > 0 ? "proceed" : "reject";
    } else if (status === "partial") {
      finalDecision = "modify";
    } else {
      // Apply fallback rules for deadlock/failure
      const fallbackResult = this.applyFallbackRules(votes, disagreements, consensusScore);
      finalDecision = fallbackResult.decision;
      fallbackApplied = true;
      fallbackRule = fallbackResult.rule;
    }

    // Generate recommendations
    const recommendations = this.generateConsensusRecommendations(
      votes,
      disagreements,
      status,
      finalDecision
    );

    const result: ConsensusResult = {
      id: consensusId,
      strategyId: strategy.id,
      strategy,
      status,
      participatingAgents,
      votes,
      consensusScore,
      participationRate,
      supportLevel,
      disagreements,
      finalDecision,
      fallbackApplied,
      fallbackRule,
      recommendations,
      achievedAt: new Date(),
      missionId,
      metadata: {
        voteCount: votes.length,
        disagreementCount: disagreements.length
      }
    };

    // Store consensus result
    this.activeConsensus.set(consensusId, result);

    // Archive consensus
    await this.archiveConsensus(result);

    // Log disagreements
    if (disagreements.length > 0) {
      await this.logDisagreements(disagreements);
    }

    logger.info("[ConsensusBuilder] Consensus achieved", {
      consensusId,
      status,
      finalDecision,
      consensusScore,
      supportLevel
    });

    return result;
  }

  /**
   * Get consensus result by ID
   */
  getConsensus(consensusId: string): ConsensusResult | undefined {
    return this.activeConsensus.get(consensusId);
  }

  /**
   * Get all active agents
   */
  getActiveAgents(): Agent[] {
    return Array.from(this.agents.values()).filter(a => a.active);
  }

  /**
   * Get agent by ID
   */
  getAgent(agentId: string): Agent | undefined {
    return this.agents.get(agentId);
  }

  /**
   * Get disagreement logs
   */
  getDisagreementLogs(consensusId?: string): Disagreement[] {
    if (consensusId) {
      return this.disagreementLog.filter(d => d.consensusId === consensusId);
    }
    return [...this.disagreementLog];
  }

  /**
   * Add a new agent to the system
   */
  async addAgent(agent: Agent): Promise<void> {
    this.agents.set(agent.id, agent);
    logger.info("[ConsensusBuilder] Agent added", {
      agentId: agent.id,
      role: agent.role
    });
  }

  /**
   * Remove an agent from the system
   */
  async removeAgent(agentId: string): Promise<void> {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.active = false;
      logger.info("[ConsensusBuilder] Agent deactivated", { agentId });
    }
  }

  // Private methods

  private async initializeAgents(): Promise<void> {
    // Initialize default agents (at least 3 as per requirements)
    const defaultAgents: Agent[] = [
      {
        id: "agent_operational",
        name: "Operational AI Agent",
        role: "operational",
        confidenceLevel: 85,
        votingWeight: 0.8,
        specializations: ["logistics", "scheduling", "resource_management"],
        active: true,
        metadata: {
          version: "1.0.0",
          capabilities: ["real_time_analysis", "optimization"]
        }
      },
      {
        id: "agent_safety",
        name: "Safety AI Agent",
        role: "safety",
        confidenceLevel: 90,
        votingWeight: 1.0, // Safety has highest weight
        specializations: ["risk_assessment", "compliance", "crew_welfare"],
        active: true,
        metadata: {
          version: "1.0.0",
          capabilities: ["risk_modeling", "safety_protocols"]
        }
      },
      {
        id: "agent_financial",
        name: "Financial AI Agent",
        role: "financial",
        confidenceLevel: 88,
        votingWeight: 0.9,
        specializations: ["cost_analysis", "budget_management", "roi_calculation"],
        active: true,
        metadata: {
          version: "1.0.0",
          capabilities: ["financial_modeling", "cost_optimization"]
        }
      },
      {
        id: "agent_strategic",
        name: "Strategic AI Agent",
        role: "strategic",
        confidenceLevel: 82,
        votingWeight: 0.85,
        specializations: ["long_term_planning", "strategic_alignment", "goal_optimization"],
        active: true,
        metadata: {
          version: "1.0.0",
          capabilities: ["strategic_analysis", "scenario_planning"]
        }
      },
      {
        id: "agent_risk",
        name: "Risk Management AI Agent",
        role: "risk_management",
        confidenceLevel: 87,
        votingWeight: 0.95,
        specializations: ["risk_identification", "mitigation_planning", "impact_assessment"],
        active: true,
        metadata: {
          version: "1.0.0",
          capabilities: ["risk_quantification", "monte_carlo_simulation"]
        }
      }
    ];

    for (const agent of defaultAgents) {
      this.agents.set(agent.id, agent);
    }

    logger.info(`[ConsensusBuilder] Initialized ${this.agents.size} agents`);
  }

  private initializeFallbackRules(): void {
    this.fallbackRules = [
      {
        id: "fallback_safety_override",
        name: "Safety Override",
        condition: "safety_agent_strongly_opposes",
        action: "reject",
        priority: 10,
        description: "If safety agent strongly opposes, reject the strategy"
      },
      {
        id: "fallback_critical_disagreement",
        name: "Critical Disagreement Escalation",
        condition: "high_severity_disagreement",
        action: "escalate",
        priority: 9,
        description: "Escalate to human decision makers for high-severity disagreements"
      },
      {
        id: "fallback_majority_wins",
        name: "Majority Wins",
        condition: "no_strong_opposition",
        action: "majority_wins",
        priority: 5,
        description: "Proceed with majority decision if no strong opposition"
      },
      {
        id: "fallback_tie_breaker",
        name: "Weighted Tie Breaker",
        condition: "deadlock",
        action: "random_tiebreaker",
        priority: 3,
        description: "Use weighted voting to break tie in deadlock situations"
      },
      {
        id: "fallback_low_confidence",
        name: "Low Confidence Rejection",
        condition: "avg_confidence < 50",
        action: "reject",
        priority: 8,
        description: "Reject if average agent confidence is below 50%"
      }
    ];

    this.fallbackRules.sort((a, b) => b.priority - a.priority);
    logger.info(`[ConsensusBuilder] Loaded ${this.fallbackRules.length} fallback rules`);
  }

  private selectAgents(strategy: Strategy, requiredRoles?: AgentRole[]): Agent[] {
    const agents: Agent[] = [];

    // If specific roles required, include them
    if (requiredRoles) {
      for (const role of requiredRoles) {
        const agent = Array.from(this.agents.values()).find(
          a => a.role === role && a.active
        );
        if (agent) {
          agents.push(agent);
        }
      }
    }

    // Always include safety agent
    const safetyAgent = Array.from(this.agents.values()).find(
      a => a.role === "safety" && a.active
    );
    if (safetyAgent && !agents.includes(safetyAgent)) {
      agents.push(safetyAgent);
    }

    // Select additional agents based on strategy type
    if (strategy.type === "risk_mitigation") {
      const riskAgent = Array.from(this.agents.values()).find(
        a => a.role === "risk_management" && a.active
      );
      if (riskAgent && !agents.includes(riskAgent)) {
        agents.push(riskAgent);
      }
    }

    if (strategy.type === "resource_allocation" || strategy.type === "optimization") {
      const operationalAgent = Array.from(this.agents.values()).find(
        a => a.role === "operational" && a.active
      );
      if (operationalAgent && !agents.includes(operationalAgent)) {
        agents.push(operationalAgent);
      }
    }

    // Add financial agent for cost-sensitive strategies
    if (strategy.estimatedImpact.cost && strategy.estimatedImpact.cost > 5000) {
      const financialAgent = Array.from(this.agents.values()).find(
        a => a.role === "financial" && a.active
      );
      if (financialAgent && !agents.includes(financialAgent)) {
        agents.push(financialAgent);
      }
    }

    // Add strategic agent
    const strategicAgent = Array.from(this.agents.values()).find(
      a => a.role === "strategic" && a.active
    );
    if (strategicAgent && !agents.includes(strategicAgent)) {
      agents.push(strategicAgent);
    }

    // Ensure minimum 3 agents
    if (agents.length < 3) {
      const remainingAgents = Array.from(this.agents.values()).filter(
        a => a.active && !agents.includes(a)
      );
      agents.push(...remainingAgents.slice(0, 3 - agents.length));
    }

    return agents;
  }

  private async collectVotes(strategy: Strategy, agents: Agent[]): Promise<AgentVote[]> {
    const votes: AgentVote[] = [];

    for (const agent of agents) {
      const vote = await this.simulateAgentVote(agent, strategy);
      votes.push(vote);
    }

    return votes;
  }

  private async simulateAgentVote(agent: Agent, strategy: Strategy): Promise<AgentVote> {
    // Simulate agent decision-making based on role and strategy characteristics
    let vote: VoteValue;
    let confidenceScore: number;
    let reasoning: string;
    const concerns: string[] = [];
    const recommendations: string[] = [];

    switch (agent.role) {
    case "safety":
      if (strategy.estimatedImpact.risk > 80) {
        vote = "strongly_oppose";
        confidenceScore = 95;
        reasoning = "Unacceptable risk level detected";
        concerns.push("High risk to crew safety");
      } else if (strategy.estimatedImpact.risk > 60) {
        vote = "oppose";
        confidenceScore = 85;
        reasoning = "Elevated risk requires mitigation measures";
        recommendations.push("Implement additional safety protocols");
      } else {
        vote = "support";
        confidenceScore = agent.confidenceLevel;
        reasoning = "Risk level acceptable with standard precautions";
      }
      break;

    case "financial": {
      const costEfficiency = strategy.successProbability / ((strategy.estimatedImpact.cost || 1000) / 1000);
      if (costEfficiency > 0.5) {
        vote = "strongly_support";
        confidenceScore = 90;
        reasoning = "Excellent cost-benefit ratio";
      } else if (costEfficiency > 0.3) {
        vote = "support";
        confidenceScore = 80;
        reasoning = "Acceptable financial return expected";
      } else {
        vote = "neutral";
        confidenceScore = 70;
        reasoning = "Cost-benefit analysis inconclusive";
        recommendations.push("Consider cost optimization measures");
      }
      break;
    }

    case "operational":
      if (strategy.estimatedImpact.time < 24) {
        vote = "strongly_support";
        confidenceScore = 88;
        reasoning = "Quick execution timeframe";
      } else if (strategy.estimatedImpact.time < 72) {
        vote = "support";
        confidenceScore = 82;
        reasoning = "Reasonable execution timeline";
      } else {
        vote = "neutral";
        confidenceScore = 75;
        reasoning = "Extended timeline may impact other operations";
        concerns.push("Resource availability over extended period");
      }
      break;

    case "strategic":
      if (strategy.successProbability > 0.7) {
        vote = "strongly_support";
        confidenceScore = 85;
        reasoning = "High probability of strategic success";
      } else if (strategy.successProbability > 0.5) {
        vote = "support";
        confidenceScore = 78;
        reasoning = "Moderate probability of success";
      } else {
        vote = "oppose";
        confidenceScore = 80;
        reasoning = "Low success probability concerns";
        recommendations.push("Consider alternative strategies");
      }
      break;

    case "risk_management": {
      const overallRisk = (strategy.estimatedImpact.risk + strategy.estimatedImpact.crewImpact) / 2;
      if (overallRisk < 30) {
        vote = "strongly_support";
        confidenceScore = 92;
        reasoning = "Low overall risk profile";
      } else if (overallRisk < 60) {
        vote = "support";
        confidenceScore = 84;
        reasoning = "Manageable risk level";
        recommendations.push("Implement standard risk controls");
      } else {
        vote = "oppose";
        confidenceScore = 88;
        reasoning = "High risk profile requires reassessment";
        concerns.push("Multiple risk factors identified");
      }
      break;
    }

    default:
      vote = "neutral";
      confidenceScore = agent.confidenceLevel;
      reasoning = "Standard evaluation";
    }

    return {
      agentId: agent.id,
      agentName: agent.name,
      agentRole: agent.role,
      vote,
      confidenceScore,
      reasoning,
      concerns: concerns.length > 0 ? concerns : undefined,
      recommendations: recommendations.length > 0 ? recommendations : undefined,
      timestamp: new Date()
    };
  }

  private analyzeDisagreements(votes: AgentVote[], consensusId: string): Disagreement[] {
    const disagreements: Disagreement[] = [];

    // Check for opposing votes
    const supporters = votes.filter(v => v.vote === "support" || v.vote === "strongly_support");
    const opposers = votes.filter(v => v.vote === "oppose" || v.vote === "strongly_oppose");

    if (supporters.length > 0 && opposers.length > 0) {
      const disagreementId = `disagreement_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const positions: Record<string, string> = {};
      for (const vote of [...supporters, ...opposers]) {
        positions[vote.agentId] = `${vote.vote}: ${vote.reasoning}`;
      }

      // Determine severity
      let severity: "low" | "medium" | "high" = "low";
      if (opposers.some(v => v.vote === "strongly_oppose" && v.agentRole === "safety")) {
        severity = "high";
      } else if (opposers.length > supporters.length) {
        severity = "medium";
      }

      disagreements.push({
        id: disagreementId,
        consensusId,
        agentsInvolved: [...supporters, ...opposers].map(v => v.agentId),
        issue: "Conflicting assessments on strategy viability",
        positions,
        severity,
        resolved: false,
        timestamp: new Date()
      });
    }

    return disagreements;
  }

  private calculateConsensusScore(votes: AgentVote[]): number {
    if (votes.length === 0) return 0;

    // Weight votes by confidence and agent weight
    let totalWeightedScore = 0;
    let totalWeight = 0;

    for (const vote of votes) {
      const agent = this.agents.get(vote.agentId);
      if (!agent) continue;

      const voteScore = this.voteToScore(vote.vote);
      const weight = agent.votingWeight * (vote.confidenceScore / 100);
      
      totalWeightedScore += voteScore * weight;
      totalWeight += weight;
    }

    // Normalize to 0-100
    const consensusScore = totalWeight > 0 
      ? ((totalWeightedScore / totalWeight) + 2) * 25 
      : 50;

    return Math.max(0, Math.min(100, consensusScore));
  }

  private voteToScore(vote: VoteValue): number {
    switch (vote) {
    case "strongly_support": return 2;
    case "support": return 1;
    case "neutral": return 0;
    case "oppose": return -1;
    case "strongly_oppose": return -2;
    }
  }

  private calculateSupportLevel(votes: AgentVote[]): number {
    if (votes.length === 0) return 0;

    let totalScore = 0;
    for (const vote of votes) {
      totalScore += this.voteToScore(vote.vote);
    }

    // Normalize to -100 to 100
    return (totalScore / votes.length) * 50;
  }

  private determineConsensusStatus(
    consensusScore: number,
    supportLevel: number,
    disagreements: Disagreement[]
  ): ConsensusStatus {
    // High consensus with strong support
    if (consensusScore >= 80 && supportLevel > 50) {
      return "achieved";
    }

    // Moderate consensus
    if (consensusScore >= 60 && supportLevel > 20) {
      return "partial";
    }

    // Deadlock if balanced opposition
    if (Math.abs(supportLevel) < 10 && consensusScore < 60) {
      return "deadlock";
    }

    return "failed";
  }

  private applyFallbackRules(
    votes: AgentVote[],
    disagreements: Disagreement[],
    consensusScore: number
  ): { decision: "proceed" | "reject" | "modify" | "escalate"; rule: string } {
    // Check safety override
    const safetyVote = votes.find(v => v.agentRole === "safety");
    if (safetyVote && safetyVote.vote === "strongly_oppose") {
      return { 
        decision: "reject", 
        rule: "Safety Override - safety agent strongly opposes" 
      };
    }

    // Check critical disagreement
    if (disagreements.some(d => d.severity === "high")) {
      return { 
        decision: "escalate", 
        rule: "Critical Disagreement Escalation" 
      };
    }

    // Check low confidence
    const avgConfidence = votes.reduce((sum, v) => sum + v.confidenceScore, 0) / votes.length;
    if (avgConfidence < 50) {
      return { 
        decision: "reject", 
        rule: "Low Confidence Rejection" 
      };
    }

    // Apply majority wins
    const supporters = votes.filter(v => v.vote === "support" || v.vote === "strongly_support");
    const opposers = votes.filter(v => v.vote === "oppose" || v.vote === "strongly_oppose");
    
    if (supporters.length > opposers.length) {
      return { 
        decision: "proceed", 
        rule: "Majority Wins" 
      };
    } else if (opposers.length > supporters.length) {
      return { 
        decision: "reject", 
        rule: "Majority Opposition" 
      };
    }

    // Tie breaker - use weighted voting
    const supportLevel = this.calculateSupportLevel(votes);
    return { 
      decision: supportLevel >= 0 ? "proceed" : "reject", 
      rule: "Weighted Tie Breaker" 
    };
  }

  private generateConsensusRecommendations(
    votes: AgentVote[],
    disagreements: Disagreement[],
    status: ConsensusStatus,
    decision: string
  ): string[] {
    const recommendations: string[] = [];

    // Collect agent recommendations
    for (const vote of votes) {
      if (vote.recommendations) {
        recommendations.push(...vote.recommendations);
      }
    }

    // Add status-specific recommendations
    if (status === "partial") {
      recommendations.push("Address agent concerns to improve consensus");
    }

    if (status === "deadlock" || status === "failed") {
      recommendations.push("Consider modifying strategy to address key objections");
    }

    if (disagreements.length > 0) {
      recommendations.push(`Resolve ${disagreements.length} disagreement(s) before proceeding`);
    }

    // Add concerns as recommendations
    for (const vote of votes) {
      if (vote.concerns) {
        vote.concerns.forEach(concern => {
          recommendations.push(`Address concern: ${concern}`);
        });
      }
    }

    return Array.from(new Set(recommendations)); // Remove duplicates
  }

  private async archiveConsensus(result: ConsensusResult): Promise<void> {
    logger.info("[ConsensusBuilder] Archiving consensus", {
      consensusId: result.id,
      missionId: result.missionId
    });

    try {
      await supabase.from("ai_consensus_results").insert({
        consensus_id: result.id,
        strategy_id: result.strategyId,
        status: result.status,
        participating_agents: result.participatingAgents.map(a => a.id),
        votes: result.votes,
        consensus_score: result.consensusScore,
        participation_rate: result.participationRate,
        support_level: result.supportLevel,
        disagreements: result.disagreements,
        final_decision: result.finalDecision,
        fallback_applied: result.fallbackApplied,
        fallback_rule: result.fallbackRule,
        recommendations: result.recommendations,
        mission_id: result.missionId,
        metadata: result.metadata,
        created_at: result.achievedAt.toISOString()
      });
    } catch (error) {
      logger.error("[ConsensusBuilder] Failed to archive consensus", error);
    }
  }

  private async logDisagreements(disagreements: Disagreement[]): Promise<void> {
    for (const disagreement of disagreements) {
      this.disagreementLog.push(disagreement);

      try {
        await supabase.from("ai_agent_disagreements").insert({
          disagreement_id: disagreement.id,
          consensus_id: disagreement.consensusId,
          agents_involved: disagreement.agentsInvolved,
          issue: disagreement.issue,
          positions: disagreement.positions,
          severity: disagreement.severity,
          resolved: disagreement.resolved,
          resolution: disagreement.resolution,
          created_at: disagreement.timestamp.toISOString()
        });
      } catch (error) {
        logger.error("[ConsensusBuilder] Failed to log disagreement", error);
      }
    }

    logger.info(`[ConsensusBuilder] Logged ${disagreements.length} disagreements`);
  }
}

// Export singleton instance
export const strategicConsensusBuilder = new StrategicConsensusBuilder();

// Export class for testing
export { StrategicConsensusBuilder };
