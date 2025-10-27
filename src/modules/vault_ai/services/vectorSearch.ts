/**
 * Vector Search Service - Real implementation with pgvector
 * Uses Supabase vector similarity search with OpenAI embeddings
 */

import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export interface VectorSearchResult {
  id: string;
  title: string;
  content: string;
  document_type: string;
  category: string;
  tags: string[];
  similarity: number;
  file_url?: string;
  created_at: string;
}

export interface SearchOptions {
  matchThreshold?: number;
  matchCount?: number;
  documentType?: string;
  category?: string;
  tags?: string[];
}

export class VectorSearchService {
  /**
   * Generate OpenAI embedding for text
   */
  private async generateEmbedding(text: string): Promise<number[]> {
    try {
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error('OpenAI API key not configured');
      }

      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'text-embedding-ada-002',
          input: text,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data[0].embedding;
    } catch (error) {
      logger.error('Error generating embedding:', error);
      throw error;
    }
  }

  /**
   * Search documents using vector similarity
   */
  async searchDocuments(
    query: string,
    options: SearchOptions = {}
  ): Promise<VectorSearchResult[]> {
    const {
      matchThreshold = 0.7,
      matchCount = 10,
      documentType,
      category,
      tags,
    } = options;

    try {
      logger.info(`Vector search for query: "${query}"`);

      // Generate embedding for the search query
      const queryEmbedding = await this.generateEmbedding(query);

      // Call the Supabase RPC function for vector search
      const { data, error } = await supabase.rpc('search_vault_documents', {
        query_embedding: queryEmbedding,
        match_threshold: matchThreshold,
        match_count: matchCount,
      });

      if (error) throw error;

      let results = data || [];

      // Apply filters
      if (documentType) {
        results = results.filter((r: any) => r.document_type === documentType);
      }

      if (category) {
        results = results.filter((r: any) => r.category === category);
      }

      if (tags && tags.length > 0) {
        results = results.filter((r: any) =>
          tags.some((tag) => r.tags?.includes(tag))
        );
      }

      logger.info(`Found ${results.length} results`);

      return results;
    } catch (error) {
      logger.error('Error in vector search:', error);
      throw error;
    }
  }

  /**
   * Index a new document with embeddings
   */
  async indexDocument(
    title: string,
    content: string,
    metadata: {
      document_type?: string;
      category?: string;
      tags?: string[];
      file_url?: string;
      file_size?: number;
      file_type?: string;
    } = {}
  ): Promise<{ id: string; success: boolean }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Generate embedding for the document
      const embedding = await this.generateEmbedding(content);

      // Insert document into vault_documents
      const { data, error } = await supabase
        .from('vault_documents')
        .insert([
          {
            title,
            content,
            embedding,
            document_type: metadata.document_type,
            category: metadata.category,
            tags: metadata.tags || [],
            file_url: metadata.file_url,
            file_size: metadata.file_size,
            file_type: metadata.file_type,
            author_id: user.id,
            indexed_at: new Date().toISOString(),
          },
        ])
        .select('id')
        .single();

      if (error) throw error;

      logger.info(`Document indexed successfully: ${data.id}`);

      return { id: data.id, success: true };
    } catch (error) {
      logger.error('Error indexing document:', error);
      throw error;
    }
  }

  /**
   * Get all available categories
   */
  async getCategories(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('vault_documents')
        .select('category')
        .not('category', 'is', null)
        .order('category');

      if (error) throw error;

      const categories = [...new Set(data.map((d) => d.category))].filter(Boolean) as string[];
      return categories;
    } catch (error) {
      logger.error('Error fetching categories:', error);
      return [];
    }
  }

  /**
   * Get all available tags
   */
  async getTags(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('vault_documents')
        .select('tags')
        .not('tags', 'is', null);

      if (error) throw error;

      const allTags = data.flatMap((d) => d.tags || []);
      const uniqueTags = [...new Set(allTags)].filter(Boolean) as string[];
      return uniqueTags.sort();
    } catch (error) {
      logger.error('Error fetching tags:', error);
      return [];
    }
  }

  /**
   * Log search query for analytics
   */
  async logSearch(query: string, resultsCount: number): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase.from('vault_search_logs').insert([
        {
          user_id: user?.id,
          query,
          results_count: resultsCount,
          search_duration_ms: 0, // Can be calculated if needed
        },
      ]);
    } catch (error) {
      logger.error('Error logging search:', error);
      // Don't throw - logging should not break the search
    }
  }
}

export const vectorSearch = new VectorSearchService();
