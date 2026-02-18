/**
 * NAUTI ONE — Event Catalog
 * Documents all domain events, their payloads, and consumers
 */

import type { EventType } from './event-bus';

interface EventCatalogEntry {
  type: EventType;
  domain: string;
  description: string;
  producer: string;
  consumers: string[];
  payloadFields: string[];
}

export const EVENT_CATALOG: EventCatalogEntry[] = [
  // ── VOYAGE ──
  {
    type: 'voyage.created',
    domain: 'ops',
    description: 'Nova viagem criada com vessel_id e rota',
    producer: 'VoyageService',
    consumers: ['FleetService (atualiza status)', 'TrackingService (inicia monitoramento)', 'FinanceService (cria budget)'],
    payloadFields: ['voyage_id', 'vessel_id', 'departure_port', 'arrival_port', 'departure_date'],
  },
  {
    type: 'voyage.completed',
    domain: 'ops',
    description: 'Viagem finalizada com dados de performance',
    producer: 'VoyageService',
    consumers: ['FinanceService (fecha P&L)', 'ComplianceService (verifica MRV)', 'FleetService (libera navio)'],
    payloadFields: ['voyage_id', 'vessel_id', 'actual_arrival', 'fuel_consumed', 'distance_nm'],
  },
  // ── MAINTENANCE ──
  {
    type: 'maintenance.work_order.created',
    domain: 'maintenance',
    description: 'Nova OS criada para equipamento/sistema',
    producer: 'MaintenanceService',
    consumers: ['ComplianceService (vincula se ISM)', 'InventoryService (reserva peças)', 'DocumentService (evidências)'],
    payloadFields: ['work_order_id', 'vessel_id', 'equipment_id', 'priority', 'due_date'],
  },
  {
    type: 'maintenance.work_order.completed',
    domain: 'maintenance',
    description: 'OS finalizada com evidências',
    producer: 'MaintenanceService',
    consumers: ['ComplianceService (fecha evidence task)', 'FinanceService (custo realizado)', 'AuditTrail'],
    payloadFields: ['work_order_id', 'vessel_id', 'actual_cost', 'completion_date', 'documents'],
  },
  // ── COMPLIANCE ──
  {
    type: 'compliance.finding.created',
    domain: 'compliance',
    description: 'Nova não-conformidade detectada em auditoria',
    producer: 'ComplianceService',
    consumers: ['RiskService (atualiza risk_item)', 'CAPAService (cria CAPA)', 'TrainingService (se competency gap)'],
    payloadFields: ['finding_id', 'audit_id', 'vessel_id', 'severity', 'category', 'description'],
  },
  {
    type: 'compliance.certificate.expiring',
    domain: 'compliance',
    description: 'Certificado expira em < 30 dias',
    producer: 'CertificateMonitor (cron)',
    consumers: ['AlertService (gera alerta)', 'RotationService (bloqueia escala)', 'NotificationService'],
    payloadFields: ['certificate_id', 'crew_id', 'vessel_id', 'expiry_date', 'days_remaining'],
  },
  // ── FINANCE ──
  {
    type: 'finance.po.approved',
    domain: 'finance',
    description: 'Purchase Order aprovada',
    producer: 'FinanceService',
    consumers: ['ContractService (debita budget)', 'VoyagePnL (lança custo)', 'SupplierService (notifica)'],
    payloadFields: ['po_id', 'supplier_id', 'vessel_id', 'voyage_id', 'total_amount', 'currency'],
  },
  {
    type: 'finance.invoice.approved',
    domain: 'finance',
    description: 'Fatura aprovada para pagamento',
    producer: 'FinanceService',
    consumers: ['VoyagePnL (custo realizado)', 'ContractService (consumo)', 'AuditTrail'],
    payloadFields: ['invoice_id', 'supplier_id', 'amount', 'currency', 'voyage_id'],
  },
  // ── PEOPLE ──
  {
    type: 'people.rotation.published',
    domain: 'people',
    description: 'Escala de rotação publicada',
    producer: 'PeopleService',
    consumers: ['MLCValidator (work hours)', 'STCWValidator (certs)', 'FleetService (manning)'],
    payloadFields: ['rotation_id', 'vessel_id', 'crew_assignments', 'start_date', 'end_date'],
  },
  {
    type: 'people.certification.expiring',
    domain: 'people',
    description: 'Certificação de tripulante expirando',
    producer: 'CertificateMonitor (cron)',
    consumers: ['RotationService (feature guard)', 'AlertService', 'ComplianceService (STCW gap)'],
    payloadFields: ['certification_id', 'crew_id', 'cert_type', 'expiry_date', 'days_remaining'],
  },
  // ── TRACKING ──
  {
    type: 'tracking.alert.created',
    domain: 'tracking',
    description: 'Alerta gerado por condição de rastreamento',
    producer: 'TrackingService',
    consumers: ['SOCDashboard (display)', 'VoyageService (ETA update)', 'AuditTrail'],
    payloadFields: ['alert_id', 'vessel_id', 'voyage_id', 'alert_type', 'severity', 'position'],
  },
  {
    type: 'tracking.connectivity.degraded',
    domain: 'tracking',
    description: 'Conectividade satcom degradada',
    producer: 'TrackingService',
    consumers: ['IntegrationHealth (atualiza status)', 'SOCDashboard', 'AuditTrail'],
    payloadFields: ['vessel_id', 'provider', 'signal_quality', 'last_seen_at'],
  },
  // ── AI ──
  {
    type: 'ai.decision.logged',
    domain: 'ai',
    description: 'IA registrou decisão autônoma para review',
    producer: 'AIService',
    consumers: ['AuditTrail', 'AIControlTower (display)', 'NotificationService'],
    payloadFields: ['decision_id', 'entity_type', 'entity_id', 'confidence', 'action_type', 'reasoning'],
  },
  {
    type: 'ai.suggestion.accepted',
    domain: 'ai',
    description: 'Usuário aceitou sugestão da IA',
    producer: 'AIControlTower',
    consumers: ['TargetService (executa ação)', 'AuditTrail', 'AILearning (feedback)'],
    payloadFields: ['suggestion_id', 'entity_type', 'entity_id', 'action_type', 'accepted_by'],
  },
  // ── DOCUMENTS ──
  {
    type: 'document.linked',
    domain: 'core',
    description: 'Documento vinculado a uma entidade',
    producer: 'DocumentService',
    consumers: ['ComplianceService (evidence)', 'AuditTrail'],
    payloadFields: ['document_id', 'entity_type', 'entity_id', 'purpose', 'linked_by'],
  },
  // ── SYSTEM ──
  {
    type: 'system.integration.error',
    domain: 'system',
    description: 'Integração externa falhou',
    producer: 'IntegrationHealthMonitor',
    consumers: ['IntegrationHealth (atualiza status)', 'SOCDashboard', 'AuditTrail'],
    payloadFields: ['integration_name', 'error_message', 'error_count', 'last_success_at'],
  },
];

/** Get consumers for a given event type */
export function getConsumersForEvent(type: EventType): string[] {
  const entry = EVENT_CATALOG.find(e => e.type === type);
  return entry?.consumers ?? [];
}

/** Get all events produced by a domain */
export function getEventsByDomain(domain: string): EventCatalogEntry[] {
  return EVENT_CATALOG.filter(e => e.domain === domain);
}
