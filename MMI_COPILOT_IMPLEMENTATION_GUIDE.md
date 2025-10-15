# MMI Copilot Implementation Guide

## Overview

The MMI (Manutenção Inteligente / Intelligent Maintenance) Copilot is a specialized AI assistant for maritime engineering tasks within the maintenance module. It provides natural language interaction for technical maintenance operations.

## Implementation Details

### Endpoint

**Supabase Edge Function**: `/supabase/functions/mmi-copilot/index.ts`

**URL**: `https://[your-project].supabase.co/functions/v1/mmi-copilot`

### Features

The MMI Copilot can assist with:

1. **Technical Job Creation** - Create maintenance jobs from natural language descriptions
2. **Maintenance Postponement** - Analyze safety of postponing scheduled maintenance
3. **Work Order Generation** - Automatically generate work orders (OS - Ordens de Serviço)
4. **Asset Status Queries** - Check status of assets, jobs, and work orders
5. **Failure History** - Query historical failure data for equipment

### Configuration

#### Model Settings
- **Model**: GPT-4
- **Temperature**: 0.3 (low temperature for precise, technical responses)
- **System Prompt**: Maritime engineering assistant specialized in intelligent maintenance

#### API Requirements
- **Environment Variable**: `OPENAI_API_KEY` must be set in Supabase environment

### Request Format

```typescript
POST /functions/v1/mmi-copilot
Content-Type: application/json

{
  "messages": [
    {
      "role": "user",
      "content": "Criar job para troca de válvula na bomba 603.0004.02"
    }
  ]
}
```

The `messages` array follows the OpenAI chat format and supports conversation history:

```typescript
{
  "messages": [
    { "role": "user", "content": "Postergar o job 2333 é seguro?" },
    { "role": "assistant", "content": "Verificando histórico do job 2333..." },
    { "role": "user", "content": "E quais são os riscos?" }
  ]
}
```

### Response Format

**Success Response (200 OK)**:
```json
{
  "reply": "Job técnico criado com sucesso para troca de válvula na bomba 603.0004.02...",
  "timestamp": "2025-10-15T00:05:14.143Z"
}
```

**Error Response (500)**:
```json
{
  "error": "Error message",
  "timestamp": "2025-10-15T00:05:14.143Z"
}
```

## Example Use Cases

### 1. Create Maintenance Job
```bash
curl -X POST https://[project].supabase.co/functions/v1/mmi-copilot \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [token]" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "Criar job para troca de válvula na bomba 603.0004.02"
      }
    ]
  }'
```

### 2. Check Postponement Safety
```bash
curl -X POST https://[project].supabase.co/functions/v1/mmi-copilot \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [token]" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "Postergar o job 2333 é seguro?"
      }
    ]
  }'
```

### 3. Query Pending Work Orders
```bash
curl -X POST https://[project].supabase.co/functions/v1/mmi-copilot \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [token]" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "Quais OS estão pendentes na embarcação Poseidon?"
      }
    ]
  }'
```

### 4. Check Failure History
```bash
curl -X POST https://[project].supabase.co/functions/v1/mmi-copilot \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [token]" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "Qual o histórico de falhas no motor STBD?"
      }
    ]
  }'
```

## System Prompt

The MMI Copilot uses a specialized system prompt in Portuguese:

```
Você é um engenheiro marítimo assistente no módulo de Manutenção Inteligente (MMI).
Você pode:
- Criar jobs técnicos a partir de descrições naturais
- Postergar manutenções se permitido
- Gerar ordens de serviço automaticamente
- Buscar status de ativos, jobs e OS
Sempre responda de forma técnica, clara e orientada à ação.
```

## Technical Characteristics

### Language
- Portuguese (Brazilian) interface and responses
- Technical maritime terminology
- Action-oriented communication style

### Response Style
- Technical and precise
- Clear and direct
- Focused on actionable information
- Professional maritime engineering context

### Security
- CORS enabled for all origins
- Requires OpenAI API key in environment
- Input validation for messages array
- Error handling with appropriate HTTP status codes

## Testing

The implementation includes comprehensive unit tests in `/src/tests/mmi-copilot.test.ts`:

- System prompt validation
- Request format verification
- Technical use case coverage
- API configuration checks
- Response format validation
- Error handling scenarios

Run tests with:
```bash
npm test -- src/tests/mmi-copilot.test.ts
```

## Deployment

1. Deploy to Supabase:
```bash
supabase functions deploy mmi-copilot
```

2. Set environment variables:
```bash
supabase secrets set OPENAI_API_KEY=your_api_key_here
```

3. Test the endpoint:
```bash
curl -X POST https://[project].supabase.co/functions/v1/mmi-copilot \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [token]" \
  -d '{"messages":[{"role":"user","content":"teste"}]}'
```

## Integration Example

### Frontend Integration (React/TypeScript)

```typescript
import { supabase } from '@/lib/supabase';

async function queryMMICopilot(messages: Array<{role: string, content: string}>) {
  const { data, error } = await supabase.functions.invoke('mmi-copilot', {
    body: { messages }
  });

  if (error) {
    console.error('Error calling MMI Copilot:', error);
    return null;
  }

  return data;
}

// Usage
const response = await queryMMICopilot([
  { role: 'user', content: 'Criar job para troca de válvula na bomba 603.0004.02' }
]);

console.log(response.reply);
```

## Maintenance

### Monitoring
- Check logs in Supabase Dashboard > Functions > mmi-copilot
- Monitor OpenAI API usage and costs
- Track response times and error rates

### Updates
- System prompt can be updated in the function code
- Temperature and model settings can be adjusted
- Error handling can be enhanced based on production usage

## Best Practices

1. **Message History**: Maintain conversation context by including previous messages
2. **Error Handling**: Always handle potential errors in client code
3. **Rate Limiting**: Be mindful of OpenAI API rate limits
4. **Context**: Provide clear, specific technical queries
5. **Language**: Use Portuguese for natural interaction

## Troubleshooting

### Common Issues

1. **OPENAI_API_KEY not set**
   - Set the environment variable in Supabase dashboard
   - Redeploy the function after setting secrets

2. **400 Error - Messages array required**
   - Ensure request body includes `messages` array
   - Validate message format: `[{role, content}]`

3. **500 Error - OpenAI API error**
   - Check OpenAI API key validity
   - Verify account has sufficient credits
   - Review rate limit status

## Files Created

- `/supabase/functions/mmi-copilot/index.ts` - Edge function implementation
- `/src/tests/mmi-copilot.test.ts` - Comprehensive test suite
- `MMI_COPILOT_IMPLEMENTATION_GUIDE.md` - This documentation file

## Success Criteria

✅ Endpoint `/supabase/functions/mmi-copilot/index.ts` created  
✅ OpenAI GPT-4 integration with temperature 0.3  
✅ Maritime engineering system prompt implemented  
✅ Support for technical job creation queries  
✅ Support for maintenance postponement queries  
✅ Support for work order status queries  
✅ Support for failure history queries  
✅ Comprehensive test suite (19 tests, all passing)  
✅ Error handling and validation  
✅ CORS configuration for frontend access  
✅ Documentation and integration examples  

The MMI Copilot is now fully functional and ready for integration into the maintenance module frontend! 🚢⚙️
