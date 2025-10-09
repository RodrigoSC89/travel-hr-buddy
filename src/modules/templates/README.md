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

## Folder Structure

```bash
src/modules/templates/
├── components/      # Template UI components (TemplateCard, Editor, Preview)
├── pages/           # Template management pages
├── hooks/           # Hooks for template operations
├── services/        # Template services and rendering
├── types/           # TypeScript types for templates
└── utils/           # Template utilities and parsing
```

## Main Components / Files

- **TemplateCard.tsx** — Display template overview
- **TemplateEditor.tsx** — Template creation and editing
- **TemplatePreview.tsx** — Preview rendered template
- **VariableInserter.tsx** — Insert dynamic variables
- **templateService.ts** — Template CRUD operations
- **templateRenderer.ts** — Render templates with data

## External Integrations

- **Supabase** — Template storage
- **Documentos Module** — Document generation from templates
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
