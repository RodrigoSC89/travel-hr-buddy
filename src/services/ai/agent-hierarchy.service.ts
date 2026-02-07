/**
 * M001 - Hierarchical Agent Architecture
 * 3-tier hierarchy: SUPERVISOR → COORDINATOR → EXECUTOR
 * Inspired by Palantir AIP multi-tier agent systems
 */

export type AgentLevel = 'SUPERVISOR' | 'COORDINATOR' | 'EXECUTOR';

export interface AgentNode {
  id: string;
  name: string;
  level: AgentLevel;
  role: string;
  domain: string;
  manages: string[];
  reportsTo: string | null;
  capabilities: string[];
  autonomyLevel: number; // 0-3 (L0: Info, L1: Suggest, L2: Act+Confirm, L3: Autonomous)
  maxConfidenceThreshold: number; // Below this → escalate up
}

export interface EscalationRequest {
  fromAgent: string;
  toAgent: string;
  reason: string;
  context: Record<string, unknown>;
  confidence: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
}

export interface AgentDecisionPath {
  agent: string;
  level: AgentLevel;
  action: string;
  confidence: number;
  escalated: boolean;
  escalationReason?: string;
  delegatedTo?: string[];
  timestamp: Date;
}

// ============================================
// NAUTI ONE AGENT HIERARCHY - 25 Agents, 3 Tiers
// ============================================

