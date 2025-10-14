# Template Editor Component

## Overview

The Template Editor is a rich text editor component that allows users to create, edit, and manage reusable document templates with AI-powered content generation.

## Features

- **Rich Text Editing**: Built with TipTap editor using StarterKit extension
- **AI-Powered Generation**: Generate template content automatically using OpenAI GPT-4o-mini
- **PDF Export**: Export templates to PDF format using html2pdf.js
- **Database Integration**: Save templates to Supabase with Row Level Security (RLS)
- **User Authentication**: Templates are associated with authenticated users
- **Template Metadata**: Support for title, content, favorites, and privacy settings

## Usage

### Basic Usage

```tsx
import TemplateEditor from "@/components/templates/TemplateEditor";

function MyPage() {
  return <TemplateEditor />;
}
```

### Page Integration

Access the Template Editor at: `/admin/templates/editor`

The page is protected with role-based access control (admin, hr, manager roles).

## Component Structure

### TemplateEditor Component

**Location**: `src/components/templates/TemplateEditor.tsx`

**Key Features**:
- Title input field
- Rich text editor area
- Three action buttons:
  - Generate with AI
  - Save to Database
  - Export to PDF
- Real-time validation
- Loading states
- Error handling with toast notifications

### Database Schema

**Table**: `templates`

```sql
CREATE TABLE public.templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_favorite BOOLEAN DEFAULT false,
  is_private BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

**RLS Policies**:
- Users can view their own templates and public templates
- Users can insert, update, and delete only their own templates

### Edge Function

**Location**: `supabase/functions/generate-template/index.ts`

**Endpoint**: `POST /functions/v1/generate-template`

**Request Body**:
```json
{
  "title": "Template title or description"
}
```

**Response**:
```json
{
  "content": "Generated template content with placeholders",
  "timestamp": "2025-10-14T19:28:10.620Z"
}
```

## AI Template Generation

The AI generates templates with:
- Professional structure
- Placeholder syntax: `{{variable_name}}`
- Appropriate sections and formatting
- Brazilian Portuguese language
- Context-aware content based on title

Example placeholders:
- `{{nome}}` - Name
- `{{data}}` - Date
- `{{empresa}}` - Company
- `{{cargo}}` - Position

## PDF Export

Templates are exported with the following settings:
- Margin: 1 inch
- Format: Letter size
- Orientation: Portrait
- Image quality: 98%
- Scale: 2x for better quality

## Testing

Tests are located at: `src/tests/components/templates/TemplateEditor.test.tsx`

Run tests:
```bash
npm test -- src/tests/components/templates/TemplateEditor.test.tsx
```

## Dependencies

- `@tiptap/react` - Rich text editor framework
- `@tiptap/starter-kit` - Basic editor extensions
- `html2pdf.js` - PDF generation library
- `@supabase/supabase-js` - Backend integration
- `lucide-react` - Icons

## Environment Variables

Required for the Edge Function:
```bash
OPENAI_API_KEY=your_openai_api_key_here
```

## Migration

To apply the database schema:

```bash
# Migration file
supabase/migrations/20251014192800_create_templates_table.sql
```

The migration creates:
- `templates` table
- RLS policies
- Indexes for performance
- Trigger for automatic `updated_at` timestamp

## Future Enhancements

Suggested improvements:
- Template categories and tags
- Template sharing between users
- Template versioning
- Rich text formatting toolbar
- Template preview mode
- Template variables/placeholders UI
- Template listing and management page
- Template duplication feature
- Bulk operations
- Template search and filtering

## Related Components

- `TemplateManager` - List and manage templates
- `DocumentsAI` - AI document generation page
- `CollaborativeDocumentEditor` - Real-time collaborative editing

## Best Practices

1. **Always provide a title** before generating or saving
2. **Review AI-generated content** before saving
3. **Use meaningful placeholders** like `{{field_name}}`
4. **Test templates** with actual data before using in production
5. **Keep templates focused** on a single document type
6. **Use privacy settings** appropriately for sensitive templates

## Support

For issues or questions, please refer to the main repository documentation or create an issue on GitHub.
