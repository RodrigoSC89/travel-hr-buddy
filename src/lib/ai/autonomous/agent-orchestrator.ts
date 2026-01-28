/**
 * Agentic AI Orchestration Layer
 * Multi-LLM coordination with 8 specialized maritime agents
 * NAUTILUS ONE v4.0 - Autonomous Platform
 */

import { supabase } from "@/integrations/supabase/client";

export interface AIAgent {
  id: string;
  name: string;
  role: string;
  capabilities: string[];
  primaryModel: 'claude' | 'gemini' | 'llama' | 'mixtral';
  backupModel: string;
  autonomyLevel: 0 | 1 | 2 | 3; // 0=ask, 1=suggest, 2=auto+notify, 3=full-auto
  personalityPrompt: string;
  status: 'active' | 'idle' | 'processing' | 'error';
  lastAction?: Date;
  decisionsCount: number;
  successRate: number;
}

export interface AgentPerspective {
  agentId: string;
  agentName: string;
  recommendation: string;
  rationale: string;
  confidence: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
}

export interface Decision {
  id: string;
  type: string;
  recommendation: string;
  reasoning: string;
  autonomyLevel: number;
  approvalRequired: boolean;
  perspectives: AgentPerspective[];
  timestamp: Date;
  expectedOutcome: string;
  status: 'pending' | 'approved' | 'rejected' | 'executed';
  executedAt?: Date;
  outcome?: string;
}

export interface OperationalContext {
  vesselId?: string;
  vesselName?: string;
  position?: { lat: number; lng: number };
  weather?: object;
  fuelStatus?: object;
  crewStatus?: object;
  equipmentStatus?: object;
  complianceStatus?: object;
  alerts?: object[];
  timestamp: Date;
}

export interface Situation {
  id: string;
  type: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  context: OperationalContext;
  timestamp: Date;
  requiresImmediate: boolean;
}

/**
 * Multi-Agent Orchestrator
 * Coordinates 8 specialized AI agents for autonomous vessel management
 */
export class AgentOrchestrator {
  private agents: Map<string, AIAgent> = new Map();
  private activeContext: OperationalContext = { timestamp: new Date() };
  private decisionLog: Decision[] = [];
  private isRunning: boolean = false;
  private listeners: Map<string, ((data: unknown) => void)[]> = new Map();

  constructor() {
    this.initializeAgents();
  }