export const AGENT_HIERARCHY: Record<string, AgentNode> = {
  // ===== TIER 1: SUPERVISORS (3 agents) =====
  'nauti-brain': {
    id: 'nauti-brain',
    name: 'Nauti Brain',
    level: 'SUPERVISOR',
    role: 'Chief AI Officer',
    domain: 'all',
    manages: ['captain-ai', 'compliance-chief', 'operations-chief'],
    reportsTo: null,
    capabilities: ['strategic-decisions', 'cross-module-analysis', 'fleet-intelligence', 'crisis-management'],
    autonomyLevel: 3,
    maxConfidenceThreshold: 0.95,
  },
  'captain-ai': {
    id: 'captain-ai',
    name: 'Captain AI',
    level: 'SUPERVISOR',
    role: 'Fleet Operations Director',
    domain: 'operations',
    manages: ['navigator-ai', 'weather-ai', 'voyage-ai', 'tracking-ai'],
    reportsTo: 'nauti-brain',
    capabilities: ['fleet-coordination', 'voyage-planning', 'risk-assessment', 'emergency-response'],
    autonomyLevel: 3,
    maxConfidenceThreshold: 0.90,
  },
  'compliance-chief': {
    id: 'compliance-chief',
    name: 'Compliance Chief',
    level: 'SUPERVISOR',
    role: 'Regulatory Affairs Director',
    domain: 'compliance',
    manages: ['ism-agent', 'isps-agent', 'mlc-agent', 'marpol-agent', 'solas-agent', 'stcw-agent', 'sgso-agent', 'psc-agent'],
    reportsTo: 'nauti-brain',
    capabilities: ['regulatory-strategy', 'audit-coordination', 'compliance-forecasting'],
    autonomyLevel: 2,
    maxConfidenceThreshold: 0.92,
  },

  // ===== TIER 2: COORDINATORS (7 agents) =====
  'operations-chief': {
    id: 'operations-chief',
    name: 'Operations Chief',
    level: 'COORDINATOR',
    role: 'Operations Manager',
    domain: 'operations',
    manages: ['maintenance-ai', 'finance-ai', 'crew-ai', 'esg-ai'],
    reportsTo: 'nauti-brain',
    capabilities: ['resource-allocation', 'schedule-optimization', 'cost-management'],
    autonomyLevel: 2,
    maxConfidenceThreshold: 0.85,
  },
  'navigator-ai': {
    id: 'navigator-ai',
    name: 'Navigator AI',
    level: 'COORDINATOR',
    role: 'Navigation Specialist',
    domain: 'navigation',
    manages: ['weather-ai', 'tracking-ai'],
    reportsTo: 'captain-ai',
    capabilities: ['route-calculation', 'eta-prediction', 'fuel-optimization', 'eca-monitoring'],
    autonomyLevel: 2,
    maxConfidenceThreshold: 0.85,
  },
  'maintenance-ai': {
    id: 'maintenance-ai',
    name: 'Engineer AI',
    level: 'COORDINATOR',
    role: 'Chief Engineer AI',
    domain: 'maintenance',
    manages: ['equipment-monitor', 'spare-parts-ai'],
    reportsTo: 'operations-chief',
    capabilities: ['predictive-maintenance', 'failure-analysis', 'drydock-planning', 'cbm'],
    autonomyLevel: 2,
    maxConfidenceThreshold: 0.80,
  },
  'crew-ai': {
    id: 'crew-ai',
    name: 'People AI',
    level: 'COORDINATOR',
    role: 'HR & Crew Manager',
    domain: 'crew',
    manages: ['wellness-ai', 'training-ai'],
    reportsTo: 'operations-chief',
    capabilities: ['crew-optimization', 'fatigue-analysis', 'competency-matching', 'payroll'],
    autonomyLevel: 2,
    maxConfidenceThreshold: 0.82,
  },
  'finance-ai': {
    id: 'finance-ai',
    name: 'Finance AI',
    level: 'COORDINATOR',
    role: 'Financial Controller',
    domain: 'finance',
    manages: [],
    reportsTo: 'operations-chief',
    capabilities: ['budget-analysis', 'anomaly-detection', 'forecasting', 'procurement'],
    autonomyLevel: 1,
    maxConfidenceThreshold: 0.90,
  },
  'esg-ai': {
    id: 'esg-ai',
    name: 'ESG AI',
    level: 'COORDINATOR',
    role: 'Sustainability Officer',
    domain: 'esg',
    manages: [],
    reportsTo: 'operations-chief',
    capabilities: ['emissions-tracking', 'cii-calculation', 'carbon-footprint', 'marpol-compliance'],
    autonomyLevel: 2,
    maxConfidenceThreshold: 0.85,
  },

  // ===== TIER 3: EXECUTORS (15 agents) =====
  'weather-ai': {
    id: 'weather-ai',
    name: 'Weather AI',
    level: 'EXECUTOR',
    role: 'Meteorologist',
    domain: 'weather',
    manages: [],
    reportsTo: 'navigator-ai',
    capabilities: ['forecast-analysis', 'storm-detection', 'route-weather-impact'],
    autonomyLevel: 1,
    maxConfidenceThreshold: 0.75,
  },
  'tracking-ai': {
    id: 'tracking-ai',
    name: 'Tracking AI',
    level: 'EXECUTOR',
    role: 'AIS Monitor',
    domain: 'tracking',
    manages: [],
    reportsTo: 'navigator-ai',
    capabilities: ['position-tracking', 'geofencing', 'anomaly-detection', 'ais-parsing'],
    autonomyLevel: 1,
    maxConfidenceThreshold: 0.75,
  },
  'voyage-ai': {
    id: 'voyage-ai',
    name: 'Voyage AI',
    level: 'EXECUTOR',
    role: 'Voyage Planner',
    domain: 'voyage',
    manages: [],
    reportsTo: 'captain-ai',
    capabilities: ['pnl-simulation', 'bunker-optimization', 'charter-analysis'],
    autonomyLevel: 1,
    maxConfidenceThreshold: 0.78,
  },
  'wellness-ai': {
    id: 'wellness-ai',
    name: 'Wellness AI',
    level: 'EXECUTOR',
    role: 'Crew Wellbeing Specialist',
    domain: 'wellness',
    manages: [],
    reportsTo: 'crew-ai',
    capabilities: ['fatigue-prediction', 'burnout-detection', 'rest-hour-analysis'],
    autonomyLevel: 1,
    maxConfidenceThreshold: 0.80,
  },
  'training-ai': {
    id: 'training-ai',
    name: 'Training AI',
    level: 'EXECUTOR',
    role: 'Training Coordinator',
    domain: 'training',
    manages: [],
    reportsTo: 'crew-ai',
    capabilities: ['competency-gap-analysis', 'course-recommendation', 'stcw-compliance'],
    autonomyLevel: 1,
    maxConfidenceThreshold: 0.75,
  },
  'equipment-monitor': {
    id: 'equipment-monitor',
    name: 'Equipment Monitor',
    level: 'EXECUTOR',
    role: 'IoT Sensor Analyst',
    domain: 'maintenance',
    manages: [],
    reportsTo: 'maintenance-ai',
    capabilities: ['sensor-reading', 'threshold-monitoring', 'alarm-generation'],
    autonomyLevel: 1,
    maxConfidenceThreshold: 0.70,
  },
  'spare-parts-ai': {
    id: 'spare-parts-ai',
    name: 'Spare Parts AI',
    level: 'EXECUTOR',
    role: 'Inventory Specialist',
    domain: 'inventory',
    manages: [],
    reportsTo: 'maintenance-ai',
    capabilities: ['demand-forecasting', 'reorder-optimization', 'vendor-matching'],
    autonomyLevel: 1,
    maxConfidenceThreshold: 0.75,
  },
  // Compliance Executors
  'ism-agent': { id: 'ism-agent', name: 'ISM Agent', level: 'EXECUTOR', role: 'ISM Code Auditor', domain: 'ism', manages: [], reportsTo: 'compliance-chief', capabilities: ['ism-audit', 'sms-review', 'ncr-analysis'], autonomyLevel: 1, maxConfidenceThreshold: 0.80 },
  'isps-agent': { id: 'isps-agent', name: 'ISPS Agent', level: 'EXECUTOR', role: 'Security Officer', domain: 'isps', manages: [], reportsTo: 'compliance-chief', capabilities: ['security-assessment', 'threat-analysis', 'ssp-review'], autonomyLevel: 1, maxConfidenceThreshold: 0.85 },
  'mlc-agent': { id: 'mlc-agent', name: 'MLC Agent', level: 'EXECUTOR', role: 'Labour Standards', domain: 'mlc', manages: [], reportsTo: 'compliance-chief', capabilities: ['hours-validation', 'wage-compliance', 'living-conditions'], autonomyLevel: 1, maxConfidenceThreshold: 0.82 },
  'marpol-agent': { id: 'marpol-agent', name: 'MARPOL Agent', level: 'EXECUTOR', role: 'Environmental Compliance', domain: 'marpol', manages: [], reportsTo: 'compliance-chief', capabilities: ['emissions-audit', 'waste-management', 'annex-compliance'], autonomyLevel: 1, maxConfidenceThreshold: 0.80 },
  'solas-agent': { id: 'solas-agent', name: 'SOLAS Agent', level: 'EXECUTOR', role: 'Safety Inspector', domain: 'solas', manages: [], reportsTo: 'compliance-chief', capabilities: ['safety-equipment', 'lsa-ffe', 'fire-protection'], autonomyLevel: 1, maxConfidenceThreshold: 0.85 },
  'stcw-agent': { id: 'stcw-agent', name: 'STCW Agent', level: 'EXECUTOR', role: 'Training Standards', domain: 'stcw', manages: [], reportsTo: 'compliance-chief', capabilities: ['certification-tracking', 'competency-verification', 'training-requirements'], autonomyLevel: 1, maxConfidenceThreshold: 0.80 },
  'sgso-agent': { id: 'sgso-agent', name: 'SGSO Agent', level: 'EXECUTOR', role: 'Safety Management', domain: 'sgso', manages: [], reportsTo: 'compliance-chief', capabilities: ['sgso-audit', 'risk-assessment', 'incident-analysis'], autonomyLevel: 1, maxConfidenceThreshold: 0.78 },
  'psc-agent': { id: 'psc-agent', name: 'PSC Agent', level: 'EXECUTOR', role: 'Port State Control', domain: 'psc', manages: [], reportsTo: 'compliance-chief', capabilities: ['psc-prediction', 'deficiency-analysis', 'pre-inspection-briefing'], autonomyLevel: 1, maxConfidenceThreshold: 0.85 },
};

