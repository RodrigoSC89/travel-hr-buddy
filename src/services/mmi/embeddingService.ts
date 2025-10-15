/**
 * MMI Embedding Service
 * Generates vector embeddings for similarity search using OpenAI
 */

import OpenAI from 'openai';

const EMBEDDING_MODEL = 'text-embedding-3-small';
const EMBEDDING_DIMENSIONS = 1536;

// Mock embedding for fallback when API is not available
const generateMockEmbedding = (): number[] => {
  return Array.from({ length: EMBEDDING_DIMENSIONS }, () => Math.random() * 0.1);
};

/**
 * Generate embedding vector for text using OpenAI
 * Falls back to mock data if API key is not configured
 */
export const generateEmbedding = async (text: string): Promise<number[]> => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  if (!apiKey || apiKey === 'your_openai_api_key_here') {
    console.warn('OpenAI API key not configured, using mock embedding');
    return generateMockEmbedding();
  }

  try {
    const openai = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true,
    });

    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: text,
      dimensions: EMBEDDING_DIMENSIONS,
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    console.warn('Falling back to mock embedding');
    return generateMockEmbedding();
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
  const text = `${jobData.title} ${jobData.component_name} ${jobData.priority || ''} ${jobData.description || ''}`;
  return generateEmbedding(text);
};

/**
 * Calculate cosine similarity between two vectors
 */
export const cosineSimilarity = (vecA: number[], vecB: number[]): number => {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have the same length');
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
