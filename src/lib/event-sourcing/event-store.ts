/**
 * Event Sourcing Infrastructure
 * CQRS pattern with event replay capabilities
 */

import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export type AggregateType = 'crew' | 'voyage' | 'ship' | 'invoice' | 'maintenance' | 'compliance';

export interface DomainEvent<T = unknown> {
  id: string;
  organization_id: string;
  aggregate_type: AggregateType;
  aggregate_id: string;
  event_type: string;
  event_version: number;
  data: T;
  metadata: EventMetadata;
  created_at: string;
}

export interface EventMetadata {
  user_id: string;
  user_name?: string;
  ip_address?: string;
  user_agent?: string;
  correlation_id?: string;
  causation_id?: string;
  timestamp: string;
}

export interface EventSnapshot<T = unknown> {
  id: string;
  organization_id: string;
  aggregate_type: AggregateType;
  aggregate_id: string;
  snapshot_version: number;
  state: T;
  created_at: string;
}

// Event types per aggregate
export const EVENT_TYPES = {
  crew: [
    'CREW_CREATED',
    'CREW_UPDATED',
    'CREW_ASSIGNED_TO_VESSEL',
    'CREW_REMOVED_FROM_VESSEL',
    'CREW_CERTIFICATION_ADDED',
    'CREW_CERTIFICATION_EXPIRED',
    'CREW_CONTRACT_SIGNED',
    'CREW_CONTRACT_TERMINATED',
    'CREW_MEDICAL_UPDATED',
    'CREW_TRAINING_COMPLETED'
  ],
  voyage: [
    'VOYAGE_CREATED',
    'VOYAGE_STARTED',
    'VOYAGE_WAYPOINT_REACHED',
    'VOYAGE_COMPLETED',
    'VOYAGE_CANCELLED',
    'VOYAGE_DELAYED',
    'VOYAGE_CREW_CHANGED'
  ],
  ship: [
    'SHIP_REGISTERED',
    'SHIP_UPDATED',
    'SHIP_INSPECTION_PASSED',
    'SHIP_INSPECTION_FAILED',
    'SHIP_MAINTENANCE_SCHEDULED',
    'SHIP_MAINTENANCE_COMPLETED',
    'SHIP_CERTIFICATION_RENEWED'
  ],
  invoice: [
    'INVOICE_CREATED',
    'INVOICE_SENT',
    'INVOICE_PAID',
    'INVOICE_OVERDUE',
    'INVOICE_CANCELLED',
    'INVOICE_REFUNDED'
  ],
  maintenance: [
    'MAINTENANCE_SCHEDULED',
    'MAINTENANCE_STARTED',
    'MAINTENANCE_COMPLETED',
    'MAINTENANCE_DELAYED',
    'MAINTENANCE_PART_ORDERED',
    'MAINTENANCE_PART_RECEIVED'
  ],
  compliance: [
    'COMPLIANCE_AUDIT_STARTED',
    'COMPLIANCE_AUDIT_COMPLETED',
    'COMPLIANCE_VIOLATION_DETECTED',
    'COMPLIANCE_VIOLATION_RESOLVED',
    'COMPLIANCE_CERTIFICATE_RENEWED',
    'COMPLIANCE_CERTIFICATE_EXPIRED'
  ]
} as const;

class EventStore {
  private eventHandlers: Map<string, ((event: DomainEvent) => void)[]> = new Map();

  /**
   * Append a new event to the event store
   */
  async append<T>(
    organizationId: string,
    aggregateType: AggregateType,
    aggregateId: string,
    eventType: string,
    data: T,
    metadata: Partial<EventMetadata>
  ): Promise<DomainEvent<T> | null> {
    try {
      // Get next version
      const { data: lastEvent } = await supabase
        .from('domain_events')
        .select('event_version')
        .eq('aggregate_id', aggregateId)
        .order('event_version', { ascending: false })
        .limit(1)
        .single();

      const nextVersion = (lastEvent?.event_version || 0) + 1;

      const event = {
        organization_id: organizationId,
        aggregate_type: aggregateType,
        aggregate_id: aggregateId,
        event_type: eventType,
        event_version: nextVersion,
        data: data as unknown as Record<string, unknown>,
        metadata: {
          ...metadata,
          timestamp: new Date().toISOString()
        } as unknown as Record<string, unknown>,
        created_at: new Date().toISOString()
      };

      const { data: inserted, error } = await (supabase.from as Function)('domain_events')
        .insert(event)
        .select()
        .single();

      if (error) {
        logger.error('Failed to append event:', error);
        return null;
      }

      const domainEvent = inserted as DomainEvent<T>;

      // Notify handlers
      this.notifyHandlers(domainEvent);

      return domainEvent;
    } catch (error) {
      logger.error('Error appending event:', error);
      return null;
    }
  }

