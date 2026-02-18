# NAUTI ONE — Data Dictionary

## Core Tables

| Table | Domain | Purpose | Primary Key | Critical FKs | Indexes |
|-------|--------|---------|-------------|--------------|---------|
| `vessels` | Core | Fleet registry | `id` (uuid) | `organization_id → organizations` | name, imo_number |
| `voyages` | Core | Voyage lifecycle | `id` (uuid) | `vessel_id → vessels` | vessel_id, status |
| `crew_members` | Core | Personnel records | `id` (uuid) | `vessel_id → vessels`, `organization_id → organizations` | vessel_id, status |
| `ai_documents` | Core | Document store (OCR) | `id` (uuid) | `organization_id → organizations` | category, ocr_status |

## Operations Tables

| Table | Domain | Purpose | Primary Key | Critical FKs |
|-------|--------|---------|-------------|--------------|
| `port_calls` | Ops | Port visit tracking | `id` | `voyage_id → voyages`, `vessel_id → vessels` |
| `noon_reports` | Ops | Daily vessel reports | `id` | `voyage_id → voyages`, `vessel_id → vessels` |
| `bunker_operations` | Ops | Fuel management | `id` | `voyage_id → voyages`, `vessel_id → vessels` |
| `voyage_pnl` | Ops | Profit & Loss per voyage | `id` | `voyage_id → voyages` |

## Maintenance Tables

| Table | Domain | Purpose | Primary Key | Critical FKs |
|-------|--------|---------|-------------|--------------|
| `pms_work_orders` | Maint | Work order lifecycle | `id` | `vessel_id → vessels` |
| `maintenance_tasks` | Maint | Scheduled tasks | `id` | `vessel_id → vessels` |
| `inventory_items` | Maint | Spare parts stock | `id` | `vessel_id → vessels` |
| `drydock_projects` | Maint | Drydock planning | `id` | `vessel_id → vessels` |

## Compliance Tables

| Table | Domain | Purpose | Primary Key | Critical FKs |
|-------|--------|---------|-------------|--------------|
| `internal_audits` | Compl | Audit records | `id` | `vessel_id → vessels` |
| `sire2_findings` | Compl | Inspection findings | `id` | `inspection_id → sire2_inspections` |
| `class_surveys` | Compl | Class surveys | `id` | `vessel_id → vessels` |
| `compliance_items` | Compl | Compliance tracking | `id` | `organization_id → organizations` |

## Finance Tables

| Table | Domain | Purpose | Primary Key | Critical FKs |
|-------|--------|---------|-------------|--------------|
| `invoices` | Fin | Invoice management | `id` | `organization_id → organizations` |
| `expenses` | Fin | Expense tracking | `id` | `organization_id → organizations` |
| `procurement_orders` | Fin | Purchase orders | `id` | `organization_id → organizations` |
| `charter_parties` | Fin | Charter contracts | `id` | `vessel_id → vessels` |

## People Tables

| Table | Domain | Purpose | Primary Key | Critical FKs |
|-------|--------|---------|-------------|--------------|
| `crew_certifications` | People | Crew certs/licenses | `id` | `crew_member_id → crew_members` |
| `crew_rotations` | People | Rotation planning | `id` | `vessel_id → vessels` |
| `crew_payroll` | People | Payroll records | `id` | `crew_member_id → crew_members` |

## Integration Infrastructure Tables

| Table | Domain | Purpose | Primary Key | Key Fields |
|-------|--------|---------|-------------|------------|
| `event_outbox` | System | Transactional events | `id` | event_type, status, payload, retries |
| `event_subscriptions` | System | Consumer registry | `id` | consumer_name, event_type, enabled |
| `entity_documents` | System | Universal doc links | `id` | entity_type, entity_id, document_id |
| `integration_health` | System | Service monitoring | `id` | integration_name, status, error_count_24h |
| `audit_events` | System | Universal audit trail | `id` | entity_type, entity_id, action, actor_id |

## Standard Field Patterns

All core tables follow:
- `id`: uuid, primary key, `gen_random_uuid()`
- `created_at`: timestamptz, `now()`
- `updated_at`: timestamptz, `now()`
- `organization_id`: uuid FK → organizations (multi-tenant isolation)

## Status Enums (Canonical)

- **Entity lifecycle**: `draft → planned → active → completed → cancelled`
- **Approval flow**: `pending → approved → rejected`
- **Alert severity**: `info → warning → critical → emergency`
- **Event status**: `pending → processing → processed → failed → dead_letter`
