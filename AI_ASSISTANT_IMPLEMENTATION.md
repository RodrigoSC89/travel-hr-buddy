# AI Assistant Implementation Guide

## Overview

This implementation adds an **AI Assistant** feature to the Nautilus One system that allows users to interact with an intelligent assistant powered by OpenAI GPT-4. The assistant can help with various tasks including creating checklists, summarizing documents, checking system status, and more.

## Architecture

### Components

1. **Next.js API Route** (Reference Implementation)
   - Location: `/app/api/assistant/query/route.ts`
   - Purpose: Reference implementation showing how to implement in Next.js
   - **Note**: This is NOT actively used. The project uses Supabase Edge Functions instead.

2. **Supabase Edge Function** (Active Implementation)
   - Location: `/supabase/functions/ai-chat/index.ts`
   - Purpose: Active backend that processes AI queries
   - Features: Retry logic, exponential backoff, timeout handling

3. **Admin UI Page**
   - Location: `/src/pages/admin/assistant.tsx`
   - Route: `/admin/assistant`
   - Purpose: User interface for interacting with the AI assistant

## Features

### Assistant Capabilities

- ✅ **Create checklists** - Generate task lists for various purposes
- 📄 **Summarize documents** - Create summaries of lengthy documents
- 📊 **Show system status** - Check the current state of the system
- 📋 **List tasks** - Find pending tasks and activities
- 📁 **List documents** - Search for and list recent documents
- 📑 **Generate PDFs** - Create PDF reports and summaries
- 🔗 **Internal navigation** - Help users navigate the system

### UI Features

- **Chat Interface** - Clean, modern chat UI with message history
- **Quick Commands** - Pre-defined command buttons for common tasks
- **Real-time Responses** - Streaming responses from GPT-4
- **Error Handling** - Graceful error messages and retry capabilities
- **Responsive Design** - Works on desktop and mobile devices

## Setup Instructions

### 1. Environment Variables

Add the following to your `.env` or `.env.local` file:

```bash
# OpenAI API Key (required for AI features)
VITE_OPENAI_API_KEY=sk-proj-your-openai-api-key-here

# For Supabase Edge Functions, also set:
OPENAI_API_KEY=sk-proj-your-openai-api-key-here
```

**Note**: For Supabase Edge Functions, you need to set the secret using the Supabase CLI:

```bash
supabase secrets set OPENAI_API_KEY=sk-proj-your-openai-api-key-here
```

### 2. Deploy Supabase Edge Function

Deploy the `ai-chat` function to Supabase:

```bash
supabase functions deploy ai-chat
```

### 3. Access the Assistant

Navigate to `/admin/assistant` in your application to access the AI Assistant interface.

## Usage

### Quick Commands

The assistant interface provides quick command buttons for common tasks:

1. **"Crie um checklist para inspeção técnica"**
   - Creates a technical inspection checklist
   
2. **"Quantas tarefas pendentes tenho hoje?"**
   - Lists today's pending tasks
   
3. **"Resuma o último documento gerado"**
   - Summarizes the most recent document
   
4. **"Qual o status do sistema?"**
   - Shows current system status
   
5. **"Liste os documentos recentes"**
   - Lists recently created documents

### Custom Queries

Users can also type custom questions or commands in the input field. Examples:

- "Como posso criar um novo usuário?"
- "Preciso de ajuda com o módulo de viagens"
- "Gere um relatório de atividades da última semana"
- "Quais são as certificações que vencem este mês?"

## API Reference

### Supabase Edge Function: `ai-chat`

**Endpoint**: `POST /functions/v1/ai-chat`

**Request Body**:
```json
{
  "message": "User question or command",
  "context": "Optional context information"
}
```

**Response**:
```json
{
  "reply": "AI-generated response",
  "timestamp": "2025-10-12T04:00:53.000Z"
}
```

**Error Response**:
```json
{
  "error": "Error message",
  "timestamp": "2025-10-12T04:00:53.000Z"
}
```

### Configuration

The AI assistant uses the following OpenAI settings:

- **Model**: `gpt-4o-mini` (cost-effective, fast)
- **Temperature**: 0.4 (balanced creativity/consistency)
- **Max Tokens**: 1000 (sufficient for most responses)
- **Retry Logic**: 3 attempts with exponential backoff
- **Timeout**: 30 seconds per request

## System Prompt

The assistant is configured with the following system prompt:

