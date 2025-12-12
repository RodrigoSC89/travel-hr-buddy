/**
 * RAG Engine - Retrieval-Augmented Generation
 * PATCH 850 - AI com RAG + HITL
 */

import { supabase } from "@/integrations/supabase/client";

export interface RAGDocument {
  id: string;
  title: string;
  content: string;
  source: string;
  category: string;
  embedding?: number[];
  metadata?: Record<string, unknown>;
}

export interface RAGSearchResult {
  document: RAGDocument;
  relevanceScore: number;
  snippet: string;
}

export interface RAGResponse {
  answer: string;
  confidence: number;
  sources: RAGSearchResult[];
  requiresHumanValidation: boolean;
  auditId: string;
}

// Confidence thresholds
const CONFIDENCE_THRESHOLDS = {
  HIGH: 0.85,
  MEDIUM: 0.65,
  LOW: 0.45,
  CRITICAL_OPERATION: 0.90,
};

// Categories that require HITL validation
const HITL_REQUIRED_CATEGORIES = [
  "safety",
  "compliance",
  "regulatory",
  "medical",
  "financial",
  "legal",
];

/**
 * Calculate semantic similarity between query and document
 * Uses cosine similarity for vector comparison
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Simple keyword-based relevance scoring
 * Used as fallback when embeddings are not available
 */
function keywordRelevance(query: string, content: string): number {
  const queryTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
  const contentLower = content.toLowerCase();
  
  let matches = 0;
  for (const term of queryTerms) {
    if (contentLower.includes(term)) {
      matches++;
    }
  }
  
  return queryTerms.length > 0 ? matches / queryTerms.length : 0;
}

/**
 * Extract relevant snippet from document
 */
function extractSnippet(content: string, query: string, maxLength: number = 200): string {
  const queryTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
  const contentLower = content.toLowerCase();
  
  // Find the first occurrence of any query term
  let startIndex = 0;
  for (const term of queryTerms) {
    const index = contentLower.indexOf(term);
    if (index !== -1) {
      startIndex = Math.max(0, index - 50);
      break;
    }
  }
  
  // Extract snippet around the found position
  let snippet = content.substring(startIndex, startIndex + maxLength);
  
  // Clean up snippet edges
  if (startIndex > 0) snippet = "..." + snippet;
  if (startIndex + maxLength < content.length) snippet = snippet + "...";
  
  return snippet;
}

/**
 * Search documents using RAG approach
 */
export async function searchDocuments(
  query: string,
  organizationId: string,
  options: {
    limit?: number;
    categories?: string[];
    minRelevance?: number;
  } = {}
): Promise<RAGSearchResult[]> {
  const { limit = 5, categories, minRelevance = 0.3 } = options;
  
  try {
    // Build query
    const dbQuery = supabase
      .from("ai_documents")
      .select("*")
      .eq("organization_id", organizationId)
      .limit(limit * 2); // Fetch more to filter by relevance
    
    const { data: documents, error } = await dbQuery;
    
    if (error) {
      return [];
    }
    
    if (!documents || documents.length === 0) {
      return [];
    }
    
    // Score and rank documents
    const scoredResults: RAGSearchResult[] = documents
      .map(doc => {
        const relevanceScore = keywordRelevance(query, doc.file_name || "");
        return {
          document: {
            id: doc.id,
            title: doc.file_name,
            content: doc.file_name, // Use file_name as content fallback
            source: doc.storage_path,
            category: doc.file_type,
            metadata: { ocr_status: doc.ocr_status },
          },
          relevanceScore,
          snippet: extractSnippet(doc.file_name || "", query),
        };
      })
      .filter(result => result.relevanceScore >= minRelevance)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit);
    
    return scoredResults;
  } catch (error) {
    console.error("RAG search failed:", error);
    console.error("RAG search failed:", error);
    return [];
  }
}

/**
 * Determine if HITL validation is required
 */
function requiresHumanValidation(
  confidence: number,
  categories: string[],
  isCriticalOperation: boolean
): boolean {
  // Critical operations always require validation below threshold
  if (isCriticalOperation && confidence < CONFIDENCE_THRESHOLDS.CRITICAL_OPERATION) {
    return true;
  }
  
  // Check if any category requires HITL
  const hasHITLCategory = categories.some(cat => 
    HITL_REQUIRED_CATEGORIES.includes(cat.toLowerCase())
  );
  
  if (hasHITLCategory && confidence < CONFIDENCE_THRESHOLDS.HIGH) {
    return true;
  }
  
  // Low confidence always requires validation
  return confidence < CONFIDENCE_THRESHOLDS.LOW;
}

