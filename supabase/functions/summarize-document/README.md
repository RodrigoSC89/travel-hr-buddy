# Summarize Document Function

Esta função Supabase Edge utiliza a API do OpenAI para gerar resumos concisos de documentos fornecidos pelo usuário.

## Endpoint

```
POST /functions/v1/summarize-document
```

## Autenticação

Esta função aceita requisições públicas (não requer autenticação), mas utiliza a chave de API do OpenAI configurada nas variáveis de ambiente do Supabase.

## Request Body

```json
{
  "content": "string - Conteúdo do documento que você deseja resumir"
}
```

### Exemplo

```json
{
  "content": "Este é um documento longo sobre procedimentos de segurança em operações marítimas. Inclui informações sobre equipamentos de proteção individual, procedimentos de emergência, protocolos de comunicação e boas práticas de navegação..."
}
```

## Response

### Sucesso (200 OK)

```json
{
  "summary": "string - Resumo conciso do documento",
  "timestamp": "string - ISO 8601 timestamp"
}
```

### Erro (400 Bad Request)

```json
{
  "error": "string - Mensagem de erro",
  "timestamp": "string - ISO 8601 timestamp"
}
```

## Características

- **Modelo**: GPT-4 para máxima qualidade
- **Temperature**: 0.5 para respostas mais consistentes
- **Max Tokens**: 1000 tokens
- **Retry Logic**: 3 tentativas com exponential backoff
- **Timeout**: 30 segundos por requisição
- **CORS**: Habilitado para todas as origens

## Variáveis de Ambiente Necessárias

- `OPENAI_API_KEY`: Sua chave de API do OpenAI

## Exemplo de Uso no Frontend

```typescript
import { supabase } from "@/integrations/supabase/client";

async function summarizeDocument(content: string) {
  const { data, error } = await supabase.functions.invoke("summarize-document", {
    body: { content },
  });

  if (error) {
    console.error("Error:", error);
    return null;
  }

  return data.summary;
}
```

## Limitações

- Máximo de 1000 tokens no resumo gerado
- Timeout de 30 segundos por requisição
- Sujeito aos limites de rate da API do OpenAI

## Tratamento de Erros

A função implementa tratamento robusto de erros:
- Retry automático em caso de falhas de rede ou erros 5xx
- Logging detalhado para debug
- Mensagens de erro claras para o usuário

## Casos de Uso

- Resumir documentos longos para facilitar revisão
- Criar sinopses de relatórios técnicos
- Extrair pontos principais de políticas e procedimentos
- Gerar resumos executivos de documentação extensa
