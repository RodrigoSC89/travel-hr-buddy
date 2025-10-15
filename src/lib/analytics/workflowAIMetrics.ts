import { supabase } from "@/integrations/supabase/client";

export interface WorkflowAISummary {
  total: number;
  aceitas: number;
  taxa: string | number;
}

/**
 * Get workflow AI analytics summary
 * Returns metrics about AI suggestions for workflows including:
 * - Total suggestions generated
 * - Accepted suggestions (via Kanban with origem='Copilot')
 * - Adoption rate percentage
 */
export async function getWorkflowAISummary(): Promise<WorkflowAISummary> {
  try {
    // Get all workflow AI suggestions
    const { data: all, error: allErr } = await supabase
      .from("workflow_ai_suggestions")
      .select("*");

    // Get accepted suggestions (those with origem='Copilot')
    const { data: accepted, error: accErr } = await supabase
      .from("workflow_ai_suggestions")
      .select("etapa")
      .eq("origem", "Copilot");

    if (allErr || accErr) {
      console.error("Error fetching workflow AI metrics:", allErr || accErr);
      return { total: 0, aceitas: 0, taxa: 0 };
    }

    const total = all?.length || 0;
    const aceitas = accepted?.length || 0;
    const taxa = total > 0 ? ((aceitas / total) * 100).toFixed(1) : 0;

    return { total, aceitas, taxa };
  } catch (error) {
    console.error("Unexpected error in getWorkflowAISummary:", error);
    return { total: 0, aceitas: 0, taxa: 0 };
  }
}
