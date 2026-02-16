/**
 * InteractiveAgentChat - Shared types
 */

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  actions?: AgentAction[];
  metadata?: {
    tokens?: number;
    latency_ms?: number;
    confidence?: number;
  };
}

export interface AgentAction {
  id: string;
  type: "suggestion" | "automation" | "alert" | "analysis";
  title: string;
  description: string;
  status: "pending" | "approved" | "rejected" | "executed";
  impact?: "low" | "medium" | "high";
  params?: Record<string, unknown>;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  type: "assistant" | "analyst" | "automator" | "guardian";
  status: "active" | "idle" | "busy" | "offline";
  capabilities: string[];
  stats: {
    tasks_completed: number;
    success_rate: number;
    avg_response_ms: number;
  };
}

export interface ExecutionLog {
  id: string;
  agent_id: string;
  action: string;
  status: "success" | "error" | "warning";
  message: string;
  timestamp: string;
  duration_ms?: number;
  details?: Record<string, unknown>;
}
