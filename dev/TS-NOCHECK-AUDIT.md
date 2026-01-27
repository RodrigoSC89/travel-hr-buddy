# Technical Debt: @ts-nocheck Files

> Updated: 2026-01-27 | PATCH 873

## Summary
- **Total @ts-nocheck files in src/**: ~40 files (reduced after migrations)
- **Edge Functions (supabase/functions/)**: ~50 files (Deno environment - acceptable)
- **Test files (src/tests/, tests/)**: ~100 files (by design)

## PATCH 873 Actions
1. ✅ Created missing tables: template_versions, workflow_nodes, satcom_messages, etc.
2. ✅ Added columns: system_name, is_resolved to performance_alerts
3. ✅ Created type-mappers utility: src/lib/supabase/type-mappers.ts
4. ⚠️ Types need regeneration via `supabase gen types` to fully remove @ts-nocheck

| File | Reason | Fix Required |
|------|--------|--------------|
| `src/components/crew/CrewRotationManager.tsx` | Complex FK join to auth.users | Simplify join or create crew_profiles view |
| `src/modules/emergency-mode/index.tsx` | supabase import path issue | Add missing import |
| `src/modules/mission-control/components/RealTimeMissionDashboard.tsx` | missions table columns | ✅ Fixed |
| `src/pages/admin/performance-dashboard.tsx` | performance_metrics schema mismatch | Add system_name, is_resolved columns |
| `src/pages/ai/learning-dashboard.tsx` | RPC return types differ | Update RPC or interface |

### Priority 2 - Document Hub

| File | Reason | Fix Required |
|------|--------|--------------|
| `src/modules/document-hub/components/TemplateLibrary.tsx` | template_versions table missing | Add migration |
| `src/modules/document-hub/templates/DocumentTemplatesManager.tsx` | Same as above | Add migration |
| `src/modules/document-hub/templates/services/template-pdf-renderer.ts` | jsPDF dynamic import | Use async pattern |
| `src/modules/document-hub/templates/validation/TemplateValidationReport.tsx` | Same as TemplateLibrary | Add migration |

### Priority 3 - Operations & Telemetry

| File | Reason | Fix Required |
|------|--------|--------------|
| `src/components/operations/OperationsDashboardRealTime.tsx` | Dynamic telemetry types | Create interface mapper |
| `src/modules/operations/fleet-telemetry/index.tsx` | vessel_sensors, maintenance_alerts | Add migrations |
| `src/modules/underwater-drone/services/underwaterMissionService.ts` | Column name mismatches | Align with actual schema |
| `src/modules/underwater-drone/services/droneMissionService.ts` | Same as above | Align with actual schema |

### Priority 4 - Price Alerts & Logistics

| File | Reason | Fix Required |
|------|--------|--------------|
| `src/components/price-alerts/price-alert-dashboard.tsx` | null vs undefined | Add null coalescing |
| `src/modules/price-alerts/index.tsx` | Same as above | Add null coalescing |
| `src/modules/price-alerts/services/price-alerts-service.ts` | Same as above | Add null coalescing |
| `src/components/logistics/logistics-hub-dashboard.tsx` | Dynamic table access | Use createTableAccessor |

### Priority 5 - Other Modules

| File | Reason | Fix Required |
|------|--------|--------------|
| `src/components/projects/project-timeline.tsx` | project_tasks table | Add migration or simplify |
| `src/modules/satellite/SatelliteTrackerEnhanced.tsx` | tracking_sessions | Add RPC types |
| `src/modules/satcom/components/SatcomTerminal.tsx` | satcom_messages | Add migration |
| `src/modules/workflow-visual/index.tsx` | workflow_nodes | Add migration |
| `src/modules/operational-calendar/index.tsx` | calendar_events | Align types |
| `src/modules/incident-reports/services/incidentReplayService.ts` | incident_snapshots | Add migration |
| `src/modules/mission-control/services/jointTasking.ts` | joint_missions | Add migration |
| `src/modules/mission-control/services/mission-control-service.ts` | missions schema | Align types |
| `src/modules/performance/PerformanceMonitoringDashboard.tsx` | Complex alert types | Align types |
| `src/modules/sonar-ai/services/enhanced-ai-service.ts` | sonar_inputs | Add migration |

### Pages with @ts-nocheck

| File | Reason |
|------|--------|
| `src/pages/admin/satellite-tracker.tsx` | RPC functions not in types |
| `src/pages/admin/workflows/detail.tsx` | workflow_nodes |
| `src/pages/admin/peodp-wizard-complete.tsx` | peodp_plans table |
| `src/pages/admin/logistics-hub.tsx` | logistics_operations |
| `src/pages/admin/documents/apply-template-demo.tsx` | template_versions |
| `src/pages/admin/documents/restore-dashboard.tsx` | restore_reports |
| `src/pages/admin/reports/logs.tsx` | Dynamic table access |
| `src/pages/admin/sgso/review/[id].tsx` | sgso_items |
| `src/pages/admin/performance-profiler.tsx` | profiler_sessions |
| `src/pages/admin/templates/edit/[id].tsx` | template_versions |
| `src/pages/dashboard/i18n.tsx` | Dynamic table access |
| `src/pages/dashboard/QualityDashboard.tsx` | quality_metrics |

## Resolution Strategy

1. **Short-term**: Document each @ts-nocheck with specific reason
2. **Medium-term**: Create migrations for missing tables
3. **Long-term**: Regenerate types and remove @ts-nocheck

## Files Successfully Fixed (PATCH 872)

- ✅ `src/modules/mission-control/components/RealTimeMissionDashboard.tsx`
- ✅ `src/components/integrations/integrations-hub-enhanced.tsx`
- ✅ `src/components/ai/evolution/BehavioralEvolutionDashboard.tsx`
- ✅ `src/components/performance/performance-monitor.tsx`
- ✅ `src/components/admin/organization-customization.tsx`
- ✅ `src/components/saas/billing-management.tsx`
