/**
 * Workflow API Service Layer
 * 
 * Service layer for managing workflows through API calls
 * Uses type-safe dynamic table accessors for workflow tables
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import { seedSuggestionsForWorkflow } from "@/lib/workflows/seedSuggestions";
import type { Json } from "@/integrations/supabase/types";
import {
  smartWorkflowsTable,
  smartWorkflowStepsTable,
  type SmartWorkflow,
  type SmartWorkflowStep,
  type SmartWorkflowInsert,
  type SmartWorkflowStepInsert,
} from "@/lib/supabase/dynamic-tables";
import type {
  CreateWorkflowRequest,
  CreateWorkflowResponse,
  Workflow,
  WorkflowStep,
  WorkflowSuggestion,
} from "@/types/workflow";

/**
 * Maps database workflow to frontend Workflow type
 */
function mapDbToWorkflow(dbWorkflow: SmartWorkflow): Workflow {
  return {
    id: dbWorkflow.id,
    title: dbWorkflow.name,
    description: dbWorkflow.description || undefined,
    status: dbWorkflow.status,
    created_at: dbWorkflow.created_at,
    updated_at: dbWorkflow.updated_at,
    created_by: dbWorkflow.created_by || undefined,
    category: dbWorkflow.workflow_type,
    config: dbWorkflow.metadata as Record<string, unknown> | undefined,
  };
}

/**
 * Maps database workflow step to frontend WorkflowStep type
 */
function mapDbToWorkflowStep(dbStep: SmartWorkflowStep): WorkflowStep {
  return {
    id: dbStep.id,
    workflow_id: dbStep.workflow_id,
    title: dbStep.step_name,
    description: dbStep.description || undefined,
    status: (dbStep.status as "pendente" | "em_progresso" | "concluido") || "pendente",
    position: dbStep.position,
    assigned_to: dbStep.assigned_to || undefined,
    due_date: dbStep.due_date || undefined,
    priority: (dbStep.priority as "low" | "medium" | "high" | "urgent") || "medium",
    created_at: dbStep.created_at,
    updated_at: dbStep.updated_at || dbStep.created_at,
    created_by: dbStep.created_by || undefined,
    metadata: dbStep.metadata as Record<string, unknown> | undefined,
  };
}

/**
 * Creates a new workflow and seeds initial suggestions
 * @param request - Workflow creation request
 * @returns Workflow creation response with suggestions
 */
export async function createWorkflow(
  request: CreateWorkflowRequest
): Promise<CreateWorkflowResponse> {
  try {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      throw new Error("User not authenticated");
    }

    // Create workflow using type-safe accessor
    const insertData: SmartWorkflowInsert = {
      name: request.title,
      description: request.description || null,
      workflow_type: request.category || "general",
      metadata: (request.config || {}) as Json,
      created_by: user.id,
      status: "draft",
    };

    const { data: workflow, error: workflowError } = await smartWorkflowsTable.insertSingle(insertData);

    if (workflowError || !workflow) {
      throw new Error(workflowError?.message || "Failed to create workflow");
    }

    // Seed suggestions for the workflow
    const seedResult = await seedSuggestionsForWorkflow({
      workflowId: workflow.id,
      workflowTitle: request.title,
      category: request.category,
      maxSuggestions: 5,
    });

    if (!seedResult.success) {
      logger.warn("Failed to seed suggestions", { error: seedResult.error });
    }

    return {
      success: true,
      workflow: mapDbToWorkflow(workflow),
      suggestions: (seedResult.suggestions || []) as WorkflowSuggestion[],
    };
  } catch (error) {
    logger.error("Error creating workflow", { error });
    throw error;
  }
}

/**
 * Gets a workflow by ID
 * @param workflowId - Workflow ID
 * @returns Workflow data
 */
export async function getWorkflow(workflowId: string): Promise<Workflow | null> {
  try {
    const { data, error } = await smartWorkflowsTable.selectOne(workflowId);

    if (error) {
      logger.error("Error fetching workflow", { error, workflowId });
      return null;
    }

    if (!data) return null;
    return mapDbToWorkflow(data);
  } catch (error) {
    logger.error("Error in getWorkflow", { error, workflowId });
    return null;
  }
}

/**
 * Gets all workflows for the current user
 * @returns List of workflows
 */
export async function getWorkflows(): Promise<Workflow[]> {
  try {
    const { data, error } = await smartWorkflowsTable.query()
      .select("*")
      .order("created_at", { ascending: false }) as { data: SmartWorkflow[] | null; error: Error | null };

    if (error) {
      logger.error("Error fetching workflows", { error });
      return [];
    }

    return (data || []).map(mapDbToWorkflow);
  } catch (error) {
    logger.error("Error in getWorkflows", { error });
    return [];
  }
}

