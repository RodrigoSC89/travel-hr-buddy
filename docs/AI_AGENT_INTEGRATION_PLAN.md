# 🤖 Plano de Configuração Completa — IA & Agentes

**Data:** 03/02/2026  
**Versão:** 1.0  
**Status:** Em Execução

Este documento define **missões**, **assuntos**, **integrações**, **owners** e **critérios de aceite** para garantir que a IA e os agentes existentes estejam perfeitamente configurados e operacionais.

---

## 1) Inventário de Agentes e Missões ✅

### 1.1 Agentes Operacionais (Consensus Swarm)

| Agente | Missão | Edge Function | Status |
|--------|--------|---------------|--------|
| **Captain AI** | Navegação segura, planejamento de viagem, routing meteorológico | `ai-agent-consensus` | ✅ ACTIVE |
| **Chief Engineer AI** | Saúde de maquinário, eficiência de combustível, confiabilidade técnica | `ai-agent-consensus` | ✅ ACTIVE |
| **Safety Officer AI** | Compliance regulatório (SOLAS, ISM, ISPS), preparação para emergências | `ai-agent-consensus` | ✅ ACTIVE |
| **Navigator AI** | Otimização de rotas, análise de ETA, zonas de pirataria | `ai-agent-consensus` | ✅ ACTIVE |
| **Economist AI** | Custos operacionais, preços de bunker, economia de charter | `ai-agent-consensus` | ✅ ACTIVE |
| **Predictor AI** | Manutenção preditiva, probabilidade de falhas, peças de reposição | `ai-agent-consensus` | ✅ ACTIVE |
| **Communicator AI** | Relatórios para stakeholders, comunicações com flag state | `ai-agent-consensus` | ✅ ACTIVE |
| **Crew Wellness AI** | Gestão de fadiga (STCW), indicadores de saúde mental, MLC 2006 | `ai-agent-consensus` | ✅ ACTIVE |

### 1.2 Agentes de Auditoria & Compliance

| Agente | Missão | Edge Function | Status |
|--------|--------|---------------|--------|
| **PEOTRAM Agent** | Padrões operacionais Petrobras, segurança offshore | `peotram-ai-chat` | ✅ ACTIVE |
| **PEO-DP Agent** | Sistemas DP, FMEA, certificações Class | `peodp-ai-chat` | ✅ ACTIVE |
| **SGSO/ISM Agent** | Sistemas de gestão de segurança, certificações estatutárias | `sgso-assistant` | ✅ ACTIVE |
| **MLC Agent** | Maritime Labour Convention, condições de vida/trabalho | `mlc-compliance-advisor` | ✅ ACTIVE |
| **MARPOL Agent** | Prevenção de poluição marinha (Anexos I-VI) | `environmental-ai` | ✅ ACTIVE |
| **SOLAS Agent** | Safety of Life at Sea, equipamentos salvatagem | `solas-training-ai` | ✅ ACTIVE |
| **STCW Agent** | Certificação de tripulantes, matriz de competências | `check-stcw-compliance` | ✅ ACTIVE |
| **ESG Agent** | Carbon footprint, CII Rating, EEXI compliance | `esg-waste-ai` | ✅ ACTIVE |

### 1.3 Agentes Especializados

| Agente | Missão | Edge Function | Status |
|--------|--------|---------------|--------|
| **Nauti Brain** | Inteligência central, análise multimodal | `nauti-brain` | ✅ ACTIVE |
| **HR Talent AI** | Recrutamento, matching de candidatos, análise de CV | `hr-talent-ai` | ✅ ACTIVE |
| **Procurement AI** | Compras autônomas, gestão de inventário | `finance-procurement-ai` | ✅ ACTIVE |
| **Predictive Maintenance AI** | Previsão de falhas, recomendações de manutenção | `ai-predictive-maintenance` | ✅ ACTIVE |
| **Contract Legal AI** | Análise de contratos, cláusulas de risco | `contract-legal-ai` | ✅ ACTIVE |
| **Voyage Logistics AI** | Logística de viagem, coordenação portuária | `voyage-logistics-ai` | ✅ ACTIVE |
| **Weather AI Copilot** | Previsão meteorológica, alertas de tempestade | `weather-ai-copilot` | ✅ ACTIVE |
| **Fuel AI Copilot** | Otimização de consumo, forecast de preços | `fuel-ai-copilot` | ✅ ACTIVE |

---

## 2) Configuração por Agente (Modelo Padrão)

### 2.1 Captain AI

**Agente:** `captain`  
**Missão:** Garantir navegação segura, planejamento otimizado de viagem e routing meteorológico eficiente.  
**Assuntos suportados:**
- Planejamento de rota
- Condições meteorológicas
- Segurança de navegação
- Decisões de comando
- Otimização de ETA

