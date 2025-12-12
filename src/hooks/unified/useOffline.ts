/**
 * PATCH 178.0 - Unified Offline Hook
 * Fusão de: use-offline-mutation.ts, use-offline-support.ts, use-offline-storage.ts
 * 
 * Provides offline-aware data fetching, mutations, and storage
 */

import { useState, useCallback, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useToast } from "@/hooks/use-toast";

// =============================================================================
// TYPES
// =============================================================================

export interface OfflineMutationOptions<TData, TVariables> {
  /** Mutation function */
  mutationFn: (variables: TVariables) => Promise<TData>;
  /** Action type for sync queue */
  actionType?: string;
  /** Show toast notifications */
  showToasts?: boolean;
  /** Success message */
  successMessage?: string;
  /** Error message */
  errorMessage?: string;
  /** Offline queue message */
  offlineMessage?: string;
  /** Called on success */
  onSuccess?: (data: TData, variables: TVariables) => void;
  /** Called on error */
  onError?: (error: Error, variables: TVariables) => void;
  /** Called when action is queued offline */
  onOfflineQueue?: () => void;
}

export interface OfflineDataOptions<T> {
  /** Cache key */
  key: string;
  /** Fetch function */
  fetchFn: () => Promise<T>;
  /** Stale time in ms */
  staleTime?: number;
  /** Cache time in ms */
  cacheTime?: number;
  /** Enable fetching */
  enabled?: boolean;
}

// =============================================================================
// OFFLINE QUEUE
// =============================================================================

interface QueuedAction {
  id: string;
  actionType: string;
  variables: unknown;
  timestamp: number;
}

class OfflineQueue {
  private readonly STORAGE_KEY = "offline_queue";

  async add(actionType: string, variables: unknown): Promise<void> {
    const queue = await this.getQueue();
    queue.push({
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      actionType,
      variables,
      timestamp: Date.now(),
    });
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(queue));
    this.notifyChange();
  }

  async getQueue(): Promise<QueuedAction[]> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  async getPendingCount(): Promise<number> {
    const queue = await this.getQueue();
    return queue.length;
  }

  async clear(): Promise<void> {
    localStorage.removeItem(this.STORAGE_KEY);
    this.notifyChange();
  }

  async remove(id: string): Promise<void> {
    const queue = await this.getQueue();
    const filtered = queue.filter(item => item.id !== id);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
    this.notifyChange();
  }

  private listeners: ((count: number) => void)[] = [];

  onQueueChange(callback: (count: number) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    });
  }

  private async notifyChange(): Promise<void> {
    const count = await this.getPendingCount();
    this.listeners.forEach(l => l(count));
  }
}

export const offlineQueue = new OfflineQueue();

// =============================================================================
// MAIN HOOKS
// =============================================================================

/**
 * Unified offline-aware mutation hook
 * Automatically queues mutations when offline
 */
export function useOfflineMutation<TData = unknown, TVariables = unknown>(
  options: OfflineMutationOptions<TData, TVariables>
) {
  const { toast: legacyToast } = useToast();
  
  const {
    mutationFn,
    actionType = "generic",
    showToasts = true,
    successMessage = "Operação realizada com sucesso",
    errorMessage = "Erro ao realizar operação",
    offlineMessage = "Você está offline. A operação será realizada quando reconectar.",
    onSuccess,
    onError,
    onOfflineQueue,
  } = options;

  const [isQueued, setIsQueued] = useState(false);

  return useMutation({
    mutationFn: async (variables: TVariables) => {
      // If offline, queue the action
      if (!navigator.onLine) {
        await offlineQueue.add(actionType, variables);
        setIsQueued(true);
        
        if (showToasts) {
          toast.info(offlineMessage);
        }
        
        onOfflineQueue?.();
        return { queued: true } as any;
      }
      
      // If online, execute normally
      return mutationFn(variables);
    },
    onSuccess: (data, variables) => {
      if ((data as any)?.queued) return;
      
      setIsQueued(false);
      if (showToasts) {
        toast.success(successMessage);
      }
      onSuccess?.(data, variables);
    },
    onError: (error, variables) => {
      // If the error is due to network, queue the action
      if (!navigator.onLine) {
        offlineQueue.add(actionType, variables);
        setIsQueued(true);
        
        if (showToasts) {
          toast.info(offlineMessage);
        }
        
        onOfflineQueue?.();
        return;
      }
      
      if (showToasts) {
        toast.error(errorMessage);
      }
      onError?.(error instanceof Error ? error : new Error(String(error)), variables);
    },
    meta: {
      isQueued,
    },
  });
}

/**
 * Hook for offline-aware data fetching with caching
 */
export function useOfflineData<T>(options: OfflineDataOptions<T>) {
  const { key, fetchFn, staleTime = 5 * 60 * 1000, enabled = true } = options;
  
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isStale, setIsStale] = useState(false);

  const fetchData = useCallback(async (showLoading = true) => {
    if (!enabled) return;
    
    if (showLoading) setIsLoading(true);
    setError(null);

    try {
      // Try to get cached data first
      const cached = localStorage.getItem(`offline-cache:${key}`);
      if (cached) {
        const { data: cachedData, timestamp } = JSON.parse(cached);
        const isExpired = Date.now() - timestamp > staleTime;
        
        if (!isExpired || !navigator.onLine) {
          setData(cachedData);
          setIsStale(isExpired);
          
          if (!isExpired) {
            setIsLoading(false);
            return;
          }
        }
      }

      // Fetch fresh data if online
      if (navigator.onLine) {
        const freshData = await fetchFn();
        setData(freshData);
        setIsStale(false);
        
        // Cache the data
        localStorage.setItem(`offline-cache:${key}`, JSON.stringify({
          data: freshData,
          timestamp: Date.now()
        }));
      } else if (!data) {
        throw new Error("No cached data available offline");
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch");
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
    });

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [fetchData, isStale]);

  return {
    data,
    isLoading,
    error,
    isStale,
    refetch: () => fetchData(true),
  };
}

/**
 * Hook for pending offline actions count
 */
export function usePendingActionsCount(): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    offlineQueue.getPendingCount().then(setCount);
    const unsubscribe = offlineQueue.onQueueChange(setCount);
    return unsubscribe;
  }, []);

  return count;
}

// =============================================================================
// OFFLINE STORAGE
// =============================================================================

/**
 * Hook for offline storage operations
 */
export function useOfflineStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(`offline-storage:${key}`);
      return stored ? JSON.parse(stored) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setStoredValue = useCallback((newValue: T | ((prev: T) => T)) => {
    setValue(prev => {
      const resolvedValue = typeof newValue === "function" 
        ? (newValue as (prev: T) => T)(prev) 
        : newValue;
      localStorage.setItem(`offline-storage:${key}`, JSON.stringify(resolvedValue));
      return resolvedValue;
    });
  }, [key]);

  const removeValue = useCallback(() => {
    localStorage.removeItem(`offline-storage:${key}`);
    setValue(initialValue);
  }, [key, initialValue]);

  return {
    value,
    setValue: setStoredValue,
    removeValue,
  };
}

export default useOfflineMutation;
