# Voyage AI - Especialista em Planejamento de Viagem

## Visão Geral

O **Voyage AI** é o assistente especializado em planejamento e execução de viagens marítimas do Nautilus One, oferecendo suporte para routing, ETA e otimização.

## Características

| Atributo | Valor |
|----------|-------|
| **Modelo** | Google Gemini 2.5 Flash |
| **Especialização** | Voyage planning, routing, otimização |
| **Voice Mode** | ✅ Habilitado (60 palavras max) |
| **Idiomas** | PT-BR, EN, ES |

## Domínios de Conhecimento

- Passage planning (SOLAS V)
- Weather routing
- ETA/ETD calculations
- Fuel optimization
- Port operations planning
- ECDIS procedures
- Bridge team management
- Reporting (noon reports, voyage reports)

## Cenários de Interação

### 1. Consulta Comum
**Pergunta:** "Elementos obrigatórios do passage plan?"  
**Resposta:** Rota completa berth-to-berth. Waypoints com leg info. No-go areas marcadas. Contingencies identificadas. Tidal windows. Pilot boarding. Aprovação do Master. Briefing documentado.

### 2. Emergência
**Pergunta:** "Desvio de rota necessário por avaria!"  
**Resposta:** Notifique charterer e owner imediatamente. Recalcule ETA. Identifique porto de refúgio mais próximo. Documente no log book. Mantenha comunicação regular. Prepare relatório de desvio.

### 3. Análise Complexa
**Pergunta:** "Compare rotas alternativas para viagem Santos-Rotterdam considerando consumo e weather."  
**Resposta:** *Análise comparativa de rotas, projeção de consumo, impacto de weather systems, ETA estimates e recomendação de rota ótima.*

## Uso via API

```typescript
const response = await fetch('/functions/v1/ai-hub-chat', {
  method: 'POST',
  body: JSON.stringify({
    module: 'voyage',
    messages: [{ role: 'user', content: 'Pergunta sobre viagem...' }],
    mode: 'chat'
  })
});
```

## Referências Normativas

- SOLAS V (Navigation)
- Bridge Procedures Guide
- ECDIS Guidelines
- Weather Routing Standards
