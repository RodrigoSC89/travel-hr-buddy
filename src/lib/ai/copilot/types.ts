/**
 * Copilot RAG Query Types
 */

export interface SimilarJobMetadata {
  title: string;
  component_id: string;
  created_at: string;
  ai_suggestion?: string;
  description?: string;
  status?: string;
  priority?: string;
  similarity?: number;
}

export interface SimilarJobResult {
  id: string;
  metadata: SimilarJobMetadata;
  similarity: number;
}

export interface JobEmbeddingMatch {
  id: string;
  title: string;
  description: string;
  component_id: string;
  created_at: string;
  similarity: number;
}
