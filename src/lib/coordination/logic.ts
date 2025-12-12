/**
 * PATCH 538 - Coordination AI Logic
 * Rule-based coordination engine with AI feedback integration
 */

import { logger } from "@/lib/logger";

export type AgentState = "idle" | "active" | "waiting" | "error" | "offline";
export type AgentType = "drone" | "sensor" | "satellite" | "vessel" | "station";

export interface Agent {
  id: string;
  name: string;
  type: AgentType;
  state: AgentState;
  position?: { lat: number; lng: number; alt?: number };
  battery?: number;
  lastUpdate: string;
  metadata?: Record<string, any>;
}

export interface CoordinationRule {
  id: string;
  name: string;
  condition: (agents: Agent[]) => boolean;
  action: (agents: Agent[]) => CoordinationAction[];
  priority: number;
  enabled: boolean;
}

export interface CoordinationAction {
  agentId: string;
  action: string;
  params?: Record<string, any>;
  reason: string;
}

export interface AIRecommendation {
  agentId: string;
  recommendation: string;
  confidence: number;
  reasoning: string;
  timestamp: string;
}

/**
 * Coordination Engine
 * Orchestrates actions between multiple autonomous agents
 */
export class CoordinationEngine {
  private agents: Map<string, Agent> = new Map();
  private rules: CoordinationRule[] = [];
  private aiRecommendations: AIRecommendation[] = [];
  private listeners: Set<(agents: Agent[]) => void> = new Set();

  constructor() {
    this.initializeDefaultRules();
  }

  /**
   * Initialize default coordination rules
   */
  private initializeDefaultRules() {
    // Rule 1: Activate idle agents when needed
    this.rules.push({
      id: "activate-idle",
      name: "Activate Idle Agents",
      priority: 1,
      enabled: true,
      condition: (agents: Agent[]) => {
        const idle = agents.filter(a => a.state === "idle").length;
        const active = agents.filter(a => a.state === "active").length;
        return idle > 0 && active < 2;
      },
      action: (agents: Agent[]) => {
        const idleAgents = agents.filter(a => a.state === "idle");
        if (idleAgents.length === 0) return [];
        
        return [{
          agentId: idleAgents[0].id,
          action: "activate",
          reason: "Not enough active agents in the system"
        }];
      }
    });

    // Rule 2: Handle low battery
    this.rules.push({
      id: "low-battery-return",
      name: "Low Battery Return",
      priority: 2,
      enabled: true,
      condition: (agents: Agent[]) => {
        return agents.some(a => a.battery !== undefined && a.battery < 20);
      },
      action: (agents: Agent[]) => {
        return agents
          .filter(a => a.battery !== undefined && a.battery < 20)
          .map(a => ({
            agentId: a.id,
            action: "return_to_base",
            reason: `Low battery: ${a.battery}%`
          }));
      }
    });

    // Rule 3: Error recovery
    this.rules.push({
      id: "error-recovery",
      name: "Error Recovery",
      priority: 3,
      enabled: true,
      condition: (agents: Agent[]) => {
        return agents.some(a => a.state === "error");
      },
      action: (agents: Agent[]) => {
        return agents
          .filter(a => a.state === "error")
          .map(a => ({
            agentId: a.id,
            action: "reset",
            reason: "Agent in error state - attempting recovery"
          }));
      }
    });

    // Rule 4: Coordinate multiple agents in proximity
    this.rules.push({
      id: "proximity-coordination",
      name: "Proximity Coordination",
      priority: 4,
      enabled: true,
      condition: (agents: Agent[]) => {
        const activeAgents = agents.filter(a => a.state === "active" && a.position);
        if (activeAgents.length < 2) return false;
        
        // Check if any two agents are too close
        for (let i = 0; i < activeAgents.length; i++) {
          for (let j = i + 1; j < activeAgents.length; j++) {
            const distance = this.calculateDistance(
              activeAgents[i].position!,
              activeAgents[j].position!
            );
            if (distance < 0.1) { // Less than 0.1 degrees (~11km)
              return true;
            }
          }
        }
        return false;
      },
      action: (agents: Agent[]) => {
        const actions: CoordinationAction[] = [];
        const activeAgents = agents.filter(a => a.state === "active" && a.position);
        
        for (let i = 0; i < activeAgents.length; i++) {
          for (let j = i + 1; j < activeAgents.length; j++) {
            const distance = this.calculateDistance(
              activeAgents[i].position!,
              activeAgents[j].position!
            );
            if (distance < 0.1) {
              actions.push({
                agentId: activeAgents[j].id,
                action: "adjust_position",
                params: { direction: "north", distance: 0.2 },
                reason: `Too close to ${activeAgents[i].name}`
              });
            }
          }
        }
        return actions;
      }
    });
  }

  /**
   * Calculate simple distance between two positions
   */
  private calculateDistance(pos1: { lat: number; lng: number }, pos2: { lat: number; lng: number }): number {
    const latDiff = pos1.lat - pos2.lat;
    const lngDiff = pos1.lng - pos2.lng;
    return Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
  }

