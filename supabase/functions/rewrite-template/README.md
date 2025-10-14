# Rewrite Template Function

Esta função Supabase Edge utiliza a API do OpenAI para reescrever trechos selecionados de forma mais clara, formal e técnica, mantendo o significado e adaptando para uso em templates operacionais.

## Endpoint

```
POST /functions/v1/rewrite-template
```

## Autenticação

Esta função aceita requisições públicas (não requer autenticação), mas utiliza a chave de API do OpenAI configurada nas variáveis de ambiente do Supabase.

## Request Body

```json
{
  "input": "string - Trecho de texto que você deseja reescrever"
}
```

### Exemplo

```json
{
  "input": "O capitão deve verificar os equipamentos antes de sair"
}
```

## Response

### Sucesso (200 OK)

```json
{
  "result": "string - Trecho reescrito de forma clara e formal",
  "timestamp": "string - ISO 8601 timestamp"
}
```

### Erro (500 Internal Server Error)

```json
{
  "error": "string - Mensagem de erro",
  "timestamp": "string - ISO 8601 timestamp"
}
```

## Características

- **Modelo**: GPT-4 para maior precisão e qualidade
- **Temperature**: 0.4 para respostas mais consistentes e formais
- **Retry Logic**: 3 tentativas com exponential backoff
- **Timeout**: 30 segundos por requisição
- **CORS**: Habilitado para todas as origens

## Variáveis de Ambiente Necessárias

- `OPENAI_API_KEY`: Sua chave de API do OpenAI

## O que a Função Faz

A função reescreve trechos de texto para uso em templates operacionais, melhorando:
- Clareza e precisão técnica
- Formalidade e profissionalismo
- Terminologia marítima adequada
- Estrutura e organização
- Tom técnico apropriado

Enquanto preserva:
- O significado original
- As informações essenciais
- O contexto operacional

## Exemplo de Uso no Frontend

```typescript
import { supabase } from "@/integrations/supabase/client";

async function rewriteTemplate(input: string) {
  const { data, error } = await supabase.functions.invoke("rewrite-template", {
    body: { input },
  });

  if (error) {
    console.error("Error:", error);
    return null;
  }

  return data.result;
}
```

## Limitações

- Otimizado para trechos curtos (templates)
- Timeout de 30 segundos por requisição
- Sujeito aos limites de rate da API do OpenAI

## Tratamento de Erros

A função implementa tratamento robusto de erros:
- Retry automático em caso de falhas de rede ou erros 5xx
- Logging detalhado com tag `[REWRITE_TEMPLATE_ERROR]`
- Mensagens de erro claras para o usuário

## Casos de Uso

- Reescrever instruções operacionais para maior clareza
- Formalizar procedimentos técnicos
- Adaptar textos para templates operacionais marítimos
- Melhorar a precisão de descrições técnicas
- Padronizar linguagem em documentos operacionais

## Diferença entre Rewrite-Template e Rewrite-Document

- **Rewrite-Template**: Focado em trechos curtos com linguagem técnica e formal para templates operacionais
- **Rewrite-Document**: Focado em documentos completos com reformulação mais abrangente
