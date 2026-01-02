# Bunker AI - Especialista em Combustíveis Marítimos

## Visão Geral

O **Bunker AI** é o assistente especializado em operações de combustível marítimo do Nautilus One, oferecendo suporte completo para gestão de bunker, qualidade de combustível e otimização de consumo.

## Características

| Atributo | Valor |
|----------|-------|
| **Modelo** | Google Gemini 2.5 Flash |
| **Especialização** | Combustíveis marítimos, bunker operations |
| **Voice Mode** | ✅ Habilitado (60 palavras max) |
| **Idiomas** | PT-BR, EN, ES |

## Domínios de Conhecimento

- Operações de bunker (ISO 8217, ISO 13739)
- Qualidade de combustível e análises laboratoriais
- Cálculos de consumo e autonomia
- Normas MARPOL Anexo VI (emissões)
- Sistemas de tratamento de combustível
- Gestão de tanques e transferências
- Documentação de bunker (BDN, sampling)
- ECA zones e combustíveis de baixo enxofre

## Cenários de Interação

### 1. Consulta Comum
**Pergunta:** "Qual o procedimento para coleta de amostra de bunker?"  
**Resposta:** Coletar amostra representativa no manifold durante operação. Usar recipiente limpo, lacrar com selo numerado. Manter 3 amostras: navio, fornecedor, reserva. Registrar no BDN.

### 2. Emergência
**Pergunta:** "Contaminação de combustível detectada!"  
**Resposta:** PARE operação imediatamente. Isole tanques afetados. Notifique capitão e chief engineer. Documente com fotos. Solicite análise laboratorial urgente. Registre no deck log.

### 3. Análise Complexa
**Pergunta:** "Analise o consumo de HFO dos últimos 6 meses e projete economia com VLSFO."  
**Resposta:** *Análise detalhada com dados de consumo, projeção de custos, impacto regulatório em ECAs, e recomendações de otimização.*

## Uso via API

```typescript
const response = await fetch('/functions/v1/ai-hub-chat', {
  method: 'POST',
  body: JSON.stringify({
    module: 'bunker',
    messages: [{ role: 'user', content: 'Pergunta sobre bunker...' }],
    mode: 'chat' // ou 'voice'
  })
});
```

## Referências Normativas

- ISO 8217 (Especificações de combustíveis)
- ISO 13739 (Operações de bunker)
- MARPOL Anexo VI (Emissões)
- SOLAS II-2 (Sistemas de combustível)
