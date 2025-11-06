# AI Generate API Endpoint

## Overview
The `/api/ai/generate` endpoint provides AI-powered content generation for maritime documentation using OpenAI's GPT-4-1106-preview model. It's designed for integration with TipTap editor components.

## Endpoint Details

**URL:** `POST /api/ai/generate`

**Location:** `pages/api/ai/generate.ts`

## Request

### Method
`POST`

### Headers
```
Content-Type: application/json
```

### Body
```json
{
  "prompt": "string (required)"
}
```

**Example:**
```json
{
  "prompt": "Gerar procedimento de segurança para operações de carga em embarcações"
}
```

## Response

### Success Response (200)
```json
{
  "result": "string - Generated content from AI"
}
```

**Example:**
```json
{
  "result": "# Procedimento de Segurança para Operações de Carga\n\n1. Verificar condições climáticas..."
}
```

### Error Responses

#### Missing Prompt (400)
```json
{
  "error": "Prompt ausente"
}
```

#### Method Not Allowed (405)
```json
{
  "error": "Method not allowed"
}
```

#### API Key Not Configured (500)
```json
{
  "error": "OpenAI API key not configured"
}
```

#### OpenAI API Error (500)
```json
{
  "error": "Erro na geração com IA"
}
```

## Configuration

### Environment Variables
The endpoint requires the following environment variable:

```
VITE_OPENAI_API_KEY=sk-proj-...
```

Set this in your `.env` file or environment configuration.

## OpenAI Settings

- **Model:** `gpt-4-1106-preview`
- **Temperature:** `0.3` (for consistent, focused responses)
- **Max Tokens:** `1000`
- **System Role:** "Você é um assistente técnico especializado em documentação marítima."

## Usage Example

### Using fetch API
```javascript
const response = await fetch('/api/ai/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    prompt: 'Criar checklist de segurança para manutenção de motores'
  })
});

const data = await response.json();

if (response.ok) {
  console.log('Generated content:', data.result);
} else {
  console.error('Error:', data.error);
}
```

### Using in TipTap Editor
```javascript
// Example integration with TipTap editor
const generateContent = async (prompt) => {
  try {
    const response = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      // Insert generated content into editor
      editor.commands.setContent(data.result);
    } else {
      console.error('Generation failed:', data.error);
    }
  } catch (error) {
    console.error('Network error:', error);
  }
};
```

## Use Cases

1. **Maritime Safety Documentation**
   - Generate safety procedures for vessel operations
   - Create emergency response protocols
   - Document equipment handling procedures

2. **Technical Documentation**
   - Equipment specifications
   - Maintenance procedures
   - Technical reports

3. **Compliance Documentation**
   - Regulatory compliance documents
   - Inspection checklists
   - Audit reports

4. **Training Materials**
   - Training procedures
   - Instructional documents
   - Safety guidelines

## Testing

The endpoint includes comprehensive test coverage (68 tests) covering:
- Request handling and validation
- OpenAI configuration
- Error handling
- Response formatting
- Security considerations
- TipTap editor integration

Run tests with:
```bash
npm run test src/tests/ai-generate-api.test.ts
```

## Security Considerations

- API key is validated before use
- No sensitive data is exposed in error messages
- Request body validation prevents malformed requests
- Only POST method is allowed

## Error Handling

The endpoint includes robust error handling for:
- Missing or invalid prompts
- Unconfigured API keys
- OpenAI API failures (rate limits, network errors, etc.)
- Invalid HTTP methods

All errors are logged to console for debugging while returning safe error messages to clients.

## Performance

- Max tokens limited to 1000 for response efficiency
- Temperature set to 0.3 for consistent, focused responses
- Appropriate for real-time content generation in editor interfaces

## Integration Status

✅ Endpoint implemented and tested
✅ OpenAI GPT-4 integration complete
✅ Error handling and validation in place
✅ Ready for TipTap editor integration
✅ 68 comprehensive tests passing

## Next Steps

To use this endpoint in your application:
1. Ensure `VITE_OPENAI_API_KEY` is set in your environment
2. Integrate the fetch call in your TipTap editor component
3. Handle responses and errors appropriately
4. Test with real maritime documentation prompts

## Related Files

- API Endpoint: `pages/api/ai/generate.ts`
- Tests: `src/tests/ai-generate-api.test.ts`
- OpenAI Integration: `lib/ai/openai/createEmbedding.ts`
- Environment Example: `.env.example`
