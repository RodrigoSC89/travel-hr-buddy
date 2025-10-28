# Template Editor Component

## Overview

The Template Editor is a rich text editor component that allows users to create, edit, and manage reusable document templates with AI-powered content generation, dynamic placeholders, and multiple export formats.

## Features (v1.0)

- **Rich Text Editing**: Built with TipTap editor using StarterKit extension
- **Formatting Toolbar**: Complete toolbar with Bold, Italic, Headings, Lists, and Code blocks
- **AI-Powered Generation**: Generate template content automatically using OpenAI GPT-4o-mini
- **Dynamic Placeholders**: Insert and manage placeholders with {{variable}} syntax
- **Live Preview**: Side-by-side editor and preview tabs for real-time visualization
- **PDF Export**: Export templates to PDF format using html2pdf.js
- **HTML Export**: Export templates to HTML format for external use
- **Database Integration**: Save templates to Supabase with Row Level Security (RLS)
- **User Authentication**: Templates are associated with authenticated users
- **Template Metadata**: Support for title, content, favorites, and privacy settings
- **Template Editing**: Full CRUD operations with edit functionality

## Usage

### Basic Usage

```tsx
import TemplateEditor from "@/components/templates/TemplateEditor";

function MyPage() {
  return <TemplateEditor />;
}
```

### Page Integration

- **Create New Template**: `/admin/templates/editor`
- **Edit Existing Template**: `/admin/templates/edit/[id]`

Both pages are protected with role-based access control (admin, hr, manager roles).

## Component Structure

### TemplateEditor Component

**Location**: `src/components/templates/TemplateEditor.tsx`

**Key Features**:
- Title input field
- Tabbed interface (Editor/Preview)
- Rich text formatting toolbar:
  - Bold, Italic
  - Heading 1, Heading 2
  - Bullet List, Numbered List
  - Code Block
  - Placeholder Insertion Dialog
- Action buttons:
  - Generate with AI
  - Save to Database
  - Export to PDF
  - Export to HTML
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

## Dynamic Placeholders

The editor provides an intuitive UI for inserting placeholders:

1. Click the "+ Placeholder" button in the toolbar
2. Enter a descriptive name (e.g., "nome", "data", "empresa")
3. The system automatically inserts the placeholder with {{}} syntax
4. Placeholders are highlighted in the preview

Example placeholders:
- `{{nome}}` - Name
- `{{data}}` - Date
- `{{empresa}}` - Company
- `{{cargo}}` - Position
- `{{valor}}` - Value/Amount
- `{{endereco}}` - Address

## Preview Functionality

The editor includes a tabbed interface:

- **Editor Tab**: Full editing capabilities with toolbar
- **Preview Tab**: Real-time HTML rendering showing exactly how the template will appear

Switch between tabs to verify formatting and placeholder positioning before saving.

## PDF Export

Templates can be exported to PDF with the following settings:
- Margin: 1 inch
- Format: Letter size
- Orientation: Portrait
- Image quality: 98%
- Scale: 2x for better quality

## HTML Export

Templates can be exported to HTML format:
- Pure HTML output with inline styles
- Preserves all formatting
- Can be used in external systems or email clients
- Download as .html file

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

## Completed Features (v1.0)

✅ Completed:
- Rich text formatting toolbar (Bold, Italic, Headings, Lists, Code)
- Template preview mode (Tab-based interface)
- Template variables/placeholders UI (Dialog-based insertion)
- HTML export functionality
- Template editing functionality
- Template creation with AI

## Future Enhancements (v2.0)

Planned improvements for future versions:
- Template categories and tags
- Template sharing between users
- Template versioning with history
- Template duplication feature
- Bulk operations
- Template search and filtering in manager
- Version comparison UI
- Advanced collaborative editing
- Template analytics (usage statistics)

## Related Components

- `TemplateManager` - List and manage templates (located at `src/components/templates/template-manager.tsx`)
- `EditTemplatePage` - Edit existing templates (located at `src/pages/admin/templates/edit/[id].tsx`)
- `DocumentsAI` - AI document generation page
- `CollaborativeDocumentEditor` - Real-time collaborative editing
- `ApplyTemplateModal` - Apply templates to documents

## Best Practices

1. **Always provide a title** before generating or saving
2. **Review AI-generated content** before saving
3. **Use meaningful placeholders** like `{{field_name}}` with descriptive names
4. **Preview before saving** - Use the Preview tab to verify formatting
5. **Test templates** with actual data before using in production
6. **Keep templates focused** on a single document type
7. **Use privacy settings** appropriately for sensitive templates
8. **Format consistently** - Use the toolbar for consistent text formatting

## Support

For issues or questions, please refer to the main repository documentation or create an issue on GitHub.
