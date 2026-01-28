/**
 * Multi-Agent Orchestrator
 * 8 agentes especializados colaborando em decisões complexas
 * Nível: Autônomo
 */

export type AgentRole = 
  | 'captain'      // Strategic decisions, overall command
  | 'engineer'     // Technical systems, maintenance
  | 'safety'       // Safety protocols, emergency response
  | 'wellness'     // Crew wellbeing, fatigue management
  | 'navigator'    // Route planning, weather routing
  | 'economist'    // Cost optimization, financial decisions
  | 'predictor'    // Predictive analytics, risk forecasting
  | 'communicator'; // Stakeholder communication, reporting

export interface Agent {
  id: string;
  role: AgentRole;
  name: string;
  status: 'active' | 'idle' | 'busy' | 'error';
  capabilities: string[];
  currentTask: string | null;
  confidence: number;
  lastAction: Date;
  metrics: AgentMetrics;
}

export interface AgentMetrics {
  decisionsToday: number;
  accuracyRate: number;
  avgResponseTime: number; // ms
  consensusRate: number;
  overruledDecisions: number;
}

export interface Decision {
  id: string;
  type: DecisionType;
  priority: 'low' | 'medium' | 'high' | 'critical' | 'emergency';
  title: string;
  description: string;
  context: Record<string, any>;
  proposedBy: AgentRole;
  consensus: ConsensusResult;
  selectedOption: DecisionOption | null;
  status: 'pending' | 'approved' | 'rejected' | 'executed' | 'rolled_back';
  requiresHumanApproval: boolean;
  humanApprovalBy: string | null;
  executedAt: Date | null;
  outcome: DecisionOutcome | null;
  auditTrail: AuditEntry[];
  createdAt: Date;
}

export type DecisionType = 
  | 'route_optimization'
  | 'maintenance_scheduling'
  | 'crew_rotation'
  | 'emergency_response'
  | 'cost_optimization'
  | 'safety_protocol'
  | 'compliance_action'
  | 'resource_allocation';

export interface DecisionOption {
  id: string;
  description: string;
  pros: string[];
  cons: string[];
  estimatedImpact: {
    safety: number; // -100 to 100
    cost: number;
    time: number;
    crew: number;
  };
  votingAgents: AgentRole[];
  confidence: number;
}

export interface ConsensusResult {
  achieved: boolean;
  method: 'unanimous' | 'majority' | 'weighted' | 'override';
  votingRound: number;
  votes: Array<{
    agent: AgentRole;
    vote: 'approve' | 'reject' | 'abstain';
    confidence: number;
    reasoning: string;
  }>;
  dissent: Array<{
    agent: AgentRole;
    concern: string;
  }>;
}

export interface DecisionOutcome {
  success: boolean;
  actualImpact: {
    safety: number;
    cost: number;
    time: number;
    crew: number;
  };
  lessonsLearned: string[];
  feedbackIncorporated: boolean;
}

export interface AuditEntry {
  timestamp: Date;
  action: string;
  agent: AgentRole | 'system' | 'human';
  details: string;
  hash: string; // For blockchain-style immutability
}

export interface Situation {
  id: string;
  type: string;
  severity: 'info' | 'warning' | 'alert' | 'critical' | 'emergency';
  description: string;
  data: Record<string, any>;
  affectedSystems: string[];
  timestamp: Date;
}

class MultiAgentOrchestrator {
  private agents: Map<AgentRole, Agent> = new Map();
  private pendingDecisions: Map<string, Decision> = new Map();
  private readonly CONSENSUS_THRESHOLD = 0.7; // 70% agreement needed
  private readonly HUMAN_APPROVAL_THRESHOLD = 0.9; // Confidence needed to skip human

  constructor() {
    this.initializeAgents();
  }

