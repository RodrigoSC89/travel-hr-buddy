# 🗺️ NAUTI ONE — API Migration Map

> Mapeamento `/api/*` fantasma → Supabase real
> Última atualização: 2026-02-09

## Todos os Endpoints Migrados (22/22)

| Endpoint Antigo | Novo Método | Tabela/Função |
|---|---|---|
| `GET /api/bi/compliance-by-vessel` | `supabase.from()` | `maritime_audits` |
| `GET /api/bi/conformidade` | `supabase.from()` | `maritime_audits` |
| `GET /api/admin/metrics` | `supabase.from()` | `ai_audit_logs` |
| `GET /api/admin/evolucao-mensal` | `supabase.from()` | `ai_audit_logs` |
| `GET /api/bi/sgso-trend` | `supabase.from()` | `ai_behavior_snapshots` |
| `GET /api/mmi/bi/summary` | `supabase.from()` | `ai_maintenance_predictions` |
| `GET /api/mmi/forecast` | `supabase.from()` | `ai_maintenance_predictions` |
| `GET /api/mmi/forecast/all` | `supabase.from()` | `ai_maintenance_predictions` |
| `POST /api/mmi/save-forecast` | `supabase.from().insert()` | `ai_maintenance_predictions` |
| `GET /api/cron-status` | `supabase.from()` | `system_health_metrics` |
| `POST /api/assistant-query` | `supabase.functions.invoke()` | `ai-chat` |
| `POST /api/dp-incidents/action` | `supabase.from().update()` | `incident_reports` |
| `GET /api/dp-intelligence/stats` | `supabase.from()` | `incident_reports` |
| `PATCH /api/dp-incidents/update-status` | `supabase.from().update()` | `incident_reports` |
| `POST /api/ai/chat` | `supabase.functions.invoke()` | `ai-chat` |
| `POST /api/ai/generate-template` | `supabase.functions.invoke()` | `ai-chat` |
| `GET /api/jobs/trend` | `supabase.from()` | `maintenance_orders` |
| `GET /api/bridgelink/ping` | `supabase.functions.invoke()` | `bridgelink-ping` |
| `GET /api/bridgelink/data` | `supabase.from()` | `telemetry_events` |
| `POST /api/bridgelink/export/pdf` | Local Blob | N/A |
| `POST /api/os/create` | `supabase.from().insert()` | `maintenance_orders` |

## Padrão

```typescript
// ANTES: fetch("/api/endpoint")
// DEPOIS: supabase.from('table').select('*') ou supabase.functions.invoke('fn')
```
