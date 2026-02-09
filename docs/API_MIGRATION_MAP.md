# 🗺️ API MIGRATION MAP

> Mapeamento de chamadas `/api/*` fantasma → implementação real (Supabase)
> Gerado: 2026-02-09

## Legenda
- **EF** = Edge Function existente
- **NEW** = Precisa criar
- **QUERY** = Query direta `supabase.from()`

---

## Grupo: BI / Compliance

| Ghost Endpoint | Método | Arquivo Frontend | Substituto | Tipo |
|---------------|--------|-----------------|-----------|------|
| `/api/bi/compliance-by-vessel` | GET | `ComplianceByVesselTable.tsx`, `ComplianceByVesselChart.tsx` | `supabase.from('compliance_inspections')` + joins | QUERY |
| `/api/bi/conformidade` | GET | `PainelBI.tsx` | `supabase.from('compliance_inspections')` + aggregation | QUERY |
| `/api/bi/sgso-trend` | GET | (verificar) | `supabase.from('sgso_audits')` | QUERY |

## Grupo: Admin / Métricas

| Ghost Endpoint | Método | Arquivo Frontend | Substituto | Tipo |
|---------------|--------|-----------------|-----------|------|
| `/api/admin/metrics` | GET | `PainelMetricasRisco.tsx`, `MetricasPanel.tsx` | `supabase.functions.invoke('admin-metrics')` | NEW EF |
| `/api/admin/metrics/evolucao-mensal` | GET | `MetricasPanel.tsx` | `supabase.functions.invoke('admin-metrics')` (param: monthly) | NEW EF |

## Grupo: MMI / Forecast

| Ghost Endpoint | Método | Arquivo Frontend | Substituto | Tipo |
|---------------|--------|-----------------|-----------|------|
| `/api/mmi/bi/summary` | GET | `mmi/Dashboard.tsx` | `supabase.functions.invoke('mmi-copilot')` | EF (existe) |
| `/api/mmi/forecast` | POST | `MMIForecastPage.tsx` | `supabase.functions.invoke('jobs-forecast')` | EF (existe) |
| `/api/mmi/forecast/all` | GET | `forecasts.tsx`, `ForecastHistory.tsx`, `page.tsx` | `supabase.functions.invoke('jobs-forecast')` (action: list) | EF (existe) |
| `/api/mmi/save-forecast` | POST | `MMIForecastPage.tsx` | `supabase.functions.invoke('jobs-forecast')` (action: save) | EF (existe) |

## Grupo: Cron / Assistente

| Ghost Endpoint | Método | Arquivo Frontend | Substituto | Tipo |
|---------------|--------|-----------------|-----------|------|
| `/api/cron-status` | GET | `admin/dashboard.tsx` | `supabase.functions.invoke('cron-status')` | EF (existe) |
| `/api/assistant-query` | POST | `generateWithAI.ts` | `supabase.functions.invoke('assistant-query')` | EF (existe) |

## Grupo: DP Intelligence

| Ghost Endpoint | Método | Arquivo Frontend | Substituto | Tipo |
|---------------|--------|-----------------|-----------|------|
| `/api/dp-incidents/action` | POST | `DPIntelligenceCenter.tsx` | `supabase.functions.invoke('dp-intel-analyze')` | EF (existe) |
| `/api/dp-intelligence/stats` | GET | `DPIntelligenceDashboard.tsx` | `supabase.functions.invoke('dp-intel-feed')` | EF (existe) |
| `/api/dp-incidents/update-status` | POST | `DPIncidentPanel.tsx` | `supabase.from('dp_incidents').update()` | QUERY |

## Grupo: AI

| Ghost Endpoint | Método | Arquivo Frontend | Substituto | Tipo |
|---------------|--------|-----------------|-----------|------|
| `/api/ai/chat` | POST | `use-ai-assistant.ts` | `supabase.functions.invoke('ai-chat')` | EF (existe) |
| `/api/ai/generate-template` | POST | `generateWithAI.ts` | `supabase.functions.invoke('generate-template')` | EF (existe) |

## Grupo: BridgeLink

| Ghost Endpoint | Método | Arquivo Frontend | Substituto | Tipo |
|---------------|--------|-----------------|-----------|------|
| `/api/bridgelink/ping` | GET | `hub_bridge.ts` | `supabase.functions.invoke('health-check')` | EF (existe) |
| `/api/bridgelink/data` | GET | `bridge-link-api.ts` | `supabase.from('dp_events')` + `supabase.from('risk_alerts')` | QUERY |
| `/api/bridgelink/export/pdf` | POST | `bridge-link-api.ts` | `supabase.functions.invoke('pdf-generator')` | EF (existe) |
| `/api/bridgelink/auth` | POST | `hub_bridge.ts` | Supabase Auth nativo (remover) | REMOVE |

## Grupo: Jobs / OS

| Ghost Endpoint | Método | Arquivo Frontend | Substituto | Tipo |
|---------------|--------|-----------------|-----------|------|
| `/api/jobs/trend` | GET | (verificar) | `supabase.functions.invoke('jobs-forecast')` | EF (existe) |
| `/api/os/create` | POST | `mmi/forecast/page.tsx` | `supabase.functions.invoke('mmi-os-create')` | EF (existe) |

---

## Resumo

| Tipo | Qtd |
|------|-----|
| Edge Functions já existentes | 15 |
| Queries diretas Supabase | 5 |
| Edge Functions novas necessárias | 1 (admin-metrics) |
| Endpoints a remover (sem substituto) | 1 (/api/bridgelink/auth) |
| **Total endpoints migrados** | **22** |