  /**
   * Register an agent
   */
  registerAgent(agent: Agent): void {
    this.agents.set(agent.id, agent);
    this.notifyListeners();
    logger.info(`Agent registered: ${agent.name} (${agent.id})`);
  }

  /**
   * Update agent state
   */
  updateAgent(agentId: string, updates: Partial<Agent>): void {
    const agent = this.agents.get(agentId);
    if (!agent) {
      logger.warn(`Agent not found: ${agentId}`);
      return;
    }
    
    const updated = { ...agent, ...updates, lastUpdate: new Date().toISOString() };
    this.agents.set(agentId, updated);
    this.notifyListeners();
  }

  /**
   * Remove an agent
   */
  removeAgent(agentId: string): void {
    this.agents.delete(agentId);
    this.notifyListeners();
    logger.info(`Agent removed: ${agentId}`);
  }

  /**
   * Get all agents
   */
  getAgents(): Agent[] {
    return Array.from(this.agents.values());
  }

  /**
   * Get agent by ID
   */
  getAgent(agentId: string): Agent | undefined {
    return this.agents.get(agentId);
  }

  /**
   * Execute coordination cycle
   */
  executeCoordinationCycle(): CoordinationAction[] {
    const agents = this.getAgents();
    const allActions: CoordinationAction[] = [];

    // Sort rules by priority (higher priority first)
    const sortedRules = [...this.rules]
      .filter(r => r.enabled)
      .sort((a, b) => b.priority - a.priority);

    // Execute rules
    for (const rule of sortedRules) {
      try {
        if (rule.condition(agents)) {
          const actions = rule.action(agents);
          allActions.push(...actions);
          logger.info(`Rule triggered: ${rule.name}`, { actions });
        }
      } catch (error) {
        logger.error(`Error executing rule ${rule.name}:`, error);
      }
    }

    // Apply AI recommendations
    const aiActions = this.applyAIRecommendations(agents);
    allActions.push(...aiActions);

    return allActions;
  }

  /**
   * Apply AI recommendations
   */
  private applyAIRecommendations(agents: Agent[]): CoordinationAction[] {
    const actions: CoordinationAction[] = [];
    
    // Filter recent high-confidence recommendations
    const recentRecommendations = this.aiRecommendations.filter(r => {
      const age = Date.now() - new Date(r.timestamp).getTime();
      return age < 60000 && r.confidence > 0.7; // Last 60 seconds, >70% confidence
    });

    for (const rec of recentRecommendations) {
      const agent = agents.find(a => a.id === rec.agentId);
      if (agent) {
        actions.push({
          agentId: rec.agentId,
          action: rec.recommendation,
          reason: `AI recommendation (${(rec.confidence * 100).toFixed(0)}%): ${rec.reasoning}`
        });
      }
    }

    return actions;
  }

  /**
   * Add AI recommendation (simulated or from real AI)
   */
  addAIRecommendation(recommendation: AIRecommendation): void {
    this.aiRecommendations.push(recommendation);
    // Keep only last 100 recommendations
    if (this.aiRecommendations.length > 100) {
      this.aiRecommendations.shift();
    }
  }

  /**
   * Simulate AI recommendation (for testing)
   */
  async simulateAIRecommendation(agentId: string): Promise<AIRecommendation> {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const agent = this.getAgent(agentId);
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }

    // Simple AI simulation based on agent state
    let recommendation = "maintain";
    let reasoning = "Agent performing normally";
    let confidence = 0.8;

    if (agent.state === "waiting") {
      recommendation = "activate";
      reasoning = "Agent has been waiting for extended period";
      confidence = 0.85;
    } else if (agent.battery && agent.battery < 30) {
      recommendation = "return_to_base";
      reasoning = "Battery level approaching critical threshold";
      confidence = 0.95;
    } else if (agent.state === "active") {
      recommendation = "continue";
      reasoning = "Agent mission parameters optimal";
      confidence = 0.9;
    }

    const aiRec: AIRecommendation = {
      agentId,
      recommendation,
      confidence,
      reasoning,
      timestamp: new Date().toISOString()
    });

    this.addAIRecommendation(aiRec);
    return aiRec;
  }

  /**
   * Subscribe to agent updates
   */
  subscribe(listener: (agents: Agent[]) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(): void {
    const agents = this.getAgents();
    this.listeners.forEach(listener => {
      try {
        listener(agents);
      } catch (error) {
        logger.error("Error in listener:", error);
      }
    });
  }

  /**
   * Add custom rule
   */
  addRule(rule: CoordinationRule): void {
    this.rules.push(rule);
  }

  /**
   * Remove rule
   */
  removeRule(ruleId: string): void {
    this.rules = this.rules.filter(r => r.id !== ruleId);
  }

  /**
   * Get all rules
   */
  getRules(): CoordinationRule[] {
    return [...this.rules];
  }

  /**
   * Enable/disable rule
   */
  setRuleEnabled(ruleId: string, enabled: boolean): void {
    const rule = this.rules.find(r => r.id === ruleId);
    if (rule) {
      rule.enabled = enabled;
    }
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.agents.clear();
    this.aiRecommendations = [];
    this.notifyListeners();
  }
}

// Singleton instance
export const coordinationEngine = new CoordinationEngine();
