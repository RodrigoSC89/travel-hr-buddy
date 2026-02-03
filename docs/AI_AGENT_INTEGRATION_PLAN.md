# 🤖 Plano de Configuração Completa — IA & Agentes

> **PATCH 902** | Versão 2.0 | Atualizado: 2026-02-03  
> **Status:** ✅ 100% Documentado e Configurado

Este documento define **missões**, **assuntos**, **integrações**, **owners** e **critérios de aceite** para garantir que a IA e os agentes existentes estejam perfeitamente configurados e operacionais.

---

## 📊 Resumo Executivo

| Métrica | Valor |
|---------|-------|
| **Total de Agentes** | 25 |
| **Agentes Ativos** | 25 |
| **Edge Functions Integradas** | 18 |
| **Taxa de Conformidade** | 100% |
| **Mocks em Produção** | 0 |

---

## 1) Inventário Completo de Agentes ✅

### 1.1 Agentes CORE (7 agentes) - `src/lib/ai/model-registry.ts`

| Agent ID | Nome | Missão | Modelo Primário | Status |
|----------|------|--------|-----------------|--------|
| `nauti-brain` | Nauti Brain | Central AI para insights operacionais | Gemini 3 Flash | ✅ Active |
| `mlc-assistant` | MLC Assistant | Especialista MLC 2006 | GPT-5 Mini | ✅ Active |
| `peotram-ai` | PEOTRAM AI | Análise documental com visão | Gemini 2.5 Pro | ✅ Active |
| `crew-optimizer` | Crew Optimizer | Alocação otimizada de tripulação | Gemini 3 Flash | ✅ Active |
| `predictive-maintenance` | Predictive Maintenance | Predição de falhas | ONNX Custom | ✅ Active |
| `voice-assistant` | Voice Assistant | Interface de voz hands-free | Whisper | ✅ Active |
| `document-ocr` | Document OCR | Extração de campos OCR | Gemini 2.5 Pro | ✅ Active |

### 1.2 Agentes SWARM (8 agentes) - `src/lib/ai/autonomous/agent-orchestrator.ts`

| Agent ID | Nome | Role | Autonomy Level | Status |
|----------|------|------|----------------|--------|
| `captain-ai` | Captain AI | Comando estratégico do navio | L2 (Auto+Notify) | ✅ Active |
| `engineer-ai` | Chief Engineer AI | Manutenção e performance | L2 | ✅ Active |
| `safety-ai` | Safety Officer AI | Enforcement de regulamentos | L3 (Full-Auto) | ✅ Active |
| `wellness-ai` | Wellness Officer AI | Saúde e bem-estar da tripulação | L2 | ✅ Active |
| `navigator-ai` | Navigator AI | Otimização de rotas | L1 (Suggest) | ✅ Active |
| `economist-ai` | Economist AI | Otimização financeira | L2 | ✅ Active |
| `predictor-ai` | Predictor AI | Analytics preditivo | L3 | ✅ Active |
| `communicator-ai` | Communicator AI | Comunicação interna/externa | L2 | ✅ Active |

### 1.3 Agentes de AUDITORIA (10 agentes) - `src/components/ai/EnhancedAuditAgentsHub.tsx`

| Agent ID | Nome | Normas | Edge Function | Status |
|----------|------|--------|---------------|--------|
| `peotram-audit` | Agente PEOTRAM | PEOTRAM, ANP, NORMAM | `peotram-ai-chat` | ✅ Active |
| `peodp-audit` | Agente PEO-DP | NORMAM-101, IMCA M 117 | `peodp-ai-chat` | ✅ Active |
| `sgso-audit` | Agente SGSO | ANP 43/2007, API RP 75 | `sgso-assistant` | ✅ Active |
| `mlc-audit` | Agente MLC 2006 | MLC 2006, ILO | `mlc-assistant` | ✅ Active |
| `ism-audit` | Agente ISM Code | ISM Code, SOLAS Cap IX | `compliance-ai` | ✅ Active |
| `isps-audit` | Agente ISPS Code | ISPS Code, MARSEC | `compliance-ai` | ✅ Active |
| `marpol-audit` | Agente MARPOL | MARPOL 73/78, BWM | `environmental-ai` | ✅ Active |
| `solas-audit` | Agente SOLAS | SOLAS 1974 | `safety-ai` | ✅ Active |
| `stcw-audit` | Agente STCW | STCW 1978/2010 | `training-ai-assistant` | ✅ Active |
| `esg-audit` | Agente ESG | IMO 2050, EU MRV, GHG | `environmental-ai` | ✅ Active |

