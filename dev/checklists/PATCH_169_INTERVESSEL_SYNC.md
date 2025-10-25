# PATCH 169.0 - Intervessel Sync Validation
## Status: 🔄 IN REVIEW

---

## 📋 Objetivo
Testar camada de sincronização entre embarcações, validando MQTT como canal primário, HTTP como fallback e visibilidade de logs cruzados entre vessels autorizados.

---

## ✅ Checklist de Auditoria

### ◼️ MQTT Integration - Primary Sync Channel

#### MQTTClient Core (`src/core/MQTTClient.ts`)
- ✅ **Classe Base Implementada**:
  - Auto-reconnection
  - Event emitter pattern
  - Subscription management
  - Publish/Subscribe primitives

- ✅ **Configuração**:
  - Broker URL via env var
  - Credenciais seguras
  - QoS levels configuráveis

- ⚠️ **Vessel-Specific Topics**: NÃO VALIDADO
  - Estrutura esperada:
    ```
    fleet/{org_id}/vessels/{vessel_id}/status
    fleet/{org_id}/vessels/{vessel_id}/alerts
    fleet/{org_id}/vessels/{vessel_id}/missions
    fleet/{org_id}/ai/context/{vessel_id}
    fleet/{org_id}/sync/logs
    ```
  - TODO: Verificar se tópicos estão padronizados

#### MQTT Publisher Module
- ✅ **Referência**: `MQTT_PUBLISHER_QUICKREF.md` presente
- ✅ **Funções Disponíveis**:
  - `subscribeForecast()`, `publishForecast()`
  - `publishEvent()`
  - Pattern de cleanup documentado

- ⚠️ **Vessel Events**: NÃO IMPLEMENTADOS
  - TODO: `publishVesselStatus(vesselId, status)`
  - TODO: `publishVesselAlert(vesselId, alert)`
  - TODO: `subscribeToVesselEvents(vesselId, callback)`

---

### ◼️ Event Synchronization - Cross-Vessel Events

#### BridgeLink System (`src/core/BridgeLink.ts`)
- ✅ **Inter-Module Events**:
  - Pub/sub interno para módulos
  - Type-safe event types
  - Módulos podem se comunicar sem acoplamento

- ⚠️ **MQTT Bridge**: NÃO INTEGRADO
  - BridgeLink é local (mesmo vessel)
  - Deveria publicar eventos críticos via MQTT
  - TODO: Integrar BridgeLink → MQTT gateway

#### Event Types for Sync
```typescript
// Eventos que devem sincronizar entre vessels
interface CrossVesselEvent {
  type: 'mission_started' | 'alert_created' | 'status_changed' | 'context_updated';
  source_vessel_id: string;
  timestamp: string;
  payload: any;
  organization_id: string;
}
```

- ❌ **Status**: NÃO IMPLEMENTADO
  - Não há tipo definido para eventos cross-vessel
  - TODO: Criar `CrossVesselEventBus`

---

### ◼️ HTTP Fallback - Reliability Layer

#### Edge Functions para Sync
- ⚠️ **Endpoint**: `/api/sync/vessel-event`
  - TODO: Verificar se existe edge function
  - POST com evento a sincronizar
  - Retry automático se MQTT falhar

- ❌ **Fallback Logic**: NÃO IMPLEMENTADO
```typescript
// Lógica esperada
async function syncEvent(event: CrossVesselEvent) {
  try {
    // Tentar MQTT primeiro
    await mqttClient.publish(topic, event);
  } catch (error) {
    // Fallback para HTTP
    await fetch('/api/sync/vessel-event', {
      method: 'POST',
      body: JSON.stringify(event)
    });
  }
}
```

#### Queue Management
- ❌ **Offline Queue**: NÃO IMPLEMENTADO
  - Eventos devem enfileirar se offline
  - Sincronizar quando conexão retornar
  - TODO: IndexedDB queue + retry logic

---

### ◼️ Log Visibility - Authorized Cross-Vessel Access

#### Access Logs Schema
- ✅ **Tabela `access_logs`**:
  - user_id, module_accessed, action, result
  - severity, details (jsonb)
  - timestamp

- ⚠️ **Vessel Context**: PARCIAL
  - `details` pode conter vessel_id
  - Sem coluna dedicada
  - TODO: Adicionar `vessel_id` column

#### Cross-Vessel Log Access
- ⚠️ **RLS Policy**: NÃO VALIDADA
  - Usuários de uma org podem ver logs de outros vessels?
  - Deveria depender de role (admin/fleet_manager)
  - TODO: Criar policy específica

