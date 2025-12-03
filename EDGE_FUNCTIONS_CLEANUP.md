# Edge Functions Cleanup Guide

## Problema
O projeto excedeu o limite de edge functions do Supabase (plano free: ~25 funções).  
**Total atual: 105+ funções**

## Funções Candidatas para Remoção/Consolidação

### 🔴 ALTA PRIORIDADE - Remover (Duplicadas/Não Utilizadas)

| Função | Motivo | Ação |
|--------|--------|------|
| `send-assistant-report` | Duplicada com `send-daily-assistant-report` | Remover |
| `daily-restore-report` | Duplicada com `send_daily_restore_report` | Remover |
| `send-restore-dashboard` | Duplicada com `send-restore-dashboard-daily` | Remover |
| `generate-quiz` | Duplicada com `generate-training-quiz` | Consolidar |
| `generate-template` | Similar a `rewrite-template` | Consolidar |
| `rewrite-document` | Similar a `rewrite-selection` | Consolidar em uma |
| `rewrite-selection` | Similar a `rewrite-document` | Consolidar |
| `rewrite-template` | Similar a `generate-template` | Consolidar |
| `dgnss-tracking` | Recém-criada, não implantada | Manter código, remover do deploy |

### 🟡 MÉDIA PRIORIDADE - Consolidar

| Grupo | Funções | Ação |
|-------|---------|------|
| **AI Reports** | `generate-ai-report`, `generate-report`, `generate-insight-report` | Consolidar em `generate-report` |
| **Forecasts** | `jobs-forecast`, `bi-jobs-forecast`, `jobs-forecast-by-component`, `forecast-weekly` | Consolidar em `forecast-api` |
| **Training** | `generate-training-quiz`, `generate-training-explanation`, `generate-training-module` | Consolidar em `training-ai` |
| **Auditorias** | `auditorias-explain`, `auditorias-lista`, `auditorias-plano`, `resumo-auditorias-api` | Consolidar em `auditorias-api` |
| **Voice** | `text-to-speech`, `voice-to-text`, `realtime-voice`, `realtime-voice-session`, `eleven-labs-voice` | Consolidar em `voice-api` |
| **Checklists** | `generate-checklist`, `checklist-ai-analysis`, `summarize-checklist` | Consolidar em `checklist-api` |
| **Documents** | `process-document`, `generate-document`, `summarize-document` | Consolidar em `document-api` |
| **Weather** | `weather-integration`, `maritime-weather`, `space-weather-status` | Consolidar em `weather-api` |
| **BI/Analytics** | `bi-jobs-by-component`, `jobs-by-component`, `dashboard-analytics`, `restore-analytics` | Consolidar em `analytics-api` |

### 🟢 BAIXA PRIORIDADE - Manter

| Função | Motivo |
|--------|--------|
| `api-gateway` | Core - gateway principal |
| `nautilus-command` | Core - comandos do sistema |
| `nautilus-llm` | Core - integração LLM |
| `ai-chat` | Core - chat principal |
| `assistant-query` | Core - queries do assistente |
| `crew-ai-analysis` | Funcionalidade única |
| `workflow-execute` | Core - workflows |
| `sync-starfix` | Integração externa única |
| `amadeus-search` | Integração externa única |
| `fleet-tracking` | Funcionalidade única |

## Plano de Ação Recomendado

### Fase 1: Remoção Imediata (Economiza ~15 funções)
```bash
# Funções para deletar
supabase/functions/send-assistant-report/
supabase/functions/daily-restore-report/
supabase/functions/send-restore-dashboard/
supabase/functions/generate-quiz/  # Usar generate-training-quiz
supabase/functions/generate-template/  # Usar rewrite-template
supabase/functions/dgnss-tracking/  # Manter código, não implantar
```

### Fase 2: Consolidação (Economiza ~30 funções)
Criar funções unificadas com rotas internas:

```typescript
// Exemplo: supabase/functions/report-api/index.ts
// POST /report-api { action: "generate" | "insight" | "ai" }
```

### Fase 3: Revisão de Crons (Economiza ~5 funções)
Muitos crons podem ser consolidados em um único job que despacha para diferentes handlers.

## Funções Essenciais (Manter ~25)

1. `api-gateway`
2. `nautilus-command`
3. `nautilus-llm`
4. `ai-chat`
5. `assistant-query`
6. `assistant-logs`
7. `workflow-execute`
8. `crew-ai-analysis`
9. `fleet-tracking`
10. `mmi-copilot`
11. `mmi-os-create`
12. `mmi-os-update`
13. `sync-starfix`
14. `amadeus-search`
15. `weather-api` (consolidado)
16. `report-api` (consolidado)
17. `training-api` (consolidado)
18. `audit-api` (consolidado)
19. `voice-api` (consolidado)
20. `document-api` (consolidado)
21. `analytics-api` (consolidado)
22. `checklist-api` (consolidado)
23. `monitor-cron-health`
24. `send-alerts`
25. `public-api`

## Comandos para Limpeza

```bash
# Listar todas as funções implantadas
supabase functions list

# Deletar função específica
supabase functions delete <nome-da-funcao>

# Deploy apenas das essenciais
supabase functions deploy api-gateway nautilus-command ai-chat
```

## Links Úteis
- [Supabase Dashboard - Functions](https://supabase.com/dashboard/project/vnbptmixvwropvanyhdb/functions)
- [Edge Functions Pricing](https://supabase.com/pricing)
