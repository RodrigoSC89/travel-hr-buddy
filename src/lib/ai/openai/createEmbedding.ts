/**
 * OpenAI Embedding Creation
 * NOTE: OpenAI API key must be used via edge functions, not frontend
 * This module provides a stub that throws an error directing to edge functions
 */

import { logger } from "@/lib/logger";

const EMBEDDING_MODEL = "text-embedding-3-small";

/**
 * Create embedding vector for text using OpenAI
 * @param text - Text to convert to embedding
 * @returns Vector embedding as number array
 * @throws Always throws - use edge function instead
 */
export async function createEmbedding(text: string): Promise<number[]> {
  logger.warn("createEmbedding called from frontend - should use edge function", {
    textLength: text.length,
    model: EMBEDDING_MODEL
  });
  
  // OpenAI API key must be used via edge functions for security
  throw new Error(
    "OpenAI API key not available in frontend. Use the 'create-embedding' edge function instead."
  );
}
