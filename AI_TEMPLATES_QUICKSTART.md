# AI Document Templates - Quick Start Guide

## 🚀 Quick Start (3 Steps)

### Step 1: Run Database Migration
```bash
cd /home/runner/work/travel-hr-buddy/travel-hr-buddy
supabase db push
```

### Step 2: Access Template Manager
Navigate to: `http://localhost:5173/admin/documents/ai/templates`

### Step 3: Create Your First Template
1. Click "Novo Template"
2. Fill in title and content
3. Click "Criar Template"
4. Click "Aplicar" to use it!

## 📍 Routes

- **Editor**: `/admin/documents/ai`
- **Templates**: `/admin/documents/ai/templates`
- **Document List**: `/admin/documents`

## 🎯 Main Use Cases

### Use Case 1: Create and Apply Template
```
Templates Page → Click "Novo Template" → Fill form → Save
→ Click "Aplicar" → Editor loads with template content
```

### Use Case 2: Edit Document with AI
```
Editor Page → Type/paste content → Select text
→ Click "Reescrever Seleção com IA" → AI rewrites selected text
```

### Use Case 3: Search Templates
```
Templates Page → Type in search box → Results filter by:
- Title
- Content
- Tags
```

## 🔑 Key Features

### Template Actions
- **Aplicar** ✅ - Apply template to editor
- **Copiar** 📋 - Copy to clipboard
- **⭐** - Toggle favorite
- **🔒** - Toggle private/public
- **✏️** - Edit template
- **🗑️** - Delete template

### Editor Actions
- **Salvar** 💾 - Save to Supabase
- **Exportar PDF** 📄 - Download as PDF
- **Reescrever Seleção** ⚡ - AI rewrite selected text

## 🔐 Security

- ✅ Row Level Security (RLS) enabled
- ✅ Users can only edit their own templates
- ✅ Public templates visible to all
- ✅ Private templates only visible to creator

## 🧪 Testing

Run tests:
```bash
npm test -- src/tests/pages/admin/documents/ai-editor.test.tsx
npm test -- src/tests/pages/admin/documents/ai-templates.test.tsx
```

Expected: 17/17 tests passing ✅

## 📦 Build

```bash
npm run build
```

Expected: Build successful ✅

## 🐛 Troubleshooting

### Templates not loading?
- Check Supabase connection
- Verify RLS policies are active
- Check browser console for errors

### Template not applying in editor?
- Check localStorage (should have `applied_template` key)
- Verify navigation from templates page
- Try clearing localStorage and retry

### AI features not working?
- Verify Supabase Edge Functions are deployed
- Check API keys are configured
- Ensure `rewrite-document` function exists

## 📚 Full Documentation

For complete details, see:
- `AI_DOCUMENT_TEMPLATES_README.md` - Full technical documentation
- `AI_TEMPLATES_VISUAL_SUMMARY.md` - Visual architecture and stats

## 🎉 Success Criteria

✅ All tests passing (17/17)
✅ Build successful
✅ Database migration created
✅ Routes configured
✅ UI components working
✅ localStorage bridge functional
✅ AI integration active
✅ RLS policies configured

## 💡 Tips

1. **Use tags** to organize templates by type/category
2. **Mark favorites** for quick access to frequently used templates
3. **Keep private** templates that contain sensitive information
4. **Use search** to quickly find templates by name or content
5. **Rewrite with AI** to improve text quality and style

## 🔗 Related Features

- Document list: `/admin/documents`
- Document view: `/admin/documents/view/:id`
- Document history: `/admin/documents/history/:id`
- Collaborative editor: `/admin/documents/edit/:id`

---

**Status**: Implementation Complete ✅
**Version**: 1.0.0
**Date**: 2024-10-14
