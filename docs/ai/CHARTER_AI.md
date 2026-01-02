# Charter AI - Especialista em Contratos de Afretamento

## Visão Geral

O **Charter AI** é o assistente especializado em contratos de afretamento marítimo do Nautilus One, oferecendo suporte para charterparties, operações comerciais e disputes.

## Características

| Atributo | Valor |
|----------|-------|
| **Modelo** | Google Gemini 2.5 Flash |
| **Especialização** | Charter contracts, operações comerciais |
| **Voice Mode** | ✅ Habilitado (60 palavras max) |
| **Idiomas** | PT-BR, EN, ES |

## Domínios de Conhecimento

- Charterparty types (Time, Voyage, Bareboat)
- BIMCO standard forms
- SUPPLYTIME 2017
- Off-hire clauses
- Laytime calculations
- Performance warranties
- Insurance requirements
- Dispute resolution

## Cenários de Interação

### 1. Consulta Comum
**Pergunta:** "O que caracteriza evento de off-hire?"  
**Resposta:** Embarcação indisponível para serviço acordado. Causas: breakdown, drydock, detenção, falta de tripulação, bunker. Verificar definição específica no C/P. Documentar início/fim precisamente. Notificar charterer imediatamente.

### 2. Emergência
**Pergunta:** "Charterer alega performance abaixo do warranted!"  
**Resposta:** Colete evidências: noon reports, weather data, consumo real. Compare com warranty clause. Verifique good weather days. Documente condições de casco/hélice. Prepare defesa técnica. Contate P&I se necessário.

### 3. Análise Complexa
**Pergunta:** "Analise exposição financeira do contrato atual considerando cláusulas de off-hire e performance."  
**Resposta:** *Análise detalhada de cláusulas contratuais, histórico de eventos, cálculo de exposição financeira e recomendações de mitigação de riscos.*

## Uso via API

```typescript
const response = await fetch('/functions/v1/ai-hub-chat', {
  method: 'POST',
  body: JSON.stringify({
    module: 'charter',
    messages: [{ role: 'user', content: 'Pergunta sobre charter...' }],
    mode: 'chat'
  })
});
```

## Referências Normativas

- BIMCO Standard Forms
- SUPPLYTIME 2017
- English Law (Maritime)
- Arbitration Rules (LMAA)
