# Rewrite Selection Function

Esta função Supabase Edge utiliza a API do OpenAI para reformular trechos de texto selecionados, melhorando a redação enquanto mantém o significado original.

## Endpoint

```
POST /functions/v1/rewrite-selection
```

## Autenticação

Esta função aceita requisições públicas (não requer autenticação), mas utiliza a chave de API do OpenAI configurada nas variáveis de ambiente do Supabase.

## Request Body

```json
{
  "input": "string - Texto selecionado que você deseja reformular"
}
```

### Exemplo

```json
{
  "input": "A empresa precisa fazer melhorias nos processos para ficar mais eficiente."
}
```

## Response

### Sucesso (200 OK)

```json
{
  "result": "string - Texto reformulado e melhorado",
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

- **Modelo**: GPT-4o-mini para custo-efetividade
- **Temperature**: 0.7 para maior criatividade na reformulação
- **Max Tokens**: 1000 tokens (adequado para trechos de texto)
- **Retry Logic**: 3 tentativas com exponential backoff
- **Timeout**: 30 segundos por requisição
- **CORS**: Habilitado para todas as origens
- **Validação**: Texto mínimo de 3 caracteres

## Variáveis de Ambiente Necessárias

- `OPENAI_API_KEY`: Sua chave de API do OpenAI

## O que a Função Faz

A função recebe um trecho de texto selecionado e:

1. **Valida** o texto de entrada (mínimo 3 caracteres)
2. **Envia** o texto para o GPT-4o-mini com um prompt especializado
3. **Reformula** o texto mantendo:
   - Significado original
   - Todas as informações
   - Tom profissional
   - Clareza e fluidez
4. **Retorna** o texto reformulado

## Exemplo de Uso no Frontend

### Com Supabase Client

```typescript
import { supabase } from "@/integrations/supabase/client";

async function rewriteText(selectedText: string) {
  const { data, error } = await supabase.functions.invoke("rewrite-selection", {
    body: { input: selectedText },
  });

  if (error) {
    console.error("Erro:", error);
    return null;
  }

  return data.result;
}
```

### Com Fetch API

```typescript
async function rewriteText(selectedText: string) {
  const response = await fetch(
    `${SUPABASE_URL}/functions/v1/rewrite-selection`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ input: selectedText }),
    }
  );

  const data = await response.json();
  return data.result;
}
```

## Limitações

- Máximo de 1000 tokens no texto reformulado
- Timeout de 30 segundos por requisição
- Texto mínimo de 3 caracteres
- Sujeito aos limites de rate da API do OpenAI

## Tratamento de Erros

A função implementa tratamento robusto de erros:

- Retry automático em caso de falhas de rede ou erros 5xx
- Logging detalhado para debug
- Mensagens de erro claras para o usuário
- Validação de entrada antes de chamar a API

## Casos de Uso

- Melhorar trechos específicos de um documento
- Reformular frases para maior profissionalismo
- Corrigir problemas de redação em partes selecionadas
- Adaptar trechos de texto para diferentes contextos
- Polir parágrafos específicos de relatórios

## Diferença entre Rewrite Selection e Rewrite Document

- **Rewrite Selection**: Reformula apenas trechos selecionados de texto (ideal para edição pontual)
- **Rewrite Document**: Reformula um documento completo (ideal para revisão geral)

## Custos

Esta função utiliza o modelo GPT-4o-mini, que é significativamente mais barato que o GPT-4. Os custos são baseados em:

- Tokens de entrada (prompt + texto selecionado)
- Tokens de saída (texto reformulado)

Para trechos pequenos de texto, o custo é mínimo.

## Performance

- Tempo médio de resposta: 2-5 segundos (dependendo do tamanho do texto)
- Retry automático em caso de falhas temporárias
- Timeout de 30 segundos garante que requisições não ficam travadas

## Monitoramento

Para monitorar o uso da função:

1. Acesse o dashboard do Supabase
2. Vá em "Edge Functions"
3. Selecione "rewrite-selection"
4. Visualize logs, métricas e uso

## Deploy

Para fazer deploy da função:

```bash
supabase functions deploy rewrite-selection
```

Para testar localmente:

```bash
supabase functions serve rewrite-selection
```