```
Você é o assistente do sistema Nautilus One. Responda de forma clara e útil.
Você pode realizar ações como:

- Criar um novo checklist
- Resumir documentos
- Mostrar status do sistema
- Buscar tarefas pendentes
- Listar documentos recentes
- Gerar PDF com resumo
- Redirecionar para rotas internas do painel

Se o comando for reconhecido, explique a ação e simule o resultado.

Características:
- Seja sempre profissional, útil e direto
- Responda em português brasileiro
- Forneça informações precisas e acionáveis
- Se não souber algo específico, seja honesto
- Sugira próximos passos quando apropriado
```

## Integration with Other Modules

The AI assistant can be integrated with other Nautilus One modules:

### Checklists Module
```typescript
// Example: Creating a checklist via assistant
const response = await supabase.functions.invoke("ai-chat", {
  body: { 
    message: "Crie um checklist para inspeção de segurança",
    context: "Módulo de Checklists - Inspeção de Segurança"
  },
});
```

### Documents Module
```typescript
// Example: Summarizing a document
const response = await supabase.functions.invoke("ai-chat", {
  body: { 
    message: "Resuma este documento: " + documentContent,
    context: "Módulo de Documentos"
  },
});
```

### Analytics Module
```typescript
// Example: Getting insights
const response = await supabase.functions.invoke("ai-chat", {
  body: { 
    message: "Analise os dados de desempenho da última semana",
    context: "Módulo de Analytics - Performance Data"
  },
});
```

## Troubleshooting

### Issue: "Failed to send a request to the Edge Function"

**Possible Causes**:
1. Supabase Edge Function not deployed
2. OPENAI_API_KEY not set in Supabase secrets
3. Network connectivity issues

**Solutions**:
1. Deploy the function: `supabase functions deploy ai-chat`
2. Set the secret: `supabase secrets set OPENAI_API_KEY=your-key`
3. Check Supabase dashboard for function logs

### Issue: "OpenAI API error: 429"

**Cause**: Rate limit exceeded

**Solution**: Implement request queuing or upgrade OpenAI plan

### Issue: Slow responses

**Possible Causes**:
1. Network latency
2. OpenAI API slowness
3. Complex prompts

**Solutions**:
1. Use `gpt-4o-mini` instead of `gpt-4` for faster responses
2. Reduce max_tokens if full responses aren't needed
3. Simplify system prompt

## Security Considerations

### API Key Protection
- ✅ API keys are stored as environment variables
- ✅ Never exposed to client-side code
- ✅ Protected by Supabase authentication
- ❌ Consider adding rate limiting per user

### Data Privacy
- User queries are sent to OpenAI
- Consider adding data sanitization
- Review OpenAI's data usage policies
- Implement audit logging for sensitive queries

### Access Control
- Current: Available to all authenticated admin users
- Consider: Role-based access control (RBAC)
- Implement: Usage quotas per user/role

## Performance Optimization

### Caching
Consider implementing response caching for common queries:

```typescript
// Example: Redis cache for frequently asked questions
const cachedResponse = await redis.get(`ai-chat:${messageHash}`);
if (cachedResponse) {
  return cachedResponse;
}
```

### Load Balancing
For high-traffic scenarios, consider:
- Multiple OpenAI API keys with round-robin
- Queue-based processing for non-urgent queries
- Fallback to cached responses during outages

## Future Enhancements

- [ ] Voice input/output integration
- [ ] Multi-turn conversation memory
- [ ] Context-aware suggestions based on user role
- [ ] Integration with knowledge base/documentation
- [ ] Multilingual support (English, Spanish, etc.)
- [ ] Advanced analytics on assistant usage
- [ ] Proactive assistance based on user behavior
- [ ] Custom agent training for specific domains

## Cost Estimation

### OpenAI API Costs (gpt-4o-mini)

- **Input**: $0.15 per 1M tokens (~750K words)
- **Output**: $0.60 per 1M tokens (~750K words)

**Example Monthly Cost**:
- 1,000 queries/month
- Avg 200 tokens input + 500 tokens output per query
- Cost: ~$0.50/month

**Scaling**:
- 10,000 queries/month: ~$5/month
- 100,000 queries/month: ~$50/month

## Related Documentation

- [OpenAI API Documentation](https://platform.openai.com/docs/api-reference)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Next.js App Router](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Nautilus One Documentation](../README.md)

## Support

For issues or questions:
1. Check Supabase function logs
2. Review OpenAI API status
3. Check console errors in browser DevTools
4. Contact the development team

---

**Last Updated**: October 2025  
**Version**: 1.0.0  
**Maintained by**: Nautilus One Team
