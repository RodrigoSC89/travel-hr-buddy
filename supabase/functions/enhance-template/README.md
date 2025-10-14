# Enhance Template Edge Function

## Overview
AI-powered edge function to improve and refine existing document templates while preserving structure and variable fields.

## Purpose
Enhances template quality by:
- Improving clarity and professionalism
- Fixing grammatical and style issues
- Preserving ALL variable fields [VARIABLE_NAME]
- Maintaining original structure and sections
- Adding helpful guidance when appropriate

## Request Format
```json
{
  "content": "Original template content to enhance"
}
```

## Response Format
```json
{
  "content": "Enhanced template content with preserved [VARIABLE_FIELDS]",
  "timestamp": "2025-10-14T19:52:01.953Z"
}
```

## Key Features
- **Variable Field Preservation**: NEVER removes existing [VARIABLE_NAME] fields
- **Structure Maintenance**: Preserves section hierarchy and organization
- **Context-Aware**: Understands maritime/technical documentation
- **Professional Enhancement**: Improves text while maintaining meaning
- **Graceful Additions**: Only adds new variable fields when they make sense

## Rules
1. NEVER remove existing variable fields
2. ALWAYS preserve section structure
3. Maintain original purpose and context
4. Improve readability without changing meaning
5. Add variable fields only when appropriate
6. Preserve formatting and hierarchy
7. Use professional Brazilian Portuguese

## Features
- Exponential backoff retry logic (3 attempts)
- 30-second timeout protection
- Specialized system prompts for template enhancement
- Maritime/technical documentation optimization

## Model
Uses OpenAI GPT-4o-mini with temperature 0.7 for balanced enhancement.

## Environment Variables
- `OPENAI_API_KEY` - Required OpenAI API key

## Error Handling
Returns appropriate error messages with:
- Missing content
- API failures
- Timeout issues
- Invalid responses

## Example Usage
```typescript
const { data, error } = await supabase.functions.invoke("enhance-template", {
  body: { 
    content: existingTemplateContent
  },
});
```

## What Gets Enhanced
- Text clarity and flow
- Grammar and style
- Professional tone
- Helpful instructions
- Organization (when beneficial)

## What Stays Unchanged
- Variable fields [EXAMPLE]
- Core structure
- Essential information
- Original intent
- Variable field names
