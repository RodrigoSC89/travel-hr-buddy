// @ts-nocheck
/**
 * PATCH 506: AI Memory Hook
 * React hook for managing AI memory in components
 */

import { useState, useCallback } from "react";
import { 
  storeAIMemory, 
  retrieveSimilarMemories, 
  getRecentMemories,
  getMemoryStats,
  AIMemoryEvent,
  SimilarMemory 
} from "@/services/ai-memory-service";

interface UseAIMemoryReturn {
  storeMemory: (memory: AIMemoryEvent) => Promise<boolean>;
  retrieveMemories: (query: string, threshold?: number, count?: number) => Promise<SimilarMemory[]>;
  getRecent: (limit?: number, contextType?: string) => Promise<AIMemoryEvent[]>;
  getStats: () => Promise<{ total: number; byType: Record<string, number>; avgRelevance: number }>;
  loading: boolean;
  error: string | null;
}

/**
 * Hook for managing AI memory operations
 */
export function useAIMemory(): UseAIMemoryReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const storeMemory = useCallback(async (memory: AIMemoryEvent): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const result = await storeAIMemory(memory);
      
      if (!result.success) {
        setError(result.error || "Failed to store memory");
        return false;
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const retrieveMemories = useCallback(async (
    query: string, 
    threshold: number = 0.7, 
    count: number = 5
  ): Promise<SimilarMemory[]> => {
    setLoading(true);
    setError(null);

    try {
      const memories = await retrieveSimilarMemories(query, threshold, count);
      return memories;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getRecent = useCallback(async (
    limit: number = 10, 
    contextType?: string
  ): Promise<AIMemoryEvent[]> => {
    setLoading(true);
    setError(null);

    try {
      const memories = await getRecentMemories(limit, contextType);
      return memories;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const stats = await getMemoryStats();
      return stats;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      return { total: 0, byType: {}, avgRelevance: 0 };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    storeMemory,
    retrieveMemories,
    getRecent,
    getStats,
    loading,
    error,
  };
}
