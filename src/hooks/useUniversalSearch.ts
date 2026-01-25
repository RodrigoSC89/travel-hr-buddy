/**
 * Hook: useUniversalSearch
 * PATCH 1000 - Busca universal com IA
 */

import { useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logger } from "@/lib/logger";

interface SearchResult {
  type: "route" | "action" | "document" | "ai";
  label: string;
  path: string;
  score: number;
  category: string;
  description?: string;
}

interface AISuggestion {
  intent: string;
  route: string;
  label: string;
  explanation: string;
}

interface UseUniversalSearchReturn {
  results: SearchResult[];
  aiSuggestion: AISuggestion | null;
  isLoading: boolean;
  search: (query: string) => Promise<void>;
  clearResults: () => void;
  recentSearches: string[];
  addToRecent: (query: string) => void;
}

const RECENT_SEARCHES_KEY = "nautilus_recent_searches";
const MAX_RECENT_SEARCHES = 5;

export function useUniversalSearch(): UseUniversalSearchReturn {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [aiSuggestion, setAiSuggestion] = useState<AISuggestion | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  
  const abortControllerRef = useRef<AbortController | null>(null);

  const search = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      setAiSuggestion(null);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("universal-ai-search", {
        body: {
          type: "search",
          query,
        },
      });

      if (error) {
        if (error.message?.includes("429")) {
          toast.error("Limite de requisições atingido. Aguarde um momento.");
        } else if (error.message?.includes("402")) {
          toast.error("Créditos de IA insuficientes.");
        } else {
          logger.warn("[UniversalSearch] Error", { error });
        }
        return;
      }

      setResults(data.results || []);
      setAiSuggestion(data.aiSuggestion || null);

    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        logger.warn("[UniversalSearch] Request failed", { error: String(error) });
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setAiSuggestion(null);
  }, []);

  const addToRecent = useCallback((query: string) => {
    if (!query.trim()) return;
    
    setRecentSearches(prev => {
      const newSearches = [query, ...prev.filter(s => s !== query)].slice(0, MAX_RECENT_SEARCHES);
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(newSearches));
      } catch {
        // Ignore localStorage errors
      }
      return newSearches;
    });
  }, []);

  return {
    results,
    aiSuggestion,
    isLoading,
    search,
    clearResults,
    recentSearches,
    addToRecent,
  };
}

export default useUniversalSearch;
