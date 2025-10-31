/**
 * PATCH 548 - AI Agent Types
 * Type definitions for AI agents and autonomous systems
 */

export type AgentRole = 
  | 'coordinator'
  | 'analyzer'
  | 'executor'
  | 'monitor'
  | 'learner';

export type AgentStatus = 
  | 'idle'
  | 'active'
  | 'processing'
  | 'waiting'
  | 'error'
  | 'offline';

export interface AIAgent {
  id: string;
  name: string;
  role: AgentRole;
  status: AgentStatus;
  capabilities: string[];
  currentTask?: string;
  performance: AgentPerformance;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface AgentPerformance {
  tasksCompleted: number;
  successRate: number;
  averageResponseTime: number;
  lastActivity: string;
  errorCount: number;
}

export interface AgentMessage {
  from: string;
  to: string;
  type: 'request' | 'response' | 'notification' | 'error';
  payload: unknown;
  timestamp: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

export interface AgentTask {
  id: string;
  agentId: string;
  type: string;
  description: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  result?: unknown;
  error?: string;
  startedAt?: string;
  completedAt?: string;
}
