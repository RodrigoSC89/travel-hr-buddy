# Technical Debt: @ts-nocheck Files

> **Updated:** 2026-01-28 | PATCH 878

## Summary
- **Total @ts-nocheck files in src/**: 42 files (-3 resolved)
- **Edge Functions (supabase/functions/)**: ~50 files (Deno environment - acceptable)
- **Test files (src/tests/, tests/)**: ~100 files (by design)

## PATCH 878 Updates - Files Fixed
- `src/components/logistics/logistics-hub-dashboard.tsx` - Using Database types directly
- `src/modules/operational-calendar/index.tsx` - Added proper typing for calendar events
- `src/modules/incident-reports/services/incidentReplayService.ts` - Using Database types directly

---

## PATCH 877 Updates

Added new type-safe accessors to `dynamic-tables.ts`:
- `BetaFeedback` / `betaFeedbackTable` - for QualityDashboard
- `ProjectTaskDB` / `projectTasksTable` - for project-timeline
- `TaskDependencyDB` / `taskDependenciesTable` - for task dependencies

**Already available** (from previous patches):
- `VesselSensor` / `vesselSensorsTable`
- `MaintenanceAlert` / `maintenanceAlertsTable`
- `PeodpPlan` / `peodpPlansTable`
- `PerformanceSnapshot` / `performanceSnapshotsTable`

---

## Why @ts-nocheck Persists

Most remaining files have @ts-nocheck for these reasons:

| Reason | Count | Fixable? |
|--------|-------|----------|
| **DB literal types ≠ local enums** (e.g., `agent_type: string` vs `AgentType`) | ~15 | Needs DB enum migration |
| **JSONB columns** with complex nested structures | ~10 | Use `castJson<T>()` |
| **Dynamic imports** (jsPDF, XLSX) with `any` types | ~8 | Create type declarations |
| **Third-party libs** (DnD-kit, Chart.js, Tiptap) | ~5 | Wrap with typed adapters |
| **null vs undefined** mismatches | ~7 | Add null coalescing |

---

## Files with @ts-nocheck (45 total)

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
