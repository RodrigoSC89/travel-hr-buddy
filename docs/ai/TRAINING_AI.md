# Training AI - Especialista em Treinamento Marítimo

## Visão Geral

O **Training AI** é o assistente especializado em treinamento e desenvolvimento de competências marítimas do Nautilus One, oferecendo suporte para STCW, simuladores e certificações.

## Características

| Atributo | Valor |
|----------|-------|
| **Modelo** | Google Gemini 2.5 Flash |
| **Especialização** | Training marítimo, STCW, competências |
| **Voice Mode** | ✅ Habilitado (60 palavras max) |
| **Idiomas** | PT-BR, EN, ES |

## Domínios de Conhecimento

- STCW 2010 requirements
- Competency management systems
- Simulator training (ECDIS, DP, etc.)
- Drills planning e execution
- CBT (Computer-Based Training)
- Assessment e avaliação
- Training needs analysis
- Certificate revalidation

## Cenários de Interação

### 1. Consulta Comum
**Pergunta:** "Frequência obrigatória de drills SOLAS?"  
**Resposta:** Fire drill: mensal. Abandon ship: mensal. MOB: trimestral (recomendado mensal). Todos tripulantes devem participar em 2 semanas de embarque. Registrar no log book com detalhes.

### 2. Emergência
**Pergunta:** "Certificado STCW de officer vence em 5 dias!"  
**Resposta:** Contate Flag State/RO imediatamente para extensão. Pode haver grace period de até 3 meses. Oficer não pode assumir funções após vencimento. Planeje substituição se necessário.

### 3. Análise Complexa
**Pergunta:** "Desenvolva matriz de treinamento anual para frota de 10 embarcações."  
**Resposta:** *Análise de gaps de competência, cronograma de cursos obrigatórios, budget de treinamento, logística de rotação e indicadores de eficácia.*

## Uso via API

```typescript
const response = await fetch('/functions/v1/ai-hub-chat', {
  method: 'POST',
  body: JSON.stringify({
    module: 'training',
    messages: [{ role: 'user', content: 'Pergunta sobre treinamento...' }],
    mode: 'chat'
  })
});
```

## Referências Normativas

- STCW 2010
- ISM Code (Training)
- OPITO Standards
- Flag State requirements
