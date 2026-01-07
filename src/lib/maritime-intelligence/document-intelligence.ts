/**
 * Central de Inteligência de Documentos Marítimos (CIDM)
 * RAG-based document search and knowledge extraction
 */

import { supabase } from '@/integrations/supabase/client';

export interface DocumentChunk {
  id: string;
  documentId: string;
  content: string;
  embedding?: number[];
  metadata: DocumentMetadata;
  similarity?: number;
}

export interface DocumentMetadata {
  title: string;
  type: 'manual' | 'procedure' | 'regulation' | 'incident' | 'maintenance' | 'training';
  source: string;
  page?: number;
  section?: string;
  language: string;
  vessel?: string;
  equipment?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MaritimeDocument {
  id: string;
  title: string;
  type: DocumentMetadata['type'];
  content: string;
  chunks: DocumentChunk[];
  metadata: DocumentMetadata;
  vectorized: boolean;
  chunkCount: number;
}

export interface SearchResult {
  query: string;
  results: DocumentChunk[];
  answer: string;
  sources: { title: string; page?: number; relevance: number }[];
  processingTime: number;
  totalDocumentsSearched: number;
}

export interface DocumentIngestionResult {
  documentId: string;
  chunksCreated: number;
  embeddingsGenerated: number;
  processingTime: number;
  status: 'success' | 'partial' | 'failed';
  errors?: string[];
}

// Simulated document database
const documentDatabase: MaritimeDocument[] = [
  {
    id: 'doc-001',
    title: 'Engine Manual Appendix B - Maintenance Procedures',
    type: 'manual',
    content: 'Oil verification procedure: 1. Ensure engine is cold (wait 30 min after shutdown). 2. Locate dipstick on starboard side (yellow cap). 3. Extract fully, wipe clean. 4. Reinsert until seated. 5. Extract again, read level. Normal range: between MIN (18mm) and MAX (22mm) marks. Action: If below MIN, add SAE 40 oil (2 liters per 1mm).',
    chunks: [],
    metadata: {
      title: 'Engine Manual Appendix B',
      type: 'manual',
      source: 'MAN Energy Solutions',
      page: 12,
      section: 'B.3 Oil Check',
      language: 'en',
      equipment: 'Main Engine',
      tags: ['engine', 'oil', 'maintenance', 'procedure'],
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-06-20')
    },
    vectorized: true,
    chunkCount: 8
  },
  {
    id: 'doc-002',
    title: 'PEOTRAM Manual - Crew Watchkeeping Requirements',
    type: 'regulation',
    content: 'Article 14.2: Crew watchkeeping requirements mandate minimum rest periods of 10 hours in any 24-hour period, with at least 6 hours continuous rest. Work hours cannot exceed 14 hours in 24 hours or 72 hours in 7 days. Officer of the Watch must maintain continuous bridge presence during navigation.',
    chunks: [],
    metadata: {
      title: 'PEOTRAM Manual',
      type: 'regulation',
      source: 'Brazilian Maritime Authority',
      page: 45,
      section: '14.2',
      language: 'pt-br',
      tags: ['peotram', 'watchkeeping', 'rest', 'compliance'],
      createdAt: new Date('2023-08-01'),
      updatedAt: new Date('2024-12-01')
    },
    vectorized: true,
    chunkCount: 15
  },
  {
    id: 'doc-003',
    title: 'Fuel Injector Maintenance History 2020-2025',
    type: 'maintenance',
    content: 'Analysis of 45 fuel injector failures (2020-2025): 80% caused by carbon buildup due to low-quality fuel. 15% caused by seal degradation from thermal cycling. 5% manufacturing defects. Recommended preventive measures: Use approved fuel additives, implement 500-hour cleaning cycle, replace seals at 2000 hours.',
    chunks: [],
    metadata: {
      title: 'Fuel Injector Analysis Report',
      type: 'maintenance',
      source: 'Chief Engineer Report',
      language: 'en',
      equipment: 'Fuel System',
      tags: ['fuel', 'injector', 'failure', 'analysis'],
      createdAt: new Date('2025-01-05'),
      updatedAt: new Date('2025-01-05')
    },
    vectorized: true,
    chunkCount: 12
  },
  {
    id: 'doc-004',
    title: 'Hydraulic Pressure Sensor Reset Procedure',
    type: 'procedure',
    content: 'Reset procedure for hydraulic pressure sensor HPS-001: 1. Isolate hydraulic circuit (close valves V-12, V-13). 2. Disconnect sensor electrical connection (4-pin connector). 3. Wait 30 seconds for capacitor discharge. 4. Reconnect sensor. 5. Open valves slowly. 6. Verify reading on bridge console. Expected range: 180-220 bar. If still reading incorrectly, replace sensor unit.',
    chunks: [],
    metadata: {
      title: 'Hydraulic Sensor Procedures',
      type: 'procedure',
      source: 'Technical Manual',
      page: 78,
      section: '5.4.2',
      language: 'en',
      equipment: 'Hydraulic System',
      tags: ['hydraulic', 'sensor', 'reset', 'procedure'],
      createdAt: new Date('2024-03-10'),
      updatedAt: new Date('2024-09-15')
    },
    vectorized: true,
    chunkCount: 6
  }
];

/**
 * Document Intelligence Engine
 */
export class DocumentIntelligenceEngine {
  private documents: MaritimeDocument[] = documentDatabase;
  private searchHistory: SearchResult[] = [];

