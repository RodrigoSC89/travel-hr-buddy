/**
 * Document Center Module Types
 */

export interface WorkflowDocument {
  id: string;
  title: string;
  type: string;
  category: string;
  version: string;
  status: "draft" | "pending" | "in-review" | "approved" | "rejected" | "expired";
  priority: "low" | "normal" | "high" | "urgent";
  currentStep: number;
  totalSteps: number;
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: "review" | "approval" | "signature" | "verification";
  status: "pending" | "in-progress" | "completed" | "rejected" | "skipped";
}
