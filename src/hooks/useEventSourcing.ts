/**
 * Hook for Event Sourcing / CQRS
 * Immutable event log with replay capabilities
 */

import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { eventStore, AggregateType } from "@/lib/event-sourcing/event-store";

export interface DomainEvent {
  id: string;
  aggregate_type: string;
  aggregate_id: string;
  event_type: string;
  data: Record<string, unknown>;
  metadata: Record<string, unknown>;
  event_version: number;
  created_at: string;
}

export interface EventStats {
  totalEvents: number;
  eventsByType: Record<string, number>;
  eventsLast24h: number;
  eventsLast7d: number;
}

export function useEventSourcing() {
  const queryClient = useQueryClient();

  // Fetch recent events
  const { data: events = [], isLoading } = useQuery({
    queryKey: ["domain-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("domain_events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);

      if (error) throw error;
      
      return (data || []).map(row => ({
        id: row.id,
        aggregate_type: row.aggregate_type,
        aggregate_id: row.aggregate_id,
        event_type: row.event_type,
        data: (row.data as Record<string, unknown>) || {},
        metadata: (row.metadata as Record<string, unknown>) || {},
        event_version: row.event_version,
        created_at: row.created_at || new Date().toISOString()
      })) as DomainEvent[];
    }
  });

  // Calculate stats
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const eventsByType: Record<string, number> = {};
  let eventsLast24h = 0;
  let eventsLast7d = 0;

  for (const event of events) {
    eventsByType[event.event_type] = (eventsByType[event.event_type] || 0) + 1;
    
    const eventDate = new Date(event.created_at);
    if (eventDate >= oneDayAgo) eventsLast24h++;
    if (eventDate >= sevenDaysAgo) eventsLast7d++;
  }

  const stats: EventStats = {
    totalEvents: events.length,
    eventsByType,
    eventsLast24h,
    eventsLast7d
  };

  // Append event
  const appendEvent = useMutation({
    mutationFn: async (params: {
      organizationId: string;
      aggregateType: AggregateType;
      aggregateId: string;
      eventType: string;
      data: Record<string, unknown>;
      userId?: string;
    }) => {
      const event = await eventStore.append(
        params.organizationId,
        params.aggregateType,
        params.aggregateId,
        params.eventType,
        params.data,
        { user_id: params.userId || "system", timestamp: new Date().toISOString() }
      );

      return event;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["domain-events"] });
    }
  });

  // Get events for aggregate
  const getAggregateEvents = useCallback(async (
    aggregateId: string
  ): Promise<DomainEvent[]> => {
    const dbEvents = await eventStore.getEvents(aggregateId);
    return dbEvents.map(row => ({
      id: row.id,
      aggregate_type: row.aggregate_type,
      aggregate_id: row.aggregate_id,
      event_type: row.event_type,
      data: (row.data as unknown as Record<string, unknown>) || {},
      metadata: (row.metadata as unknown as Record<string, unknown>) || {},
      event_version: row.event_version,
      created_at: row.created_at || new Date().toISOString()
    }));
  }, []);

  // Replay aggregate to get current state
  const replayAggregate = useCallback(async <T>(
    aggregateId: string,
    reducer: (state: T, event: DomainEvent) => T,
    initialState: T
  ): Promise<T> => {
    const aggregateEvents = await getAggregateEvents(aggregateId);
    return aggregateEvents.reduce(reducer, initialState);
  }, [getAggregateEvents]);

  // Get events by type
  const getEventsByType = useCallback((eventType: string): DomainEvent[] => {
    return events.filter(e => e.event_type === eventType);
  }, [events]);

  // Get timeline for entity
  const getEntityTimeline = useCallback(async (
    aggregateId: string
  ): Promise<Array<{
    timestamp: string;
    eventType: string;
    summary: string;
  }>> => {
    const entityEvents = await getAggregateEvents(aggregateId);
    
    return entityEvents.map(event => ({
      timestamp: event.created_at,
      eventType: event.event_type,
      summary: generateEventSummary(event)
    }));
  }, [getAggregateEvents]);

  return {
    events,
    stats,
    isLoading,
    appendEvent,
    getAggregateEvents,
    replayAggregate,
    getEventsByType,
    getEntityTimeline
  };
}

// Helper to generate human-readable event summary
function generateEventSummary(event: DomainEvent): string {
  const data = event.data;
  
  switch (event.event_type) {
    case "CREW_CREATED":
      return `Crew member ${data.name || "unknown"} was created`;
    case "CREW_UPDATED":
      return `Crew member was updated`;
    case "VOYAGE_STARTED":
      return `Voyage to ${data.destination || "unknown"} started`;
    case "VOYAGE_COMPLETED":
      return `Voyage completed`;
    case "MAINTENANCE_SCHEDULED":
      return `Maintenance scheduled for ${data.equipment || "equipment"}`;
    case "COMPLIANCE_VIOLATION":
      return `Compliance violation: ${data.rule || "rule"}`;
    default:
      return event.event_type.replace(/_/g, " ").toLowerCase();
  }
}
