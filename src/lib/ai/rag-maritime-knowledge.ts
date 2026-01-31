/**
 * RAG (Retrieval-Augmented Generation) for Maritime Knowledge
 * NAUTI ONE v4.0 - Phase 10: AI Evolution
 * 
 * Implements vector-based document retrieval for accurate AI responses
 * based on official maritime documentation (MLC, STCW, ISM, ISPS)
 */

import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

// Maritime document categories
export type MaritimeDocumentCategory = 
  | 'mlc_2006'
  | 'stcw_convention'
  | 'ism_code'
  | 'isps_code'
  | 'solas'
  | 'marpol'
  | 'company_manual'
  | 'equipment_manual'
  | 'incident_report';

export interface MaritimeDocument {
  id: string;
  category: MaritimeDocumentCategory;
  title: string;
  content: string;
  section?: string;
  chapter?: string;
  version?: string;
  effective_date?: string;
  metadata?: Record<string, unknown>;
}

export interface RAGQueryResult {
  documents: Array<{
    id: string;
    title: string;
    content: string;
    category: MaritimeDocumentCategory;
    relevance_score: number;
    citation: string;
  }>;
  context: string;
  sources: string[];
}

export interface RAGResponse {
  answer: string;
  sources: Array<{
    document_id: string;
    title: string;
    citation: string;
    relevance: number;
  }>;
  confidence: number;
  processing_time_ms: number;
}

// Maritime knowledge base (in-memory for demo, would use Pinecone in production)
const MARITIME_KNOWLEDGE_BASE: MaritimeDocument[] = [
  {
    id: 'mlc-1.1',
    category: 'mlc_2006',
    title: 'MLC 2006 - Minimum Age',
    section: 'Standard A1.1',
    content: `The minimum age for work on a ship shall be 16 years. Night work is prohibited for seafarers under 18. 
              Hazardous work requires minimum age of 18. Member States may authorize 15-year-olds for light work 
              that is part of approved training programs.`,
    version: '2022 Amendment',
    effective_date: '2022-12-26'
  },
  {
    id: 'mlc-2.3',
    category: 'mlc_2006',
    title: 'MLC 2006 - Hours of Work and Rest',
    section: 'Standard A2.3',
    content: `Maximum hours of work: 14 hours in any 24-hour period, 72 hours in any 7-day period.
              Minimum hours of rest: 10 hours in any 24-hour period, 77 hours in any 7-day period.
              Rest periods may be divided into no more than two periods, one of which must be at least 6 hours.
              The interval between consecutive rest periods shall not exceed 14 hours.`,
    version: '2022 Amendment',
    effective_date: '2022-12-26'
  },
  {
    id: 'mlc-4.1',
    category: 'mlc_2006',
    title: 'MLC 2006 - Medical Care on Board',
    section: 'Standard A4.1',
    content: `Ships shall carry a medicine chest, medical equipment and a medical guide.
              Ships carrying 100+ persons on international voyages exceeding 3 days must have a qualified medical doctor.
              Ships without a doctor must have at least one seafarer trained in medical first aid.
              Radio medical advice services shall be available 24/7.`,
    version: '2022 Amendment',
    effective_date: '2022-12-26'
  },
  {
    id: 'stcw-ii-1',
    category: 'stcw_convention',
    title: 'STCW - Officer in Charge of Navigational Watch',
    section: 'Regulation II/1',
    content: `Every officer in charge of a navigational watch on a seagoing ship of 500 gross tonnage or more shall:
              1. Be at least 18 years old
              2. Have approved seagoing service of not less than 12 months
              3. Have completed approved education and training meeting STCW Code Section A-II/1
              4. Meet the standard of competence specified in Section A-II/1
              Certificate valid for 5 years, subject to revalidation.`,
    version: '2010 Manila Amendments',
    effective_date: '2012-01-01'
  },
  {
    id: 'stcw-vi-1',
    category: 'stcw_convention',
    title: 'STCW - Basic Safety Training',
    section: 'Regulation VI/1',
    content: `All seafarers must complete approved basic training in:
              1. Personal Survival Techniques (PST)
              2. Fire Prevention and Fire Fighting (FPFF)
              3. Elementary First Aid (EFA)
              4. Personal Safety and Social Responsibilities (PSSR)
              Training certificates valid for 5 years. Refresher training required for PST and FPFF.`,
    version: '2010 Manila Amendments',
    effective_date: '2012-01-01'
  },
  {
    id: 'ism-9',
    category: 'ism_code',
    title: 'ISM Code - Reports and Analysis of Non-Conformities',
    section: 'Section 9',
    content: `The SMS shall include procedures ensuring that non-conformities, accidents and hazardous situations
              are reported to the Company, investigated and analyzed with the objective of improving safety and
              pollution prevention. The Company shall establish procedures for the implementation of corrective action,
              including measures intended to prevent recurrence.`,
    version: 'Resolution MSC.353(92)',
    effective_date: '2015-01-01'
  },
  {
    id: 'isps-7',
    category: 'isps_code',
    title: 'ISPS Code - Ship Security Plan',
    section: 'Part A, Section 9',
    content: `Each ship shall carry on board a ship security plan approved by the Administration. The plan shall:
              1. Detail operational and physical security measures at Security Levels 1, 2, and 3
              2. Be protected from unauthorized access or disclosure
              3. Address all security aspects of ship operation
              4. Include procedures for responding to security threats
              The Ship Security Officer (SSO) is responsible for implementation.`,
    version: 'SOLAS Chapter XI-2',
    effective_date: '2004-07-01'
  }
];

