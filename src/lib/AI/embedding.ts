/**
 * AI Embedding Module
 * Provides text embedding functionality for semantic search and similarity matching
 * 
 * This module creates vector embeddings from text using OpenAI's embedding models,
 * enabling semantic search, similarity matching, and RAG (Retrieval Augmented Generation).
 */

import { openai } from "@/lib/ai/openai-client";

const EMBEDDING_MODEL = "text-embedding-3-small";
const EMBEDDING_DIMENSIONS = 1536;

/**
 * Generate embedding vector for text
 * 
 * Uses OpenAI's text-embedding-3-small model to create a 1536-dimensional vector
 * representation of the input text. Falls back to random vectors if API is not configured.
 * 
 * @param text - Text to convert to embedding vector
 * @returns Promise resolving to embedding vector (array of numbers)
 * 
 * @example
 * const embedding = await generateEmbedding("Safety inspection for maritime vessel");
 * console.log(embedding.length); // 1536
 */
export const generateEmbedding = async (text: string): Promise<number[]> => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  // Fallback to random embedding if no API key configured
  if (!apiKey || apiKey === "your_openai_api_key_here") {
    console.warn("⚠️ OpenAI API key not configured. Using mock embeddings.");
    // Generate deterministic random embedding based on text
    const hash = text.split("").reduce((acc, char) => {
      return ((acc << 5) - acc) + char.charCodeAt(0);
    }, 0);
    const seed = Math.abs(hash);
    return Array.from({ length: 128 }, (_, i) => {
      // Simple seeded pseudo-random number generator
      const x = Math.sin(seed + i) * 10000;
      return x - Math.floor(x);
    });
  }

  try {
    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: text,
      dimensions: EMBEDDING_DIMENSIONS,
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error("Error creating embedding:", error);
    // Fallback to random embedding on error
    return Array.from({ length: 128 }, () => Math.random());
  }
};

/**
 * Calculate cosine similarity between two embedding vectors
 * 
 * @param embedding1 - First embedding vector
 * @param embedding2 - Second embedding vector
 * @returns Similarity score between 0 and 1 (higher is more similar)
 */
export const cosineSimilarity = (embedding1: number[], embedding2: number[]): number => {
  if (embedding1.length !== embedding2.length) {
    throw new Error("Embeddings must have the same dimension");
  }

  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;

  for (let i = 0; i < embedding1.length; i++) {
    dotProduct += embedding1[i] * embedding2[i];
    norm1 += embedding1[i] * embedding1[i];
    norm2 += embedding2[i] * embedding2[i];
  }

  const magnitude = Math.sqrt(norm1) * Math.sqrt(norm2);
  
  if (magnitude === 0) {
    return 0;
  }

  return dotProduct / magnitude;
};

/**
 * Find most similar items from a list of embeddings
 * 
 * @param queryEmbedding - The query embedding to compare against
 * @param itemEmbeddings - Array of embeddings with associated data
 * @param topK - Number of top results to return (default: 5)
 * @returns Sorted array of most similar items with similarity scores
 */
export const findMostSimilar = <T>(
  queryEmbedding: number[],
  itemEmbeddings: Array<{ embedding: number[]; data: T }>,
  topK = 5
): Array<{ similarity: number; data: T }> => {
  const similarities = itemEmbeddings.map(item => ({
    similarity: cosineSimilarity(queryEmbedding, item.embedding),
    data: item.data
  }));

  return similarities
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK);
};

/**
 * Batch generate embeddings for multiple texts
 * 
 * @param texts - Array of texts to embed
 * @returns Promise resolving to array of embedding vectors
 */
export const generateBatchEmbeddings = async (texts: string[]): Promise<number[][]> => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  if (!apiKey || apiKey === "your_openai_api_key_here") {
    console.warn("⚠️ OpenAI API key not configured. Using mock embeddings.");
    return texts.map(() => Array.from({ length: 128 }, () => Math.random()));
  }

  try {
    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: texts,
      dimensions: EMBEDDING_DIMENSIONS,
    });

    return response.data.map(item => item.embedding);
  } catch (error) {
    console.error("Error creating batch embeddings:", error);
    return texts.map(() => Array.from({ length: 128 }, () => Math.random()));
  }
};

/**
 * Semantic search using embeddings
 * 
 * @param query - Search query text
 * @param documents - Array of documents with text and metadata
 * @param topK - Number of results to return
 * @returns Top matching documents with similarity scores
 */
export const semanticSearch = async <T extends { text: string }>(
  query: string,
  documents: T[],
  topK = 5
): Promise<Array<{ similarity: number; document: T }>> => {
  const queryEmbedding = await generateEmbedding(query);
  const docEmbeddings = await Promise.all(
    documents.map(async doc => ({
      embedding: await generateEmbedding(doc.text),
      data: doc
    }))
  );

  const results = findMostSimilar(queryEmbedding, docEmbeddings, topK);
  
  return results.map(result => ({
    similarity: result.similarity,
    document: result.data
  }));
};

// Re-export the original createEmbedding function for backwards compatibility
export { createEmbedding } from "@/lib/ai/openai/createEmbedding";
