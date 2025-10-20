# 🔱 Nautilus Control Hub - Quick Reference

Referência rápida para uso do Control Hub.

---

## 🚀 Acesso Rápido

```
URL: /control-hub
```

---

## 📡 API Endpoints

### GET /api/control-hub/status
Retorna status completo do sistema.

```typescript
const response = await fetch('/api/control-hub/status');
const { data } = await response.json();
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "modules": { /* status dos módulos */ },
    "bridge": { /* status do BridgeLink */ },
    "cache": { 
      "pending": 0,
      "sizeMB": 2.5,
      "isFull": false
    },
    "sync": {
      "lastSync": "2025-10-20T14:49:16.681Z",
      "inProgress": false
    }
  }
}
```

### POST /api/control-hub/sync
Dispara sincronização manual.

```typescript
const response = await fetch('/api/control-hub/sync', { method: 'POST' });
const { data } = await response.json();
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "recordsSent": 5,
    "errors": [],
    "timestamp": "2025-10-20T14:49:16.681Z"
  }
}
```

### GET /api/control-hub/health
Verifica saúde do sistema.

```typescript
const response = await fetch('/api/control-hub/health');
const { health } = await response.json();
```

**Resposta:**
```json
{
  "success": true,
  "health": {
    "status": "healthy",
    "details": {
      "modules": "healthy",
      "bridge": "connected",
      "cache": "ok"
    }
  }
}
```

---

## 💻 Uso Programático

### Inicializar

```typescript
import { controlHub } from '@/modules/control_hub';

await controlHub.iniciar();
```

### Obter Estado

```typescript
const state = controlHub.getState();
console.log(state.initialized);       // boolean
console.log(state.moduleStatus);      // SystemStatus
console.log(state.bridgeLinkStatus);  // BridgeLinkStatus
console.log(state.pendingRecords);    // number
```

### Sincronizar

```typescript
const result = await controlHub.sincronizar();
console.log(result.success);      // boolean
console.log(result.recordsSent);  // number
console.log(result.errors);       // string[]
```

### Cache Offline

```typescript
// Armazenar dados
await controlHub.storeOffline(myData, 'mmi');

// Obter tamanho
import hubCache from '@/modules/control_hub/hub_cache';
const sizeMB = hubCache.getCacheSizeMB();

// Limpar cache sincronizado
hubCache.clearSynced();
```

### Monitoramento

```typescript
import hubMonitor from '@/modules/control_hub/hub_monitor';

// Obter status
const status = await hubMonitor.getStatus();

// Verificar alertas
const alerts = hubMonitor.getAlerts();

// Verificar se precisa atenção
const needsAttention = hubMonitor.needsAttention();
```

### BridgeLink

```typescript
import hubBridge from '@/modules/control_hub/hub_bridge';

// Verificar conexão
const connected = await hubBridge.checkConnection();

// Autenticar
const authenticated = await hubBridge.authenticate(token);

// Enviar dados
const sent = await hubBridge.sendData(data, '/endpoint');

// Obter status
const status = hubBridge.getStatus();
```

---

## 🎨 Componentes UI

### Dashboard Completo

```tsx
import { HubDashboard } from '@/modules/control_hub/hub_ui';

<HubDashboard
  moduleStatus={moduleStatus}
  bridgeStatus={bridgeStatus}
  cacheInfo={cacheInfo}
  syncInfo={syncInfo}
  onRefresh={handleRefresh}
  onSync={handleSync}
/>
```

### Cards Individuais

```tsx
import { 
  BridgeLinkCard, 
  CacheCard, 
  SyncCard, 
  ModuleCard 
} from '@/modules/control_hub/hub_ui';
```

---

## ⚙️ Configuração

Arquivo: `src/modules/control_hub/hub_config.json`

**Principais Configurações:**

