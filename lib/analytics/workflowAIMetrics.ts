import { supabase } from "@/integrations/supabase/client";

export interface WorkflowAISummary {
  total: number;
  aceitas: number;
  taxa: string | number;
}

/**
 * Get workflow AI suggestions summary metrics
 * 
 * This function queries the workflow_ai_suggestions table to calculate:
 * - Total number of AI suggestions generated
 * - Number of suggestions accepted by users (via Kanban with origem='Copilot')
 * - Adoption rate as a percentage
 * 
 * @returns {Promise<WorkflowAISummary>} Summary metrics for workflow AI suggestions
 * 
 * @example
 * const metrics = await getWorkflowAISummary();
 * // Returns: { total: 12, aceitas: 9, taxa: '75.0' }
 */
export async function getWorkflowAISummary(): Promise<WorkflowAISummary> {
  // Query all workflow AI suggestions
  const { data: all, error: allErr } = await supabase
    .from("workflow_ai_suggestions")
    .select("*");

  // Query accepted suggestions (those with origem='Copilot')
  const { data: accepted, error: accErr } = await supabase
    .from("workflow_ai_suggestions")
    .select("etapa")
    .eq("origem", "Copilot");

  // Return zeros if there's an error
  if (allErr || accErr) {
    console.error("Error fetching workflow AI suggestions:", allErr || accErr);
    return { total: 0, aceitas: 0, taxa: 0 };
  }

  // Calculate metrics
  const total = all?.length || 0;
  const aceitas = accepted?.length || 0;
  const taxa = total > 0 ? ((aceitas / total) * 100).toFixed(1) : 0;

  return { total, aceitas, taxa };
}
