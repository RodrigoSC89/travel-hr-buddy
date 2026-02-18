# NAUTI ONE — Integration Blueprint

## Architecture: "Tudo Conversa com Tudo"

### Overview
The NAUTI ONE integration architecture implements a **transactional outbox pattern** for cross-module communication, ensuring every domain event is persisted, auditable, and reliably delivered to consumers.

---

## Bounded Contexts (Domains)

| Domain | Core Entities | Owner Service |
|--------|--------------|---------------|
| **Core** | vessels, voyages, crew_members, documents | VesselsService, VoyagesService |
| **Ops** | port_calls, noon_reports, bunker_operations | VoyagesService |
| **Maintenance** | pms_work_orders, maintenance_tasks, inventory_items | MaintenanceService |
| **Compliance** | audits, findings, CAPAs, certificates, risk_items | ComplianceService |
| **Tracking** | vessel_positions, soc_alerts, geofences | TrackingService |
| **Finance** | invoices, expenses, procurement_orders, charter_parties | FinanceService |
| **People** | crew_rotations, crew_certifications, training | PeopleService |
| **AI** | ai_decisions, ai_tasks, agent_registry | AIService |
| **System** | integration_health, event_outbox, audit_events | SystemService |

---

## Integration Patterns

### 1. Event Outbox (Transactional)
Every domain mutation publishes an event to `event_outbox` within the same transaction via `publish_event()` RPC.

### 2. Local Event Bus (UI Reactivity)
`localEventBus` mirrors outbox events in-memory for immediate UI updates without polling.

### 3. Audit Trail (Universal)
Every event automatically logs to `audit_events` with actor, entity, diff, and metadata.

### 4. Entity Documents (Universal Linking)
`entity_documents` table links any document to any entity via `(entity_type, entity_id, document_id)`.

---

## Cross-Domain Data Flows

```
┌─────────┐    voyage.created    ┌──────────┐
│ Voyages │ ──────────────────── │  Fleet   │ (updates vessel status)
└────┬────┘                      └──────────┘
     │ voyage.created                  │
     ▼                                 ▼
┌──────────┐                    ┌──────────┐
│ Tracking │ ◄─── position ───► │  SOC     │
└──────────┘                    └──────────┘
     │ alert.created
     ▼
┌──────────┐    wo.completed    ┌────────────┐
│  Maint.  │ ──────────────────►│ Compliance │
└──────────┘                    └─────┬──────┘
                                      │ finding.created
                                      ▼
                                ┌──────────┐
                                │   Risk   │ → CAPA → Training
                                └──────────┘
```

---

## Key Integration Contracts

### A. Ops ↔ Fleet ↔ Voyage ↔ Tracking
- `voyage.created` → Fleet updates vessel assignment, Tracking starts monitoring
- `tracking.position.updated` → Voyage recalculates ETA
- `tracking.alert.created` → SOC dashboard, Voyage context

### B. Maintenance ↔ Compliance ↔ Documents
- `maintenance.work_order.completed` → Compliance closes evidence tasks
- Documents linked via `entity_documents` with purpose tags

### C. Compliance ↔ Risk ↔ CAPA ↔ Training
- `compliance.finding.created` → Risk matrix update, CAPA creation
- CAPA closure requires evidence + training if competency gap

### D. Finance ↔ Procurement ↔ Voyage P&L
- `finance.po.approved` → Contract budget debit, Voyage P&L cost entry
- `finance.invoice.approved` → Realized cost in P&L

### E. People ↔ Compliance ↔ Rotations
- `people.certification.expiring` → Rotation feature guard, Alert
- `people.rotation.published` → MLC work hours validation

### F. AI ↔ All Domains (HITL)
- `ai.decision.logged` → Pending human review
- `ai.suggestion.accepted` → Executes real action + audit trail

---

## Infrastructure

| Component | Location | Purpose |
|-----------|----------|---------|
| `event_outbox` | Supabase table | Persistent event store |
| `event_subscriptions` | Supabase table | Consumer registry |
| `entity_documents` | Supabase table | Universal doc linking |
| `integration_health` | Supabase table | Observability |
| `audit_events` | Supabase table | Universal audit trail |
| `publish_event()` | Supabase RPC | Transactional publish |
| `src/lib/events/event-bus.ts` | Frontend | Event publishing + local bus |
| `src/lib/events/event-catalog.ts` | Frontend | Event documentation |
| `src/lib/domain/types.ts` | Frontend | Canonical types |
| `src/services/domain/*` | Frontend | Domain services |
