/**
 * MMI Copilot Service with Resolved Actions
 * AI-powered maintenance recommendations based on historical data
 * 
 * This service provides intelligent maintenance suggestions by:
 * - Querying historical resolved work orders (OS) for the same component
 * - Providing recommendations based on what has worked before
 * - Avoiding suggesting repetitive or ineffective approaches
 * - Continuously improving based on real-world experience
 */

import { supabase } from "@/integrations/supabase/client";

export interface CopilotRecommendationRequest {
  prompt: string;
  componente?: string;
}

export interface CopilotRecommendation {
  reply: string;
  historicalContext?: HistoricalAction[];
}

export interface HistoricalAction {
  job_id?: string | null;
  componente?: string | null;
  descricao_tecnica?: string | null;
  acao_realizada?: string | null;
  causa_confirmada?: string | null;
  efetiva?: boolean | null;
  resolvido_em?: string | null;
  duracao_execucao?: string | null;
}

export interface ResolvedActionInput {
  job_id?: string;
  os_id: string;
  componente?: string;
  descricao_tecnica?: string;
  acao_realizada?: string;
  resolvido_em?: string;
  duracao_execucao?: string;
  efetiva?: boolean;
  causa_confirmada?: string;
  evidencia_url?: string;
}

/**
 * Get AI-powered maintenance recommendation with historical context
 * Simple request/response pattern (non-streaming)
 * 
 * @param request - Contains prompt and optional component name
 * @returns Promise with the AI recommendation and historical context
 */
export const getCopilotRecommendation = async (
  request: CopilotRecommendationRequest
): Promise<CopilotRecommendation> => {
  try {
    const { data, error } = await supabase.functions.invoke("mmi-copilot-with-resolved", {
      body: request,
    });

    if (error) {
      throw error;
    }

    return {
      reply: data.reply || data.text || JSON.stringify(data),
      historicalContext: data.historicalContext || [],
    };
  } catch (error) {
    console.error("Error fetching copilot recommendation:", error);
    throw error;
  }
};

/**
 * Get AI-powered maintenance recommendation with streaming support
 * Real-time updates as AI generates response, enriched with historical context
 * 
 * @param request - Contains prompt and optional component name
 * @param onChunk - Callback to handle each chunk of the streaming response
 * @returns Promise that resolves when the stream is complete
 */
export const getCopilotRecommendationStreaming = async (
  request: CopilotRecommendationRequest,
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

    const functionUrl = `${supabaseUrl}/functions/v1/mmi-copilot-with-resolved`;
    
    const response = await fetch(functionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session?.access_token || supabaseAnonKey}`,
        "apikey": supabaseAnonKey || "",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: `HTTP error! status: ${response.status}` }));
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
    console.error("Error streaming copilot recommendation:", error);
    throw error;
  }
};

/**
 * Get historical actions for a specific component
 * Query past effective actions to understand what has worked before
 * 
 * @param componente - Component name to query
 * @param limit - Maximum number of results (default: 3)
 * @returns Promise with historical actions
 */
export const getHistoricalActions = async (
  componente: string,
  limit: number = 3
): Promise<HistoricalAction[]> => {
  try {
    let query = supabase
      .from('mmi_os_ia_feed')
      .select('*')
      .eq('componente', componente)
      .eq('efetiva', true)
      .order('resolvido_em', { ascending: false })
      .limit(limit);

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching historical actions:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching historical actions:", error);
    throw error;
  }
};

/**
 * Add a new resolved action for continuous learning
 * Record maintenance actions and their effectiveness for future recommendations
 * 
 * @param action - Resolved action data
 * @returns Promise with the created record
 */
export const addResolvedAction = async (
  action: ResolvedActionInput
): Promise<{ id: string; created_at: string }> => {
  try {
    const { data, error } = await supabase
      .from('mmi_os_resolvidas')
      .insert(action)
      .select('id, created_at')
      .single();

    if (error) {
      console.error('Error adding resolved action:', error);
      throw error;
    }

    if (!data) {
      throw new Error('No data returned from insert');
    }

    return data;
  } catch (error) {
    console.error("Error adding resolved action:", error);
    throw error;
  }
};

// Legacy functions for backward compatibility
/**
 * @deprecated Use getCopilotRecommendation instead
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
 * @deprecated Use getCopilotRecommendationStreaming instead
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
