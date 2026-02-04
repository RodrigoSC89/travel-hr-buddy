/**
 * AI Control Tower Module Types
 */

export interface AIAgent {
  id: string;
  name: string;
  type: "autonomous" | "supervised" | "advisory";
  module: string;
  status: "active" | "idle" | "paused" | "error";
  healthScore: number;
  accuracy: number;
  tasksCompleted: number;
}

export interface AIDecision {
  id: string;
  agentId: string;
  agentName: string;
  type: string;
  description: string;
  confidence: number;
  status: "pending" | "approved" | "rejected" | "auto-executed";
  timestamp: string;
  impact: "low" | "medium" | "high" | "critical";
}
