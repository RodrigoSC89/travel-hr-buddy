/**
 * M009 - Agent Swarm Formation
 * Dynamic agent grouping by mission type with auto-formation logic
 * Inspired by MIT Swarm Intelligence
 */

import { AGENT_HIERARCHY, type AgentNode } from './agent-hierarchy.service';

export type MissionType =
  | 'voyage_planning'
  | 'maintenance_critical'
  | 'compliance_audit'
  | 'crew_optimization'
  | 'emergency_response'
  | 'financial_review'
  | 'esg_reporting'
  | 'fleet_overview'
  | 'port_inspection'
  | 'custom';

export interface SwarmFormation {
  id: string;
  missionType: MissionType;
  name: string;
  description: string;
  leader: string;
  members: string[];
  supportAgents: string[];
  requiredCapabilities: string[];
  estimatedDurationMin: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'forming' | 'active' | 'executing' | 'completed' | 'disbanded';
  createdAt: Date;
}

export interface SwarmResult {
  formation: SwarmFormation;
  agentDetails: AgentNode[];
  coverageScore: number; // 0-100 how well agents cover the mission
  redundancy: number; // 0-100 overlap between agents
}

// Predefined mission templates
const MISSION_TEMPLATES: Record<MissionType, Omit<SwarmFormation, 'id' | 'createdAt' | 'status'>> = {
  voyage_planning: {
    missionType: 'voyage_planning',
    name: 'Voyage Planning Swarm',
    description: 'Planejamento completo de viagem: rota, bunker, P&L, weather, riscos',
    leader: 'captain-ai',
    members: ['navigator-ai', 'weather-ai', 'voyage-ai'],
    supportAgents: ['finance-ai', 'esg-ai'],
    requiredCapabilities: ['route-calculation', 'fuel-optimization', 'pnl-simulation', 'forecast-analysis'],
    estimatedDurationMin: 15,
    priority: 'high',
  },
  maintenance_critical: {
    missionType: 'maintenance_critical',
    name: 'Critical Maintenance Swarm',
    description: 'Análise de falha crítica: diagnóstico, peças, impacto operacional',
    leader: 'maintenance-ai',
    members: ['equipment-monitor', 'spare-parts-ai'],
    supportAgents: ['operations-chief', 'finance-ai'],
    requiredCapabilities: ['predictive-maintenance', 'failure-analysis', 'demand-forecasting'],
    estimatedDurationMin: 10,
    priority: 'critical',
  },
  compliance_audit: {
    missionType: 'compliance_audit',
    name: 'Compliance Audit Swarm',
    description: 'Auditoria completa: ISM, ISPS, MLC, MARPOL, SOLAS, STCW',
    leader: 'compliance-chief',
    members: ['ism-agent', 'isps-agent', 'mlc-agent', 'marpol-agent', 'solas-agent', 'stcw-agent', 'psc-agent'],
    supportAgents: ['nauti-brain'],
    requiredCapabilities: ['ism-audit', 'security-assessment', 'hours-validation', 'emissions-audit', 'safety-equipment', 'certification-tracking', 'psc-prediction'],
    estimatedDurationMin: 30,
    priority: 'high',
  },
  crew_optimization: {
    missionType: 'crew_optimization',
    name: 'Crew Optimization Swarm',
    description: 'Otimização de tripulação: fadiga, competências, escalas, custos',
    leader: 'crew-ai',
    members: ['wellness-ai', 'training-ai', 'mlc-agent'],
    supportAgents: ['finance-ai'],
    requiredCapabilities: ['crew-optimization', 'fatigue-prediction', 'competency-gap-analysis', 'hours-validation'],
    estimatedDurationMin: 20,
    priority: 'medium',
  },
  emergency_response: {
    missionType: 'emergency_response',
    name: 'Emergency Response Swarm',
    description: 'Resposta de emergência: todos os agentes mobilizados',
    leader: 'nauti-brain',
    members: ['captain-ai', 'compliance-chief', 'operations-chief', 'navigator-ai', 'weather-ai', 'maintenance-ai', 'crew-ai', 'wellness-ai'],
    supportAgents: ['solas-agent', 'isps-agent', 'ism-agent'],
    requiredCapabilities: ['crisis-management', 'emergency-response', 'safety-equipment', 'security-assessment'],
    estimatedDurationMin: 5,
    priority: 'critical',
  },
  financial_review: {
    missionType: 'financial_review',
    name: 'Financial Review Swarm',
    description: 'Revisão financeira: budget, anomalias, previsões, procurement',
    leader: 'finance-ai',
    members: ['voyage-ai', 'spare-parts-ai'],
    supportAgents: ['operations-chief', 'nauti-brain'],
    requiredCapabilities: ['budget-analysis', 'anomaly-detection', 'forecasting', 'pnl-simulation'],
    estimatedDurationMin: 15,
    priority: 'medium',
  },
  esg_reporting: {
    missionType: 'esg_reporting',
    name: 'ESG Reporting Swarm',
    description: 'Relatório ESG: emissões, CII, MARPOL Annex VI, sustentabilidade',
    leader: 'esg-ai',
    members: ['marpol-agent', 'navigator-ai'],
    supportAgents: ['compliance-chief', 'finance-ai'],
    requiredCapabilities: ['emissions-tracking', 'cii-calculation', 'emissions-audit', 'fuel-optimization'],
    estimatedDurationMin: 20,
    priority: 'medium',
  },
  fleet_overview: {
    missionType: 'fleet_overview',
    name: 'Fleet Overview Swarm',
    description: 'Visão 360° da frota: status, posição, saúde, compliance',
    leader: 'nauti-brain',
    members: ['captain-ai', 'operations-chief', 'compliance-chief', 'tracking-ai'],
    supportAgents: ['maintenance-ai', 'esg-ai', 'finance-ai'],
    requiredCapabilities: ['fleet-intelligence', 'fleet-coordination', 'position-tracking'],
    estimatedDurationMin: 10,
    priority: 'high',
  },
  port_inspection: {
    missionType: 'port_inspection',
    name: 'Port Inspection Prep Swarm',
    description: 'Preparação para inspeção PSC: briefing, checklist, documentos',
    leader: 'psc-agent',
    members: ['compliance-chief', 'ism-agent', 'solas-agent', 'marpol-agent', 'mlc-agent', 'isps-agent'],
    supportAgents: ['nauti-brain', 'maintenance-ai'],
    requiredCapabilities: ['psc-prediction', 'deficiency-analysis', 'pre-inspection-briefing'],
    estimatedDurationMin: 25,
    priority: 'critical',
  },
  custom: {
    missionType: 'custom',
    name: 'Custom Mission Swarm',
    description: 'Formação customizada por demanda',
    leader: 'nauti-brain',
    members: [],
    supportAgents: [],
    requiredCapabilities: [],
    estimatedDurationMin: 15,
    priority: 'medium',
  },
};

