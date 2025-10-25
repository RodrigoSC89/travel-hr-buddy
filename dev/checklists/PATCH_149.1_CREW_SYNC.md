# ✅ PATCH 149.1 — Crew App Offline Sync

**Status:** 🟡 Em Validação  
**Data:** 2025-10-25  
**Responsável:** Sistema de Validação Backend/Sync  
**Prioridade:** 🔴 Crítico (Operações Tripulação)

---

## 📋 Resumo do PATCH

Validação completa do sistema de sincronização offline do aplicativo de tripulação, garantindo integridade de dados e operação confiável em ambientes sem conectividade.

---

## 🎯 Objetivos de Validação

- [x] Dados offline salvos em IndexedDB
- [x] Sincronização bidirecional com Supabase
- [x] Conflict resolution automático
- [x] Queue de operações pendentes
- [x] Indicadores de status de sync

---

## 🔍 Checklist de Validação

### ◼️ Armazenamento Local

- [ ] **IndexedDB Schema**
  - [ ] Tabelas espelhadas do Supabase
  - [ ] Índices otimizados para queries offline
  - [ ] Versionamento de schema (migrations)
  - [ ] Quota storage > 50MB

- [ ] **Operações CRUD Offline**
  - [ ] CREATE: Registros salvos com UUID temporário
  - [ ] READ: Queries funcionam 100% offline
  - [ ] UPDATE: Mudanças rastreadas com timestamp
  - [ ] DELETE: Soft delete com flag de sincronização

- [ ] **Integridade de Dados**
  - [ ] Foreign keys validadas localmente
  - [ ] Constraints verificadas antes de salvar
  - [ ] Validação de tipos (TypeScript + runtime)
  - [ ] Backup automático a cada 1h

### ◼️ Sincronização com Supabase

- [ ] **Detecção de Mudanças**
  - [ ] Polling a cada 30s quando online
  - [ ] Webhooks de Supabase Realtime
  - [ ] Dirty flag em registros modificados
  - [ ] Last sync timestamp por tabela

- [ ] **Upload de Dados Locais**
  - [ ] Queue de operações ordenada por timestamp
  - [ ] Retry automático com backoff exponencial
  - [ ] Batch insert para eficiência (max 50 registros)
  - [ ] Validação server-side antes de commit

- [ ] **Download de Dados Remotos**
  - [ ] Incremental sync (apenas mudanças)
  - [ ] Delta queries com timestamp > lastSync
  - [ ] Pagination para datasets grandes
  - [ ] Compressão de payloads (gzip)

### ◼️ Conflict Resolution

- [ ] **Estratégias de Merge**
  - [ ] Last Write Wins (LWW) - padrão
  - [ ] Server Wins - dados críticos
  - [ ] Client Wins - preferências locais
  - [ ] Manual Resolution - conflitos complexos

- [ ] **Detecção de Conflitos**
  - [ ] Comparação de timestamps
  - [ ] Version vectors (opcional)
  - [ ] Hash de conteúdo para detectar mudanças
  - [ ] Log de conflitos para auditoria

- [ ] **UI de Resolução**
  - [ ] Modal mostrando diff das mudanças
  - [ ] Opção de escolher versão local/remota
  - [ ] Merge manual campo a campo
  - [ ] Histórico de resoluções

### ◼️ Queue de Operações

- [ ] **Gestão de Fila**
  - [ ] FIFO com priorização (CRITICAL > HIGH > NORMAL)
  - [ ] Remoção de duplicatas (idempotência)
  - [ ] Tamanho máximo: 500 operações
  - [ ] Persistência da fila em IndexedDB

- [ ] **Processamento**
  - [ ] Processar 10 operações por batch
  - [ ] Retry até 5x por operação
  - [ ] Dead letter queue para falhas persistentes
  - [ ] Notificação ao usuário de falhas críticas

---

## 🧪 Cenários de Teste

### Teste 1: CRUD Completo Offline
```
1. Desativar conexão de rede
2. Criar novo registro de tripulante
3. Editar registro existente
4. Deletar outro registro
5. Realizar queries de busca
6. Verificar dados em IndexedDB
```

**Resultado Esperado:**
- Todas operações funcionam offline
- Dados salvos localmente com sucesso
- Queries retornam resultados corretos
- UI atualizada imediatamente

### Teste 2: Sincronização Básica
```
1. Criar 5 registros offline
2. Reativar conexão
3. Aguardar sincronização automática
4. Verificar registros no Supabase
5. Validar IDs finais (UUID temporário → real)
```

**Resultado Esperado:**
- Sincronização automática em < 10s
- 100% dos registros enviados com sucesso
- IDs atualizados no local storage
- Notificação "Sincronização completa"

### Teste 3: Conflict Resolution
```
1. Dispositivo A: Editar registro X offline
2. Dispositivo B: Editar mesmo registro X online
3. Dispositivo A: Reconectar
4. Sistema detecta conflito
5. Usuário resolve conflito via UI
```

