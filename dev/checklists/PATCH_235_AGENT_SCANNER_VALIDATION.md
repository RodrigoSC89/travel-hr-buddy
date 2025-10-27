# PATCH 235 – Multi-Agent Performance Scanner Validation

## 📘 Objetivo
Validar monitoramento de agentes IA, ranking de performance e failover automático em caso de falhas.

## ✅ Checklist de Validação

### 1. Todos os Agentes IA Monitorados
- [ ] 5+ agentes registrados no scanner
- [ ] Cada agente tem ID, name, type, model_name
- [ ] Status inicial correto (active/standby)
- [ ] Version tracking implementado
- [ ] Metrics inicializadas para todos os agentes
- [ ] Scanning ativo com interval de 10s
- [ ] Logs de registro disponíveis

### 2. Ranking Atualizado em Tempo Real
- [ ] Rankings calculados a cada scan
- [ ] Overall score baseado em múltiplos fatores
- [ ] Ordenação por score (DESC)
- [ ] Rank atribuído sequencialmente
- [ ] Trending status calculado
- [ ] Rankings acessíveis via getRankings()
- [ ] Logs mostram rankings atualizados

### 3. Troca de Agente Automático em Caso de Falha
- [ ] Failure detection funciona (success_rate < 70)
- [ ] Agent status muda para 'failed'
- [ ] Replacement agent identificado (mesmo type)
- [ ] Failover executado automaticamente
- [ ] Replacement agent muda para 'active'
- [ ] Failover event logado no banco
- [ ] Zero downtime durante failover

## 📊 Critérios de Sucesso
- ✅ 100% dos agentes monitorados continuamente
- ✅ Rankings atualizados a cada 10 segundos
- ✅ Failover em < 5 segundos após failure detection
- ✅ 100% dos failover events logados
- ✅ Zero perda de requests durante failover

## 🔍 Testes Recomendados

### Teste 1: Inicialização e Registro
```typescript
await multiAgentScanner.initialize();
const agents = multiAgentScanner.getAllAgents();

// Verificar: agents.length >= 5
// Verificar: cada agent tem id, name, type, model_name
// Verificar: pelo menos 1 agent 'active' por type
```

### Teste 2: Registro Manual
```typescript
multiAgentScanner.registerAgent({
  id: "agent-custom",
  name: "Custom Agent",
  type: "classifier",
  model_name: "custom-model-v1",
  status: "standby",
  version: "1.0.0"
});

const agent = multiAgentScanner.getAgent("agent-custom");
// Verificar: agent não é undefined
// Verificar: metrics inicializadas para agent
```

### Teste 3: Scan e Métricas
```typescript
multiAgentScanner.startScanning(5000); // 5s interval
await new Promise(r => setTimeout(r, 6000)); // Aguardar 1 scan

const metrics = multiAgentScanner.getMetrics("agent-gemini-flash");
// Verificar: metrics não é undefined
// Verificar: response_time_ms > 0
// Verificar: success_rate entre 0 e 100
```

### Teste 4: Rankings
```typescript
const rankings = await multiAgentScanner.getRankings();

// Verificar: rankings.length = agents.length
// Verificar: rankings[0].rank = 1
// Verificar: rankings ordenados por overall_score DESC
// Verificar: cada ranking tem metrics completo
```

### Teste 5: Failure Detection e Failover
```typescript
// Simular failure: forçar success_rate baixo
const metrics = multiAgentScanner.getMetrics("agent-gemini-flash");
metrics.success_rate = 60; // < 70, trigger failure

await multiAgentScanner.scanAllAgents();

const agent = multiAgentScanner.getAgent("agent-gemini-flash");
// Verificar: agent.status = 'failed'

// Verificar failover para standby agent
const geminiPro = multiAgentScanner.getAgent("agent-gemini-pro");
// Verificar: geminiPro.status = 'active'
```

