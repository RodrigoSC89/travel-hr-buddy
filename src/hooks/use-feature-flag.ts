import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Database } from "@/integrations/supabase/types";

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
        type FeatureFlagRow = Database["public"]["Tables"]["feature_flags"]["Row"];

        const { data, error } = await supabase
          .from("feature_flags")
          .select("enabled, user_id, tenant_id")
          .eq("key", key)
          .order("user_id", { ascending: false, nullsFirst: true })
          .order("tenant_id", { ascending: false, nullsFirst: true })
          .limit(5);

        if (error) {
          console.warn(`Feature flag lookup error for "${key}":`, error);
          return false;
        }

        const rows = (data ?? []) as FeatureFlagRow[];
        const prioritized = rows.find(r => r.user_id && r.user_id === user?.id)
          ?? rows.find(r => r.tenant_id)
          ?? rows.find(r => !r.user_id && !r.tenant_id);

        return prioritized?.enabled ?? false;
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
      .update({ enabled, updated_at: new Date().toISOString() })
      .eq("key", key);

    if (error) {
      console.error("Failed to toggle feature flag:", error);
      throw error;
    }
  };
}
