// @ts-nocheck
/**
 * Workflow API Service Layer
 * 
 * NOTE: @ts-nocheck required - smart_workflows schema field mismatches
 * between frontend types and database schema require type coercion
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import { seedSuggestionsForWorkflow } from "@/lib/workflows/seedSuggestions";
import type {
  CreateWorkflowRequest,
  CreateWorkflowResponse,
  Workflow,
  WorkflowStep,
} from "@/types/workflow";

/**
 * Maps database workflow to frontend Workflow type
 */
function mapDbToWorkflow(dbWorkflow: Record<string, unknown>): Workflow {
  return {
    id: String(dbWorkflow.id || ""),
    title: String(dbWorkflow.name || dbWorkflow.title || ""),
    description: dbWorkflow.description as string | undefined,
    status: (dbWorkflow.status as "draft" | "active" | "inactive") || "draft",
    created_at: String(dbWorkflow.created_at || ""),
    updated_at: String(dbWorkflow.updated_at || ""),
    created_by: dbWorkflow.created_by as string | undefined,
    category: dbWorkflow.workflow_type as string | undefined,
    config: dbWorkflow.metadata as Record<string, unknown> | undefined,
  };
}

/**
 * Maps database workflow step to frontend WorkflowStep type
 */
function mapDbToWorkflowStep(dbStep: Record<string, unknown>): WorkflowStep {
  return {
    id: String(dbStep.id || ""),
    workflow_id: String(dbStep.workflow_id || ""),
    title: String(dbStep.step_name || dbStep.title || ""),
    description: dbStep.description as string | undefined,
    status: (dbStep.status as "pendente" | "em_progresso" | "concluido") || "pendente",
    position: Number(dbStep.position || dbStep.step_order || 0),
    assigned_to: dbStep.assigned_to as string | undefined,
    due_date: dbStep.due_date as string | undefined,
    priority: (dbStep.priority as "low" | "medium" | "high" | "urgent") || "medium",
    created_at: String(dbStep.created_at || ""),
    updated_at: String(dbStep.updated_at || dbStep.created_at || ""),
    created_by: dbStep.created_by as string | undefined,
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

    // Create workflow using 'name' field (as per DB schema)
    const { data: workflow, error: workflowError } = await supabase
      .from("smart_workflows")
      .insert({
        name: request.title,
        description: request.description || null,
        workflow_type: request.category || "general",
        metadata: request.config || {},
        created_by: user.id,
        status: "draft",
      })
      .select()
      .single();

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
      workflow: mapDbToWorkflow(workflow as unknown as Record<string, unknown>),
      suggestions: seedResult.suggestions,
    };
  } catch (error) {
    logger.error("Error creating workflow", error);
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
    const { data, error } = await supabase
      .from("smart_workflows")
      .select("*")
      .eq("id", workflowId)
      .single();

    if (error) {
      logger.error("Error fetching workflow", error, { workflowId });
      return null;
    }

    return mapDbToWorkflow(data as unknown as Record<string, unknown>);
  } catch (error) {
    logger.error("Error in getWorkflow", error, { workflowId });
    return null;
  }
}

/**
 * Gets all workflows for the current user
 * @returns List of workflows
 */
export async function getWorkflows(): Promise<Workflow[]> {
  try {
    const { data, error } = await supabase
      .from("smart_workflows")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      logger.error("Error fetching workflows", error);
      return [];
    }

    return (data || []).map(w => mapDbToWorkflow(w as unknown as Record<string, unknown>));
  } catch (error) {
    logger.error("Error in getWorkflows", error);
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
    const dbUpdates: Record<string, unknown> = {};
    if (updates.title !== undefined) dbUpdates.name = updates.title;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.category !== undefined) dbUpdates.workflow_type = updates.category;
    if (updates.config !== undefined) dbUpdates.metadata = updates.config;

    const { data, error } = await supabase
      .from("smart_workflows")
      .update(dbUpdates)
      .eq("id", workflowId)
      .select()
      .single();

    if (error) {
      logger.error("Error updating workflow", error, { workflowId });
      return null;
    }

    return mapDbToWorkflow(data as unknown as Record<string, unknown>);
  } catch (error) {
    logger.error("Error in updateWorkflow", error, { workflowId });
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
    const { error } = await supabase
      .from("smart_workflows")
      .delete()
      .eq("id", workflowId);

    if (error) {
      logger.error("Error deleting workflow", error, { workflowId });
      return false;
    }

    return true;
  } catch (error) {
    logger.error("Error in deleteWorkflow", error, { workflowId });
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
    const { data, error } = await supabase
      .from("smart_workflow_steps")
      .select("*")
      .eq("workflow_id", workflowId)
      .order("position", { ascending: true });

    if (error) {
      logger.error("Error fetching workflow steps", error, { workflowId });
      return [];
    }

    return (data || []).map(s => mapDbToWorkflowStep(s as unknown as Record<string, unknown>));
  } catch (error) {
    logger.error("Error in getWorkflowSteps", error, { workflowId });
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

    const { data, error } = await supabase
      .from("smart_workflow_steps")
      .insert({
        workflow_id: step.workflow_id,
        step_name: step.title,
        description: step.description || null,
        position: step.position || 0,
        status: step.status || "pendente",
        priority: step.priority || "medium",
        assigned_to: step.assigned_to || user.id,
        created_by: user.id,
        metadata: step.metadata || {},
      })
      .select()
      .single();

    if (error) {
      logger.error("Error creating workflow step", error);
      return null;
    }

    return mapDbToWorkflowStep(data as unknown as Record<string, unknown>);
  } catch (error) {
    logger.error("Error in createWorkflowStep", error);
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
    const dbUpdates: Record<string, unknown> = {};
    if (updates.title !== undefined) dbUpdates.step_name = updates.title;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.position !== undefined) dbUpdates.position = updates.position;
    if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
    if (updates.assigned_to !== undefined) dbUpdates.assigned_to = updates.assigned_to;
    if (updates.metadata !== undefined) dbUpdates.metadata = updates.metadata;

    const { data, error } = await supabase
      .from("smart_workflow_steps")
      .update(dbUpdates)
      .eq("id", stepId)
      .select()
      .single();

    if (error) {
      logger.error("Error updating workflow step", error, { stepId });
      return null;
    }

    return mapDbToWorkflowStep(data as unknown as Record<string, unknown>);
  } catch (error) {
    logger.error("Error in updateWorkflowStep", error, { stepId });
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
    const { error } = await supabase
      .from("smart_workflow_steps")
      .delete()
      .eq("id", stepId);

    if (error) {
      logger.error("Error deleting workflow step", error, { stepId });
      return false;
    }

    return true;
  } catch (error) {
    logger.error("Error in deleteWorkflowStep", error, { stepId });
    return false;
  }
}
