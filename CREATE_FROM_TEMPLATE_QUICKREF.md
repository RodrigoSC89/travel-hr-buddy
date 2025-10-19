# 📋 Create From Template - Quick Reference

## 🚀 Quick Start

### Access the Feature

```
URL: /admin/documents/create-from-template
```

### Basic Template Structure

```typescript
const template = {
  title: "My Template",
  content: "Hello {{name}}, welcome to {{company}}!"
};
```

## 📝 Variable Syntax

| Pattern | Description | Example |
|---------|-------------|---------|
| `{{variable}}` | Basic variable | `{{name}}` |
| Multiple uses | Same variable multiple times | `{{name}}` appears 3 times → 1 input field |
| Whitespace | Auto-trimmed | `{{ name }}` → `name` |

## 🎯 Component API

### CreateFromTemplate Props

```typescript
interface Template {
  id?: string;           // Optional template ID
  title: string;         // Template title
  content: string | object; // Template content (HTML or JSON)
}

<CreateFromTemplate template={template} />
```

### TipTapEditor Props

```typescript
interface TipTapEditorProps {
  content: string | object;     // Content to edit
  onChange: (content: string) => void; // Change handler
}

<TipTapEditor content={html} onChange={setContent} />
```

### Document API Functions

```typescript
// Create document
await createDocument({
  title: string,
  content: string | object,
  prompt?: string
});

// Update document
await updateDocument(documentId, {
  title?: string,
  content?: string | object
});

// Get document
await getDocument(documentId);
```

## 🔄 Workflow Steps

1. **Load Template** → Component receives template
2. **Extract Variables** → System finds `{{variables}}`
3. **User Input** → Fill in variable values
4. **Apply** → Click "Aplicar Variáveis"
5. **Edit** → Use TipTap rich text editor
6. **Save/Export** → Save to DB or export PDF

## 📁 File Locations

```
Component:    src/pages/admin/documents/create-from-template.tsx
Editor:       src/components/editor/tiptap.tsx
API:          src/lib/documents/api.ts
Demo:         src/pages/admin/documents/create-from-template-demo.tsx
Tests:        src/tests/pages/admin/documents/create-from-template.test.tsx
Route:        /admin/documents/create-from-template
```

## 🧪 Testing

```bash
# Run tests
npm run test -- create-from-template.test.tsx

# Results
✅ 9 tests passing
```

## 🎨 UI Elements

```
📄 Title Input          → Document title
🔧 Variable Inputs      → Fill template variables
⚙️ Apply Button         → Substitute variables
📝 TipTap Editor        → Edit rich text content
💾 Save Button          → Save to database
🖨️ Export Button        → Print/PDF export
```

## ⚠️ Common Issues

| Issue | Solution |
|-------|----------|
| Variables not detected | Use exact syntax `{{variable}}` |
| Content not saving | Check user authentication |
| Editor not loading | Verify dynamic import |
| PDF export fails | Check browser print support |

## 💡 Examples

### Simple Template

```typescript
{
  title: "Welcome Email",
  content: "Hello {{name}}, welcome aboard!"
}
```

### Complex Template

```typescript
{
  title: "Travel Report",
  content: `
    <h1>Travel Report</h1>
    <p><strong>Employee:</strong> {{employee}}</p>
    <p><strong>Destination:</strong> {{destination}}</p>
    <p><strong>Date:</strong> {{date}}</p>
    <h2>Summary</h2>
    <p>{{summary}}</p>
  `
}
```

## 🔗 Integration

### With Templates Page

```typescript
// Navigate from templates
navigate("/admin/documents/create-from-template", {
  state: { template }
});
```

### Programmatic Usage

```typescript
import CreateFromTemplate from "@/pages/admin/documents/create-from-template";

function MyPage() {
  const template = { /* ... */ };
  return <CreateFromTemplate template={template} />;
}
```

## 📊 Key Features

✅ Variable extraction & substitution
✅ TipTap rich text editing
✅ Supabase integration
✅ PDF export
✅ TypeScript support
✅ Full test coverage
✅ Error handling
✅ Toast notifications

## 🚦 Status

- Build: ✅ Passing
- Tests: ✅ 9/9 passing
- Lint: ✅ No errors
- Docs: ✅ Complete

## 📚 Documentation

- Full Guide: `CREATE_FROM_TEMPLATE_README.md`
- Visual Summary: `CREATE_FROM_TEMPLATE_VISUAL_SUMMARY.md`
- This Quick Ref: `CREATE_FROM_TEMPLATE_QUICKREF.md`
