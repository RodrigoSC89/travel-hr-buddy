/**
 * NAUTI ONE — Auto-Integration Interceptor
 * 
 * Intercepts ALL Supabase mutations (insert/update/delete/upsert)
 * and automatically publishes domain events + audit trail entries.
 * 
 * This solves the "85% not integrated" problem by making integration
 * happen at the data layer, not the component layer.
 * 
 * Every .from(table).insert/update/delete now triggers:
 * 1. Domain event → event_outbox (persistent)
 * 2. Local event bus → UI reactivity
 * 3. Audit trail → audit_events
 */

import { localEventBus, type EventType, type DomainEvent } from "@/lib/events/event-bus";
import { logger } from "@/lib/logger";
import type { EntityType } from "@/lib/domain/types";

// ============================================
// TABLE → EVENT MAPPING
// ============================================

interface TableEventMapping {
  insert?: EventType;
  update?: EventType;
  delete?: EventType;
  entityType: EntityType;
  getEntityId?: (row: Record<string, unknown>) => string;
  buildPayload?: (operation: string, row: Record<string, unknown>) => Record<string, unknown>;
}

/**
 * Complete mapping of all major tables to their domain events.
 * When a mutation hits one of these tables, the corresponding event fires automatically.
 */
const TABLE_EVENT_MAP: Record<string, TableEventMapping> = {
  // ═══════ FLEET ═══════
  vessels: {
    insert: 'vessel.created',
    update: 'vessel.updated',
    entityType: 'vessel',
    getEntityId: (r) => String(r.id ?? ''),
    buildPayload: (op, r) => ({ vessel_id: r.id, name: r.name, vessel_type: r.vessel_type, imo_number: r.imo_number }),
  },

  // ═══════ VOYAGES ═══════
  voyages: {
    insert: 'voyage.created',
    update: 'voyage.updated',
    entityType: 'voyage',
    getEntityId: (r) => String(r.id ?? ''),
    buildPayload: (op, r) => ({ voyage_id: r.id, vessel_id: r.vessel_id, status: r.status, departure_port: r.departure_port, arrival_port: r.arrival_port }),
  },
  voyage_plans: {
    insert: 'voyage.created',
    update: 'voyage.updated',
    entityType: 'voyage',
    getEntityId: (r) => String(r.id ?? ''),
  },

  // ═══════ CREW / PEOPLE ═══════
  crew_members: {
    insert: 'people.crew.created',
    update: 'people.crew.assigned',
    entityType: 'crew_member',
    getEntityId: (r) => String(r.id ?? ''),
    buildPayload: (op, r) => ({ crew_id: r.id, full_name: r.full_name, rank: r.rank, vessel_id: r.vessel_id }),
  },
  crew_certifications: {
    insert: 'people.certification.created',
    update: 'people.certification.created',
    delete: 'people.certification.deleted',
    entityType: 'certification',
    getEntityId: (r) => String(r.id ?? ''),
    buildPayload: (op, r) => ({ certification_id: r.id, crew_member_id: r.crew_member_id, certification_name: r.certification_name, expiry_date: r.expiry_date }),
  },
  crew_rotations: {
    insert: 'people.rotation.published',
    update: 'people.rotation.published',
    entityType: 'rotation',
    getEntityId: (r) => String(r.id ?? ''),
  },
  crew_payroll: {
    insert: 'finance.invoice.created',
    entityType: 'crew_member',
    getEntityId: (r) => String(r.id ?? ''),
  },

  // ═══════ MAINTENANCE ═══════
  maintenance_tasks: {
    insert: 'maintenance.task.created',
    update: 'maintenance.task.status_changed',
    entityType: 'maintenance_task',
    getEntityId: (r) => String(r.id ?? ''),
    buildPayload: (op, r) => ({ task_id: r.id, vessel_id: r.vessel_id, title: r.title, status: r.status, priority: r.priority }),
  },
  pms_work_orders: {
    insert: 'maintenance.work_order.created',
    update: 'maintenance.work_order.status_changed',
    entityType: 'work_order',
    getEntityId: (r) => String(r.id ?? ''),
    buildPayload: (op, r) => ({ work_order_id: r.id, vessel_id: r.vessel_id, status: r.status, priority: r.priority }),
  },
  pms_systems: {
    insert: 'maintenance.system.created',
    entityType: 'work_order',
    getEntityId: (r) => String(r.id ?? ''),
  },
  pms_jobs: {
    insert: 'maintenance.task.created',
    update: 'maintenance.task.status_changed',
    entityType: 'maintenance_task',
    getEntityId: (r) => String(r.id ?? ''),
  },
  inventory_items: {
    insert: 'maintenance.spare_part.added',
    update: 'maintenance.spare_part.added',
    entityType: 'work_order',
    getEntityId: (r) => String(r.id ?? ''),
  },
  impa_spare_parts: {
    insert: 'maintenance.spare_part.added',
    entityType: 'work_order',
    getEntityId: (r) => String(r.id ?? ''),
  },
  drydock_projects: {
    insert: 'maintenance.work_order.created',
    update: 'maintenance.work_order.status_changed',
    entityType: 'work_order',
    getEntityId: (r) => String(r.id ?? ''),
  },
  defect_work_requests: {
    insert: 'maintenance.work_order.created',
    update: 'maintenance.work_order.status_changed',
    entityType: 'work_order',
    getEntityId: (r) => String(r.id ?? ''),
  },

  // ═══════ COMPLIANCE ═══════
  audits: {
    insert: 'compliance.audit.created',
    update: 'compliance.audit.completed',
    entityType: 'audit',
    getEntityId: (r) => String(r.id ?? ''),
    buildPayload: (op, r) => ({ audit_id: r.id, vessel_id: r.vessel_id, audit_type: r.audit_type, status: r.status }),
  },
  findings: {
    insert: 'compliance.finding.created',
    update: 'compliance.finding.closed',
    entityType: 'finding',
    getEntityId: (r) => String(r.id ?? ''),
    buildPayload: (op, r) => ({ finding_id: r.id, audit_id: r.audit_id, severity: r.severity, status: r.status }),
  },
  certificates: {
    insert: 'compliance.certificate.expiring',
    update: 'compliance.certificate.expiring',
    entityType: 'certificate',
    getEntityId: (r) => String(r.id ?? ''),
  },
  class_surveys: {
    insert: 'compliance.class_survey.created',
    update: 'compliance.class_survey.updated',
    delete: 'compliance.class_survey.deleted',
    entityType: 'certificate',
    getEntityId: (r) => String(r.id ?? ''),
  },
  ism_elements: {
    insert: 'compliance.audit.created',
    update: 'compliance.audit.completed',
    entityType: 'audit',
    getEntityId: (r) => String(r.id ?? ''),
  },
  ism_capa: {
    insert: 'compliance.capa.created',
    update: 'compliance.capa.closed',
    entityType: 'finding',
    getEntityId: (r) => String(r.id ?? ''),
  },
  ism_gap_analysis: {
    insert: 'compliance.gap_analysis.completed',
    entityType: 'audit',
    getEntityId: (r) => String(r.id ?? ''),
  },
  sire2_inspections: {
    insert: 'compliance.audit.created',
    update: 'compliance.audit.completed',
    entityType: 'audit',
    getEntityId: (r) => String(r.id ?? ''),
  },
  sire2_findings: {
    insert: 'compliance.finding.created',
    update: 'compliance.finding.closed',
    entityType: 'finding',
    getEntityId: (r) => String(r.id ?? ''),
  },
  psc_inspections: {
    insert: 'compliance.audit.created',
    update: 'compliance.audit.completed',
    entityType: 'audit',
    getEntityId: (r) => String(r.id ?? ''),
  },
  permits_to_work: {
    insert: 'safety.jsa.template_created',
    entityType: 'audit',
    getEntityId: (r) => String(r.id ?? ''),
  },
  jsa_templates: {
    insert: 'safety.jsa.template_created',
    entityType: 'audit',
    getEntityId: (r) => String(r.id ?? ''),
  },
  jsa_records: {
    insert: 'safety.jsa.template_created',
    entityType: 'audit',
    getEntityId: (r) => String(r.id ?? ''),
  },

  // ═══════ FINANCE ═══════
  invoices: {
    insert: 'finance.invoice.created',
    update: 'finance.invoice.approved',
    entityType: 'invoice',
    getEntityId: (r) => String(r.id ?? ''),
    buildPayload: (op, r) => ({ invoice_id: r.id, amount: r.amount, status: r.status, supplier_id: r.supplier_id, voyage_id: r.voyage_id }),
  },
  expenses: {
    insert: 'finance.invoice.created',
    entityType: 'invoice',
    getEntityId: (r) => String(r.id ?? ''),
  },
  purchase_requisitions: {
    insert: 'procurement.requisition.created',
    update: 'procurement.requisition.approved',
    entityType: 'purchase_order',
    getEntityId: (r) => String(r.id ?? ''),
  },
  procurement_orders: {
    insert: 'finance.po.created',
    update: 'finance.po.approved',
    entityType: 'purchase_order',
    getEntityId: (r) => String(r.id ?? ''),
    buildPayload: (op, r) => ({ po_id: r.id, supplier_id: r.supplier_id, vessel_id: r.vessel_id, total_amount: r.estimated_total }),
  },
  charter_parties: {
    insert: 'finance.charter.created',
    update: 'finance.charter.status_changed',
    entityType: 'charter_party',
    getEntityId: (r) => String(r.id ?? ''),
  },
  eu_ets_tracking: {
    insert: 'finance.ets.record_created',
    entityType: 'vessel',
    getEntityId: (r) => String(r.id ?? ''),
  },

  // ═══════ DOCUMENTS ═══════
  documents: {
    insert: 'document.created',
    entityType: 'document',
    getEntityId: (r) => String(r.id ?? ''),
    buildPayload: (op, r) => ({ document_id: r.id, title: r.title, document_type: r.document_type }),
  },
  entity_documents: {
    insert: 'document.linked',
    entityType: 'document',
    getEntityId: (r) => String(r.id ?? ''),
  },

  // ═══════ TRACKING / SOC ═══════
  soc_alerts: {
    insert: 'tracking.alert.created',
    update: 'alert.acknowledged',
    entityType: 'alert',
    getEntityId: (r) => String(r.id ?? ''),
    buildPayload: (op, r) => ({ alert_id: r.id, vessel_id: r.vessel_id, severity: r.severity, alert_type: r.alert_type }),
  },
  telemetry_alerts: {
    insert: 'tracking.telemetry_alert.created',
    update: 'alert.acknowledged',
    entityType: 'alert',
    getEntityId: (r) => String(r.id ?? ''),
  },
  vessel_positions: {
    insert: 'tracking.position.updated',
    entityType: 'vessel',
    getEntityId: (r) => String(r.vessel_id ?? r.id ?? ''),
  },

  // ═══════ AI ═══════
  ai_decisions: {
    insert: 'ai.decision.logged',
    update: 'ai.suggestion.accepted',
    entityType: 'ai_decision',
    getEntityId: (r) => String(r.id ?? ''),
  },
  ai_insights: {
    insert: 'ai.suggestion.created',
    update: 'ai.insight.read',
    entityType: 'ai_decision',
    getEntityId: (r) => String(r.id ?? ''),
  },

  // ═══════ SAFETY ═══════
  incident_reports: {
    insert: 'safety.nc.created',
    update: 'safety.nc.status_changed',
    entityType: 'finding',
    getEntityId: (r) => String(r.id ?? ''),
  },
  near_miss_reports: {
    insert: 'safety.nc.created',
    entityType: 'finding',
    getEntityId: (r) => String(r.id ?? ''),
  },
  loto_procedures: {
    insert: 'safety.jsa.template_created',
    entityType: 'audit',
    getEntityId: (r) => String(r.id ?? ''),
  },

  // ═══════ PEO-DP ═══════
  peodp_equipment: {
    insert: 'peodp.fmea.item_created',
    update: 'peodp.fmea.item_updated',
    delete: 'peodp.fmea.item_deleted',
    entityType: 'vessel',
    getEntityId: (r) => String(r.id ?? ''),
  },
  peodp_logbook_entries: {
    insert: 'peodp.logbook.entry_created',
    delete: 'peodp.logbook.entry_deleted',
    entityType: 'vessel',
    getEntityId: (r) => String(r.id ?? ''),
  },

  // ═══════ MEDICAL ═══════
  medical_consultations: {
    insert: 'people.medical.fitness_updated',
    update: 'people.medical.fitness_updated',
    entityType: 'crew_member',
    getEntityId: (r) => String(r.crew_member_id ?? r.id ?? ''),
  },

  // ═══════ TRAINING ═══════
  training_records: {
    insert: 'people.training.completed',
    entityType: 'crew_member',
    getEntityId: (r) => String(r.crew_member_id ?? r.id ?? ''),
  },
  academy_courses: {
    insert: 'training.session.created',
    entityType: 'crew_member',
    getEntityId: (r) => String(r.id ?? ''),
  },
  academy_progress: {
    update: 'training.session.completed',
    entityType: 'crew_member',
    getEntityId: (r) => String(r.user_id ?? r.id ?? ''),
  },

  // ═══════ NOTIFICATIONS ═══════
  notifications: {
    update: 'notification.read',
    entityType: 'alert',
    getEntityId: (r) => String(r.id ?? ''),
  },

  // ═══════ ACTION ITEMS / TASKS ═══════
  action_items: {
    insert: 'safety.nc.created',
    update: 'safety.nc.status_changed',
    entityType: 'finding',
    getEntityId: (r) => String(r.id ?? ''),
  },

  // ═══════ MARPOL / ENVIRONMENTAL ═══════
  marpol_waste_records: {
    insert: 'compliance.marpol.entry_created',
    entityType: 'vessel',
    getEntityId: (r) => String(r.vessel_id ?? r.id ?? ''),
  },
  eu_mrv_submissions: {
    insert: 'compliance.marpol.entry_created',
    entityType: 'vessel',
    getEntityId: (r) => String(r.id ?? ''),
  },

  // ═══════ RECRUITMENT ═══════
  manning_agent_candidates: {
    update: 'recruitment.stage.changed',
    entityType: 'crew_member',
    getEntityId: (r) => String(r.id ?? ''),
  },

  // ═══════ VESSEL HISTORY ═══════
  vessel_history_events: {
    insert: 'fleet.history.event_created',
    delete: 'fleet.history.event_deleted',
    entityType: 'vessel',
    getEntityId: (r) => String(r.vessel_id ?? r.id ?? ''),
  },

  // ═══════ RUNNING HOURS / IoT ═══════
  iot_sensors: {
    update: 'maintenance.sensor_reading.updated',
    entityType: 'vessel',
    getEntityId: (r) => String(r.vessel_id ?? r.id ?? ''),
  },
  pms_running_hours_triggers: {
    insert: 'maintenance.running_hours.updated',
    update: 'maintenance.running_hours.updated',
    entityType: 'work_order',
    getEntityId: (r) => String(r.id ?? ''),
  },

  // ═══════ HULL INTEGRITY ═══════
  hull_inspection_zones: {
    insert: 'maintenance.hull.inspection_created',
    update: 'maintenance.hull.inspection_created',
    entityType: 'vessel',
    getEntityId: (r) => String(r.vessel_id ?? r.id ?? ''),
  },

  // ═══════ SUPPLIERS ═══════
  suppliers: {
    insert: 'finance.po.created',
    update: 'finance.po.created',
    entityType: 'purchase_order',
    getEntityId: (r) => String(r.id ?? ''),
  },

  // ═══════ WARRANTY ═══════
  warranty_claims: {
    insert: 'maintenance.work_order.created',
    update: 'maintenance.work_order.status_changed',
    entityType: 'work_order',
    getEntityId: (r) => String(r.id ?? ''),
  },

  // ═══════ INSURANCE ═══════
  insurance_policies: {
    insert: 'finance.charter.created',
    update: 'finance.charter.status_changed',
    entityType: 'charter_party',
    getEntityId: (r) => String(r.id ?? ''),
  },
  insurance_claims: {
    insert: 'finance.invoice.created',
    entityType: 'invoice',
    getEntityId: (r) => String(r.id ?? ''),
  },
};

