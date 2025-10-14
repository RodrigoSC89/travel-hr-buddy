# AI Document Editor with Templates

## Overview

This implementation adds a powerful TipTap-based document editor with template management capabilities for AI-generated documents.

## Features

### 1. TipTap Editor (`/admin/documents/ai`)
- Rich text editor powered by TipTap
- **Template Application**: Automatically loads templates from localStorage when navigating from the templates page
- **AI Integration**: 
  - Rewrite selected text with AI
  - Original AI document generation (from the old page)
- **Document Management**:
  - Save to Supabase database
  - Export as PDF
  - Title and content editing

### 2. Template Manager (`/admin/documents/ai/templates`)
- **Template CRUD Operations**:
  - Create new templates
  - Edit existing templates
  - Delete templates
  - List all templates with search
  
- **Template Features**:
  - ⭐ Favorite toggle: Mark templates as favorites
  - 🔒 Private/Public toggle: Control template visibility
  - 🏷️ Tags: Organize templates with custom tags
  - 🔍 Search: Filter by title, content, or tags (ilike)
  
- **Template Actions**:
  - **Apply**: Saves template to localStorage and navigates to editor (editor auto-applies it)
  - **Copy**: Copies template content to clipboard
  - **Edit**: Opens dialog to modify template
  - **Delete**: Removes template (with confirmation)

## Database Schema

### `ai_document_templates` Table
```sql
- id: UUID (Primary Key)
- title: TEXT (Required)
- content: TEXT (Required)
- created_by: UUID (Foreign Key to auth.users)
- is_favorite: BOOLEAN (Default: false)
- is_private: BOOLEAN (Default: false)
- tags: TEXT[] (Array of strings)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP (Auto-updated)
```

### Row Level Security (RLS)
- Users can view their own templates and public templates
- Users can only create, update, and delete their own templates

## User Flow

### Creating and Applying a Template

1. Navigate to `/admin/documents/ai/templates`
2. Click "Novo Template"
3. Fill in:
   - Title (required)
   - Content (required)
   - Tags (optional)
   - Mark as favorite (optional)
   - Mark as private (optional)
4. Click "Criar Template"
5. Template appears in the list
6. Click "Aplicar" button
7. System stores template in localStorage and navigates to editor
8. Editor automatically loads and applies the template

### Editing a Document

1. Navigate to `/admin/documents/ai`
2. If coming from templates, the template content is pre-loaded
3. Edit content using TipTap editor
4. Select text and click "Reescrever Seleção com IA" to rewrite it with AI
5. Click "Salvar no Supabase" to save
6. Click "Exportar PDF" to download as PDF

## Technical Implementation

### localStorage Bridge
The template application uses localStorage as a bridge between pages:
- When "Aplicar" is clicked in templates page:
  ```javascript
  localStorage.setItem("applied_template", template.content);
  localStorage.setItem("applied_template_title", template.title);
  navigate("/admin/documents/ai");
  ```
- Editor page checks localStorage on mount:
  ```javascript
  useEffect(() => {
    const storedTemplate = localStorage.getItem("applied_template");
    if (storedTemplate) {
      editor.commands.setContent(storedTemplate);
      localStorage.removeItem("applied_template");
    }
  }, [editor]);
  ```

### TipTap Configuration
- Uses `@tiptap/react` with `StarterKit` extensions
- Configured with prose styling for rich text editing
- Minimum height of 300px

### AI Features
- Rewrite selected text: Calls `rewrite-document` Supabase function
- Full document generation: Calls `generate-document` Supabase function

## Routes

- `/admin/documents/ai` - Main TipTap editor page
- `/admin/documents/ai/templates` - Template management page
- `/admin/documents` - Document list (existing)

## Testing

Comprehensive test coverage (15/17 tests passing):
- Template CRUD operations
- Template filtering and search
- Template application via localStorage
- Document saving and exporting
- PDF generation
- AI text rewriting

Test files:
- `src/tests/pages/admin/documents/ai-editor.test.tsx`
- `src/tests/pages/admin/documents/ai-templates.test.tsx`

## Dependencies

- `@tiptap/react` - React integration for TipTap
- `@tiptap/starter-kit` - Basic TipTap extensions
- `jspdf` - PDF generation
- `lucide-react` - Icons

## Migration

Database migration file:
- `supabase/migrations/20251014193000_create_ai_document_templates.sql`

Run migrations before using this feature:
```bash
supabase db push
```

## Future Enhancements

Potential improvements mentioned in problem statement:
- ✅ Rewrite selected text with AI (implemented)
- ✅ Favorite/Private toggles (implemented)
- ✅ Search by title (ilike) (implemented)
- ⏳ Semantic search (not implemented yet)
- ⏳ More TipTap extensions (e.g., tables, images)
- ⏳ Template categories
- ⏳ Template sharing between users
- ⏳ Template usage statistics

## Notes

- The old `/admin/documents-ai.tsx` page still exists but is not actively routed
- Templates are user-scoped with RLS
- Public templates can be viewed by all users but only edited by creator
- Private templates are only visible to creator
