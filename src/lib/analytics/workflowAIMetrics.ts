/**
 * Workflow AI Metrics - Placeholder
 * 
 * This is a placeholder implementation for workflow AI metrics.
 * The full implementation requires the workflow_ai_suggestions table in Supabase.
 * 
 * To enable this feature:
 * 1. Create the workflow_ai_suggestions table migration
 * 2. Run supabase gen types to update types
 * 3. Replace this file with src/_legacy/workflowAIMetrics.ts
 */

export interface WorkflowAISummary {
  total: number;
  aceitas: number;
  taxa: string;
}

/**
 * Get a summary of AI suggestions for workflows
 * @returns Summary with total suggestions generated, accepted by users, and adoption rate
 */
export async function getWorkflowAISummary(): Promise<WorkflowAISummary> {
  // Return placeholder data since the table doesn't exist yet
  console.warn("workflow_ai_suggestions table does not exist. Returning placeholder data.");
  
  return {
    total: 0,
    aceitas: 0,
    taxa: "0.0",
  };
}
