/**
 * PATCH 636: AI Navigation Hook
 * Provides intelligent navigation suggestions based on user behavior
 * Fully typed with navigation_history and module_access_log tables
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import type { Database } from "@/integrations/supabase/types";
import { logger } from '@/lib/logger';

type NavigationHistoryRow = Database["public"]["Tables"]["navigation_history"]["Row"];
type NavigationHistoryInsert = Database["public"]["Tables"]["navigation_history"]["Insert"];
type ModuleAccessInsert = Database["public"]["Tables"]["module_access_log"]["Insert"];

interface NavigationSuggestion {
  module: string;
  confidence: number;
  reason: string;
}

export function useAINavigation() {
  const { user } = useAuth();

  // Track current navigation
  useEffect(() => {
    const trackNavigation = async () => {
      if (!user) return;

      const currentPath = window.location.pathname;
      const previousPath = sessionStorage.getItem("previousPath");

      if (previousPath && previousPath !== currentPath) {
        try {
          const payload: NavigationHistoryInsert = {
            user_id: user.id,
            module_path: currentPath,
            module_name: currentPath.split('/').pop() || 'unknown',
            metadata: { from_path: previousPath },
          };

          await supabase.from("navigation_history").insert(payload);
        } catch (error) {
          logger.error("Failed to track navigation:", error);
        }
      }

      sessionStorage.setItem("previousPath", currentPath);
    };

    trackNavigation();
  }, [user]);

  // Get navigation suggestions
  const { data: suggestions = [] } = useQuery({
    queryKey: ["ai-navigation-suggestions", user?.id],
    queryFn: async (): Promise<NavigationSuggestion[]> => {
      if (!user) return [];

      try {
        // Get user's navigation history
        const { data: history, error } = await supabase
          .from("navigation_history")
          .select("*")
          .eq("user_id", user.id)
          .order("last_visited_at", { ascending: false })
          .limit(100);

        if (error) throw error;

        return analyzePatternsAndSuggest(history || []);
      } catch (error) {
        logger.error("Failed to get navigation suggestions:", error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!user,
  });

  return { suggestions };
}

function analyzePatternsAndSuggest(history: NavigationHistoryRow[]): NavigationSuggestion[] {
  if (history.length === 0) return [];

  const suggestions: NavigationSuggestion[] = [];
  const currentPath = window.location.pathname;

  // Analyze navigation patterns
  const patterns = new Map<string, number>();

  for (let i = 0; i < history.length - 1; i++) {
    const metadata = history[i].metadata as Record<string, unknown> | null;
    const fromPath = metadata?.from_path as string | undefined;
    
    if (fromPath === currentPath) {
      const nextPath = history[i].module_path;
      patterns.set(nextPath, (patterns.get(nextPath) || 0) + 1);
    }
  }

  // Convert patterns to suggestions
  const totalTransitions = Array.from(patterns.values()).reduce((sum, count) => sum + count, 0);

  if (totalTransitions === 0) return [];

  patterns.forEach((count, path) => {
    const confidence = count / totalTransitions;
    if (confidence > 0.2) {
      // Only suggest if confidence > 20%
      suggestions.push({
        module: path,
        confidence,
        reason: `You usually access '${path}' after visiting this page`,
      });
    }
  });

  // Sort by confidence
  return suggestions.sort((a, b) => b.confidence - a.confidence).slice(0, 5);
}

/**
 * Hook to record module access for analytics
 */
export function useRecordModuleAccess(moduleName: string) {
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !moduleName) return;

    const recordAccess = async () => {
      try {
        const payload: ModuleAccessInsert = {
          user_id: user.id,
          module_name: moduleName,
        };

        await supabase.from("module_access_log").insert(payload);
      } catch (error) {
        logger.error("Failed to record module access:", error);
      }
    };

    recordAccess();
  }, [user, moduleName]);
}
