/**
 * MMI Embedding Service
 * Routes through secure edge function proxy - NO browser-side API keys
 */

import { logger } from "@/lib/logger";
import { supabase } from "@/integrations/supabase/client";

const EMBEDDING_DIMENSIONS = 1536;

/**
 * Deterministic fallback embedding (no randomness)
 */
const generateFallbackEmbedding = (): number[] => {
  return Array.from({ length: EMBEDDING_DIMENSIONS }, (_, i) => Math.sin(i * 0.1) * 0.05);
};

/**
 * Generate embedding vector for text via secure edge function
 */
export const generateEmbedding = async (text: string): Promise<number[]> => {
  try {
    const { data, error } = await supabase.functions.invoke("ai-proxy", {
      body: { action: "embedding", text },
    });

    if (error || data?.fallback || !data?.embedding) {
      logger.warn("[EmbeddingService] AI not available, using deterministic fallback");
      return generateFallbackEmbedding();
    }

    return data.embedding;
  } catch (error) {
    logger.error("Error generating embedding", error as Error, { textLength: text.length });
    return generateFallbackEmbedding();
  }
};

/**
 * Generate embedding from job data
 */
export const generateJobEmbedding = async (jobData: {
  title: string;
  component_name: string;
  priority?: string;
  description?: string;
}): Promise<number[]> => {
  const text = `${jobData.title} ${jobData.component_name} ${jobData.priority || ""} ${jobData.description || ""}`;
  return generateEmbedding(text);
};

/**
 * Calculate cosine similarity between two vectors
 */
export const cosineSimilarity = (vecA: number[], vecB: number[]): number => {
  if (vecA.length !== vecB.length) {
    throw new Error("Vectors must have the same length");
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator === 0 ? 0 : dotProduct / denominator;
};
