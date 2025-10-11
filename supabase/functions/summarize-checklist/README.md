# Summarize Checklist Function

Esta função Supabase Edge Function fornece resumo automático e sugestões de melhoria para checklists usando OpenAI GPT-4.

## Endpoint

```
POST /functions/v1/summarize-checklist
```

## Autenticação

Esta função aceita requisições públicas (não requer autenticação), mas pode ser facilmente modificada para exigir token JWT do Supabase.

## Request Body

```json
{
  "title": "string - Título do checklist",
  "items": [
    {
      "title": "string - Nome do item",
      "checked": "boolean - Status de conclusão (ou 'completed')"
    }
  ],
  "comments": [
    {
      "user": "string - Nome do usuário",
      "text": "string - Texto do comentário"
    }
  ]
}
```

## Response

### Success (200)

```json
{
  "summary": "string - Resumo e sugestões geradas pela IA",
  "timestamp": "string - ISO 8601 timestamp"
}
```

### Error (400/500)

```json
{
  "error": "string - Mensagem de erro",
  "details": "string - Detalhes adicionais (opcional)"
}
```

## Exemplos

### Request

```bash
curl -X POST https://your-project.supabase.co/functions/v1/summarize-checklist \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Checklist de embarque",
    "items": [
      { "title": "Validar documentos", "checked": true },
      { "title": "Verificar carga", "checked": false }
    ],
    "comments": [
      { "user": "Maria", "text": "Faltam dados do navio" }
    ]
  }'
```

### Response

```json
{
  "summary": "📊 1 de 2 tarefas concluídas. ⚠️ Checklist parcialmente completo.\n\n💡 Sugestões de melhoria:\n1. Concluir verificação de carga pendente\n2. Adicionar dados do navio conforme comentário de Maria\n3. Implementar validação automática de documentos",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Funcionalidades

### 🧠 O que essa IA faz:

| Função | Descrição |
|--------|-----------|
| 📋 Resumo automático | Resume o progresso atual do checklist, com base nos itens marcados |
| 💡 Sugestões de melhoria | Analisa os comentários ou pendências e recomenda até 3 melhorias práticas |

### Recursos Técnicos:

- **Retry Logic**: Implementa retry automático com backoff exponencial para lidar com falhas temporárias da API OpenAI
- **Timeout**: Timeout de 30 segundos para evitar requisições penduradas
- **CORS**: Headers CORS configurados para permitir acesso do frontend
- **Error Handling**: Tratamento robusto de erros com mensagens descritivas

## Variáveis de Ambiente

A função requer a seguinte variável de ambiente configurada no Supabase:

```
OPENAI_API_KEY=sk-...
```

Para configurar:

1. Acesse o painel do Supabase
2. Vá para Settings > Edge Functions
3. Adicione a variável `OPENAI_API_KEY` com sua chave da OpenAI

## Deployment

Para fazer deploy da função:

```bash
supabase functions deploy summarize-checklist
```

## Modelo de IA

A função utiliza o modelo `gpt-4` da OpenAI com temperatura de 0.5 para gerar respostas consistentes e focadas.

## Limitações

- A função depende da disponibilidade da API OpenAI
- Custos são aplicados por uso da API OpenAI (baseado em tokens)
- Limite de rate da OpenAI se aplica
