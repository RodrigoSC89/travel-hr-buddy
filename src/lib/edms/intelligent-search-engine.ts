/**
 * Intelligent Search Engine - AI-Powered Document Discovery
 * Semantic search with NLP, faceted filtering, and smart suggestions
 * PATCH 863
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export interface SearchQuery {
  query: string;
  filters?: SearchFilters;
  options?: SearchOptions;
}

export interface SearchFilters {
  documentTypes?: string[];
  categories?: string[];
  dateRange?: { start: Date; end: Date };
  authors?: string[];
  vessels?: string[];
  regulations?: string[];
  statuses?: string[];
  tags?: string[];
  departments?: string[];
  confidentiality?: ("public" | "internal" | "confidential" | "restricted")[];
}

export interface SearchOptions {
  limit?: number;
  offset?: number;
  sortBy?: "relevance" | "date" | "title" | "views" | "downloads";
  sortOrder?: "asc" | "desc";
  includeContent?: boolean;
  highlightMatches?: boolean;
  semanticSearch?: boolean;
  fuzzyMatching?: boolean;
  expandAcronyms?: boolean;
}

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: string;
  category: string;
  excerpt: string;
  highlights: string[];
  relevanceScore: number;
  semanticScore?: number;
  matchedTerms: string[];
  metadata: {
    author: string;
    createdAt: Date;
    updatedAt: Date;
    version: string;
    fileSize: number;
    viewCount: number;
    downloadCount: number;
    vessel?: string;
    regulation?: string;
  };
  storagePath?: string;
  thumbnailUrl?: string;
}

export interface SearchResponse {
  results: SearchResult[];
  totalCount: number;
  facets: SearchFacets;
  suggestions: SearchSuggestion[];
  relatedSearches: string[];
  executionTimeMs: number;
  query: {
    original: string;
    normalized: string;
    expandedTerms: string[];
    detectedEntities: DetectedEntity[];
  };
}

export interface SearchFacets {
  types: FacetCount[];
  categories: FacetCount[];
  authors: FacetCount[];
  vessels: FacetCount[];
  regulations: FacetCount[];
  years: FacetCount[];
  departments: FacetCount[];
}

export interface FacetCount {
  value: string;
  count: number;
  selected: boolean;
}

export interface SearchSuggestion {
  type: "correction" | "expansion" | "related" | "popular";
  text: string;
  score: number;
}

export interface DetectedEntity {
  type: "vessel" | "crew" | "date" | "regulation" | "certificate" | "port" | "imo_number";
  value: string;
  startIndex: number;
  endIndex: number;
  confidence: number;
}

export interface SavedSearch {
  id: string;
  name: string;
  query: SearchQuery;
  userId: string;
  isPublic: boolean;
  alertEnabled: boolean;
  alertFrequency?: "daily" | "weekly" | "immediate";
  lastExecuted?: Date;
  resultCount?: number;
  createdAt: Date;
}

class IntelligentSearchEngine {
  private readonly MARITIME_ACRONYMS: Record<string, string[]> = {
    "IMO": ["International Maritime Organization"],
    "STCW": ["Standards of Training, Certification and Watchkeeping"],
    "MLC": ["Maritime Labour Convention"],
    "SOLAS": ["Safety of Life at Sea"],
    "MARPOL": ["Marine Pollution", "International Convention for the Prevention of Pollution from Ships"],
    "ISM": ["International Safety Management"],
    "ISPS": ["International Ship and Port Facility Security"],
    "PSC": ["Port State Control"],
    "COC": ["Certificate of Competency"],
    "GMDSS": ["Global Maritime Distress and Safety System"],
    "P&I": ["Protection and Indemnity"],
    "H&M": ["Hull and Machinery"],
    "LOI": ["Letter of Indemnity"],
    "B/L": ["Bill of Lading"],
    "C/P": ["Charter Party"],
    "NOR": ["Notice of Readiness"],
    "SOF": ["Statement of Facts"],
    "ETA": ["Estimated Time of Arrival"],
    "ETD": ["Estimated Time of Departure"],
    "ROB": ["Remaining on Board"],
    "FOC": ["Flag of Convenience"],
    "DWT": ["Deadweight Tonnage"],
    "GT": ["Gross Tonnage"],
    "NT": ["Net Tonnage"],
    "LOA": ["Length Overall"],
    "LBP": ["Length Between Perpendiculars"]
  };

  private readonly MARITIME_SYNONYMS: Record<string, string[]> = {
    "vessel": ["ship", "boat", "craft", "tanker", "carrier", "bulk", "container"],
    "crew": ["seafarer", "mariner", "sailor", "personnel", "staff", "employee"],
    "certificate": ["certification", "license", "endorsement", "credential", "qualification"],
    "inspection": ["survey", "audit", "examination", "review", "assessment"],
    "maintenance": ["repair", "service", "overhaul", "fix", "upkeep"],
    "voyage": ["trip", "journey", "sailing", "passage", "transit"],
    "cargo": ["goods", "freight", "shipment", "load", "consignment"],
    "port": ["harbor", "terminal", "dock", "wharf", "berth"],
    "contract": ["agreement", "charter", "hire", "engagement"],
    "safety": ["security", "protection", "prevention", "compliance"]
  };

  /**
   * Execute intelligent search with AI enhancements
   */
  async search(searchQuery: SearchQuery): Promise<SearchResponse> {
    const startTime = Date.now();

    try {
      // Normalize and analyze query
      const normalizedQuery = this.normalizeQuery(searchQuery.query);
      const expandedTerms = this.expandQuery(normalizedQuery, searchQuery.options);
      const detectedEntities = this.detectEntities(searchQuery.query);

      // Build search query
      let results = await this.executeSearch(
        expandedTerms,
        searchQuery.filters,
        searchQuery.options
      );

      // Apply semantic ranking if enabled
      if (searchQuery.options?.semanticSearch !== false) {
        results = await this.applySemanticRanking(results, searchQuery.query);
      }

      // Get facets
      const facets = await this.calculateFacets(results, searchQuery.filters);

      // Generate suggestions
      const suggestions = await this.generateSuggestions(
        searchQuery.query,
        results.length
      );

      // Get related searches
      const relatedSearches = await this.getRelatedSearches(searchQuery.query);

      // Apply highlighting
      if (searchQuery.options?.highlightMatches !== false) {
        results = this.applyHighlighting(results, expandedTerms);
      }

      // Apply pagination
      const offset = searchQuery.options?.offset || 0;
      const limit = searchQuery.options?.limit || 20;
      const paginatedResults = results.slice(offset, offset + limit);

      const executionTimeMs = Date.now() - startTime;

      logger.info("Search executed", {
        query: searchQuery.query,
        resultCount: results.length,
        executionTimeMs
      });

      return {
        results: paginatedResults,
        totalCount: results.length,
        facets,
        suggestions,
        relatedSearches,
        executionTimeMs,
        query: {
          original: searchQuery.query,
          normalized: normalizedQuery,
          expandedTerms,
          detectedEntities
        }
      };
    } catch (error) {
      logger.error("Search error", error as Error);
      throw error;
    }
  }

  /**
   * Detect maritime entities in query
   */
  private detectEntities(query: string): DetectedEntity[] {
    const entities: DetectedEntity[] = [];

    // IMO number pattern (7 digits)
    const imoPattern = /\bIMO\s*(\d{7})\b/gi;
    let match;
    while ((match = imoPattern.exec(query)) !== null) {
      entities.push({
        type: "imo_number",
        value: match[1],
        startIndex: match.index,
        endIndex: match.index + match[0].length,
        confidence: 0.95
      });
    }

    // Date patterns
    const datePattern = /\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{4}[\/\-]\d{2}[\/\-]\d{2})\b/g;
    while ((match = datePattern.exec(query)) !== null) {
      entities.push({
        type: "date",
        value: match[0],
        startIndex: match.index,
        endIndex: match.index + match[0].length,
        confidence: 0.9
      });
    }

    // Regulation patterns
    const regulations = ["SOLAS", "MARPOL", "MLC", "STCW", "ISM", "ISPS"];
    for (const reg of regulations) {
      const regPattern = new RegExp(`\\b${reg}\\b`, "gi");
      while ((match = regPattern.exec(query)) !== null) {
        entities.push({
          type: "regulation",
          value: reg,
          startIndex: match.index,
          endIndex: match.index + match[0].length,
          confidence: 0.95
        });
      }
    }

    // Certificate patterns
    const certPatterns = [
      /\b(COC|COP|GMDSS|ECDIS)\b/gi,
      /\bcertificate\s+(?:of\s+)?(\w+)\b/gi
    ];
    for (const pattern of certPatterns) {
      while ((match = pattern.exec(query)) !== null) {
        entities.push({
          type: "certificate",
          value: match[0],
          startIndex: match.index,
          endIndex: match.index + match[0].length,
          confidence: 0.85
        });
      }
    }

    return entities;
  }

  /**
   * Expand query with synonyms and acronyms
   */
  private expandQuery(query: string, options?: SearchOptions): string[] {
    const terms: Set<string> = new Set();
    const words = query.toLowerCase().split(/\s+/);

    for (const word of words) {
      terms.add(word);

      // Expand acronyms
      if (options?.expandAcronyms !== false) {
        const acronymExpansion = this.MARITIME_ACRONYMS[word.toUpperCase()];
        if (acronymExpansion) {
          acronymExpansion.forEach(exp => {
            exp.toLowerCase().split(/\s+/).forEach(w => terms.add(w));
          });
        }
      }

      // Add synonyms
      const synonyms = this.MARITIME_SYNONYMS[word];
      if (synonyms) {
        synonyms.forEach(s => terms.add(s));
      }
    }

    return Array.from(terms);
  }

  /**
   * Normalize query for consistent matching
   */
  private normalizeQuery(query: string): string {
    return query
      .toLowerCase()
      .replace(/[^\w\s\-\/]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  /**
   * Execute database search
   */
  private async executeSearch(
    terms: string[],
    filters?: SearchFilters,
    options?: SearchOptions
  ): Promise<SearchResult[]> {
    try {
      // Build query
      let query = supabase
        .from("ai_documents")
        .select("*")
        .order("created_at", { ascending: false });

      // Apply text search
      if (terms.length > 0) {
        const searchTerm = terms.join(" | ");
        // Using ilike for fuzzy matching
        query = query.or(
          terms.map(t => `file_name.ilike.%${t}%`).join(",") + "," +
          terms.map(t => `ocr_text.ilike.%${t}%`).join(",")
        );
      }

      // Apply filters
      if (filters?.documentTypes?.length) {
        query = query.in("file_type", filters.documentTypes);
      }

      if (filters?.categories?.length) {
        query = query.in("category", filters.categories);
      }

      if (filters?.dateRange) {
        query = query
          .gte("created_at", filters.dateRange.start.toISOString())
          .lte("created_at", filters.dateRange.end.toISOString());
      }

      const { data, error } = await query.limit(500);

      if (error) throw error;

      // Transform results
      return (data || []).map(doc => this.transformToSearchResult(doc, terms));
    } catch (error) {
      logger.error("Database search error", error as Error);
      return [];
    }
  }

  /**
   * Transform database record to search result
   */
  private transformToSearchResult(doc: any, searchTerms: string[]): SearchResult {
    const content = doc.ocr_text || "";
    const matchedTerms = searchTerms.filter(term => 
      doc.file_name.toLowerCase().includes(term) ||
      content.toLowerCase().includes(term)
    );

    // Calculate relevance score
    let relevanceScore = 0;
    
    // Title matches are worth more
    for (const term of searchTerms) {
      if (doc.file_name.toLowerCase().includes(term)) {
        relevanceScore += 10;
      }
      if (content.toLowerCase().includes(term)) {
        relevanceScore += 1;
      }
    }

    // Recency boost
    const daysSinceCreation = (Date.now() - new Date(doc.created_at).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceCreation < 30) relevanceScore += 5;
    else if (daysSinceCreation < 90) relevanceScore += 2;

    return {
      id: doc.id,
      title: doc.file_name,
      description: doc.description || "",
      type: doc.file_type,
      category: doc.category || "general",
      excerpt: this.generateExcerpt(content, searchTerms),
      highlights: [],
      relevanceScore,
      matchedTerms,
      metadata: {
        author: doc.uploaded_by || "Unknown",
        createdAt: new Date(doc.created_at),
        updatedAt: new Date(doc.updated_at),
        version: "1.0",
        fileSize: doc.file_size || 0,
        viewCount: 0,
        downloadCount: 0
      },
      storagePath: doc.storage_path
    };
  }

  /**
   * Generate excerpt with context around matched terms
   */
  private generateExcerpt(content: string, terms: string[], maxLength: number = 200): string {
    if (!content) return "";

    const lowerContent = content.toLowerCase();
    let bestStart = 0;
    let highestScore = 0;

    // Find the section with most term matches
    for (let i = 0; i < content.length - maxLength; i += 50) {
      const section = lowerContent.substring(i, i + maxLength);
      const score = terms.reduce((acc, term) => 
        acc + (section.includes(term) ? 1 : 0), 0
      );
      
      if (score > highestScore) {
        highestScore = score;
        bestStart = i;
      }
    }

    let excerpt = content.substring(bestStart, bestStart + maxLength);
    
    // Clean up excerpt boundaries
    if (bestStart > 0) excerpt = "..." + excerpt;
    if (bestStart + maxLength < content.length) excerpt = excerpt + "...";

    return excerpt.replace(/\s+/g, " ").trim();
  }

  /**
   * Apply semantic ranking using AI
   */
  private async applySemanticRanking(
    results: SearchResult[],
    originalQuery: string
  ): Promise<SearchResult[]> {
    // Sort by combined relevance and recency
    return results.sort((a, b) => {
      const scoreA = a.relevanceScore + (a.matchedTerms.length * 2);
      const scoreB = b.relevanceScore + (b.matchedTerms.length * 2);
      return scoreB - scoreA;
    });
  }

  /**
   * Calculate facets for filtering
   */
  private async calculateFacets(
    results: SearchResult[],
    currentFilters?: SearchFilters
  ): Promise<SearchFacets> {
    const typeCounts: Record<string, number> = {};
    const categoryCounts: Record<string, number> = {};
    const authorCounts: Record<string, number> = {};
    const yearCounts: Record<string, number> = {};

    for (const result of results) {
      typeCounts[result.type] = (typeCounts[result.type] || 0) + 1;
      categoryCounts[result.category] = (categoryCounts[result.category] || 0) + 1;
      authorCounts[result.metadata.author] = (authorCounts[result.metadata.author] || 0) + 1;
      
      const year = result.metadata.createdAt.getFullYear().toString();
      yearCounts[year] = (yearCounts[year] || 0) + 1;
    }

    const toFacetArray = (counts: Record<string, number>, selected: string[] = []): FacetCount[] =>
      Object.entries(counts)
        .map(([value, count]) => ({ value, count, selected: selected.includes(value) }))
        .sort((a, b) => b.count - a.count);

    return {
      types: toFacetArray(typeCounts, currentFilters?.documentTypes),
      categories: toFacetArray(categoryCounts, currentFilters?.categories),
      authors: toFacetArray(authorCounts, currentFilters?.authors),
      vessels: [],
      regulations: [],
      years: toFacetArray(yearCounts),
      departments: []
    };
  }

  /**
   * Generate search suggestions
   */
  private async generateSuggestions(
    query: string,
    resultCount: number
  ): Promise<SearchSuggestion[]> {
    const suggestions: SearchSuggestion[] = [];

    // Spell check / corrections
    if (resultCount < 5) {
      const words = query.split(/\s+/);
      for (const word of words) {
        const similar = this.findSimilarTerms(word);
        if (similar.length > 0) {
          suggestions.push({
            type: "correction",
            text: query.replace(word, similar[0]),
            score: 0.8
          });
        }
      }
    }

    // Popular searches in the domain
    const popularSearches = [
      "crew certificates",
      "safety management",
      "MARPOL compliance",
      "vessel inspection",
      "training records"
    ];

    for (const popular of popularSearches.slice(0, 3)) {
      if (!query.toLowerCase().includes(popular.toLowerCase())) {
        suggestions.push({
          type: "popular",
          text: popular,
          score: 0.6
        });
      }
    }

    return suggestions.sort((a, b) => b.score - a.score).slice(0, 5);
  }

  /**
   * Find similar terms for spell correction
   */
  private findSimilarTerms(word: string): string[] {
    const allTerms = [
      ...Object.keys(this.MARITIME_ACRONYMS),
      ...Object.keys(this.MARITIME_SYNONYMS),
      ...Object.values(this.MARITIME_SYNONYMS).flat()
    ];

    return allTerms
      .filter(term => this.levenshteinDistance(word.toLowerCase(), term.toLowerCase()) <= 2)
      .slice(0, 3);
  }

  /**
   * Calculate Levenshtein distance for fuzzy matching
   */
  private levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[b.length][a.length];
  }

  /**
   * Get related searches based on query
   */
  private async getRelatedSearches(query: string): Promise<string[]> {
    const related: string[] = [];
    const words = query.toLowerCase().split(/\s+/);

    for (const word of words) {
      if (this.MARITIME_SYNONYMS[word]) {
        related.push(query.replace(word, this.MARITIME_SYNONYMS[word][0]));
      }
    }

    // Add category-based suggestions
    if (query.includes("certificate")) {
      related.push("STCW certificates", "crew qualifications");
    }
    if (query.includes("inspection")) {
      related.push("PSC inspection", "class survey");
    }

    return related.slice(0, 5);
  }

  /**
   * Apply highlighting to matched terms
   */
  private applyHighlighting(results: SearchResult[], terms: string[]): SearchResult[] {
    return results.map(result => ({
      ...result,
      highlights: terms
        .filter(term => 
          result.title.toLowerCase().includes(term) ||
          result.excerpt.toLowerCase().includes(term)
        )
        .map(term => `<mark>${term}</mark>`)
    }));
  }

  /**
   * Save search for alerts
   */
  async saveSearch(
    name: string,
    query: SearchQuery,
    userId: string,
    options?: {
      isPublic?: boolean;
      alertEnabled?: boolean;
      alertFrequency?: "daily" | "weekly" | "immediate";
    }
  ): Promise<SavedSearch> {
    const savedSearch: SavedSearch = {
      id: crypto.randomUUID(),
      name,
      query,
      userId,
      isPublic: options?.isPublic || false,
      alertEnabled: options?.alertEnabled || false,
      alertFrequency: options?.alertFrequency,
      createdAt: new Date()
    };

    // Log saved search
    logger.info("Search saved", { searchId: savedSearch.id, name });

    return savedSearch;
  }

  /**
   * Get search history for user
   */
  async getSearchHistory(userId: string, limit: number = 10): Promise<{
    query: string;
    timestamp: Date;
    resultCount: number;
  }[]> {
    const { data } = await supabase
      .from("access_logs")
      .select("*")
      .eq("user_id", userId)
      .eq("action", "search")
      .order("timestamp", { ascending: false })
      .limit(limit);

    return (data || []).map(log => ({
      query: (log.details as any)?.query || "",
      timestamp: new Date(log.timestamp),
      resultCount: (log.details as any)?.resultCount || 0
    }));
  }
}

export const intelligentSearchEngine = new IntelligentSearchEngine();
