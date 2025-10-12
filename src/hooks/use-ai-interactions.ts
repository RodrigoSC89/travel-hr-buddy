import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AIInteractionStats {
  totalInteractions: number;
  successRate: number;
  averageDuration: number;
  totalTokensUsed: number;
  interactionsByType: Record<string, number>;
  recentInteractions: Array<{
    id: string;
    interaction_type: string;
    prompt: string;
    success: boolean;
    created_at: string;
    duration_ms: number | null;
  }>;
}

/**
 * Hook to fetch AI interaction statistics for the current user
 */
export const useAIInteractionStats = (enabled = true) => {
  return useQuery({
    queryKey: ["ai-interaction-stats"],
    queryFn: async (): Promise<AIInteractionStats> => {
      const { data: interactions, error } = await supabase
        .from("ai_interactions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) {
        console.error("Error fetching AI interaction stats:", error);
        throw error;
      }

      if (!interactions || interactions.length === 0) {
        return {
          totalInteractions: 0,
          successRate: 0,
          averageDuration: 0,
          totalTokensUsed: 0,
          interactionsByType: {},
          recentInteractions: [],
        };
      }

      const successfulInteractions = interactions.filter((i) => i.success);
      const successRate = (successfulInteractions.length / interactions.length) * 100;

      const durationsWithValues = interactions
        .filter((i) => i.duration_ms !== null)
        .map((i) => i.duration_ms as number);
      const averageDuration =
        durationsWithValues.length > 0
          ? durationsWithValues.reduce((sum, d) => sum + d, 0) / durationsWithValues.length
          : 0;

      const totalTokensUsed = interactions.reduce((sum, i) => sum + (i.tokens_used || 0), 0);

      const interactionsByType = interactions.reduce(
        (acc, i) => {
          acc[i.interaction_type] = (acc[i.interaction_type] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      const recentInteractions = interactions.slice(0, 10).map((i) => ({
        id: i.id,
        interaction_type: i.interaction_type,
        prompt: i.prompt,
        success: i.success,
        created_at: i.created_at,
        duration_ms: i.duration_ms,
      }));

      return {
        totalInteractions: interactions.length,
        successRate: Math.round(successRate * 100) / 100,
        averageDuration: Math.round(averageDuration),
        totalTokensUsed,
        interactionsByType,
        recentInteractions,
      };
    },
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to fetch AI interaction history for the current user
 */
export const useAIInteractionHistory = (limit = 50) => {
  return useQuery({
    queryKey: ["ai-interaction-history", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_interactions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        console.error("Error fetching AI interaction history:", error);
        throw error;
      }

      return data || [];
    },
    staleTime: 1000 * 60, // 1 minute
  });
};
