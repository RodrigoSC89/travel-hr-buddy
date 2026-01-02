# Weather AI - Especialista em Meteorologia Marítima

## Visão Geral

O **Weather AI** é o assistente especializado em meteorologia e oceanografia marítima do Nautilus One, oferecendo suporte para análise de condições metocean e planejamento operacional.

## Características

| Atributo | Valor |
|----------|-------|
| **Modelo** | Google Gemini 2.5 Flash |
| **Especialização** | Meteorologia marítima, oceanografia |
| **Voice Mode** | ✅ Habilitado (60 palavras max) |
| **Idiomas** | PT-BR, EN, ES |

## Domínios de Conhecimento

- Previsão meteorológica marítima
- Análise de ondas e swell
- Weather windows para operações
- Routing otimizado (weather routing)
- Ciclones tropicais e sistemas frontais
- Correntes oceânicas
- Operações sensíveis a metocean
- Critérios operacionais (Hs, Tp, vento)

## Cenários de Interação

### 1. Consulta Comum
**Pergunta:** "Limites metocean para operação de crane lift?"  
**Resposta:** Típico: Hs <2.0m, vento <25kn, período >6s. Verificar crane load chart específico. Considerar movimento do navio (roll/pitch). Consultar OIM e crane operator antes de iniciar.

### 2. Emergência
**Pergunta:** "Ciclone tropical se aproximando da área de operação!"  
**Resposta:** EVACUAÇÃO IMEDIATA se dentro de 500nm. Desligue operações. Prepare navio para mar pesado. Comunique todos stakeholders. Siga plano de contingência de furacão. Monitore atualizações a cada 6h.

### 3. Análise Complexa
**Pergunta:** "Analise janela de weather para operação de diving nos próximos 5 dias."  
**Resposta:** *Análise detalhada de previsão, identificação de weather windows, probabilidades de sucesso, alternativas de scheduling e recomendações operacionais.*

## Uso via API

```typescript
const response = await fetch('/functions/v1/ai-hub-chat', {
  method: 'POST',
  body: JSON.stringify({
    module: 'weather',
    messages: [{ role: 'user', content: 'Pergunta sobre metocean...' }],
    mode: 'chat'
  })
});
```

## Referências Normativas

- WMO Guidelines
- GOMO (Weather Criteria)
- IMCA M103/M117 (DP Operations)
- DNV-ST-N001
