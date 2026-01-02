# MLC AI - Especialista em Convenção do Trabalho Marítimo

## Visão Geral

O **MLC AI** é o assistente especializado na Maritime Labour Convention 2006 do Nautilus One, oferecendo suporte para compliance trabalhista marítimo e welfare da tripulação.

## Características

| Atributo | Valor |
|----------|-------|
| **Modelo** | Google Gemini 2.5 Flash |
| **Especialização** | MLC 2006, direitos trabalhistas marítimos |
| **Voice Mode** | ✅ Habilitado (60 palavras max) |
| **Idiomas** | PT-BR, EN, ES |

## Domínios de Conhecimento

- MLC 2006 (5 Títulos, 14 Standards)
- Seafarer Employment Agreements
- Hours of work and rest
- Wages and leave entitlements
- Accommodation standards
- Health and medical care
- Complaints procedures
- Social security

## Cenários de Interação

### 1. Consulta Comum
**Pergunta:** "Requisitos de acomodação MLC para ratings?"  
**Resposta:** Mínimo 4.5m² por pessoa em camarote duplo. 6m² se single. Beliche máximo 2 pessoas. Ventilação e ar condicionado. Iluminação adequada. Sanitários proporcionais ao número de tripulantes.

### 2. Emergência
**Pergunta:** "Complaint de seafarer sobre non-payment de salários!"  
**Resposta:** Ative procedimento de reclamação do navio. Documente detalhadamente. Informe Master e DPA. Se não resolvido, tripulante pode recorrer a Flag State ou Port State. Evite retaliação.

### 3. Análise Complexa
**Pergunta:** "Audit de compliance MLC para certificação DMLC Part II."  
**Resposta:** *Análise sistemática dos 14 áreas da MLC, checklist de documentação, identificação de gaps, plano de ação corretiva e preparação para inspeção.*

## Uso via API

```typescript
const response = await fetch('/functions/v1/ai-hub-chat', {
  method: 'POST',
  body: JSON.stringify({
    module: 'mlc',
    messages: [{ role: 'user', content: 'Pergunta sobre MLC...' }],
    mode: 'chat'
  })
});
```

## Referências Normativas

- MLC 2006 (as amended)
- ILO Guidelines
- Flag State MLC implementation
- ITF Guidelines
