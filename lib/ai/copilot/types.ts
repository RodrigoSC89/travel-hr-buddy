/**
 * Type definitions for Copilot AI features
 */

export interface SimilarJobResult {
  id: string;
  similarity: number;
  metadata: {
    title: string;
    description: string;
    component_id: string;
    status?: string;
    created_at: string;
    ai_suggestion?: string;
  };
}

export interface JobEmbeddingMatch {
  id: string;
  job_id: string;
  similarity: number;
  embedding: number[];
  metadata: Record<string, unknown>;
}
