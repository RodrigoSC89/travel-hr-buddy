# Generate Template Edge Function

## Overview
Specialized Supabase Edge Function that generates professional document templates optimized for reusability with variable field support.

## Purpose
Unlike generic document generation, this function creates templates specifically designed for:
- Reusability across multiple documents
- Variable fields in `[VARIABLE_NAME]` format
- Maritime/technical documentation context
- Professional structure and formatting

## API

### Endpoint
```
POST /functions/v1/generate-template
```

### Request Body
```json
{
  "title": "Template title",
  "purpose": "Optional additional context or purpose"
}
```

### Response
```json
{
  "content": "Generated template content with [VARIABLE] fields",
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

### Variable Field Support
Templates automatically include relevant variable fields:
- `[NOME_TECNICO]` - Technician name
- `[DATA]` - Date
- `[EMBARCACAO]` or `[NOME_EMBARCACAO]` - Vessel name
- `[EMPRESA]` - Company name
- `[CLIENTE]` - Client name
- `[PROJETO]` - Project name
- `[OBSERVACOES]` - General observations
- `[RESPONSAVEL]` - Activity responsible
- `[LOCAL]` - Activity location
- `[EQUIPAMENTO]` - Inspected equipment

The function intelligently selects which fields are most relevant based on the template title and purpose.

### Maritime/Technical Context
Specialized system prompts optimized for:
- Maritime operations
- Technical inspections
- Operational procedures
- Safety documentation
- Maintenance reports
- Compliance documents

### Professional Structure
Generated templates include:
- Clear numbered sections
- Professional formatting
- Descriptive content
- Appropriate technical language
- Logical organization

## Technical Details

### Model
- Uses `gpt-4o-mini` for efficient generation
- Temperature: 0.7 (balanced creativity)
- Max tokens: 1500

### Retry Logic
- 3 automatic retry attempts
- Exponential backoff with jitter
- 30-second timeout protection
- Handles rate limits (429) and server errors (5xx)

### System Prompt
Specialized prompt emphasizing:
- Template reusability
- Variable field inclusion `[VARIABLE]`
- Maritime/technical context
- Professional quality
- Structured format

## Example Usage

### JavaScript/TypeScript
```typescript
// Simple generation
const { data, error } = await supabase.functions.invoke("generate-template", {
  body: { 
    title: "Relatório de Inspeção - Sistema de Propulsão"
  }
});

// With additional context
const { data, error } = await supabase.functions.invoke("generate-template", {
  body: { 
    title: "Relatório de Inspeção",
    purpose: "Para documentar inspeções periódicas do sistema de propulsão principal"
  }
});

if (error) {
  console.error("Generation failed:", error);
} else {
  console.log("Generated template:", data.content);
}
```

### Example Output
```
Relatório de Inspeção - Sistema de Propulsão

Data: [DATA]
Técnico: [NOME_TECNICO]
Embarcação: [NOME_EMBARCACAO]
Empresa: [EMPRESA]

1. Objetivo
   Realizar inspeção completa do sistema de propulsão...

2. Equipamentos Inspecionados
   [EQUIPAMENTO]

3. Observações
   [OBSERVACOES]

4. Conclusão
   ...
```

## Differences from Other Functions

### vs. `generate-document`
- **generate-template**: Creates reusable templates with `[VARIABLE]` fields
- **generate-document**: Creates complete, ready-to-use documents

### vs. `enhance-template`
- **generate-template**: Creates new template from scratch
- **enhance-template**: Improves existing template content

## Environment Variables

```bash
OPENAI_API_KEY=your_openai_api_key_here
```

## Deployment

```bash
supabase functions deploy generate-template
```

## Testing

Test with curl:
```bash
curl -X POST \
  https://your-project.supabase.co/functions/v1/generate-template \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Relatório de Inspeção Técnica",
    "purpose": "Para documentar inspeções de equipamentos marítimos"
  }'
```

## Error Handling

The function handles:
- Missing or invalid title
- OpenAI API errors
- Rate limiting (with automatic retry)
- Network timeouts
- Invalid API responses

All errors return appropriate HTTP status codes and descriptive messages.

## Best Practices

1. **Descriptive Titles**: Provide clear, specific titles for better template generation
2. **Context**: Use the `purpose` parameter for complex or specialized templates
3. **Review**: Always review generated templates before saving
4. **Customization**: Templates are meant as starting points - customize as needed
5. **Variable Fields**: Templates include common fields, add more as needed