```sql
-- Policy esperada
CREATE POLICY "Fleet managers view all org vessel logs"
ON access_logs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM organization_users ou
    WHERE ou.user_id = auth.uid()
    AND ou.organization_id = (
      SELECT organization_id FROM vessels v
      WHERE v.id::text = access_logs.details->>'vessel_id'
    )
    AND ou.role IN ('admin', 'fleet_manager')
  )
);
```

#### Audit Logs Cross-Vessel
- ✅ **Tabela `audit_logs`**: Existe
- ⚠️ **Vessel Filtering**: NÃO CONFIRMADO
  - TODO: Verificar se pode filtrar por vessel_id
  - TODO: UI para visualizar logs de múltiplos vessels

---

### ◼️ Data Consistency - Conflict Resolution

#### Sync State Management
- ❌ **Tabela `sync_state`**: NÃO EXISTE
```sql
-- Estrutura esperada
CREATE TABLE sync_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID REFERENCES vessels(id) NOT NULL,
  entity_type TEXT NOT NULL, -- 'mission', 'checklist', 'alert'
  entity_id UUID NOT NULL,
  version INTEGER NOT NULL,
  last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sync_status TEXT DEFAULT 'synced' -- 'synced', 'pending', 'conflict'
);
```

- ❌ **Conflict Resolution**: NÃO IMPLEMENTADO
  - O que acontece se 2 vessels editam mesma missão?
  - TODO: Last-write-wins ou merge strategy?
  - TODO: UI para resolver conflitos manualmente

---

### ◼️ Performance & Reliability

#### Connection Quality Monitoring
- ⚠️ **Quality Metrics**: NÃO VALIDADOS
  - TODO: Track latency MQTT
  - TODO: Packet loss rate
  - TODO: Reconnection count

- ⚠️ **Connection Quality Component**: NÃO ENCONTRADO
  - Control Hub tinha `getConnectionQuality()`
  - Mas está em `archive/deprecated-modules-patch66/`
  - TODO: Reimplementar ou reativar?

#### Message Queue Stats
```typescript
interface SyncMetrics {
  mqtt_messages_sent: number;
  mqtt_messages_received: number;
  http_fallback_count: number;
  queue_size: number;
  avg_latency_ms: number;
  last_sync_timestamp: string;
}
```

- ❌ **Status**: NÃO IMPLEMENTADO

---

## 🧪 Testes Funcionais

### Teste 1: MQTT Event Sync
```typescript
// Vessel A: Criar alerta crítico
await createVesselAlert(vesselA_id, {
  type: 'critical',
  message: 'Engine failure'
});

// Fleet Dashboard: Deve receber via MQTT em <3s
// Vessel B (mesma org): Deve ver no log centralizado
```
- ⚠️ **Status**: NÃO TESTADO

### Teste 2: HTTP Fallback
```typescript
// Desconectar MQTT broker
// Vessel A: Atualizar status
await updateVesselStatus(vesselA_id, 'maintenance');

// Sistema deve usar HTTP automaticamente
// Fleet Dashboard recebe update via polling ou webhook
```
- ❌ **Status**: NÃO IMPLEMENTADO

### Teste 3: Offline Queue
```typescript
// Vessel A: Offline
// Criar 5 eventos localmente
// Reconectar
// Eventos devem sincronizar automaticamente
```
- ❌ **Status**: NÃO IMPLEMENTADO

### Teste 4: Cross-Vessel Log Access
```typescript
// Admin: Buscar logs do Vessel B
// Deve retornar logs mesmo sendo de outro vessel
// Employee: Buscar logs do Vessel B
// Deve retornar apenas se vessel_id do próprio vessel
```
- ⚠️ **Status**: RLS NÃO VALIDADO

---

## 📊 Métricas de Validação

- **MQTT Integration**: ✅ 70% (base funcional, falta vessel topics)
- **Event Sync**: ⚠️ 30% (sem cross-vessel events)
- **HTTP Fallback**: ❌ 0% (não implementado)
- **Log Visibility**: ⚠️ 40% (logs existem, RLS não validado)
- **Conflict Resolution**: ❌ 0% (ausente)
- **Offline Queue**: ❌ 0% (ausente)

---

## ⚠️ Issues Identificados

### CRÍTICO
1. **HTTP Fallback ausente**: Sistema falha se MQTT cair
2. **Offline Queue não implementado**: Dados perdidos se desconectar
3. **Conflict Resolution ausente**: Edições concorrentes podem corromper dados

### ALTO
4. **Cross-Vessel Events não definidos**: Sem estrutura para sync entre vessels
5. **MQTT Topics não padronizados**: Cada módulo pode usar formato diferente
6. **RLS para cross-vessel logs não validado**: Possível vazamento de dados

