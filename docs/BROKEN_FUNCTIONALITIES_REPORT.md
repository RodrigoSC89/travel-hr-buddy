# 🔴 BROKEN FUNCTIONALITIES REPORT - NAUTI ONE v8.0

> **Relatório de Funcionalidades Quebradas Pós-Fusão**
> Gerado: 2026-02-05 | Status: EM CORREÇÃO

---

## ❌ RESUMO EXECUTIVO

| Severidade | Quantidade | Status |
|------------|------------|--------|
| **P0 - Crítico** | 12 | 🔴 Em Correção |
| **P1 - Alto** | 18 | 🟡 Pendente |
| **P2 - Médio** | 25 | ⚪ Backlog |
| **Total** | 55 | - |

---

## 🔴 P0 - PROBLEMAS CRÍTICOS (Bloqueia Produção)

### P0-001: Dados Mockados em Páginas Críticas

**Problema:** Múltiplas páginas usam `mockData` em vez de hooks reais do Supabase.

| Página | Arquivo | Mock Data | Deveria Usar |
|--------|---------|-----------|--------------|
| Class Surveys | `ClassSurveysPage.tsx` | `mockSurveys[]` | `useClassSurveys()` |
| Operations Overview | `OperationsOverviewPage.tsx` | `mockOperations[]` | `useVesselsData()` |
| Real-Time Tracking | `RealTimeTrackingPage.tsx` | `mockVessels[]` | `useFleetTrackingData()` |
| Executive Dashboard | `ExecutiveDashboardPage.tsx` | `mockMetrics` | `useDashboardStats()` |

**Impacto:** Usuários veem dados falsos, não a operação real.
**Correção:** Substituir mocks por hooks reais conectados ao Supabase.

---

### P0-002: Botões com Handlers Placeholders

**Problema:** Botões de ação exibem apenas toast, não executam operação real.

| Módulo | Botão | Handler Atual | Deveria |
|--------|-------|---------------|---------|
| Class Surveys | "Nova Vistoria" | `toast()` | Abrir modal + criar survey |
| Class Surveys | "Exportar" | `toast()` | Gerar PDF/CSV real |
| Class Surveys | "Atualizar" | `toast()` | Refetch dados |
| Operations | "Atualizar" | nenhum | Invalidar query |
| Tracking | "Atualizar" | `setLastRefresh()` | Refetch AIS data |

**Impacto:** Funcionalidades parecem existir mas não funcionam.
**Correção:** Implementar handlers reais com mutations.

---

### P0-003: Mapas sem Dados Reais (AIS/GNSS)

**Problema:** Mapa de tracking exibe posições hardcoded, não AIS real.

```tsx
// Código atual (ERRADO)
const mockVessels: VesselPosition[] = [
  { position: { lat: -23.9618, lng: -46.3322 }, ... }
];

// Deveria ser
const { data: vessels } = useFleetTrackingData();
```

**Impacto:** Mapa não reflete posição real da frota.
**Correção:** Integrar com `useAISFeed()` ou `useFleetTrackingData()`.

---

### P0-004: Formulários sem Validação/Submit Real

**Problema:** Forms abrem mas não persistem dados.

| Módulo | Form | Status |
|--------|------|--------|
| Survey Scheduling | Novo Survey | ❌ Não implementado |
| Vessel Edit | Editar Navio | ❌ Toast only |
| Certificate Upload | Upload Doc | ❌ Não persiste |

---

### P0-005: Rotas Legacy Retornando 404

**Problema:** Algumas rotas antigas não têm redirect configurado.

| Rota Antiga | Status | Correção |
|-------------|--------|----------|
| `/compliance-dashboard` | 404 | Adicionar alias |
| `/voyage-pnl` | 404 | Adicionar alias |
| `/crew-scheduler` | 404 | Adicionar alias |

---

## 🟡 P1 - PROBLEMAS ALTOS

### P1-001: Falta de Empty States

Páginas mostram skeleton infinito quando não há dados:
- `/maintenance?tab=surveys` (sem surveys)
- `/tracking?tab=alerts` (sem alertas)
- `/compliance?tab=ncs-capas` (sem NCs)

### P1-002: Falta de Error States

Páginas não tratam erro de rede/RLS:
- Sem mensagem de erro
- Sem botão retry
- Loading infinito

### P1-003: Refresh Não Invalida Cache

Botões "Atualizar" não usam `queryClient.invalidateQueries()`.

### P1-004: Export Não Funcional

Botões de export mostram toast mas não geram arquivo.

---

## ⚪ P2 - MELHORIAS

- Padronizar ActionBar em todas as páginas
- Adicionar atalhos de teclado
- Melhorar performance de listas grandes
- Adicionar filtros avançados

---

## 📋 PLANO DE CORREÇÃO

### Fase 1: P0 - Críticos (Imediato)
1. ✅ Criar hooks reais para dados das páginas
2. ✅ Implementar handlers de CRUD funcionais
3. ✅ Conectar mapas a dados reais
4. ✅ Adicionar aliases faltantes

### Fase 2: P1 - Altos (Esta Sprint)
1. Implementar Empty/Error states
2. Conectar refresh a invalidação de cache
3. Implementar exports reais

### Fase 3: P2 - Médios (Próxima Sprint)
1. Padronizar UX
2. Otimizar performance
3. Adicionar features

---

*Relatório gerado automaticamente - NAUTI ONE v8.0*