  private initializeAgents(): void {
    const agentConfigs: Array<{ role: AgentRole; name: string; capabilities: string[] }> = [
      {
        role: 'captain',
        name: 'ARIA Captain',
        capabilities: ['strategic_planning', 'command_authority', 'stakeholder_management']
      },
      {
        role: 'engineer',
        name: 'ARIA Engineer',
        capabilities: ['technical_analysis', 'maintenance_planning', 'system_diagnostics']
      },
      {
        role: 'safety',
        name: 'ARIA Safety',
        capabilities: ['risk_assessment', 'emergency_protocols', 'compliance_monitoring']
      },
      {
        role: 'wellness',
        name: 'ARIA Wellness',
        capabilities: ['crew_monitoring', 'fatigue_analysis', 'wellbeing_assessment']
      },
      {
        role: 'navigator',
        name: 'ARIA Navigator',
        capabilities: ['route_planning', 'weather_analysis', 'fuel_optimization']
      },
      {
        role: 'economist',
        name: 'ARIA Economist',
        capabilities: ['cost_analysis', 'budget_optimization', 'contract_evaluation']
      },
      {
        role: 'predictor',
        name: 'ARIA Predictor',
        capabilities: ['predictive_modeling', 'trend_analysis', 'risk_forecasting']
      },
      {
        role: 'communicator',
        name: 'ARIA Communicator',
        capabilities: ['report_generation', 'stakeholder_updates', 'alert_distribution']
      }
    ];

    for (const config of agentConfigs) {
      this.agents.set(config.role, {
        id: crypto.randomUUID(),
        role: config.role,
        name: config.name,
        status: 'active',
        capabilities: config.capabilities,
        currentTask: null,
        confidence: 0.85,
        lastAction: new Date(),
        metrics: {
          decisionsToday: 0,
          accuracyRate: 0.92,
          avgResponseTime: 150,
          consensusRate: 0.88,
          overruledDecisions: 0
        }
      });
    }
  }

  async analyzeSituation(situation: Situation): Promise<Decision> {
    // Step 1: Identify relevant agents
    const relevantAgents = this.identifyRelevantAgents(situation);

    // Step 2: Gather agent perspectives
    const perspectives = await this.gatherPerspectives(situation, relevantAgents);

    // Step 3: Generate decision options
    const options = this.generateOptions(situation, perspectives);

    // Step 4: Conduct voting
    const votes = await this.conductVoting(options, relevantAgents);

    // Step 5: Reach consensus
    const consensus = this.calculateConsensus(votes, options);

    // Step 6: Build decision
    const decision = this.buildDecision(situation, options, consensus);

    // Step 7: Store for tracking
    this.pendingDecisions.set(decision.id, decision);

    return decision;
  }

  private identifyRelevantAgents(situation: Situation): AgentRole[] {
    const roleMapping: Record<string, AgentRole[]> = {
      'route': ['navigator', 'captain', 'economist'],
      'maintenance': ['engineer', 'safety', 'predictor'],
      'crew': ['wellness', 'captain', 'safety'],
      'emergency': ['safety', 'captain', 'engineer', 'communicator'],
      'cost': ['economist', 'captain', 'navigator'],
      'compliance': ['safety', 'captain', 'communicator'],
      'weather': ['navigator', 'safety', 'captain']
    };

    const matchedRoles = new Set<AgentRole>();

    for (const [keyword, roles] of Object.entries(roleMapping)) {
      if (
        situation.type.toLowerCase().includes(keyword) ||
        situation.description.toLowerCase().includes(keyword)
      ) {
        roles.forEach(r => matchedRoles.add(r));
      }
    }

    // Always include predictor for analysis
    matchedRoles.add('predictor');

    // Emergency situations include all agents
    if (situation.severity === 'emergency' || situation.severity === 'critical') {
      return [...this.agents.keys()];
    }

    return matchedRoles.size > 0 ? [...matchedRoles] : ['captain', 'predictor', 'safety'];
  }

  private async gatherPerspectives(
    situation: Situation,
    agents: AgentRole[]
  ): Promise<Map<AgentRole, { analysis: string; recommendation: string; confidence: number }>> {
    const perspectives = new Map();

    for (const role of agents) {
      const agent = this.agents.get(role);
      if (!agent) continue;

      // Simulate agent analysis (in production, this would call actual AI models)
      const perspective = await this.simulateAgentAnalysis(agent, situation);
      perspectives.set(role, perspective);

      // Update agent status
      agent.status = 'busy';
      agent.currentTask = `Analyzing: ${situation.type}`;
    }

    // Reset agent status
    for (const role of agents) {
      const agent = this.agents.get(role);
      if (agent) {
        agent.status = 'active';
        agent.currentTask = null;
        agent.lastAction = new Date();
      }
    }

    return perspectives;
  }

