/**
 * AI Response Cache - PATCH 975
 * Semantic caching for AI responses with fast lookup
 */

interface CachedResponse {
  query: string;
  queryTokens: string[];
  response: string;
  metadata: {
    module: string;
    context?: string;
    timestamp: number;
    useCount: number;
    avgResponseTime: number;
  };
}

interface TemplateResponse {
  pattern: RegExp;
  template: string;
  variables: string[];
  priority: number;
}

class AIResponseCache {
  private cache: Map<string, CachedResponse> = new Map();
  private semanticIndex: Map<string, Set<string>> = new Map(); // token -> query keys
  private templates: TemplateResponse[] = [];
  private readonly MAX_CACHE_SIZE = 500;
  private readonly SIMILARITY_THRESHOLD = 0.7;
  
  constructor() {
    this.loadFromStorage();
    this.initializeTemplates();
  }
  
  /**
   * Initialize common response templates
   */
  private initializeTemplates(): void {
    this.templates = [
      {
        pattern: /como (criar|gerar|fazer) (um |uma )?(relatório|report)/i,
        template: 'Para criar um relatório, acesse o módulo de Relatórios no menu principal. Selecione o tipo de relatório desejado, defina o período e clique em "Gerar". O relatório pode ser exportado em PDF ou Excel.',
        variables: [],
        priority: 10
      },
      {
        pattern: /qual (é |o )?status (da |de )?manutenção/i,
        template: 'O status atual de manutenção pode ser consultado no Dashboard de Manutenção. Atualmente há {pendingCount} ordens pendentes e {criticalCount} itens críticos.',
        variables: ['pendingCount', 'criticalCount'],
        priority: 9
      },
      {
        pattern: /funcionários? (em |com )?atraso (de |no |em )?treinamento/i,
        template: 'Consultando registros de treinamento... Há {count} funcionários com certificações pendentes ou expiradas. Acesse o módulo de RH > Certificações para ver a lista completa.',
        variables: ['count'],
        priority: 8
      },
      {
        pattern: /próxim(a|o)s? vencimento(s)?/i,
        template: 'Os próximos vencimentos incluem: {items}. Recomendo agendar as renovações com antecedência.',
        variables: ['items'],
        priority: 7
      },
      {
        pattern: /resumo (do |da )?(dia|semana|mês)/i,
        template: 'Resumo do período: {summary}. Para mais detalhes, acesse o Dashboard Executivo.',
        variables: ['summary'],
        priority: 7
      }
    ];
  }
  
  /**
   * Check for template match first (fastest)
   */
  matchTemplate(query: string, variables: Record<string, string> = {}): string | null {
    for (const template of this.templates.sort((a, b) => b.priority - a.priority)) {
      if (template.pattern.test(query)) {
        let response = template.template;
        
        // Replace variables
        for (const varName of template.variables) {
          const value = variables[varName] || '{dados não disponíveis}';
          response = response.replace(`{${varName}}`, value);
        }
        
        return response;
      }
    }
    return null;
  }
  
  /**
   * Get cached response with semantic matching
   */
  get(query: string): CachedResponse | null {
    const normalizedQuery = this.normalizeQuery(query);
    
    // Exact match
    if (this.cache.has(normalizedQuery)) {
      const cached = this.cache.get(normalizedQuery)!;
      cached.metadata.useCount++;
      return cached;
    }
    
    // Semantic similarity match
    const tokens = this.tokenize(query);
    const candidates = this.findCandidates(tokens);
    
    let bestMatch: CachedResponse | null = null;
    let bestScore = 0;
    
    for (const candidateKey of candidates) {
      const candidate = this.cache.get(candidateKey);
      if (!candidate) continue;
      
      const similarity = this.calculateSimilarity(tokens, candidate.queryTokens);
      if (similarity > bestScore && similarity >= this.SIMILARITY_THRESHOLD) {
        bestScore = similarity;
        bestMatch = candidate;
      }
    }
    
    if (bestMatch) {
      bestMatch.metadata.useCount++;
    }
    
    return bestMatch;
  }
  
  /**
   * Cache a response
   */
  set(
    query: string,
    response: string,
    metadata: { module?: string; context?: string; responseTime?: number } = {}
  ): void {
    const normalizedQuery = this.normalizeQuery(query);
    const tokens = this.tokenize(query);
    
    // Check cache size and evict if needed
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      this.evictLeastUsed();
    }
    
    const entry: CachedResponse = {
      query: normalizedQuery,
      queryTokens: tokens,
      response,
      metadata: {
        module: metadata.module || 'general',
        context: metadata.context,
        timestamp: Date.now(),
        useCount: 1,
        avgResponseTime: metadata.responseTime || 0
      }
    };
    
    this.cache.set(normalizedQuery, entry);
    
    // Build semantic index
    for (const token of tokens) {
      if (!this.semanticIndex.has(token)) {
        this.semanticIndex.set(token, new Set());
      }
      this.semanticIndex.get(token)!.add(normalizedQuery);
    }
    
