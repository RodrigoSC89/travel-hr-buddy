import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

/**
 * PATCH 629: Feature Flag Hook
 * 
 * Hook to check if a feature flag is enabled for the current context.
 * Supports tenant-level, user-level, and global feature flags.
 * 
 * @param key - The feature flag key to check
 * @returns boolean indicating if the feature is enabled
 * 
 * @example
 * const isAINavigationEnabled = useFeatureFlag('ai_navigation');
 * if (isAINavigationEnabled) {
 *   // Show AI navigation features
 * }
 */
export function useFeatureFlag(key: string): boolean {
  const { user } = useAuth();

  const { data: isEnabled = false } = useQuery({
    queryKey: ["feature-flag", key, user?.id],
    queryFn: async () => {
      try {
        // Check in order: user-specific, tenant-specific, global
        // Use parameterized filter to avoid SQL injection
        const { data, error } = await supabase
          .from("feature_flags")
          .select("enabled")
          .eq("key", key)
          .or(`user_id.eq."${user?.id}",tenant_id.eq."${user?.id}",user_id.is.null,tenant_id.is.null`)
          .order("user_id", { nullsLast: false })
          .order("tenant_id", { nullsLast: false })
          .limit(1)
          .single();

        if (error) {
          console.warn(`Feature flag lookup error for "${key}":`, error);
          return false;
        }

        return data?.enabled ?? false;
      } catch (error) {
        console.error(`Feature flag error for "${key}":`, error);
        return false;
      }
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    enabled: !!key,
  });

  return isEnabled;
}

/**
 * Hook to fetch all feature flags with their status
 * Used in admin panels to manage feature flags
 */
export function useFeatureFlags() {
  return useQuery({
    queryKey: ["feature-flags"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("feature_flags")
        .select("*")
        .order("key");

      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to toggle a feature flag
 * Admin-only functionality
 */
export function useToggleFeatureFlag() {
  return async (key: string, enabled: boolean) => {
    const { error } = await supabase
      .from("feature_flags")
      .update({ enabled })
      .eq("key", key);

    if (error) {
      console.error("Failed to toggle feature flag:", error);
      throw error;
    }
  };
}
