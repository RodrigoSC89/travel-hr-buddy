/**
 * Workflows Copilot Suggest API - Uses named imports
 */

import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface WorkflowSuggestionRequest {
  workflow: string;
  logs?: string;
  falhas?: string;
  atrasos?: string;
}

/**
 * Calls the workflows-copilot-suggest function with streaming support
 */
export async function getWorkflowSuggestions(
  request: WorkflowSuggestionRequest,
  onChunk: (text: string) => void
): Promise<void> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error("User not authenticated");
    }

    const supabaseUrl = "https://vnbptmixvwropvanyhdb.supabase.co";
    const functionUrl = `${supabaseUrl}/functions/v1/workflows-copilot-suggest`;

    const response = await fetch(functionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to get suggestions");
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error("No response body");
    }

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        break;
      }

      const text = decoder.decode(value, { stream: true });
      onChunk(text);
    }
  } catch (error) {
    console.error("Error getting workflow suggestions:", error);
    throw error;
  }
}

/**
 * React Hook for using workflow suggestions
 */
export function useWorkflowSuggestions() {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState("");
  const [error, setError] = useState<string | null>(null);

  const getSuggestions = async (request: WorkflowSuggestionRequest) => {
    setIsLoading(true);
    setError(null);
    setSuggestion("");

    try {
      await getWorkflowSuggestions(request, (chunk) => {
        setSuggestion((prev) => prev + chunk);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    suggestion,
    isLoading,
    error,
    getSuggestions,
  };
}
