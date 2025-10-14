# Enhance Template Edge Function

## Overview
Specialized Supabase Edge Function that enhances template content while preserving structure and variable fields.

## Purpose
Unlike generic document rewriting, this function is specifically designed for templates:
- Improves clarity, grammar, and professionalism
- Preserves ALL variable fields in `[VARIABLE_NAME]` format
- Maintains template structure and organization
- Context-aware for maritime/technical documentation

## API

### Endpoint
```
POST /functions/v1/enhance-template
```

### Request Body
```json
{
  "content": "Template content to enhance"
}
```

### Response
```json
{
  "content": "Enhanced template content",
  "timestamp": "2025-10-14T21:48:30.501Z"
}
```

### Error Response
```json
{
  "error": "Error message",
  "timestamp": "2025-10-14T21:48:30.501Z"
}
```

## Features

### Structure Preservation
- Maintains all sections and headings
- Preserves numbering and hierarchy
- Keeps existing organization intact

### Variable Field Protection
The function is explicitly designed to NEVER remove or alter variable fields:
- `[NOME_TECNICO]` - Technician name
- `[DATA]` - Date
- `[EMBARCACAO]` or `[NOME_EMBARCACAO]` - Vessel name
- `[EMPRESA]` - Company name
- `[OBSERVACOES]` - Observations
- And any other `[VARIABLE_NAME]` format fields

### Quality Improvements
- Grammar and spelling corrections
- Professional language enhancement
- Clarity improvements
- Technical accuracy for maritime context

## Technical Details

### Model
- Uses `gpt-4o-mini` for cost-effective enhancement
- Temperature: 0.3 (low for consistency)
- Max tokens: 2000

### Retry Logic
- 3 automatic retry attempts
- Exponential backoff with jitter
- 30-second timeout protection
- Handles rate limits (429) and server errors (5xx)

### System Prompt
Specialized prompt emphasizing:
- Template structure preservation
- Variable field protection (critical rule)
- Maritime/technical context awareness
- Professional quality enhancement

## Example Usage

### JavaScript/TypeScript
```typescript
const { data, error } = await supabase.functions.invoke("enhance-template", {
  body: { 
    content: `Relatório de Inspeção

Data: [DATA]
Técnico: [NOME_TECNICO]

1. Observações
   [OBSERVACOES]`
  }
});

if (error) {
  console.error("Enhancement failed:", error);
} else {
  console.log("Enhanced template:", data.content);
}
```

## Differences from Other Functions

### vs. `rewrite-document`
- **enhance-template**: Preserves variable fields, template structure
- **rewrite-document**: Complete rewrite, no special handling

### vs. `rewrite-template`
- **enhance-template**: Enhances entire template content
- **rewrite-template**: Rewrites selected text snippets

### vs. `generate-template`
- **enhance-template**: Improves existing template
- **generate-template**: Creates new template from scratch

## Environment Variables

```bash
OPENAI_API_KEY=your_openai_api_key_here
```

## Deployment

```bash
supabase functions deploy enhance-template
```

## Testing

Test with curl:
```bash
curl -X POST \
  https://your-project.supabase.co/functions/v1/enhance-template \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Relatório Técnico\n\nData: [DATA]\nTécnico: [NOME_TECNICO]\n\nEste relatório descreve observações."
  }'
```

## Error Handling

The function handles:
- Missing or invalid content
- OpenAI API errors
- Rate limiting (with automatic retry)
- Network timeouts
- Invalid API responses

All errors return appropriate HTTP status codes and descriptive messages.