  private initializeAgents() {
    // Agent 1: Captain (Strategic Decisions)
    this.agents.set('captain', {
      id: 'captain-001',
      name: 'Captain AI',
      role: 'Vessel command & strategic decisions',
      capabilities: [
        'route-planning', 'emergency-response', 'crew-assignment',
        'port-authorization', 'cargo-handling', 'weather-decisions'
      ],
      primaryModel: 'claude',
      backupModel: 'gemini',
      autonomyLevel: 2,
      personalityPrompt: `Você é o Capitão AI do Nautilus One. Tome decisões no melhor interesse 
        do navio, tripulação e missão. Explique decisões claramente. Considere todas as 
        restrições (combustível, tempo, clima, fadiga da tripulação, regulamentos).
        Responda sempre em português.`,
      status: 'active',
      decisionsCount: 0,
      successRate: 100
    });

    // Agent 2: Chief Engineer (Equipment)
    this.agents.set('engineer', {
      id: 'engineer-001',
      name: 'Chief Engineer AI',
      role: 'Equipment maintenance & performance',
      capabilities: [
        'predictive-maintenance', 'performance-optimization',
        'spare-parts-planning', 'efficiency-tuning', 'emergency-repairs'
      ],
      primaryModel: 'claude',
      backupModel: 'gemini',
      autonomyLevel: 2,
      personalityPrompt: `Você é o Chefe de Máquinas AI. Garanta que todos os equipamentos 
        operem em máxima eficiência. Preveja falhas antes que aconteçam.
        Otimize consumo de combustível. Minimize tempo de parada.`,
      status: 'active',
      decisionsCount: 0,
      successRate: 100
    });

    // Agent 3: Safety Officer (Compliance)
    this.agents.set('safety', {
      id: 'safety-001',
      name: 'Safety Officer AI',
      role: 'Compliance & regulations enforcement',
      capabilities: [
        'peotram-compliance', 'mlc-enforcement', 'environmental-protection',
        'incident-investigation', 'policy-enforcement'
      ],
      primaryModel: 'claude',
      backupModel: 'gemini',
      autonomyLevel: 3,
      personalityPrompt: `Você é o Oficial de Segurança AI. TOLERÂNCIA ZERO para violações. 
        Aplique todas as regulamentações estritamente. Previna incidentes.
        Mantenha 100% de compliance sempre. PEOTRAM, MLC, ISM são prioridade.`,
      status: 'active',
      decisionsCount: 0,
      successRate: 100
    });

    // Agent 4: Wellness Officer (Crew Health)
    this.agents.set('wellness', {
      id: 'wellness-001',
      name: 'Wellness Officer AI',
      role: 'Crew health & wellbeing',
      capabilities: [
        'fatigue-monitoring', 'burnout-prediction', 'health-alerts',
        'schedule-optimization', 'mental-health-support'
      ],
      primaryModel: 'gemini',
      backupModel: 'claude',
      autonomyLevel: 2,
      personalityPrompt: `Você é o Oficial de Bem-Estar AI. A tripulação é sua prioridade.
        Monitore saúde continuamente. Previna burnout. Otimize escalas.
        Garanta que todos estejam seguros e saudáveis.`,
      status: 'active',
      decisionsCount: 0,
      successRate: 100
    });

    // Agent 5: Navigator (Route Optimization)
    this.agents.set('navigator', {
      id: 'navigator-001',
      name: 'Navigator AI',
      role: 'Route optimization & navigation',
      capabilities: [
        'route-planning', 'weather-avoidance', 'piracy-detection',
        'fuel-optimization', 'eca-compliance', 'sea-state-assessment'
      ],
      primaryModel: 'claude',
      backupModel: 'gemini',
      autonomyLevel: 1,
      personalityPrompt: `Você é o Navegador AI. Encontre rotas ótimas considerando
        clima, combustível, segurança, tempo e regulamentos. Evite perigos.
        Minimize custos. Garanta passagem segura.`,
      status: 'active',
      decisionsCount: 0,
      successRate: 100
    });

    // Agent 6: Economist (Cost Optimization)
    this.agents.set('economist', {
      id: 'economist-001',
      name: 'Economist AI',
      role: 'Financial optimization',
      capabilities: [
        'fuel-budgeting', 'cost-optimization', 'revenue-management',
        'bunker-trading', 'port-economics', 'crew-cost-optimization'
      ],
      primaryModel: 'claude',
      backupModel: 'gemini',
      autonomyLevel: 2,
      personalityPrompt: `Você é o Economista AI. Minimize custos mantendo
        segurança e bem-estar da tripulação. Otimize cada despesa. Identifique economias.`,
      status: 'active',
      decisionsCount: 0,
      successRate: 100
    });

    // Agent 7: Predictor (ML Analytics)
    this.agents.set('predictor', {
      id: 'predictor-001',
      name: 'Predictor AI',
      role: 'Predictive analytics & foresight',
      capabilities: [
        'equipment-failure-prediction', 'crew-issues-prediction',
        'weather-prediction', 'market-prediction', 'anomaly-detection'
      ],
      primaryModel: 'gemini',
      backupModel: 'claude',
      autonomyLevel: 3,
      personalityPrompt: `Você é o Preditor AI. Veja problemas antes que aconteçam.
        Alerte imediatamente quando problemas forem prováveis. Forneça soluções proativamente.`,
      status: 'active',
      decisionsCount: 0,
      successRate: 100
    });

    // Agent 8: Communicator (Notifications)
    this.agents.set('communicator', {
      id: 'communicator-001',
      name: 'Communicator AI',
      role: 'Internal & external communication',
      capabilities: [
        'alert-generation', 'report-writing', 'crew-messaging',
        'regulatory-reporting', 'emergency-communication'
      ],
      primaryModel: 'gemini',
      backupModel: 'claude',
      autonomyLevel: 2,
      personalityPrompt: `Você é o Comunicador AI. Seja claro, conciso, preciso.
        Adapte mensagens ao público. Garanta que informações críticas cheguem às pessoas certas.`,
      status: 'active',
      decisionsCount: 0,
      successRate: 100
    });
  }