// ============================================
// HIERARCHY SERVICE
// ============================================

class AgentHierarchyService {
  private hierarchy = AGENT_HIERARCHY;
  private escalationLog: EscalationRequest[] = [];
  private decisionPath: AgentDecisionPath[] = [];

  /** Get agent by ID */
  getAgent(agentId: string): AgentNode | undefined {
    return this.hierarchy[agentId];
  }

  /** Get all agents at a specific level */
  getAgentsByLevel(level: AgentLevel): AgentNode[] {
    return Object.values(this.hierarchy).filter(a => a.level === level);
  }

  /** Get subordinates of an agent */
  getSubordinates(agentId: string): AgentNode[] {
    const agent = this.hierarchy[agentId];
    if (!agent) return [];
    return agent.manages
      .map(id => this.hierarchy[id])
      .filter(Boolean);
  }

  /** Get the chain of command for an agent (bottom → top) */
  getChainOfCommand(agentId: string): AgentNode[] {
    const chain: AgentNode[] = [];
    let current: AgentNode | undefined = this.hierarchy[agentId];
    while (current) {
      chain.push(current);
      if (!current.reportsTo) break;
      current = this.hierarchy[current.reportsTo];
    }
    return chain;
  }

  /** Find the best agent for a given domain/capability */
  findBestAgent(domain: string, capability?: string): AgentNode | undefined {
    const candidates = Object.values(this.hierarchy).filter(a => {
      if (a.domain !== domain && a.domain !== 'all') return false;
      if (capability && !a.capabilities.includes(capability)) return false;
      return true;
    });
    // Prefer executors first (specialists), then coordinators
    return candidates.sort((a, b) => {
      const levelOrder = { EXECUTOR: 0, COORDINATOR: 1, SUPERVISOR: 2 };
      return levelOrder[a.level] - levelOrder[b.level];
    })[0];
  }

