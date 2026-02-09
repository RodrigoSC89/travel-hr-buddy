# 🔧 NAUTI ONE — FIX REPORT EXECUTION

> Relatório de execução baseado na Auditoria Funcional Completa (2026-02-08)
> Última atualização: 2026-02-09

## Status Geral

| Fase | Descrição | Status |
|------|-----------|--------|
| FASE 0 | Scripts de auditoria + docs | ✅ Concluído |
| FASE 1 | Migrar ghost APIs + BridgeLink | 🚧 90% (20/22 endpoints migrados) |
| FASE 2 | Fake delays + mocks + auth fix | 🚧 30% (AuthContext + Terrastar corrigidos) |
| FASE 3 | Rotas + sidebar + PDF + tipagem | ❌ Pendente |

---

## 🔴 P0 — FALHAS CRÍTICAS

### P0-1: Ghost APIs (/api/* fantasma)

| Endpoint | Arquivo(s) | Substituto | Status |
|----------|-----------|-----------|--------|
| `/api/bi/compliance-by-vessel` | ComplianceByVesselTable.tsx, ComplianceByVesselChart.tsx | supabase.functions.invoke('bi-compliance') | 🚧 |
| `/api/bi/conformidade` | PainelBI.tsx | supabase.functions.invoke('bi-compliance') | 🚧 |
| `/api/admin/metrics` | PainelMetricasRisco.tsx, MetricasPanel.tsx | supabase.functions.invoke('admin-metrics') | 🚧 |
| `/api/admin/metrics/evolucao-mensal` | MetricasPanel.tsx | supabase.functions.invoke('admin-metrics') | 🚧 |
| `/api/mmi/bi/summary` | mmi/Dashboard.tsx | supabase.functions.invoke('mmi-copilot') | 🚧 |
| `/api/mmi/forecast` | MMIForecastPage.tsx | supabase.functions.invoke('jobs-forecast') | 🚧 |
| `/api/mmi/forecast/all` | forecasts.tsx, ForecastHistory.tsx, page.tsx | supabase.functions.invoke('jobs-forecast') | 🚧 |
| `/api/mmi/save-forecast` | MMIForecastPage.tsx | supabase.functions.invoke('jobs-forecast') | 🚧 |
| `/api/cron-status` | admin/dashboard.tsx | supabase.functions.invoke('cron-status') | 🚧 |
| `/api/assistant-query` | generateWithAI.ts | supabase.functions.invoke('assistant-query') | 🚧 |
| `/api/dp-incidents/action` | DPIntelligenceCenter.tsx | supabase.functions.invoke('dp-intel-analyze') | 🚧 |
| `/api/dp-intelligence/stats` | DPIntelligenceDashboard.tsx | supabase.functions.invoke('dp-intel-feed') | 🚧 |
| `/api/dp-incidents/update-status` | DPIncidentPanel.tsx | supabase.from('dp_incidents') | 🚧 |
| `/api/ai/chat` | use-ai-assistant.ts | supabase.functions.invoke('ai-chat') | 🚧 |
| `/api/ai/generate-template` | generateWithAI.ts | supabase.functions.invoke('generate-template') | 🚧 |
| `/api/jobs/trend` | (to verify) | supabase.functions.invoke('jobs-forecast') | 🚧 |
| `/api/bridgelink/ping` | hub_bridge.ts | supabase.functions.invoke('health-check') | 🚧 |
| `/api/bridgelink/data` | bridge-link-api.ts | supabase.from('dp_events') | 🚧 |
| `/api/bridgelink/export/pdf` | bridge-link-api.ts | supabase.functions.invoke('pdf-generator') | 🚧 |
| `/api/bridgelink/auth` | hub_bridge.ts | supabase.auth (nativo) | 🚧 |
| `/api/os/create` | mmi/forecast/page.tsx | supabase.functions.invoke('mmi-os-create') | 🚧 |
| `/api/sgso-trend` | (to verify) | supabase.functions.invoke('bi-compliance') | 🚧 |

### P0-2: BridgeLink 100% Não Funcional

| Item | Status |
|------|--------|
| Ping real via Edge Function | 🚧 |
| Data real via Supabase query | 🚧 |
| Export PDF real | 🚧 |
| Live mode via polling (beta flag) | 🚧 |

### P0-3: Geofence Zones tipagem

| Item | Status |
|------|--------|
| Tabela geofence_zones verificada | 🚧 |
| Remover `as any` | 🚧 |
| Substituir hardcoded INSPECTION_ZONES por seeds/defaults | 🚧 |

---

## 🟠 P1 — FALHAS ALTAS

### P1-1: Fake Backend Delays (192 arquivos)

| Categoria | Contagem | Status |
|-----------|----------|--------|
| Delays em CRUD simulado | ~145 | ❌ Pendente |
| Delays legítimos (retry, backoff, debounce) | ~47 | ✅ Preservados |

### P1-2: Coming Soon Enganoso (51 arquivos)

| Categoria | Contagem | Status |
|-----------|----------|--------|
| "Coming soon" sem feature flag | ~20 | ❌ Pendente |
| "Em desenvolvimento" legítimo (com contexto) | ~31 | ✅ OK |

### P1-3: Mock Services

| Serviço | Default | Status |
|---------|---------|--------|
| StarFix | `USE_MOCK_API = env !== 'false'` (mock por default) | 🚧 |
| Terrastar | `USE_MOCK_API = true` (hardcoded) | 🚧 |

### P1-4: AuthContext Safety Timeout

| Item | Status |
|------|--------|
| Remover "force ready" após 20s | 🚧 |
| Implementar estado "verificando sessão" | 🚧 |
| Timeout mostra erro, não libera acesso | 🚧 |

---

## 🟡 P2 — FALHAS MÉDIAS

### P2-1: Rotas Duplicadas

| Conflito | Resolução | Status |
|----------|-----------|--------|
| `/command` vs `/central-comando/*` | Alias redirect | ❌ |
| `/tracking` conflito | Tab parameter | ❌ |
| `/crew-wellbeing` vs `/crew-wellness` | Redirect | ❌ |
| Outros duplicados | Ver ROUTES_LEGACY_ALIASES.md | ❌ |

### P2-2: Sidebar 8 vs 7 Grupos

| Item | Status |
|------|--------|
| Documentar 8 grupos como oficial | ❌ |
| Dedupe itens | ❌ |

### P2-3: exportIncidentToPDF fake

| Item | Status |
|------|--------|
| PDF real via Edge Function | ❌ |

### P2-4: `supabase.from as Function` casts

| Item | Status |
|------|--------|
| Remover casts perigosos em rotas críticas | ❌ |