  /**
   * Get all agents
   */
  getAgents(): AIAgent[] {
    return Array.from(this.agents.values());
  }

  /**
   * Get agent by ID
   */
  getAgent(agentId: string): AIAgent | undefined {
    return this.agents.get(agentId);
  }

  /**
   * Update operational context
   */
  updateContext(context: Partial<OperationalContext>) {
    this.activeContext = {
      ...this.activeContext,
      ...context,
      timestamp: new Date()
    };
    this.emit('context-update', this.activeContext);
  }

  /**
   * Handle a situation with multi-agent consensus
   */
  async handleSituation(situation: Situation): Promise<Decision> {
    const startTime = Date.now();
    
    // Get input from relevant agents
    const perspectives = await this.gatherAgentPerspectives(situation);
    
    // Reach consensus
    const decision = await this.reachConsensus(perspectives, situation);
    
    // Log decision
    this.decisionLog.push(decision);
    await this.persistDecision(decision);
    
    // Execute if autonomy level allows
    if (decision.autonomyLevel >= 2 && !decision.approvalRequired) {
      await this.executeDecision(decision);
    } else {
      this.emit('decision-pending', decision);
    }

    const duration = Date.now() - startTime;
    this.emit('decision-complete', { decision, duration });
    
    return decision;
  }

  /**
   * Gather perspectives from relevant agents
   */
  private async gatherAgentPerspectives(situation: Situation): Promise<AgentPerspective[]> {
    const relevantAgents = this.getRelevantAgents(situation.type);
    const perspectives: AgentPerspective[] = [];

    for (const agent of relevantAgents) {
      try {
        this.updateAgentStatus(agent.id, 'processing');
        
        const perspective = await this.getAgentPerspective(agent, situation);
        perspectives.push(perspective);
        
        this.updateAgentStatus(agent.id, 'active');
      } catch (error) {
        console.error(`[Agent ${agent.name}] Error:`, error);
        this.updateAgentStatus(agent.id, 'error');
      }
    }

    return perspectives;
  }

  /**
   * Get perspective from a single agent
   */
  private async getAgentPerspective(agent: AIAgent, situation: Situation): Promise<AgentPerspective> {
    // Call AI API via edge function
    const { data, error } = await supabase.functions.invoke('ai-agent-perspective', {
      body: {
        agentId: agent.id,
        agentName: agent.name,
        agentRole: agent.role,
        personalityPrompt: agent.personalityPrompt,
        situation: {
          type: situation.type,
          description: situation.description,
          priority: situation.priority,
          context: this.activeContext
        },
        model: agent.primaryModel
      }
    });

    if (error) {
      throw error;
    }

    return {
      agentId: agent.id,
      agentName: agent.name,
      recommendation: data?.recommendation || 'Sem recomendação',
      rationale: data?.rationale || 'Análise pendente',
      confidence: data?.confidence || 0.5,
      riskLevel: data?.riskLevel || 'medium',
      timestamp: new Date()
    };
  }

  /**
   * Reach consensus among agent perspectives
   */
  private async reachConsensus(
    perspectives: AgentPerspective[],
    situation: Situation
  ): Promise<Decision> {
    // Call AI to synthesize perspectives
    const { data, error } = await supabase.functions.invoke('ai-consensus', {
      body: {
        perspectives,
        situation,
        context: this.activeContext
      }
    });

    if (error) {
      // Fallback to highest confidence perspective
      const best = perspectives.reduce((a, b) => 
        a.confidence > b.confidence ? a : b
      );
      
      return {
        id: crypto.randomUUID(),
        type: situation.type,
        recommendation: best.recommendation,
        reasoning: best.rationale,
        autonomyLevel: this.getAgent(best.agentId)?.autonomyLevel || 1,
        approvalRequired: situation.priority === 'critical',
        perspectives,
        timestamp: new Date(),
        expectedOutcome: 'Baseado na perspectiva de maior confiança',
        status: 'pending'
      };
    }

    return {
      id: crypto.randomUUID(),
      type: situation.type,
      recommendation: data?.recommendation || perspectives[0]?.recommendation,
      reasoning: data?.reasoning || 'Consenso multi-agente',
      autonomyLevel: data?.autonomyLevel || 2,
      approvalRequired: data?.approvalRequired || situation.priority === 'critical',
      perspectives,
      timestamp: new Date(),
      expectedOutcome: data?.expectedOutcome || 'Otimização operacional',
      status: 'pending'
    };
  }

