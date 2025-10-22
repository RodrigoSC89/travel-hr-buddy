// @ts-nocheck
/**
 * AI Embedding Generation
 * Provides vector embeddings for text data
 */

import { logger } from "@/lib/logger";

/**
 * Generate embedding vector for given text
 * @param text - The text to generate embedding for
 * @returns Promise<number[]> - Vector embedding of the text
 */
export const generateEmbedding = async (text: string): Promise<number[]> => {
  try {
    logger.info("Generating embedding for text:", text.substring(0, 50));
    
    // Stub implementation - returns a mock embedding vector
    // In production, this would call an actual embedding service (e.g., OpenAI embeddings)
    const embeddingDimension = 128; // Standard dimension for demo
    const embedding = Array.from({ length: embeddingDimension }, () => Math.random());
    
    return embedding;
  } catch (error) {
    logger.error("Error generating embedding:", error);
    throw new Error("Failed to generate embedding");
  }
};

/**
 * Generate embeddings for multiple texts in batch
 * @param texts - Array of texts to generate embeddings for
 * @returns Promise<number[][]> - Array of vector embeddings
 */
export const generateEmbeddingsBatch = async (texts: string[]): Promise<number[][]> => {
  try {
    logger.info(`Generating embeddings for ${texts.length} texts`);
    
    // Generate embeddings for each text
    const embeddings = await Promise.all(
      texts.map(text => generateEmbedding(text))
    );
    
    return embeddings;
  } catch (error) {
    logger.error("Error generating batch embeddings:", error);
    throw new Error("Failed to generate batch embeddings");
  }
};

/**
 * Calculate cosine similarity between two embedding vectors
 * @param embedding1 - First embedding vector
 * @param embedding2 - Second embedding vector
 * @returns number - Similarity score between -1 and 1
 */
export const cosineSimilarity = (embedding1: number[], embedding2: number[]): number => {
  try {
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
    
    norm1 = Math.sqrt(norm1);
    norm2 = Math.sqrt(norm2);
    
    if (norm1 === 0 || norm2 === 0) {
      return 0;
    }
    
    return dotProduct / (norm1 * norm2);
  } catch (error) {
    logger.error("Error calculating cosine similarity:", error);
    throw new Error("Failed to calculate cosine similarity");
  }
};

/**
 * Find most similar texts from a collection based on embedding similarity
 * @param queryText - The query text
 * @param candidateTexts - Array of candidate texts to compare against
 * @param topK - Number of top results to return
 * @returns Promise<Array<{text: string, score: number}>> - Top K most similar texts with scores
 */
export const findSimilarTexts = async (
  queryText: string,
  candidateTexts: string[],
  topK = 5
): Promise<Array<{ text: string; score: number }>> => {
  try {
    logger.info(`Finding ${topK} most similar texts for query`);
    
    // Generate embeddings
    const queryEmbedding = await generateEmbedding(queryText);
    const candidateEmbeddings = await generateEmbeddingsBatch(candidateTexts);
    
    // Calculate similarities
    const similarities = candidateEmbeddings.map((embedding, index) => ({
      text: candidateTexts[index],
      score: cosineSimilarity(queryEmbedding, embedding)
    }));
    
    // Sort by similarity score and return top K
    return similarities
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  } catch (error) {
    logger.error("Error finding similar texts:", error);
    throw new Error("Failed to find similar texts");
  }
};