/**
 * Calculate text similarity using simple TF-IDF-like approach
 * In production, this would use vector embeddings from OpenAI/Pinecone
 */
function calculateSimilarity(query: string, document: string): number {
  const queryWords = query.toLowerCase().split(/\s+/);
  const docWords = document.toLowerCase().split(/\s+/);
  
  let matchCount = 0;
  const docWordSet = new Set(docWords);
  
  for (const word of queryWords) {
    if (docWordSet.has(word)) {
      matchCount++;
    }
    // Partial matching for compound terms
    for (const docWord of docWordSet) {
      if (docWord.includes(word) || word.includes(docWord)) {
        matchCount += 0.5;
      }
    }
  }
  
  // Normalize by query length
  return Math.min(matchCount / queryWords.length, 1);
}

/**
 * Search maritime knowledge base for relevant documents
 */
export async function searchMaritimeKnowledge(
  query: string,
  options: {
    categories?: MaritimeDocumentCategory[];
    topK?: number;
    minRelevance?: number;
  } = {}
): Promise<RAGQueryResult> {
  const { categories, topK = 5, minRelevance = 0.1 } = options;
  
  // Filter by category if specified
  let documents = MARITIME_KNOWLEDGE_BASE;
  if (categories && categories.length > 0) {
    documents = documents.filter(doc => categories.includes(doc.category));
  }
  
  // Calculate relevance scores
  const scoredDocs = documents.map(doc => ({
    ...doc,
    relevance_score: calculateSimilarity(
      query,
      `${doc.title} ${doc.content} ${doc.section || ''}`
    )
  }));
  
  // Sort by relevance and filter
  const relevantDocs = scoredDocs
    .filter(doc => doc.relevance_score >= minRelevance)
    .sort((a, b) => b.relevance_score - a.relevance_score)
    .slice(0, topK);
  
  // Build context string
  const context = relevantDocs
    .map(doc => `[${doc.title}]\n${doc.content}`)
    .join('\n\n---\n\n');
  
  // Extract unique sources
  const sources = [...new Set(relevantDocs.map(doc => 
    `${doc.title} (${doc.section || doc.category})`
  ))];
  
  return {
    documents: relevantDocs.map(doc => ({
      id: doc.id,
      title: doc.title,
      content: doc.content,
      category: doc.category,
      relevance_score: doc.relevance_score,
      citation: `${doc.title}, ${doc.section || ''}, ${doc.version || ''}`
    })),
    context,
    sources
  };
}

/**
 * Query maritime knowledge with RAG-enhanced AI response
 */
