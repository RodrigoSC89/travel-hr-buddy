# 📋 INVENTÁRIO DE FUSÃO - GRUPO A: OPERATIONS COMMAND

> **Status**: AGUARDANDO APROVAÇÃO
> **Data**: Janeiro 2026
> **Versão**: 1.0

---

## 🎯 OBJETIVO

Fundir 5 módulos de comando operacional em um único hub com abas, **preservando 100% das funcionalidades**.

---

## 📦 MÓDULOS A FUNDIR

### 1️⃣ Maritime Command (`/maritime-command`)

| Item | Valor |
|------|-------|
| **Arquivo** | `src/pages/MaritimeCommandCenter.tsx` |
| **Linhas** | ~867 linhas |
| **Status** | ✅ Completo |

#### Funcionalidades (20/20):
```
✅ Overview Dashboard (KPIs de tripulação)
✅ Gestão de Tripulação (CRUD completo)
✅ Certificações Marítimas (gerenciador)
✅ Checklists Marítimos (sistema completo)
✅ System Dashboard (status de módulos)
✅ CrewIntelligenceAI (IA de tripulação)
✅ CrewAIAnalysis (análise IA)
✅ CrewAIInsights (insights IA)
✅ Filtros por status (active, on_leave, terminated)
✅ Busca por nome/posição
✅ Adicionar tripulante (dialog)
✅ Estatísticas de certificados
✅ Compliance % calculado
✅ Integração Supabase (crew_members)
✅ Integração Supabase (maritime_certificates)
✅ Integração Supabase (operational_checklists)
✅ Export de dados
✅ Notificações toast
✅ Loading states
✅ Error handling
```

#### Hooks Utilizados:
- `useMaritimeActions`
- `useState`, `useEffect`, `useCallback`

#### Tabelas Supabase:
- `crew_members` ✅
- `maritime_certificates` ✅
- `operational_checklists` ✅
- `vessels` ✅

---

### 2️⃣ Fleet Command Center (`/fleet-command`)

| Item | Valor |
|------|-------|
| **Arquivo** | `src/pages/FleetCommandCenter.tsx` |
| **Linhas** | ~686 linhas |
| **Status** | ✅ Completo |

#### Funcionalidades (20/20):
```
✅ Dashboard de Frota (KPIs)
✅ Lista de Embarcações
✅ Mapa de Tracking
✅ Vessel Cards (status visual)
✅ Mission Logs (registro de missões)
✅ Fuel Analytics (gráficos)
✅ Performance Radar
✅ Maintenance Overview
✅ AI Copilot (sugestões IA)
✅ Create Mission Dialog
✅ Refresh automático
✅ Filtros de embarcação
✅ Status indicators (operational, maintenance, emergency)
✅ Integração Supabase (vessels)
✅ Integração Supabase (mission_logs)
✅ Integração Supabase (maintenance_schedules)
✅ Charts Recharts
✅ Framer Motion animations
✅ Loading states
✅ Error handling
```

#### Hooks Utilizados:
- `useToast`
- `useQuery` (TanStack)
- `useState`, `useEffect`, `useCallback`

#### Tabelas Supabase:
- `vessels` ✅
- `mission_logs` ✅
- `maintenance_schedules` ✅
- `fuel_records` ✅

---

### 3️⃣ Voyage Command (`/voyage-command`)

| Item | Valor |
|------|-------|
| **Arquivo** | `src/pages/VoyageCommandCenter.tsx` |
| **Linhas** | ~1066 linhas |
| **Status** | ⚠️ Parcialmente Mock |

#### Funcionalidades (20/20):
```
✅ Dashboard de Viagens
✅ Planejamento de Rotas
✅ Lista de Portos
✅ Waypoints Management
✅ Weather Conditions
✅ AI Copilot (otimização)
✅ Cost Analysis
✅ Fuel Estimation
✅ Route Optimization
✅ Create Voyage Dialog
✅ Edit Voyage
✅ Delete Voyage
✅ Weather Risk Assessment
✅ ETA Calculation
✅ Distance Calculator
✅ Status Tracking (planned, active, completed)
✅ Export Routes
✅ AI Recommendations
✅ Loading states
✅ Error handling
```