  private async simulateAgentAnalysis(
    agent: Agent,
    situation: Situation
  ): Promise<{ analysis: string; recommendation: string; confidence: number }> {
    // Simulate different agent perspectives based on their role
    const analyses: Record<AgentRole, () => { analysis: string; recommendation: string; confidence: number }> = {
      captain: () => ({
        analysis: `Análise estratégica: ${situation.description}. Impacto na operação: ${situation.severity}.`,
        recommendation: 'Proceder com cautela, priorizar segurança da tripulação.',
        confidence: 0.88
      }),
      engineer: () => ({
        analysis: `Avaliação técnica: Sistemas afetados: ${situation.affectedSystems.join(', ')}.`,
        recommendation: 'Verificar redundâncias e programar manutenção preventiva.',
        confidence: 0.90
      }),
      safety: () => ({
        analysis: `Análise de risco: Nível ${situation.severity}. Protocolos aplicáveis identificados.`,
        recommendation: 'Ativar medidas de mitigação conforme procedimentos de segurança.',
        confidence: 0.92
      }),
      wellness: () => ({
        analysis: `Impacto na tripulação: Avaliando níveis de fadiga e estresse.`,
        recommendation: 'Monitorar wellbeing da tripulação, ajustar rotação se necessário.',
        confidence: 0.85
      }),
      navigator: () => ({
        analysis: `Análise de rota: Verificando condições meteorológicas e correntes.`,
        recommendation: 'Considerar ajuste de velocidade ou rota alternativa.',
        confidence: 0.89
      }),
      economist: () => ({
        analysis: `Análise financeira: Estimando impacto em custos operacionais.`,
        recommendation: 'Otimizar recursos, considerar timing de bunker.',
        confidence: 0.87
      }),
      predictor: () => ({
        analysis: `Projeção: Probabilidade de escalada: ${Math.round(Math.random() * 30 + 10)}%.`,
        recommendation: 'Preparar contingências para cenários de evolução.',
        confidence: 0.84
      }),
      communicator: () => ({
        analysis: `Avaliação de comunicação: Stakeholders a notificar identificados.`,
        recommendation: 'Preparar relatório de situação para partes interessadas.',
        confidence: 0.91
      })
    };

    return analyses[agent.role]();
  }

  private generateOptions(
    situation: Situation,
    perspectives: Map<AgentRole, { analysis: string; recommendation: string; confidence: number }>
  ): DecisionOption[] {
    const options: DecisionOption[] = [];

    // Generate options based on situation type and severity
    if (situation.severity === 'emergency' || situation.severity === 'critical') {
      options.push({
        id: crypto.randomUUID(),
        description: 'Ação imediata de emergência',
        pros: ['Resposta rápida', 'Minimiza riscos', 'Prioriza segurança'],
        cons: ['Custo elevado', 'Possível interrupção operacional'],
        estimatedImpact: { safety: 80, cost: -40, time: -20, crew: 60 },
        votingAgents: [],
        confidence: 0.90
      });
    }

    options.push({
      id: crypto.randomUUID(),
      description: 'Ação moderada com monitoramento',
      pros: ['Balanceado', 'Permite ajustes', 'Custo controlado'],
      cons: ['Resposta mais lenta', 'Requer acompanhamento'],
      estimatedImpact: { safety: 50, cost: -15, time: -10, crew: 40 },
      votingAgents: [],
      confidence: 0.85
    });

    options.push({
      id: crypto.randomUUID(),
      description: 'Observação e preparação de contingência',
      pros: ['Baixo custo', 'Preserva opções', 'Coleta mais dados'],
      cons: ['Risco de escalada', 'Resposta tardia'],
      estimatedImpact: { safety: 20, cost: 5, time: 0, crew: 20 },
      votingAgents: [],
      confidence: 0.75
    });

    return options;
  }

