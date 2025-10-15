/**
 * Workflow API Service Layer
 * 
 * Service layer for managing workflows through API calls
 */

import { supabase } from "@/integrations/supabase/client";
import { seedSuggestionsForWorkflow } from "@/lib/workflows/seedSuggestions";
import type {
  CreateWorkflowRequest,
  CreateWorkflowResponse,
  Workflow,
  WorkflowStep,
} from "@/types/workflow";

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

    // Create workflow
    const { data: workflow, error: workflowError } = await supabase
      .from("smart_workflows")
      .insert({
        title: request.title,
        description: request.description,
        category: request.category,
        tags: request.tags,
        config: request.config || {},
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
      console.warn("Failed to seed suggestions:", seedResult.error);
    }

    return {
      success: true,
      workflow: workflow as Workflow,
      suggestions: seedResult.suggestions as WorkflowStep[],
    };
  } catch (error) {
    console.error("Error creating workflow:", error);
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
      console.error("Error fetching workflow:", error);
      return null;
    }

    return data as Workflow;
  } catch (error) {
    console.error("Error in getWorkflow:", error);
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
      console.error("Error fetching workflows:", error);
      return [];
    }

    return (data as Workflow[]) || [];
  } catch (error) {
    console.error("Error in getWorkflows:", error);
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
    const { data, error } = await supabase
      .from("smart_workflows")
      .update(updates)
      .eq("id", workflowId)
      .select()
      .single();

    if (error) {
      console.error("Error updating workflow:", error);
      return null;
    }

    return data as Workflow;
  } catch (error) {
    console.error("Error in updateWorkflow:", error);
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
      console.error("Error deleting workflow:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in deleteWorkflow:", error);
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
      console.error("Error fetching workflow steps:", error);
      return [];
    }

    return (data as WorkflowStep[]) || [];
  } catch (error) {
    console.error("Error in getWorkflowSteps:", error);
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
        ...step,
        created_by: user.id,
        assigned_to: step.assigned_to || user.id,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating workflow step:", error);
      return null;
    }

    return data as WorkflowStep;
  } catch (error) {
    console.error("Error in createWorkflowStep:", error);
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
    const { data, error } = await supabase
      .from("smart_workflow_steps")
      .update(updates)
      .eq("id", stepId)
      .select()
      .single();

    if (error) {
      console.error("Error updating workflow step:", error);
      return null;
    }

    return data as WorkflowStep;
  } catch (error) {
    console.error("Error in updateWorkflowStep:", error);
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
      console.error("Error deleting workflow step:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in deleteWorkflowStep:", error);
    return false;
  }
}
