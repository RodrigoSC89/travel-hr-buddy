# MMI Copilot with Resolved Actions - Usage Guide

## Overview

The MMI Copilot with Resolved Actions is an AI-powered maintenance recommendation system that learns from historical maintenance data to provide better suggestions for maritime maintenance tasks.

## Features

1. **Historical Context Learning**: Queries past effective maintenance actions for specific components
2. **AI-Powered Recommendations**: Uses GPT-4 to generate context-aware suggestions
3. **Streaming Support**: Real-time response streaming for better UX
4. **Continuous Learning**: Records new actions to improve future recommendations
5. **Component-Specific**: Targets recommendations based on component type

## API Functions

### 1. getCopilotRecommendation()

Simple request/response pattern for getting AI recommendations.

```typescript
import { getCopilotRecommendation } from "@/services/mmi/copilotApi";

const recommendation = await getCopilotRecommendation({
  prompt: "Manutenção preventiva do sistema hidráulico necessária",
  componente: "Sistema Hidráulico Principal"
});

console.log(recommendation.reply);
console.log(recommendation.historicalContext); // Past effective actions
```

### 2. getCopilotRecommendationStreaming()

Real-time streaming for progressive response display.

```typescript
import { getCopilotRecommendationStreaming } from "@/services/mmi/copilotApi";

await getCopilotRecommendationStreaming(
  {
    prompt: "Gerador com ruído anormal",
    componente: "Gerador Principal"
  },
  (chunk) => {
    // Update UI with each chunk
    console.log(chunk);
    setResponse(prev => prev + chunk);
  }
);
```

### 3. getHistoricalActions()

Query past effective actions for a component.

```typescript
import { getHistoricalActions } from "@/services/mmi/copilotApi";

const actions = await getHistoricalActions(
  "Sistema Hidráulico Principal",
  3 // limit (default: 3)
);

actions.forEach(action => {
  console.log(`Ação: ${action.acao_realizada}`);
  console.log(`Causa: ${action.causa_confirmada}`);
  console.log(`Duração: ${action.duracao_execucao}`);
});
```

### 4. addResolvedAction()

Record new maintenance action for continuous learning.

```typescript
import { addResolvedAction } from "@/services/mmi/copilotApi";

const result = await addResolvedAction({
  os_id: "OS-2025-001",
  componente: "Sistema Hidráulico Principal",
  descricao_tecnica: "Vazamento detectado na válvula principal",
  acao_realizada: "Substituição completa da válvula e vedações",
  causa_confirmada: "Desgaste natural das vedações",
  efetiva: true,
  duracao_execucao: "2 hours",
  resolvido_em: new Date().toISOString(),
});

console.log(`Action recorded with ID: ${result.id}`);
```

## React Component Integration Example

```tsx
import React, { useState } from 'react';
import { 
  getCopilotRecommendationStreaming,
  addResolvedAction 
} from '@/services/mmi/copilotApi';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export const MaintenanceCopilot = () => {
  const [prompt, setPrompt] = useState('');
  const [componente, setComponente] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGetRecommendation = async () => {
    setIsLoading(true);
    setResponse('');
    
    try {
      await getCopilotRecommendationStreaming(
        { prompt, componente },
        (chunk) => {
          setResponse(prev => prev + chunk);
        }
      );
    } catch (error) {
      console.error('Error:', error);
      setResponse('Erro ao obter recomendação');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAction = async () => {
    try {
      await addResolvedAction({
        os_id: `OS-${Date.now()}`,
        componente,
        descricao_tecnica: prompt,
        acao_realizada: response,
        efetiva: true,
        resolvido_em: new Date().toISOString(),
      });
      alert('Ação salva com sucesso!');
    } catch (error) {
      console.error('Error saving action:', error);
    }
  };

  return (
    <div className="space-y-4 p-4">
      <div>
        <label>Componente:</label>
        <input
          value={componente}
          onChange={(e) => setComponente(e.target.value)}
          placeholder="Ex: Sistema Hidráulico Principal"
          className="w-full p-2 border rounded"
        />
      </div>
      
      <div>
        <label>Descrição do Problema:</label>
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Descreva o problema de manutenção..."
          rows={4}
        />
      </div>
      
      <Button 
        onClick={handleGetRecommendation}
        disabled={isLoading || !prompt}
      >
        {isLoading ? 'Processando...' : 'Obter Recomendação'}
      </Button>
      
      {response && (
        <div className="mt-4 p-4 bg-gray-50 rounded">
          <h3 className="font-bold mb-2">Recomendação AI:</h3>
          <pre className="whitespace-pre-wrap">{response}</pre>
          
          <Button 
            onClick={handleSaveAction}
            className="mt-4"
          >
            Salvar Ação Resolvida
          </Button>
        </div>
      )}
    </div>
  );
};
```

