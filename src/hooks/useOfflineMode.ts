import { useState, useEffect, useCallback } from "react";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";

interface OfflineData {
  key: string;
  data: unknown;
  timestamp: number;
  expiresAt?: number;
}

const CACHE_PREFIX = "offline_cache_";
const DEFAULT_TTL = 30 * 60 * 1000; // 30 minutos

/**
 * Hook para gerenciar modo offline com cache local
 */
export function useOfflineMode() {
  const { isOnline } = useNetworkStatus();
  const [pendingSync, setPendingSync] = useState<string[]>([]);

  // Verificar itens pendentes de sync ao reconectar
  useEffect(() => {
    if (isOnline && pendingSync.length > 0) {
    }
  }, [isOnline, pendingSync]);

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
      localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(cacheItem));
      return true;
    } catch (error) {
      console.warn("[Offline] Erro ao salvar cache:", error);
      console.warn("[Offline] Erro ao salvar cache:", error);
      return false;
    }
  }, []);

  /**
   * Recuperar dados do cache local
   */
  const getCachedData = useCallback(<T>(key: string): T | null => {
    try {
      const item = localStorage.getItem(`${CACHE_PREFIX}${key}`);
      if (!item) return null;

      const cached: OfflineData = JSON.parse(item);
      
      // Verificar expiração
      if (cached.expiresAt && cached.expiresAt < Date.now()) {
        localStorage.removeItem(`${CACHE_PREFIX}${key}`);
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
    const keys = Object.keys(localStorage).filter(k => k.startsWith(CACHE_PREFIX));
    let cleared = 0;

    keys.forEach(key => {
      try {
        const item = localStorage.getItem(key);
        if (item) {
          const cached: OfflineData = JSON.parse(item);
          if (cached.expiresAt && cached.expiresAt < Date.now()) {
            localStorage.removeItem(key);
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
    isOnline,
    isOffline: !isOnline,
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
 */
export function useOfflineFetch<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options?: { ttlMs?: number; enabled?: boolean }
) {
  const { isOnline, cacheData, getCachedData } = useOfflineMode();
  const [data, setData] = useState<T | null>(() => getCachedData<T>(key));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isFromCache, setIsFromCache] = useState(false);

  const fetch = useCallback(async () => {
    if (options?.enabled === false) return;

    setIsLoading(true);
    setError(null);

    // Se offline, usar cache
    if (!isOnline) {
      const cached = getCachedData<T>(key);
      if (cached) {
        setData(cached);
        setIsFromCache(true);
        setIsLoading(false);
        return;
      }
      setError(new Error("Sem conexão e sem dados em cache"));
      setIsLoading(false);
      return;
    }

    try {
      const result = await fetchFn();
      setData(result);
      setIsFromCache(false);
      cacheData(key, result, options?.ttlMs);
    } catch (err) {
      // Tentar cache em caso de erro
      const cached = getCachedData<T>(key);
      if (cached) {
        setData(cached);
        setIsFromCache(true);
      } else {
        setError(err instanceof Error ? err : new Error("Erro desconhecido"));
      }
    } finally {
      setIsLoading(false);
    }
  }, [key, fetchFn, isOnline, cacheData, getCachedData, options?.enabled, options?.ttlMs]);

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
