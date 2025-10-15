/**
 * OpenAI Embedding Helper
 * Wraps the existing embedding service for use in lib modules
 */

import { generateEmbedding } from "@/services/mmi/embeddingService";

/**
 * Create an embedding vector for the given text content
 * @param content - The text content to create an embedding for
 * @returns A promise that resolves to the embedding vector (array of numbers)
 */
export async function createEmbedding(content: string): Promise<number[]> {
  return generateEmbedding(content);
}