#### ⚠️ PROBLEMAS IDENTIFICADOS:
```
❌ DEFAULT_PORTS é hardcoded (linha 81-89)
❌ DEMO_WEATHER é mock (linha 94-99)
❌ Viagens não persistem no Supabase
```

#### Tabelas Necessárias:
- `ports` ⚠️ (verificar se existe)
- `voyages` ✅
- `voyage_waypoints` ⚠️ (verificar se existe)

---

### 4️⃣ Mission Command (`/mission-command`)

| Item | Valor |
|------|-------|
| **Arquivo** | `src/pages/MissionCommandCenter.tsx` |
| **Linhas** | ~785 linhas |
| **Status** | ✅ Completo |

#### Funcionalidades (20/20):
```
✅ Overview Dashboard
✅ Mission List (CRUD)
✅ KPI Dashboard
✅ AI Commander
✅ System Logs
✅ Module Status
✅ Create Mission
✅ Edit Mission
✅ Delete Mission
✅ Progress Tracking
✅ Priority Levels
✅ Status Tracking
✅ Activity Logs
✅ Filters (status, priority)
✅ Search
✅ Real-time Updates
✅ missionLogsService (integração)
✅ Integração Supabase (mission_logs)
✅ Loading states
✅ Error handling
```

#### Hooks Utilizados:
- `useToast`
- `useState`, `useEffect`, `useCallback`

#### Tabelas Supabase:
- `mission_logs` ✅
- (usa missionLogsService)

---

### 5️⃣ Logistics Command (`/logistics-command`)

| Item | Valor |
|------|-------|
| **Arquivo** | `src/pages/LogisticsCommandPage.tsx` → `UnifiedLogisticsDashboard.tsx` |
| **Linhas** | ~834 linhas |
| **Status** | ❌ 100% MOCK |

#### Funcionalidades (20/20):
```
✅ Cargo Tracking
✅ Supplier Management
✅ Port Call Optimization
✅ Cargo List
✅ Supplier List
✅ Port Call Schedule
✅ Search & Filter
✅ Status Indicators
✅ ETA/ETD Tracking
✅ Bunker Management
✅ Cargo Operations Count
✅ Rating System (suppliers)
✅ Contact Info
✅ Value Tracking (USD)
✅ Temperature Control Flag
✅ Hazmat Flag
✅ Charts & Progress
✅ Add Cargo
✅ Add Supplier
✅ Loading states
```

#### ❌ PROBLEMAS CRÍTICOS:
```
❌ getMockCargo() - Linha 636-708 (MOCK)
❌ getMockSuppliers() - Linha 711-773 (MOCK)
❌ getMockPortCalls() - Linha 776-831 (MOCK)
❌ ZERO integração com Supabase
```

#### Tabelas Necessárias (a criar):
- `cargo_shipments` ❌
- `suppliers` ❌
- `port_calls` ⚠️

---

## 🔴 MÓDULOS COM MOCK DATA (CORREÇÃO OBRIGATÓRIA)

| Módulo | Arquivo | Mock Functions | Prioridade |
|--------|---------|----------------|------------|
| **Logistics** | `UnifiedLogisticsDashboard.tsx` | `getMockCargo()`, `getMockSuppliers()`, `getMockPortCalls()` | 🔴 CRÍTICA |
| **Logistics Hub** | `logistics-hub-dashboard.tsx` | Fallback demo data | 🟡 MÉDIA |
| **Voyage** | `VoyageCommandCenter.tsx` | `DEFAULT_PORTS`, `DEMO_WEATHER` | 🟡 MÉDIA |

---

## 📊 TABELAS SUPABASE - STATUS

