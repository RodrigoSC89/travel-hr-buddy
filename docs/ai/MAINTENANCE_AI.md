# Maintenance AI - Especialista em Manutenção Marítima

## Visão Geral

O **Maintenance AI** é o assistente especializado em manutenção de embarcações do Nautilus One, oferecendo suporte para PMS, troubleshooting e gestão de ativos.

## Características

| Atributo | Valor |
|----------|-------|
| **Modelo** | Google Gemini 2.5 Flash |
| **Especialização** | Manutenção marítima, PMS, reliability |
| **Voice Mode** | ✅ Habilitado (60 palavras max) |
| **Idiomas** | PT-BR, EN, ES |

## Domínios de Conhecimento

- Planned Maintenance Systems (PMS)
- Class requirements e surveys
- Troubleshooting de equipamentos
- Spare parts management
- Dry-docking planning
- Condition-based maintenance
- FMEA/RCM analysis
- Vendor management

## Cenários de Interação

### 1. Consulta Comum
**Pergunta:** "Intervalo de manutenção para main engine cylinder liners?"  
**Resposta:** Conforme maker: inspeção a cada 8.000h, substituição 16.000-24.000h dependendo de wear rate. Registrar readings de desgaste. Alinhar com class survey quando possível para otimizar custos.

### 2. Emergência
**Pergunta:** "Falha total de steering gear!"  
**Resposta:** PARADA DE MÁQUINAS. Acione emergency steering. Notifique bridge imediatamente. Investigue causa (hidráulica, elétrica, mecânica). Contate classe se necessário. Não navegue sem steering funcional.

### 3. Análise Complexa
**Pergunta:** "Projete budget de manutenção 2025 considerando dry-dock programado."  
**Resposta:** *Análise de histórico de custos, projeção de itens PMS, scope de dry-dock, spare parts strategy, e recomendações de otimização orçamentária.*

## Uso via API

```typescript
const response = await fetch('/functions/v1/ai-hub-chat', {
  method: 'POST',
  body: JSON.stringify({
    module: 'maintenance',
    messages: [{ role: 'user', content: 'Pergunta sobre manutenção...' }],
    mode: 'chat'
  })
});
```

## Referências Normativas

- Class Society Rules (DNV, BV, LR, ABS)
- SOLAS (Machinery)
- ISM Code (Maintenance)
- Maker's manuals
