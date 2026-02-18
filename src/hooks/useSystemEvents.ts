/**
 * Hook for System Events — Cross-Module Integration
 * Subscribes to realtime events and provides event management
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { logger } from "@/lib/logger";

interface SystemEvent {
  id: string;
  event_type: string;
  source_module: string;
  source_record_id: string | null;
  vessel_id: string | null;
  payload: Record<string, unknown>;
  processed: boolean;
  priority: string;
  created_at: string;
}

interface EventStats {
  event_type: string;
  total: number;
  processed: number;
  pending: number;
  errors: number;
}

export function useSystemEvents(vesselId?: string) {
  const [recentEvents, setRecentEvents] = useState<SystemEvent[]>([]);
  const [stats, setStats] = useState<EventStats[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const queryClient = useQueryClient();

  // Subscribe to realtime events
  useEffect(() => {
    const filter = vesselId ? `vessel_id=eq.${vesselId}` : undefined;

    const channel = supabase
      .channel("system-events-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "system_events",
          ...(filter ? { filter } : {}),
        },
        (payload) => {
          const event = payload.new as SystemEvent;
          setRecentEvents((prev) => [event, ...prev].slice(0, 50));

          // Show toast for critical/high priority
          if (event.priority === "critical") {
            toast.error(`🚨 ${event.event_type.replace(/_/g, " ")}`, {
              description: `Módulo: ${event.source_module}`,
              duration: 10000,
            });
          } else if (event.priority === "high") {
            toast.warning(`⚠️ ${event.event_type.replace(/_/g, " ")}`, {
              description: `Módulo: ${event.source_module}`,
            });
          }

          // Invalidate related queries
          queryClient.invalidateQueries({ queryKey: ["dashboard-kpis"] });
          if (event.event_type.includes("maintenance")) {
            queryClient.invalidateQueries({ queryKey: ["maintenance"] });
          }
          if (event.event_type.includes("certificate") || event.event_type.includes("compliance")) {
            queryClient.invalidateQueries({ queryKey: ["certificates"] });
            queryClient.invalidateQueries({ queryKey: ["compliance"] });
          }
          if (event.event_type.includes("crew")) {
            queryClient.invalidateQueries({ queryKey: ["crew"] });
          }
          if (event.event_type.includes("voyage")) {
            queryClient.invalidateQueries({ queryKey: ["voyages"] });
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [vesselId, queryClient]);

  // Fetch recent events
  const fetchRecentEvents = useCallback(async (limit = 20) => {
    const query = supabase
      .from("system_events")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (vesselId) {
      query.eq("vessel_id", vesselId);
    }

    const { data } = await query;
    if (data) setRecentEvents(data as unknown as SystemEvent[]);
  }, [vesselId]);

  // Trigger event processing via Edge Function
  const processEvents = useCallback(async () => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke("process-system-events");
      if (error) throw error;
      
      const result = data as { processed: number; errors: number };
      if (result.processed > 0) {
        toast.success(`${result.processed} evento(s) processado(s)`, {
          description: result.errors > 0 ? `${result.errors} erro(s)` : undefined,
        });
        await fetchRecentEvents();
      }
      return result;
    } catch (err) {
      logger.error("[SystemEvents] Processing failed:", err);
      toast.error("Falha ao processar eventos");
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [fetchRecentEvents]);

  // Load on mount
  useEffect(() => {
    fetchRecentEvents();
  }, [fetchRecentEvents]);

  return {
    recentEvents,
    stats,
    isProcessing,
    processEvents,
    fetchRecentEvents,
  };
}
