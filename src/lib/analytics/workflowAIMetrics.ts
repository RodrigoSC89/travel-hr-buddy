import { supabase } from "@/integrations/supabase/client";

export interface WorkflowAISummary {
  total: number;
  aceitas: number;
  taxa: string;
}

/**
 * Fetch workflow AI summary statistics
 * Returns total suggestions, accepted suggestions, and adoption rate
 */
export async function getWorkflowAISummary(): Promise<WorkflowAISummary> {
  try {
    // Query smart_workflows for AI-generated suggestions
    const { data: workflows, error } = await supabase
      .from("smart_workflows")
      .select("*");

    if (error) {
      console.error("Error fetching workflow AI metrics:", error);
      return { total: 0, aceitas: 0, taxa: "0" };
    }

    if (!workflows || workflows.length === 0) {
      return { total: 0, aceitas: 0, taxa: "0" };
    }

    // Calculate total AI suggestions
    const total = workflows.length;

    // Count accepted suggestions (workflows with status 'active' or 'completed')
    const aceitas = workflows.filter(
      (workflow: any) => 
        workflow.status === "active" || 
        workflow.status === "completed"
    ).length;

    // Calculate adoption rate
    const taxa = total > 0 
      ? ((aceitas / total) * 100).toFixed(1)
      : "0";

    return {
      total,
      aceitas,
      taxa
    };
  } catch (error) {
    console.error("Unexpected error in getWorkflowAISummary:", error);
    return { total: 0, aceitas: 0, taxa: "0" };
  }
}
