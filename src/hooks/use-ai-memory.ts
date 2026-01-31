/**
 * PATCH 506: AI Memory Hook
 * React hook for managing AI memory with Supabase persistence
 */

import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { logger } from '@/lib/logger';

export interface AIMemoryEvent {
  context: string;
  type: string;
  data: Record<string, unknown>;
}

export interface SimilarMemory extends AIMemoryEvent {
  similarity: number;
  id?: string;
}

interface UseAIMemoryReturn {
  storeMemory: (memory: AIMemoryEvent) => Promise<boolean>;
  retrieveMemories: (query: string, threshold?: number, count?: number) => Promise<SimilarMemory[]>;
  getRecent: (limit?: number, contextType?: string) => Promise<AIMemoryEvent[]>;
  getStats: () => Promise<{ total: number; byType: Record<string, number>; avgRelevance: number }>;
  loading: boolean;
  error: string | null;
}

/**
 * Hook for managing AI memory operations with Supabase persistence
 */
export function useAIMemory(): UseAIMemoryReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const storeMemory = useCallback(async (memory: AIMemoryEvent): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const { data: userData } = await supabase.auth.getUser();
      
      const { error: insertError } = await supabase
        .from("ai_memory_events")
        .insert([{
          event_type: memory.type,
          context: memory.context,
          event_data: memory.data as Json,
          user_id: userData?.user?.id || null,
          confidence: 1.0,
          metadata: { source: "useAIMemory" } as Json
        }]);

      if (insertError) {
        logger.error("Failed to store memory:", insertError);
        setError(insertError.message);
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
      // Simple text-based search (semantic search would require embeddings)
      const { data, error: searchError } = await supabase
        .from("ai_memory_events")
        .select("*")
        .or(`context.ilike.%${query}%,event_type.ilike.%${query}%`)
        .order("created_at", { ascending: false })
        .limit(count);

      if (searchError) {
        setError(searchError.message);
        return [];
      }

      return (data || []).map(item => ({
        id: item.id,
        context: item.context || "",
        type: item.event_type,
        data: (item.event_data as Record<string, unknown>) || {},
        similarity: item.confidence || threshold
      }));
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
      let query = supabase
        .from("ai_memory_events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (contextType) {
        query = query.eq("event_type", contextType);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        setError(fetchError.message);
        return [];
      }

      return (data || []).map(item => ({
        context: item.context || "",
        type: item.event_type,
        data: (item.event_data as Record<string, unknown>) || {}
      }));
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
      const { data, error: statsError } = await supabase
        .from("ai_memory_events")
        .select("event_type, confidence");

      if (statsError) {
        setError(statsError.message);
        return { total: 0, byType: {}, avgRelevance: 0 };
      }

      const byType: Record<string, number> = {};
      let totalConfidence = 0;

      (data || []).forEach(item => {
        byType[item.event_type] = (byType[item.event_type] || 0) + 1;
        totalConfidence += item.confidence || 0;
      });

      return {
        total: data?.length || 0,
        byType,
        avgRelevance: data?.length ? totalConfidence / data.length : 0
      };
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
