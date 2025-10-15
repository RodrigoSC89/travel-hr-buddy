/**
 * Vector Embedding Service for MMI Jobs
 * Provides text embedding functionality using OpenAI API
 */

import OpenAI from 'openai';

// Initialize OpenAI client
const getOpenAIClient = () => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    console.warn('OpenAI API key not configured. Using mock embeddings.');
    return null;
  }
  return new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
};

/**
 * Generate embedding for a given text using OpenAI
 * @param text The text to generate embedding for
 * @returns Vector embedding (1536 dimensions for text-embedding-ada-002)
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const client = getOpenAIClient();
  
  if (!client) {
    // Return mock embedding for development/testing
    console.warn('Generating mock embedding');
    return generateMockEmbedding();
  }

  try {
    const response = await client.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text,
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    // Fallback to mock embedding
    return generateMockEmbedding();
  }
}

/**
 * Generate a mock embedding for testing purposes
 * @returns A 1536-dimensional mock vector
 */
function generateMockEmbedding(): number[] {
  // Create a normalized random vector with 1536 dimensions
  const dimensions = 1536;
  const embedding = Array.from({ length: dimensions }, () => Math.random() - 0.5);
  
  // Normalize the vector
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  return embedding.map(val => val / magnitude);
}

/**
 * Generate embedding text from a job object
 * @param job Job object with details
 * @returns Formatted text for embedding
 */
export function formatJobForEmbedding(job: {
  title: string;
  description?: string;
  component_name: string;
  asset_name: string;
  vessel: string;
  priority: string;
}): string {
  return `${job.title}. ${job.description || ''}. Componente: ${job.component_name}. Equipamento: ${job.asset_name}. Embarcação: ${job.vessel}. Prioridade: ${job.priority}.`;
}

/**
 * Generate embedding for a job action/history entry
 * @param history History object
 * @returns Formatted text for embedding
 */
export function formatJobHistoryForEmbedding(history: {
  action: string;
  ai_recommendation?: string;
  outcome?: string;
}): string {
  return `Ação: ${history.action}. ${history.ai_recommendation ? `Recomendação IA: ${history.ai_recommendation}.` : ''} ${history.outcome ? `Resultado: ${history.outcome}.` : ''}`;
}
