export interface WorkflowStepConfig {
  [key: string]: string | number | boolean | string[] | number[] | boolean[] | undefined;
}

export interface WorkflowStep {
  id: string;
  type: "trigger" | "condition" | "action" | "delay";
  title: string;
  description: string;
  config: WorkflowStepConfig;
  position: { x: number; y: number };
  connections: string[];
}

export interface WorkflowItem {
  id: string;
  name: string;
  description: string;
  status: "active" | "inactive" | "draft";
  trigger: string;
  steps: WorkflowStep[];
  executions: number;
  successRate: number;
  createdAt: Date;
  lastRun?: Date;
  category: string;
  tags: string[];
}

export interface WorkflowExecutionStep {
  stepId: string;
  status: "pending" | "running" | "completed" | "failed";
  result?: string | number | boolean | Record<string, unknown>;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: "running" | "completed" | "failed" | "cancelled";
  startedAt: Date;
  completedAt?: Date;
  duration?: number;
  steps: WorkflowExecutionStep[];
}

export interface WorkflowTemplate {
  name: string;
  description: string;
  category: string;
  trigger: string;
  steps: number;
}
