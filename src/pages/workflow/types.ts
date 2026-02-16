import React from "react";
import {
  Zap, Play, GitBranch, Clock, CheckCircle2, Workflow
} from "lucide-react";

export interface WorkflowNode {
  id: string;
  type: "trigger" | "action" | "condition" | "delay" | "end";
  label: string;
  status: "pending" | "running" | "completed" | "error";
  config?: Record<string, unknown>;
}

export interface VisualWorkflow {
  id: string;
  name: string;
  nodes: WorkflowNode[];
  status: string;
  executions: number;
  lastRun: string;
}

export const getVisualWorkflows = (workflows: { id: string; name: string; status: string; steps?: Record<string, unknown>[]; execution_count?: number; updated_at?: string }[]): VisualWorkflow[] => {
  if (workflows.length === 0) return [];
  return workflows.slice(0, 3).map((w, i) => ({
    id: `vw-${w.id || i}`,
    name: w.name || `Workflow ${i + 1}`,
    nodes: (w.steps || []).map((step, si: number) => ({
      id: `n${si + 1}`,
      type: si === 0 ? "trigger" as const : si === ((w.steps?.length || 1) - 1) ? "end" as const : "action" as const,
      label: (step.name as string) || (step.title as string) || `Etapa ${si + 1}`,
      status: w.status === "completed" ? "completed" as const : si === 0 ? "completed" as const : "pending" as const,
    })),
    status: w.status === "active" ? "running" : w.status || "draft",
    executions: w.execution_count || 0,
    lastRun: w.updated_at || new Date().toISOString(),
  }));
};

export const getNodeStatusColor = (status: string) => {
  switch (status) {
    case "completed": return "bg-success";
    case "running": return "bg-primary animate-pulse";
    case "error": return "bg-destructive";
    default: return "bg-muted";
  }
};

export const getNodeIcon = (type: string) => {
  switch (type) {
    case "trigger": return React.createElement(Zap, { className: "h-4 w-4" });
    case "action": return React.createElement(Play, { className: "h-4 w-4" });
    case "condition": return React.createElement(GitBranch, { className: "h-4 w-4" });
    case "delay": return React.createElement(Clock, { className: "h-4 w-4" });
    case "end": return React.createElement(CheckCircle2, { className: "h-4 w-4" });
    default: return React.createElement(Workflow, { className: "h-4 w-4" });
  }
};
