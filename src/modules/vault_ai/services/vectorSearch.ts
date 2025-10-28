// @ts-nocheck
/**
 * Vector Search Service using pgvector
 * Provides semantic search capabilities using OpenAI embeddings
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

interface SearchOptions {
  matchThreshold?: number;
  documentType?: string;
  category?: string;
  tags?: string[];
  limit?: number;
}

interface SearchResult {
  id: string;
  title: string;
  content: string;
  document_type?: string;
  category?: string;
  tags?: string[];
  similarity: number;
  created_at: string;
  updated_at: string;
}

/**
 * Generate embeddings using OpenAI API
 */
async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  if (!apiKey) {
    logger.error("OpenAI API key not configured");
    throw new Error("OpenAI API key not configured");
  }

  try {
    const response = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "text-embedding-ada-002",
        input: text,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data[0].embedding;
  } catch (error) {
    logger.error("Failed to generate embedding", error);
    throw error;
  }
}

/**
 * Search documents using vector similarity
 */
export async function searchDocuments(
  query: string,
  options: SearchOptions = {}
): Promise<SearchResult[]> {
  const {
    matchThreshold = 0.7,
    documentType,
    category,
    tags,
    limit = 10,
  } = options;

  try {
    logger.info("Starting vector search", { query, options });

    // Generate embedding for search query
    const queryEmbedding = await generateEmbedding(query);

    // Build the RPC call with filters
    let rpcQuery = supabase.rpc("match_vault_documents", {
      query_embedding: queryEmbedding,
      match_threshold: matchThreshold,
      match_count: limit,
    });

    // Apply filters if provided
    if (documentType) {
      rpcQuery = rpcQuery.eq("document_type", documentType);
    }

    if (category) {
      rpcQuery = rpcQuery.eq("category", category);
    }

    if (tags && tags.length > 0) {
      rpcQuery = rpcQuery.contains("tags", tags);
    }

    const { data, error } = await rpcQuery;

    if (error) {
      logger.error("Vector search failed", error);
      throw error;
    }

    logger.info("Vector search completed", { resultCount: data?.length || 0 });

    return (data || []) as SearchResult[];
  } catch (error) {
    logger.error("Search documents failed", error);
    throw error;
  }
}

/**
 * Index a document with automatic embedding generation
 */
export async function indexDocument(
  title: string,
  content: string,
  metadata: {
    documentType?: string;
    category?: string;
    tags?: string[];
  } = {}
): Promise<string> {
  try {
    logger.info("Indexing document", { title, metadata });

    // Generate embedding for the document
    const embedding = await generateEmbedding(`${title} ${content}`);

    // Insert document with embedding
    const { data, error } = await supabase
      .from("vault_documents")
      .insert({
        title,
        content,
        document_type: metadata.documentType,
        category: metadata.category,
        tags: metadata.tags,
        embedding,
      })
      .select("id")
      .single();

    if (error) {
      logger.error("Failed to index document", error);
      throw error;
    }

    logger.info("Document indexed successfully", { documentId: data.id });
    return data.id;
  } catch (error) {
    logger.error("Index document failed", error);
    throw error;
  }
}

/**
 * Update document embeddings
 */
export async function updateDocumentEmbedding(
  documentId: string,
  title: string,
  content: string
): Promise<void> {
  try {
    logger.info("Updating document embedding", { documentId });

    // Generate new embedding
    const embedding = await generateEmbedding(`${title} ${content}`);

    // Update document
    const { error } = await supabase
      .from("vault_documents")
      .update({ embedding, updated_at: new Date().toISOString() })
      .eq("id", documentId);

    if (error) {
      logger.error("Failed to update document embedding", error);
      throw error;
    }

    logger.info("Document embedding updated successfully");
  } catch (error) {
    logger.error("Update document embedding failed", error);
    throw error;
  }
}

/**
 * Batch index documents
 */
export async function batchIndexDocuments(
  documents: Array<{
    title: string;
    content: string;
    metadata?: {
      documentType?: string;
      category?: string;
      tags?: string[];
    };
  }>
): Promise<string[]> {
  const documentIds: string[] = [];

  for (const doc of documents) {
    try {
      const id = await indexDocument(doc.title, doc.content, doc.metadata);
      documentIds.push(id);
    } catch (error) {
      logger.error("Failed to index document in batch", error, { title: doc.title });
      // Continue with other documents
    }
  }

  logger.info("Batch indexing completed", {
    total: documents.length,
    indexed: documentIds.length,
  });

  return documentIds;
}

export const vectorSearch = {
  searchDocuments,
  indexDocument,
  updateDocumentEmbedding,
  batchIndexDocuments,
};
