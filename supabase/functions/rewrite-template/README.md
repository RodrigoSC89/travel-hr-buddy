# Rewrite Template Function

Esta função Supabase Edge utiliza a API do OpenAI (GPT-4) para reescrever trechos selecionados de templates de forma mais clara, formal e técnica.

## Endpoint

```
POST /functions/v1/rewrite-template
```

## Autenticação

Esta função aceita requisições públicas (não requer autenticação), mas utiliza a chave de API do OpenAI configurada nas variáveis de ambiente do Supabase.

## Request Body

```json
{
  "input": "string - Trecho do template que você deseja reescrever"
}
```

### Exemplo

```json
{
  "input": "O tripulante deve verificar todos os equipamentos antes de sair"
}
```

## Response

### Sucesso (200 OK)

```json
{
  "result": "string - Trecho reescrito com clareza técnica e tom formal",
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

- **Modelo**: GPT-4 para máxima qualidade
- **Temperature**: 0.5 para equilíbrio entre consistência e criatividade
- **Retry Logic**: 3 tentativas com exponential backoff
- **Timeout**: 30 segundos por requisição
- **CORS**: Habilitado para todas as origens

## Variáveis de Ambiente Necessárias

- `OPENAI_API_KEY`: Sua chave de API do OpenAI

## O que a Função Faz

Esta função é especializada em reescrever **trechos específicos** de templates operacionais. Ela:

1. Recebe um trecho de texto selecionado
2. Analisa o conteúdo com foco em contexto marítimo/técnico
3. Reescreve o trecho de forma:
   - Mais clara e objetiva
   - Com linguagem técnica apropriada
   - Tom formal e profissional
   - Mantendo o significado original
4. Retorna o texto reescrito

## Exemplo de Uso no Frontend

```typescript
const rewriteTemplateSnippet = async (selectedText: string) => {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/rewrite-template`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input: selectedText }),
      }
    );

    if (!response.ok) {
      throw new Error('Erro ao reescrever trecho');
    }

    const { result } = await response.json();
    return result;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};
```

## Limitações

- Timeout de 30 segundos por requisição
- Sujeito aos limites de rate da API do OpenAI
- Otimizado para trechos curtos/médios (não documentos completos)

## Tratamento de Erros

A função implementa tratamento robusto de erros:
- Retry automático em caso de falhas de rede ou erros 5xx
- Logging detalhado com prefixo `[REWRITE_TEMPLATE_ERROR]` para debug
- Mensagens de erro claras para o usuário

## Casos de Uso

- Melhorar trechos de templates operacionais
- Formalizar linguagem técnica em documentos marítimos
- Clarificar instruções em procedimentos
- Adaptar texto para contexto técnico/profissional
- Reescrever seções de templates durante edição

## Diferença entre Rewrite Template e Rewrite Document

- **Rewrite Template**: Reescreve **trechos selecionados** com foco em clareza técnica e tom formal marítimo. Usa GPT-4 e temperatura 0.5.
- **Rewrite Document**: Reescreve **documentos completos** mantendo todas as informações. Usa GPT-4o-mini e temperatura 0.7.

## Integração com Templates

Esta função foi projetada para ser usada em conjunto com:
- TipTap editor (para seleção de texto)
- Template Manager (para edição de templates)
- Sistema de templates com IA (geração e reescrita)
