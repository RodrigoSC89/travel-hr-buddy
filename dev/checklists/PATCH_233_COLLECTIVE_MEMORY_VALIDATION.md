# PATCH 233 – Collective Memory Hub Validation

## 📘 Objetivo
Validar sincronização de conhecimento entre instâncias, versionamento e capacidade de rollback.

## ✅ Checklist de Validação

### 1. Sync Entre Instâncias Funcionando
- [ ] Hub inicializado com instance_id único
- [ ] Sync automático ativo (intervalo 30s)
- [ ] Entries de outras instâncias carregadas
- [ ] Versão mais recente sempre prevalece
- [ ] Conflitos de versão resolvidos corretamente
- [ ] Sync status atualizado em tempo real
- [ ] Entries_synced count preciso

### 2. Rollbacks Possíveis via Versão
- [ ] Histórico de versões disponível
- [ ] Rollback para versão específica funciona
- [ ] Rollback cria nova versão (não sobrescreve)
- [ ] Source marcado como "rollback-to-vX"
- [ ] Tag "rollback" adicionada automaticamente
- [ ] Success/failure reportado corretamente
- [ ] Entries affected count preciso

### 3. Base collective_knowledge Populada
- [ ] Entries armazenadas no Supabase
- [ ] Estrutura de dados correta (id, key, value, version)
- [ ] Instance_id registrado em cada entry
- [ ] Timestamps (created_at, updated_at) precisos
- [ ] Tags e metadata armazenados
- [ ] Confidence score presente
- [ ] Queries retornam dados corretamente

## 📊 Critérios de Sucesso
- ✅ Sync entre instâncias em < 30 segundos
- ✅ 100% das entries versionadas corretamente
- ✅ Rollback funciona em 100% dos casos
- ✅ Zero conflitos de versão não resolvidos
- ✅ Histórico completo disponível para cada key

## 🔍 Testes Recomendados

### Teste 1: Inicialização e Carregamento
```typescript
await collectiveMemoryHub.initialize();
// Verificar: instanceId gerado
// Verificar: knowledge carregado do DB
// Verificar: sync iniciado automaticamente
```

### Teste 2: Store e Retrieve
```typescript
const entry = await collectiveMemoryHub.store(
  "vessel_route_optimization",
  { algorithm: "dijkstra", efficiency: 0.92 },
  "route_planner",
  ["optimization", "navigation"]
);

const retrieved = await collectiveMemoryHub.retrieve("vessel_route_optimization");
// Verificar: retrieved matches stored entry
// Verificar: version = 1 (primeira versão)
```

### Teste 3: Versionamento
```typescript
// Store primeira versão
await collectiveMemoryHub.store("config_param", 100);
// Store segunda versão
await collectiveMemoryHub.store("config_param", 150);

const current = await collectiveMemoryHub.retrieve("config_param");
// Verificar: current.version = 2
// Verificar: current.value = 150
```

### Teste 4: Rollback
```typescript
const result = await collectiveMemoryHub.rollback("config_param", 1);
// Verificar: result.success = true
// Verificar: result.rolled_back_to_version = 1
// Verificar: nova versão criada (v3) com value da v1
```

### Teste 5: Histórico
```typescript
const history = await collectiveMemoryHub.getHistory("config_param", 10);
// Verificar: history contém todas as versões
// Verificar: ordenado por version DESC
// Verificar: cada entry tem source e timestamp
```

### Teste 6: Sync Multi-Instâncias
```typescript
// Simular outra instância (em outro navegador/aba)
// Instance 1: store entry
await collectiveMemoryHub.store("shared_data", { test: true });

// Instance 2: aguardar sync (30s)
await new Promise(r => setTimeout(r, 31000));
const synced = await collectiveMemoryHub.retrieve("shared_data");
// Verificar: synced não é null
// Verificar: synced.value = { test: true }
```

## 🎯 Cenários de Validação

### Cenário 1: Conflito de Versão
- [ ] Instance 1 store "key" → v1
- [ ] Instance 2 store "key" → v1 (conflito)
- [ ] Sync resolve: versão mais recente prevalece
- [ ] Ambas instâncias convergem para mesma versão

### Cenário 2: Rollback Durante Sync
- [ ] Store múltiplas versões (v1, v2, v3)
- [ ] Rollback para v1
- [ ] Nova v4 criada com conteúdo de v1
- [ ] Sync propaga v4 para outras instâncias

### Cenário 3: Alta Frequência de Updates
- [ ] 10+ stores para mesma key em < 1 minuto
- [ ] Versionamento sequencial correto
- [ ] Sync mantém consistência
- [ ] Sem race conditions

## 🧪 Validação de Estrutura de Dados

### KnowledgeEntry
```typescript
{
  id: string,
  key: string,
  value: any,
  version: number,
  source: string,
  confidence: number,
  tags: string[],
  created_at: string,
  updated_at: string
}
```

### SyncStatus
```typescript
{
  instance_id: string,
  last_sync: string,
  entries_synced: number,
  status: 'synced' | 'syncing' | 'error'
}
```

### RollbackResult
```typescript
{
  success: boolean,
  rolled_back_to_version: number,
  entries_affected: number,
  timestamp: string
}
```

## 🔄 Validação de Sync

### Sync Automático
- [ ] Interval de 30 segundos respeitado
- [ ] Apenas entries de outros instances sincronizadas
- [ ] Entries atualizadas se versão > local
- [ ] Sync não sobrescreve entries locais mais recentes
- [ ] Log de entries_synced preciso

### Sync Manual
- [ ] Método syncWithInstances() disponível
- [ ] Retorna SyncStatus completo
- [ ] Funciona mesmo fora do interval automático

## 📝 Validação de DB Schema

### Tabela collective_knowledge
- [ ] Colunas: id, key, value, version, source, confidence, tags, instance_id
- [ ] Timestamps: created_at, updated_at
- [ ] Indexes otimizados para queries
- [ ] RLS policies configuradas
- [ ] Constraints de integridade

## 🚨 Testes de Edge Cases

### Casos Extremos
- [ ] Store com value = null
- [ ] Store com value muito grande (1MB+)
- [ ] Rollback para versão inexistente
- [ ] Retrieve de key que nunca existiu
- [ ] Shutdown durante sync ativo
- [ ] 100+ entries simultâneas

## 📋 Observações
- Data da validação: _____________
- Validador: _____________
- Instâncias testadas: _____________
- Total de entries criadas: _____________
- Rollbacks executados: _____________
- Sync interval: _____________
- Ambiente: [ ] Dev [ ] Staging [ ] Production
- Status: [ ] Aprovado [ ] Reprovado [ ] Em Revisão

## 🚨 Problemas Conhecidos
_____________________________________________
_____________________________________________
_____________________________________________
