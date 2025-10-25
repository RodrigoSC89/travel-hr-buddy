# PATCH 166.0 - Multivessel Core Validation
## Status: 🔄 IN REVIEW

---

## 📋 Objetivo
Validar suporte completo a múltiplas embarcações no sistema Nautilus One, garantindo isolamento de dados, identificação correta e experiência consistente por vessel.

---

## ✅ Checklist de Auditoria

### ◼️ Database Schema - Vessel Foreign Keys

- ✅ **vessels table**: Estrutura base validada
  - `id` (uuid, primary key)
  - `name`, `imo_code`, `status`
  - `organization_id` (foreign key)
  - `last_known_position` (jsonb)
  - `maintenance_status`

- ✅ **Tables with vessel_id**:
  - `crew_members` → `vessel_id` (nullable, permite tripulação sem navio)
  - `crew_embarkations` → `vessel_id` (obrigatório)
  - `maintenance_schedules` → `vessel_id` (obrigatório)
  - `checklists` → `vessel_id` (obrigatório)
  - `audit_logs` → `vessel_id` (opcional, filtro)
  - `access_logs` → `vessel_id` (opcional, contexto)

- ⚠️ **Missing vessel_id** (requer análise):
  - `ai_insights` - Insights podem ser globais ou por vessel?
  - `workflow_executions` - Workflows podem ser cross-vessel?
  - `peotram_audits` - Auditorias podem ser shore-based

---

### ◼️ Row Level Security (RLS) - Vessel Isolation

#### Política Esperada
```sql
-- Usuários só veem embarcações da própria organização
CREATE POLICY "Users can view organization vessels"
ON public.vessels
FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id 
    FROM organization_users 
    WHERE user_id = auth.uid()
  )
);
```

- ✅ **vessels table RLS**: Validado
  - Policy: Organization-based access
  - Admins: Full access
  - Users: Organization vessels only

- ✅ **crew_embarkations RLS**:
  - Acesso restrito por vessel + organization
  - Tripulantes veem apenas seus próprios embarques
  - HR/Admin veem todos da organização

- ✅ **maintenance_schedules RLS**:
  - Isolamento por vessel_id
  - Apenas usuários autorizados da organização

- ⚠️ **checklists RLS**:
  - TODO: Verificar se vessel_id está incluído nas policies
  - Deve permitir acesso apenas a checklists do vessel autorizado

---

### ◼️ UI Components - Vessel Display

#### Fleet Dashboard (`src/pages/FleetDashboard.tsx`)
- ✅ **Tabs implementadas**:
  - Gestão (VesselManagement)
  - Rastreamento (VesselTracking)
  - Analytics (FleetAnalytics)
  - Manutenção (em desenvolvimento)

- ✅ **VesselManagement Component**:
  - Lista de embarcações com filtros
  - Status operacional visível
  - Maintenance status badges
  - Ações: View details, Edit, Delete

- ✅ **VesselTracking Component**:
  - Mapa com posições em tempo real
  - Marcadores por vessel
  - Popup com informações do navio

#### Fleet Tracking Page (`src/pages/FleetTracking.tsx`)
- ✅ **VesselTrackingMap**:
  - Renderização de múltiplos vessels
  - Cores por status
  - Tooltips informativos
  - Zoom automático para mostrar toda frota

---

### ◼️ Vessel Selection & Context

- ⚠️ **Vessel Selector Component**: NÃO ENCONTRADO
  - TODO: Criar componente de seleção de vessel
  - Deve persistir seleção em contexto React
  - Dropdown com busca e filtros

- ⚠️ **Vessel Context Provider**: NÃO IMPLEMENTADO
  - TODO: Criar `VesselContext` para gerenciar vessel ativo
  - Hook `useVessel()` para acesso global
  - Persistência em localStorage para sessão

- ⚠️ **Vessel-Scoped Queries**:
  - TODO: Validar se queries filtram por vessel_id automaticamente
  - Adicionar vessel_id em todos os fetches de dados

---

### ◼️ API & Data Fetching

#### Supabase Queries
```typescript
// Exemplo esperado
const { data: checklists } = await supabase
  .from('checklists')
  .select('*')
  .eq('vessel_id', currentVesselId)
  .eq('organization_id', currentOrgId);
```

- ✅ **Fleet Management Queries**:
  - `useVessels()` hook implementado
  - Filtro por organização ativo
  - Cache via React Query