  /** Determine if a decision should escalate */
  shouldEscalate(agentId: string, confidence: number, isCritical: boolean): boolean {
    const agent = this.hierarchy[agentId];
    if (!agent) return true;
    if (isCritical && agent.level === 'EXECUTOR') return true;
    return confidence < agent.maxConfidenceThreshold;
  }

  /** Route a decision through the hierarchy */
  routeDecision(
    startAgentId: string,
    confidence: number,
    isCritical: boolean
  ): { finalAgent: string; path: AgentDecisionPath[] } {
    const path: AgentDecisionPath[] = [];
    let currentId = startAgentId;
    let currentConfidence = confidence;

    while (currentId) {
      const agent = this.hierarchy[currentId];
      if (!agent) break;

      const needsEscalation = this.shouldEscalate(currentId, currentConfidence, isCritical);
      
      path.push({
        agent: currentId,
        level: agent.level,
        action: needsEscalation ? 'ESCALATE' : 'DECIDE',
        confidence: currentConfidence,
        escalated: needsEscalation,
        escalationReason: needsEscalation 
          ? `Confidence ${(currentConfidence * 100).toFixed(0)}% below threshold ${(agent.maxConfidenceThreshold * 100).toFixed(0)}%`
          : undefined,
        timestamp: new Date(),
      });

      if (!needsEscalation || !agent.reportsTo) break;
      currentId = agent.reportsTo;
    }

    this.decisionPath = path;
    return { finalAgent: currentId, path };
  }

  /** Get hierarchy stats */
  getStats() {
    const agents = Object.values(this.hierarchy);
    return {
      total: agents.length,
      supervisors: agents.filter(a => a.level === 'SUPERVISOR').length,
      coordinators: agents.filter(a => a.level === 'COORDINATOR').length,
      executors: agents.filter(a => a.level === 'EXECUTOR').length,
      domains: [...new Set(agents.map(a => a.domain))].length,
      totalCapabilities: agents.reduce((sum, a) => sum + a.capabilities.length, 0),
    };
  }

  /** Get the full hierarchy tree for visualization */
  getHierarchyTree() {
    const root = this.hierarchy['nauti-brain'];
    const subs = root.manages
      .map(coordId => this.hierarchy[coordId])
      .filter((a): a is AgentNode => !!a);
    return {
      ...root,
      children: subs.map(coord => ({
        ...coord,
        children: this.getSubordinates(coord.id),
      })),
    };
  }
}

export const agentHierarchy = new AgentHierarchyService();
