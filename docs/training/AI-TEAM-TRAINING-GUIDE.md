# 📚 Nauti One AI - Guia de Treinamento da Equipe

## Fase IA.3: Team Training & Knowledge Transfer

Este documento contém o treinamento completo para todos os papéis da equipe sobre os sistemas de IA do Nauti One.

---

## 📋 Índice

1. [Visão Geral dos 7 Agentes IA](#visão-geral-dos-7-agentes-ia)
2. [Treinamento para Engenheiros](#treinamento-para-engenheiros)
3. [Treinamento para Product Managers](#treinamento-para-product-managers)
4. [Treinamento para Operações/Suporte](#treinamento-para-operaçõessuporte)
5. [Treinamento para Compliance/Legal](#treinamento-para-compliancelegal)
6. [Hands-on Labs](#hands-on-labs)
7. [Troubleshooting Guide](#troubleshooting-guide)
8. [FAQ](#faq)

---

## 🤖 Visão Geral dos 7 Agentes IA

### 1. Nauti Brain (Gemini 3.0 Flash)
- **Função**: Cérebro central de IA para tomada de decisão
- **Endpoints**: `/ai/nauti-brain`, `/ai-chat`
- **Capacidades**: Chat, insights operacionais, recomendações
- **Latência P95**: ~380ms
- **Custo**: ~$0.001/request

### 2. MLC Assistant (GPT-5)
- **Função**: Especialista em conformidade MLC 2006
- **Endpoints**: `/ai/mlc-assistant`, `/mlc-assistant`
- **Capacidades**: Perguntas de compliance, detecção de violações
- **Precisão**: 95%+ em questões MLC
- **Custo**: ~$0.002/request

### 3. PEOTRAM AI (Gemini 2.5 Pro Vision)
- **Função**: Análise de documentos de auditoria
- **Endpoints**: `/ai/peotram`, `/peotram-analyze`
- **Capacidades**: OCR, extração de achados, geração de relatórios
- **Tempo de processamento**: <5s por documento
- **Custo**: ~$0.003/documento

### 4. Crew Optimizer (Gemini 2.5 Flash)
- **Função**: Otimização de alocação de tripulação
- **Endpoints**: `/ai/crew-optimizer`, `/nauti-crew-optimizer`
- **Capacidades**: Alocação, validação de restrições, análise de custo
- **Tempo de otimização**: <30s para 20 tripulantes
- **Taxa de aceitação**: 70%+

### 5. Predictive Maintenance (Custom ML/ONNX)
- **Função**: Previsão de falhas de equipamentos
- **Endpoints**: `/maintenance/predictive`
- **Capacidades**: Previsão, agendamento, alertas
- **Precisão**: 87% (AUC 0.91)
- **Custo**: Mínimo (inferência local)

### 6. Voice Assistant (Whisper + ElevenLabs)
- **Função**: Interação por voz
- **Endpoints**: `/ai/voice`, `/transcribe-audio`
- **Capacidades**: Transcrição, síntese de voz, comandos
- **Latência end-to-end**: ~3.3s
- **Custo**: ~$0.01/minuto áudio

### 7. Document OCR (Tesseract + Vision)
- **Função**: Reconhecimento de caracteres e extração de campos
- **Endpoints**: `/ai/ocr`, `/nauti-ocr`
- **Capacidades**: OCR, classificação, extração de dados
- **Precisão**: 90%+ para documentos claros
- **Tempo**: <10s por documento

---

## 👨‍💻 Treinamento para Engenheiros

**Duração**: 4 horas

### Módulo 1: APIs de LLM (30 min)

#### Lovable AI Gateway
```typescript
// Endpoint único para todos os modelos
const GATEWAY_URL = 'https://ai.gateway.lovable.dev/v1/chat/completions';

// Exemplo de chamada
const response = await fetch(GATEWAY_URL, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${LOVABLE_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'google/gemini-3-flash-preview', // ou openai/gpt-5-mini
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'What are MLC requirements?' }
    ],
    stream: true
  })
});
```

#### Modelos Disponíveis
| Modelo | Uso | Custo/1M tokens |
|--------|-----|-----------------|
| gemini-3-flash-preview | Default, rápido | $0.075 input, $0.30 output |
| gemini-2.5-pro | Complex/Vision | $1.25 input, $5.00 output |
| gpt-5-mini | Compliance, precisão | $0.15 input, $0.60 output |
| gemini-2.5-flash-lite | Budget, simples | $0.0375 input, $0.15 output |

### Módulo 2: Error Handling & Fallbacks (30 min)

#### Circuit Breaker Pattern
```typescript
import { executeWithFallback } from '@/lib/ai/circuit-breaker';

// Executa com fallback automático
const result = await executeWithFallback({
  messages: [{ role: 'user', content: 'Hello' }],
  maxTokens: 500
}, {
  timeout: 15000,
  preferredModel: 'google/gemini-3-flash-preview'
});

// Se Gemini falhar, automaticamente tenta GPT-5, depois Gemini Lite
```

#### Tipos de Erro
| Código | Significado | Ação |
|--------|-------------|------|
| 429 | Rate limit | Backoff exponencial |
| 402 | Créditos esgotados | Alertar usuário, contatar billing |
| 500 | Erro do provider | Fallback para outro modelo |
| TIMEOUT | Timeout | Retry com timeout maior |

### Módulo 3: Token Counting & Cost Tracking (30 min)

```typescript
import { trackUsage, calculateCost, getMonthlyCostSummary } from '@/lib/ai/cost-tracker';

// Após cada chamada de IA
trackUsage({
  model: 'google/gemini-3-flash-preview',
  inputTokens: 150,
  outputTokens: 450,
  module: 'nauti-brain',
  userId: user.id
});

// Verificar orçamento
const summary = await getMonthlyCostSummary(organizationId);
console.log(`Custo este mês: $${summary.totalCost.toFixed(2)}`);
console.log(`Orçamento restante: $${summary.budgetRemaining.toFixed(2)}`);
```

### Módulo 4: Monitoramento (30 min)

#### Logs de Decisão
```sql
-- Verificar decisões recentes
SELECT model, confidence, created_at, 
       (response->>'tokens_output')::int as tokens
FROM ai_decisions 
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC LIMIT 20;

-- Taxa de sucesso por modelo
SELECT model, 
       COUNT(*) as total,
       AVG(confidence) as avg_confidence,
       COUNT(*) FILTER (WHERE user_feedback = 'correct') as correct
FROM ai_decisions
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY model;
```

#### Dashboard de Métricas
- Acesse: `/admin/ai-metrics`
- Métricas: latência, throughput, erros, custos
- Alertas: configurados em Supabase (>$100/dia)

### Módulo 5: Debugging (30 min)

#### Checklist de Debug
1. ✅ Verificar logs do edge function: `supabase functions logs <function-name>`
2. ✅ Verificar rate limits: headers `X-RateLimit-*`
3. ✅ Verificar API key: `LOVABLE_API_KEY` no Supabase
4. ✅ Verificar circuit breaker: `getCircuitHealth()`
5. ✅ Verificar cache: `aiResponseCache.getStats()`

### Módulo 6: Adicionando Novas Features (1 hora)

```typescript
// 1. Criar edge function
// supabase/functions/my-new-ai/index.ts

import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const { message, context } = await req.json();
  
  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'google/gemini-3-flash-preview',
      messages: [
        { role: 'system', content: 'Your system prompt here' },
        { role: 'user', content: message }
      ]
    })
  });

  const data = await response.json();
  
  return new Response(JSON.stringify({
    response: data.choices[0].message.content,
    model: data.model
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
});
```

---

## 📊 Treinamento para Product Managers

**Duração**: 2 horas

### O que a IA pode fazer
- ✅ Responder perguntas sobre MLC 2006 e STCW
- ✅ Analisar documentos e extrair informações
- ✅ Otimizar alocação de tripulação
- ✅ Prever falhas de equipamentos
- ✅ Transcrever áudio e sintetizar voz
- ✅ Gerar relatórios automatizados

### O que a IA NÃO pode fazer
- ❌ Tomar decisões finais sem aprovação humana
- ❌ Garantir 100% de precisão (sempre revisar dados críticos)
- ❌ Processar imagens de baixa qualidade com alta confiança
- ❌ Substituir expertise humana em situações de emergência

### Métricas de Sucesso
| Métrica | Target | Como Medir |
|---------|--------|------------|
| Precisão MLC | >95% | Test set mensal |
| Tempo de resposta | <2s | Dashboard de métricas |
| Taxa de aceitação | >70% | Feedback do usuário |
| Custo mensal | <$500 | Cost tracker |
| NPS de IA | >40 | Pesquisa de satisfação |

### Comunicação com Clientes
- Sempre explicar que IA é **assistência**, não substituição
- Mencionar que decisões críticas requerem **aprovação humana**
- Ser transparente sobre **limitações e precisão**

---

## 🛠️ Treinamento para Operações/Suporte

**Duração**: 3 horas

### Troubleshooting Comum

#### "A IA não está respondendo"
1. Verificar status do Lovable AI Gateway
2. Verificar créditos (402 = sem créditos)
3. Verificar rate limits (429 = limite atingido)
4. Verificar circuit breaker (`/admin/ai-health`)

#### "Resposta da IA está errada"
1. Coletar: pergunta exata, resposta, contexto
2. Verificar confiança (<70% = baixa confiança)
3. Reportar para feedback loop (ai_decisions.user_feedback)
4. Escalar se recorrente

#### "IA está lenta"
1. Verificar latência no dashboard
2. Verificar conexão do usuário
3. Verificar se cache está funcionando
4. Escalar se P95 > 2s

### Dashboards de Monitoramento
- **Saúde da IA**: `/admin/ai-health`
- **Custos**: `/admin/ai-costs`
- **Decisões**: `/admin/ai-decisions`
- **Logs**: Supabase Dashboard > Functions

### Procedimentos de Escalação
1. **Nível 1**: Suporte básico (reset cache, verificar status)
2. **Nível 2**: Engenharia (investigar logs, ajustar configs)
3. **Nível 3**: Especialista ML (retrain, ajustar modelos)

---

## ⚖️ Treinamento para Compliance/Legal

**Duração**: 2 horas

### Logging de Decisões (Auditabilidade)
- Todas as decisões de IA são logadas em `ai_decisions`
- Campos: model, prompt, response, confidence, timestamp
- Retenção: 2 anos (configurável)
- Acesso: `/admin/ai-audit`

### LGPD e IA
- ✅ Dados pessoais não são enviados para modelos externos
- ✅ Context é anonimizado quando possível
- ✅ Usuário pode solicitar exclusão de histórico de IA
- ✅ Logs de acesso mantidos para auditoria

### Explicabilidade
- Cada resposta inclui **score de confiança**
- Decisões de alto impacto mostram **justificativa**
- Usuário pode pedir "por que?" para explicação

### Disclaimers Recomendados
```
"Este conteúdo foi gerado por inteligência artificial e deve ser 
validado por um profissional qualificado antes de decisões críticas."

"A IA do Nauti One é uma ferramenta de assistência. Decisões finais 
devem considerar contexto específico e expertise humana."
```

---

## 🔬 Hands-on Labs

### Lab 1: Testar Nauti Brain
1. Acesse `/ai/nauti-brain`
2. Pergunte: "What are STCW certification requirements?"
3. Verifique: resposta, confiança, tempo de resposta
4. Dê feedback: "Helpful" ou "Not Helpful"

### Lab 2: Analisar Documento com PEOTRAM
1. Acesse `/ai/peotram`
2. Faça upload de um documento de auditoria
3. Verifique: extração de achados, severidade, remediação
4. Exporte relatório PDF

### Lab 3: Otimizar Tripulação
1. Acesse `/voyages/new`
2. Defina requisitos de tripulação
3. Veja sugestões do Crew Optimizer
4. Compare opções e custos

### Lab 4: Testar Fallback
1. Acesse `/admin/ai-health`
2. Observe status dos circuit breakers
3. Simule falha (se em ambiente de teste)
4. Verifique que fallback funcionou

---

## ❓ FAQ

**Q: Quanto custa a IA por mês?**
A: Estimativa: $200-500/mês dependendo do uso. Dashboard em `/admin/ai-costs`.

**Q: Como sei se a IA está certa?**
A: Verifique o score de confiança. >85% = alta confiança. <70% = revisar manualmente.

**Q: O que fazer se a IA der resposta errada?**
A: Clique em "Not Helpful", corrija a informação, e o sistema aprende.

**Q: Posso confiar 100% na IA para compliance?**
A: Não. IA é assistência. Sempre valide com especialista para decisões críticas.

**Q: A IA funciona offline?**
A: Parcialmente. Algumas respostas comuns são cacheadas localmente.

---

## ✅ Checklist de Conclusão

- [ ] Engenheiros: Completaram 4h de treinamento técnico
- [ ] PMs: Completaram 2h de treinamento de produto
- [ ] Operações: Completaram 3h de treinamento de suporte
- [ ] Compliance: Completaram 2h de treinamento legal
- [ ] Todos: Realizaram pelo menos 2 labs hands-on
- [ ] Todos: Passaram no quiz de certificação (opcional)

---

**Data de criação**: 2024-01-20
**Versão**: 1.0.0
**Próxima revisão**: 2024-04-20
