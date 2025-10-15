/**
 * MMI Copilot Service
 * Provides AI-powered maintenance suggestions based on historical data
 */

import { supabase } from "@/integrations/supabase/client";

export interface CopilotSuggestion {
  text: string;
  timestamp: string;
}

/**
 * Get AI-powered maintenance suggestions using streaming response
 * @param prompt - Description of the maintenance issue
 * @param onChunk - Callback to handle each chunk of the streaming response
 * @returns Promise that resolves when the stream is complete
 */
export const getCopilotSuggestions = async (
  prompt: string,
  onChunk: (text: string) => void
): Promise<void> => {
  try {
    const { data, error } = await supabase.functions.invoke("mmi-copilot", {
      body: { prompt },
    });

    if (error) {
      throw error;
    }

    // Handle non-streaming response (fallback)
    if (data) {
      onChunk(data.reply || data.text || JSON.stringify(data));
    }
  } catch (error) {
    console.error("Error fetching copilot suggestions:", error);
    throw error;
  }
};

/**
 * Get AI-powered maintenance suggestions with streaming support
 * @param prompt - Description of the maintenance issue
 * @param onChunk - Callback to handle each chunk of the streaming response
 * @returns Promise that resolves when the stream is complete
 */
export const streamCopilotSuggestions = async (
  prompt: string,
  onChunk: (text: string) => void
): Promise<void> => {
  try {
    // Get the function URL from Supabase
    const { data: { session } } = await supabase.auth.getSession();
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl) {
      throw new Error("Supabase URL not configured");
    }

    const functionUrl = `${supabaseUrl}/functions/v1/mmi-copilot`;
    
    const response = await fetch(functionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session?.access_token || supabaseAnonKey}`,
        "apikey": supabaseAnonKey || "",
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    // Handle streaming response
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error("Response body is not readable");
    }

    let isDone = false;
    while (!isDone) {
      const { done, value } = await reader.read();
      
      if (done) {
        isDone = true;
        break;
      }

      const chunk = decoder.decode(value, { stream: true });
      onChunk(chunk);
    }
  } catch (error) {
    console.error("Error streaming copilot suggestions:", error);
    throw error;
  }
};
