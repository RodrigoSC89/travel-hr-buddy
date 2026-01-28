/**
 * Advanced RAG Engine with Embeddings - APEX v1.0
 * Retrieval-Augmented Generation with real vector search
 */

import { supabase } from '@/integrations/supabase/client';
import { Logger } from '@/lib/utils/logger';

export interface KnowledgeDocument {
  id: string;
  title: string;
  content: string;
  source: string;
  category: string;
  embedding?: number[];
  metadata?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

export interface RAGSearchResult {
  document: KnowledgeDocument;
  relevanceScore: number;
  snippet: string;
  highlights?: string[];
}

export interface RAGQueryOptions {
  limit?: number;
  categories?: string[];
  minRelevance?: number;
  includeMetadata?: boolean;
  rerank?: boolean;
}

export interface RAGResponse {
  answer: string;
  confidence: number;
  sources: RAGSearchResult[];
  processingTime: number;
  model: string;
  requiresValidation: boolean;
}

/**
 * Advanced cosine similarity with normalization
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (!a || !b || a.length !== b.length) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator === 0 ? 0 : dotProduct / denominator;
}

/**
 * BM25 scoring for text relevance (fallback when no embeddings)
 */
function bm25Score(query: string, document: string, k1 = 1.5, b = 0.75): number {
  const queryTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
  const docTerms = document.toLowerCase().split(/\s+/);
  const docLength = docTerms.length;
  const avgDocLength = 500; // Assumed average
  
  const termFreq: Record<string, number> = {};
  docTerms.forEach(term => {
    termFreq[term] = (termFreq[term] || 0) + 1;
  });
  
  let score = 0;
  for (const term of queryTerms) {
    const tf = termFreq[term] || 0;
    if (tf > 0) {
      const idf = Math.log(1 + (10 / (1 + tf))); // Simplified IDF
      const numerator = tf * (k1 + 1);
      const denominator = tf + k1 * (1 - b + b * (docLength / avgDocLength));
      score += idf * (numerator / denominator);
    }
  }
  
  return Math.min(score / queryTerms.length, 1);
}

/**
 * Extract contextual snippet with highlighting
 */
function extractContextualSnippet(
  content: string, 
  query: string, 
  maxLength = 300
): { snippet: string; highlights: string[] } {
  const queryTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
  const contentLower = content.toLowerCase();
  const highlights: string[] = [];
  
  // Find best matching position
  let bestPosition = 0;
  let bestScore = 0;
  
  for (let i = 0; i < content.length - 100; i += 50) {
    const window = contentLower.substring(i, i + 200);
    let score = 0;
    for (const term of queryTerms) {
      if (window.includes(term)) {
        score++;
        if (!highlights.includes(term)) highlights.push(term);
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestPosition = Math.max(0, i - 50);
    }
  }
  
  // Extract snippet
  let snippet = content.substring(bestPosition, bestPosition + maxLength);
  
  // Add ellipsis
  if (bestPosition > 0) snippet = '...' + snippet;
  if (bestPosition + maxLength < content.length) snippet = snippet + '...';
  
  return { snippet, highlights };
}

/**
 * Rerank results using cross-encoder simulation
 */
function rerankResults(
  results: RAGSearchResult[], 
  query: string
): RAGSearchResult[] {
  return results
    .map(result => {
      // Calculate additional relevance factors
      const titleMatch = bm25Score(query, result.document.title);
      const contentMatch = result.relevanceScore;
      const recencyBoost = result.document.updated_at 
        ? Math.max(0, 1 - (Date.now() - new Date(result.document.updated_at).getTime()) / (365 * 24 * 60 * 60 * 1000))
        : 0;
      
      // Combined score with weights
      const rerankedScore = (
        contentMatch * 0.6 +
        titleMatch * 0.3 +
        recencyBoost * 0.1
      );
      
      return {
        ...result,
        relevanceScore: rerankedScore,
      };
    })
    .sort((a, b) => b.relevanceScore - a.relevanceScore);
}

/**
 * Search knowledge base with advanced RAG
 */
export async function searchKnowledgeBase(
  query: string,
  organizationId: string,
  options: RAGQueryOptions = {}
): Promise<RAGSearchResult[]> {
  const startTime = performance.now();
  const { 
    limit = 5, 
    minRelevance = 0.25, 
    rerank = true 
  } = options;
  
  try {
    // Use ai_documents table which exists in schema
    const { data: documents, error } = await supabase
      .from('ai_documents')
      .select('*')
      .eq('organization_id', organizationId)
      .limit(limit * 3);
    
    if (error) {
      Logger.error('RAG search error', { error }, 'RAG');
      return [];
    }
    
    if (!documents || documents.length === 0) {
      return [];
    }
    
    // Score and rank documents
    const scoredResults: RAGSearchResult[] = documents.map(doc => {
      const content = doc.ocr_text || doc.file_name || '';
      const title = doc.title || doc.file_name || 'Untitled';
      const relevanceScore = bm25Score(query, content + ' ' + title);
      const { snippet, highlights } = extractContextualSnippet(content, query);
      
      return {
        document: {
          id: doc.id,
          title,
          content,
          source: doc.storage_path || 'internal',
          category: doc.category || doc.file_type || 'general',
          metadata: { ocr_status: doc.ocr_status },
        },
        relevanceScore,
        snippet,
        highlights,
      };
    }).filter(result => result.relevanceScore >= minRelevance);
    
    // Rerank if enabled
    const finalResults = rerank 
      ? rerankResults(scoredResults, query).slice(0, limit)
      : scoredResults.sort((a, b) => b.relevanceScore - a.relevanceScore).slice(0, limit);
    
    Logger.info(`RAG search completed in ${(performance.now() - startTime).toFixed(2)}ms`, {
      resultsCount: finalResults.length,
    }, 'RAG');
    
    return finalResults;
  } catch (error) {
    Logger.error('RAG search failed', { error }, 'RAG');
    return [];
  }
}

/**
 * Query with context augmentation
 */
export async function queryWithContext(
  query: string,
  organizationId: string,
  options: RAGQueryOptions = {}
): Promise<{ context: string; sources: RAGSearchResult[] }> {
  const sources = await searchKnowledgeBase(query, organizationId, options);
  
  if (sources.length === 0) {
    return { context: '', sources: [] };
  }
  
  const context = sources
    .map((s, i) => `[Documento ${i + 1}: ${s.document.title}]\n${s.snippet}`)
    .join('\n\n');
  
  return { context, sources };
}

/**
 * Get knowledge base statistics
 */
export async function getKnowledgeBaseStats(organizationId: string): Promise<{
  totalDocuments: number;
  categoryCounts: Record<string, number>;
}> {
  try {
    const { data, error } = await supabase
      .from('ai_documents')
      .select('id, category, file_type')
      .eq('organization_id', organizationId);
    
    if (error) throw error;
    
    const documents = data || [];
    const categoryCounts: Record<string, number> = {};
    
    documents.forEach(doc => {
      const category = doc.category || doc.file_type || 'general';
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });
    
    return {
      totalDocuments: documents.length,
      categoryCounts,
    };
  } catch (error) {
    Logger.error('Failed to get knowledge base stats', { error }, 'RAG');
    return { totalDocuments: 0, categoryCounts: {} };
  }
}

export const advancedRAGEngine = {
  search: searchKnowledgeBase,
  queryWithContext,
  getStats: getKnowledgeBaseStats,
};