/**
 * Updates a workflow
 * @param workflowId - Workflow ID
 * @param updates - Partial workflow updates
 * @returns Updated workflow
 */
export async function updateWorkflow(
  workflowId: string,
  updates: Partial<Workflow>
): Promise<Workflow | null> {
  try {
    // Map frontend updates to DB fields
    const dbUpdates: Partial<SmartWorkflowInsert> = {};
    if (updates.title !== undefined) dbUpdates.name = updates.title;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.category !== undefined) dbUpdates.workflow_type = updates.category;
    if (updates.config !== undefined) dbUpdates.metadata = updates.config as Json;

    const { data, error } = await smartWorkflowsTable.updateSingle(workflowId, dbUpdates);

    if (error) {
      logger.error("Error updating workflow", { error, workflowId });
      return null;
    }

    if (!data) return null;
    return mapDbToWorkflow(data);
  } catch (error) {
    logger.error("Error in updateWorkflow", { error, workflowId });
    return null;
  }
}

/**
 * Deletes a workflow
 * @param workflowId - Workflow ID
 * @returns Success status
 */
export async function deleteWorkflow(workflowId: string): Promise<boolean> {
  try {
    const { error } = await smartWorkflowsTable.delete(workflowId);

    if (error) {
      logger.error("Error deleting workflow", { error, workflowId });
      return false;
    }

    return true;
  } catch (error) {
    logger.error("Error in deleteWorkflow", { error, workflowId });
    return false;
  }
}

/**
 * Gets workflow steps for a workflow
 * @param workflowId - Workflow ID
 * @returns List of workflow steps
 */
export async function getWorkflowSteps(workflowId: string): Promise<WorkflowStep[]> {
  try {
    const { data, error } = await smartWorkflowStepsTable.query()
      .select("*")
      .eq("workflow_id", workflowId)
      .order("position", { ascending: true }) as { data: SmartWorkflowStep[] | null; error: Error | null };

    if (error) {
      logger.error("Error fetching workflow steps", { error, workflowId });
      return [];
    }

    return (data || []).map(mapDbToWorkflowStep);
  } catch (error) {
    logger.error("Error in getWorkflowSteps", { error, workflowId });
    return [];
  }
}

/**
 * Creates a workflow step
 * @param step - Workflow step data
 * @returns Created workflow step
 */
export async function createWorkflowStep(
  step: Partial<WorkflowStep>
): Promise<WorkflowStep | null> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      throw new Error("User not authenticated");
    }

    const insertData: SmartWorkflowStepInsert = {
      workflow_id: step.workflow_id!,
      step_name: step.title!,
      description: step.description || null,
      position: step.position || 0,
      status: step.status || "pendente",
      priority: step.priority || "medium",
      assigned_to: step.assigned_to || user.id,
      created_by: user.id,
      metadata: (step.metadata || {}) as Json,
    };

    const { data, error } = await smartWorkflowStepsTable.insertSingle(insertData);

    if (error) {
      logger.error("Error creating workflow step", { error });
      return null;
    }

    if (!data) return null;
    return mapDbToWorkflowStep(data);
  } catch (error) {
    logger.error("Error in createWorkflowStep", { error });
    return null;
  }
}

/**
 * Updates a workflow step
 * @param stepId - Step ID
 * @param updates - Partial step updates
 * @returns Updated workflow step
 */
export async function updateWorkflowStep(
  stepId: string,
  updates: Partial<WorkflowStep>
): Promise<WorkflowStep | null> {
  try {
    // Map frontend updates to DB fields
    const dbUpdates: Partial<SmartWorkflowStepInsert> = {};
    if (updates.title !== undefined) dbUpdates.step_name = updates.title;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.position !== undefined) dbUpdates.position = updates.position;
    if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
    if (updates.assigned_to !== undefined) dbUpdates.assigned_to = updates.assigned_to;
    if (updates.metadata !== undefined) dbUpdates.metadata = updates.metadata as Json;

    const { data, error } = await smartWorkflowStepsTable.updateSingle(stepId, dbUpdates);

    if (error) {
      logger.error("Error updating workflow step", { error, stepId });
      return null;
    }

    if (!data) return null;
    return mapDbToWorkflowStep(data);
  } catch (error) {
    logger.error("Error in updateWorkflowStep", { error, stepId });
    return null;
  }
}

/**
 * Deletes a workflow step
 * @param stepId - Step ID
 * @returns Success status
 */
export async function deleteWorkflowStep(stepId: string): Promise<boolean> {
  try {
    const { error } = await smartWorkflowStepsTable.delete(stepId);

    if (error) {
      logger.error("Error deleting workflow step", { error, stepId });
      return false;
    }

    return true;
  } catch (error) {
    logger.error("Error in deleteWorkflowStep", { error, stepId });
    return false;
  }
}
