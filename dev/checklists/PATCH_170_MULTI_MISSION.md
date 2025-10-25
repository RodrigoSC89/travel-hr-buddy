# PATCH 170.0 - Multi-Mission Coordination Validation
## Status: 🔄 IN REVIEW

---

## 📋 Objetivo
Validar resposta coordenada entre embarcações, permitindo missões que envolvem múltiplos vessels com distribuição de funções, sincronização de status e visualização unificada.

---

## ✅ Checklist de Auditoria

### ◼️ Mission Engine - Multi-Vessel Support

#### Mission Core (`src/modules/mission-engine/index.ts`)
- ✅ **Mission Interface**:
  ```typescript
  interface Mission {
    id: string;
    name: string;
    steps: MissionStep[];
    conditions: MissionCondition[];
    logs: MissionLog[];
  }
  ```

- ⚠️ **Multi-Vessel Extension**: NÃO IMPLEMENTADO
  - Missão atual: Single vessel
  - Deveria ter:
    ```typescript
    interface MultiVesselMission extends Mission {
      participating_vessels: string[]; // vessel_id[]
      coordinator_vessel: string; // lead vessel
      vessel_roles: Record<string, string>; // vessel_id → role
      sync_required: boolean;
    }
    ```

#### Mission Examples (`src/modules/mission-engine/examples.ts`)
- ✅ **Exemplos Atuais**:
  - `setupAutoCompleteChecklistMission`
  - `setupAutoEscalateIncidentMission`
  - Ambos são single-vessel

- ❌ **Multi-Vessel Examples**: AUSENTES
  - TODO: `setupCoordinatedRescueMission()`
  - TODO: `setupFleetManeuverMission()`
  - TODO: `setupConvoyEscortMission()`

---

### ◼️ Database Schema - Multi-Vessel Missions

#### Expected Tables
```sql
-- Tabela principal de missões multi-vessel
CREATE TABLE multi_vessel_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  mission_name TEXT NOT NULL,
  mission_type TEXT NOT NULL, -- 'rescue', 'escort', 'search', 'maneuver'
  coordinator_vessel_id UUID REFERENCES vessels(id) NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, active, completed, aborted
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Participação de vessels na missão
CREATE TABLE mission_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID REFERENCES multi_vessel_missions(id) ON DELETE CASCADE,
  vessel_id UUID REFERENCES vessels(id) NOT NULL,
  role TEXT NOT NULL, -- 'coordinator', 'support', 'observer'
  status TEXT DEFAULT 'assigned', -- assigned, active, completed
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(mission_id, vessel_id)
);

-- Logs de eventos da missão
CREATE TABLE mission_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID REFERENCES multi_vessel_missions(id) ON DELETE CASCADE,
  vessel_id UUID REFERENCES vessels(id),
  event_type TEXT NOT NULL, -- 'started', 'checkpoint', 'completed', 'alert'
  event_data JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

- ❌ **Status**: TABELAS NÃO EXISTEM
  - TODO: Criar migration PATCH_170
  - TODO: Implementar RLS policies

---

### ◼️ AI-Powered Role Distribution

#### AI Service for Mission Planning
```typescript
// src/ai/services/missionPlanner.ts
interface VesselCapability {
  vessel_id: string;
  vessel_type: string;
  crew_size: number;
  equipment: string[];
  current_status: string;
  current_location: { lat: number; lng: number };
}

interface RoleAssignment {
  vessel_id: string;
  assigned_role: 'coordinator' | 'support' | 'observer';
  reasoning: string;
  estimated_duration: number;
}

async function suggestRoleDistribution(
  missionType: string,
  availableVessels: VesselCapability[]
): Promise<RoleAssignment[]>
```

- ❌ **Status**: NÃO IMPLEMENTADO
  - TODO: Criar `missionPlanner.ts`
  - TODO: Integrar com AI Engine
  - TODO: Considerar localização, capacidades, status

#### AI Prompt for Role Assignment
```typescript
const prompt = `
Mission Type: ${missionType}
Available Vessels: ${JSON.stringify(vessels)}

Based on vessel capabilities, location, and current status, assign roles:
- Coordinator: Lead vessel, closest to incident
- Support: Vessels with relevant equipment
- Observer: Monitoring vessels

Return JSON with role assignments and reasoning.
`;
```

- ⚠️ **Status**: CONCEITO DEFINIDO, NÃO IMPLEMENTADO

---

### ◼️ Mission Coordination UI

#### Multi-Vessel Mission Dashboard
- ❌ **Component**: `MultiVesselMissionDashboard` NÃO EXISTE
  - Features esperadas:
    - Mapa com todos os vessels participantes
    - Timeline de eventos sincronizados
    - Status de cada vessel (checklist progress)
    - Chat/comunicação entre vessels
    - Botão para abortar missão

#### Mission Creation Wizard
```typescript
// src/components/missions/mission-creation-wizard.tsx
<MissionWizard>
  <Step1: Select Mission Type />
  <Step2: Select Participating Vessels />
  <Step3: AI Role Assignment (review & adjust) />
  <Step4: Define Success Criteria />
  <Step5: Schedule Start Time />
  <Step6: Confirm & Launch />
