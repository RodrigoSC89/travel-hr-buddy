/**
 * Offline Manager - Gerenciamento de cache para ambiente offshore
 * Otimiza experiência em conexões lentas ou instáveis
 */

interface CacheConfig {
  maxAge: number; // em segundos
  strategy: 'cache-first' | 'network-first' | 'cache-only';
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  maxAge: number;
}

class OfflineManager {
  private storage: Map<string, CacheEntry<any>> = new Map();
  private readonly STORAGE_KEY = 'nautilus-offline-cache';

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Armazena dados no cache com estratégia de expiração
   */
  set<T>(key: string, data: T, config: CacheConfig): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      maxAge: config.maxAge * 1000, // converter para ms
    };

    this.storage.set(key, entry);
    this.saveToStorage();
  }

  /**
   * Recupera dados do cache
   */
  get<T>(key: string): T | null {
    const entry = this.storage.get(key);

    if (!entry) {
      return null;
    }

    // Verifica se o cache expirou
    const isExpired = Date.now() - entry.timestamp > entry.maxAge;
    
    if (isExpired) {
      this.storage.delete(key);
      this.saveToStorage();
      return null;
    }

    return entry.data as T;
  }

  /**
   * Verifica se há dados válidos em cache
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Remove entrada específica do cache
   */
  delete(key: string): void {
    this.storage.delete(key);
    this.saveToStorage();
  }

  /**
   * Limpa todo o cache
   */
  clear(): void {
    this.storage.clear();
    this.saveToStorage();
  }

  /**
   * Persiste cache em localStorage
   */
  private saveToStorage(): void {
    try {
      const data = Array.from(this.storage.entries());
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save cache to localStorage:', error);
    }
  }

  /**
   * Carrega cache do localStorage
   */
  private loadFromStorage(): void {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) {
        const entries = JSON.parse(data);
        this.storage = new Map(entries);
        
        // Limpa entradas expiradas
        this.cleanExpiredEntries();
      }
    } catch (error) {
      console.warn('Failed to load cache from localStorage:', error);
    }
  }

  /**
   * Remove entradas expiradas do cache
   */
  private cleanExpiredEntries(): void {
    const now = Date.now();
    let hasChanges = false;

    for (const [key, entry] of this.storage.entries()) {
      if (now - entry.timestamp > entry.maxAge) {
        this.storage.delete(key);
        hasChanges = true;
      }
    }

    if (hasChanges) {
      this.saveToStorage();
    }
  }

  /**
   * Retorna estatísticas do cache
   */
  getStats() {
    const entries = Array.from(this.storage.values());
    const totalSize = new Blob([JSON.stringify(entries)]).size;
    
    return {
      entries: this.storage.size,
      totalSize,
      totalSizeKB: (totalSize / 1024).toFixed(2),
    };
  }
}

export const offlineManager = new OfflineManager();

/**
 * Hook para fetch com cache automático
 */
export async function cachedFetch<T>(
  url: string,
  options?: RequestInit,
  cacheConfig: CacheConfig = { maxAge: 300, strategy: 'network-first' }
): Promise<T> {
  const cacheKey = `fetch:${url}`;

  // Cache-only: retorna apenas do cache
  if (cacheConfig.strategy === 'cache-only') {
    const cached = offlineManager.get<T>(cacheKey);
    if (cached) return cached;
    throw new Error('No cached data available');
  }

  // Cache-first: tenta cache primeiro
  if (cacheConfig.strategy === 'cache-first') {
    const cached = offlineManager.get<T>(cacheKey);
    if (cached) return cached;
  }

  // Network-first ou fallback de cache-first
  try {
    const response = await fetch(url, {
      ...options,
      signal: AbortSignal.timeout(15000), // 15s timeout para offshore
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    offlineManager.set(cacheKey, data, cacheConfig);
    return data;
  } catch (error) {
    // Em caso de erro de rede, tenta cache
    const cached = offlineManager.get<T>(cacheKey);
    if (cached) {
      console.warn('Network failed, using cached data:', url);
      return cached;
    }
    throw error;
  }
}
