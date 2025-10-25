# PATCH 167.0 - Distributed AI Validation
## Status: 🔄 IN REVIEW

---

## 📋 Objetivo
Auditar funcionamento de IA local e sincronização global entre embarcações, garantindo inferência offline, compartilhamento de contexto e fallback remoto.

---

## ✅ Checklist de Auditoria

### ◼️ AI Engine Core - Local Inference

- ✅ **Engine (`src/ai/engine.ts`)**:
  - `runOpenAI()`: Integração com API remota
  - `generateSystemPrompt()`: Geração de prompts contextuais
  - `storeInteraction()`: Log de interações
  - Fallback quando API key ausente

- ✅ **Nautilus Inference (`src/ai/nautilus-inference.ts`)**:
  - ONNX Runtime integration
  - Local model loading
  - Offline inference capability
  - TODO: Verificar se modelos estão embarcados

- ⚠️ **Local Model Files**: NÃO VALIDADO
  - TODO: Verificar presença de `/public/models/*.onnx`
  - TODO: Validar tamanho e compressão
  - TODO: Fallback para CDN se local falhar

---

### ◼️ Context Management - Per-Vessel Contexts

#### Module Context (`src/ai/contexts/moduleContext.ts`)
- ✅ **Funções implementadas**:
  - `getModuleContext()`: Contexto por módulo + userId
  - `updateModuleContext()`: Merge de estados
  - `addContextHistory()`: Histórico de interações
  - `cleanupOldContexts()`: Limpeza automática (30min)

- ⚠️ **Vessel-Specific Context**: NÃO IMPLEMENTADO
  - Contexto atual: `moduleId + userId`
  - Deveria ser: `moduleId + userId + vesselId`
  - TODO: Adicionar `vesselId` como chave de contexto

- ⚠️ **Cross-Vessel Context Sharing**: AUSENTE
  - Não há mecanismo para compartilhar contexto entre vessels
  - TODO: Implementar `sharedContext` flag
  - TODO: Sync via MQTT quando autorizado

---

### ◼️ AI Services - Vessel-Aware Analysis

#### Incident Analyzer (`src/ai/services/incidentAnalyzer.ts`)
- ✅ **Funções**:
  - `analyzeIncident()`: Análise via OpenAI
  - `storeIncidentAnalysis()`: Armazenamento local
  - `getIncidentAnalysis()`: Recuperação

- ⚠️ **Vessel Context**: NÃO UTILIZADO
  - Análises não filtram por vessel_id
  - TODO: Adicionar vessel_id nos parâmetros
  - TODO: Histórico de incidentes por vessel

#### Checklist AutoFill (`src/ai/services/checklistAutoFill.ts`)
- ✅ **Funções**:
  - `autoFillChecklist()`: Preenchimento via IA
  - `saveChecklistCompletion()`: Histórico
  - Aprende com completions anteriores

- ⚠️ **Vessel Learning**: NÃO ESPECÍFICO
  - IA aprende globalmente, não por vessel
  - TODO: Treinar modelo por tipo de embarcação
  - TODO: Transferir aprendizado entre vessels similares

#### Logs Analyzer (`src/ai/services/logsAnalyzer.ts`)
- ✅ **Funções**:
  - `analyzeSystemLogs()`: Análise de anomalias
  - `previewAutoFix()`: Sugestão de correções
  - `storeAutoFixHistory()`: Histórico de fixes

- ⚠️ **Vessel-Specific Patterns**: AUSENTE
  - Análise não considera padrões específicos do navio
  - TODO: Baseline por vessel
  - TODO: Alertas quando vessel diverge do normal

---

### ◼️ Distributed Sync - Context Synchronization

#### Database Schema
```sql
-- Tabela esperada para sync de contexto
CREATE TABLE ai_context_sync (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID REFERENCES vessels(id) NOT NULL,
  module_id TEXT NOT NULL,
  context_data JSONB NOT NULL,
  synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sync_status TEXT DEFAULT 'pending',
  retry_count INTEGER DEFAULT 0
);
```

- ❌ **Tabela `ai_context_sync`**: NÃO EXISTE
  - TODO: Criar migration
  - TODO: Implementar RLS (acesso por organização)
  - TODO: Índices para performance

#### Sync Mechanism
- ❌ **MQTT Sync**: NÃO IMPLEMENTADO
  - TODO: Topic `fleet/{org_id}/ai/context/{vessel_id}`
  - TODO: Publish ao atualizar contexto local
  - TODO: Subscribe para receber updates de outros vessels

- ❌ **HTTP Fallback**: NÃO IMPLEMENTADO
  - TODO: POST `/api/ai/sync-context` via Edge Function
  - TODO: Retry logic com exponential backoff
  - TODO: Queue local para sync pendente

---

### ◼️ AI Hooks - Vessel Context Integration

#### useAIAssistant (`src/ai/hooks/useAIAssistant.ts`)
- ✅ **Implementação Base**:
  - `ask()`: Query à IA
  - Estados: loading, error
  - Histórico de conversação

- ⚠️ **Vessel Awareness**: PARCIAL
  - Hook aceita `moduleId` mas não `vesselId`
  - TODO: Adicionar `vesselId` como parâmetro
  - TODO: Incluir vessel context no prompt

```typescript
// Implementação desejada
const { ask } = useAIAssistant({
  moduleId: 'fleet-management',
  vesselId: currentVesselId, // ← Adicionar
  includeVesselContext: true
});
```

---

### ◼️ Remote Fallback - API Availability