</MissionWizard>
```

- ❌ **Status**: NÃO IMPLEMENTADO

#### Mission Status View
- ❌ **Component**: `MissionStatusView` NÃO EXISTE
  - Deve mostrar:
    - Vessel cards com progresso individual
    - Gráfico de linha do tempo
    - Alertas e checkpoints
    - Botão de comunicação rápida

---

### ◼️ Event Synchronization - Mission Logs

#### Mission Event Stream
- ⚠️ **MQTT Topic**: `fleet/{org_id}/missions/{mission_id}/events`
  - Eventos:
    - `mission_started`
    - `vessel_checkpoint_reached`
    - `vessel_alert`
    - `mission_completed`
    - `mission_aborted`

- ❌ **Status**: NÃO IMPLEMENTADO
  - TODO: Definir schema de eventos
  - TODO: Implementar pub/sub
  - TODO: Realtime updates na UI

#### Cross-Vessel Log Aggregation
```typescript
// Aggregar logs de todos os vessels participantes
async function getMissionLogs(missionId: string) {
  const participants = await getParticipants(missionId);
  const vesselIds = participants.map(p => p.vessel_id);
  
  const logs = await supabase
    .from('access_logs')
    .select('*')
    .in('vessel_id', vesselIds)
    .gte('timestamp', mission.started_at)
    .order('timestamp', { ascending: true });
  
  return logs;
}
```

- ⚠️ **Status**: CONCEITO VÁLIDO, NÃO IMPLEMENTADO

---

### ◼️ Mission Status & Progress Tracking

#### Unified Progress Dashboard
```typescript
interface MissionProgress {
  mission_id: string;
  overall_progress: number; // 0-100%
  vessel_progress: Record<string, {
    vessel_id: string;
    vessel_name: string;
    progress: number;
    current_step: string;
    status: 'active' | 'completed' | 'delayed' | 'critical';
  }>;
  estimated_completion: string;
}
```

- ❌ **Status**: NÃO IMPLEMENTADO
  - TODO: Calcular progresso agregado
  - TODO: Visualização em tempo real
  - TODO: Alertas se vessel atrasar

#### Mission Checkpoints
```typescript
interface MissionCheckpoint {
  id: string;
  mission_id: string;
  checkpoint_name: string;
  required_vessels: string[]; // Must all reach before proceeding
  reached_by: string[]; // Vessels that reached
  timestamp: string;
}
```

- ❌ **Status**: NÃO IMPLEMENTADO
  - Checkpoints forçam sincronização
  - Ex: "Todos vessels devem confirmar posição antes de prosseguir"

---

### ◼️ Communication Between Vessels

#### Mission Chat/Communication
- ❌ **Component**: `MissionChatPanel` NÃO EXISTE
  - Usar `crew_communications` table?
  - Ou criar `mission_communications` dedicada?
  - TODO: Decidir arquitetura

- ⚠️ **MQTT Real-Time**: `fleet/{org_id}/missions/{mission_id}/chat`
  - Mensagens instantâneas entre vessels
  - Comandos rápidos (ex: "Confirmar posição", "Abortar")

---

## 🧪 Testes Funcionais

### Teste 1: Create Multi-Vessel Mission
```typescript
// Admin: Criar missão de resgate com 3 vessels
const mission = await createMultiVesselMission({
  name: 'Rescue Operation Alpha',
  type: 'rescue',
  vessels: [vesselA_id, vesselB_id, vesselC_id]
});

// IA deve sugerir roles
const roles = await suggestRoleDistribution('rescue', vessels);
// vesselA (mais próximo) → coordinator
// vesselB (equipamento médico) → support
// vesselC (observação) → observer
```
- ❌ **Status**: NÃO IMPLEMENTADO

### Teste 2: Sync Mission Events
```typescript
// VesselA: Marcar checkpoint como alcançado
await reachCheckpoint(missionId, checkpointId, vesselA_id);

// Dashboard: Deve atualizar em tempo real
// VesselB e C: Devem receber notificação via MQTT
```
- ❌ **Status**: NÃO IMPLEMENTADO

### Teste 3: Mission Progress Tracking
```typescript
// VesselA: 80% completo
// VesselB: 60% completo
// VesselC: 90% completo
// Overall progress: (80+60+90)/3 = 76.67%

const progress = await getMissionProgress(missionId);
expect(progress.overall_progress).toBeCloseTo(76.67);
```
- ❌ **Status**: NÃO IMPLEMENTADO

### Teste 4: Abort Mission
```typescript
// Coordinator: Abortar missão
await abortMission(missionId, 'Weather conditions');

