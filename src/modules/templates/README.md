# Templates Module

## Purpose / Description

The Templates module provides **template management and generation** for various documents, forms, and workflows throughout the system.

**Key Use Cases:**
- Create and manage document templates
- Email and notification templates
- Form templates for data collection
- Report templates for analytics
- Workflow templates for automation
- Checklist templates
- Template versioning and sharing

## Actual Structure

The Templates module is currently implemented across different directories:

```bash
# Components
src/components/templates/
├── TemplateEditor.tsx               # Rich text template editor with TipTap
├── template-editor-with-rewrite.tsx # Template editor with AI rewrite capabilities
└── template-manager.tsx             # Template management UI (demo/showcase)

# Pages
src/pages/
├── Templates.tsx                    # Main templates page
└── admin/templates.tsx              # Admin template management page
    └── editor.tsx                   # Template editor page

# Module Documentation
src/modules/templates/
└── README.md                        # This file
```

## Main Components / Files

### Components (src/components/templates/)
- **TemplateEditor.tsx** — Rich text editor with AI generation, save to database, and PDF export
- **template-editor-with-rewrite.tsx** — Template editor with AI rewrite functionality
- **template-manager.tsx** — Template management UI component (demo/showcase)

### Pages
- **src/pages/Templates.tsx** — Main templates page using TemplateManager component
- **src/pages/admin/templates.tsx** — Full-featured admin template page with CRUD operations, AI integration, and filters
- **src/pages/admin/templates/editor.tsx** — Standalone template editor page

## Features

### Admin Template Page (src/pages/admin/templates.tsx)
- ✅ Create, edit, duplicate, and delete templates
- ✅ AI-powered template generation
- ✅ AI rewriting and improvement suggestions
- ✅ Search and filter functionality
- ✅ Favorite and private templates
- ✅ PDF export
- ✅ Apply templates to Documents AI module
- ✅ Database integration with Supabase

### Template Editor Component
- ✅ Rich text editing with TipTap
- ✅ AI content generation
- ✅ Database persistence
- ✅ PDF export capability
- ✅ User authentication integration

## Database Schema

**Table**: `templates`

```sql
CREATE TABLE templates (
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

## External Integrations

- **Supabase** — Template storage and authentication
- **OpenAI API** — AI template generation and rewriting
- **Documentos-IA Module** — Document generation from templates
- **Smart Workflow Module** — Workflow template integration

## Status

🟢 **Functional** — Template system operational

## TODOs / Improvements

- [ ] Add rich text editor with more formatting options
- [ ] Implement template marketplace
- [ ] Add conditional logic in templates
- [ ] Create template analytics (usage, effectiveness)
- [ ] Add multi-language template support
- [ ] Implement template approval workflow
- [ ] Add template cloning and inheritance
- [ ] Consolidate template components into module structure
