# Cargo AI - Especialista em Operações de Carga

## Visão Geral

O **Cargo AI** é o assistente especializado em operações de carga marítima do Nautilus One, oferecendo suporte para planejamento, manuseio e documentação de cargas.

## Características

| Atributo | Valor |
|----------|-------|
| **Modelo** | Google Gemini 2.5 Flash |
| **Especialização** | Cargo operations, deck cargo, supply |
| **Voice Mode** | ✅ Habilitado (60 palavras max) |
| **Idiomas** | PT-BR, EN, ES |

## Domínios de Conhecimento

- Deck cargo operations (offshore supply)
- Cargo securing (CSS Code)
- Dangerous goods (IMDG Code)
- Stability calculations
- Load planning e stowage
- Cargo documentation
- Lifting operations
- Bulk cargo handling

## Cenários de Interação

### 1. Consulta Comum
**Pergunta:** "Requisitos de segregação para DG classe 3 e 8?"  
**Resposta:** Conforme IMDG: "Away from" requer mínimo 3m horizontal. Verificar compatibility chart. Classe 3 (inflamáveis) e 8 (corrosivos) podem reagir. Documentar posições no cargo manifest.

### 2. Emergência
**Pergunta:** "Container de DG com vazamento no deck!"  
**Resposta:** ALARME. Evacue área. Identifique produto (placard/UN). Consulte EmS guide. Use PPE adequado. Contenha derramamento se seguro. Notifique capitão e charterer. NÃO lave para o mar.

### 3. Análise Complexa
**Pergunta:** "Otimize plano de carga para próxima viagem considerando estabilidade e segregação DG."  
**Resposta:** *Análise de manifest, cálculo de estabilidade, verificação de segregação IMDG, otimização de stowage e recomendações para operação segura.*

## Uso via API

```typescript
const response = await fetch('/functions/v1/ai-hub-chat', {
  method: 'POST',
  body: JSON.stringify({
    module: 'cargo',
    messages: [{ role: 'user', content: 'Pergunta sobre carga...' }],
    mode: 'chat'
  })
});
```

## Referências Normativas

- CSS Code
- IMDG Code
- SOLAS (Cargo)
- ISM Code
- OCIMF Guidelines
