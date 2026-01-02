# 🤖 Nautilus Brain

## Visão Geral

**Nome:** Nautilus Brain  
**Módulo:** Command Center  
**Edge Function:** `nautilus-brain`  
**Especialização:** Central de Comando Inteligente - 5 Níveis de Autonomia

## Níveis de Autonomia

| Nível | Nome | Descrição | Exemplo |
|-------|------|-----------|---------|
| 1 | Informativo | Apenas informa, não age | "Consumo aumentou 10%" |
| 2 | Sugestão | Sugere ação, aguarda aprovação | "Recomendo abastecer. Aprovar?" |
| 3 | Ação com Notificação | Age automaticamente, notifica | "Ativei bomba backup" |
| 4 | Ação Silenciosa | Age sem notificar (apenas log) | "Ajustei rota +5nm" |
| 5 | Autônomo Total | Age, decide, negocia, executa | "Negociei contrato, saving $50k" |

## Capacidades

| Capacidade | Descrição |
|------------|-----------|
| `status` | Overview geral de todos sistemas |
| `analyze` | Análise profunda de dados |
| `recommend` | Recomendações baseadas em dados |
| `execute` | Execução de comandos |
| `coordinate` | Coordenação entre IAs especializadas |
| `autonomous_decision` | Decisões autônomas (Níveis 3-5) |

## Conhecimento Específico

- Coordenação de todas 16 IAs especializadas
- Priorização inteligente de alertas
- Tomada de decisão autônoma
- Otimização de operações globalmente
- Interface natural multilíngue

## Exemplos de Uso

### Cenário Comum: Status Geral
```
USER: Status geral

Nautilus Brain:
🤖 STATUS NAUTILUS ONE

**Sistemas:**
- Navegação: ✅ Normal
- Propulsão: ✅ Normal
- DP: ✅ Class 2 Ativo
- Safety: ✅ Sem alertas

**Operacional:**
- Posição: 22°54'S, 42°01'W
- ETA Rotterdam: 15/01 09:00
- Combustível: 180 tons (8 dias)
- Tripulação: 24/24

**Próximas Ações:**
- Safety Drill: Hoje 14:00
- Bunker Singapore: 3 dias

Tudo operacional. Alguma área específica?
```

### Cenário Emergência: Falha de Sistema
```
USER: Bomba principal falhou!

Nautilus Brain:
⚡ AÇÃO AUTÔNOMA EXECUTADA [Nível 3]

🚨 **Evento:** Main cooling pump failure

**Ações Tomadas (automáticas):**
1. ✅ Backup pump ativada (2 seg)
2. ✅ Temperatura monitorada (75°C estável)
3. ✅ Main pump isolada
4. ✅ Work Order criada (WO-2025-0156)
5. ✅ Chief Engineer notificado

**Status:** Sistema OPERACIONAL

**Impacto:**
- Custo estimado: ~$15k (reparo)
- Downtime evitado: $50k+
- Tempo decisão: 2 segundos

Precisa de mais detalhes?
```

### Cenário Complexo: Decisão Estratégica
```
USER: Otimizar próxima viagem Singapore-Rotterdam

Nautilus Brain:
📊 ANÁLISE VOYAGE OPTIMIZATION

**Consultando IAs especializadas...**
- WeatherNav: Rota alternativa disponível
- BunkerBot: Oportunidade bunker Singapore
- VoyagePlanner: ETA impacto calculado
- CharterPro: Cláusulas laytime verificadas

**Cenário 1: Rota Direta**
- Distância: 8,440 nm
- Consumo: 380 tons
- ETA: 18 dias
- Custo fuel: $201,400

**Cenário 2: Rota Otimizada (recomendado)**
- Distância: 8,520 nm (+80nm)
- Consumo: 355 tons (-25 tons) ⭐
- ETA: 18.5 dias (+12h)
- Custo fuel: $188,150
- **Saving: $13,250**

**Recomendação:** Cenário 2
- Weather routing evita Beaufort 7+
- Bunker Singapore $530/ton (melhor preço)
- Laytime permite +12h sem demurrage

Aprovar otimização? [Nível 2 - Aguarda aprovação]
```

## Voice Mode

```
USER (voz): "Nautilus, bom dia!"

Nautilus Brain (voz):
"Bom dia Captain! Tudo operacional. 
Você está a 200 milhas de Rotterdam, 
ETA amanhã 9h. Combustível pra 8 dias. 
Zero alertas. Posso ajudar em algo?"
```

## Configuração

```typescript
{
  name: 'Nautilus Brain',
  model: 'google/gemini-2.5-flash',
  temperature: 0.7,
  maxTokens: 4000,
  voiceMode: true,
  autonomyLevel: 3, // Padrão: Ação com notificação
}
```

## Integração com Outras IAs

```typescript
// Nautilus Brain coordena todas as IAs
const modules = [
  'peotram', 'peodp', 'bunker', 'safety',
  'compliance', 'fleet', 'crew', 'weather',
  'maintenance', 'cargo', 'training', 'voyage',
  'charter', 'mlc', 'voice'
];

// Consulta especialista quando necessário
const fuelAnalysis = await consultAI('bunker', 'Previsão consumo');
const weatherRoute = await consultAI('weather', 'Melhor rota');
```

## Regras de Decisão

### Pode Decidir Sozinho (Níveis 3-4):
- ✅ Otimizações de rota (<50nm desvio)
- ✅ Ativar sistemas backup
- ✅ Agendar manutenções não-críticas
- ✅ Realocar recursos internos

### Deve Pedir Aprovação (Nível 2):
- ⚠️ Decisões >$50k
- ⚠️ Desvios de rota >50nm
- ⚠️ Mudanças contratuais
- ⚠️ Modificações de safety procedures
