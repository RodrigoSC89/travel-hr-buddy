# Fleet AI - Especialista em Gestão de Frota

## Visão Geral

O **Fleet AI** é o assistente especializado em gestão de frota marítima do Nautilus One, oferecendo suporte para monitoramento, performance e otimização operacional.

## Características

| Atributo | Valor |
|----------|-------|
| **Modelo** | Google Gemini 2.5 Flash |
| **Especialização** | Gestão de frota, performance, otimização |
| **Voice Mode** | ✅ Habilitado (60 palavras max) |
| **Idiomas** | PT-BR, EN, ES |

## Domínios de Conhecimento

- Fleet management systems
- KPIs operacionais marítimos
- Utilization e scheduling
- Dry-docking planning
- OPEX/CAPEX analysis
- Benchmarking de performance
- AIS tracking e monitoramento
- Voyage optimization

## Cenários de Interação

### 1. Consulta Comum
**Pergunta:** "Quais KPIs monitorar para performance de PSV?"  
**Resposta:** Utilização (target >85%), consumo específico (ton/dia), tempo de porto, velocidade média, confiabilidade técnica (MTBF), custo por milha, pontualidade de entrega, disponibilidade comercial.

### 2. Emergência
**Pergunta:** "Embarcação fora de posição AIS há 6 horas!"  
**Resposta:** Contate imediatamente via VHF/Satcom. Verifique última posição conhecida. Acione protocolo MRCC se sem contato. Notifique charterer e segurador. Prepare relatório de incidente.

### 3. Análise Complexa
**Pergunta:** "Compare performance operacional da frota Q3 vs Q2."  
**Resposta:** *Análise comparativa de utilização, consumo, custos operacionais, disponibilidade técnica, receita por embarcação e recomendações de otimização.*

## Uso via API

```typescript
const response = await fetch('/functions/v1/ai-hub-chat', {
  method: 'POST',
  body: JSON.stringify({
    module: 'fleet',
    messages: [{ role: 'user', content: 'Pergunta sobre frota...' }],
    mode: 'chat'
  })
});
```

## Referências Normativas

- BIMCO Guidelines
- ISO 19847/19848 (Ship Data)
- IMO SEEMP
- EEXI/CII requirements
