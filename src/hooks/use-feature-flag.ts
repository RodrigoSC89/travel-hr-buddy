import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { logger } from "@/lib/logger";

/**
 * PATCH 629: Feature Flag Hook
 * DEBT-FIX: Aligned with real schema (flag_name, no user_id/tenant_id)
 */
export function useFeatureFlag(key: string): boolean {
  const { user } = useAuth();

  const { data: isEnabled = false } = useQuery({
    queryKey: ["feature-flag", key, user?.id],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("feature_flags")
          .select("enabled, flag_name")
          .eq("flag_name", key)
          .limit(1);

        if (error) {
          logger.warn(`Feature flag lookup error for "${key}":`, { error });
          return false;
        }

        const row = (data ?? [])[0];
        return row?.enabled ?? false;
      } catch (error) {
        logger.error(`Feature flag error for "${key}":`, error);
        return false;
      }
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!key,
  });

  return isEnabled;
}

/**
 * Hook to fetch all feature flags with their status
 */
export function useFeatureFlags() {
  return useQuery({
    queryKey: ["feature-flags"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("feature_flags")
        .select("*")
        .order("flag_name");

      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to toggle a feature flag
 */
export function useToggleFeatureFlag() {
  return async (key: string, enabled: boolean) => {
    const { error } = await supabase
      .from("feature_flags")
      .update({ enabled, updated_at: new Date().toISOString() })
      .eq("flag_name", key);

    if (error) {
      logger.error("Failed to toggle feature flag:", error);
      throw error;
    }
  };
}
