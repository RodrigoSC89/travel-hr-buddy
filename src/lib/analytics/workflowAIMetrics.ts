import { supabase } from "@/integrations/supabase/client";

export interface WorkflowAISummary {
  total: number;
  aceitas: number;
  taxa: string;
}

export async function getWorkflowAISummary(): Promise<WorkflowAISummary> {
  try {
    // Fetch all workflow AI suggestions
    const { data: allSuggestions, error: allError } = await supabase
      .from("workflow_ai_suggestions")
      .select("id");

    if (allError) {
      console.error("Error fetching all suggestions:", allError);
      return { total: 0, aceitas: 0, taxa: "0.0" };
    }

    const total = allSuggestions?.length || 0;

    // Count accepted suggestions (those that were saved via the "Aceitar sugestão" button)
    // We consider a suggestion as "aceitas" if it exists in the table with origem='Copilot'
    const { data: acceptedSuggestions, error: acceptedError } = await supabase
      .from("workflow_ai_suggestions")
      .select("id")
      .eq("origem", "Copilot");

    if (acceptedError) {
      console.error("Error fetching accepted suggestions:", acceptedError);
      return { total, aceitas: 0, taxa: "0.0" };
    }

    const aceitas = acceptedSuggestions?.length || 0;

    // Calculate adoption percentage
    const taxa = total > 0 ? ((aceitas / total) * 100).toFixed(1) : "0.0";

    return {
      total,
      aceitas,
      taxa,
    };
  } catch (error) {
    console.error("Error in getWorkflowAISummary:", error);
    return { total: 0, aceitas: 0, taxa: "0.0" };
  }
}