  private async conductVoting(
    options: DecisionOption[],
    agents: AgentRole[]
  ): Promise<Array<{
    agent: AgentRole;
    optionId: string;
    vote: 'approve' | 'reject' | 'abstain';
    confidence: number;
    reasoning: string;
  }>> {
    const votes: Array<{
      agent: AgentRole;
      optionId: string;
      vote: 'approve' | 'reject' | 'abstain';
      confidence: number;
      reasoning: string;
    }> = [];

    for (const role of agents) {
      const agent = this.agents.get(role);
      if (!agent) continue;

      // Each agent votes on their preferred option
      const preferredOption = this.getAgentPreference(role, options);
      
      votes.push({
        agent: role,
        optionId: preferredOption.id,
        vote: 'approve',
        confidence: agent.confidence,
        reasoning: this.generateVoteReasoning(role, preferredOption)
      });
    }

    return votes;
  }

  private getAgentPreference(role: AgentRole, options: DecisionOption[]): DecisionOption {
    // Different agents have different priorities
    const priorities: Record<AgentRole, keyof DecisionOption['estimatedImpact']> = {
      captain: 'safety',
      engineer: 'time',
      safety: 'safety',
      wellness: 'crew',
      navigator: 'time',
      economist: 'cost',
      predictor: 'safety',
      communicator: 'crew'
    };

    const priority = priorities[role];
    
    return options.reduce((best, current) => {
      const bestScore = best.estimatedImpact[priority];
      const currentScore = current.estimatedImpact[priority];
      return currentScore > bestScore ? current : best;
    });
  }

  private generateVoteReasoning(role: AgentRole, option: DecisionOption): string {
    const reasonings: Record<AgentRole, string> = {
      captain: `Opção alinhada com prioridades estratégicas e segurança da operação.`,
      engineer: `Viabilidade técnica confirmada. Recursos disponíveis para execução.`,
      safety: `Análise de risco favorável. Protocolos de segurança podem ser mantidos.`,
      wellness: `Impacto positivo no bem-estar da tripulação previsto.`,
      navigator: `Condições operacionais compatíveis. Rota/tempo otimizados.`,
      economist: `Custo-benefício dentro de parâmetros aceitáveis.`,
      predictor: `Projeções indicam resultado favorável com alta probabilidade.`,
      communicator: `Comunicação aos stakeholders será clara e positiva.`
    };

    return reasonings[role];
  }

  private calculateConsensus(
    votes: Array<{
      agent: AgentRole;
      optionId: string;
      vote: 'approve' | 'reject' | 'abstain';
      confidence: number;
      reasoning: string;
    }>,
    options: DecisionOption[]
  ): ConsensusResult {
    // Count votes per option
    const voteCounts = new Map<string, number>();
    for (const vote of votes) {
      const count = voteCounts.get(vote.optionId) || 0;
      voteCounts.set(vote.optionId, count + vote.confidence);
    }

    // Find winning option
    let maxVotes = 0;
    let winningOption = '';
    for (const [optionId, count] of voteCounts) {
      if (count > maxVotes) {
        maxVotes = count;
        winningOption = optionId;
      }
    }

    const totalConfidence = votes.reduce((sum, v) => sum + v.confidence, 0);
    const consensusRatio = maxVotes / totalConfidence;
    const achieved = consensusRatio >= this.CONSENSUS_THRESHOLD;

    // Identify dissent
    const dissent = votes
      .filter(v => v.optionId !== winningOption && v.vote !== 'abstain')
      .map(v => ({
        agent: v.agent,
        concern: v.reasoning
      }));

    return {
      achieved,
      method: achieved ? 'majority' : 'weighted',
      votingRound: 1,
      votes: votes.map(v => ({
        agent: v.agent,
        vote: v.optionId === winningOption ? 'approve' : 'reject',
        confidence: v.confidence,
        reasoning: v.reasoning
      })),
      dissent
    };
  }