  /**
   * Search documents using semantic similarity
   */
  async search(query: string, options?: {
    type?: DocumentMetadata['type'];
    limit?: number;
    minRelevance?: number;
  }): Promise<SearchResult> {
    const startTime = Date.now();
    const limit = options?.limit ?? 5;
    const minRelevance = options?.minRelevance ?? 0.6;

    // Simulate embedding generation and search
    const queryWords = query.toLowerCase().split(/\s+/);
    
    const results: DocumentChunk[] = [];
    
    for (const doc of this.documents) {
      if (options?.type && doc.type !== options.type) continue;
      
      // Calculate relevance score based on keyword matching
      const contentWords = doc.content.toLowerCase();
      const tagMatch = doc.metadata.tags.some(tag => 
        queryWords.some(word => tag.includes(word) || word.includes(tag))
      );
      
      let relevanceScore = 0;
      for (const word of queryWords) {
        if (contentWords.includes(word)) {
          relevanceScore += 0.2;
        }
      }
      if (tagMatch) relevanceScore += 0.3;
      
      relevanceScore = Math.min(relevanceScore, 0.98);
      
      if (relevanceScore >= minRelevance) {
        results.push({
          id: `chunk-${doc.id}`,
          documentId: doc.id,
          content: doc.content,
          similarity: relevanceScore,
          metadata: doc.metadata
        });
      }
    }

    // Sort by relevance
    results.sort((a, b) => (b.similarity || 0) - (a.similarity || 0));
    const topResults = results.slice(0, limit);

    // Generate answer from context
    const answer = this.generateAnswer(query, topResults);

    const searchResult: SearchResult = {
      query,
      results: topResults,
      answer,
      sources: topResults.map(r => ({
        title: r.metadata.title,
        page: r.metadata.page,
        relevance: Math.round((r.similarity || 0) * 100)
      })),
      processingTime: Date.now() - startTime,
      totalDocumentsSearched: this.documents.length
    };

    this.searchHistory.push(searchResult);
    return searchResult;
  }

  /**
   * Generate contextual answer from retrieved documents
   */
  private generateAnswer(query: string, context: DocumentChunk[]): string {
    if (context.length === 0) {
      return 'Não encontrei documentos relevantes para sua consulta. Tente reformular a pergunta ou verificar se o documento está na base.';
    }

    const queryLower = query.toLowerCase();
    
    // Check for specific query patterns
    if (queryLower.includes('óleo') || queryLower.includes('oil')) {
      const oilDoc = context.find(c => c.metadata.equipment?.includes('Engine'));
      if (oilDoc) {
        return `De acordo com ${oilDoc.metadata.title} (página ${oilDoc.metadata.page}):\n\n${oilDoc.content}\n\nFonte: ${oilDoc.metadata.source}`;
      }
    }

    if (queryLower.includes('peotram') || queryLower.includes('watchkeeping')) {
      const peotramDoc = context.find(c => c.metadata.tags.includes('peotram'));
      if (peotramDoc) {
        return `De acordo com ${peotramDoc.metadata.title} (Seção ${peotramDoc.metadata.section}):\n\n${peotramDoc.content}\n\nFonte: ${peotramDoc.metadata.source}`;
      }
    }

    if (queryLower.includes('fuel') || queryLower.includes('injector') || queryLower.includes('combustível')) {
      const fuelDoc = context.find(c => c.metadata.tags.includes('fuel'));
      if (fuelDoc) {
        return `Análise de ${fuelDoc.metadata.title}:\n\n${fuelDoc.content}\n\nRecomendação: Implemente ciclo de limpeza de 500 horas e use aditivos aprovados.`;
      }
    }

    if (queryLower.includes('hydraulic') || queryLower.includes('hidráulico') || queryLower.includes('reset')) {
      const hydroDoc = context.find(c => c.metadata.tags.includes('hydraulic'));
      if (hydroDoc) {
        return `Procedimento encontrado em ${hydroDoc.metadata.title} (Seção ${hydroDoc.metadata.section}):\n\n${hydroDoc.content}`;
      }
    }

    // Default answer with best match
    const bestMatch = context[0];
    return `Baseado na busca em ${this.documents.length} documentos, encontrei informação relevante em "${bestMatch.metadata.title}":\n\n${bestMatch.content}\n\nRelevância: ${Math.round((bestMatch.similarity || 0) * 100)}%`;
  }

