/**
 * NAUTI ONE — Canonical Domain Types
 * Bounded contexts and shared invariants
 */

// ============================================
// CANONICAL STATUS ENUMS
// ============================================

export type EntityStatus = 'draft' | 'planned' | 'active' | 'completed' | 'cancelled';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
export type AlertSeverity = 'info' | 'warning' | 'critical' | 'emergency';

// ============================================
// DOMAIN BOUNDED CONTEXTS
// ============================================

export const DOMAINS = {
  CORE: 'core',
  OPS: 'ops',
  MAINTENANCE: 'maintenance',
  COMPLIANCE: 'compliance',
  TRACKING: 'tracking',
  FINANCE: 'finance',
  PEOPLE: 'people',
  AI: 'ai',
  SYSTEM: 'system',
} as const;

export type Domain = typeof DOMAINS[keyof typeof DOMAINS];

// ============================================
// CANONICAL ENTITY TYPES
// ============================================

export const ENTITY_TYPES = {
  // Core
  VESSEL: 'vessel',
  VOYAGE: 'voyage',
  CREW_MEMBER: 'crew_member',
  DOCUMENT: 'document',
  // Ops
  PORT_CALL: 'port_call',
  NOON_REPORT: 'noon_report',
  BUNKER_OPERATION: 'bunker_operation',
  // Maintenance
  WORK_ORDER: 'work_order',
  MAINTENANCE_TASK: 'maintenance_task',
  DRYDOCK_PROJECT: 'drydock_project',
  INVENTORY_ITEM: 'inventory_item',
  // Compliance
  AUDIT: 'audit',
  FINDING: 'finding',
  CAPA: 'capa',
  CERTIFICATE: 'certificate',
  NON_CONFORMITY: 'non_conformity',
  RISK_ITEM: 'risk_item',
  // Tracking
  POSITION: 'position',
  ALERT: 'alert',
  GEOFENCE: 'geofence',
  // Finance
  INVOICE: 'invoice',
  PURCHASE_ORDER: 'purchase_order',
  CONTRACT: 'contract',
  CHARTER_PARTY: 'charter_party',
  EXPENSE: 'expense',
  // People
  ROTATION: 'rotation',
  TRAINING: 'training',
  MEDICAL_RECORD: 'medical_record',
  CERTIFICATION: 'certification',
  // AI
  AI_DECISION: 'ai_decision',
  AI_TASK: 'ai_task',
  // People extended
  FEEDBACK: 'feedback',
  COMMUNICATION: 'communication',
  USER: 'user',
  // PEO-DP
  LOGBOOK_ENTRY: 'logbook_entry',
  FMEA_ITEM: 'fmea_item',
  // System
  INTEGRATION: 'integration',
  WEBHOOK: 'webhook',
  // Extended domain types (used in module hooks)
  SURVEY: 'survey',
  PREDICTION: 'prediction',
  EQUIPMENT: 'equipment',
  INSPECTION: 'inspection',
  NOTIFICATION: 'notification',
  DRILL: 'drill',
  MARPOL_ENTRY: 'marpol_entry',
  PURCHASE_REQUISITION: 'purchase_requisition',
} as const;

export type EntityType = typeof ENTITY_TYPES[keyof typeof ENTITY_TYPES];

// ============================================
// CROSS-DOMAIN RELATIONSHIP MAP
// ============================================

export const ENTITY_DOMAIN_MAP: Record<EntityType, Domain> = {
  vessel: 'core',
  voyage: 'core',
  crew_member: 'core',
  document: 'core',
  port_call: 'ops',
  noon_report: 'ops',
  bunker_operation: 'ops',
  work_order: 'maintenance',
  maintenance_task: 'maintenance',
  drydock_project: 'maintenance',
  inventory_item: 'maintenance',
  audit: 'compliance',
  finding: 'compliance',
  capa: 'compliance',
  certificate: 'compliance',
  non_conformity: 'compliance',
  risk_item: 'compliance',
  position: 'tracking',
  alert: 'tracking',
  geofence: 'tracking',
  invoice: 'finance',
  purchase_order: 'finance',
  contract: 'finance',
  charter_party: 'finance',
  expense: 'finance',
  rotation: 'people',
  training: 'people',
  medical_record: 'people',
  certification: 'people',
  ai_decision: 'ai',
  ai_task: 'ai',
  feedback: 'people',
  communication: 'system',
  user: 'system',
  logbook_entry: 'ops',
  fmea_item: 'maintenance',
  integration: 'system',
  webhook: 'system',
  survey: 'compliance',
  prediction: 'maintenance',
  equipment: 'maintenance',
  inspection: 'maintenance',
  notification: 'system',
  drill: 'compliance',
  marpol_entry: 'compliance',
  purchase_requisition: 'finance',
};

// ============================================
// BASE ENTITY INTERFACE
// ============================================

export interface BaseEntity {
  id: string;
  organization_id?: string | null;
  created_at?: string;
  updated_at?: string;
  created_by?: string | null;
}

// ============================================
// RELATED RECORDS CONFIG
// ============================================

export interface RelatedRecordConfig {
  entityType: EntityType;
  label: string;
  foreignKey: string;
  targetTable: string;
  icon?: string;
}

/** Defines which entity types can relate to a given entity */
export const RELATED_RECORDS_MAP: Partial<Record<EntityType, RelatedRecordConfig[]>> = {
  vessel: [
    { entityType: 'voyage', label: 'Viagens', foreignKey: 'vessel_id', targetTable: 'voyages' },
    { entityType: 'work_order', label: 'Ordens de Serviço', foreignKey: 'vessel_id', targetTable: 'pms_work_orders' },
    { entityType: 'audit', label: 'Auditorias', foreignKey: 'vessel_id', targetTable: 'internal_audits' },
    { entityType: 'certificate', label: 'Certificados', foreignKey: 'vessel_id', targetTable: 'class_surveys' },
    { entityType: 'crew_member', label: 'Tripulação', foreignKey: 'vessel_id', targetTable: 'crew_members' },
    { entityType: 'alert', label: 'Alertas', foreignKey: 'vessel_id', targetTable: 'soc_alerts' },
    { entityType: 'invoice', label: 'Faturas', foreignKey: 'vessel_id', targetTable: 'invoices' },
    { entityType: 'maintenance_task', label: 'Manutenção', foreignKey: 'vessel_id', targetTable: 'maintenance_tasks' },
  ],
  voyage: [
    { entityType: 'port_call', label: 'Escalas', foreignKey: 'voyage_id', targetTable: 'port_calls' },
    { entityType: 'noon_report', label: 'Noon Reports', foreignKey: 'voyage_id', targetTable: 'noon_reports' },
    { entityType: 'alert', label: 'Alertas', foreignKey: 'voyage_id', targetTable: 'soc_alerts' },
    { entityType: 'expense', label: 'Custos', foreignKey: 'voyage_id', targetTable: 'expenses' },
    { entityType: 'document', label: 'Documentos', foreignKey: 'entity_id', targetTable: 'entity_documents' },
  ],
  audit: [
    { entityType: 'finding', label: 'Achados', foreignKey: 'audit_id', targetTable: 'sire2_findings' },
    { entityType: 'document', label: 'Evidências', foreignKey: 'entity_id', targetTable: 'entity_documents' },
  ],
};
