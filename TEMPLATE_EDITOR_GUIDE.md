# Template Editor - Implementation Guide

## Overview

This implementation provides a complete Template API system with a rich text editor, database storage, AI generation, and PDF export capabilities.

## Features

✅ **Rich Text Editor** - TipTap-based WYSIWYG editor with StarterKit extensions
✅ **Database Storage** - PostgreSQL table with RLS policies for secure storage
✅ **Favorite & Private Flags** - Mark templates as favorites or keep them private
✅ **AI Generation** - Generate templates automatically using OpenAI GPT-4o-mini
✅ **PDF Export** - Export templates to PDF using html2pdf.js
✅ **User Authentication** - All operations require authenticated users

## Files Created

### 1. Database Migration
**File**: `supabase/migrations/20251014200000_create_templates_table.sql`

Creates the `templates` table with the following schema:
```sql
- id: UUID (Primary Key)
- title: TEXT (Required)
- content: TEXT (Required)
- is_favorite: BOOLEAN (Default: false)
- is_private: BOOLEAN (Default: false)
- created_by: UUID (Foreign Key to auth.users)
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

Includes RLS policies for secure access and automatic updated_at trigger.

### 2. Supabase Edge Function
**File**: `supabase/functions/generate-template/index.ts`

AI-powered template generation endpoint:
- **Endpoint**: `/api/templates/generate`
- **Method**: POST
- **Body**: `{ title: string }`
- **Response**: `{ content: string, timestamp: string }`

Features:
- Retry logic with exponential backoff
- Request timeout handling
- OpenAI GPT-4o-mini integration
- HTML template generation with placeholders

### 3. React Component
**File**: `src/components/templates/TemplateEditor.tsx`

Complete template editor component with:
- TipTap rich text editor
- Title input
- Favorite checkbox
- Private checkbox
- Save to database
- AI generation button
- PDF export button

### 4. Page Component
**File**: `src/pages/templates/TemplateEditorPage.tsx`

Simple wrapper page for the template editor.

### 5. Type Definitions
**File**: `src/integrations/supabase/types.ts` (updated)

Added TypeScript types for the `templates` table with Row, Insert, and Update interfaces.

### 6. Routing
**File**: `src/App.tsx` (updated)

Added route: `/templates/editor`

## Usage

### Accessing the Template Editor

Navigate to: `/templates/editor`

### Creating a Template

1. Enter a title for your template
2. Optionally check "Favorito" to mark as favorite
3. Optionally check "Privado" to keep it private
4. Either:
   - Write content directly in the editor, OR
   - Click "Gerar com IA" to generate content based on the title
5. Click "Salvar" to save to the database

### Exporting to PDF

1. Create or edit your template content
2. Click "Exportar PDF"
3. The template will be downloaded as a PDF file

## API Integration

### Calling the AI Generation Function

```typescript
const response = await supabase.functions.invoke('generate-template', {
  body: { title: 'Your Template Title' },
});

if (response.data?.content) {
  // Use the generated content
  editor.commands.setContent(response.data.content);
}
```

### Saving a Template

```typescript
const { error } = await supabase.from('templates').insert([
  {
    title: 'My Template',
    content: '<p>Template content</p>',
    is_favorite: true,
    is_private: false,
    created_by: user.id,
  },
]);
```

### Querying Templates

```typescript
// Get all templates (respects RLS policies)
const { data: templates } = await supabase
  .from('templates')
  .select('*')
  .order('created_at', { ascending: false });

// Get favorite templates only
const { data: favorites } = await supabase
  .from('templates')
  .select('*')
  .eq('is_favorite', true);
```

## Security

### Row-Level Security (RLS)

The `templates` table has the following RLS policies:

1. **SELECT**: Users can view:
   - Their own templates
   - Public templates (is_private = false)

2. **INSERT**: Users can create templates linked to their user ID

3. **UPDATE**: Users can only update their own templates

4. **DELETE**: Users can only delete their own templates

### Authentication Requirements

All operations require an authenticated user via Supabase Auth.

## Dependencies Added

- `html2pdf.js` - For PDF export functionality

## Testing

The implementation includes:
- ✅ TypeScript compilation (no errors)
- ✅ ESLint validation (all new files pass)
- ✅ Build successful
- ✅ Route integration

## Next Steps

To extend this implementation, consider:

1. **Template List Page** - Create a page to view and manage saved templates
2. **Template Categories** - Add category/type fields to organize templates
3. **Template Sharing** - Allow users to share private templates with others
4. **Template Versions** - Track changes and maintain version history
5. **Rich Formatting** - Add more TipTap extensions for tables, images, etc.
6. **Template Variables** - Add a system to define and fill template variables
7. **Template Preview** - Add a preview mode before saving

## Environment Variables

Ensure the following environment variable is set in Supabase:

```bash
OPENAI_API_KEY=sk-...
```

This is required for the AI template generation feature.

## API Example Usage

### Frontend Integration

```tsx
import TemplateEditor from '@/components/templates/TemplateEditor';

function MyPage() {
  return (
    <div>
      <h1>Create a Template</h1>
      <TemplateEditor />
    </div>
  );
}
```

### Standalone Usage

The component can be used standalone or integrated into existing pages. It's fully self-contained with all necessary state management and API calls.

## Troubleshooting

### Issue: AI Generation Fails
- **Solution**: Check that OPENAI_API_KEY is set in Supabase Edge Function environment variables

### Issue: Templates Not Saving
- **Solution**: Ensure user is authenticated and RLS policies are properly set up in the database

### Issue: PDF Export Not Working
- **Solution**: Verify html2pdf.js is properly installed: `npm install html2pdf.js`

## Code Quality

All code follows the project's standards:
- ✅ TypeScript strict mode
- ✅ ESLint rules (doublequotes, proper imports)
- ✅ Consistent naming conventions
- ✅ Error handling with user feedback (toasts)

## Performance Considerations

- Editor uses lazy loading for optimal bundle size
- PDF generation is client-side (no server load)
- AI generation includes retry logic and timeout handling
- Database queries are optimized with indexes

## Browser Compatibility

The implementation works on all modern browsers that support:
- ES6+
- Fetch API
- Promise/Async-await
- Canvas API (for PDF export)

---

**Implementation completed**: October 14, 2025
**Version**: 1.0.0
**Status**: ✅ Production Ready
