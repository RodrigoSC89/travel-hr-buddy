/**
 * PATCH 547 - AI Suggestions Logging Hook
 * Logs AI-generated suggestions and tracks user interactions
 */

import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

interface AISuggestion {
  suggestion_type: string;
  suggestion_text: string;
  context?: Record<string, any>;
  confidence_score?: number;
  accepted?: boolean;
  feedback?: string;
  category?: string;
  impact_level?: string;
}

export function useAISuggestionsLog() {
  const [isLogging, setIsLogging] = useState(false);

  const logSuggestion = useCallback(async (suggestion: AISuggestion) => {
    setIsLogging(true);
    try {
      const { data, error } = await supabase
        .from("ia_suggestions_log")
        .insert({
          suggestion_type: suggestion.suggestion_type,
          suggestion_text: suggestion.suggestion_text,
          context: suggestion.context,
          confidence_score: suggestion.confidence_score,
          accepted: suggestion.accepted ?? false,
          feedback: suggestion.feedback,
          category: suggestion.category,
          impact_level: suggestion.impact_level,
        })
        .select()
        .single();

      if (error) throw error;

      logger.debug(`[AI Suggestion] ${suggestion.suggestion_type} logged`);
      return data;
    } catch (error) {
      logger.error("[AI Suggestion] Failed to log:", error);
      return null;
    } finally {
      setIsLogging(false);
    }
  }, []);

  const updateSuggestionFeedback = useCallback(
    async (suggestionId: string, accepted: boolean, feedback?: string) => {
      try {
        const { error } = await supabase
          .from("ia_suggestions_log")
          .update({
            accepted,
            accepted_at: accepted ? new Date().toISOString() : null,
            feedback,
          })
          .eq("id", suggestionId);

        if (error) throw error;

        logger.debug(`[AI Suggestion] Feedback updated for ${suggestionId}`);
      } catch (error) {
        logger.error("[AI Suggestion] Failed to update feedback:", error);
      }
    },
    []
  );

  const getSuggestions = useCallback(async (type?: string, limit = 50) => {
    try {
      let query = supabase
        .from("ia_suggestions_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (type) {
        query = query.eq("suggestion_type", type);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error("[AI Suggestion] Failed to fetch:", error);
      return [];
    }
  }, []);

  return {
    logSuggestion,
    updateSuggestionFeedback,
    getSuggestions,
    isLogging,
  };
}
