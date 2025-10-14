# TemplateList Component

## Overview
The TemplateList component provides a user interface for browsing, filtering, and applying document templates. It integrates with Supabase for data storage and supports various template management features.

## Features

### ✅ Template Filtering
- **All Templates**: View all available templates
- **Favorites**: Filter templates marked as favorites
- **Private**: Show only private templates

### ✅ Template Actions
- **Apply**: Load template content into the AI document editor (`/admin/documents/ai`)
- **Copy**: Copy template content to clipboard

### ✅ Responsive Design
- Grid layout that adapts to screen size
- Mobile-friendly interface using Tailwind CSS

## Usage

### Basic Implementation

```tsx
import TemplateList from "@/components/templates/TemplateList";

function MyPage() {
  return <TemplateList />;
}
```

### With Page Wrapper

```tsx
import TemplateList from "@/components/templates/TemplateList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function DocumentTemplatesPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Templates de Documentos</CardTitle>
      </CardHeader>
      <CardContent>
        <TemplateList />
      </CardContent>
    </Card>
  );
}
```

## Database Schema

The component uses the `templates` table in Supabase:

```sql
CREATE TABLE public.templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_favorite BOOLEAN DEFAULT false,
  is_private BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

## Integration with AI Documents

When a user clicks "Aplicar" on a template:
1. Template content is saved to `localStorage` with key `applied_template`
2. User is navigated to `/admin/documents/ai`
3. The AI documents page loads the template content from localStorage
4. User can then edit and save the document

## Sample Data

The migration `20251014193000_insert_sample_templates.sql` includes sample templates:
- Relatório de Reunião (Meeting Report)
- Memorando Interno (Internal Memo)
- Checklist de Viagem (Travel Checklist)
- Notas Pessoais (Personal Notes)
- Solicitação de Férias (Vacation Request)

## Testing

Comprehensive test suite includes:
- Component rendering
- Template loading and display
- Filter functionality
- Apply action (localStorage + navigation)
- Copy to clipboard
- Error handling
- Empty state

Run tests:
```bash
npm test src/tests/components/templates/TemplateList.test.tsx
```

## Dependencies

- React
- React Router (for navigation)
- Supabase (for data storage)
- Tailwind CSS (for styling)
- shadcn/ui components (Button, Card, etc.)

## Row Level Security (RLS)

The templates table has RLS policies to ensure:
- Users can view public templates and their own private templates
- Users can only create, update, and delete their own templates
- Private templates are hidden from other users

## Future Enhancements

Potential improvements:
- Template editing interface
- Template creation form
- Search functionality
- Tags/categories
- Template sharing
- Template versioning
- Rich text preview
