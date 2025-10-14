# Generate Template Edge Function

## Overview
AI-powered edge function to generate professional document templates with variable fields.

## Purpose
Creates reusable document templates optimized for maritime and technical documentation with:
- Professional structure and formatting
- Variable fields in [VARIABLE_NAME] format
- Context-aware content generation
- Specialized maritime/technical prompts

## Request Format
```json
{
  "title": "Template Title",
  "purpose": "Optional description of template purpose"
}
```

## Response Format
```json
{
  "content": "Generated template content with [VARIABLE_FIELDS]",
  "timestamp": "2025-10-14T19:52:01.953Z"
}
```

## Common Variable Fields Included
- `[NOME_TECNICO]` - Technician name
- `[DATA]` - Date
- `[DATA_INSPECAO]` - Inspection date
- `[EMBARCACAO]` / `[NOME_EMBARCACAO]` - Vessel name
- `[EMPRESA]` - Company name
- `[LOCAL]` - Service location
- `[NUMERO_RELATORIO]` - Report number
- `[EQUIPAMENTO]` - Equipment name
- `[OBSERVACOES]` - General observations

## Features
- Exponential backoff retry logic (3 attempts)
- 30-second timeout protection
- Specialized system prompts for templates
- Maritime/technical documentation optimization
- Portuguese (BR) professional language

## Model
Uses OpenAI GPT-4o-mini with temperature 0.7 for balanced creativity and consistency.

## Environment Variables
- `OPENAI_API_KEY` - Required OpenAI API key

## Error Handling
Returns appropriate error messages with:
- Missing required fields
- API failures
- Timeout issues
- Invalid responses

## Example Usage
```typescript
const { data, error } = await supabase.functions.invoke("generate-template", {
  body: { 
    title: "Relatório de Inspeção - Sistema de Propulsão",
    purpose: "Relatório técnico para inspeção de sistema azimutal"
  },
});
```
