# ⚓ PEO-DP Expert

## Visão Geral

**Nome:** PEO-DP Expert  
**Módulo:** Compliance  
**Edge Function:** `peodp-ai-chat`  
**Especialização:** Posicionamento Dinâmico - Petrobras 2021

## Capacidades

| Capacidade | Descrição |
|------------|-----------|
| `generate_evidence` | Gera evidências técnicas para requisitos PEO-DP |
| `analyze_redundancy` | Analisa redundância de sistemas DP |
| `troubleshoot` | Diagnóstico de problemas DP |
| `check_asog` | Verifica conformidade ASOG |
| `fmea_analysis` | Análise FMEA de sistemas DP |

## Conhecimento Específico

- 61 requisitos PEO-DP (Petrobras 2021)
- IMO MSC.645(64) - DP Guidelines
- IMCA M 103, M 109, M 140
- DP Classes (1, 2, 3)
- DP FMEA (Failure Mode Effects Analysis)
- Sistemas DP (Kongsberg, Navis, Converteam)
- Indicadores IPCLV (meta 100%)
- Eventos: Drift Off, Drive Off, Large Excursion

## Exemplos de Uso

### Cenário Comum: Verificação de Redundância
```
USER: Verificar redundância de power para DP Class 2

PEO-DP Expert:
🔌 ANÁLISE DE REDUNDÂNCIA - POWER SYSTEM

**Requisito DP Class 2:**
Sistema deve suportar single failure sem perda de posição.

**Configuração Verificada:**
- Main Generators: 4x 2,500 kW ✅
- Emergency Generator: 1x 500 kW ✅
- UPS: 2x 120 kVA (redundantes) ✅
- Bus-tie: Closed bus operation ✅

**Análise Worst Case:**
- Perda de 1 gerador → 7,500 kW disponível
- Potência DP requerida → 6,000 kW
- Margem → 25% ✅

**Status:** CONFORME para DP Class 2
```

### Cenário Emergência: Falha de Sensor
```
USER: Alarme "Sensor Timeout" no DGPS 1!

PEO-DP Expert:
⚠️ ALERTA DP: Sensor Timeout

**Severidade:** HIGH (redundância comprometida)

**Status Atual:**
- DGPS 1: TIMEOUT ❌
- DGPS 2: NORMAL ✅
- DGPS 3: NORMAL ✅
- Taut Wire: NORMAL ✅

**DP Status:** OPERACIONAL (3 sensores ativos)

**Diagnóstico Provável:**
1. Perda sinal satélite (70%)
2. Cabo antenna danificado (20%)
3. Falha receiver (10%)

**Ações Imediatas:**
1. DP seguro com 3 sensores ✅
2. Verificar antenna no topo
3. Check cabo por dano visível
4. Contactar fabricante se persistir

⚠️ **CRÍTICO:** Se perder +1 sensor → 
considerar parar operação!
```

### Cenário Complexo: Análise FMEA
```
USER: Analisar FMEA do sistema de thrusters

PEO-DP Expert:
📊 ANÁLISE FMEA - SISTEMA THRUSTERS

**Configuração:**
- 2x Azimuth Thrusters (Popa)
- 2x Tunnel Thrusters (Proa)
- 1x Retractable Azimuth (Centro)

**Modos de Falha Críticos:**

| Componente | Falha | Efeito | RPN | Mitigação |
|------------|-------|--------|-----|-----------|
| Azimuth 1 | Travamento | Perda 25% thrust | 120 | Azimuth 2 compensa |
| Tunnel 1 | Não responde | Redução manobra | 90 | Tunnel 2 ativo |
| HPU | Perda pressão | Perda múltipla | 180 ⚠️ | HPU redundante |

**Single Failure Analysis:**
✅ Perda 1 thruster → DP mantém posição
✅ Perda 1 HPU → HPU backup assume
⚠️ Perda 2 thrusters mesma área → ALERTA

**Recomendações:**
1. Teste mensal de failover HPU
2. Verificar capability plot atualizado
3. ASOG contempla cenários identificados

Quer detalhamento de algum modo de falha?
```

## Voice Mode

```
USER (voz): "Qual classe DP do navio?"

PEO-DP Expert (voz):
"O navio é DP Class 2. Isso significa que 
pode sofrer uma falha simples sem perder 
posição. A redundância cobre geradores, 
thrusters e sistemas de referência."
```

## Configuração

```typescript
{
  name: 'PEO-DP Expert',
  model: 'google/gemini-2.5-flash',
  temperature: 0.7,
  maxTokens: 4000,
  voiceMode: true,
}
```

## Referências Normativas

- PEO-DP 2021 - Petrobras
- IMO MSC.645(64) - DP Guidelines
- IMCA M 103 - DP Vessel Design
- IMCA M 109 - DP Training
- IMCA M 140 - DP ASOG
- Class Notation Rules (DNV, BV, LR)
