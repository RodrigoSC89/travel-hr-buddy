/**
 * MMI Copilot with Resolved Actions API Service
 * 
 * This service provides AI-powered recommendations based on historical
 * resolved maintenance actions. It queries the mmi_os_ia_feed table
 * to learn from past experiences and provide better suggestions.
 */

import { supabase } from "@/integrations/supabase/client";

export interface CopilotRequest {
  prompt: string;
  componente: string;
}

export interface CopilotResponse {
  recommendation: string;
  historicalActionsCount: number;
}

/**
 * Get AI recommendation based on historical resolved actions
 * 
 * This function calls the mmi-copilot-with-resolved edge function
 * which enriches the prompt with historical data from resolved work orders.
 * 
 * @param request - Contains the job prompt and component name
 * @returns AI recommendation with historical context
 */
export const getCopilotRecommendation = async (
  request: CopilotRequest
): Promise<string> => {
  const { data, error } = await supabase.functions.invoke(
    "mmi-copilot-with-resolved",
    {
      body: request,
    }
  );

  if (error) {
    console.error("Error calling copilot function:", error);
    throw new Error(error.message || "Failed to get copilot recommendation");
  }

  return data;
};

/**
 * Get AI recommendation with streaming support
 * 
 * This function enables real-time streaming of AI responses,
 * providing a better user experience for longer responses.
 * 
 * @param request - Contains the job prompt and component name
 * @param onChunk - Callback function called for each chunk of data
 */
export const getCopilotRecommendationStreaming = async (
  request: CopilotRequest,
  onChunk: (chunk: string) => void
): Promise<void> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error("User not authenticated");
    }

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mmi-copilot-with-resolved`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(request),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to get copilot recommendation");
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error("No response stream available");
    }

    let streamComplete = false;
    while (!streamComplete) {
      const { done, value } = await reader.read();
      
      if (done) {
        streamComplete = true;
        break;
      }

      const chunk = decoder.decode(value);
      
      // Parse SSE format (data: {...}\n\n)
      const lines = chunk.split("\n");
      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.choices?.[0]?.delta?.content) {
              onChunk(data.choices[0].delta.content);
            }
          } catch (e) {
            // Skip invalid JSON
            console.warn("Failed to parse chunk:", e);
          }
        }
      }
    }
  } catch (error) {
    console.error("Error in streaming:", error);
    throw error;
  }
};

/**
 * Get historical resolved actions for a component
 * 
 * This function queries the mmi_os_ia_feed table directly
 * to show users what historical data exists for a component.
 * 
 * @param componente - Component name to query
 * @param limit - Maximum number of records to return (default: 5)
 * @returns Array of historical actions
 */
export const getHistoricalActions = async (
  componente: string,
  limit: number = 5
) => {
  const { data, error } = await supabase
    .from("mmi_os_ia_feed")
    .select("*")
    .eq("componente", componente)
    .eq("efetiva", true)
    .order("data_execucao", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching historical actions:", error);
    throw new Error("Failed to fetch historical actions");
  }

  return data;
};

/**
 * Add a new resolved action to the historical database
 * 
 * After completing a maintenance action, this function can be used
 * to record it for future AI learning.
 * 
 * @param action - Action details to record
 */
export const addResolvedAction = async (action: {
  componente: string;
  acao_realizada: string;
  duracao_execucao: string;
  efetiva: boolean;
  observacoes?: string;
}) => {
  const { data, error } = await supabase
    .from("mmi_os_ia_feed")
    .insert(action)
    .select()
    .single();

  if (error) {
    console.error("Error adding resolved action:", error);
    throw new Error("Failed to add resolved action");
  }

  return data;
};
