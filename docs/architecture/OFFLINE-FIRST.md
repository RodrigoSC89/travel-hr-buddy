# Offline-First Architecture - Nautilus One

## Visão Geral

O Nautilus One implementa uma arquitetura **offline-first** robusta, projetada para ambientes marítimos onde a conectividade é intermitente ou inexistente. O sistema funciona 100% offline e sincroniza automaticamente quando a conexão é restaurada.

## Arquitetura

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CAMADA DE APLICAÇÃO                         │
├──────────────────┬──────────────────────────────────────────────────┤
│                  │                                                  │
│  useOfflineMutation  ←→  useOfflineData  ←→  useNetwork            │
│                  │                                                  │
├──────────────────┴──────────────────────────────────────────────────┤
│                         CAMADA DE SERVIÇO                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────┐ │
│  │ IndexedDB Sync  │  │ Offline Cache   │  │ Connection          │ │
│  │ Queue           │  │ Service         │  │ Resilience          │ │
│  └────────┬────────┘  └────────┬────────┘  └──────────┬──────────┘ │
│           │                    │                      │            │
├───────────┴────────────────────┴──────────────────────┴────────────┤
│                         CAMADA DE STORAGE                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │                        IndexedDB                              │ │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐ │ │
│  │  │ sync_queue │ │ data_cache │ │  vessels   │ │    crew    │ │ │
│  │  └────────────┘ └────────────┘ └────────────┘ └────────────┘ │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Componentes Principais

### 1. IndexedDB Sync Queue (`src/lib/offline/indexeddb-sync.ts`)

Gerencia operações pendentes com suporte a:
- **Priorização**: critical, high, normal, low
- **Compressão de payload**: Automática para payloads > 1KB
- **Retry com backoff**: Exponencial até 3 tentativas
- **Chunks**: Suporte para uploads grandes

```typescript
import { indexedDBSync } from '@/lib/offline/indexeddb-sync';

// Enfileirar operação
await indexedDBSync.queueOperation('insert', 'vessels', data, 'high');

// Obter operações pendentes
const pending = await indexedDBSync.getPendingOperations(50);

// Estatísticas da fila
const stats = await indexedDBSync.getQueueStats();
```

### 2. Offline Cache Service (`src/services/unified/offline-cache.service.ts`)

Cache estruturado para entidades do sistema:

```typescript
import { indexedDBCache } from '@/services/unified/offline-cache.service';

// Cache de embarcações
await indexedDBCache.cacheVessels(vessels);
const vessels = await indexedDBCache.getVessels();

// Cache genérico com TTL
await indexedDBCache.set('myKey', data, 3600000); // 1 hora
const cached = await indexedDBCache.get<MyType>('myKey');
```

### 3. Connection Resilience (`src/lib/offline/connection-resilience.ts`)

Gerencia conectividade com estratégias adaptativas:

```typescript
import { connectionResilience } from '@/lib/offline/connection-resilience';

// Fetch com retry automático
const response = await connectionResilience.fetchWithRetry('/api/data', {
  maxRetries: 3,
  baseDelayMs: 1000,
});

// Estado da conexão
const state = connectionResilience.getState();
// { isOnline, effectiveType, downlink, rtt, saveData }
```

### 4. Network Hook (`src/hooks/unified/useNetwork.ts`)

Hook React para estado de rede e configurações adaptativas:

```typescript
import { useNetwork } from '@/hooks/unified/useNetwork';

function MyComponent() {
  const { 
    online,              // boolean
    quality,             // 'fast' | 'medium' | 'slow' | 'offline'
    pendingChanges,      // number
    adaptiveSettings,    // { imageQuality, pageSize, enableAnimations, ... }
    isSlow,
    isFast,
  } = useNetwork();
  
  return online ? <OnlineUI /> : <OfflineUI />;
}
```

### 5. Offline Mutation Hook (`src/hooks/unified/useOffline.ts`)

Mutations que funcionam offline:

```typescript
import { useOfflineMutation } from '@/hooks/unified/useOffline';

function SaveButton() {
  const mutation = useOfflineMutation({
    mutationFn: async (data) => {
      return await api.save(data);
    },
    actionType: 'save_vessel',
    successMessage: 'Salvo com sucesso!',
    offlineMessage: 'Será sincronizado quando reconectar.',
  });
  
  return (
    <button onClick={() => mutation.mutate(formData)}>
      Salvar
    </button>
  );
}
```

## Fluxo de Sincronização

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   ONLINE    │────▶│   OFFLINE   │────▶│   ONLINE    │
└─────────────┘     └─────────────┘     └─────────────┘
      │                    │                    │
      ▼                    ▼                    ▼
 ┌─────────────┐    ┌─────────────┐     ┌─────────────┐
 │  Sync com   │    │  Salvar no  │     │  Processar  │
 │  Supabase   │    │  IndexedDB  │     │    Fila     │
 └─────────────┘    └─────────────┘     └─────────────┘
                           │                    │
                           ▼                    ▼
                    ┌─────────────┐     ┌─────────────┐
                    │  Enfileirar │     │ Conflict    │
                    │  para Sync  │     │ Resolution  │
                    └─────────────┘     └─────────────┘
