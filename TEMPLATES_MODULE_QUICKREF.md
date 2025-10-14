# ⚡ Templates Module — Quick Reference

## 🚀 Quick Start

### Access the Module
```
URL: /admin/templates
```

### Create Template
```
1. Click [+ Novo Template]
2. Enter title
3. Click [✨ Gerar com IA]
4. Edit content
5. Click [💾 Salvar Template]
```

### Apply Template
```
1. Go to /admin/templates
2. Click [📝 Aplicar]
3. Auto-redirect to /admin/documents/ai
4. Template loaded!
```

---

## 📍 Routes

| Route | Purpose |
|-------|---------|
| `/admin/templates` | List all templates |
| `/admin/templates/editor` | Create new template |
| `/admin/templates/editor/:id` | Edit existing template |

---

## 🔑 Key Components

### TemplatesList (`/admin/templates/index.tsx`)
- Displays all templates in cards
- Filter by All/Favorites/Private
- Actions: Apply, Copy, Edit, Delete

### TemplateEditor (`/admin/templates/editor.tsx`)
- TipTap rich text editor
- AI generation from title
- AI rewrite for selected text
- Save to Supabase
- Export to PDF

---

## 🤖 AI Functions

### Generate Template
```typescript
await supabase.functions.invoke("templates-generate", {
  body: { title: "Template Title" }
});
```

### Rewrite Text
```typescript
await supabase.functions.invoke("templates-rewrite", {
  body: { input: "Text to rewrite" }
});
```

---

## 🗄️ Database Schema

```sql
Table: templates
├── id (UUID, PK)
├── title (text, required)
├── content (text, required)
├── is_favorite (boolean, default: false)
├── is_private (boolean, default: false)
├── created_by (UUID, FK → auth.users)
├── created_at (timestamp)
└── updated_at (timestamp)
```

---

## 🔐 Permissions (RLS)

| Action | Rule |
|--------|------|
| SELECT | Public OR owned by user |
| INSERT | Must be logged in |
| UPDATE | Must own template |
| DELETE | Must own template |

---

## 💡 Common Tasks

### Make Template Private
```
1. Open template in editor
2. Click [🔒] lock icon
3. Save template
```

### Make Template Favorite
```
1. Open template in editor
2. Click [⭐] star icon
3. Save template
```

### Export to PDF
```
1. Open template in editor
2. Click [📥 Exportar PDF]
3. PDF downloads automatically
```

### Copy Template Content
```
1. In templates list
2. Click [📋] copy icon
3. Content copied to clipboard
```

---

## 🎨 Editor Features

- **Headings**: H1, H2, H3
- **Text**: Bold, Italic, Strikethrough
- **Lists**: Bullet lists, Numbered lists
- **Blocks**: Paragraphs, Blockquotes, Code blocks
- **Formatting**: Auto-styling with CSS

---

## 🔧 Configuration

### Required Environment Variables
```bash
OPENAI_API_KEY=sk-...
```

### Dependencies
```json
{
  "@tiptap/react": "^2.26.3",
  "@tiptap/starter-kit": "^2.26.3",
  "jspdf": "^3.0.3"
}
```

---

## 📊 File Sizes

| File | Size |
|------|------|
| `templates/index.tsx` | ~8.7 KB |
| `templates/editor.tsx` | ~12 KB |
| `templates-generate/index.ts` | ~5.6 KB |
| `templates-rewrite/index.ts` | ~5.3 KB |
| Migration SQL | ~2 KB |

---

## 🐛 Troubleshooting

### Template not loading
- Check authentication status
- Verify template exists
- Check RLS policies

### AI generation fails
- Verify OPENAI_API_KEY is set
- Check Supabase function logs
- Ensure title is provided

### PDF export fails
- Check if title is filled
- Verify jsPDF is installed
- Check browser console for errors

### Template not visible
- Check if template is private
- Verify user authentication
- Check filter selection

---

## 📚 Related Documentation

- [Full Documentation](./TEMPLATES_MODULE_README.md)
- [Visual Guide](./TEMPLATES_MODULE_VISUAL_GUIDE.md)
- [PR #212 - Documents AI](./PR212_IMPLEMENTATION_COMPLETE.md)

---

## ⚡ Shortcuts

| Action | Shortcut |
|--------|----------|
| Create new | Click "+ Novo Template" |
| AI Generate | Title → "Gerar com IA" |
| AI Rewrite | Select → "Reescrever" |
| Save | Click "Salvar Template" |
| Export PDF | Click "Exportar PDF" |

---

## ✅ Status

- **Database**: ✅ Migration created
- **APIs**: ✅ Edge functions deployed
- **Frontend**: ✅ Pages implemented
- **Routing**: ✅ Routes configured
- **Styling**: ✅ CSS added
- **Documentation**: ✅ Complete

---

**Version:** 1.0  
**Last Updated:** October 14, 2025  
**Status:** ✅ Ready for Testing
