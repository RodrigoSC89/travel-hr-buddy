# Templates Module - Quick Reference Guide

## 🚀 Quick Start

### Access the Module
Navigate to: `/admin/templates`

### Create Your First Template
1. Click "Criar Novo Template"
2. Enter title: "Relatório de Inspeção"
3. Enter purpose: "Relatório técnico para inspeção de sistemas"
4. Click "Gerar com IA"
5. Review and click "Salvar Template"

## 📍 Key Routes

- `/admin/templates` - Template management page
- `/admin/documents/ai` - Apply templates to generate documents

## 🔑 Key Features

### Template Creation
- **AI Generation**: Automatic template creation using GPT-4
- **Enhancement**: Improve templates with AI
- **Manual Editing**: Edit generated content before saving

### Template Management
- **Search**: Find templates by title or content
- **Favorites**: Mark important templates
- **Private/Public**: Control template visibility
- **Export PDF**: Download templates as PDF
- **Duplicate**: Create copies of templates
- **Delete**: Remove unwanted templates

### Template Application
- **Apply to Documents**: Use templates in document generation
- **Pre-filled Content**: Templates automatically populate document forms

## 🗄️ Database

**Table**: `templates`

**Key Fields**:
- `title` - Template name
- `content` - Template content with variables [FIELD]
- `is_favorite` - Favorite status
- `is_private` - Privacy setting
- `created_by` - Owner user ID

## 🤖 AI Functions

### Generate Template
```typescript
supabase.functions.invoke("generate-template", {
  body: { 
    title: "Template Title",
    purpose: "What it's for"
  }
})
```

### Enhance Template
```typescript
supabase.functions.invoke("enhance-template", {
  body: { 
    content: "Template content",
    context: "Optional context"
  }
})
```

## 🎯 Common Use Cases

### 1. Maritime Inspection Report
```
Title: Inspeção de Sistema de Propulsão
Purpose: Relatório técnico marítimo para sistema azimutal
```

### 2. Safety Checklist
```
Title: Checklist de Segurança
Purpose: Lista de verificação para operações seguras
```

### 3. Maintenance Procedure
```
Title: Procedimento de Manutenção
Purpose: Guia passo a passo para manutenção técnica
```

## 🔧 Technical Details

### Stack
- **Frontend**: React + TypeScript + Tailwind
- **Database**: Supabase (PostgreSQL)
- **AI**: OpenAI GPT-4o-mini
- **PDF**: jsPDF
- **Icons**: Lucide React

### File Locations
- **Page**: `src/pages/admin/templates.tsx`
- **Migration**: `supabase/migrations/20251014192500_create_templates_table.sql`
- **Generate Function**: `supabase/functions/generate-template/index.ts`
- **Enhance Function**: `supabase/functions/enhance-template/index.ts`

## 🔐 Security

### RLS Policies
- Public templates visible to all
- Private templates only to owner
- Only owner can update/delete

### Authentication
- User must be logged in
- All actions require authentication

## 📊 Status

✅ Fully Implemented
✅ Build Successful
✅ Linting Passed
🟢 Production Ready

## 🐛 Troubleshooting

### Issue: Templates not loading
**Solution**: Check Supabase connection and RLS policies

### Issue: AI generation fails
**Solution**: Verify OPENAI_API_KEY is set in Supabase secrets

### Issue: PDF export not working
**Solution**: Ensure jsPDF is properly installed

## 📝 Variable Format

Templates support variable fields using this format:
```
[NOME_CAMPO]
[DATA]
[EMBARCACAO]
[TECNICO]
```

These can be filled in when the template is applied to a document.

## 🎨 UI Components Used

- Card, CardContent, CardHeader, CardTitle
- Button (multiple variants)
- Input
- Textarea
- Badge
- Lucide Icons

## 💡 Pro Tips

1. Use descriptive template titles for easy searching
2. Mark frequently used templates as favorites
3. Keep templates private during drafting
4. Use the enhance feature to improve AI-generated content
5. Export important templates as PDF backups
6. Duplicate templates to create variations

## 📚 Related Modules

- **Documents AI** (`/admin/documents/ai`) - Apply templates
- **Documents** (`/admin/documents`) - View generated documents
- **Workflows** (`/admin/workflows`) - Automate template usage

## 🔄 Integration Flow

```
Templates Page → Apply Template → Documents AI → Generate Document → Save
```

## 📞 Support

For assistance:
1. Check the detailed implementation guide: `TEMPLATES_MODULE_IMPLEMENTATION.md`
2. Review code comments in source files
3. Consult Supabase and OpenAI documentation
