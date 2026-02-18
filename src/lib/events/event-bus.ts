/**
 * NAUTI ONE — Event Bus (Outbox Pattern)
 * Publishes domain events to Supabase event_outbox table
 * All cross-module communication flows through here
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import type { EntityType } from "@/lib/domain/types";

// ============================================
// EVENT TYPE CATALOG
// ============================================

export const EVENT_TYPES = {
  // Core
  'vessel.created': 'vessel.created',
  'vessel.updated': 'vessel.updated',
  'vessel.decommissioned': 'vessel.decommissioned',
  // Voyage
  'voyage.created': 'voyage.created',
  'voyage.updated': 'voyage.updated',
  'voyage.approved': 'voyage.approved',
  'voyage.completed': 'voyage.completed',
  // Maintenance
  'maintenance.work_order.created': 'maintenance.work_order.created',
  'maintenance.work_order.completed': 'maintenance.work_order.completed',
  'maintenance.work_order.status_changed': 'maintenance.work_order.status_changed',
  'maintenance.task.overdue': 'maintenance.task.overdue',
  'maintenance.system.created': 'maintenance.system.created',
  // Compliance
  'compliance.audit.created': 'compliance.audit.created',
  'compliance.audit.completed': 'compliance.audit.completed',
  'compliance.finding.created': 'compliance.finding.created',
  'compliance.finding.closed': 'compliance.finding.closed',
  'compliance.certificate.expiring': 'compliance.certificate.expiring',
  'compliance.certificate.expired': 'compliance.certificate.expired',
  'compliance.gap_analysis.completed': 'compliance.gap_analysis.completed',
  'compliance.capa.created': 'compliance.capa.created',
  'compliance.capa.closed': 'compliance.capa.closed',
  // Tracking
  'tracking.position.updated': 'tracking.position.updated',
  'tracking.alert.created': 'tracking.alert.created',
  'tracking.geofence.breach': 'tracking.geofence.breach',
  'tracking.connectivity.degraded': 'tracking.connectivity.degraded',
  // Finance
  'finance.invoice.created': 'finance.invoice.created',
  'finance.invoice.approved': 'finance.invoice.approved',
  'finance.po.approved': 'finance.po.approved',
  'finance.po.created': 'finance.po.created',
  'finance.charter.created': 'finance.charter.created',
  'finance.charter.status_changed': 'finance.charter.status_changed',
  'finance.ets.record_created': 'finance.ets.record_created',
  // People
  'people.rotation.published': 'people.rotation.published',
  'people.certification.expiring': 'people.certification.expiring',
  'people.medical.fitness_updated': 'people.medical.fitness_updated',
  'people.training.completed': 'people.training.completed',
  'people.crew.created': 'people.crew.created',
  // Documents
  'document.created': 'document.created',
  'document.version.created': 'document.version.created',
  'document.linked': 'document.linked',
  // AI
  'ai.decision.logged': 'ai.decision.logged',
  'ai.suggestion.created': 'ai.suggestion.created',
  'ai.suggestion.accepted': 'ai.suggestion.accepted',
  'ai.suggestion.rejected': 'ai.suggestion.rejected',
  // System
  'system.integration.error': 'system.integration.error',
  'system.health.degraded': 'system.health.degraded',
  // Feedback & Training
  'feedback.submitted': 'feedback.submitted',
  'training.session.created': 'training.session.created',
  'training.session.completed': 'training.session.completed',
  // Communication
  'comms.whatsapp.sent': 'comms.whatsapp.sent',
  'comms.whatsapp.batch_sent': 'comms.whatsapp.batch_sent',
  // Templates
  'document.template.created': 'document.template.created',
  'document.template.updated': 'document.template.updated',
  'document.template.deleted': 'document.template.deleted',
  // Access Control
  'access.role.changed': 'access.role.changed',
  // Tracking (resolve/delete)
  'tracking.alert.resolved': 'tracking.alert.resolved',
  'tracking.alert.deleted': 'tracking.alert.deleted',
  // PEO-DP Operations
  'peodp.logbook.entry_created': 'peodp.logbook.entry_created',
  'peodp.logbook.entry_deleted': 'peodp.logbook.entry_deleted',
  'peodp.fmea.item_created': 'peodp.fmea.item_created',
  'peodp.fmea.item_updated': 'peodp.fmea.item_updated',
  'peodp.fmea.item_deleted': 'peodp.fmea.item_deleted',
  // Fleet / Vessel History
  'fleet.history.event_created': 'fleet.history.event_created',
  'fleet.history.event_deleted': 'fleet.history.event_deleted',
  // Maintenance (Spare Parts, Running Hours, Predictions)
  'maintenance.spare_part.added': 'maintenance.spare_part.added',
  'maintenance.running_hours.updated': 'maintenance.running_hours.updated',
  'maintenance.prediction.created': 'maintenance.prediction.created',
  // Compliance (Class Surveys, MARPOL)
  'compliance.class_survey.created': 'compliance.class_survey.created',
  'compliance.class_survey.updated': 'compliance.class_survey.updated',
  'compliance.class_survey.deleted': 'compliance.class_survey.deleted',
  'compliance.marpol.entry_created': 'compliance.marpol.entry_created',
  // Procurement
  'procurement.requisition.created': 'procurement.requisition.created',
  'procurement.requisition.approved': 'procurement.requisition.approved',
  // Safety / QHSE
  'safety.jsa.template_created': 'safety.jsa.template_created',
  'safety.nc.created': 'safety.nc.created',
  'safety.nc.status_changed': 'safety.nc.status_changed',
  // Hull Integrity
  'maintenance.hull.inspection_created': 'maintenance.hull.inspection_created',
  'maintenance.hull.finding_created': 'maintenance.hull.finding_created',
  // Crew Operations
  'people.crew.assigned': 'people.crew.assigned',
  'people.certification.created': 'people.certification.created',
  'people.certification.deleted': 'people.certification.deleted',
  // Maintenance Tasks (PMS)
  'maintenance.task.created': 'maintenance.task.created',
  'maintenance.task.status_changed': 'maintenance.task.status_changed',
  // AI Insights
  'ai.insight.read': 'ai.insight.read',
  // Benchmarking
  'peotram.benchmarking.seeded': 'peotram.benchmarking.seeded',
} as const;

export type EventType = keyof typeof EVENT_TYPES;

// ============================================
// EVENT PAYLOAD INTERFACE
// ============================================

export interface DomainEvent<T = Record<string, unknown>> {
  type: EventType;
  payload: T;
  sourceEntityType?: EntityType;
  sourceEntityId?: string;
  metadata?: Record<string, unknown>;
}

// ============================================
// LOCAL EVENT BUS (in-memory for UI reactivity)
// ============================================

type EventHandler = (event: DomainEvent) => void;

class LocalEventBus {
  private handlers: Map<string, Set<EventHandler>> = new Map();

  on(eventType: EventType | '*', handler: EventHandler): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType)!.add(handler);
    return () => { this.handlers.get(eventType)?.delete(handler); };
  }

  emit(event: DomainEvent): void {
    // Notify specific handlers
    this.handlers.get(event.type)?.forEach(h => h(event));
    // Notify wildcard handlers
    this.handlers.get('*')?.forEach(h => h(event));
  }
}

export const localEventBus = new LocalEventBus();

// ============================================
// PERSISTENT EVENT PUBLISHER (Outbox)
// ============================================

export async function publishEvent<T = Record<string, unknown>>(
  event: DomainEvent<T>
): Promise<{ success: boolean; eventId?: string; error?: string }> {
  try {
    // Publish to outbox via RPC
    const { data, error } = await supabase.rpc('publish_event', {
      p_event_type: event.type,
      p_payload: event.payload as any,
      p_source_entity_type: (event.sourceEntityType ?? undefined) as string | undefined,
      p_source_entity_id: (event.sourceEntityId ?? undefined) as string | undefined,
    });

    if (error) {
      logger.error('[EventBus] Failed to publish event', { event: event.type, error: error.message });
      return { success: false, error: error.message };
    }

    // Also emit locally for UI reactivity
    localEventBus.emit(event as DomainEvent);

    logger.info('[EventBus] Event published', { type: event.type, id: data });
    return { success: true, eventId: data as string };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    logger.error('[EventBus] Unexpected error', { error: msg });
    return { success: false, error: msg };
  }
}

// ============================================
// BATCH EVENT PUBLISHER
// ============================================

export async function publishEvents(events: DomainEvent[]): Promise<void> {
  await Promise.allSettled(events.map(e => publishEvent(e)));
}

// ============================================
// AUDIT EVENT HELPER
// ============================================

export async function logAuditEvent(params: {
  entityType: string;
  entityId?: string;
  action: string;
  diff?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    const { error } = await (supabase.from as Function)('audit_events').insert({
      entity_type: params.entityType,
      entity_id: params.entityId ?? undefined,
      action: params.action,
      diff_json: (params.diff ?? null) as unknown,
      metadata_json: (params.metadata ?? null) as unknown,
      actor_id: (await supabase.auth.getUser()).data.user?.id,
    });

    if (error) {
      logger.error('[AuditEvent] Failed to log', { error: error.message });
    }
  } catch (err) {
    logger.error('[AuditEvent] Unexpected error', err);
  }
}
