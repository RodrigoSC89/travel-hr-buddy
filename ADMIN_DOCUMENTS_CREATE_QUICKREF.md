# 📄 Admin Documents Create - Quick Reference

## 🚀 Quick Access
**URL**: `/admin/documents/create`

## 🎯 Key Features

### 1️⃣ TipTap Rich Text Editor
- Bold, Italic formatting
- Headings (H2)
- Bullet and numbered lists
- Undo/Redo support

### 2️⃣ Template Application
**Button**: 📂 Aplicar Template

**Two Options**:
- **Use Existing Template**: Select from library → Fill variables → Apply
- **Generate with AI**: Describe template → GPT-4 generates → Apply

### 3️⃣ Document Saving
**Button**: 💾 Salvar Documento
- Saves to `ai_generated_documents` table
- Redirects to `/admin/documents` on success

## 📋 User Workflow

### Create from Scratch:
1. Enter title
2. (Optional) Enter description
3. Write content in editor
4. Click "💾 Salvar Documento"

### Create from Template:
1. Click "📂 Aplicar Template"
2. Select template or generate with AI
3. Fill in `{{variables}}` (if any)
4. Click "Aplicar Template"
5. Edit content as needed
6. Enter title
7. Click "💾 Salvar Documento"

## 🔧 Technical Info

### Components:
- `TipTapEditor.tsx` - Rich text editor
- `ApplyTemplateModal.tsx` - Template modal
- `create.tsx` - Main page

### Database:
Table: `ai_generated_documents`
- `title` (required)
- `content` (HTML from TipTap)
- `prompt` (description or auto-generated)
- `generated_by` (user ID)

### API:
- `supabase.functions.invoke("generate-template")`
- Uses GPT-4o-mini model

## ✅ Testing

```bash
# Build (no errors)
npm run build

# Navigate to
http://localhost:5173/admin/documents/create

# Test:
1. Create document from scratch
2. Apply existing template
3. Generate template with AI
4. Fill in variables
5. Save and verify in document list
```

## 📁 Files Added
```
src/
├── components/
│   ├── TipTapEditor.tsx (NEW)
│   └── ApplyTemplateModal.tsx (NEW)
└── pages/
    └── admin/
        └── documents/
            └── create.tsx (NEW)
```

## 🔗 Related Pages
- `/admin/documents` - Document list
- `/admin/documents/ai` - AI document editor
- `/admin/documents/ai/templates` - Template manager

## 🎨 UI Layout
```
┌────────────────────────────────┐
│ 📄 Criar Documento             │
├────────────────────────────────┤
│ [Title Input] [Description]    │
│ [📂 Apply Template] [💾 Save]  │
├────────────────────────────────┤
│ ┌─ Editor Toolbar ───────────┐ │
│ │ [B][I][H2][•][1.][↶][↷]    │ │
│ ├───────────────────────────┬┘ │
│ │                            │  │
│ │  Rich text content here... │  │
│ │                            │  │
│ └────────────────────────────┘  │
└────────────────────────────────┘
```

## 💡 Pro Tips
- Variables use `{{name}}` format
- Leave variables blank to keep placeholders
- AI generation uses GPT-4o-mini
- Content saved as HTML
- Templates are reusable across documents

## 🎯 Success Criteria
✅ User can create documents  
✅ User can apply templates  
✅ Variables are substituted  
✅ AI generation works  
✅ Documents are saved  
✅ Proper error handling  
✅ Loading states shown  

---

**Status**: ✅ Complete and Ready  
**Date**: 2025-10-16  
**Version**: 1.0
