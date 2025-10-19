# 📋 Template to Document - Quick Reference

## 🚀 Quick Start

### Import and Use TipTap Editor
```tsx
import TipTapEditor from '@/components/editor/TipTapEditor';

function MyComponent() {
  const [content, setContent] = useState("<p>Initial content</p>");
  
  return <TipTapEditor content={content} onChange={setContent} />;
}
```

### Create a Document
```tsx
import { createDocument } from '@/lib/documents/api';

const doc = await createDocument({
  title: "My Document",
  content: "<p>Document content here</p>"
});
```

### Use Create From Template Page
```tsx
import CreateFromTemplate from '@/pages/admin/documents/create-from-template';

<CreateFromTemplate template={myTemplate} />
```

## 📝 Template Format

Templates use `{{variable}}` syntax for dynamic content:

```html
<h1>{{title}}</h1>
<p>Dear {{name}},</p>
<p>Your role at {{company}} is {{position}}.</p>
```

Variables detected: `title`, `name`, `company`, `position`

## 🔧 API Functions

### Documents API (`@/lib/documents/api`)

| Function | Purpose | Parameters | Returns |
|----------|---------|------------|---------|
| `createDocument()` | Create new document | `{ title, content }` | `Document` |
| `updateDocument()` | Update existing | `id, { title?, content? }` | `Document` |
| `fetchDocument()` | Get single document | `id: string` | `Document \| null` |
| `fetchDocuments()` | Get all user docs | none | `Document[]` |
| `deleteDocument()` | Delete document | `id: string` | `void` |

### Types

```typescript
interface Document {
  id: string;
  title: string;
  content: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

interface CreateDocumentData {
  title: string;
  content: string;
}
```

## 🎨 Component Props

### TipTapEditor

```typescript
interface TipTapEditorProps {
  content: any;              // HTML string or JSON object
  onChange: (content: any) => void;  // Callback with updated content
}
```

### CreateFromTemplate

```typescript
interface CreateFromTemplateProps {
  template: {
    id: string;
    title: string;
    content: string | object;
  };
}
```

## 🧪 Testing Quick Commands

```bash
# Run all tests
npm run test

# Run specific test file
npm run test src/tests/components/editor/TipTapEditor.test.tsx

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

## 🔍 Variable Extraction Logic

```typescript
const extractVariables = (raw: string) => {
  const matches = raw.match(/{{(.*?)}}/g) || [];
  return Array.from(new Set(matches.map((m) => m.replace(/[{}]/g, "").trim())));
};
```

**Examples**:
- Input: `"Hello {{name}}, welcome to {{company}}!"`
- Output: `["name", "company"]`

## 🔄 Variable Substitution Logic

```typescript
const applyVariables = () => {
  let raw = typeof template.content === "string"
    ? template.content
    : JSON.stringify(template.content);

  for (const key in variables) {
    const regex = new RegExp(`{{${key}}}`, "g");
    raw = raw.replace(regex, variables[key]);
  }

  setContent(raw);
};
```

## 💾 Database Schema

### Table: `ai_generated_documents`

```sql
CREATE TABLE ai_generated_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  generated_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🎯 Common Patterns

### 1. Load Template and Create Document
```tsx
const template = await fetchTemplate("template-id");
return <CreateFromTemplate template={template} />;
```

### 2. Save with Error Handling
```tsx
try {
  await createDocument({ title, content });
  toast({ title: "Success!" });
} catch (error) {
  toast({ 
    title: "Error", 
    description: error.message,
    variant: "destructive" 
  });
}
```

### 3. Dynamic Content Update
```tsx
const [content, setContent] = useState(initialContent);

// Content auto-updates in TipTap
<TipTapEditor content={content} onChange={setContent} />

// Access current content
console.log(content); // HTML string
```

## 📦 File Locations

| Purpose | Path |
|---------|------|
| TipTap Editor | `src/components/editor/TipTapEditor.tsx` |
| Documents API | `src/lib/documents/api.ts` |
| Create Page | `src/pages/admin/documents/create-from-template.tsx` |
| Editor Tests | `src/tests/components/editor/TipTapEditor.test.tsx` |
| API Tests | `src/tests/lib/documents/api.test.ts` |
| Page Tests | `src/tests/pages/admin/documents/create-from-template.test.tsx` |

## 🔐 Authentication

All document operations require authentication:

```typescript
const { data: { user } } = await supabase.auth.getUser();
if (!user) {
  throw new Error("User not authenticated");
}
```

## 🎨 Styling

TipTap editor uses Tailwind typography:

```tsx
className="prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[400px] p-4"
```

Customize by modifying the `editorProps.attributes.class` in `TipTapEditor.tsx`.

## 🖨️ PDF Export

Simple print-to-PDF:

```tsx
<Button onClick={() => window.print()}>
  🖨️ Exportar PDF
</Button>
```

For advanced PDF generation, consider:
- `html2pdf.js` (already in package.json)
- `jspdf` with custom templates
- Server-side PDF generation

## 🐛 Debugging Tips

### Editor Not Showing
1. Check TipTap packages installed: `@tiptap/react`, `@tiptap/starter-kit`
2. Verify content format is valid
3. Check browser console for errors

### Variables Not Detected
1. Ensure format is exactly `{{variable}}`
2. No spaces: `{{ variable }}` won't work
3. Test regex in console

### Save Fails
1. Verify user authentication
2. Check network tab for API errors
3. Review Supabase RLS policies
4. Ensure content is not empty

## 📊 Performance Tips

1. **Lazy Load**: Use dynamic imports for editor
2. **Debounce**: Add debounce to auto-save
3. **Memoize**: Use `useMemo` for variable extraction
4. **Optimize**: Minimize re-renders with `useCallback`

## 🔗 Related Documentation

- [Main Implementation Doc](./TEMPLATE_TO_DOCUMENT_IMPLEMENTATION.md)
- [Visual Summary](./TEMPLATE_TO_DOCUMENT_VISUAL_SUMMARY.md)
- [TipTap Docs](https://tiptap.dev/)
- [Supabase Docs](https://supabase.com/docs)

## ✅ Checklist for New Features

When adding to this system:

- [ ] Update TypeScript types
- [ ] Add tests (unit + integration)
- [ ] Update documentation
- [ ] Check linting passes
- [ ] Verify build succeeds
- [ ] Test in browser
- [ ] Update this quick reference
