# Safety AI - Especialista em Segurança Marítima

## Visão Geral

O **Safety AI** é o assistente especializado em segurança operacional marítima do Nautilus One, oferecendo suporte para gestão de riscos, investigação de incidentes e compliance HSEQ.

## Características

| Atributo | Valor |
|----------|-------|
| **Modelo** | Google Gemini 2.5 Flash |
| **Especialização** | Segurança marítima, HSEQ, investigação de incidentes |
| **Voice Mode** | ✅ Habilitado (60 palavras max) |
| **Idiomas** | PT-BR, EN, ES |

## Domínios de Conhecimento

- ISM Code (International Safety Management)
- Investigação de incidentes (IMCA, Flag State)
- Análise de riscos (HAZID, HAZOP, JSA)
- Permit to Work systems
- Emergency response procedures
- PPE requirements e normas
- Fatigue management (STCW)
- Near miss reporting e análise

## Cenários de Interação

### 1. Consulta Comum
**Pergunta:** "Como conduzir um toolbox talk efetivo?"  
**Resposta:** Reunir equipe no local de trabalho. Revisar JSA específica da tarefa. Identificar riscos e controles. Confirmar entendimento de todos. Documentar participantes e temas. Máximo 15 minutos.

### 2. Emergência
**Pergunta:** "Homem ao mar! Procedimento?"  
**Resposta:** ALARME MOB! Marcar posição GPS. Lançar boia/fumaça. Manobra de Williamson. FRC com equipe treinada. Comunicar Coastguard canal 16. Todos com coletes. Contagem de POB.

### 3. Análise Complexa
**Pergunta:** "Analise os near misses do trimestre e identifique tendências de risco."  
**Resposta:** *Análise estatística de near misses, identificação de padrões, root cause analysis, recomendações de ações preventivas e indicadores de performance.*

## Uso via API

```typescript
const response = await fetch('/functions/v1/ai-hub-chat', {
  method: 'POST',
  body: JSON.stringify({
    module: 'safety',
    messages: [{ role: 'user', content: 'Pergunta sobre segurança...' }],
    mode: 'chat'
  })
});
```

## Referências Normativas

- ISM Code
- IMCA SEL 034 (Incident Investigation)
- STCW (Work/Rest Hours)
- SOLAS (Emergency Procedures)
- IOGP 456 (Process Safety)
