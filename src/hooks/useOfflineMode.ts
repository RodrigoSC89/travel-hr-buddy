/**
 * useOfflineMode Hook
 * PATCH v12: isOnline sempre true - navigator.onLine não é confiável no iOS PWA
 */

import { useState, useEffect, useCallback } from 'react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { logger } from '@/lib/logger';

interface OfflineData {
  key: string;
  data: unknown;
  timestamp: number;
  expiresAt?: number;
}

const CACHE_PREFIX = 'offline_cache_';
const DEFAULT_TTL = 30 * 60 * 1000; // 30 minutos

/**
 * Hook para gerenciar modo offline com cache local
 * PATCH v12: isOnline sempre true
 */
export function useOfflineMode() {
  const [pendingSync, setPendingSync] = useState<string[]>([]);

  // PATCH v12: Sempre online
  const isOnline = true;

  /**
   * Salvar dados no cache local
   */
  const cacheData = useCallback((key: string, data: unknown, ttlMs = DEFAULT_TTL) => {
    try {
      const cacheItem: OfflineData = {
        key,
        data,
        timestamp: Date.now(),
        expiresAt: Date.now() + ttlMs,
      };
      sessionStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(cacheItem));
      return true;
    } catch (error) {
      logger.warn('[Offline] Erro ao salvar cache:', { error });
      return false;
    }
  }, []);

  /**
   * Recuperar dados do cache local
   */
  const getCachedData = useCallback(<T>(key: string): T | null => {
    try {
      const item = sessionStorage.getItem(`${CACHE_PREFIX}${key}`);
      if (!item) return null;

      const cached: OfflineData = JSON.parse(item);
      
      // Verificar expiração
      if (cached.expiresAt && cached.expiresAt < Date.now()) {
        sessionStorage.removeItem(`${CACHE_PREFIX}${key}`);
        return null;
      }

      return cached.data as T;
    } catch {
      return null;
    }
  }, []);

  /**
   * Limpar cache expirado
   */
  const clearExpiredCache = useCallback(() => {
    const keys = Object.keys(sessionStorage).filter(k => k.startsWith(CACHE_PREFIX));
    let cleared = 0;

    keys.forEach(key => {
      try {
        const item = sessionStorage.getItem(key);
        if (item) {
          const cached: OfflineData = JSON.parse(item);
          if (cached.expiresAt && cached.expiresAt < Date.now()) {
            sessionStorage.removeItem(key);
            cleared++;
          }
        }
      } catch {
        localStorage.removeItem(key);
        cleared++;
      }
    });

    return cleared;
  }, []);

  /**
   * Adicionar item à fila de sync
   */
  const addToSyncQueue = useCallback((key: string) => {
    setPendingSync(prev => [...new Set([...prev, key])]);
  }, []);

  /**
   * Remover item da fila de sync
   */
  const removeFromSyncQueue = useCallback((key: string) => {
    setPendingSync(prev => prev.filter(k => k !== key));
  }, []);

  return {
    isOnline: true, // PATCH v12: Sempre true
    isOffline: false, // PATCH v12: Sempre false
    cacheData,
    getCachedData,
    clearExpiredCache,
    pendingSync,
    addToSyncQueue,
    removeFromSyncQueue,
    hasPendingSync: pendingSync.length > 0,
  };
}

/**
 * Hook para fetch com fallback offline
 * PATCH v12: Sempre tenta fetch primeiro, usa cache como fallback em caso de erro
 */
export function useOfflineFetch<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options?: { ttlMs?: number; enabled?: boolean }
) {
  const { cacheData, getCachedData } = useOfflineMode();
  const [data, setData] = useState<T | null>(() => getCachedData<T>(key));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isFromCache, setIsFromCache] = useState(false);

  const fetch = useCallback(async () => {
    if (options?.enabled === false) return;

    setIsLoading(true);
    setError(null);

    // PATCH v12: Sempre tentar fetch primeiro
    try {
      const result = await fetchFn();
      setData(result);
      setIsFromCache(false);
      cacheData(key, result, options?.ttlMs);
    } catch (err) {
      // Tentar cache em caso de erro de rede
      const cached = getCachedData<T>(key);
      if (cached) {
        setData(cached);
        setIsFromCache(true);
      } else {
        setError(err instanceof Error ? err : new Error('Erro ao carregar dados'));
      }
    } finally {
      setIsLoading(false);
    }
  }, [key, fetchFn, cacheData, getCachedData, options?.enabled, options?.ttlMs]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return {
    data,
    isLoading,
    error,
    isFromCache,
    refetch: fetch,
  };
}
