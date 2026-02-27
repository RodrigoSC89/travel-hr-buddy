/**
 * NAUTI ONE — Event Bus (Outbox Pattern)
 * Publishes domain events to Supabase event_outbox table
 * All cross-module communication flows through here
 */

import { supabase } from "@/integrations/supabase/client";
import { fromUntyped } from "@/integrations/supabase/untyped-client";
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
  // Alerts (SOC / Telemetry)
  'alert.acknowledged': 'alert.acknowledged',
  'alert.resolved': 'alert.resolved',
  // Notifications
  'notification.read': 'notification.read',
  'notification.all_read': 'notification.all_read',
  // Security
  'security.finding.fixed': 'security.finding.fixed',
  // Recruitment
  'recruitment.stage.changed': 'recruitment.stage.changed',
  // Safety DDS
  'safety.dds.created': 'safety.dds.created',
  // Voyage Intelligence
  'voyage.route.selected': 'voyage.route.selected',
  // Running Hours (IoT sensor update)
  'maintenance.sensor_reading.updated': 'maintenance.sensor_reading.updated',
  // Telemetry alert create
  'tracking.telemetry_alert.created': 'tracking.telemetry_alert.created',
  // ═══════ WAVE 63 — FULL COVERAGE ═══════
  // Non-Conformities
  'compliance.nc.created': 'compliance.nc.created',
  'compliance.nc.status_changed': 'compliance.nc.status_changed',
  // Internal Audits
  'compliance.internal_audit.created': 'compliance.internal_audit.created',
  'compliance.internal_audit.completed': 'compliance.internal_audit.completed',
  // Checklists
  'operations.checklist.created': 'operations.checklist.created',
  'operations.checklist.completed': 'operations.checklist.completed',
  // Drills / Safety
  'safety.drill.created': 'safety.drill.created',
  'safety.drill.completed': 'safety.drill.completed',
  'safety.incident.created': 'safety.incident.created',
  'safety.incident.updated': 'safety.incident.updated',
  'safety.near_miss.created': 'safety.near_miss.created',
  // Finance expanded
  'finance.expense.created': 'finance.expense.created',
  'finance.expense.updated': 'finance.expense.updated',
  'finance.transaction.created': 'finance.transaction.created',
  'finance.budget.created': 'finance.budget.created',
  'finance.budget.updated': 'finance.budget.updated',
  'finance.payroll.created': 'finance.payroll.created',
  // HR / People expanded
  'people.leave.requested': 'people.leave.requested',
  'people.leave.approved': 'people.leave.approved',
  'people.evaluation.created': 'people.evaluation.created',
  'people.wellness.updated': 'people.wellness.updated',
  'people.climate.response': 'people.climate.response',
  'people.onboarding.started': 'people.onboarding.started',
  // Procurement expanded
  'procurement.supplier.created': 'procurement.supplier.created',
  'procurement.supplier.updated': 'procurement.supplier.updated',
  'procurement.order.received': 'procurement.order.received',
  // Operations expanded
  'operations.cargo.created': 'operations.cargo.created',
  'operations.cargo.updated': 'operations.cargo.updated',
  'operations.bunker.created': 'operations.bunker.created',
  'operations.ballast.created': 'operations.ballast.created',
  'operations.noon.report_created': 'operations.noon.report_created',
  // Finance expanded
  'finance.pool.settlement_created': 'finance.pool.settlement_created',
  // Communication
  'comms.message.sent': 'comms.message.sent',
  'comms.notification.created': 'comms.notification.created',
  // Maintenance expanded
  'maintenance.record.created': 'maintenance.record.created',
  'maintenance.record.updated': 'maintenance.record.updated',
  'maintenance.drydock.created': 'maintenance.drydock.created',
  'maintenance.drydock.updated': 'maintenance.drydock.updated',
  'maintenance.defect.created': 'maintenance.defect.created',
  'maintenance.warranty.created': 'maintenance.warranty.created',
  // Analytics / Reporting
  'analytics.report.generated': 'analytics.report.generated',
  'analytics.dashboard.updated': 'analytics.dashboard.updated',
  // Automation
  'automation.workflow.created': 'automation.workflow.created',
  'automation.workflow.executed': 'automation.workflow.executed',
  // Medical
  'medical.record.created': 'medical.record.created',
  'medical.record.updated': 'medical.record.updated',
  // Calendar
  'calendar.event.created': 'calendar.event.created',
  'calendar.event.updated': 'calendar.event.updated',
  // SGSO / ISM
  'compliance.sgso.plan_created': 'compliance.sgso.plan_created',
  'compliance.sgso.plan_updated': 'compliance.sgso.plan_updated',
  // Emissions / Environmental
  'environmental.emissions.created': 'environmental.emissions.created',
  'environmental.emissions.updated': 'environmental.emissions.updated',
  // PREOVID / Inspections
  'compliance.preovid.created': 'compliance.preovid.created',
  'compliance.preovid.updated': 'compliance.preovid.updated',
  // PEOTRAM
  'compliance.peotram.audit_created': 'compliance.peotram.audit_created',
  'compliance.peotram.audit_updated': 'compliance.peotram.audit_updated',
  // Reservations / Travel
  'travel.reservation.created': 'travel.reservation.created',
  'travel.reservation.updated': 'travel.reservation.updated',
  // Vessel Downtime
  'fleet.downtime.created': 'fleet.downtime.created',
  'fleet.downtime.updated': 'fleet.downtime.updated',
  // CBT (Computer Based Training)
  'training.cbt.started': 'training.cbt.started',
  'training.cbt.completed': 'training.cbt.completed',
  // Manning Agents
  'recruitment.candidate.created': 'recruitment.candidate.created',
  'recruitment.candidate.updated': 'recruitment.candidate.updated',
  // IoT / Telemetry
  'iot.sensor_data.created': 'iot.sensor_data.created',
  // Contracts
  'finance.contract.created': 'finance.contract.created',
  'finance.contract.updated': 'finance.contract.updated',
  // Task Management
  'operations.task.created': 'operations.task.created',
  'operations.task.updated': 'operations.task.updated',
  // Smart Resolution targets (completed/closed/approved variants)
  'maintenance.task.completed': 'maintenance.task.completed',
  'compliance.nc.closed': 'compliance.nc.closed',
  'compliance.internal_audit.approved': 'compliance.internal_audit.approved',
  'finance.invoice.completed': 'finance.invoice.completed',
  'maintenance.work_order.approved': 'maintenance.work_order.approved',
  'safety.incident.closed': 'safety.incident.closed',
  'safety.drill.approved': 'safety.drill.approved',
  'fleet.downtime.closed': 'fleet.downtime.closed',
  'operations.cargo.completed': 'operations.cargo.completed',
  'compliance.class_survey.completed': 'compliance.class_survey.completed',
  'compliance.class_survey.approved': 'compliance.class_survey.approved',
  // ═══════ MARKET PARITY MODULES ═══════
  'operations.berth.created': 'operations.berth.created',
  'operations.berth.updated': 'operations.berth.updated',
  'operations.sts.created': 'operations.sts.created',
  'operations.sts.updated': 'operations.sts.updated',
  'trading.position.created': 'trading.position.created',
  'trading.position.updated': 'trading.position.updated',
  'maintenance.trim.recorded': 'maintenance.trim.recorded',
  'procurement.supplier_portal.submitted': 'procurement.supplier_portal.submitted',
  'finance.invoice_match.created': 'finance.invoice_match.created',
  'finance.invoice_match.updated': 'finance.invoice_match.updated',
  'procurement.return_goods.created': 'procurement.return_goods.created',
  'procurement.return_goods.updated': 'procurement.return_goods.updated',
  'comms.forum.post_created': 'comms.forum.post_created',
  'comms.forum.reply_created': 'comms.forum.reply_created',
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- RPC payload accepts Json type
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
    const { error } = await fromUntyped('audit_events').insert({
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
