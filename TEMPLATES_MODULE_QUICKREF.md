# Templates Module - Quick Reference

## 🚀 Quick Start

### Access the Module
Navigate to: `/admin/templates`

### Create Your First Template
1. Enter a title
2. (Optional) Add a prompt for AI
3. Click "Gerar com IA" or manually type content
4. Click "Salvar Template"

### Use a Template
1. Find template in list
2. Click "Aplicar"
3. Edit in documents-ai page

## 🎯 Key Features

### AI Assistance
- **Generate**: Creates template content with variable fields from title/purpose
- **Enhance**: Improves template while preserving structure and [VARIABLE_FIELDS]
- **Suggest Title**: Generates title from content

### Template Management
- **Create**: New templates with AI help
- **Edit**: Modify existing templates
- **Delete**: Remove templates (with confirmation)
- **Duplicate**: Clone templates
- **Search**: Find templates by title/content
- **Filter**: By favorites or private status

### Template Properties
- **Favorite**: ⭐ Quick access to important templates
- **Private**: 🔒 Visible only to you
- **Public**: 👁️ Visible to all users (default)

### Export & Apply
- **PDF Export**: Download template as PDF
- **Apply to Docs**: Use in AI document generation

## 📋 Common Tasks

### Generate Template with AI
```
1. Enter title: "Project Proposal Template"
2. Add prompt (optional): "Include executive summary, objectives, timeline"
3. Click "Gerar com IA"
4. Review and save
```

### Make Template Private
```
1. Find template in list
2. Click lock icon button
3. Template now private
```

### Export to PDF
```
1. Find template
2. Click "PDF" button
3. File downloads automatically
```

## 🔧 Database Schema

```sql
Table: templates
- id (UUID, PK)
- title (TEXT)
- content (TEXT)
- created_by (UUID, FK → auth.users)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
- is_favorite (BOOLEAN)
- is_private (BOOLEAN)
```

## 🔐 Security

- ✅ RLS enabled
- ✅ Users see own + public templates
- ✅ Only creator can edit/delete
- ✅ All authenticated users can create

## 🎨 UI Components

### Create Tab
- Title input
- Prompt textarea
- AI generation buttons
- Content textarea
- Save/Update button

### List Tab
- Search bar
- Filter buttons
- Template cards grid
- Action buttons per card

## 📊 Integration Points

### Documents AI
- Apply template → redirects to `/admin/documents/ai`
- Template loads via sessionStorage
- Ready for AI enhancement

### Edge Functions Used
- `generate-template`: Specialized template generation with variable fields
- `enhance-template`: Template enhancement preserving structure and variables

## 🎭 User Roles

Currently all authenticated users have the same access:
- Create templates
- Edit own templates
- View public templates
- Delete own templates

## 💡 Tips

1. **Use Descriptive Titles**: Makes searching easier
2. **Mark Favorites**: Quick access to common templates
3. **Make Private**: Keep drafts or personal templates private
4. **Use AI Wisely**: Good prompts = better content
5. **Duplicate Often**: Start from existing templates

## 🐛 Troubleshooting

### Template not saving?
- Check you're logged in
- Ensure title and content are filled
- Check browser console for errors

### AI not generating?
- Verify OpenAI edge functions are working
- Check if prompt/title is provided
- Look for error toasts

### Can't see template?
- Check if it's marked private by another user
- Verify you're filtering correctly
- Refresh the page

### PDF not downloading?
- Check browser download permissions
- Ensure popup blocker is off
- Verify template has content

## 📁 File Locations

```
Migration:  supabase/migrations/20251014191200_create_templates_table.sql
Page:       src/pages/admin/templates.tsx
Route:      src/App.tsx (line ~72 and ~195)
Types:      src/integrations/supabase/types.ts
```

## 🔄 Workflow Example

```
User Journey: Creating and Using a Template

1. Navigate to /admin/templates
2. Click "Criar Template" tab
3. Enter title: "Meeting Minutes"
4. Click "Gerar com IA"
5. Review AI-generated structure
6. Click "Salvar Template"
7. Switch to "Meus Templates" tab
8. Find "Meeting Minutes" template
9. Click "Aplicar"
10. Redirected to /admin/documents/ai
11. Template content loaded
12. Add meeting-specific details
13. Generate final document with AI
14. Save completed document
```

## 📞 Support

For issues or questions:
- Check TEMPLATES_MODULE_GUIDE.md for detailed docs
- Review migration file for database schema
- Check browser console for errors
- Verify Supabase connection

---

**Quick Stats:**
- Lines of Code: ~800 (frontend) + 400 (edge functions)
- AI Functions: 3 (2 specialized for templates)
- Database Tables: 1
- RLS Policies: 4
- UI Components: 15+
- Features: 12+

**Status:** ✅ Production Ready
