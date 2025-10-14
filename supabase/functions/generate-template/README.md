# Generate Template - Supabase Edge Function

## Overview

This Supabase Edge Function generates structured template content for maritime operational documents using OpenAI's GPT-4 model. It's designed to create professional, maritime-specific templates with editable fields and proper technical terminology.

## Purpose

The function receives a template title and generates appropriate structured content that can be used as a base for operational documents such as:
- DP (Dynamic Positioning) inspection templates
- Machine routine templates
- Nautical routine templates
- Safety inspection templates
- Crew management templates
- Embarkation procedures

## Endpoint

```
POST /functions/v1/generate-template
```

## Request Format

```json
{
  "title": "Template title"
}
```

### Parameters

- `title` (string, required): The title of the template to generate

### Example Request

```json
{
  "title": "Inspeção de Dynamic Positioning - PSV"
}
```

## Response Format

### Success Response (200 OK)

```json
{
  "content": "Generated template content with sections and editable fields...",
  "timestamp": "2025-10-14T19:30:00.000Z"
}
```

### Error Response (500 Internal Server Error)

```json
{
  "error": "Error message",
  "timestamp": "2025-10-14T19:30:00.000Z"
}
```

## Features

### 1. Maritime-Specific Content Generation
- Uses specialized prompts for maritime operational contexts
- Includes technical terminology appropriate for the nautical sector
- Generates content aligned with maritime operational standards

### 2. Structured Output
- Organizes content into logical sections
- Includes clearly marked editable fields: `[CAMPO EDITÁVEL: description]`
- Provides practical examples and guidance

### 3. Robust Error Handling
- Implements retry logic with exponential backoff
- Handles API timeouts gracefully
- Maximum 3 retry attempts for failed requests

### 4. CORS Support
- Allows cross-origin requests
- Suitable for frontend integration

## Environment Variables

The function requires the following environment variable to be set in Supabase:

```bash
OPENAI_API_KEY=your-openai-api-key
```

## Technical Details

### Model Configuration
- **Model**: GPT-4
- **Temperature**: 0.7 (balanced creativity and consistency)
- **Max Tokens**: 2000
- **Timeout**: 30 seconds per request

### Retry Strategy
- **Max Retries**: 3
- **Initial Delay**: 1000ms
- **Max Delay**: 10000ms
- **Strategy**: Exponential backoff with jitter

## Usage Example

### JavaScript/TypeScript

```typescript
import { supabase } from '@/integrations/supabase/client';

async function generateTemplate(title: string) {
  try {
    const { data, error } = await supabase.functions.invoke('generate-template', {
      body: { title }
    });

    if (error) throw error;

    console.log('Generated content:', data.content);
    return data.content;
  } catch (error) {
    console.error('Error generating template:', error);
    throw error;
  }
}

// Usage
const content = await generateTemplate('Rotina de Máquinas - OSV');
```

### React Component Integration

```tsx
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';

function TemplateGenerator() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    if (!title) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-template', {
        body: { title }
      });

      if (error) throw error;

      setContent(data.content);
      toast({
        title: 'Template gerado com sucesso',
        description: 'O conteúdo foi gerado e está pronto para edição.',
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Erro ao gerar template',
        description: 'Tente novamente mais tarde.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Título do template"
      />
      <Button onClick={handleGenerate} disabled={loading}>
        {loading ? 'Gerando...' : 'Gerar Template'}
      </Button>
      {content && (
        <div className="whitespace-pre-wrap">{content}</div>
      )}
    </div>
  );
}
```

## Integration with TipTap Editor

The generated content is designed to work seamlessly with TipTap editor. The editable fields can be replaced with actual TipTap editor nodes or placeholders.

```typescript
// Example: Using generated content in TipTap
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

const editor = useEditor({
  extensions: [StarterKit],
  content: generatedContent, // Content from generate-template function
});
```

## Error Handling

The function handles various error scenarios:

1. **Missing Title**: Returns 500 with "Title is required"
2. **Missing API Key**: Returns 500 with "OPENAI_API_KEY is not set"
3. **API Timeout**: Retries with exponential backoff
4. **Rate Limiting (429)**: Automatic retry with delay
5. **Server Errors (5xx)**: Automatic retry with delay
6. **Invalid Response**: Returns 500 with descriptive error

## Performance Considerations

- Average response time: 2-5 seconds (depending on OpenAI API)
- Timeout: 30 seconds per request
- Maximum total retry time: ~40 seconds (with 3 retries)

## Security

- CORS headers allow all origins (*)
- Requires valid Supabase API key in request headers
- OpenAI API key stored securely in environment variables
- No user data stored or logged beyond request processing

## Related Functions

- **generate-document**: General document generation
- **rewrite-document**: Document rewriting and improvement
- **summarize-document**: Document summarization

## Development

To test locally with Supabase CLI:

```bash
supabase functions serve generate-template --env-file .env.local
```

To deploy:

```bash
supabase functions deploy generate-template
```

## Changelog

### v1.0.0 (2025-10-14)
- Initial implementation
- GPT-4 integration with maritime-specific prompts
- Retry logic with exponential backoff
- CORS support
- Comprehensive error handling