---

## 2) Configuração por Agente (Modelo Padrão) ✅

### 2.1 Template de Configuração

```typescript
interface AgentConfig {
  agentId: string;           // Identificador único
  agentName: string;         // Nome exibido na UI
  description: string;       // Descrição da missão
  primaryModel: string;      // Modelo LLM principal
  fallbackModel: string;     // Modelo de fallback
  systemPrompt: string;      // Prompt do sistema
  maxTokens: number;         // Limite de tokens
  temperature: number;       // Criatividade (0-1)
  capabilities: string[];    // Lista de habilidades
  integrationPoints: string[]; // Rotas de integração
  status: 'active' | 'testing' | 'deprecated';
}
```

### 2.2 Exemplo: Nauti Brain

```yaml
Agente: nauti-brain
Missão: Central AI brain for decision-making and operational insights
Assuntos Suportados:
  - Compliance marítimo (MLC, STCW, ISM)
  - Operações de tripulação
  - Manutenção preventiva
  - Otimização de viagens
Assuntos Bloqueados:
  - Transações financeiras diretas
  - Alterações de contrato sem aprovação humana
  - Decisões de emergência crítica sem supervisão
Entradas Obrigatórias:
  - Contexto do usuário (vessel_id, user_id)
  - Mensagem do usuário
  - Histórico de conversa (últimas 10 mensagens)
Saídas Esperadas:
  - Resposta em português
  - Citação de regulamentos quando aplicável
  - Nível de confiança (0-100%)
  - Links para evidências/documentos
Fallbacks:
  - Se sem dados: "Não tenho informações suficientes sobre [X]."
  - Se erro de API: Usar modelo fallback (GPT-5 Mini)
  - Se timeout: "Estou processando sua solicitação. Aguarde."
KPIs:
  - Tempo de resposta < 3s (P95)
  - Taxa de sucesso > 95%
  - Satisfação do usuário > 4.0/5.0
```

---

## 3) Integração Técnica (Edge Functions + Dados) ✅

### 3.1 Mapeamento de Edge Functions

| Agent ID | Edge Function | Método | Autenticação |
|----------|---------------|--------|--------------|
| `nauti-brain` | `nauti-brain` | POST | JWT Required |
| `mlc-assistant` | `mlc-assistant` | POST | JWT Required |
| `peotram-ai` | `peotram-ai-chat` | POST | JWT Required |
| `crew-optimizer` | `crew-optimizer` | POST | JWT Required |
| `predictive-maintenance` | `ai-predictive-maintenance` | POST | JWT Required |
| `voice-assistant` | `voice-assistant-chat` | POST | JWT Required |
| `document-ocr` | `document-ocr` | POST | JWT Required |
| `peotram-audit` | `peotram-ai-chat` | POST | JWT Required |
| `peodp-audit` | `peodp-ai-chat` | POST | JWT Required |
| `sgso-audit` | `sgso-assistant` | POST | JWT Required |
| `mlc-audit` | `mlc-assistant` | POST | JWT Required |
| `ism-audit` | `compliance-ai` | POST | JWT Required |
| `isps-audit` | `compliance-ai` | POST | JWT Required |
| `marpol-audit` | `environmental-ai` | POST | JWT Required |
| `solas-audit` | `safety-ai` | POST | JWT Required |
| `stcw-audit` | `training-ai-assistant` | POST | JWT Required |
| `esg-audit` | `environmental-ai` | POST | JWT Required |
| `ai-consensus` | `ai-agent-consensus` | POST | JWT Required |

### 3.2 Schema de Request Padrão

```typescript
interface AgentRequest {
  message: string;           // Mensagem do usuário
  context?: string;          // Contexto adicional
  agentType?: string;        // Tipo de agente (se multi-agent)
  conversationId?: string;   // ID da conversa (para histórico)
  vesselId?: string;         // ID do navio (contexto)
  userId?: string;           // ID do usuário
  metadata?: Record<string, unknown>; // Metadados extras
}
```

### 3.3 Schema de Response Padrão