## Full Workflow Example

```typescript
import {
  getHistoricalActions,
  getCopilotRecommendation,
  addResolvedAction
} from '@/services/mmi/copilotApi';

async function maintenanceWorkflow() {
  const componente = "Motor Principal";
  
  // Step 1: Check historical actions
  console.log("=== Histórico de Ações ===");
  const history = await getHistoricalActions(componente, 5);
  history.forEach((action, i) => {
    console.log(`${i + 1}. ${action.acao_realizada} (Efetiva: ${action.efetiva})`);
  });
  
  // Step 2: Get AI recommendation
  console.log("\n=== Recomendação AI ===");
  const recommendation = await getCopilotRecommendation({
    prompt: "Motor apresentando vibração excessiva",
    componente
  });
  console.log(recommendation.reply);
  
  // Step 3: After performing maintenance, record the action
  console.log("\n=== Registrando Ação ===");
  const result = await addResolvedAction({
    os_id: "OS-2025-015",
    componente,
    descricao_tecnica: "Vibração excessiva detectada durante operação",
    acao_realizada: "Balanceamento do rotor e substituição de rolamentos",
    causa_confirmada: "Desbalanceamento e desgaste de rolamentos",
    efetiva: true,
    duracao_execucao: "4 hours",
    resolvido_em: new Date().toISOString()
  });
  
  console.log(`Ação registrada: ${result.id}`);
}

maintenanceWorkflow().catch(console.error);
```

## Benefits

### For Engineers:
- **Faster Decisions**: Access to proven solutions from past maintenance
- **Realistic Estimates**: Duration predictions based on actual historical data
- **Risk Reduction**: Avoid ineffective approaches that didn't work before
- **Knowledge Retention**: Institutional knowledge preserved in the system

### For the System:
- **Continuous Learning**: Every recorded action improves future recommendations
- **Pattern Recognition**: AI identifies patterns for each component type
- **Data-Driven**: Recommendations based on real-world effectiveness
- **Self-Improving**: Gets better over time with more data

## Technical Details

- **Database**: PostgreSQL with RLS policies for security
- **Edge Function**: Deno-based Supabase function for serverless execution
- **AI Model**: OpenAI GPT-4 with streaming support
- **Authentication**: Supabase auth required for all operations
- **Transport**: Server-Sent Events (SSE) for real-time streaming
- **Data Source**: `mmi_os_ia_feed` view for clean AI-ready data

## Error Handling

All functions throw errors that should be caught:

```typescript
try {
  const result = await getCopilotRecommendation({
    prompt: "Test",
    componente: "Test Component"
  });
} catch (error) {
  console.error("Failed to get recommendation:", error);
  // Handle error appropriately in your UI
}
```

## Testing

Run the comprehensive test suite:

```bash
npm test -- src/tests/mmi-copilot-with-resolved.test.ts
```

All 12 tests cover:
- Simple recommendations
- Streaming recommendations
- Historical action queries
- Action recording
- Error handling
- Full workflow integration

## Migration from Legacy Functions

If you're using the old `getCopilotSuggestions` or `streamCopilotSuggestions`:

```typescript
// Old way (deprecated)
await getCopilotSuggestions(prompt, onChunk);

// New way
await getCopilotRecommendation({ prompt });
// or
await getCopilotRecommendationStreaming({ prompt }, onChunk);
```

Legacy functions are still available for backward compatibility but are marked as deprecated.