**Resultado Esperado:**
- Conflito detectado automaticamente
- Modal de resolução exibido
- Diff claro entre versões
- Merge aplicado corretamente
- Log de conflito registrado

### Teste 4: Stress Test de Fila
```
1. Desativar rede
2. Criar 100 novos registros
3. Editar 50 registros existentes
4. Deletar 20 registros
5. Reconectar
6. Monitorar processamento da fila
```

**Resultado Esperado:**
- Fila armazena todas 170 operações
- Processamento em batches de 10
- Taxa de sucesso > 99%
- Tempo total < 60s

### Teste 5: Sincronização Bidirecional
```
1. Dispositivo offline com dados locais
2. Outro usuário cria/edita dados no Supabase
3. Dispositivo reconecta
4. Verificar merge de dados locais + remotos
5. Confirmar sem perda de dados
```

**Resultado Esperado:**
- Upload de dados locais completo
- Download de dados remotos completo
- Merge sem conflitos (se não overlaping)
- Dados finais consistentes

---

## 🔧 Arquivos Relacionados

```
src/lib/sync/
├── offlineDatabase.ts           # IndexedDB wrapper
├── syncManager.ts               # Orquestrador de sincronização
├── conflictResolver.ts          # Lógica de conflict resolution
└── operationQueue.ts            # Gestão de fila de operações

src/hooks/
├── useOfflineSync.ts            # Hook principal de sync
├── useSyncStatus.ts             # Status de sincronização
└── useConflictResolution.ts     # UI de resolução de conflitos

src/components/crew/
├── SyncStatusIndicator.tsx      # Badge de status de sync
├── ConflictResolutionModal.tsx  # Modal de resolução
└── SyncProgressBar.tsx          # Barra de progresso

src/services/
└── supabaseSyncAdapter.ts       # Adapter para Supabase Realtime
```

---

## 📊 Métricas de Sucesso

| Métrica | Meta | Atual | Status |
|---------|------|-------|--------|
| Tempo de Sync (10 registros) | < 3s | - | 🟡 |
| Taxa de Sucesso de Sync | > 99.5% | - | 🟡 |
| Conflitos Auto-Resolvidos | > 90% | - | 🟡 |
| Capacidade da Fila | > 500 ops | - | 🟡 |
| Uso de Storage Local | < 50MB | - | 🟡 |
| Latência de Detecção Online | < 2s | - | 🟡 |

---

## 🐛 Problemas Conhecidos

- [ ] **P1:** Sincronização pode falhar silenciosamente se quota do IndexedDB estiver cheia
- [ ] **P2:** Conflict resolution manual é difícil para usuários não técnicos
- [ ] **P3:** Fila não persiste se browser crashar durante sync
- [ ] **P4:** Realtime webhooks podem ter atraso de até 5s

---

## ✅ Critérios de Aprovação

- [x] Código implementado sem erros TypeScript
- [ ] CRUD offline 100% funcional
- [ ] Sincronização bidirecional operacional
- [ ] Conflict resolution automático + manual
- [ ] Queue de operações persistente
- [ ] Taxa de sucesso de sync > 99.5%
- [ ] Testes de stress aprovados
- [ ] Documentação técnica completa

---

## 📝 Notas Técnicas

### IndexedDB Schema
```typescript
interface CrewMemberLocal {
  id: string;              // UUID temporário se offline, real após sync
  name: string;
  role: string;
  vessel_id: string;
  created_at: number;
  updated_at: number;
  synced_at?: number;      // null se pendente de sync
  dirty: boolean;          // true se modificado localmente
  deleted: boolean;        // soft delete flag
  version: number;         // para conflict detection
}

interface SyncOperation {
  id: string;
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  data: any;
  timestamp: number;
  retryCount: number;
  priority: 'CRITICAL' | 'HIGH' | 'NORMAL';
  status: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED';
}
```

### Conflict Resolution Strategy
```typescript
const CONFLICT_STRATEGIES = {
  'crew_members': 'SERVER_WINS',        // Dados de tripulação sempre do servidor
  'user_preferences': 'CLIENT_WINS',    // Preferências sempre locais
  'work_logs': 'LAST_WRITE_WINS',       // Logs usa timestamp
  'critical_alerts': 'MANUAL'           // Alertas precisam revisão humana
};
```

---

## 🚀 Próximos Passos

1. **Testes em Campo:** Validar em embarcações com conectividade intermitente
2. **Otimização:** Implementar delta sync para reduzir payload
3. **Conflict UI:** Melhorar UX de resolução para usuários não técnicos
4. **Monitoring:** Dashboard de health de sincronização
5. **Backup:** Sistema de backup automático com restauração

---

## 📖 Referências

- [IndexedDB Best Practices](https://web.dev/indexeddb-best-practices/)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)
- [Offline-First Sync Patterns](https://offlinefirst.org/)
- [CRDTs for Conflict Resolution](https://crdt.tech/)

---

**Última Atualização:** 2025-10-25  
**Próxima Revisão:** Após testes em campo com 100+ usuários offline
