# Templates Module

## Purpose / Description

The Templates module provides **template management and generation** for various documents, forms, and workflows throughout the system.

**Key Use Cases:**
- Create and manage document templates with AI assistance
- Email and notification templates
- Form templates for data collection
- Report templates for analytics
- Template versioning and sharing

## Current Implementation

The templates functionality is currently implemented in the following locations:

### Pages
- **`src/pages/admin/templates.tsx`** — Main templates management page with AI features
- **`src/pages/admin/templates/editor.tsx`** — Template editor page wrapper
- **`src/pages/admin/documents/ai-templates.tsx`** — AI-powered template generation page

### Components
Located in `src/components/templates/`:
- **`TemplateEditor.tsx`** — Rich text template editor with TipTap
- **`template-editor-with-rewrite.tsx`** — Template editor with AI rewrite capabilities
- **`template-manager.tsx`** — Template management and listing component

### Database
- **Table:** `public.templates` — Stores template data
- **Columns:** id, title, content, is_favorite, is_private, created_by, created_at, updated_at
- **RLS Policies:** Row Level Security enabled for user-specific access

### Features
- ✅ AI-powered template generation
- ✅ AI content rewriting
- ✅ Rich text editing with TipTap
- ✅ PDF export functionality
- ✅ Favorite and private templates
- ✅ Template search and filtering
- ✅ Template duplication
- ✅ Apply templates to documents

## External Integrations

- **Supabase** — Template storage and authentication
- **Supabase Edge Functions** — AI generation (`generate-document`, `rewrite-document`, `generate-template`)
- **TipTap** — Rich text editor
- **jsPDF** — PDF export
- **html2pdf.js** — Advanced PDF generation

## Routes

- `/admin/templates` — Main templates page
- `/admin/templates/editor` — Template editor
- `/admin/documents/ai/templates` — AI templates page

## Status

🟢 **Functional** — Template system operational with AI features

## TODOs / Improvements

- [ ] Add conditional logic in templates (if/else statements)
- [ ] Create template analytics (usage tracking, effectiveness metrics)
- [ ] Add multi-language template support
- [ ] Implement template approval workflow
- [ ] Add template versioning history
- [ ] Create template marketplace for sharing
- [ ] Add more formatting options to the editor
- [ ] Implement template variables/placeholders system