### MÉDIO
7. **Sync State tracking ausente**: Sem visibilidade de status de sync
8. **Performance metrics faltando**: Não monitora qualidade de conexão
9. **BridgeLink não integrado com MQTT**: Eventos internos não propagam

---

## 🎯 Recomendações

### Imediato (PATCH 169.1)
1. ✅ Padronizar MQTT topics (`fleet/{org}/vessels/{id}/*`)
2. ✅ Criar `CrossVesselEventBus` com tipos
3. ✅ Implementar HTTP fallback com retry
4. ✅ Adicionar `vessel_id` column em `access_logs`

### Curto Prazo (PATCH 170)
5. Implementar Offline Queue (IndexedDB)
6. Criar `sync_state` table + tracking
7. Validar e ajustar RLS para cross-vessel access
8. Connection quality monitoring

### Médio Prazo
9. Conflict resolution UI
10. Sync metrics dashboard
11. MQTT message compression
12. Event replay/audit trail

---

## 🔧 Implementações Prioritárias

### 1. Standardized MQTT Topics
```typescript
// src/core/mqtt-topics.ts
export const MQTT_TOPICS = {
  vesselStatus: (orgId: string, vesselId: string) => 
    `fleet/${orgId}/vessels/${vesselId}/status`,
  
  vesselAlerts: (orgId: string, vesselId: string) => 
    `fleet/${orgId}/vessels/${vesselId}/alerts`,
  
  aiContext: (orgId: string, vesselId: string) => 
    `fleet/${orgId}/ai/context/${vesselId}`,
  
  syncLogs: (orgId: string) => 
    `fleet/${orgId}/sync/logs`,
};
```

### 2. HTTP Fallback Layer
```typescript
// src/lib/sync/fallback-http.ts
export async function syncViaHTTP(event: CrossVesselEvent) {
  const response = await fetch('/api/sync/vessel-event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(event),
  });
  
  if (!response.ok) {
    throw new Error('HTTP sync failed');
  }
  
  return response.json();
}
```

### 3. Offline Queue with IndexedDB
```typescript
// src/lib/sync/offline-queue.ts
class OfflineQueue {
  private db: IDBDatabase;
  
  async enqueue(event: CrossVesselEvent) {
    // Store in IndexedDB
    await this.db.add('pending_events', event);
  }
  
  async flush() {
    const events = await this.db.getAll('pending_events');
    for (const event of events) {
      try {
        await syncEvent(event); // Try MQTT then HTTP
        await this.db.delete('pending_events', event.id);
      } catch (error) {
        // Keep in queue for next retry
      }
    }
  }
}
```

### 4. Cross-Vessel RLS Policy
```sql
-- Migration: Add vessel_id to access_logs
ALTER TABLE access_logs 
ADD COLUMN vessel_id UUID REFERENCES vessels(id);

-- Policy: Fleet managers see all org logs
CREATE POLICY "Fleet managers view all org vessel logs"
ON access_logs FOR SELECT
USING (
  auth.uid() IN (
    SELECT user_id FROM organization_users
    WHERE organization_id = (
      SELECT organization_id FROM vessels WHERE id = access_logs.vessel_id
    )
    AND role IN ('admin', 'fleet_manager')
  )
  OR
  -- Regular users see only their vessel logs
  (auth.uid() IN (
    SELECT user_id FROM organization_users
    WHERE organization_id = (
      SELECT organization_id FROM vessels WHERE id = access_logs.vessel_id
    )
  ) AND vessel_id = (SELECT current_vessel_id FROM user_context WHERE user_id = auth.uid()))
);
```

---

## ✅ Conclusão

**Status Geral**: ⚠️ INFRAESTRUTURA PARCIAL

- ✅ MQTT Core: FUNCIONAL
- ⚠️ Vessel Topics: NÃO PADRONIZADOS
- ❌ HTTP Fallback: AUSENTE
- ❌ Offline Queue: NÃO IMPLEMENTADO
- ⚠️ Cross-Vessel Logs: RLS NÃO VALIDADO
- ❌ Conflict Resolution: AUSENTE

**Bloqueadores para PROD**:
1. Implementar HTTP fallback obrigatório
2. Criar Offline Queue resiliente
3. Padronizar MQTT topics
4. Validar RLS para cross-vessel access

**Dependências**:
- PATCH 166: Vessel Context (prerequisito)
- PATCH 168: Command Center (usa sync)
- PATCH 170: Multi-Mission (depende de sync)

---

**Auditado em**: 2025-10-25  
**Versão**: PATCH 169.0  
**Próximo Patch**: PATCH 170.0 - Multi-Mission Coordination
