import { CacheEntry } from './types';
import hubConfig from './hub_config.json';

const CACHE_KEY = 'nautilus_control_hub_cache';

export class HubCache {
  private config = hubConfig;

  /**
   * Salva dados no cache offline
   */
  salvar(dados: any, module: string): void {
    try {
      const cache = this.getCache();
      const entry: CacheEntry = {
        id: `${module}_${Date.now()}`,
        data: dados,
        timestamp: new Date(),
        synchronized: false,
        module: module,
      };

      cache.push(entry);

      // Verifica limite de tamanho
      const cacheSize = this.calculateSize(cache);
      if (cacheSize > this.config.cacheSizeLimit) {
        console.warn('💾 Cache limit reached. Removing oldest synchronized entries.');
        this.cleanup(cache);
      }

      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
      console.log(`💾 Dados armazenados localmente (modo offline) - ${module}`);
    } catch (error) {
      console.error('Erro ao salvar no cache:', error);
    }
  }

  /**
   * Obtém todos os dados do cache
   */
  getCache(): CacheEntry[] {
    try {
      const data = localStorage.getItem(CACHE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Erro ao ler cache:', error);
      return [];
    }
  }

  /**
   * Obtém dados pendentes de sincronização
   */
  getPending(): CacheEntry[] {
    return this.getCache().filter((entry) => !entry.synchronized);
  }

  /**
   * Marca entradas como sincronizadas
   */
  markAsSynchronized(ids: string[]): void {
    try {
      const cache = this.getCache();
      cache.forEach((entry) => {
        if (ids.includes(entry.id)) {
          entry.synchronized = true;
        }
      });
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch (error) {
      console.error('Erro ao marcar como sincronizado:', error);
    }
  }

  /**
   * Calcula tamanho do cache em bytes
   */
  private calculateSize(cache: CacheEntry[]): number {
    return new Blob([JSON.stringify(cache)]).size;
  }

  /**
   * Remove entradas sincronizadas antigas
   */
  private cleanup(cache: CacheEntry[]): void {
    // Remove entradas sincronizadas mais antigas
    const synchronized = cache.filter((e) => e.synchronized).sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    if (synchronized.length > 0) {
      // Remove 25% das entradas sincronizadas mais antigas
      const toRemove = Math.ceil(synchronized.length * 0.25);
      const idsToRemove = synchronized.slice(0, toRemove).map((e) => e.id);
      
      const newCache = cache.filter((e) => !idsToRemove.includes(e.id));
      localStorage.setItem(CACHE_KEY, JSON.stringify(newCache));
    }
  }

  /**
   * Obtém estatísticas do cache
   */
  getStats() {
    const cache = this.getCache();
    const size = this.calculateSize(cache);
    const pending = cache.filter((e) => !e.synchronized).length;

    return {
      total: cache.length,
      pending,
      synchronized: cache.length - pending,
      size,
      capacity: this.config.cacheSizeLimit,
      usagePercent: Math.round((size / this.config.cacheSizeLimit) * 100),
    };
  }

  /**
   * Limpa todo o cache
   */
  clear(): void {
    localStorage.removeItem(CACHE_KEY);
    console.log('💾 Cache limpo');
  }
}

export const hubCache = new HubCache();