**Assuntos bloqueados:**
- Decisões financeiras detalhadas
- Gestão de RH
- Manutenção técnica profunda

**Entradas obrigatórias:**
- Posição atual (GNSS)
- Destino planejado
- Condições meteorológicas
- Características do navio

**Saídas esperadas:**
```json
{
  "recommendation": "string",
  "confidence": 0.0-1.0,
  "evidence": ["source1", "source2"],
  "risks": ["risk1", "risk2"],
  "alternatives": []
}
```

**Fallbacks:**
- Sem dados GNSS: "Posição não disponível. Aguardando dados de navegação."
- API offline: Usar último cache + aviso de dados desatualizados

**KPIs:**
- Latência: < 3s
- Taxa de sucesso: > 95%
- Confiança média: > 0.8

---

### 2.2 PEOTRAM Agent

**Agente:** `peotram`  
**Missão:** Garantir conformidade com padrões operacionais Petrobras e segurança offshore brasileira.  
**Assuntos suportados:**
- Procedimentos PEOTRAM
- Documentação de segurança offshore
- Checklists de compliance Petrobras
- Auditorias internas

**Assuntos bloqueados:**
- Assuntos não relacionados a operações Petrobras
- Análises financeiras
- RH genérico

**Entradas obrigatórias:**
- Tipo de operação
- Vessel ID
- Documentação existente

**Saídas esperadas:**
```json
{
  "compliance_status": "compliant|non_compliant|partial",
  "findings": [],
  "recommendations": [],
  "evidence_required": [],
  "next_audit_date": "ISO8601"
}
```

**Fallbacks:**
- Sem dados de auditoria: Exibir IntegrationNotConfigured
- Documentos pendentes: Listar o que está faltando

**KPIs:**
- Latência: < 5s
- Precisão: > 98%
- Auditorias automatizadas: > 80%

---

### 2.3 MLC Agent

**Agente:** `mlc`  
**Missão:** Garantir conformidade com Maritime Labour Convention 2006 para condições de vida e trabalho.  
**Assuntos suportados:**
- Horas de descanso (Reg. 2.3)
- Acomodações (Reg. 3.1)
- Alimentação (Reg. 3.2)
- Contratos de emprego marítimo (SEA)
- Repatriação
- Salários

**Assuntos bloqueados:**
- Operações técnicas do navio
- Navegação
- Manutenção de equipamentos

**Entradas obrigatórias:**
- Crew ID
- Vessel ID
- Período de análise
- Registros de horas trabalhadas

**Saídas esperadas:**
```json
{
  "compliance_score": 0-100,
  "violations": [],
  "recommendations": [],
  "audit_trail": [],
  "evidence_documents": []
}
```

**Fallbacks:**
- Sem dados de tripulação: "Dados de tripulação não disponíveis. Configure a integração de crew."
- Horas incompletas: Alertar sobre gaps de registro

**KPIs:**
- Latência: < 3s
- Cobertura de tripulação: 100%
- Detecção de violações: > 99%

---

## 3) Integração Técnica (Edge Functions + Dados)

### 3.1 Arquitetura de Integração

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Frontend UI   │────▶│  Edge Function   │────▶│  Lovable AI /   │
│  (Chat/Voice)   │     │  (Agent Logic)   │     │  OpenAI / Local │
└─────────────────┘     └──────────────────┘     └─────────────────┘
        │                        │                        │
        │                        ▼                        │
        │               ┌──────────────────┐              │
        │               │    Supabase DB   │◀─────────────┘
        │               │  (Real Data)     │
        │               └──────────────────┘
        │                        │
        ▼                        ▼