/**
 * Calculate overall confidence score
 */
function calculateConfidence(sources: RAGSearchResult[]): number {
  if (sources.length === 0) return 0;
  
  // Weighted average of source relevance scores
  const totalWeight = sources.reduce((sum, _, i) => sum + (1 / (i + 1)), 0);
  const weightedScore = sources.reduce((sum, source, i) => {
    const weight = 1 / (i + 1);
    return sum + (source.relevanceScore * weight);
  }, 0);
  
  return weightedScore / totalWeight;
}

/**
 * Create audit log entry
 */
async function createAuditEntry(
  userId: string,
  query: string,
  response: Omit<RAGResponse, "auditId">,
  organizationId: string
): Promise<string> {
  const auditId = crypto.randomUUID();
  
  try {
    await supabase.from("ai_logs").insert({
      id: auditId,
      service: "rag-engine",
      prompt_hash: btoa(query).substring(0, 64),
      prompt_length: query.length,
      response_length: response.answer.length,
      status: "success",
      metadata: {
        confidence: response.confidence,
        sources_count: response.sources.length,
        requires_validation: response.requiresHumanValidation,
        user_id: userId,
        organization_id: organizationId,
      },
    });
  } catch (error) {
    console.error("Failed to create audit entry:", error);
    console.error("Failed to create audit entry:", error);
  }
  
  return auditId;
}

/**
 * Main RAG query function
 */
export async function queryWithRAG(
  query: string,
  userId: string,
  organizationId: string,
  options: {
    categories?: string[];
    isCriticalOperation?: boolean;
    maxSources?: number;
  } = {}
): Promise<RAGResponse> {
  const { categories = [], isCriticalOperation = false, maxSources = 3 } = options;
  
  // Search for relevant documents
  const sources = await searchDocuments(query, organizationId, {
    limit: maxSources,
    categories,
    minRelevance: 0.2,
  });
  
  // Calculate confidence
  const confidence = calculateConfidence(sources);
  
  // Determine if HITL is required
  const needsHumanValidation = requiresHumanValidation(
    confidence,
    categories,
    isCriticalOperation
  );
  
  // Generate answer based on sources
  let answer: string;
  if (sources.length === 0) {
    answer = "Não foram encontrados documentos relevantes para responder sua pergunta. Por favor, reformule ou consulte um especialista.";
  } else {
    // Build answer from sources
    const sourceReferences = sources
      .map((s, i) => `[${i + 1}] ${s.document.title}`)
      .join("\n");
    
    answer = `Baseado nos documentos encontrados:\n\n${sources[0].snippet}\n\nFontes:\n${sourceReferences}`;
  }
  
  // Create response without auditId first
  const partialResponse = {
    answer,
    confidence,
    sources,
    requiresHumanValidation: needsHumanValidation,
  });
  
  // Create audit entry
  const auditId = await createAuditEntry(userId, query, partialResponse, organizationId);
  
  return {
    ...partialResponse,
    auditId,
  };
}

/**
 * Submit human validation for a RAG response
 */
export async function submitHITLValidation(
  auditId: string,
  userId: string,
  approved: boolean,
  feedback?: string
): Promise<void> {
  try {
    await supabase.from("ai_feedback_scores").insert({
      command_type: "rag-validation",
      self_score: approved ? 1 : 0,
      user_id: userId,
      command_data: { auditId },
      feedback_data: { approved, feedback },
    });
  } catch (error) {
    console.error("Failed to submit HITL validation:", error);
    console.error("Failed to submit HITL validation:", error);
    throw error;
  }
}

/**
 * Hook for using RAG in components
 */
export function useRAG() {
  const query = async (
    queryText: string,
    userId: string,
    organizationId: string,
    options?: Parameters<typeof queryWithRAG>[3]
  ) => {
    return queryWithRAG(queryText, userId, organizationId, options);
  });
  
  const validate = async (
    auditId: string,
    userId: string,
    approved: boolean,
    feedback?: string
  ) => {
    return submitHITLValidation(auditId, userId, approved, feedback);
  };
  
  return { query, validate };
}