class SwarmFormationService {
  private activeFormations: Map<string, SwarmFormation> = new Map();

  /**
   * Create a swarm formation for a specific mission type
   */
  formSwarm(missionType: MissionType, customAgents?: string[]): SwarmResult {
    const template = MISSION_TEMPLATES[missionType];
    const id = `swarm-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

    const formation: SwarmFormation = {
      ...template,
      id,
      members: customAgents && customAgents.length > 0 ? customAgents : template.members,
      status: 'forming',
      createdAt: new Date(),
    };

    // Collect all agent details
    const allAgentIds = [formation.leader, ...formation.members, ...formation.supportAgents];
    const agentDetails = allAgentIds
      .map(id => AGENT_HIERARCHY[id])
      .filter((a): a is AgentNode => !!a);

    // Calculate coverage score
    const coverageScore = this.calculateCoverage(formation.requiredCapabilities, agentDetails);

    // Calculate redundancy
    const redundancy = this.calculateRedundancy(agentDetails);

    formation.status = 'active';
    this.activeFormations.set(id, formation);

    return { formation, agentDetails, coverageScore, redundancy };
  }

  /**
   * Auto-select the best mission type based on a natural language description
   */
  autoFormSwarm(description: string): SwarmResult {
    const descLower = description.toLowerCase();

    const keywords: Record<MissionType, string[]> = {
      voyage_planning: ['viagem', 'voyage', 'rota', 'route', 'bunker', 'combustível', 'fuel', 'eta', 'charter'],
      maintenance_critical: ['manutenção', 'maintenance', 'falha', 'failure', 'equipamento', 'equipment', 'reparo', 'repair'],
      compliance_audit: ['auditoria', 'audit', 'compliance', 'certificado', 'certificate', 'inspeção', 'ism', 'isps'],
      crew_optimization: ['tripulação', 'crew', 'escala', 'schedule', 'fadiga', 'fatigue', 'treinamento', 'training'],
      emergency_response: ['emergência', 'emergency', 'acidente', 'accident', 'incidente', 'incident', 'sos', 'mayday'],
      financial_review: ['financeiro', 'financial', 'budget', 'orçamento', 'custo', 'cost', 'p&l', 'invoice'],
      esg_reporting: ['emissão', 'emission', 'cii', 'carbono', 'carbon', 'esg', 'marpol', 'sustentabilidade'],
      fleet_overview: ['frota', 'fleet', 'visão geral', 'overview', 'status', 'posição', 'position'],
      port_inspection: ['psc', 'port state', 'inspeção portuária', 'detenção', 'detention', 'deficiência', 'deficiency'],
      custom: [],
    };

    let bestMatch: MissionType = 'custom';
    let bestScore = 0;

    for (const [mission, kws] of Object.entries(keywords)) {
      const score = kws.reduce((s, kw) => s + (descLower.includes(kw) ? 1 : 0), 0);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = mission as MissionType;
      }
    }

    return this.formSwarm(bestMatch);
  }

  /**
   * Disband a swarm formation
   */
  disbandSwarm(swarmId: string): boolean {
    const formation = this.activeFormations.get(swarmId);
    if (!formation) return false;
    formation.status = 'disbanded';
    this.activeFormations.delete(swarmId);
    return true;
  }

  /**
   * Get all active swarm formations
   */
  getActiveFormations(): SwarmFormation[] {
    return Array.from(this.activeFormations.values());
  }

  /**
   * Get available mission types with descriptions
   */
  getAvailableMissions(): { type: MissionType; name: string; description: string; agentCount: number }[] {
    return Object.entries(MISSION_TEMPLATES).map(([type, template]) => ({
      type: type as MissionType,
      name: template.name,
      description: template.description,
      agentCount: 1 + template.members.length + template.supportAgents.length,
    }));
  }

  // ----- Private helpers -----

  private calculateCoverage(required: string[], agents: AgentNode[]): number {
    if (required.length === 0) return 100;
    const allCapabilities = new Set(agents.flatMap(a => a.capabilities));
    const covered = required.filter(cap => allCapabilities.has(cap));
    return Math.round((covered.length / required.length) * 100);
  }

  private calculateRedundancy(agents: AgentNode[]): number {
    const capCount = new Map<string, number>();
    for (const agent of agents) {
      for (const cap of agent.capabilities) {
        capCount.set(cap, (capCount.get(cap) || 0) + 1);
      }
    }
    const duplicated = Array.from(capCount.values()).filter(c => c > 1).length;
    const total = capCount.size;
    return total > 0 ? Math.round((duplicated / total) * 100) : 0;
  }
}

export const swarmFormation = new SwarmFormationService();
