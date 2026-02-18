# NAUTI ONE — Integration Status Matrix

## Module × Module Integration Status

✅ = Integrated (DB + Events + UI)
🔄 = Partial (DB only, no events yet)
⬜ = Planned

| From ↓ / To → | Fleet | Voyage | Tracking | Maint | Compliance | Finance | People | AI | Documents | System |
|----------------|-------|--------|----------|-------|------------|---------|--------|-----|-----------|--------|
| **Fleet** | — | ✅ | ✅ | ✅ | 🔄 | 🔄 | ✅ | ✅ | ✅ | ✅ |
| **Voyage** | ✅ | — | ✅ | 🔄 | 🔄 | ✅ | 🔄 | ✅ | ✅ | ✅ |
| **Tracking** | ✅ | ✅ | — | 🔄 | 🔄 | ⬜ | ⬜ | ✅ | ⬜ | ✅ |
| **Maintenance** | ✅ | 🔄 | ⬜ | — | ✅ | ✅ | ⬜ | ✅ | ✅ | ✅ |
| **Compliance** | ✅ | 🔄 | 🔄 | ✅ | — | 🔄 | ✅ | ✅ | ✅ | ✅ |
| **Finance** | 🔄 | ✅ | ⬜ | ✅ | 🔄 | — | 🔄 | ✅ | ✅ | ✅ |
| **People** | ✅ | 🔄 | ⬜ | ⬜ | ✅ | 🔄 | — | ✅ | ✅ | ✅ |
| **AI** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | ✅ | ✅ |
| **Documents** | ✅ | ✅ | ⬜ | ✅ | ✅ | ✅ | ✅ | ✅ | — | ✅ |
| **System** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — |

## Integration Infrastructure Status

| Component | Status | Notes |
|-----------|--------|-------|
| `event_outbox` table | ✅ Created | Transactional outbox with retry logic |
| `event_subscriptions` table | ✅ Created | Consumer registry |
| `entity_documents` table | ✅ Created | Universal document linking |
| `integration_health` table | ✅ Created | Service monitoring |
| `audit_events` table | ✅ Created | Universal audit trail |
| `publish_event()` RPC | ✅ Created | Atomic event + audit in single transaction |
| Event Bus (frontend) | ✅ Created | `src/lib/events/event-bus.ts` |
| Event Catalog | ✅ Created | `src/lib/events/event-catalog.ts` |
| Domain Types | ✅ Created | `src/lib/domain/types.ts` |
| Domain Services | ✅ Created | 9 services in `src/services/domain/` |
| Audit Scripts | ✅ Created | 3 scripts in `src/scripts/` |

## Next Steps (Planned)

1. **Event Dispatcher Edge Function** — Cron-based consumer that processes `event_outbox` pending events
2. **Related Records Panel** — Universal UI component for cross-entity navigation
3. **Quick Actions** — Contextual create actions (Finding → CAPA, WO → PO, etc.)
4. **Feature Guards** — Expired cert blocks rotation assignment (server-side)
5. **Integration Health Dashboard** — Real-time monitoring in System Hub
