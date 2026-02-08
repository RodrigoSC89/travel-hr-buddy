import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export interface WorkflowAISummary {
  total: number;
  aceitas: number;
  taxa: string;
}

export async function getWorkflowAISummary(): Promise<WorkflowAISummary> {
  try {
    const { data: allSuggestions, error: totalError } = await supabase
      .from("workflow_ai_suggestions")
      .select("id", { count: "exact" });

    if (totalError) {
      logger.error("Error fetching total AI suggestions", totalError);
      return { total: 0, aceitas: 0, taxa: "0.0" };
    }

    const total = allSuggestions?.length || 0;

    const { data: acceptedSuggestions, error: acceptedError } = await supabase
      .from("workflow_ai_suggestions")
      .select("id", { count: "exact" })
      .eq("origem", "Copilot");

    if (acceptedError) {
      logger.error("Error fetching accepted AI suggestions", acceptedError);
      return { total, aceitas: 0, taxa: "0.0" };
    }

    const aceitas = acceptedSuggestions?.length || 0;
    const taxa = total > 0 ? ((aceitas / total) * 100).toFixed(1) : "0.0";

    return { total, aceitas, taxa };
  } catch (error) {
    logger.error("Error in getWorkflowAISummary", error);
    return { total: 0, aceitas: 0, taxa: "0.0" };
  }
}