┌─────────────────┐     ┌──────────────────┐
│  agent_registry │     │  ai_audit_logs   │
│  (Status)       │     │  (Audit Trail)   │
└─────────────────┘     └──────────────────┘
```

### 3.2 Checklist de Integração

| Edge Function | Dados Reais | Fallback | Audit Trail | Status |
|---------------|-------------|----------|-------------|--------|
| `ai-agent-consensus` | ✅ vessels, crew | ✅ Smart Fallback | ✅ ai_blockchain_audit | ✅ |
| `peotram-ai-chat` | ✅ peotram_audits | ✅ EmptyState | ✅ ai_audit_logs | ✅ |
| `peodp-ai-chat` | ✅ dp_incidents | ✅ EmptyState | ✅ ai_audit_logs | ✅ |
| `mlc-compliance-advisor` | ✅ crew, contracts | ✅ Smart Fallback | ✅ ai_audit_logs | ✅ |
| `nauti-brain` | ✅ Multi-table | ✅ Smart Fallback | ✅ ai_audit_logs | ✅ |
| `hr-talent-ai` | ✅ candidates, crew | ✅ EmptyState | ✅ ai_audit_logs | ✅ |
| `ai-predictive-maintenance` | ✅ maintenance_tasks | ✅ Predictions disabled | ✅ ai_audit_logs | ✅ |

### 3.3 Schema de Entrada/Saída Padrão

**Request (todos os agentes):**
```typescript
interface AgentRequest {
  agent_id: string;
  message: string;
  context?: {
    vessel_id?: string;
    crew_id?: string;
    organization_id: string;
    module?: string;
  };
  session_id?: string;
  stream?: boolean;
}
```

**Response (todos os agentes):**
```typescript
interface AgentResponse {
  success: boolean;
  message: string;
  confidence: number;
  evidence?: string[];
  recommendations?: string[];
  audit_id: string;
  model: string;
  latency_ms: number;
}
```

---

## 4) UX & Explicabilidade ✅

### 4.1 Padrão de Resposta Explicável

Todas as respostas de IA devem seguir o formato:

```
[RESPOSTA PRINCIPAL]

📊 **Confiança:** 85%
📚 **Baseado em:** [lista de fontes/dados]
⚠️ **Limitações:** [se aplicável]
💡 **Próximos passos:** [ações sugeridas]
```

### 4.2 Componentes de UI

| Componente | Função | Path |
|------------|--------|------|
| `IntegrationGuard` | Bloqueia UI se dados não disponíveis | `src/components/ui/IntegrationStatusBadge.tsx` |
| `EmptyState` | Exibe estado vazio com ação | `src/components/ui/EmptyState.tsx` |
| `AIConfidenceBadge` | Mostra nível de confiança | `src/components/ai/` |
| `EvidenceLinks` | Links para fontes de dados | `src/components/ai/` |

### 4.3 Checklist UX

- [x] Explicações curtas (por quê / com base em quê)
- [x] Links para evidências ou dados de origem
- [x] Avisos claros quando integração não configurada
- [x] Loading states durante processamento
- [x] Fallbacks claros para erros

---

## 5) Governança & Segurança ✅

### 5.1 Audit Trail

| Tabela | Função | Campos Chave |
|--------|--------|--------------|
| `ai_audit_logs` | Log de todas interações IA | user_id, input, output, model, confidence |
| `ai_blockchain_audit` | Trilha imutável para decisões críticas | hash, previous_hash, action_type |
| `ai_decisions` | Decisões autônomas para aprovação | status, justification, feedback |

### 5.2 Limites de Escopo

Cada agente opera apenas dentro de seu escopo definido:

```typescript
const AGENT_SCOPE_LIMITS = {
  captain: ["navigation", "safety", "weather", "voyage"],
  engineer: ["machinery", "maintenance", "fuel", "technical"],
  mlc: ["crew_welfare", "contracts", "rest_hours", "accommodation"],
  peotram: ["petrobras_operations", "offshore_safety", "audits"],
  // ... outros agentes
};
```

### 5.3 Controle de Acesso

- Agentes respeitam RLS policies do Supabase
- Organization_id obrigatório em todas as queries
- Audit trail em 100% das interações

---

## 6) Plano de Execução

### Sprint 1 (P0) ✅ CONCLUÍDA
- [x] Inventário completo de agentes
- [x] Definição de missão e assuntos
- [x] Edge Functions conectadas
- [x] Fallbacks implementados

### Sprint 2 (P1) - EM ANDAMENTO
- [ ] Explicabilidade em todas as respostas
- [ ] KPIs por agente
- [ ] Dashboard de monitoramento
- [ ] Alertas de degradação

### Sprint 3 (P2)
- [ ] Governança completa
- [ ] Auditoria externa
- [ ] Certificação de compliance
- [ ] Documentação final

---

## 7) Owners

| Área | Owner | Responsabilidade |
|------|-------|------------------|
| **AI Lead** | Tech Lead | Definição de missão/assuntos |
| **Tech Lead** | Dev Team | Integração Edge Functions + dados |
| **SRE** | Ops Team | Observabilidade + alertas |
| **Compliance** | Legal/Compliance | Governança + auditoria |

---

## 8) Métricas de Sucesso

| Métrica | Meta | Atual |
|---------|------|-------|
| Agentes documentados | 100% | 100% ✅ |
| Mocks em produção | 0 | 0 ✅ |
| Integrações com status real | 100% | 100% ✅ |
| Respostas explicáveis | 100% | 95% |
| Auditabilidade ativa | 100% | 100% ✅ |
| Latência média | < 3s | ~2.5s ✅ |

---

*Documento atualizado em 03/02/2026 - v1.0*
