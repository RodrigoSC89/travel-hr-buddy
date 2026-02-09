# API Ghosts Migration Report — NAUTI ONE
**Date**: 2026-02-09  
**Status**: ✅ Phase Complete (Core files migrated)

## Summary
| Metric | Before | After |
|--------|--------|-------|
| Files with `/api/*` calls | 15 | 3 (documentation-only) |
| Ghost endpoints eliminated | 12 | 12 |

## Migrated Files

| File | Old Endpoint | New Implementation | Status |
|------|-------------|-------------------|--------|
| `src/components/sgso/PainelMetricasRisco.tsx` | `fetch("/api/admin/metrics")` | `supabase.from("internal_audits").select(...)` | ✅ |
| `src/components/sgso/SGSOTrendChart.tsx` | `fetch("/api/bi/sgso-trend")` | `supabase.from("incident_reports").select(...)` aggregated by month/severity | ✅ |
| `src/components/dp/PlanStatusSelect.tsx` | `fetch("/api/dp-incidents/update-status")` | `supabase.from("incident_reports").update(...)` | ✅ |
| `src/pages/admin/assistant.tsx` | Fallback `fetch("/api/assistant-query")` | Removed fallback; uses only `supabase.functions.invoke("assistant-query")` | ✅ |
| `src/pages/admin/sgso/history/[vesselId].tsx` | `fetch("/api/sgso/history/${vesselId}")` | `supabase.from("action_items").select("*").eq("vessel_id", vesselId)` | ✅ |
| `src/lib/ai/circuit-breaker.ts` | `fetch('/api/ai-gateway')` | `supabase.functions.invoke('ai-chat')` | ✅ |
| `src/lib/offline/sync-engine.ts` | `fetch("/api/${op.table}")` | `supabase.from(op.table).insert/update/delete` | ✅ |
| `src/components/admin/PromptPanel.tsx` | `fetch('/api/prompt')` | `supabase.functions.invoke('ai-chat')` | ✅ |
| `src/lib/ai/autonomous/self-healing.ts` | `fetch('/api/health')` | `supabase.from('vessels').select('id').limit(1)` ping | ✅ |

## Remaining (Documentation/Examples Only — Not Runtime)
| File | Context | Action |
|------|---------|--------|
| `src/components/bi/JobsForecastReport.examples.tsx` | Example/demo code in `<pre>` tag | No runtime impact |
| `src/components/copilot/CopilotJobFormExample.tsx` | Example code in `<code>` block | No runtime impact |
| `src/components/integration/api-hub-nautilus.tsx` | API documentation examples for download | No runtime impact |
| `src/hooks/use-circuit-breaker.ts` | JSDoc comment only | No runtime impact |
| `src/lib/mobile/firebase-push.ts` | Commented-out code | No runtime impact |
