# Generate Document Function

Esta função Supabase Edge utiliza a API do OpenAI para gerar documentos profissionais baseados em prompts fornecidos pelo usuário.

## Endpoint

```
POST /functions/v1/generate-document
```

## Autenticação

Esta função aceita requisições públicas (não requer autenticação), mas utiliza a chave de API do OpenAI configurada nas variáveis de ambiente do Supabase.

## Request Body

```json
{
  "prompt": "string - Descrição do documento que você deseja gerar"
}
```

### Exemplo

```json
{
  "prompt": "Crie um relatório detalhado sobre procedimentos de segurança em operações marítimas, incluindo equipamentos de proteção individual, procedimentos de emergência e boas práticas de navegação."
}
```

## Response

### Success (200)

```json
{
  "content": "string - Conteúdo do documento gerado pela IA",
  "timestamp": "string - ISO 8601 timestamp"
}
```

### Error (400)

```json
{
  "error": "string - Mensagem de erro",
  "timestamp": "string - ISO 8601 timestamp"
}
```

## Características

- **Retry Logic**: Implementa retry automático com exponential backoff para lidar com falhas temporárias da API
- **Timeout**: Timeout de 30 segundos por requisição
- **CORS**: Suporta requisições de qualquer origem
- **Modelo**: Utiliza `gpt-4o-mini` para geração de conteúdo
- **Sistema de Prompts**: Configurado para gerar documentos profissionais e corporativos

## Variáveis de Ambiente Necessárias

- `OPENAI_API_KEY`: Chave de API do OpenAI

## Tipos de Documentos Suportados

A IA pode gerar diversos tipos de documentos profissionais:
- Relatórios técnicos
- Políticas corporativas
- Procedimentos operacionais
- Manuais de instruções
- Documentos de compliance
- Relatórios de análise

## Exemplo de Uso no Frontend

```typescript
import { supabase } from "@/integrations/supabase/client";

async function generateDocument(prompt: string) {
  const { data, error } = await supabase.functions.invoke("generate-document", {
    body: { prompt },
  });

  if (error) {
    console.error("Error:", error);
    return null;
  }

  return data.content;
}
```

## Limitações

- Máximo de 2000 tokens por documento gerado
- Timeout de 30 segundos por requisição
- Sujeito aos limites de rate da API do OpenAI

## Tratamento de Erros

A função implementa tratamento robusto de erros:
- Retry automático em caso de falhas de rede ou erros 5xx
- Logging detalhado para debug
- Mensagens de erro claras para o usuário
