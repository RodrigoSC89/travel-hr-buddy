/**
 * useRealtimeInvalidation - Auto-invalidate TanStack Query on Supabase Realtime changes
 */

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface UseRealtimeOptions {
  table: string;
  queryKeys: readonly (readonly unknown[])[];
  enabled?: boolean;
}

export function useRealtimeInvalidation({
  table,
  queryKeys,
  enabled = true,
}: UseRealtimeOptions) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return;

    const channelName = `rt-${table}-${Date.now()}`;
    const invalidateAll = () => {
      for (const key of queryKeys) {
        queryClient.invalidateQueries({ queryKey: key as unknown[] });
      }
    };

    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', { event: '*', schema: 'public', table }, invalidateAll)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, enabled, queryClient]);
}
