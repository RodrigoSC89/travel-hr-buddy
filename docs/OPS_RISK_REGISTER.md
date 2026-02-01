# ⚠️ OPS RISK REGISTER — NAUTI ONE

**Data:** 31/01/2026  
**Versão:** 1.0  
**Owner:** Tech Lead

---

## 📋 MATRIZ DE RISCOS OPERACIONAIS

| ID | Risco | Impacto | Prob. | Mitigação | Owner | Status |
|----|-------|---------|-------|-----------|-------|--------|
| R01 | **Dados fake em produção** | CRÍTICO | ALTA | Zerar mocks, empty states reais | Dev Team | 🔴 ABERTO |
| R02 | **Posição falsa exibida como real** | CRÍTICO | ALTA | IntegrationStatus obrigatório | Dev Team | 🔴 ABERTO |
| R03 | **Perda de dados offline** | ALTO | MÉDIA | Fila sync + retry + conflict resolution | Dev Team | 🔴 ABERTO |
| R04 | **Falha sem audit trail** | ALTO | MÉDIA | Logs append-only + triggers | Dev Team | 🔴 ABERTO |
| R05 | **Erro silencioso** | MÉDIO | ALTA | Sentry + alertas | SRE | 🔴 ABERTO |
| R06 | **Módulo vitrine usado como real** | ALTO | MÉDIA | OPS_REAL mode + feature flags | Dev Team | 🔴 ABERTO |
| R07 | **Conectividade ruim** | ALTO | ALTA | Offline-first + degraded mode | Dev Team | 🔴 ABERTO |
| R08 | **Auditoria ISM/ISPS falha** | CRÍTICO | MÉDIA | Compliance 100% + export | Compliance | 🔴 ABERTO |
| R09 | **Tipagem fraca causa bugs** | MÉDIO | MÉDIA | Zerar @ts-ignore + reduzir any | Dev Team | 🟡 EM PROGRESSO |
| R10 | **Integração externa falha** | ALTO | ALTA | Health checks + fallback UX | SRE | 🔴 ABERTO |

---

## 🔴 RISCOS CRÍTICOS DETALHADOS

### R01 — Dados Fake em Produção

**Descrição:** 479 ocorrências de mock data, incluindo módulos que exibem dados simulados como se fossem reais.

**Impacto:**
- Usuário toma decisão baseada em dado falso
- Perda de confiança no sistema
- Falha em auditoria

**Mitigação:**
1. Substituir todos os mocks por hooks Supabase reais
2. Onde não há backend: mostrar EmptyState + CTA + "Não configurado"
3. Gate no CI: `gate:no-mock-prod`

**Evidência de Resolução:** 0 matches de MOCK_/mockData em `src/` (exceto tests/)

---

### R02 — Posição Falsa Exibida Como Real

**Descrição:** AIS/DGNSS/Satellite usam dados simulados quando API não está configurada, mas UI não informa isso ao usuário.

**Impacto:**
- Decisão de navegação baseada em posição errada
- Risco de segurança marítima
- Violação de regulamentações

**Mitigação:**
1. Criar tipo `IntegrationStatus`: CONNECTED | DEGRADED | DISCONNECTED | NOT_CONFIGURED
2. Toda integração externa deve reportar seu status
3. UI deve exibir status claramente
4. Proibido exibir mapa com dados inventados

**Evidência de Resolução:** Componentes de tracking exibem status real da integração

---

### R08 — Auditoria ISM/ISPS Falha

**Descrição:** Sistema pode não passar em auditoria de segurança marítima por falta de rastreabilidade completa.

**Impacto:**
- Certificação negada
- Operação suspensa
- Perda de contratos

**Mitigação:**
1. Audit trail append-only em todas tabelas CORE
2. Triggers de auditoria com before/after
3. Export com hash de integridade
4. Evidências anexáveis a incidentes/ações corretivas

**Evidência de Resolução:** Relatórios exportáveis passam verificação de integridade

---

## 📊 DASHBOARD DE STATUS

```
CRÍTICOS:  3 abertos (R01, R02, R08)
ALTOS:     5 abertos (R03, R04, R06, R07, R10)
MÉDIOS:    2 abertos (R05, R09)

TOTAL:     10 riscos identificados
RESOLVIDOS: 0
EM PROGRESSO: 1
```

---

## 🎯 PLANO DE AÇÃO

| Prioridade | Ação | Prazo | Responsável |
|------------|------|-------|-------------|
| P0 | Zerar mocks em produção | Imediato | Dev Team |
| P0 | IntegrationStatus em externas | Imediato | Dev Team |
| P1 | CORE 100% (7 módulos) | 2 dias | Dev Team |
| P2 | Audit trail imutável | 3 dias | Dev Team |
| P3 | Offline-first + sync | 4 dias | Dev Team |
| P4 | Observabilidade | 5 dias | SRE |
| P5 | E2E + carga + latência | 6 dias | QA |
| P6 | OPS_REAL mode | 7 dias | Dev Team |

---

*Risk Register atualizado em 31/01/2026*