#### Connectivity Check
- ⚠️ **Online/Offline Detection**: NÃO VALIDADO
  - TODO: Verificar se há listener para `navigator.onLine`
  - TODO: Ping periódico ao backend
  - TODO: Toast quando modo offline ativado

#### Fallback Strategy
```typescript
// Estratégia esperada
async function aiQuery(prompt: string, vesselId: string) {
  if (isOnline && hasAPIKey) {
    return await runOpenAI(prompt); // Remoto
  } else {
    return await nautilusInference.analyze(prompt); // Local ONNX
  }
}
```

- ⚠️ **Fallback Automático**: NÃO IMPLEMENTADO
  - AI Engine retorna mock se sem API key
  - Deveria usar ONNX local
  - TODO: Integrar nautilusInference como fallback

---

### ◼️ Logs & Monitoring

#### AI Context Logs
- ✅ **Console Logs**: Presentes em `storeInteraction()`
- ❌ **Database Logs**: NÃO PERSISTIDOS
  - TODO: Tabela `ai_interaction_logs`
  - Campos: user_id, vessel_id, module_id, prompt, response, timestamp
  - RLS: Apenas admins e próprio usuário

#### Sync Logs
- ❌ **MQTT Sync Logs**: AUSENTE
  - Não há tracking de quando contexto foi sincronizado
  - TODO: Log em `ai_context_sync` table
  - TODO: Métricas: sync_time, payload_size, success_rate

---

## 🧪 Testes Funcionais

### Teste 1: IA Local (Offline)
```typescript
// Desconectar internet
// Fazer query à IA
const response = await ask("Qual o status da embarcação?");
// Esperado: Resposta via ONNX local
```
- ⚠️ **Status**: NÃO TESTADO

### Teste 2: Sync de Contexto
```typescript
// Vessel A atualiza contexto
await updateModuleContext('mission-control', vesselA_id, { status: 'active' });
// Vessel B (mesma org) deve receber update
// Via MQTT ou polling HTTP
```
- ❌ **Status**: NÃO IMPLEMENTADO

### Teste 3: Fallback Remoto
```typescript
// Começar offline (ONNX)
let response1 = await ask("Análise de tripulação");
// Conectar internet
let response2 = await ask("Análise de tripulação");
// response2 deve vir da API (mais preciso)
```
- ⚠️ **Status**: PARCIAL (não alterna automaticamente)

### Teste 4: Vessel-Specific Learning
```typescript
// Vessel A: Completar checklist 10x
// Vessel B: Primeira vez
// autoFillChecklist() deve ser mais preciso em Vessel A
```
- ❌ **Status**: NÃO IMPLEMENTADO (aprendizado global)

---

## 📊 Métricas de Performance

- **Local Inference**: ⚠️ NÃO VALIDADO
- **Context Sync**: ❌ 0% (não implementado)
- **Fallback Remoto**: ⚠️ 40% (retorna mock, não ONNX)
- **Vessel Awareness**: ⚠️ 30% (contexto existe mas não por vessel)
- **Logs de Sync**: ❌ 0% (ausente)

---

## ⚠️ Issues Identificados

### CRÍTICO
1. **Sync de contexto não implementado**: Vessels não compartilham aprendizado
2. **ONNX fallback não integrado**: Sistema não funciona offline de verdade
3. **Tabela `ai_context_sync` ausente**: Sem tracking de sincronização

### ALTO
4. **Vessel-specific context ausente**: Contexto não vinculado a vessel_id
5. **Aprendizado global**: IA não treina especificamente por embarcação
6. **Logs de interação não persistidos**: Sem auditoria de uso da IA

### MÉDIO
7. **Connectivity detection**: Sem detecção automática online/offline
8. **MQTT topics não definidos**: Falta estrutura de tópicos para sync
9. **Retry logic ausente**: Sync falho não tenta novamente

---

## 🎯 Recomendações

### Imediato (PATCH 167.1)
1. ✅ Criar tabela `ai_context_sync` + RLS
2. ✅ Adicionar `vesselId` no `ModuleContext`
3. ✅ Implementar fallback ONNX em `runOpenAI()`
4. ✅ Logging de interações no Supabase

### Curto Prazo (PATCH 168)
5. Implementar MQTT sync de contexto
6. Connectivity detection + toast offline
7. Vessel-specific learning em checklist autofill
8. Retry queue para sync pendente

### Médio Prazo
9. Transferência de aprendizado entre vessels similares
10. Analytics de uso da IA por vessel
11. Compressão de contexto para economia de banda
12. Edge caching de modelos ONNX

---

## ✅ Conclusão

**Status Geral**: ⚠️ FUNCIONALIDADE LIMITADA

- ✅ AI Engine remoto: FUNCIONAL
- ✅ Context management: BÁSICO (sem vessel_id)
- ⚠️ Local inference: PRESENTE mas NÃO INTEGRADO
- ❌ Distributed sync: NÃO IMPLEMENTADO
- ❌ Fallback automático: AUSENTE

**Bloqueadores para PROD**:
1. Implementar sync de contexto entre vessels
2. Integrar ONNX como fallback real
3. Adicionar vessel_id em todo context system
4. Criar logging e monitoring de sync

**Dependências**:
- PATCH 166: Vessel Context (prerequisito)
- PATCH 169: Intervessel Sync (complementar)

---

**Auditado em**: 2025-10-25  
**Versão**: PATCH 167.0  
**Próximo Patch**: PATCH 168.0 - Fleet Command Center