  private buildDecision(
    situation: Situation,
    options: DecisionOption[],
    consensus: ConsensusResult
  ): Decision {
    const approvedVotes = consensus.votes.filter(v => v.vote === 'approve');
    const avgConfidence = approvedVotes.reduce((sum, v) => sum + v.confidence, 0) / approvedVotes.length;
    
    const selectedOption = options.find(o => 
      consensus.votes.filter(v => v.vote === 'approve').length > 0
    ) || options[0];

    const decisionType = this.mapSituationToDecisionType(situation);
    const requiresHumanApproval = avgConfidence < this.HUMAN_APPROVAL_THRESHOLD || 
                                   situation.severity === 'emergency' ||
                                   situation.severity === 'critical';

    const decision: Decision = {
      id: crypto.randomUUID(),
      type: decisionType,
      priority: this.mapSeverityToPriority(situation.severity),
      title: `Decisão: ${situation.type}`,
      description: selectedOption.description,
      context: situation.data,
      proposedBy: 'predictor',
      consensus,
      selectedOption,
      status: requiresHumanApproval ? 'pending' : 'approved',
      requiresHumanApproval,
      humanApprovalBy: null,
      executedAt: null,
      outcome: null,
      auditTrail: [
        this.createAuditEntry('Decision initiated', 'system', `Situation: ${situation.type}`),
        this.createAuditEntry('Consensus reached', 'system', `Method: ${consensus.method}, Achieved: ${consensus.achieved}`),
        ...consensus.votes.map(v => 
          this.createAuditEntry(`Vote registered`, v.agent, `${v.vote} with ${(v.confidence * 100).toFixed(0)}% confidence`)
        )
      ],
      createdAt: new Date()
    };

    return decision;
  }

  private mapSituationToDecisionType(situation: Situation): DecisionType {
    const mapping: Record<string, DecisionType> = {
      'route': 'route_optimization',
      'maintenance': 'maintenance_scheduling',
      'crew': 'crew_rotation',
      'emergency': 'emergency_response',
      'cost': 'cost_optimization',
      'safety': 'safety_protocol',
      'compliance': 'compliance_action',
      'resource': 'resource_allocation'
    };

    for (const [keyword, type] of Object.entries(mapping)) {
      if (situation.type.toLowerCase().includes(keyword)) {
        return type;
      }
    }

    return 'resource_allocation';
  }

  private mapSeverityToPriority(severity: Situation['severity']): Decision['priority'] {
    const mapping: Record<Situation['severity'], Decision['priority']> = {
      'info': 'low',
      'warning': 'medium',
      'alert': 'high',
      'critical': 'critical',
      'emergency': 'emergency'
    };
    return mapping[severity];
  }

  private createAuditEntry(
    action: string,
    agent: AgentRole | 'system' | 'human',
    details: string
  ): AuditEntry {
    const entry = {
      timestamp: new Date(),
      action,
      agent,
      details,
      hash: ''
    };

    // Create hash for immutability verification
    const content = `${entry.timestamp.toISOString()}|${action}|${agent}|${details}`;
    entry.hash = this.simpleHash(content);

    return entry;
  }

  private simpleHash(input: string): string {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
  }

  async executeDecision(decisionId: string, executor: string): Promise<boolean> {
    const decision = this.pendingDecisions.get(decisionId);
    if (!decision) return false;

    if (decision.requiresHumanApproval && !decision.humanApprovalBy) {
      decision.humanApprovalBy = executor;
      decision.auditTrail.push(
        this.createAuditEntry('Human approval granted', 'human', `Approved by: ${executor}`)
      );
    }

    decision.status = 'executed';
    decision.executedAt = new Date();
    decision.auditTrail.push(
      this.createAuditEntry('Decision executed', 'system', 'Execution completed successfully')
    );

    // Update agent metrics
    for (const vote of decision.consensus.votes) {
      const agent = this.agents.get(vote.agent);
      if (agent) {
        agent.metrics.decisionsToday++;
      }
    }

    return true;
  }

  getAgentStatus(): Agent[] {
    return [...this.agents.values()];
  }

  getPendingDecisions(): Decision[] {
    return [...this.pendingDecisions.values()].filter(d => d.status === 'pending');
  }

  getDecision(id: string): Decision | undefined {
    return this.pendingDecisions.get(id);
  }
}

export const multiAgentOrchestrator = new MultiAgentOrchestrator();