    this.saveToStorage();
  }
  
  /**
   * Find candidate queries based on shared tokens
   */
  private findCandidates(tokens: string[]): Set<string> {
    const candidates = new Set<string>();
    
    for (const token of tokens) {
      const matches = this.semanticIndex.get(token);
      if (matches) {
        for (const key of matches) {
          candidates.add(key);
        }
      }
    }
    
    return candidates;
  }
  
  /**
   * Calculate Jaccard similarity between token sets
   */
  private calculateSimilarity(tokens1: string[], tokens2: string[]): number {
    const set1 = new Set(tokens1);
    const set2 = new Set(tokens2);
    
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return intersection.size / union.size;
  }
  
  /**
   * Normalize query for caching
   */
  private normalizeQuery(query: string): string {
    return query
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
  
  /**
   * Tokenize query for semantic matching
   */
  private tokenize(query: string): string[] {
    const stopWords = new Set([
      'o', 'a', 'os', 'as', 'um', 'uma', 'de', 'da', 'do', 'em', 'no', 'na',
      'para', 'por', 'com', 'que', 'qual', 'como', 'e', 'ou', 'se', 'é', 'são'
    ]);
    
    return this.normalizeQuery(query)
      .split(' ')
      .filter(token => token.length > 2 && !stopWords.has(token));
  }
  
  /**
   * Evict least used entries
   */
  private evictLeastUsed(): void {
    const entries = Array.from(this.cache.entries())
      .sort((a, b) => a[1].metadata.useCount - b[1].metadata.useCount);
    
    const toRemove = Math.ceil(this.MAX_CACHE_SIZE * 0.2); // Remove 20%
    
    for (let i = 0; i < toRemove && i < entries.length; i++) {
      const [key, entry] = entries[i];
      this.cache.delete(key);
      
      // Clean semantic index
      for (const token of entry.queryTokens) {
        const tokenIndex = this.semanticIndex.get(token);
        if (tokenIndex) {
          tokenIndex.delete(key);
          if (tokenIndex.size === 0) {
            this.semanticIndex.delete(token);
          }
        }
      }
    }
    
  }
  
  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    topQueries: Array<{ query: string; useCount: number }>;
    byModule: Record<string, number>;
  } {
    const entries = Array.from(this.cache.values());
    const totalUses = entries.reduce((sum, e) => sum + e.metadata.useCount, 0);
    
    const byModule: Record<string, number> = {};
    for (const entry of entries) {
      byModule[entry.metadata.module] = (byModule[entry.metadata.module] || 0) + 1;
    }
    
    const topQueries = entries
      .sort((a, b) => b.metadata.useCount - a.metadata.useCount)
      .slice(0, 10)
      .map(e => ({ query: e.query, useCount: e.metadata.useCount }));
    
    return {
      size: this.cache.size,
      maxSize: this.MAX_CACHE_SIZE,
      hitRate: totalUses / Math.max(1, entries.length),
      topQueries,
      byModule
    };
  }
  
  /**
   * Clear cache for a specific module
   */
  clearModule(module: string): number {
    let cleared = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.metadata.module === module) {
        this.cache.delete(key);
        cleared++;
      }
    }
    
    this.saveToStorage();
    return cleared;
  }
  
  /**
   * Save cache to localStorage
   */
  private saveToStorage(): void {
    try {
      const data = Array.from(this.cache.entries());
      localStorage.setItem('ai_response_cache', JSON.stringify(data));
    } catch (e) {
      console.warn('[AICache] Failed to save to storage:', e);
      console.warn('[AICache] Failed to save to storage:', e);
    }
  }
  
  /**
   * Load cache from localStorage
   */
  private loadFromStorage(): void {
    try {
      const data = localStorage.getItem('ai_response_cache');
      if (data) {
        const entries: [string, CachedResponse][] = JSON.parse(data);
        this.cache = new Map(entries);
        
        // Rebuild semantic index
        for (const [key, entry] of entries) {
          for (const token of entry.queryTokens) {
            if (!this.semanticIndex.has(token)) {
              this.semanticIndex.set(token, new Set());
            }
            this.semanticIndex.get(token)!.add(key);
          }
        }
        
      }
    } catch (e) {
      console.warn('[AICache] Failed to load from storage:', e);
      console.warn('[AICache] Failed to load from storage:', e);
    }
  }
  
  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
    this.semanticIndex.clear();
    localStorage.removeItem('ai_response_cache');
  }
}

export const aiResponseCache = new AIResponseCache();

/**
 * Hook for using AI response cache
 */
export function useAICache() {
  return {
    getResponse: (query: string) => aiResponseCache.get(query),
    cacheResponse: (query: string, response: string, meta?: any) => 
      aiResponseCache.set(query, response, meta),
    matchTemplate: (query: string, vars?: Record<string, string>) => 
      aiResponseCache.matchTemplate(query, vars),
    stats: () => aiResponseCache.getStats(),
    clear: () => aiResponseCache.clear()
  };
}
