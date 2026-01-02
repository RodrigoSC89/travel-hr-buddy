# 📋 PEOTRAM Expert

## Visão Geral

**Nome:** PEOTRAM Expert  
**Módulo:** Compliance  
**Edge Function:** `peotram-ai-chat`  
**Especialização:** Auditorias PEOTRAM Petrobras - 13 Elementos

## Capacidades

| Capacidade | Descrição |
|------------|-----------|
| `generate_evidence` | Gera evidências técnicas para itens de auditoria |
| `explain_element` | Explica elementos e itens do PEOTRAM |
| `create_action_plan` | Cria planos de ação para não-conformidades |
| `simulate_audit` | Simula cenários de auditoria |
| `voice_chat` | Assistência por voz contextualizada |

## Conhecimento Específico

- 13 Elementos do PEOTRAM (ciclo 2024)
- 84+ itens de verificação
- Elementos 4 e 6 (CRÍTICOS - maior peso: 25% cada)
- Normas ANP, ISM Code, ISPS Code, SOLAS
- Procedimentos Petrobras

## Exemplos de Uso

### Cenário Comum: Consulta sobre Item
```
USER: Quais evidências preciso para o item 4.2?

PEOTRAM Expert:
📋 EVIDÊNCIAS PARA ITEM 4.2 - Treinamento de Segurança

**Documentos Necessários:**
1. Training Matrix atualizada
2. Certificados STCW válidos
3. Registros de Safety Drills (últimos 6 meses)
4. Safety Meeting Minutes
5. Avaliação de eficácia documentada

**Dica:** Elemento 4 é CRÍTICO (25% da nota). 
Garanta 100% de conformidade!
```

### Cenário Emergência: Não-Conformidade Crítica
```
USER: Auditor encontrou NC crítica no elemento 6!

PEOTRAM Expert:
🚨 ALERTA CRÍTICO - Elemento 6

⚠️ **Severidade:** ALTA (afeta 25% da nota final)

**Ações Imediatas:**
1. Documentar NC com evidências fotográficas
2. Elaborar plano de ação imediato (24h)
3. Notificar DPO e gerência
4. Implementar medida contenção

**Próximos Passos:**
- Análise de causa raiz (RCA)
- Prazo máximo correção: 30 dias
- Verificação eficácia obrigatória

Posso gerar o plano de ação detalhado?
```

### Cenário Complexo: Análise Comparativa
```
USER: Compara nosso score atual com meta Petrobras

PEOTRAM Expert:
📊 ANÁLISE COMPARATIVA PEOTRAM

**Seu Score Atual:** 78 pontos
**Meta Petrobras:** 85 pontos
**Gap:** -7 pontos

**Elementos Críticos (maior impacto):**
| Elemento | Atual | Meta | Gap |
|----------|-------|------|-----|
| 4 - Gestão | 72% | 90% | -18% ⚠️ |
| 6 - Riscos | 75% | 90% | -15% ⚠️ |

**Recomendação Prioritária:**
Foco imediato nos elementos 4 e 6 - representam 
50% da nota e têm maior gap.

**Plano de Recuperação:**
1. Revisão Training Matrix (Elem. 4)
2. Atualização Risk Assessment (Elem. 6)
3. Simulação de auditoria em 15 dias

Quer o plano detalhado por elemento?
```

## Voice Mode

Quando ativado, respostas são otimizadas para síntese de voz:

```
USER (voz): "Explica o elemento 4"

PEOTRAM Expert (voz): 
"O Elemento 4 trata de Gestão de Segurança. 
É crítico, valendo 25% da nota final. 
Foca em treinamento, procedimentos de emergência 
e competência da tripulação. 
Quer que detalhe os itens?"
```

## Configuração

```typescript
{
  name: 'PEOTRAM Expert',
  model: 'google/gemini-2.5-flash',
  temperature: 0.7,
  maxTokens: 4000,
  voiceMode: true,
}
```

## Integração

```typescript
import { supabase } from '@/integrations/supabase/client';

const response = await supabase.functions.invoke('peotram-ai-chat', {
  body: {
    messages: [{ role: 'user', content: 'Gerar evidência item 4.2' }],
    context: {
      vesselId: 'vessel-123',
      auditId: 'audit-456',
      element: 4,
      item: '4.2'
    }
  }
});
```

## Referências Normativas

- PEOTRAM 2024 - Petrobras
- ISM Code - IMO
- ISPS Code - IMO
- SOLAS - IMO
- ANP Regulamentos
- STCW 2010 (amended)
