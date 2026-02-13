/**
 * 🤖 AI Autonomous Agents - Type Definitions
 * Sistema de agentes autônomos para decisões inteligentes
 */

export type AgentType = 'risk' | 'esg' | 'audit' | 'operations' | 'compliance';

export type AgentStatus = 'idle' | 'analyzing' | 'deciding' | 'executing' | 'learning';

export type DecisionConfidence = 'low' | 'medium' | 'high' | 'critical';

export interface AgentContext {
  userId?: string;
  organizationId?: string;
  vesselId?: string;
  module?: string;
  timestamp: Date;
  source: string;
}

export interface AgentObservation {
  id: string;
  type: 'metric' | 'event' | 'alert' | 'pattern' | 'anomaly';
  data: Record<string, unknown>;
  source: string;
  timestamp: Date;
  priority: number;
}

export interface AgentDecision {
  id: string;
  agentType: AgentType;
  action: string;
  reasoning: string;
  confidence: DecisionConfidence;
  confidenceScore: number;
  impact: 'low' | 'medium' | 'high' | 'critical';
  requiresApproval: boolean;
  autoExecute: boolean;
  parameters?: Record<string, unknown>;
  deadline?: Date;
  createdAt: Date;
}

export interface AgentAction {
  id: string;
  decisionId: string;
  type: 'alert' | 'correction' | 'escalation' | 'report' | 'automation';
  status: 'pending' | 'executing' | 'completed' | 'failed' | 'cancelled';
  result?: Record<string, unknown>;
  error?: string;
  executedAt?: Date;
}

export interface AgentMemory {
  id: string;
  agentType: AgentType;
  context: string;
  outcome: 'success' | 'failure' | 'partial';
  learnings: string[];
  confidence: number;
  createdAt: Date;
}

export interface AgentConfig {
  type: AgentType;
  name: string;
  description: string;
  capabilities: string[];
  autoExecutionThreshold: number; // 0-1, above this confidence auto-executes
  maxConcurrentTasks: number;
  learningEnabled: boolean;
  escalationRules: EscalationRule[];
}

export interface EscalationRule {
  condition: string;
  action: 'notify' | 'escalate' | 'pause' | 'manual_review';
  targets: string[];
  priority: number;
}

export interface AgentMetrics {
  totalDecisions: number;
  successRate: number;
  avgConfidence: number;
  avgResponseTime: number;
  autoExecutionRate: number;
  learningImprovements: number;
}
