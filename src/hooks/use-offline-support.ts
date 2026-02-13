/**
 * Use Offline Support Hook
 * Provides offline-aware data fetching and mutations
 * PATCH iOS PWA v14: Never block based on navigator.onLine - it's unreliable
 */

import { useState, useCallback, useEffect } from 'react';
import { offlineQueue, fetchWithOfflineSupport } from '@/lib/performance/offline-queue';
import { toast } from 'sonner';

interface UseOfflineMutationOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  onOfflineQueue?: () => void;
  successMessage?: string;
  errorMessage?: string;
  offlineMessage?: string;
}

export function useOfflineMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: UseOfflineMutationOptions<TData> = {}
) {
  const [isPending, setIsPending] = useState(false);
  const [isQueued, setIsQueued] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<TData | null>(null);

  const {
    onSuccess,
    onError,
    onOfflineQueue,
    successMessage = 'Operação realizada com sucesso',
    errorMessage = 'Erro ao realizar operação',
    offlineMessage = 'Salvo localmente. Será sincronizado automaticamente.'
  } = options;

  const mutate = useCallback(async (variables: TVariables) => {
    setIsPending(true);
    setError(null);
    setIsQueued(false);

    try {
      // PATCH iOS PWA v14: Always try to execute - never check navigator.onLine first
      const result = await mutationFn(variables);
      setData(result);
      
      // Check if the result indicates it was queued
      if (result && typeof result === 'object' && 'queued' in result) {
        setIsQueued(true);
        toast.info(offlineMessage);
        onOfflineQueue?.();
      } else {
        toast.success(successMessage);
        onSuccess?.(result);
      }
      
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      
      // PATCH iOS PWA v14: Check if it looks like a network error
      const errorMessage = error.message.toLowerCase();
      const isNetworkError = 
        errorMessage.includes('network') ||
        errorMessage.includes('fetch') ||
        errorMessage.includes('connection') ||
        errorMessage.includes('timeout') ||
        errorMessage.includes('failed to fetch');
      
      if (isNetworkError) {
        setIsQueued(true);
        toast.info(offlineMessage);
        onOfflineQueue?.();
      } else {
        toast.error(options.errorMessage || 'Erro ao realizar operação');
        onError?.(error);
      }
      
      throw error;
    } finally {
      setIsPending(false);
    }
  }, [mutationFn, onSuccess, onError, onOfflineQueue, successMessage, offlineMessage, options.errorMessage]);

  return {
    mutate,
    isPending,
    isQueued,
    error,
    data,
    reset: () => {
      setError(null);
      setData(null);
      setIsQueued(false);
    }
  };
}

/**
 * Hook for offline-aware data fetching
 * PATCH iOS PWA v14: Never block based on navigator.onLine
 */
export function useOfflineData<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options: {
    staleTime?: number;
    cacheTime?: number;
    enabled?: boolean;
  } = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isStale, setIsStale] = useState(false);

  const { staleTime = 5 * 60 * 1000, enabled = true } = options;

  const fetchData = useCallback(async (showLoading = true) => {
    if (!enabled) return;
    
    if (showLoading) setIsLoading(true);
    setError(null);

    try {
      // Try to get cached data first
      const cached = sessionStorage.getItem(`offline-cache:${key}`);
      if (cached) {
        const { data: cachedData, timestamp } = JSON.parse(cached);
        const isExpired = Date.now() - timestamp > staleTime;
        
        setData(cachedData);
        setIsStale(isExpired);
        
        if (!isExpired) {
          setIsLoading(false);
          // Still try to fetch fresh data in background
        }
      }

      // PATCH iOS PWA v14: Always try to fetch - never check navigator.onLine
      try {
        const freshData = await fetchFn();
        setData(freshData);
        setIsStale(false);
        
        // Cache the data
        sessionStorage.setItem(`offline-cache:${key}`, JSON.stringify({
          data: freshData,
          timestamp: Date.now()
        }));
      } catch (fetchError) {
        // If fetch fails and we have cached data, use it
        if (!data && cached) {
          const { data: cachedData } = JSON.parse(cached);
          setData(cachedData);
          setIsStale(true);
        } else if (!data) {
          throw fetchError;
        }
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch');
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, [key, fetchFn, enabled, staleTime, data]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Refetch when coming back online
  useEffect(() => {
    const handleOnline = () => {
      if (isStale) {
        fetchData(false);
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [fetchData, isStale]);

  return {
    data,
    isLoading,
    error,
    isStale,
    refetch: () => fetchData(true)
  };
}

/**
 * Hook for pending offline actions count
 */
export function usePendingActionsCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    offlineQueue.getPendingCount().then(setCount);
    const unsubscribe = offlineQueue.onQueueChange(setCount);
    return unsubscribe;
  }, []);

  return count;
}
