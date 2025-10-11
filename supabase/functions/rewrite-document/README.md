# Rewrite Document Function

Esta função Supabase Edge utiliza a API do OpenAI para reformular e melhorar documentos profissionais mantendo o significado original.

## Endpoint

```
POST /functions/v1/rewrite-document
```

## Autenticação

Esta função aceita requisições públicas (não requer autenticação), mas utiliza a chave de API do OpenAI configurada nas variáveis de ambiente do Supabase.

## Request Body

```json
{
  "content": "string - Conteúdo do documento que você deseja reformular"
}
```

### Exemplo

```json
{
  "content": "Este documento fala sobre as regras de segurança que devem ser seguidas na empresa. É importante que todos os funcionários usem equipamentos de proteção e sigam os procedimentos estabelecidos..."
}
```

## Response

### Sucesso (200 OK)

```json
{
  "rewritten": "string - Documento reformulado e melhorado",
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
- **Max Tokens**: 2000 tokens
- **Retry Logic**: 3 tentativas com exponential backoff
- **Timeout**: 30 segundos por requisição
- **CORS**: Habilitado para todas as origens

## Variáveis de Ambiente Necessárias

- `OPENAI_API_KEY`: Sua chave de API do OpenAI

## O que a Função Faz

A função reformula documentos melhorando:
- Clareza e fluidez da escrita
- Gramática e ortografia
- Estrutura e organização
- Tom profissional
- Coesão e coerência

Enquanto preserva:
- Todas as informações originais
- O significado e contexto
- A estrutura geral do documento
- A formatação básica

## Exemplo de Uso no Frontend

```typescript
import { supabase } from "@/integrations/supabase/client";

async function rewriteDocument(content: string) {
  const { data, error } = await supabase.functions.invoke("rewrite-document", {
    body: { content },
  });

  if (error) {
    console.error("Error:", error);
    return null;
  }

  return data.rewritten;
}
```

## Limitações

- Máximo de 2000 tokens no documento reformulado
- Timeout de 30 segundos por requisição
- Sujeito aos limites de rate da API do OpenAI

## Tratamento de Erros

A função implementa tratamento robusto de erros:
- Retry automático em caso de falhas de rede ou erros 5xx
- Logging detalhado para debug
- Mensagens de erro claras para o usuário

## Casos de Uso

- Melhorar a qualidade de documentos rascunho
- Reformular textos para maior profissionalismo
- Corrigir problemas de redação em documentos existentes
- Adaptar documentos para diferentes contextos mantendo o conteúdo
- Polir relatórios e apresentações

## Diferença entre Rewrite e Generate

- **Rewrite**: Melhora um documento existente mantendo todas as informações
- **Generate**: Cria um novo documento do zero a partir de um prompt
