# Generate Checklist API - Implementation Guide

## Overview
This feature adds AI-powered checklist generation using OpenAI's GPT-4 model. Users can now generate checklists automatically from a simple title/description.

## Implementation Details

### 1. Supabase Edge Function
**Location:** `/supabase/functions/generate-checklist/index.ts`

The edge function:
- Accepts a POST request with a `prompt` parameter
- Uses OpenAI GPT-4 to generate 5-10 checklist items
- Returns a JSON response with the generated items
- Includes proper error handling and CORS support

**Request Format:**
```json
{
  "prompt": "Checklist para onboarding de novos funcionários"
}
```

**Response Format:**
```json
{
  "success": true,
  "items": [
    "Configurar email corporativo",
    "Criar acesso aos sistemas",
    "Agendar treinamento inicial",
    ...
  ]
}
```

### 2. Frontend Integration
**Location:** `/src/pages/admin/checklists.tsx`

Added features:
- New "Gerar com IA" button with a sparkles icon
- Loading state during AI generation
- Toast notifications for success/error feedback
- Automatic creation of checklist with AI-generated items
- Items are marked with `source_type: "ai_generated"` for tracking

### 3. Environment Variables Required

**For Supabase Edge Functions:**
```bash
OPENAI_API_KEY=sk-proj-...
```

Add this to your Supabase project's Edge Function secrets:
```bash
supabase secrets set OPENAI_API_KEY=sk-proj-...
```

**For Frontend (optional - only if calling OpenAI directly from frontend):**
```bash
VITE_OPENAI_API_KEY=sk-proj-...
```

## Usage

1. Navigate to the Checklists page (`/admin/checklists`)
2. Enter a title or description in the input field (e.g., "Checklist de segurança marítima")
3. Click the "Gerar com IA" button
4. The system will:
   - Call the OpenAI API via the Supabase Edge Function
   - Generate 5-10 relevant checklist items
   - Create a new checklist with these items
   - Display a success message with the number of items generated

## Features

✅ **AI-Powered Generation**: Uses GPT-4 for intelligent, context-aware checklist creation
✅ **Portuguese Language**: System prompt instructs the AI to generate items in Brazilian Portuguese
✅ **Temperature Control**: Set to 0.4 for consistent, focused outputs
✅ **Item Filtering**: Automatically removes numbering, bullet points, and limits to 10 items
✅ **Error Handling**: Comprehensive error handling with user-friendly messages
✅ **Loading States**: Visual feedback during generation process
✅ **Toast Notifications**: Success and error messages for user feedback
✅ **Database Integration**: Seamlessly integrates with Supabase operational_checklists and checklist_items tables

## Database Schema

The feature uses these tables:

**operational_checklists:**
- `id`: UUID
- `title`: string
- `type`: string
- `created_by`: UUID
- `status`: enum (rascunho, ativo, etc.)
- `source_type`: enum (manual, ai_generated)

**checklist_items:**
- `id`: UUID
- `checklist_id`: UUID (foreign key)
- `title`: string
- `completed`: boolean
- `order_index`: integer
- `criticality`: enum (low, medium, high)
- `required`: boolean

## Testing

To test the feature:

1. Ensure OpenAI API key is configured in Supabase
2. Deploy the Edge Function:
   ```bash
   supabase functions deploy generate-checklist
   ```
3. Test the frontend integration by creating a checklist with AI

## Example Prompts

- "Checklist de onboarding de novos funcionários"
- "Checklist de segurança para embarcações"
- "Checklist de viagem corporativa"
- "Checklist de manutenção preventiva"
- "Checklist de preparação para auditoria"

## Monitoring

The Edge Function logs:
- Incoming prompts
- Number of items generated
- Any errors that occur

Check Supabase Edge Function logs for debugging:
```bash
supabase functions logs generate-checklist
```

## Cost Considerations

- Each API call to GPT-4 incurs OpenAI costs
- Average cost per generation: ~$0.01-0.02
- Consider implementing rate limiting or caching for production use

## Future Enhancements

- [ ] Add support for different checklist types (safety, travel, HR, etc.)
- [ ] Allow users to customize the number of items to generate
- [ ] Add support for editing generated items before saving
- [ ] Implement caching for common prompts
- [ ] Add analytics for AI usage tracking
- [ ] Support for multiple languages
