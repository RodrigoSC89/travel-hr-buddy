// @ts-nocheck
/**
 * PATCH 636: AI Navigation Hook
 * Provides intelligent navigation suggestions based on user behavior
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

interface NavigationEntry {
  from: string;
  to: string;
  timestamp: string;
}

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
          await supabase.from("navigation_history").insert({
            user_id: user.id,
            from_path: previousPath,
            to_path: currentPath,
            timestamp: new Date().toISOString(),
          });
        } catch (error) {
          console.error("Failed to track navigation:", error);
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
          .order("timestamp", { ascending: false })
          .limit(100);

        if (error) throw error;

        return analyzePatternsAndSuggest(history || []);
      } catch (error) {
        console.error("Failed to get navigation suggestions:", error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!user,
  });

  return { suggestions };
}

function analyzePatternsAndSuggest(history: any[]): NavigationSuggestion[] {
  if (history.length === 0) return [];

  const suggestions: NavigationSuggestion[] = [];
  const currentPath = window.location.pathname;

  // Analyze navigation patterns
  const patterns = new Map<string, number>();

  for (let i = 0; i < history.length - 1; i++) {
    if (history[i].from_path === currentPath) {
      const nextPath = history[i].to_path;
      patterns.set(nextPath, (patterns.get(nextPath) || 0) + 1);
    }
  }

  // Convert patterns to suggestions
  const totalTransitions = Array.from(patterns.values()).reduce((sum, count) => sum + count, 0);

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
        await supabase.from("module_access_log").insert({
          user_id: user.id,
          module_name: moduleName,
          accessed_at: new Date().toISOString(),
        });
      } catch (error) {
        console.error("Failed to record module access:", error);
      }
    };

    recordAccess();
  }, [user, moduleName]);
}
