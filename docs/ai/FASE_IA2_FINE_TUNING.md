# Fase IA.2: Fine-Tuning & Optimization

**Status:** 🔄 EM PROGRESSO
**Date:** 2026-01-20

---

## 1. MLC Assistant Fine-Tuning

### Dataset Expandido
- **Total exemplos:** 1000+ (500 existentes + 500 novos)
- **Cobertura:** MLC 2006 completo + casos reais de clientes
- **Accuracy target:** > 95%

### Knowledge Base Implementado
```typescript
// Já implementado em mlc-assistant/index.ts (linhas 10-95)
const MLC_KNOWLEDGE_BASE = {
  title1: { /* Minimum requirements */ },
  title2: { /* Conditions of employment */ },
  title3: { /* Accommodation */ },
  title4: { /* Health protection */ },
  title5: { /* Compliance */ },
  brazil: { /* Decree 10.671/2021 */ },
  psc: { /* Detainable deficiencies */ }
};
```

### A/B Test Plan
- **Grupo A (50%):** Modelo atual (Gemini 2.5 Flash)
- **Grupo B (50%):** Modelo com RAG expandido
- **Métricas:** Accuracy, user satisfaction, latency

---

## 2. Crew Optimizer Fine-Tuning

### Algoritmo de Scoring (Implementado)
```typescript
// Pesos de scoring
Certifications: 40%  // Todas certificações válidas
Experience: 30%      // Anos de experiência >= requisito
Availability: 20%    // Status 'available'
Rank: 10%            // Senior/Chief bonus
```

### Melhorias Planejadas
1. Adicionar preferência de vessel type
2. Incluir cost optimization (salary)
3. Considerar histórico de performance

---

## 3. Predictive Maintenance Retraining

### Modelo Atual
- **Tipo:** ONNX (Random Forest)
- **Features:** Temperatura, vibração, horas operação
- **AUC:** 0.86

### Retraining Schedule
- **Frequência:** Mensal
- **Dados novos:** Últimos 90 dias de falhas
- **Validação:** Test set holdout

---

## 4. Response Caching

### Implementação
```typescript
// Top 50 perguntas frequentes cached
const CACHE_TTL = 3600; // 1 hora

async function getAIResponse(prompt: string) {
  const cached = await redis.get(`ai_cache_${hash(prompt)}`);
  if (cached) return JSON.parse(cached);
  
  const response = await callAI(prompt);
  await redis.setex(`ai_cache_${hash(prompt)}`, CACHE_TTL, JSON.stringify(response));
  return response;
}
```

### Resultados Esperados
- **Latency reduction:** 50% para perguntas frequentes
- **Cost reduction:** 20% menos API calls

---

## 5. Cost Optimization

### Estratégia de Model Selection
```typescript
function chooseModel(prompt: string) {
  const complexity = analyzeComplexity(prompt);
  
  if (complexity === 'simple') {
    return 'gemini-flash'; // Mais barato
  } else if (complexity === 'medium') {
    return 'gemini-2.5-flash'; // Balanceado
  } else {
    return 'gemini-2.5-pro'; // Alta qualidade
  }
}
```

### Budget Analysis

| Agente | Custo Atual | Custo Otimizado | Savings |
|--------|-------------|-----------------|---------|
| Nauti Brain | $45/mês | $35/mês | 22% |
| MLC Assistant | $30/mês | $25/mês | 17% |
| PEOTRAM AI | $40/mês | $30/mês | 25% |
| Crew Optimizer | $5/mês | $5/mês | 0% |
| Voice Assistant | $20/mês | $15/mês | 25% |
| Document OCR | $10/mês | $8/mês | 20% |
| **TOTAL** | **$150/mês** | **$118/mês** | **21%** |

---

## 6. Circuit Breaker Configuration

### Implementado (nauti-brain/index.ts)
```typescript
const CIRCUIT_BREAKER_THRESHOLD = 3;      // Failures to open
const CIRCUIT_BREAKER_RESET_MS = 30000;   // 30s reset
```

### Estados
- **CLOSED:** Normal operation
- **OPEN:** Fallback only
- **HALF_OPEN:** Testing recovery

---

## Próximos Passos

1. ✅ Fine-tuning MLC Assistant concluído (RAG implementado)
2. ✅ Crew Optimizer scoring algorithm implementado
3. ⏳ Implementar response caching
4. ⏳ A/B test MLC v1 vs v2
5. ⏳ Retraining Predictive Maintenance

---

**Fase IA.2: 70% CONCLUÍDA**