| Configuração | Valor Padrão | Descrição |
|--------------|--------------|-----------|
| `sync.interval_seconds` | 300 | Intervalo de sync automático |
| `sync.retry_attempts` | 3 | Tentativas de retry |
| `sync.cache_max_size_mb` | 100 | Tamanho máximo do cache |
| `monitoring.health_check_interval_seconds` | 60 | Intervalo de health check |
| `features.offline_cache` | true | Habilitar cache offline |
| `features.real_time_sync` | true | Habilitar sync em tempo real |

---

## 🧪 Testes

```bash
# Executar todos os testes
npm test -- control-hub.test.ts

# Executar com cobertura
npm run test:coverage -- control-hub.test.ts
```

**Resultado Esperado:** 72 testes passando ✅

---

## 🐛 Troubleshooting Rápido

### Cache Cheio
```typescript
import hubCache from '@/modules/control_hub/hub_cache';
hubCache.clearSynced();
```

### BridgeLink Offline
O sistema entra automaticamente em modo offline. Dados são armazenados no cache.

### Forçar Sincronização
```typescript
import hubSync from '@/modules/control_hub/hub_sync';
await hubSync.forceSyncNow();
```

### Verificar Logs
```typescript
import { logger } from '@/lib/logger';
logger.info('Mensagem de log');
logger.error('Erro', error);
```

---

## 📊 Status dos Módulos

| Status | Descrição | Emoji |
|--------|-----------|-------|
| `OK` | Operando normalmente | ✅ |
| `Warning` | Necessita atenção | ⚠️ |
| `Error` | Erro crítico | 🔴 |
| `Offline` | Desconectado | ⚫ |

---

## 🔄 Ciclo de Vida

```typescript
// 1. Inicializar
await controlHub.iniciar();

// 2. Usar normalmente
const state = controlHub.getState();
await controlHub.sincronizar();

// 3. Encerrar (se necessário)
controlHub.shutdown();
```

---

## 📦 Imports Principais

```typescript
// Core
import { controlHub } from '@/modules/control_hub';

// Componentes específicos
import { 
  hubMonitor, 
  hubSync, 
  hubCache, 
  hubBridge 
} from '@/modules/control_hub';

// UI
import { HubDashboard, HubUI } from '@/modules/control_hub';

// Tipos
import type { 
  ControlHubState,
  SystemStatus,
  ModuleStatus,
  SyncResult,
  CacheEntry,
  BridgeLinkStatus 
} from '@/modules/control_hub';
```

---

## 🎯 Casos de Uso Comuns

### 1. Verificar Status do Sistema
```typescript
const health = await controlHub.getHealth();
if (health.status === 'critical') {
  // Tomar ação
}
```

### 2. Sincronizar Dados Manualmente
```typescript
const result = await controlHub.sincronizar();
if (result.success) {
  console.log(`${result.recordsSent} registros enviados`);
}
```

### 3. Armazenar Dados Offline
```typescript
try {
  await controlHub.storeOffline(data, 'mmi');
  console.log('Dados armazenados para sincronização posterior');
} catch (error) {
  console.error('Cache cheio ou erro ao armazenar');
}
```

### 4. Monitorar Módulos
```typescript
const status = await hubMonitor.getStatus();
console.log('Status geral:', status.overall);
console.log('MMI:', status.mmi.status);
console.log('BridgeLink:', status.bridge_link.status);
```

### 5. Verificar Conectividade
```typescript
const connected = await hubBridge.checkConnection();
if (!connected) {
  console.log('Operando em modo offline');
}
```

---

## 🔗 Links Úteis

- [README Completo](./CONTROL_HUB_README.md)
- [Testes](./src/tests/control-hub.test.ts)
- [Dashboard](./src/pages/ControlHub.tsx)
- [API Status](./pages/api/control-hub/status.ts)
- [API Sync](./pages/api/control-hub/sync.ts)
- [API Health](./pages/api/control-hub/health.ts)

---

**Nautilus Control Hub v1.0.0** 🔱
