# Crew AI - Especialista em Gestão de Tripulação

## Visão Geral

O **Crew AI** é o assistente especializado em gestão de tripulação marítima do Nautilus One, oferecendo suporte para manning, certificações, welfare e compliance trabalhista.

## Características

| Atributo | Valor |
|----------|-------|
| **Modelo** | Google Gemini 2.5 Flash |
| **Especialização** | Crew management, MLC, STCW |
| **Voice Mode** | ✅ Habilitado (60 palavras max) |
| **Idiomas** | PT-BR, EN, ES |

## Domínios de Conhecimento

- MLC 2006 (Maritime Labour Convention)
- STCW 2010 (Certificações)
- Safe Manning Document
- Crew scheduling e rotation
- Medical fitness (ENG1, PADI)
- Training matrix e competências
- Payroll marítimo
- Welfare e repatriation

## Cenários de Interação

### 1. Consulta Comum
**Pergunta:** "Requisitos de certificação para Chief Officer?"  
**Resposta:** STCW II/2 (OOW 3000+GT). CoC válido do Flag State. GMDSS GOC. Medical fitness. Tanker endorsement se aplicável. Mínimo 12 meses como OOW. Curso de liderança recomendado.

### 2. Emergência
**Pergunta:** "Tripulante com emergência médica grave!"  
**Resposta:** Acione Radio Medical. Estabilize paciente conforme Ship Captain's Medical Guide. Prepare MEDEVAC se necessário. Documente tudo. Notifique P&I Club. Contate família via company.

### 3. Análise Complexa
**Pergunta:** "Projete necessidade de manning para 2025 considerando novas embarcações."  
**Resposta:** *Análise de headcount atual, projeção de demanda, matriz de competências requeridas, plano de recrutamento e treinamento, e budget de crew costs.*

## Uso via API

```typescript
const response = await fetch('/functions/v1/ai-hub-chat', {
  method: 'POST',
  body: JSON.stringify({
    module: 'crew',
    messages: [{ role: 'user', content: 'Pergunta sobre tripulação...' }],
    mode: 'chat'
  })
});
```

## Referências Normativas

- MLC 2006
- STCW 2010
- Flag State manning requirements
- ILO Guidelines