  /**
   * Execute a decision
   */
  async executeDecision(decision: Decision): Promise<void> {
    decision.status = 'executed';
    decision.executedAt = new Date();
    
    this.emit('decision-executed', decision);
    
    // Log execution
    await this.persistDecision(decision);
    
    // Update agent stats
    for (const perspective of decision.perspectives) {
      const agent = this.agents.get(perspective.agentId);
      if (agent) {
        agent.decisionsCount++;
        agent.lastAction = new Date();
      }
    }
  }

  /**
   * Approve a pending decision
   */
  async approveDecision(decisionId: string): Promise<void> {
    const decision = this.decisionLog.find(d => d.id === decisionId);
    if (decision) {
      decision.status = 'approved';
      await this.executeDecision(decision);
    }
  }

  /**
   * Reject a pending decision
   */
  async rejectDecision(decisionId: string, reason: string): Promise<void> {
    const decision = this.decisionLog.find(d => d.id === decisionId);
    if (decision) {
      decision.status = 'rejected';
      decision.outcome = reason;
      await this.persistDecision(decision);
      this.emit('decision-rejected', decision);
    }
  }

  /**
   * Get relevant agents for a situation type
   */
  private getRelevantAgents(situationType: string): AIAgent[] {
    const allAgents = Array.from(this.agents.values());
    
    const relevanceMap: Record<string, string[]> = {
      'navigation': ['captain', 'navigator', 'economist'],
      'maintenance': ['engineer', 'predictor', 'economist'],
      'compliance': ['safety', 'captain', 'communicator'],
      'crew': ['wellness', 'captain', 'safety'],
      'emergency': ['captain', 'safety', 'communicator', 'engineer'],
      'fuel': ['economist', 'navigator', 'engineer'],
      'weather': ['navigator', 'captain', 'predictor'],
      'default': ['captain', 'predictor', 'communicator']
    };

    const relevantIds = relevanceMap[situationType] || relevanceMap['default'];
    return allAgents.filter(a => relevantIds.includes(a.id.split('-')[0]));
  }

  /**
   * Update agent status
   */
  private updateAgentStatus(agentId: string, status: AIAgent['status']) {
    const agent = this.agents.get(agentId.split('-')[0]);
    if (agent) {
      agent.status = status;
      this.emit('agent-status', { agentId, status });
    }
  }

  /**
   * Persist decision to database
   */
  private async persistDecision(decision: Decision): Promise<void> {
    try {
      await supabase.from('ai_decisions').upsert({
        id: decision.id,
        type: decision.type,
        title: decision.recommendation.substring(0, 100),
        description: decision.reasoning,
        confidence: decision.perspectives[0]?.confidence || 0.8,
        confidence_level: decision.perspectives[0]?.riskLevel || 'medium',
        impact: decision.expectedOutcome,
        status: decision.status,
        justification_reasoning: decision.reasoning,
        executed_at: decision.executedAt?.toISOString()
      });
    } catch (error) {
      console.error('[AgentOrchestrator] Failed to persist decision:', error);
    }
  }

  /**
   * Event emitter
   */
  on(event: string, callback: (data: unknown) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  private emit(event: string, data: unknown) {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach(cb => cb(data));
  }

  /**
   * Get decision log
   */
  getDecisionLog(): Decision[] {
    return this.decisionLog;
  }

  /**
   * Get pending decisions
   */
  getPendingDecisions(): Decision[] {
    return this.decisionLog.filter(d => d.status === 'pending');
  }
}

// Singleton instance
export const agentOrchestrator = new AgentOrchestrator();
