/**
 * Workflow API Types and Interfaces
 * 
 * This file contains TypeScript types and interfaces for the workflow creation API
 * and related functionality.
 */

/**
 * Workflow status types
 */
export type WorkflowStatus = "draft" | "active" | "inactive";

/**
 * Workflow suggestion status types
 */
export type SuggestionStatus = "pending" | "accepted" | "rejected";

/**
 * Workflow suggestion criticality levels
 */
export type SuggestionCriticality = "low" | "medium" | "high" | "urgent";

/**
 * Workflow step status types
 */
export type WorkflowStepStatus = "pendente" | "em_progresso" | "concluido";

/**
 * Workflow step priority levels
 */
export type WorkflowStepPriority = "low" | "medium" | "high" | "urgent";

/**
 * Request body for creating a workflow
 */
export interface CreateWorkflowRequest {
  title: string;
  created_by: string;
  description?: string;
  category?: string;
  tags?: string[];
}

/**
 * Response from creating a workflow
 */
export interface CreateWorkflowResponse {
  success: boolean;
  workflow: Workflow;
  message?: string;
  error?: string;
}

/**
 * Workflow entity
 */
export interface Workflow {
  id: string;
  title: string;
  description?: string;
  status: WorkflowStatus;
  created_at: string;
  updated_at: string;
  created_by: string;
  category?: string;
  tags?: string[];
  config?: Record<string, unknown>;
}

/**
 * Workflow step entity
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
 * Workflow AI suggestion entity
 */
export interface WorkflowAISuggestion {
  id: string;
  workflow_id?: string;
  etapa: string;
  tipo_sugestao: string;
  conteudo: string;
  criticidade: SuggestionCriticality;
  responsavel_sugerido: string;
  origem: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  status: SuggestionStatus;
  metadata?: Record<string, unknown>;
}

/**
 * Request body for creating a workflow step
 */
export interface CreateWorkflowStepRequest {
  workflow_id: string;
  title: string;
  description?: string;
  status?: WorkflowStepStatus;
  position?: number;
  assigned_to?: string;
  due_date?: string;
  priority?: WorkflowStepPriority;
  tags?: string[];
}

/**
 * Request body for updating a workflow
 */
export interface UpdateWorkflowRequest {
  title?: string;
  description?: string;
  status?: WorkflowStatus;
  category?: string;
  tags?: string[];
  config?: Record<string, unknown>;
}

/**
 * Request body for updating a workflow step
 */
export interface UpdateWorkflowStepRequest {
  title?: string;
  description?: string;
  status?: WorkflowStepStatus;
  position?: number;
  assigned_to?: string;
  due_date?: string;
  priority?: WorkflowStepPriority;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

/**
 * API error response
 */
export interface WorkflowAPIError {
  error: string;
  details?: string;
  timestamp?: string;
}

/**
 * Parameters for seeding workflow suggestions
 */
export interface SeedSuggestionsParams {
  workflowId: string;
  createdBy?: string;
}

/**
 * Response from seeding suggestions
 */
export interface SeedSuggestionsResponse {
  success: boolean;
  count: number;
  error?: string;
}
