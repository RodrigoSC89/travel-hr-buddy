# Funcionalidades de IA

## Visão Geral

O sistema utiliza IA para automatizar tarefas, gerar insights e auxiliar decisões.

## Componentes

### 1. Chat IA (`src/modules/intelligence/ai-chat/`)

Assistente conversacional para:
- Tirar dúvidas sobre o sistema
- Gerar documentos
- Analisar dados
- Sugerir ações

```typescript
import { useAIChat } from "@/modules/intelligence/ai-chat";

const { sendMessage, messages, isLoading } = useAIChat();
await sendMessage("Gere um relatório de compliance");
```

### 2. Alertas Inteligentes (`src/modules/intelligence/smart-alerts/`)

Detecção automática de:
- Documentos vencendo
- Anomalias em métricas
- Pendências críticas
- Padrões de risco

### 3. OCR e Extração (`src/services/ocr-service.ts`)

Processamento de documentos:
- Extração de texto de imagens
- Reconhecimento de formulários
- Classificação automática

```typescript
import { performOCR } from "@/services/ocr-service";

const text = await performOCR(imageFile);
```

### 4. Análise Preditiva (`src/modules/intelligence/predictive/`)

Previsões baseadas em dados:
- Manutenção de equipamentos
- Consumo de combustível
- Tendências de compliance

## Modelos Utilizados

| Serviço | Modelo | Uso |
|---------|--------|-----|
| OpenAI | GPT-4 | Chat, geração de texto |
| TensorFlow.js | Custom | Análise de imagens |
| ONNX Runtime | Custom | Inferência local |
| Tesseract.js | - | OCR |

## Configuração

### API Keys

```env
OPENAI_API_KEY=sk-xxx
```

### Edge Functions

As funções de IA estão em `supabase/functions/`:
- `ai-chat` - Chat principal
- `ai-analyze` - Análise de dados
- `ai-generate` - Geração de conteúdo

## Boas Práticas

1. **Cache respostas** frequentes
2. **Limite tokens** por request
3. **Fallback local** quando API falha
4. **Log de uso** para custos
