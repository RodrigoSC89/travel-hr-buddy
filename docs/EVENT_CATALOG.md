# NAUTI ONE — Event Catalog

## Event Types & Payloads

### Core Events

| Event | Producer | Consumers | Payload |
|-------|----------|-----------|---------|
| `vessel.created` | VesselsService | FleetHub, TrackingService | `{vessel_id, name, vessel_type}` |
| `vessel.updated` | VesselsService | FleetHub, ComplianceService | `{vessel_id, updated_fields}` |

### Voyage Events

| Event | Producer | Consumers | Payload |
|-------|----------|-----------|---------|
| `voyage.created` | VoyagesService | FleetService, TrackingService, FinanceService | `{voyage_id, vessel_id, departure_port, arrival_port}` |
| `voyage.completed` | VoyagesService | FinanceService (P&L), ComplianceService (MRV), FleetService | `{voyage_id, vessel_id, actual_arrival, fuel_consumed}` |

### Maintenance Events

| Event | Producer | Consumers | Payload |
|-------|----------|-----------|---------|
| `maintenance.work_order.created` | MaintenanceService | ComplianceService, InventoryService, DocumentService | `{work_order_id, vessel_id, equipment_id, priority}` |
| `maintenance.work_order.completed` | MaintenanceService | ComplianceService (evidence), FinanceService (cost) | `{work_order_id, vessel_id, actual_cost, completion_date}` |
| `maintenance.task.overdue` | PMS Cron | AlertService, MaintenanceHub | `{task_id, vessel_id, days_overdue}` |

### Compliance Events

| Event | Producer | Consumers | Payload |
|-------|----------|-----------|---------|
| `compliance.audit.created` | ComplianceService | AuditHub, DocumentService | `{audit_id, vessel_id, audit_type}` |
| `compliance.finding.created` | ComplianceService | RiskService, CAPAService, TrainingService | `{finding_id, audit_id, vessel_id, severity, category}` |
| `compliance.finding.closed` | ComplianceService | RiskService (update), AuditTrail | `{finding_id, resolution}` |
| `compliance.certificate.expiring` | CertificateMonitor | AlertService, RotationService | `{certificate_id, vessel_id, expiry_date, days_remaining}` |

### Finance Events

| Event | Producer | Consumers | Payload |
|-------|----------|-----------|---------|
| `finance.invoice.approved` | FinanceService | VoyagePnL, ContractService | `{invoice_id, supplier_id, amount, currency, voyage_id}` |
| `finance.po.approved` | FinanceService | ContractService, VoyagePnL, SupplierService | `{po_id, supplier_id, vessel_id, total_amount}` |

### People Events

| Event | Producer | Consumers | Payload |
|-------|----------|-----------|---------|
| `people.rotation.published` | PeopleService | MLCValidator, STCWValidator, FleetService | `{rotation_id, vessel_id, crew_assignments}` |
| `people.certification.expiring` | CertificateMonitor | RotationService (guard), AlertService, ComplianceService | `{certification_id, crew_id, cert_type, expiry_date, days_remaining}` |
| `people.training.completed` | TrainingService | ComplianceService (CAPA), CrewProfile | `{training_id, crew_id, course_name}` |

### Tracking Events

| Event | Producer | Consumers | Payload |
|-------|----------|-----------|---------|
| `tracking.alert.created` | TrackingService | SOCDashboard, VoyageService | `{alert_id, vessel_id, voyage_id, severity}` |
| `tracking.connectivity.degraded` | TrackingService | IntegrationHealth, SOC | `{vessel_id, provider, signal_quality}` |

### AI Events

| Event | Producer | Consumers | Payload |
|-------|----------|-----------|---------|
| `ai.decision.logged` | AIService | AuditTrail, AIControlTower | `{decision_id, entity_type, entity_id, confidence, reasoning}` |
| `ai.suggestion.accepted` | AIControlTower | TargetService, AuditTrail, AILearning | `{suggestion_id, action_type, accepted_by}` |
| `ai.suggestion.rejected` | AIControlTower | AuditTrail, AILearning | `{suggestion_id, rejected_reason}` |

### Document Events

| Event | Producer | Consumers | Payload |
|-------|----------|-----------|---------|
| `document.linked` | DocumentsService | ComplianceService (evidence), AuditTrail | `{document_id, entity_type, entity_id, purpose}` |

### System Events

| Event | Producer | Consumers | Payload |
|-------|----------|-----------|---------|
| `system.integration.error` | IntegrationMonitor | IntegrationHealth, SOC | `{integration_name, error_message, error_count}` |
| `system.health.degraded` | HealthCheck | SystemHub, AuditTrail | `{service_name, status, latency_ms}` |