```

### Estratégias de Conflito

O sistema suporta múltiplas estratégias de resolução de conflitos:

| Estratégia | Descrição |
|------------|-----------|
| `client_wins` | Dados do cliente têm prioridade |
| `server_wins` | Dados do servidor têm prioridade |
| `last_write_wins` | Timestamp mais recente vence |
| `merge` | Mescla campos de ambos |
| `manual` | Requer intervenção do usuário |

```typescript
import { resolveConflict } from '@/lib/offline/conflict-resolution';

const result = await resolveConflict(
  localData,
  serverData,
  'last_write_wins'
);
```

## Componentes de UI

### OfflineIndicator

Indicador visual do status de conexão e sincronização:

```tsx
import { OfflineIndicator } from '@/components/offline';

function App() {
  return (
    <>
      <MainContent />
      <OfflineIndicator /> {/* Posição fixa no canto inferior */}
    </>
  );
}
```

### HealthCheckInOffline (Exemplo)

Formulário que funciona 100% offline:

```tsx
import { HealthCheckInOffline } from '@/components/offline';

function CrewWellnessPage() {
  return <HealthCheckInOffline />;
}
```

## Configurações Adaptativas

O sistema ajusta automaticamente baseado na qualidade da conexão:

| Qualidade | Image Quality | Page Size | Animations | Prefetch | Realtime |
|-----------|--------------|-----------|------------|----------|----------|
| Fast      | 90%          | 50        | ✅          | ✅        | ✅        |
| Medium    | 75%          | 25        | ✅          | ❌        | ✅        |
| Slow      | 50%          | 10        | ❌          | ❌        | ❌        |
| Offline   | cached       | cached    | ❌          | ❌        | ❌        |

## Inicialização

O sistema inicializa automaticamente no carregamento do módulo:

```typescript
// src/lib/db/indexed-db.ts
if (typeof window !== 'undefined') {
  offlineDB.init().catch(console.error);
}
```

Para inicialização explícita no App:

```tsx
import { useEffect } from 'react';
import { offlineDB } from '@/lib/db/indexed-db';

function App() {
  useEffect(() => {
    offlineDB.init().then(() => {
      console.log('✅ Offline DB initialized');
    });
  }, []);
  
  return <AppContent />;
}
```

## Stores do IndexedDB

| Store | Propósito | TTL |
|-------|-----------|-----|
| `sync_queue` | Operações pendentes de sync | Permanente até sync |
| `data_cache` | Cache genérico com TTL | Configurável |
| `priority_queue` | Fila priorizada | Permanente |
| `vessels` | Cache de embarcações | 24h |
| `crew` | Cache de tripulação | 24h |
| `routes` | Cache de rotas | 24h |
| `pending_actions` | Ações legacy | Permanente |

## Monitoramento

### Métricas Disponíveis

```typescript
const stats = await indexedDBSync.getQueueStats();
// {
//   total: number,
//   pending: number,
//   syncing: number,
//   completed: number,
//   failed: number,
//   byCritical: number,
//   byHigh: number,
//   byNormal: number,
//   byLow: number,
// }

const storage = await indexedDBSync.getStorageUsage();
// { syncQueue, cache, total }
```

### Eventos

```typescript
// Quando sync completa
window.addEventListener('sync-complete', (e) => {
  console.log('Sync completed:', e.detail);
});

// Quando volta online
window.addEventListener('online', () => {
  // Auto-sync será acionado
});
```

## Boas Práticas

1. **Sempre use hooks offline-aware** para mutations
2. **Cache dados críticos** no primeiro acesso
3. **Priorize operações críticas** (auditorias, safety reports)
4. **Implemente feedback visual** do status offline
5. **Teste com DevTools** em modo offline
6. **Limpe cache expirado** periodicamente

## Testes

```bash
# Simular offline no browser
DevTools > Network > Offline

# Verificar IndexedDB
DevTools > Application > IndexedDB > nautilus_offline_db
```

## Performance

- Compressão automática para payloads > 1KB
- Chunks para uploads > 5MB
- Limpeza automática de cache expirado
- Batching de operações quando possível

## Referências

- [`src/lib/offline/`](../src/lib/offline/) - Módulos core
- [`src/hooks/unified/`](../src/hooks/unified/) - Hooks React
- [`src/components/offline/`](../src/components/offline/) - Componentes UI
- [`src/services/unified/offline-cache.service.ts`](../src/services/unified/offline-cache.service.ts) - Cache service
