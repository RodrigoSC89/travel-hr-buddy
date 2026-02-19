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

import { localEventBus, EVENT_TYPES, type EventType, type DomainEvent } from "@/lib/events/event-bus";
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
    buildPayload: (op, r) => ({
      work_order_id: r.id, vessel_id: r.vessel_id, status: r.status, priority: r.priority,
      actual_cost: r.actual_cost, work_order_number: r.work_order_number, title: r.title,
    }),
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

  // ═══════ SAFETY (LOTO) ═══════
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
    insert: 'maintenance.warranty.created',
    update: 'maintenance.work_order.status_changed',
    entityType: 'work_order',
    getEntityId: (r) => String(r.id ?? ''),
  },

  // ═══════ INSURANCE ═══════
  insurance_policies: {
    insert: 'finance.contract.created',
    update: 'finance.contract.updated',
    entityType: 'charter_party',
    getEntityId: (r) => String(r.id ?? ''),
  },
  insurance_claims: {
    insert: 'finance.invoice.created',
    entityType: 'invoice',
    getEntityId: (r) => String(r.id ?? ''),
  },

  // ═══════════════════════════════════════════════════════
  // WAVE 63 — COMPLETE TABLE COVERAGE
  // ═══════════════════════════════════════════════════════

  // ═══════ NON-CONFORMITIES ═══════
  non_conformities: {
    insert: 'compliance.nc.created',
    update: 'compliance.nc.status_changed',
    entityType: 'finding',
    getEntityId: (r) => String(r.id ?? ''),
    buildPayload: (op, r) => ({ nc_id: r.id, vessel_id: r.vessel_id, severity: r.severity, status: r.status, category: r.category }),
  },

  // ═══════ INTERNAL AUDITS ═══════
  internal_audits: {
    insert: 'compliance.internal_audit.created',
    update: 'compliance.internal_audit.completed',
    entityType: 'audit',
    getEntityId: (r) => String(r.id ?? ''),
    buildPayload: (op, r) => ({ audit_id: r.id, vessel_id: r.vessel_id, audit_type: r.audit_type, status: r.status }),
  },

  // ═══════ CHECKLISTS ═══════
  operational_checklists: {
    insert: 'operations.checklist.created',
    update: 'operations.checklist.completed',
    entityType: 'audit',
    getEntityId: (r) => String(r.id ?? ''),
  },
  checklist_completions: {
    insert: 'operations.checklist.completed',
    entityType: 'audit',
    getEntityId: (r) => String(r.id ?? ''),
  },
  checklist_items: {
    update: 'operations.checklist.completed',
    entityType: 'audit',
    getEntityId: (r) => String(r.id ?? ''),
  },

  // ═══════ DRILLS / SAFETY ═══════
  drill_records: {
    insert: 'safety.drill.created',
    update: 'safety.drill.completed',
    entityType: 'finding',
    getEntityId: (r) => String(r.id ?? ''),
    buildPayload: (op, r) => ({ drill_id: r.id, vessel_id: r.vessel_id, drill_type: r.drill_type, status: r.status }),
  },
  incident_reports: {
    insert: 'safety.incident.created',
    update: 'safety.incident.updated',
    entityType: 'finding',
    getEntityId: (r) => String(r.id ?? ''),
    buildPayload: (op, r) => ({ incident_id: r.id, vessel_id: r.vessel_id, severity: r.severity, status: r.status }),
  },
  near_miss_reports: {
    insert: 'safety.near_miss.created',
    entityType: 'finding',
    getEntityId: (r) => String(r.id ?? ''),
  },

  // ═══════ FINANCE EXPANDED ═══════
  financial_transactions: {
    insert: 'finance.transaction.created',
    entityType: 'invoice',
    getEntityId: (r) => String(r.id ?? ''),
    buildPayload: (op, r) => ({ transaction_id: r.id, amount: r.amount, type: r.transaction_type, vessel_id: r.vessel_id }),
  },
  budgets: {
    insert: 'finance.budget.created',
    update: 'finance.budget.updated',
    entityType: 'invoice',
    getEntityId: (r) => String(r.id ?? ''),
  },
  crew_payroll: {
    insert: 'finance.payroll.created',
    entityType: 'crew_member',
    getEntityId: (r) => String(r.crew_member_id ?? r.id ?? ''),
  },
  charter_contracts: {
    insert: 'finance.contract.created',
    update: 'finance.contract.updated',
    entityType: 'charter_party',
    getEntityId: (r) => String(r.id ?? ''),
  },

  // ═══════ HR / PEOPLE EXPANDED ═══════
  leave_requests: {
    insert: 'people.leave.requested',
    update: 'people.leave.approved',
    entityType: 'crew_member',
    getEntityId: (r) => String(r.crew_member_id ?? r.id ?? ''),
  },
  performance_evaluations: {
    insert: 'people.evaluation.created',
    entityType: 'crew_member',
    getEntityId: (r) => String(r.crew_member_id ?? r.id ?? ''),
  },
  wellness_assessments: {
    insert: 'people.wellness.updated',
    update: 'people.wellness.updated',
    entityType: 'crew_member',
    getEntityId: (r) => String(r.crew_member_id ?? r.id ?? ''),
  },
  hr_climate_responses: {
    insert: 'people.climate.response',
    entityType: 'crew_member',
    getEntityId: (r) => String(r.id ?? ''),
  },
  crew_contracts: {
    insert: 'finance.contract.created',
    update: 'finance.contract.updated',
    entityType: 'crew_member',
    getEntityId: (r) => String(r.crew_member_id ?? r.id ?? ''),
  },

  // ═══════ MEDICAL EXPANDED ═══════
  medical_records: {
    insert: 'medical.record.created',
    update: 'medical.record.updated',
    entityType: 'crew_member',
    getEntityId: (r) => String(r.crew_member_id ?? r.id ?? ''),
    buildPayload: (op, r) => ({ record_id: r.id, crew_member_id: r.crew_member_id, record_type: r.record_type }),
  },
  medical_consultations: {
    insert: 'medical.record.created',
    update: 'medical.record.updated',
    entityType: 'crew_member',
    getEntityId: (r) => String(r.crew_member_id ?? r.id ?? ''),
  },

  // ═══════ CARGO / OPERATIONS ═══════
  cargo_operations: {
    insert: 'operations.cargo.created',
    update: 'operations.cargo.updated',
    entityType: 'voyage',
    getEntityId: (r) => String(r.id ?? ''),
    buildPayload: (op, r) => ({ cargo_id: r.id, vessel_id: r.vessel_id, status: r.status }),
  },
  cargo_shipments: {
    insert: 'operations.cargo.created',
    update: 'operations.cargo.updated',
    entityType: 'voyage',
    getEntityId: (r) => String(r.id ?? ''),
  },
  bunker_operations: {
    insert: 'operations.bunker.created',
    entityType: 'vessel',
    getEntityId: (r) => String(r.vessel_id ?? r.id ?? ''),
  },
  ballast_water_records: {
    insert: 'operations.ballast.created',
    entityType: 'vessel',
    getEntityId: (r) => String(r.vessel_id ?? r.id ?? ''),
  },

  // ═══════ MAINTENANCE EXPANDED ═══════
  maintenance_records: {
    insert: 'maintenance.record.created',
    update: 'maintenance.record.updated',
    entityType: 'maintenance_task',
    getEntityId: (r) => String(r.id ?? ''),
    buildPayload: (op, r) => ({ record_id: r.id, vessel_id: r.vessel_id, title: r.title, status: r.status }),
  },
  defect_work_requests: {
    insert: 'maintenance.defect.created',
    update: 'maintenance.work_order.status_changed',
    entityType: 'work_order',
    getEntityId: (r) => String(r.id ?? ''),
  },
  drydock_projects: {
    insert: 'maintenance.drydock.created',
    update: 'maintenance.drydock.updated',
    entityType: 'work_order',
    getEntityId: (r) => String(r.id ?? ''),
  },

  // ═══════ EMISSIONS / ENVIRONMENTAL ═══════
  emissions_records: {
    insert: 'environmental.emissions.created',
    update: 'environmental.emissions.updated',
    entityType: 'vessel',
    getEntityId: (r) => String(r.vessel_id ?? r.id ?? ''),
  },
  cii_ratings: {
    insert: 'environmental.emissions.created',
    entityType: 'vessel',
    getEntityId: (r) => String(r.vessel_id ?? r.id ?? ''),
  },

  // ═══════ COMMUNICATION ═══════
  channel_messages: {
    insert: 'comms.message.sent',
    entityType: 'alert',
    getEntityId: (r) => String(r.id ?? ''),
  },

  // ═══════ AUTOMATION ═══════
  automation_workflows: {
    insert: 'automation.workflow.created',
    update: 'automation.workflow.executed',
    entityType: 'alert',
    getEntityId: (r) => String(r.id ?? ''),
  },
  automation_executions: {
    insert: 'automation.workflow.executed',
    entityType: 'alert',
    getEntityId: (r) => String(r.id ?? ''),
  },

  // ═══════ CALENDAR ═══════
  calendar_events: {
    insert: 'calendar.event.created',
    update: 'calendar.event.updated',
    entityType: 'alert',
    getEntityId: (r) => String(r.id ?? ''),
  },

  // ═══════ SGSO / ISM ═══════
  sgso_plans: {
    insert: 'compliance.sgso.plan_created',
    update: 'compliance.sgso.plan_updated',
    entityType: 'audit',
    getEntityId: (r) => String(r.id ?? ''),
  },

  // ═══════ PREOVID ═══════
  preovid_audits: {
    insert: 'compliance.preovid.created',
    update: 'compliance.preovid.updated',
    entityType: 'audit',
    getEntityId: (r) => String(r.id ?? ''),
  },
  preovid_responses: {
    insert: 'compliance.preovid.updated',
    update: 'compliance.preovid.updated',
    entityType: 'audit',
    getEntityId: (r) => String(r.audit_id ?? r.id ?? ''),
  },

  // ═══════ PEOTRAM ═══════
  peotram_audits: {
    insert: 'compliance.peotram.audit_created',
    update: 'compliance.peotram.audit_updated',
    entityType: 'audit',
    getEntityId: (r) => String(r.id ?? ''),
  },

  // ═══════ RESERVATIONS / TRAVEL ═══════
  reservations: {
    insert: 'travel.reservation.created',
    update: 'travel.reservation.updated',
    entityType: 'crew_member',
    getEntityId: (r) => String(r.id ?? ''),
  },

  // ═══════ VESSEL DOWNTIME ═══════
  vessel_downtimes: {
    insert: 'fleet.downtime.created',
    update: 'fleet.downtime.updated',
    entityType: 'vessel',
    getEntityId: (r) => String(r.vessel_id ?? r.id ?? ''),
  },

  // ═══════ CBT (Computer Based Training) ═══════
  cbt_courses: {
    insert: 'training.cbt.started',
    entityType: 'crew_member',
    getEntityId: (r) => String(r.id ?? ''),
  },
  cbt_progress: {
    insert: 'training.cbt.started',
    update: 'training.cbt.completed',
    entityType: 'crew_member',
    getEntityId: (r) => String(r.user_id ?? r.id ?? ''),
  },

  // ═══════ MANNING AGENTS ═══════
  manning_agent_candidates: {
    insert: 'recruitment.candidate.created',
    update: 'recruitment.candidate.updated',
    entityType: 'crew_member',
    getEntityId: (r) => String(r.id ?? ''),
  },
  manning_agents: {
    insert: 'procurement.supplier.created',
    update: 'procurement.supplier.updated',
    entityType: 'purchase_order',
    getEntityId: (r) => String(r.id ?? ''),
  },

  // ═══════ IoT / SENSOR DATA ═══════
  iot_sensor_data: {
    insert: 'iot.sensor_data.created',
    entityType: 'vessel',
    getEntityId: (r) => String(r.sensor_id ?? r.id ?? ''),
  },

  // ═══════ ANALYTICS / REPORTS ═══════
  analytics_reports: {
    insert: 'analytics.report.generated',
    entityType: 'alert',
    getEntityId: (r) => String(r.id ?? ''),
  },
  analytics_dashboards: {
    update: 'analytics.dashboard.updated',
    entityType: 'alert',
    getEntityId: (r) => String(r.id ?? ''),
  },
  ai_reports: {
    insert: 'analytics.report.generated',
    entityType: 'alert',
    getEntityId: (r) => String(r.id ?? ''),
  },

  // ═══════ PROFILES / USERS ═══════
  profiles: {
    update: 'people.crew.assigned',
    entityType: 'crew_member',
    getEntityId: (r) => String(r.id ?? ''),
  },
  user_roles: {
    insert: 'access.role.changed',
    update: 'access.role.changed',
    entityType: 'crew_member',
    getEntityId: (r) => String(r.user_id ?? r.id ?? ''),
  },

  // ═══════ MARITIME CERTIFICATES ═══════
  maritime_certificates: {
    insert: 'compliance.certificate.expiring',
    update: 'compliance.certificate.expiring',
    entityType: 'certificate',
    getEntityId: (r) => String(r.id ?? ''),
    buildPayload: (op, r) => ({ cert_id: r.id, crew_member_id: r.crew_member_id, certificate_type: r.certificate_type, expiry_date: r.expiry_date }),
  },

  // ═══════ COMPLIANCE ITEMS ═══════
  compliance_items: {
    insert: 'compliance.audit.created',
    update: 'compliance.audit.completed',
    entityType: 'audit',
    getEntityId: (r) => String(r.id ?? ''),
  },

  // ═══════ ALERT RULES ═══════
  alert_rules: {
    insert: 'tracking.alert.created',
    update: 'alert.acknowledged',
    entityType: 'alert',
    getEntityId: (r) => String(r.id ?? ''),
  },

  // ═══════ TASK / TODO MANAGEMENT ═══════
  autonomous_tasks: {
    insert: 'operations.task.created',
    update: 'operations.task.updated',
    entityType: 'finding',
    getEntityId: (r) => String(r.id ?? ''),
  },

  // ═══════ DOCUMENT VERSIONS ═══════
  document_versions: {
    insert: 'document.version.created',
    entityType: 'document',
    getEntityId: (r) => String(r.document_id ?? r.id ?? ''),
  },

  // ═══════ AI EXPANDED ═══════
  ai_suggestions: {
    insert: 'ai.suggestion.created',
    update: 'ai.suggestion.accepted',
    entityType: 'ai_decision',
    getEntityId: (r) => String(r.id ?? ''),
  },
  ai_chat_conversations: {
    insert: 'ai.decision.logged',
    entityType: 'ai_decision',
    getEntityId: (r) => String(r.id ?? ''),
  },
  ai_generated_documents: {
    insert: 'document.created',
    update: 'document.created',
    entityType: 'document',
    getEntityId: (r) => String(r.id ?? ''),
  },
  ai_maintenance_predictions: {
    insert: 'maintenance.prediction.created',
    entityType: 'maintenance_task',
    getEntityId: (r) => String(r.id ?? ''),
  },
  ai_risk_assessments: {
    insert: 'compliance.finding.created',
    entityType: 'finding',
    getEntityId: (r) => String(r.id ?? ''),
  },
  ai_contract_analysis: {
    insert: 'finance.contract.created',
    entityType: 'charter_party',
    getEntityId: (r) => String(r.id ?? ''),
  },

  // ═══════ NOON REPORTS ═══════
  noon_reports: {
    insert: 'operations.noon.report_created',
    update: 'operations.noon.report_created',
    entityType: 'voyage',
    getEntityId: (r) => String(r.id ?? ''),
    buildPayload: (op, r) => ({ report_id: r.id, vessel_id: r.vessel_id, latitude: r.latitude, longitude: r.longitude, fuel_consumption: r.fuel_consumption, hfo_consumption: r.hfo_consumption }),
  },

  // ═══════ POOL SETTLEMENTS ═══════
  pool_settlements: {
    insert: 'finance.pool.settlement_created',
    entityType: 'invoice',
    getEntityId: (r) => String(r.id ?? ''),
    buildPayload: (op, r) => ({ id: r.id, vessel_id: r.vessel_id, pool_name: r.pool_name, amount: r.amount, settlement_amount: r.settlement_amount, period: r.period }),
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
  let eventType = mapping[op as 'insert' | 'update' | 'delete'];
  if (!eventType) return;

  // Smart event type resolution: detect "completed" status from data
  // This fixes the mismatch where interceptor maps update→status_changed
  // but side effects have richer logic on the .completed variant
  if (op === 'update' && Array.isArray(resultData) ? resultData.length > 0 : resultData) {
    const firstRow = (Array.isArray(resultData) ? resultData[0] : resultData) as Record<string, unknown>;
    const status = String(firstRow?.status ?? '').toLowerCase();
    if (status === 'completed' || status === 'closed' || status === 'approved') {
      const completedKey = eventType.replace('.status_changed', `.${status}`)
        .replace('.updated', `.${status}`) as EventType;
      // Check if there's a more specific event type registered
      if (completedKey in EVENT_TYPES) {
        eventType = completedKey;
      }
    }
  }

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
