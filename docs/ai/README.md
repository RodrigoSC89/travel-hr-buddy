# 🤖 Nautilus One - Sistema de IAs Especializadas

## Visão Geral

O Nautilus One possui **16 IAs especializadas** para diferentes domínios marítimos, todas treinadas com conhecimento profundo do setor e integradas via Lovable AI Gateway.

## Arquitetura

```
┌─────────────────────────────────────────────────────────────────────┐
│                        NAUTILUS ONE                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐             │
│  │  PEOTRAM    │    │   PEO-DP    │    │  COMMAND    │             │
│  │  Expert     │    │   Expert    │    │   Brain     │             │
│  └─────────────┘    └─────────────┘    └─────────────┘             │
│                                                                      │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐             │
│  │    ARIA     │    │  BunkerBot  │    │ SafetyGuard │             │
│  │   Voice     │    │             │    │             │             │
│  └─────────────┘    └─────────────┘    └─────────────┘             │
│                                                                      │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐             │
│  │ Compliance  │    │   Fleet     │    │    Crew     │             │
│  │   Guard     │    │   Master    │    │   Master    │             │
│  └─────────────┘    └─────────────┘    └─────────────┘             │
│                                                                      │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐             │
│  │  WeatherNav │    │ Maintenance │    │   Cargo     │             │
│  │             │    │    Pro      │    │   Master    │             │
│  └─────────────┘    └─────────────┘    └─────────────┘             │
│                                                                      │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐             │
│  │  Training   │    │   Voyage    │    │  Charter    │             │
│  │   Mentor    │    │   Planner   │    │    Pro      │             │
│  └─────────────┘    └─────────────┘    └─────────────┘             │
│                                                                      │
│  ┌─────────────┐                                                    │
│  │  MLC Guard  │                                                    │
│  │             │                                                    │
│  └─────────────┘                                                    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────────┐
│              LOVABLE AI GATEWAY                                      │
│              (Gemini 2.5 Flash / GPT-5)                             │
└─────────────────────────────────────────────────────────────────────┘
```

## Lista de IAs

| # | Nome | Módulo | Especialização | Edge Function |
|---|------|--------|----------------|---------------|
| 1 | PEOTRAM Expert | Compliance | Auditorias PEOTRAM Petrobras | peotram-ai-chat |
| 2 | PEO-DP Expert | Compliance | Posicionamento Dinâmico | peodp-ai-chat |
| 3 | Nautilus Brain | Command | Central de Comando Inteligente | nautilus-brain |
| 4 | ARIA | Voice | Assistente de Voz Marítimo | voice-assistant-chat |
| 5 | BunkerBot | Bunker | Gestão de Combustível | bunker-ai |
| 6 | SafetyGuard | Safety | Segurança Marítima e HSEQ | safety-ai |
| 7 | ComplianceGuard | Compliance | Conformidade Regulatória | compliance-ai |
| 8 | FleetMaster | Fleet | Gestão de Frota | fleet-ai-copilot |
| 9 | CrewMaster | Crew | Gestão de Tripulação e STCW | crew-ai-copilot |
| 10 | WeatherNav | Weather | Meteorologia Marítima | weather-ai-copilot |
| 11 | MaintenancePro | Maintenance | Manutenção Preditiva | ai-predictive-maintenance |
| 12 | CargoMaster | Cargo | Gestão de Carga e Estabilidade | cargo-management-ai |
| 13 | TrainingMentor | Training | Treinamento Marítimo | training-ai-assistant |
| 14 | VoyagePlanner | Voyage | Planejamento de Viagens | voyage-ai-copilot |
| 15 | CharterPro | Charter | Charter Party e Contratos | charter-party-ai |
| 16 | MLCGuard | MLC | Maritime Labour Convention | mlc-assistant |

## Documentação Individual

- [PEOTRAM Expert](./PEOTRAM_AI.md) - Auditorias Petrobras
- [PEO-DP Expert](./PEODP_AI.md) - Posicionamento Dinâmico
- [Nautilus Brain](./COMMAND_AI.md) - Central de Comando
- [ARIA Voice](./VOICE_AI.md) - Assistente de Voz
- [BunkerBot](./BUNKER_AI.md) - Gestão de Combustível
- [SafetyGuard](./SAFETY_AI.md) - Segurança HSEQ
- [ComplianceGuard](./COMPLIANCE_AI.md) - Conformidade Regulatória
- [FleetMaster](./FLEET_AI.md) - Gestão de Frota
- [CrewMaster](./CREW_AI.md) - Gestão de Tripulação
- [WeatherNav](./WEATHER_AI.md) - Meteorologia
- [MaintenancePro](./MAINTENANCE_AI.md) - Manutenção Preditiva
- [CargoMaster](./CARGO_AI.md) - Gestão de Carga
- [TrainingMentor](./TRAINING_AI.md) - Treinamento
- [VoyagePlanner](./VOYAGE_AI.md) - Planejamento de Viagens
- [CharterPro](./CHARTER_AI.md) - Charter Party
- [MLCGuard](./MLC_AI.md) - Maritime Labour Convention

## Configuração Padrão

Todas as IAs utilizam:

```typescript
{
  model: 'google/gemini-2.5-flash',
  temperature: 0.7,
  maxTokens: 4000,
  voiceMode: true, // Suporte a comandos de voz
}
```

## Voice Mode

Todas as 16 IAs suportam **Voice Mode** com:

- Respostas otimizadas para síntese de voz (máx. 60 palavras)
- Integração ElevenLabs HD
- Suporte trilíngue: PT-BR, EN, ES
- Comandos naturais por voz

## Exemplos de Uso

### Via Chat
```typescript
const response = await supabase.functions.invoke('peotram-ai-chat', {
  body: { 
    messages: [{ role: 'user', content: 'Gerar evidência para item 4.2' }],
    context: { vesselId: 'abc123' }
  }
});
```

### Via Voz
```typescript
// Transcrição: "Explica o elemento 4 do PEOTRAM"
const response = await supabase.functions.invoke('voice-assistant-chat', {
  body: { 
    text: 'Explica o elemento 4 do PEOTRAM',
    module: 'peotram'
  }
});
```

## Testes Automatizados

Execute os testes:

```bash
npm run test -- src/lib/ai-prompts/__tests__/ai-prompts.test.ts
```

Cobertura:
- ✅ Estrutura de configuração
- ✅ Conteúdo dos prompts
- ✅ Conhecimento de domínio
- ✅ Voice mode
- ✅ Formato de resposta
- ✅ Regras de segurança
- ✅ Exemplos de interação

## Contribuindo

Para adicionar uma nova IA:

1. Crie o arquivo em `src/lib/ai-prompts/[nome]-ai-prompt.ts`
2. Siga o template padrão com todas as seções obrigatórias
3. Exporte no `index.ts`
4. Adicione aos testes
5. Crie documentação em `docs/ai/`
