/**
 * PATCH 548 - Feedback Engine Types
 * Type definitions for AI learning and feedback systems
 */

export type FeedbackType = 
  | "positive"
  | "negative"
  | "neutral"
  | "correction"
  | "suggestion";

export type FeedbackSource = 
  | "user"
  | "system"
  | "agent"
  | "monitor"
  | "automatic";

export interface Feedback {
  id: string;
  type: FeedbackType;
  source: FeedbackSource;
  sourceId?: string;
  targetId: string;
  targetType: "agent" | "decision" | "action" | "prediction";
  rating?: number;
  comment?: string;
  context: FeedbackContext;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface FeedbackContext {
  sessionId?: string;
  taskId?: string;
  decisionId?: string;
  userId?: string;
  tenantId?: string;
  environment: "development" | "staging" | "production";
  variables: Record<string, unknown>;
}

export interface LearningRecord {
  id: string;
  agentId?: string;
  type: "reinforcement" | "supervised" | "unsupervised" | "transfer";
  input: unknown;
  output: unknown;
  expected?: unknown;
  feedback?: Feedback;
  accuracy?: number;
  confidence: number;
  applied: boolean;
  createdAt: string;
}

export interface AdaptationEvent {
  id: string;
  type: "parameter_update" | "model_retrain" | "strategy_change" | "threshold_adjust";
  target: string;
  before: unknown;
  after: unknown;
  reason: string;
  impact: AdaptationImpact;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface AdaptationImpact {
  performanceDelta: number;
  confidenceDelta: number;
  accuracyDelta: number;
  affectedAgents: string[];
  rollbackAvailable: boolean;
}

export interface FeedbackSummary {
  total: number;
  positive: number;
  negative: number;
  neutral: number;
  averageRating?: number;
  topIssues: string[];
  improvementSuggestions: string[];
  period: {
    start: string;
    end: string;
  };
}