  /**
   * Ingest a new document
   */
  async ingestDocument(
    title: string,
    content: string,
    type: DocumentMetadata['type'],
    metadata?: Partial<DocumentMetadata>
  ): Promise<DocumentIngestionResult> {
    const startTime = Date.now();
    const documentId = `doc-${Date.now()}`;

    try {
      // Chunk the document (512 token chunks with overlap)
      const chunks = this.chunkDocument(content, 512, 50);
      
      const newDoc: MaritimeDocument = {
        id: documentId,
        title,
        type,
        content,
        chunks: chunks.map((chunk, i) => ({
          id: `chunk-${documentId}-${i}`,
          documentId,
          content: chunk,
          metadata: {
            title,
            type,
            source: metadata?.source || 'User Upload',
            language: metadata?.language || 'en',
            tags: metadata?.tags || [],
            createdAt: new Date(),
            updatedAt: new Date(),
            ...metadata
          }
        })),
        metadata: {
          title,
          type,
          source: metadata?.source || 'User Upload',
          language: metadata?.language || 'en',
          tags: metadata?.tags || [],
          createdAt: new Date(),
          updatedAt: new Date(),
          ...metadata
        },
        vectorized: true,
        chunkCount: chunks.length
      };

      this.documents.push(newDoc);

      return {
        documentId,
        chunksCreated: chunks.length,
        embeddingsGenerated: chunks.length,
        processingTime: Date.now() - startTime,
        status: 'success'
      };
    } catch (error) {
      return {
        documentId,
        chunksCreated: 0,
        embeddingsGenerated: 0,
        processingTime: Date.now() - startTime,
        status: 'failed',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Chunk document into smaller pieces
   */
  private chunkDocument(content: string, chunkSize: number, overlap: number): string[] {
    const words = content.split(/\s+/);
    const chunks: string[] = [];
    
    for (let i = 0; i < words.length; i += chunkSize - overlap) {
      const chunk = words.slice(i, i + chunkSize).join(' ');
      if (chunk.length > 0) {
        chunks.push(chunk);
      }
    }
    
    return chunks;
  }

  /**
   * Get document statistics
   */
  getStatistics(): {
    totalDocuments: number;
    totalChunks: number;
    byType: Record<string, number>;
    searchCount: number;
    avgRelevance: number;
  } {
    const byType: Record<string, number> = {};
    let totalChunks = 0;

    for (const doc of this.documents) {
      byType[doc.type] = (byType[doc.type] || 0) + 1;
      totalChunks += doc.chunkCount;
    }

    const avgRelevance = this.searchHistory.length > 0
      ? this.searchHistory.reduce((sum, s) => {
          const maxRel = Math.max(...s.sources.map(src => src.relevance));
          return sum + maxRel;
        }, 0) / this.searchHistory.length
      : 0;

    return {
      totalDocuments: this.documents.length,
      totalChunks,
      byType,
      searchCount: this.searchHistory.length,
      avgRelevance
    };
  }

  /**
   * Get all documents
   */
  getAllDocuments(): MaritimeDocument[] {
    return this.documents;
  }

  /**
   * Get search history
   */
  getSearchHistory(): SearchResult[] {
    return this.searchHistory.slice(-20);
  }
}

// Export singleton instance
export const documentIntelligence = new DocumentIntelligenceEngine();
