/**
 * Real-time Analytics Hook
 * Subscribes to analytics events in real-time using Supabase Realtime
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";

export interface AnalyticsEvent {
  id: string;
  user_id: string | null;
  organization_id: string | null;
  session_id: string;
  event_name: string;
  event_category: string;
  properties: Record<string, any>;
  page_url: string;
  timestamp: string;
  device_type?: string;
  browser?: string;
  os?: string;
}

export interface AnalyticsMetric {
  id: string;
  organization_id: string | null;
  metric_name: string;
  metric_value: number;
  metric_unit: string;
  dimensions: Record<string, any>;
  period_start: string;
  period_end: string;
  aggregation_type: string;
}

export function useRealtimeAnalytics() {
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [metrics, setMetrics] = useState<AnalyticsMetric[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to real-time events
  useEffect(() => {
    let eventsChannel: RealtimeChannel | null = null;
    let metricsChannel: RealtimeChannel | null = null;

    const setupRealtimeSubscriptions = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setError("User not authenticated");
          return;
        }

        // Subscribe to analytics events
        eventsChannel = supabase
          .channel("analytics_events_channel")
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "analytics_events"
            },
            (payload) => {
              const newEvent = payload.new as AnalyticsEvent;
              setEvents(prev => [newEvent, ...prev].slice(0, 100)); // Keep last 100 events
            }
          )
          .subscribe((status) => {
            if (status === "SUBSCRIBED") {
              setIsConnected(true);
            } else if (status === "CHANNEL_ERROR") {
              setError("Failed to connect to events channel");
            }
          });

        // Subscribe to analytics metrics
        metricsChannel = supabase
          .channel("analytics_metrics_channel")
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "analytics_metrics"
            },
            (payload) => {
              if (payload.eventType === "INSERT") {
                const newMetric = payload.new as AnalyticsMetric;
                setMetrics(prev => [newMetric, ...prev].slice(0, 50));
              } else if (payload.eventType === "UPDATE") {
                const updatedMetric = payload.new as AnalyticsMetric;
                setMetrics(prev => 
                  prev.map(m => m.id === updatedMetric.id ? updatedMetric : m)
                );
              }
            }
          )
          .subscribe();

      } catch (err: any) {
        setError(err.message);
        console.error("Error setting up realtime subscriptions:", err);
      }
    };

    setupRealtimeSubscriptions();

    return () => {
      if (eventsChannel) {
        supabase.removeChannel(eventsChannel);
      }
      if (metricsChannel) {
        supabase.removeChannel(metricsChannel);
      }
    };
  }, []);

  // Load initial events
  const loadRecentEvents = useCallback(async (limit = 50) => {
    try {
      const { data, error } = await supabase
        .from("analytics_events")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(limit);

      if (error) throw error;

      setEvents(data as AnalyticsEvent[]);
    } catch (err: any) {
      setError(err.message);
      console.error("Error loading events:", err);
    }
  }, []);

  // Load initial metrics
  const loadRecentMetrics = useCallback(async (limit = 20) => {
    try {
      const { data, error } = await supabase
        .from("analytics_metrics")
        .select("*")
        .order("period_end", { ascending: false })
        .limit(limit);

      if (error) throw error;

      setMetrics(data as AnalyticsMetric[]);
    } catch (err: any) {
      setError(err.message);
      console.error("Error loading metrics:", err);
    }
  }, []);

  // Get events by category
  const getEventsByCategory = useCallback((category: string) => {
    return events.filter(e => e.event_category === category);
  }, [events]);

  // Get events by name
  const getEventsByName = useCallback((name: string) => {
    return events.filter(e => e.event_name === name);
  }, [events]);

  // Calculate event counts
  const getEventCounts = useCallback(() => {
    const counts: Record<string, number> = {};
    events.forEach(event => {
      counts[event.event_name] = (counts[event.event_name] || 0) + 1;
    });
    return counts;
  }, [events]);

  // Get metrics by name
  const getMetricsByName = useCallback((metricName: string) => {
    return metrics.filter(m => m.metric_name === metricName);
  }, [metrics]);

  return {
    events,
    metrics,
    isConnected,
    error,
    loadRecentEvents,
    loadRecentMetrics,
    getEventsByCategory,
    getEventsByName,
    getEventCounts,
    getMetricsByName
  };
}