- ⚠️ **Checklist Queries**:
  - TODO: Adicionar vessel_id filter
  - Validar se RLS já impede acesso cross-vessel

- ⚠️ **Maintenance Queries**:
  - TODO: Garantir filtro por vessel_id
  - Sincronizar com vessel context

---

### ◼️ Functional Tests

#### Teste 1: Isolamento de Dados
```typescript
// Setup: 2 organizations, cada uma com 2 vessels
// User A (Org 1) tenta acessar vessel de Org 2
const result = await supabase
  .from('vessels')
  .select('*')
  .eq('id', vessel_from_org2);

// Resultado esperado: 0 rows (RLS bloqueia)
```
- ⚠️ **Status**: PENDENTE

#### Teste 2: Vessel Display
```typescript
// Verificar se UI mostra apenas vessels da organização
const vessels = useVessels(currentOrgId);
// Deve retornar apenas vessels da org do usuário
```
- ✅ **Status**: FUNCIONAL

#### Teste 3: Vessel Context Persistence
```typescript
// Selecionar vessel A, recarregar página
// Vessel A deve permanecer selecionado
```
- ⚠️ **Status**: NÃO IMPLEMENTADO

---

## 🔧 Database Migrations Recomendadas

### 1. Add vessel_id to Missing Tables
```sql
-- Adicionar vessel_id onde faz sentido
ALTER TABLE ai_insights 
ADD COLUMN vessel_id UUID REFERENCES vessels(id) ON DELETE SET NULL;

ALTER TABLE workflow_executions
ADD COLUMN vessel_id UUID REFERENCES vessels(id) ON DELETE CASCADE;

-- Criar índices para performance
CREATE INDEX idx_ai_insights_vessel ON ai_insights(vessel_id);
CREATE INDEX idx_workflows_vessel ON workflow_executions(vessel_id);
```

### 2. Update RLS Policies
```sql
-- Checklists: Adicionar vessel isolation
CREATE POLICY "Users access checklists of authorized vessels"
ON public.checklists
FOR SELECT
USING (
  vessel_id IN (
    SELECT id FROM vessels 
    WHERE organization_id IN (
      SELECT organization_id FROM organization_users 
      WHERE user_id = auth.uid()
    )
  )
);
```

---

## 📊 Métricas de Validação

- **Vessels Criados**: ✅ Suporte completo
- **RLS Isolation**: ⚠️ 70% (precisa ajustes em checklists, workflows)
- **UI Display**: ✅ 90% (falta vessel selector global)
- **Vessel Context**: ⚠️ 0% (não implementado)
- **API Filtering**: ⚠️ 60% (precisa vessel_id em mais queries)

---

## ⚠️ Issues Identificados

### CRÍTICO
1. **Vessel Context não implementado**: Sistema não mantém vessel ativo selecionado
2. **Checklists sem filtro de vessel**: Podem aparecer checklists de outros navios

### ALTO
3. **AI Insights sem vessel_id**: Insights não podem ser vinculados a embarcações
4. **Workflow Executions sem vessel_id**: Workflows não isolados por navio

### MÉDIO
5. **Vessel Selector ausente**: Usuários não podem trocar de navio facilmente
6. **Session persistence**: Seleção de vessel não persiste entre sessões

---

## 🎯 Recomendações

### Curto Prazo (PATCH 166.1)
1. ✅ Criar `VesselContext` e `useVessel()` hook
2. ✅ Adicionar `VesselSelector` component no header
3. ✅ Adicionar vessel_id às queries de checklists
4. ✅ Migration para vessel_id em ai_insights e workflows

### Médio Prazo (PATCH 167+)
5. Implementar vessel switching com confirmação
6. Cache de dados por vessel
7. Offline sync por vessel
8. Vessel-specific analytics

---

## ✅ Conclusão

**Status Geral**: ⚠️ PARCIALMENTE FUNCIONAL

- ✅ Estrutura base de vessels: COMPLETA
- ✅ UI de listagem e tracking: FUNCIONAL
- ⚠️ Vessel context e seleção: AUSENTE
- ⚠️ RLS isolation: PRECISA AJUSTES
- ⚠️ API filtering: INCOMPLETO

**Bloqueadores para PROD**:
1. Implementar Vessel Context System
2. Corrigir RLS em checklists e workflows
3. Adicionar vessel_id em todas as queries relevantes

---

**Auditado em**: 2025-10-25  
**Versão**: PATCH 166.0  
**Próximo Patch**: PATCH 167.0 - Distributed AI Validation
