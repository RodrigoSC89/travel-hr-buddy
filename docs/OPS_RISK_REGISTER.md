# ⚠️ OPS RISK REGISTER — NAUTI ONE

**Data:** 03/02/2026  
**Versão:** 2.0 (Atualizado após mitigações)  
**Owner:** Tech Lead

---

## 📋 MATRIZ DE RISCOS OPERACIONAIS

| ID | Risco | Impacto | Prob. | Mitigação | Owner | Status |
|----|-------|---------|-------|-----------|-------|--------|
| R01 | **Dados fake em produção** | CRÍTICO | BAIXA | ✅ Hooks reais + EmptyState | Dev Team | 🟢 MITIGADO |
| R02 | **Posição falsa exibida como real** | CRÍTICO | BAIXA | ✅ IntegrationStatus + bloqueio UI | Dev Team | 🟢 MITIGADO |
| R03 | **Perda de dados offline** | ALTO | MÉDIA | Fila sync + retry | Dev Team | 🟡 PARCIAL |
| R04 | **Falha sem audit trail** | ALTO | BAIXA | ✅ Triggers em tabelas CORE | Dev Team | 🟢 MITIGADO |
| R05 | **Erro silencioso** | MÉDIO | BAIXA | ✅ Sentry + observability-helper | SRE | 🟢 MITIGADO |
| R06 | **Módulo vitrine usado como real** | ALTO | BAIXA | ✅ isDemoMode flag + warnings | Dev Team | 🟢 MITIGADO |
| R07 | **Conectividade ruim** | ALTO | ALTA | Offline-first + degraded mode | Dev Team | 🟡 PARCIAL |
| R08 | **Auditoria ISM/ISPS falha** | CRÍTICO | BAIXA | ✅ audit_trail + export hash | Compliance | 🟢 MITIGADO |
| R09 | **Tipagem fraca causa bugs** | MÉDIO | MÉDIA | Em progresso - ~115 arquivos | Dev Team | 🟡 EM PROGRESSO |
| R10 | **Integração externa falha** | ALTO | MÉDIA | Health checks + fallback UX | SRE | 🟡 PARCIAL |

---

## ✅ RISCOS MITIGADOS (Patch 03/02/2026)

### R01 — Dados Fake em Produção ✅ MITIGADO

**Correções aplicadas:**
1. `useAIObservabilityData.ts` - Dados reais do Supabase
2. `AIObservabilityDashboard.tsx` - EmptyState quando não configurado
3. `dgnss-service.ts` - getMock* retorna [] ou null
4. `TenantContext.tsx` - isDemoMode flag explícita
5. `useDGNSSStations.ts` - Hook com IntegrationStatus

**Evidência:** Componentes exibem "Não Configurado" em vez de dados falsos

---

### R02 — Posição Falsa Exibida Como Real ✅ MITIGADO

**Correções aplicadas:**
1. `DGNSSTracking.tsx` - Bloqueio se canShowData === false
2. `GnssLive.tsx` - IntegrationStatus obrigatório
3. `TrackingDashboard.tsx` - Status de integração visível
4. `useGNSSIntegrationStatus.ts` - Verificação de configuração

**Evidência:** UI bloqueia exibição sem integração real configurada

---

### R08 — Auditoria ISM/ISPS ✅ MITIGADO

**Correções aplicadas:**
1. Tabela `audit_trail` com schema completo (21 colunas)
2. Triggers em tabelas CORE: vessels, crew_members, crew_documents, maintenance_records
3. Políticas RLS append-only (INSERT/SELECT apenas)
4. Função `export_audit_trail_with_hash` para verificação de integridade

**Evidência:** Todas mutações em tabelas críticas são auditadas automaticamente

---

## 🟡 RISCOS EM PROGRESSO

### R09 — Tipagem Fraca

**Status:** ~115 arquivos com @ts-nocheck restantes
**Ação:** Priorizar arquivos críticos listados no relatório de prontidão

---

## 📊 DASHBOARD DE STATUS ATUALIZADO

```
CRÍTICOS:  0 abertos (✅ R01, R02, R08 mitigados)
ALTOS:     2 parciais (R03, R07)
MÉDIOS:    1 em progresso (R09)

TOTAL:     10 riscos identificados
MITIGADOS: 6
PARCIAIS:  3
EM PROGRESSO: 1
```

---

## 🎯 PRÓXIMAS AÇÕES

| Prioridade | Ação | Prazo | Responsável |
|------------|------|-------|-------------|
| P1 | Completar offline-first (R03, R07) | 1 semana | Dev Team |
| P2 | Remover @ts-nocheck restantes (R09) | 2 semanas | Dev Team |
| P2 | Health checks em integrações externas (R10) | 1 semana | SRE |
| P3 | Ativar Leaked Password Protection | Imediato | Manual no Supabase |

---

## 📝 HISTÓRICO DE ATUALIZAÇÕES

| Data | Versão | Mudanças |
|------|--------|----------|
| 31/01/2026 | 1.0 | Registro inicial - 10 riscos abertos |
| 03/02/2026 | 2.0 | Mitigação R01, R02, R04, R05, R06, R08 |

---

*Risk Register atualizado em 03/02/2026*
