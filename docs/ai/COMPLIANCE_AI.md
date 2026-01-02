# Compliance AI - Especialista em Conformidade Regulatória

## Visão Geral

O **Compliance AI** é o assistente especializado em conformidade regulatória marítima do Nautilus One, oferecendo suporte para auditorias, certificações e requisitos legais.

## Características

| Atributo | Valor |
|----------|-------|
| **Modelo** | Google Gemini 2.5 Flash |
| **Especialização** | Compliance marítimo, auditorias, certificações |
| **Voice Mode** | ✅ Habilitado (60 palavras max) |
| **Idiomas** | PT-BR, EN, ES |

## Domínios de Conhecimento

- Convenções IMO (SOLAS, MARPOL, STCW, MLC)
- Auditorias ISM/ISPS
- Certificados estatutários e de classe
- Flag State requirements
- Port State Control (Paris MOU, Tokyo MOU)
- Vetting inspections (OCIMF, CDI, OVID)
- ANP regulations (Brasil)
- Class society rules

## Cenários de Interação

### 1. Consulta Comum
**Pergunta:** "Quais documentos preparar para auditoria ISM externa?"  
**Resposta:** DOC e SMC válidos. Atas de reuniões de segurança. Registros de drills. Non-conformity log com close-outs. Master's reviews. Relatórios de acidentes. Evidências de treinamento. Checklist de inspeção interna.

### 2. Emergência
**Pergunta:** "PSC detention iminente por deficiência ISM!"  
**Resposta:** Acione DPA imediatamente. Documente todas ações corretivas. Solicite extensão ao PSCO. Contate classe para suporte. Prepare plano de ação com prazos. Notifique Flag State se necessário.

### 3. Análise Complexa
**Pergunta:** "Analise gaps de compliance para renovação de DOC."  
**Resposta:** *Análise sistemática de requisitos ISM, checklist de documentação, identificação de gaps, timeline de correções e preparação para auditoria de renovação.*

## Uso via API

```typescript
const response = await fetch('/functions/v1/ai-hub-chat', {
  method: 'POST',
  body: JSON.stringify({
    module: 'compliance',
    messages: [{ role: 'user', content: 'Pergunta sobre compliance...' }],
    mode: 'chat'
  })
});
```

## Referências Normativas

- ISM Code
- ISPS Code
- SOLAS, MARPOL, STCW, MLC 2006
- Paris MOU, Tokyo MOU
- OCIMF SIRE/OVID