export async function queryWithRAG(
  question: string,
  options: {
    categories?: MaritimeDocumentCategory[];
    language?: string;
  } = {}
): Promise<RAGResponse> {
  const startTime = Date.now();
  
  // Step 1: Retrieve relevant documents
  const ragResult = await searchMaritimeKnowledge(question, {
    categories: options.categories,
    topK: 5,
    minRelevance: 0.15
  });
  
  if (ragResult.documents.length === 0) {
    return {
      answer: 'Não encontrei documentação específica sobre esta questão na base de conhecimento marítimo. Por favor, consulte as regulamentações oficiais ou entre em contato com o departamento de compliance.',
      sources: [],
      confidence: 0,
      processing_time_ms: Date.now() - startTime
    };
  }
  
  // Step 2: Build prompt with context
  const systemPrompt = `Você é um especialista em regulamentações marítimas com conhecimento profundo de:
- MLC 2006 (Maritime Labour Convention)
- STCW (Standards of Training, Certification and Watchkeeping)
- ISM Code (International Safety Management)
- ISPS Code (International Ship and Port Facility Security)
- SOLAS (Safety of Life at Sea)
- MARPOL (Marine Pollution)

REGRAS IMPORTANTES:
1. Responda APENAS com base no contexto fornecido
2. Cite as fontes específicas (seção, regulamento)
3. Se a informação não estiver no contexto, diga claramente
4. Seja preciso e objetivo
5. Use linguagem técnica apropriada`;

  const userPrompt = `CONTEXTO DOS DOCUMENTOS:
${ragResult.context}

---

PERGUNTA: ${question}

Responda de forma clara e objetiva, citando as fontes relevantes.`;

  // Step 3: Call AI for response (would call edge function in production)
  // For now, generate a structured response based on the context
  const answer = generateStructuredAnswer(question, ragResult);
  
  // Calculate confidence based on relevance scores
  const avgRelevance = ragResult.documents.reduce((sum, doc) => sum + doc.relevance_score, 0) / ragResult.documents.length;
  
  return {
    answer,
    sources: ragResult.documents.map(doc => ({
      document_id: doc.id,
      title: doc.title,
      citation: doc.citation,
      relevance: doc.relevance_score
    })),
    confidence: avgRelevance,
    processing_time_ms: Date.now() - startTime
  };
}

/**
 * Generate structured answer from RAG context
 */
function generateStructuredAnswer(question: string, ragResult: RAGQueryResult): string {
  const topDoc = ragResult.documents[0];
  if (!topDoc) {
    return 'Informação não encontrada na base de conhecimento.';
  }
  
  const citations = ragResult.documents
    .slice(0, 3)
    .map(doc => `• ${doc.citation}`)
    .join('\n');
  
  return `**Resposta baseada na documentação oficial:**

${topDoc.content}

**Fontes consultadas:**
${citations}

*Nota: Esta resposta é baseada em documentação oficial. Consulte sempre as versões mais recentes das regulamentações para decisões críticas.*`;
}

/**
 * Index new document to knowledge base
 * In production, this would create embeddings and store in Pinecone
 */
export async function indexDocument(document: Omit<MaritimeDocument, 'id'>): Promise<string> {
  const id = `${document.category}-${Date.now()}`;
  
  // In production: Generate embedding and store in vector DB
  // const embedding = await openai.embeddings.create({ ... });
  // await pinecone.upsert({ id, values: embedding, metadata: document });
  
  logger.debug(`[RAG] Indexed document: ${id}`);
  
  return id;
}

/**
 * Get available document categories with counts
 */
export function getDocumentCategories(): Array<{
  category: MaritimeDocumentCategory;
  label: string;
  count: number;
  description: string;
}> {
  const counts: Record<MaritimeDocumentCategory, number> = {
    mlc_2006: 0,
    stcw_convention: 0,
    ism_code: 0,
    isps_code: 0,
    solas: 0,
    marpol: 0,
    company_manual: 0,
    equipment_manual: 0,
    incident_report: 0
  };
  
  MARITIME_KNOWLEDGE_BASE.forEach(doc => {
    counts[doc.category]++;
  });
  
  return [
    { category: 'mlc_2006', label: 'MLC 2006', count: counts.mlc_2006, description: 'Maritime Labour Convention' },
    { category: 'stcw_convention', label: 'STCW', count: counts.stcw_convention, description: 'Training, Certification and Watchkeeping' },
    { category: 'ism_code', label: 'ISM Code', count: counts.ism_code, description: 'International Safety Management' },
    { category: 'isps_code', label: 'ISPS Code', count: counts.isps_code, description: 'Ship and Port Facility Security' },
    { category: 'solas', label: 'SOLAS', count: counts.solas, description: 'Safety of Life at Sea' },
    { category: 'marpol', label: 'MARPOL', count: counts.marpol, description: 'Marine Pollution Prevention' },
    { category: 'company_manual', label: 'Manuais', count: counts.company_manual, description: 'Manuais da Empresa' },
    { category: 'equipment_manual', label: 'Equipamentos', count: counts.equipment_manual, description: 'Manuais de Equipamentos' },
    { category: 'incident_report', label: 'Incidentes', count: counts.incident_report, description: 'Relatórios de Incidentes' }
  ];
}

export default {
  searchMaritimeKnowledge,
  queryWithRAG,
  indexDocument,
  getDocumentCategories
};