// Todos vessels: Devem receber comando via MQTT
// Status de todos: 'aborted'
// UI: Mostrar mensagem de abort
```
- ❌ **Status**: NÃO IMPLEMENTADO

---

## 📊 Métricas de Validação

- **Multi-Vessel Schema**: ❌ 0% (tabelas não existem)
- **AI Role Distribution**: ❌ 0% (não implementado)
- **Mission UI**: ❌ 0% (componentes ausentes)
- **Event Sync**: ❌ 0% (sem MQTT topics)
- **Progress Tracking**: ❌ 0% (ausente)
- **Cross-Vessel Communication**: ❌ 0% (não implementado)

---

## ⚠️ Issues Identificados

### CRÍTICO
1. **Multi-Vessel Missions não existem no DB**: Schema completo ausente
2. **Nenhum componente UI**: Sistema não tem interface para criar/gerenciar
3. **Event Sync não implementado**: Vessels não se comunicam durante missão

### ALTO
4. **AI Role Assignment ausente**: Distribuição manual, sem sugestões inteligentes
5. **Progress Tracking faltando**: Sem visibilidade do status agregado
6. **Checkpoints não implementados**: Sem sincronização forçada entre vessels

### MÉDIO
7. **Communication channel indefinido**: Sem chat/mensagens entre vessels
8. **Abort logic ausente**: Não há como cancelar missão coordenadamente
9. **Historical analysis**: Sem relatórios de missões passadas

---

## 🎯 Recomendações

### Imediato (PATCH 170.1)
1. ✅ Criar migrations para multi-vessel mission tables
2. ✅ Implementar RLS policies (organization-based)
3. ✅ Criar `missionPlanner.ts` com AI role assignment
4. ✅ Definir MQTT topics para mission sync

### Curto Prazo (PATCH 171)
5. Implementar `MultiVesselMissionDashboard`
6. Mission Creation Wizard com IA
7. Real-time event sync via MQTT
8. Progress tracking agregado

### Médio Prazo
9. Mission checkpoint system
10. Inter-vessel communication (chat)
11. Mission analytics e relatórios
12. Mission templates library

---

## 🔧 Implementações Prioritárias

### 1. Database Schema
```sql
-- See "Database Schema - Multi-Vessel Missions" section above
-- Migration: 20250125_create_multi_vessel_missions.sql
```

### 2. AI Mission Planner
```typescript
// src/ai/services/missionPlanner.ts
export async function suggestRoleDistribution(
  missionType: string,
  vessels: VesselCapability[]
): Promise<RoleAssignment[]> {
  const prompt = generateMissionPlanningPrompt(missionType, vessels);
  const response = await runOpenAI({
    prompt,
    systemPrompt: 'You are a maritime mission coordinator...',
    model: 'gpt-4o-mini'
  });
  
  return JSON.parse(response.message);
}
```

### 3. Mission Dashboard Component
```typescript
// src/components/missions/multi-vessel-mission-dashboard.tsx
export function MultiVesselMissionDashboard({ missionId }: Props) {
  const { mission, participants, events } = useMission(missionId);
  
  return (
    <div className="grid grid-cols-3 gap-4">
      <MissionMap vessels={participants} />
      <MissionTimeline events={events} />
      <VesselStatusCards participants={participants} />
      <MissionControls missionId={missionId} />
    </div>
  );
}
```

### 4. MQTT Event Sync
```typescript
// Subscribe to mission events
const channel = mqttClient.subscribe(
  `fleet/${orgId}/missions/${missionId}/events`,
  (event: MissionEvent) => {
    updateMissionUI(event);
    if (event.type === 'vessel_alert') {
      showAlert(event.data);
    }
  }
);
```

---

## ✅ Conclusão

**Status Geral**: ❌ NÃO IMPLEMENTADO

- ❌ Database Schema: AUSENTE
- ❌ AI Planning: NÃO EXISTE
- ❌ UI Components: NENHUM
- ❌ Event Sync: NÃO IMPLEMENTADO
- ❌ Progress Tracking: AUSENTE
- ❌ Communication: NÃO DEFINIDO

**Bloqueadores para PROD**:
1. Criar schema completo de multi-vessel missions
2. Implementar UI de criação e gerenciamento
3. AI role assignment funcional
4. Event sync via MQTT
5. Progress tracking em tempo real

**Dependências**:
- PATCH 166: Vessel Context (prerequisito)
- PATCH 167: Distributed AI (para role assignment)
- PATCH 169: Intervessel Sync (essencial)

**Esforço Estimado**: 🔴 ALTO (feature complexa, múltiplas integrações)

---

**Auditado em**: 2025-10-25  
**Versão**: PATCH 170.0  
**Status Final**: FEATURE NÃO IMPLEMENTADA - REQUER DESENVOLVIMENTO COMPLETO
