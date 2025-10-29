/**
 * PATCH 578 - Multilayer Reaction Mapper Types
 * Type definitions for reaction mapping visualization
 */

/**
 * Reaction layer types
 */
export type ReactionLayer = 'crew' | 'system' | 'ai';

/**
 * Decision node status
 */
export type NodeStatus = 'pending' | 'active' | 'completed' | 'failed' | 'bypassed';

/**
 * Decision path types
 */
export type PathType = 'sequential' | 'parallel' | 'conditional' | 'fallback';

/**
 * Decision node in the reaction tree
 */
export interface DecisionNode {
  id: string;
  layer: ReactionLayer;
  type: 'decision' | 'action' | 'condition' | 'outcome';
  title: string;
  description: string;
  status: NodeStatus;
  timestamp?: number;
  duration?: number;
  children: string[]; // IDs of child nodes
  parentId?: string;
  metadata: {
    priority?: number;
    confidence?: number;
    actor?: string; // crew member, system name, or AI model
    automated?: boolean;
  };
}

/**
 * Decision path connecting nodes
 */
export interface DecisionPath {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  type: PathType;
  condition?: string;
  probability?: number; // For predictive paths
  executed?: boolean;
  executionTime?: number;
}

/**
 * Scenario for simulation
 */
export interface ReactionScenario {
  id: string;
  name: string;
  description: string;
  triggerEvent: {
    type: string;
    severity: string;
    data: Record<string, any>;
  };
  expectedOutcome: string;
  nodes: DecisionNode[];
  paths: DecisionPath[];
  metadata: {
    createdAt: number;
    author?: string;
    tags?: string[];
  };
}

/**
 * Real-time reaction log entry
 */
export interface ReactionLogEntry {
  id: string;
  timestamp: number;
  layer: ReactionLayer;
  nodeId: string;
  event: string;
  actor: string;
  status: NodeStatus;
  details: Record<string, any>;
}

/**
 * Reaction mapper state
 */
export interface ReactionMapperState {
  currentScenario?: ReactionScenario;
  activeNodes: Set<string>;
  completedNodes: Set<string>;
  failedNodes: Set<string>;
  logs: ReactionLogEntry[];
  simulationMode: boolean;
  simulationSpeed: number; // 1x, 2x, 5x, etc.
}

/**
 * Layer statistics
 */
export interface LayerStatistics {
  layer: ReactionLayer;
  totalDecisions: number;
  successfulDecisions: number;
  failedDecisions: number;
  averageResponseTime: number;
  automationRate: number; // Percentage of automated decisions
}

/**
 * Reaction metrics
 */
export interface ReactionMetrics {
  totalReactions: number;
  averageReactionTime: number;
  layerStatistics: LayerStatistics[];
  pathExecutionRate: Record<string, number>; // path ID -> execution percentage
  criticalPathTime: number; // Time of the longest critical path
}
