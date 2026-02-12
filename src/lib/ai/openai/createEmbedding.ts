/**
 * OpenAI Embedding Creation
 * Routes through secure edge function proxy - NO browser-side API keys
 */

import { logger } from "@/lib/logger";
import { supabase } from "@/integrations/supabase/client";

const EMBEDDING_DIMENSIONS = 1536;

/**
 * Create embedding vector for text via secure edge function
 */
export async function createEmbedding(text: string): Promise<number[]> {
  try {
    const { data, error } = await supabase.functions.invoke("ai-proxy", {
      body: { action: "embedding", text },
    });

    if (error) {
      throw new Error(`Edge function error: ${String(error)}`);
    }

    if (data?.fallback || !data?.embedding) {
      throw new Error("AI API key not configured on server");
    }

    return data.embedding;
  } catch (error) {
    logger.error("Error creating embedding", error as Error, {
      textLength: text.length,
    });
    throw error;
  }
}

/**
 * Generate deterministic fallback embedding
 */
export function createFallbackEmbedding(): number[] {
  return Array.from({ length: EMBEDDING_DIMENSIONS }, (_, i) => Math.sin(i * 0.1) * 0.5);
}
