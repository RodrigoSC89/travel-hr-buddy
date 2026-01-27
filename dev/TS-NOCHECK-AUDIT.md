# Technical Debt: @ts-nocheck Files

> **Updated:** 2026-01-27 | PATCH 876

## Summary
- **Total @ts-nocheck files in src/**: ~45 files (documented with specific reasons)
- **Edge Functions (supabase/functions/)**: ~50 files (Deno environment - acceptable)
- **Test files (src/tests/, tests/)**: ~100 files (by design)

---

## PATCH 876 Status

All @ts-nocheck files have been audited and documented with specific reasons in their headers explaining:
- What specific type issue exists
- What would be needed to fix it
- Why removal is not trivial

### Infrastructure Created
1. **`src/lib/supabase/dynamic-tables.ts`** - 50+ type-safe table accessors
2. **`src/types/supabase-aliases.ts`** - JSONB helpers (castJson, getJsonField)

---

## Common Reasons for @ts-nocheck

| Reason | Count | Solution |
|--------|-------|----------|
| JSONB columns → local interfaces | ~15 | Use `castJson<T>()` helper |
| Tables not in generated types | ~10 | Use `createTableAccessor<T>()` |
| Third-party lib conflicts (DnD, jsPDF, Chart.js) | ~8 | Create typed wrappers |
| null vs undefined mismatches | ~7 | Add null coalescing |
| Complex FK joins | ~5 | Simplify or create views |

---

## File Categories

### Category 1: Coordination & AI Services
| File | Reason |
|------|--------|
| `src/services/coordinationAIService.ts` | coordination_agents/tasks/decisions JSONB types |
| `src/services/finance-hub.service.ts` | finance_transactions/categories/budgets schema |
| `src/ai/reporting/executive-summary.tsx` | AI report generation with dynamic data |

### Category 2: Crew & DnD Operations
| File | Reason |
|------|--------|
| `src/components/crew/CrewRotationManager.tsx` | DnD-kit UniqueIdentifier ≠ string |
| `src/components/crew/advanced-crew-dossier-interaction.tsx` | crew_ai_insights table |

### Category 3: Performance & Monitoring
| File | Reason |
|------|--------|
| `src/pages/admin/performance-profiler.tsx` | SlowComponent.lastSeen not in DB |
| `src/pages/admin/performance-dashboard.tsx` | performance_metrics schema |
| `src/components/operations/OperationsDashboardRealTime.tsx` | Dynamic telemetry |

### Category 4: Document Hub
| File | Reason |
|------|--------|
| `src/components/documents/DocumentEditor.tsx` | document_versions dynamic schema |
| `src/modules/document-hub/components/TemplateLibrary.tsx` | template_versions |
| `src/modules/document-hub/templates/validation/TemplateValidationReport.tsx` | Same |

### Category 5: Mission Control
| File | Reason |
|------|--------|
| `src/modules/mission-control/services/mission-control-service.ts` | missions schema |
| `src/modules/mission-control/services/jointTasking.ts` | joint_missions |

### Category 6: Price Alerts & Logistics
| File | Reason |
|------|--------|
| `src/components/price-alerts/price-alert-dashboard.tsx` | price_alerts extra columns |
| `src/modules/price-alerts/index.tsx` | null vs undefined |
| `src/components/logistics/logistics-hub-dashboard.tsx` | Dynamic table access |

### Category 7: Underwater & Satellite
| File | Reason |
|------|--------|
| `src/modules/underwater-drone/services/underwaterMissionService.ts` | Column name mismatches |
| `src/modules/underwater-drone/services/droneMissionService.ts` | Same |
| `src/modules/satellite/SatelliteTrackerEnhanced.tsx` | tracking_sessions |

### Category 8: Other Modules
| File | Reason |
|------|--------|
| `src/modules/operational-calendar/index.tsx` | calendar_events JSONB |
| `src/modules/workflow-visual/index.tsx` | workflow_nodes |
| `src/modules/satcom/components/SatcomTerminal.tsx` | satcom_messages |
| `src/modules/sonar-ai/services/enhanced-ai-service.ts` | sonar_inputs |
| `src/modules/incident-reports/services/incidentReplayService.ts` | incident_snapshots |
| `src/modules/incident-reports/components/IncidentDetailDialog.tsx` | jsPDF types |

### Category 9: Admin Pages
| File | Reason |
|------|--------|
| `src/pages/admin/satellite-tracker.tsx` | RPC functions not in types |
| `src/pages/admin/workflows/detail.tsx` | workflow_nodes |
| `src/pages/admin/peodp-wizard-complete.tsx` | peodp_plans table |
| `src/pages/admin/logistics-hub.tsx` | logistics_operations |
| `src/pages/admin/documents/restore-dashboard.tsx` | restore_logs |
| `src/pages/admin/templates/edit/[id].tsx` | templates JSONB content |
| `src/pages/admin/sgso/review/[id].tsx` | sgso_audits checklist_items |
| `src/pages/admin/reports/logs.tsx` | Dynamic table access |
| `src/pages/dashboard/i18n.tsx` | translations table |

---

## Migration Strategy

To fully remove @ts-nocheck:

1. **Regenerate Supabase Types**
   ```bash
   supabase gen types typescript --local > src/integrations/supabase/types.ts
   ```

2. **Align dynamic-tables.ts interfaces** with actual DB columns

3. **Use type casting helpers** for JSONB columns:
   ```typescript
   import { castJson, getJsonField } from "@/types/supabase-aliases";
   const items = castJson<ChecklistItem[]>(row.checklist_items, []);
   ```

4. **Create typed wrappers** for third-party libs

5. **Add null coalescing** for null vs undefined:
   ```typescript
   const date = row.last_checked_at ?? undefined;
   ```

---

## Test Files (@ts-nocheck by design)

Test files (~100) use @ts-nocheck because:
- Mock objects don't need full type compliance
- Test setup overrides require type flexibility
- Focus is on behavior, not type correctness

This is acceptable and industry-standard practice.

---

## Edge Functions (@ts-nocheck acceptable)

Edge functions (~50) in `supabase/functions/` use Deno runtime with:
- Different module resolution
- Deno-specific APIs
- Separate type checking context

This is expected and acceptable.

---

*Report: PATCH 876 | Status: Fully Documented | Build: Passing*
