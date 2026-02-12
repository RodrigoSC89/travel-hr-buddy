/**
 * OpenAI Service Integration
 * Routes through edge function proxy - NO API keys in frontend
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export interface OpenAITestResult {
  success: boolean;
  message: string;
  responseTime?: number;
  data?: Record<string, unknown>;
  error?: string;
}

/**
 * Generate embeddings via secure edge function proxy
 */
export async function generateEmbedding(text: string): Promise<number[] | null> {
  try {
    const { data, error } = await supabase.functions.invoke("ai-proxy", {
      body: { action: "embedding", text },
    });

    if (error || data?.fallback) {
      logger.warn("[OpenAI] Embedding API not available, using fallback");
      return null;
    }

    return data?.embedding ?? null;
  } catch (error) {
    logger.error("Exception generating embedding", error as Error, { textLength: text?.length });
    return null;
  }
}

/**
 * Test OpenAI API connectivity via edge function
 */
export async function testOpenAIConnection(): Promise<OpenAITestResult> {
  const startTime = Date.now();

  try {
    const { data, error } = await supabase.functions.invoke("ai-proxy", {
      body: { action: "test" },
    });

    if (error) {
      return {
        success: false,
        message: "Edge function error",
        responseTime: Date.now() - startTime,
        error: String(error),
      };
    }

    return {
      success: data?.success ?? false,
      message: data?.message ?? "Unknown",
      responseTime: data?.responseTime ?? Date.now() - startTime,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to connect to AI API",
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
