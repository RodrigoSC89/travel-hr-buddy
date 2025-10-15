/**
 * Workflow API Type Definitions
 * 
 * Types and interfaces for the automated workflow creation API
 */

/**
 * Workflow status types
 */
export type WorkflowStatus = "draft" | "active" | "inactive";

/**
 * Workflow step status types
 */
export type WorkflowStepStatus = "pendente" | "em_progresso" | "concluido";

/**
 * Workflow step priority levels
 */
export type WorkflowStepPriority = "low" | "medium" | "high" | "urgent";

/**
 * Workflow creation request
 */
export interface CreateWorkflowRequest {
  title: string;
  description?: string;
  category?: string;
  tags?: string[];
  config?: Record<string, unknown>;
}

/**
 * Workflow creation response
 */
export interface CreateWorkflowResponse {
  success: boolean;
  workflow: Workflow;
  suggestions?: WorkflowSuggestion[];
}

/**
 * Workflow entity from database
 */
export interface Workflow {
  id: string;
  title: string;
  description?: string;
  status: WorkflowStatus;
  created_at: string;
  updated_at: string;
  created_by?: string;
  category?: string;
  tags?: string[];
  config?: Record<string, unknown>;
}

/**
 * Workflow step entity from database
 */
export interface WorkflowStep {
  id: string;
  workflow_id: string;
  title: string;
  description?: string;
  status: WorkflowStepStatus;
  position: number;
  assigned_to?: string;
  due_date?: string;
  priority: WorkflowStepPriority;
  created_at: string;
  updated_at: string;
  created_by?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

/**
 * Workflow suggestion for seeding initial steps
 */
export interface WorkflowSuggestion {
  title: string;
  description?: string;
  priority: WorkflowStepPriority;
  position: number;
  tags?: string[];
}

/**
 * Options for seeding workflow suggestions
 */
export interface SeedSuggestionsOptions {
  workflowId: string;
  workflowTitle: string;
  category?: string;
  maxSuggestions?: number;
}

/**
 * Seed suggestions result
 */
export interface SeedSuggestionsResult {
  success: boolean;
  suggestions: WorkflowStep[];
  error?: string;
}