// ============================================
// INTERCEPTOR ENGINE
// ============================================

/** Debounce map to avoid publishing duplicate events for the same entity within 500ms */
const recentEvents = new Map<string, number>();
const DEBOUNCE_MS = 500;

function shouldPublish(key: string): boolean {
  const now = Date.now();
  const last = recentEvents.get(key);
  if (last && now - last < DEBOUNCE_MS) return false;
  recentEvents.set(key, now);
  // Cleanup old entries every 100 events
  if (recentEvents.size > 200) {
    const cutoff = now - DEBOUNCE_MS * 2;
    for (const [k, v] of recentEvents) {
      if (v < cutoff) recentEvents.delete(k);
    }
  }
  return true;
}

/**
 * Process a successful Supabase mutation and publish the corresponding event.
 * Called after a .insert/.update/.delete/.upsert succeeds.
 */
export function interceptMutation(
  tableName: string,
  operation: 'insert' | 'update' | 'delete' | 'upsert',
  resultData: unknown
): void {
  const mapping = TABLE_EVENT_MAP[tableName];
  if (!mapping) return; // Table not mapped — skip silently

  const op = operation === 'upsert' ? 'insert' : operation;
  const eventType = mapping[op as 'insert' | 'update' | 'delete'];
  if (!eventType) return;

  // Extract rows from result (can be single object or array)
  const rows = Array.isArray(resultData) ? resultData : resultData ? [resultData] : [];
  if (rows.length === 0) return;

  for (const row of rows) {
    const r = row as Record<string, unknown>;
    const entityId = mapping.getEntityId?.(r) ?? String(r.id ?? '');
    const dedupeKey = `${eventType}:${entityId}`;

    if (!shouldPublish(dedupeKey)) continue;

    const payload = mapping.buildPayload
      ? mapping.buildPayload(op, r)
      : { ...r, _operation: op, _table: tableName };

    const event: DomainEvent = {
      type: eventType,
      payload,
      sourceEntityType: mapping.entityType,
      sourceEntityId: entityId,
      metadata: { auto_intercepted: true, table: tableName, operation: op },
    };

    // Emit locally for UI reactivity (instant)
    localEventBus.emit(event);

    // Persist to outbox (async, non-blocking)
    persistEventToOutbox(event).catch(() => {
      logger.warn(`[AutoIntegration] Failed to persist event ${eventType} for ${tableName}`);
    });
  }
}

/**
 * Persist event to outbox via Supabase RPC (same as publishEvent but decoupled)
 */
async function persistEventToOutbox(event: DomainEvent): Promise<void> {
  try {
    // Dynamic import to avoid circular dependency
    const { supabase } = await import("@/integrations/supabase/client");
    
    await supabase.rpc('publish_event', {
      p_event_type: event.type,
      p_payload: event.payload as any,
      p_source_entity_type: event.sourceEntityType as string,
      p_source_entity_id: event.sourceEntityId,
    });
  } catch (err) {
    // Non-critical: event was already emitted locally
    logger.warn('[AutoIntegration] Outbox persistence failed', err);
  }
}

// ============================================
// EXPORTS
// ============================================

export { TABLE_EVENT_MAP };
export type { TableEventMapping };