### Teste 6: Logs de Failover
```typescript
// Após failover, verificar log no banco
const { data } = await supabase
  .from('agent_failover_log')
  .select('*')
  .eq('from_agent_id', 'agent-gemini-flash')
  .order('created_at', { ascending: false })
  .limit(1);

// Verificar: data[0] existe
// Verificar: data[0].to_agent_id = 'agent-gemini-pro'
// Verificar: data[0].success = true
```

## 🎯 Cenários de Validação

### Cenário 1: Performance Normal
- [ ] Todos os agentes 'active' com métricas saudáveis
- [ ] Rankings estáveis (trending: 'stable')
- [ ] Success rate > 80% para todos
- [ ] Response time < 2000ms
- [ ] Nenhum failover triggered

### Cenário 2: Agent Degradation
- [ ] Success rate cai para 65%
- [ ] Failure detection em próximo scan
- [ ] Status muda para 'failed'
- [ ] Failover para standby agent do mesmo type
- [ ] Rankings atualizam após failover

### Cenário 3: Múltiplos Agents Failing
- [ ] 2+ agents do mesmo type failing
- [ ] Failover para primeiro standby disponível
- [ ] Se não há standby, alerta gerado
- [ ] Logs mostram sequência de failovers

### Cenário 4: Recovery
- [ ] Agent 'failed' tem métricas melhoradas manualmente
- [ ] Status pode ser revertido para 'standby'
- [ ] Agent pode voltar para 'active' se necessário

## 🧪 Validação de Métricas

### AgentMetrics Tracked
- [ ] response_time_ms (500-2000ms esperado)
- [ ] success_rate (80-100% esperado)
- [ ] error_count (incremental)
- [ ] total_requests (incremental)
- [ ] avg_confidence (0.7-1.0 esperado)
- [ ] uptime_percent (90-100% esperado)
- [ ] last_updated (timestamp atual)

### Overall Score Calculation
```typescript
score = (
  success_rate * 0.3 +
  (1 - response_time_ms / 5000) * 100 * 0.2 +
  avg_confidence * 100 * 0.2 +
  uptime_percent * 0.3
)
```

## 📝 Estrutura de Dados Validada

### AIAgent Object
```typescript
{
  id: string,
  name: string,
  type: 'llm' | 'classifier' | 'analyzer' | 'predictor' | 'optimizer',
  model_name: string,
  status: 'active' | 'standby' | 'failed' | 'maintenance',
  version: string
}
```

### AgentRanking Object
```typescript
{
  agent_id: string,
  agent_name: string,
  rank: number,
  overall_score: number,
  metrics: AgentMetrics,
  trending: 'up' | 'down' | 'stable'
}
```

### FailoverEvent Object
```typescript
{
  from_agent_id: string,
  to_agent_id: string,
  reason: string,
  timestamp: string,
  success: boolean
}
```

## 🔄 Teste de Integração

### Start/Stop Scanning
- [ ] startScanning() inicia interval
- [ ] Scan automático a cada 10s (configurável)
- [ ] stopScanning() para interval
- [ ] Múltiplas chamadas a start não causam conflito

### Tipos de Agentes
- [ ] LLM agents: Gemini, GPT-5
- [ ] Analyzer agents: Tactical AI
- [ ] Predictor agents: Predictive Engine
- [ ] Failover respeita agent type

### Performance
- [ ] Scan de 10 agents em < 1s
- [ ] Rankings calculation em < 500ms
- [ ] Failover detection em < 2s
- [ ] Zero impact em CPU durante scanning

## 📋 Observações
- Data da validação: _____________
- Validador: _____________
- Agentes registrados: _____________
- Failovers executados: _____________
- Scan interval: _____________
- Agentes ativos: _____________
- Ambiente: [ ] Dev [ ] Staging [ ] Production
- Status: [ ] Aprovado [ ] Reprovado [ ] Em Revisão

## 🚨 Problemas Conhecidos
_____________________________________________
_____________________________________________
_____________________________________________