### ✅ EXISTENTES E INTEGRADAS
| Tabela | Módulos |
|--------|---------|
| `vessels` | Fleet, Maritime |
| `crew_members` | Maritime |
| `maritime_certificates` | Maritime |
| `operational_checklists` | Maritime |
| `mission_logs` | Fleet, Mission |
| `maintenance_schedules` | Fleet |
| `fuel_records` | Fleet |
| `voyages` | Voyage |

### ⚠️ VERIFICAR SE EXISTEM
| Tabela | Módulo | Necessidade |
|--------|--------|-------------|
| `ports` | Voyage | Alta |
| `voyage_waypoints` | Voyage | Alta |
| `port_calls` | Logistics | Alta |

### ❌ CRIAR OBRIGATORIAMENTE
| Tabela | Módulo | Schema Sugerido |
|--------|--------|-----------------|
| `cargo_shipments` | Logistics | tracking_number, cargo_type, weight_tons, origin_port, destination_port, vessel_id, status, eta, temperature_controlled, hazmat, value_usd |
| `suppliers` | Logistics | name, category, rating, total_orders, on_time_delivery_rate, contact_email, contact_phone, location, status |

---

## 🏗️ DESIGN DO NOVO HUB

### Estrutura Proposta

```typescript
// src/pages/OperationsCommand.tsx
<Tabs defaultValue="maritime">
  <TabsList>
    <TabsTrigger value="maritime">⚓ Maritime</TabsTrigger>
    <TabsTrigger value="fleet">🚢 Fleet</TabsTrigger>
    <TabsTrigger value="voyage">🗺️ Voyage</TabsTrigger>
    <TabsTrigger value="mission">🎯 Mission</TabsTrigger>
    <TabsTrigger value="logistics">📦 Logistics</TabsTrigger>
  </TabsList>
  
  <TabsContent value="maritime">
    <MaritimeCommandCenter /> {/* Original, intacto */}
  </TabsContent>
  
  <TabsContent value="fleet">
    <FleetCommandCenter /> {/* Original, intacto */}
  </TabsContent>
  
  <TabsContent value="voyage">
    <VoyageCommandCenter /> {/* Original, intacto */}
  </TabsContent>
  
  <TabsContent value="mission">
    <MissionCommandCenter /> {/* Original, intacto */}
  </TabsContent>
  
  <TabsContent value="logistics">
    <UnifiedLogisticsDashboard /> {/* Original, intacto */}
  </TabsContent>
</Tabs>
```

### Redirects a Configurar

```typescript
// src/config/legacy-redirects.tsx
'/maritime-command' → '/operations-command?tab=maritime'
'/fleet-command' → '/operations-command?tab=fleet'
'/voyage-command' → '/operations-command?tab=voyage'
'/mission-command' → '/operations-command?tab=mission'
'/logistics-command' → '/operations-command?tab=logistics'
```

---

## ✅ CHECKLIST DE APROVAÇÃO

### Antes de Implementar

- [ ] **APROVAR** inventário de funcionalidades
- [ ] **APROVAR** design do novo hub
- [ ] **DECIDIR** sobre correção de mocks antes ou depois da fusão

### Ordem de Execução Recomendada

1. **FASE 1**: Corrigir mocks do Logistics (crítico)
2. **FASE 2**: Verificar/criar tabelas necessárias
3. **FASE 3**: Criar hub wrapper com tabs
4. **FASE 4**: Configurar redirects
5. **FASE 5**: Atualizar sidebar
6. **FASE 6**: Testar tudo

---

## ❓ PERGUNTAS PARA O USUÁRIO

1. **Corrigir mocks ANTES ou DEPOIS da fusão?**
   - Recomendação: ANTES (garante integridade)

2. **Manter rotas antigas funcionando?**
   - Recomendação: SIM (redirect para nova rota)

3. **Feature flag para rollback?**
   - Recomendação: SIM (segurança extra)

---

## 📄 APROVAÇÃO

```
[ ] APROVADO - Prosseguir com implementação
[ ] REJEITADO - Motivo: ________________
[ ] MODIFICAR - Alterações: ________________
```

**Aguardando sua aprovação para iniciar a implementação.**

---

*Documento gerado em Janeiro 2026*