  /**
   * Get all events for an aggregate
   */
  async getEvents(aggregateId: string): Promise<DomainEvent[]> {
    const { data, error } = await supabase
      .from('domain_events')
      .select('*')
      .eq('aggregate_id', aggregateId)
      .order('event_version', { ascending: true });

    if (error) {
      logger.error('Failed to get events:', error);
      return [];
    }

    return (data || []) as unknown as DomainEvent[];
  }

  /**
   * Get events by type
   */
  async getEventsByType(
    organizationId: string,
    eventType: string,
    since?: Date
  ): Promise<DomainEvent[]> {
    let query = supabase
      .from('domain_events')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('event_type', eventType);

    if (since) {
      query = query.gte('created_at', since.toISOString());
    }

    const { data, error } = await query.order('created_at', { ascending: true });

    if (error) {
      logger.error('Failed to get events by type:', error);
      return [];
    }

    return (data || []) as unknown as DomainEvent[];
  }

  /**
   * Replay events to reconstruct aggregate state
   */
  async replay<T>(
    aggregateId: string,
    reducer: (state: T, event: DomainEvent) => T,
    initialState: T
  ): Promise<{ state: T; version: number }> {
    // Try to get latest snapshot first
    const { data: snapshot } = await supabase
      .from('event_snapshots')
      .select('*')
      .eq('aggregate_id', aggregateId)
      .order('snapshot_version', { ascending: false })
      .limit(1)
      .single();

    let state = initialState;
    let startVersion = 0;

    if (snapshot) {
      state = (snapshot as unknown as EventSnapshot<T>).state;
      startVersion = (snapshot as unknown as EventSnapshot).snapshot_version;
    }

    // Get events after snapshot
    const { data: events } = await supabase
      .from('domain_events')
      .select('*')
      .eq('aggregate_id', aggregateId)
      .gt('event_version', startVersion)
      .order('event_version', { ascending: true });

    let version = startVersion;
    for (const event of (events || []) as unknown as DomainEvent[]) {
      state = reducer(state, event);
      version = event.event_version;
    }

    return { state, version };
  }

  /**
   * Create a snapshot for faster replay
   */
  async createSnapshot<T>(
    organizationId: string,
    aggregateType: AggregateType,
    aggregateId: string,
    state: T,
    version: number
  ): Promise<boolean> {
    const snapshot = {
      organization_id: organizationId,
      aggregate_type: aggregateType,
      aggregate_id: aggregateId,
      snapshot_version: version,
      state: state as unknown as Record<string, unknown>,
      created_at: new Date().toISOString()
    };

    const { error } = await (supabase.from as Function)('event_snapshots')
      .insert(snapshot);

    return !error;
  }

  /**
   * Subscribe to events
   */
  subscribe(eventType: string, handler: (event: DomainEvent) => void): () => void {
    const handlers = this.eventHandlers.get(eventType) || [];
    handlers.push(handler);
    this.eventHandlers.set(eventType, handlers);

    // Return unsubscribe function
    return () => {
      const current = this.eventHandlers.get(eventType) || [];
      this.eventHandlers.set(eventType, current.filter(h => h !== handler));
    };
  }

  private notifyHandlers(event: DomainEvent): void {
    const handlers = this.eventHandlers.get(event.event_type) || [];
    handlers.forEach(handler => {
      try {
        handler(event);
      } catch (error) {
        logger.error(`Event handler error for ${event.event_type}:`, error);
      }
    });
  }

  /**
   * Get event history for debugging/audit
   */
  async getEventHistory(
    aggregateId: string,
    options?: { limit?: number; offset?: number }
  ): Promise<{ events: DomainEvent[]; total: number }> {
    const { count } = await supabase
      .from('domain_events')
      .select('*', { count: 'exact', head: true })
      .eq('aggregate_id', aggregateId);

    const { data, error } = await supabase
      .from('domain_events')
      .select('*')
      .eq('aggregate_id', aggregateId)
      .order('event_version', { ascending: false })
      .range(options?.offset || 0, (options?.offset || 0) + (options?.limit || 50) - 1);

    if (error) {
      logger.error('Failed to get event history:', error);
      return { events: [], total: 0 };
    }

    return {
      events: (data || []) as unknown as DomainEvent[],
      total: count || 0
    };
  }
}

export const eventStore = new EventStore();

// Helper to create events with proper typing
export function createEvent<T>(
  aggregateType: AggregateType,
  eventType: string,
  data: T
): { aggregateType: AggregateType; eventType: string; data: T } {
  return { aggregateType, eventType, data };
}
