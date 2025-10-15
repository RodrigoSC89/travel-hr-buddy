/**
 * Workflow Creation API Service
 * 
 * This service provides functions to interact with the workflow creation API
 * and manage workflow-related operations.
 */

import { supabase } from '@/integrations/supabase/client';
import { seedSuggestionsForWorkflow } from '@/lib/workflows/seedSuggestions';
import type {
  CreateWorkflowRequest,
  CreateWorkflowResponse,
  Workflow,
  WorkflowAPIError,
} from '@/types/workflow';

/**
 * Creates a new workflow using the Supabase Edge Function
 * 
 * @param request - The workflow creation request
 * @returns Promise with the created workflow data
 */
export async function createWorkflow(
  request: CreateWorkflowRequest
): Promise<CreateWorkflowResponse> {
  try {
    // Get the current session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('User not authenticated');
    }

    // Get the Supabase URL from environment
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    
    if (!supabaseUrl) {
      throw new Error('VITE_SUPABASE_URL is not configured');
    }

    const functionUrl = `${supabaseUrl}/functions/v1/create-workflow`;

    // Make the request
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error: WorkflowAPIError = await response.json();
      throw new Error(error.error || 'Failed to create workflow');
    }

    const data: CreateWorkflowResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating workflow:', error);
    throw error;
  }
}

/**
 * Creates a workflow directly using Supabase client (alternative method)
 * This is useful for client-side creation without using Edge Functions
 * 
 * @param request - The workflow creation request
 * @returns Promise with the created workflow data
 */
export async function createWorkflowDirect(
  request: CreateWorkflowRequest
): Promise<CreateWorkflowResponse> {
  try {
    // Insert workflow
    const { data: workflow, error: workflowError } = await supabase
      .from('smart_workflows')
      .insert({
        title: request.title,
        created_by: request.created_by,
        description: request.description,
        category: request.category,
        tags: request.tags,
        status: 'draft',
      })
      .select()
      .single();

    if (workflowError || !workflow) {
      console.error('Error creating workflow:', workflowError);
      throw new Error(workflowError?.message || 'Failed to create workflow');
    }

    // Seed AI suggestions
    try {
      await seedSuggestionsForWorkflow(workflow.id, request.created_by);
    } catch (suggestionError) {
      console.error('Error seeding suggestions:', suggestionError);
      // Don't fail the whole operation if suggestions fail
    }

    return {
      success: true,
      workflow: workflow as Workflow,
      message: 'Workflow automático criado com sucesso!',
    };
  } catch (error) {
    console.error('Error in createWorkflowDirect:', error);
    throw error;
  }
}

/**
 * Fetches a workflow by ID
 * 
 * @param workflowId - The UUID of the workflow
 * @returns Promise with the workflow data
 */
export async function getWorkflow(workflowId: string): Promise<Workflow> {
  const { data, error } = await supabase
    .from('smart_workflows')
    .select('*')
    .eq('id', workflowId)
    .single();

  if (error) {
    console.error('Error fetching workflow:', error);
    throw error;
  }

  return data as Workflow;
}

/**
 * Lists all workflows for the current user
 * 
 * @returns Promise with array of workflows
 */
export async function listWorkflows(): Promise<Workflow[]> {
  const { data, error } = await supabase
    .from('smart_workflows')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error listing workflows:', error);
    throw error;
  }

  return data as Workflow[];
}

/**
 * Updates a workflow
 * 
 * @param workflowId - The UUID of the workflow to update
 * @param updates - The fields to update
 * @returns Promise with the updated workflow data
 */
export async function updateWorkflow(
  workflowId: string,
  updates: Partial<Omit<Workflow, 'id' | 'created_at' | 'updated_at'>>
): Promise<Workflow> {
  const { data, error } = await supabase
    .from('smart_workflows')
    .update(updates)
    .eq('id', workflowId)
    .select()
    .single();

  if (error) {
    console.error('Error updating workflow:', error);
    throw error;
  }

  return data as Workflow;
}

/**
 * Deletes a workflow
 * 
 * @param workflowId - The UUID of the workflow to delete
 * @returns Promise<void>
 */
export async function deleteWorkflow(workflowId: string): Promise<void> {
  const { error } = await supabase
    .from('smart_workflows')
    .delete()
    .eq('id', workflowId);

  if (error) {
    console.error('Error deleting workflow:', error);
    throw error;
  }
}

/**
 * Activates a workflow (changes status to 'active')
 * 
 * @param workflowId - The UUID of the workflow to activate
 * @returns Promise with the updated workflow
 */
export async function activateWorkflow(workflowId: string): Promise<Workflow> {
  return updateWorkflow(workflowId, { status: 'active' });
}

/**
 * Deactivates a workflow (changes status to 'inactive')
 * 
 * @param workflowId - The UUID of the workflow to deactivate
 * @returns Promise with the updated workflow
 */
export async function deactivateWorkflow(workflowId: string): Promise<Workflow> {
  return updateWorkflow(workflowId, { status: 'inactive' });
}