```typescript
interface AgentResponse {
  response: string;          // Resposta principal
  confidence: number;        // Nível de confiança (0-100)
  sources?: string[];        // Fontes/evidências
  suggestions?: string[];    // Sugestões adicionais
  actions?: AgentAction[];   // Ações recomendadas
  metadata?: {
    model: string;           // Modelo usado
    tokens_used: number;     // Tokens consumidos
    latency_ms: number;      // Latência em ms
    agent_id: string;        // ID do agente
  };
}
```

### 3.4 Checklist de Integração ✅

- [x] Conectar agentes às Edge Functions necessárias
- [x] Validar schemas de entrada/saída
- [x] Garantir logs e rastreio (observabilidade)
- [x] Implementar fallbacks para cada agente
- [x] Testar cenários de erro (timeout, rate limit, etc.)

---

## 4) UX & Explicabilidade ✅

### 4.1 Padrões de Resposta Explicável

Cada resposta de agente DEVE incluir:

1. **Resposta Principal** - Ação ou informação solicitada
2. **Justificativa** - Por que esta recomendação
3. **Evidências** - Links para documentos, normas ou dados
4. **Nível de Confiança** - Indicador visual (🟢 Alta, 🟡 Média, 🔴 Baixa)
5. **Próximos Passos** - Sugestões de ações

### 4.2 Estados de Integração

| Estado | Descrição | UI Indicator |
|--------|-----------|--------------|
| `CONNECTED` | Integração funcionando | 🟢 Verde |
| `DEGRADED` | Funcionando com fallback | 🟡 Amarelo |
| `DISCONNECTED` | Sem conexão | 🔴 Vermelho |
| `NOT_CONFIGURED` | Não configurado | ⚫ Cinza |

### 4.3 Checklist UX ✅

- [x] Explicações curtas (por quê / com base em quê)
- [x] Links para evidências ou dados de origem
- [x] Avisos claros quando integração não configurada
- [x] Indicadores visuais de confiança
- [x] Sugestões de próximos passos

---

## 5) Governança & Segurança ✅

### 5.1 Níveis de Autonomia

```
L0 - Ask: Sempre pede aprovação humana
L1 - Suggest: Sugere ação, humano decide
L2 - Auto+Notify: Executa e notifica
L3 - Full-Auto: Executa autonomamente (apenas críticos de segurança)
```

### 5.2 Audit Trail

- **Tabela:** `ai_audit_logs` - Log de todas interações
- **Tabela:** `ai_blockchain_audit` - Hash encadeado para imutabilidade
- **Retenção:** 7 anos (compliance marítimo)

### 5.3 Checklist Governança ✅

- [x] Restrições de escopo por agente
- [x] Audit trail das decisões
- [x] Logs de acesso e uso
- [x] Hash blockchain para decisões críticas
- [x] Níveis de autonomia configurados

---

## 6) Plano de Execução ✅

| Sprint | Status | Itens |
|--------|--------|-------|
| Sprint 1 (P0) | ✅ CONCLUÍDO | Inventário, missão, agent_registry, Edge Functions |
| Sprint 2 (P1) | ✅ CONCLUÍDO | Explicabilidade, KPIs, Alertas, Fallbacks |
| Sprint 3 (P2) | ✅ CONCLUÍDO | Governança, Auditoria, Blockchain, Documentação |

---

## 7) Owners

| Área | Responsável |
|------|-------------|
| AI Lead | Definição de missão/assuntos |
| Tech Lead | Integração Edge Functions + dados |
| SRE | Observabilidade + alertas |
| Compliance | Governança + auditoria |

---

## 8) Critérios de Aceite Final ✅

| Critério | Status |
|----------|--------|
| 100% agentes documentados | ✅ |
| 100% agentes configurados | ✅ |
| 0 mocks em módulos críticos | ✅ |
| Integrações com status real | ✅ |
| Respostas explicáveis | ✅ |
| Auditabilidade ativa | ✅ |

---

## 9) Referências

- `src/lib/ai/model-registry.ts` - Registro de agentes CORE
- `src/lib/ai/autonomous/agent-orchestrator.ts` - Orquestrador SWARM
- `src/components/ai/EnhancedAuditAgentsHub.tsx` - Hub de Auditoria
- `src/hooks/useAIObservabilityData.ts` - Observabilidade
- Tabela: `agent_registry` - Registro no banco
- Tabela: `ai_audit_logs` - Logs de auditoria
- Tabela: `ai_blockchain_audit` - Blockchain de decisões

---

*Documento atualizado em 2026-02-03 - PATCH 902 - v2.0*
