# Apply Template - Quick Reference

## 🚀 Quick Start

### Import and Use
```tsx
import ApplyTemplate from '@/pages/admin/documents/apply-template';

// Your template object
const template = {
  id: "template-id",
  title: "Template Title",
  content: "Hello {{name}}, welcome to {{company}}!",
  created_by: "user-id",
  created_at: "2024-01-01",
  updated_at: "2024-01-01",
  is_favorite: false,
  is_private: false,
};

// Use the component
<ApplyTemplate template={template} />
```

## 📋 API Reference

### createDocument()
```typescript
import { createDocument } from '@/lib/documents/api';

const result = await createDocument({
  content: "Document content here",
});
// Returns: Document | null
```

### TipTapPreview
```tsx
import TipTapPreview from '@/components/editor/tiptap-preview';

<TipTapPreview 
  content="<p>Your content</p>" 
  readOnly={true}
/>
```

## 🔍 Variable Format

Variables must use double curly braces:
```
✅ Correct: {{variableName}}
❌ Wrong: {variableName}
❌ Wrong: {{variable name}} (no spaces)
❌ Wrong: {{ variableName }} (spaces inside)
```

## ⚡ Common Tasks

### Check Variable Extraction
```typescript
const extractVariables = (content: string) => {
  const matches = content.match(/{{(.*?)}}/g) || [];
  return Array.from(new Set(matches.map((m) => m.replace(/[{}]/g, "").trim())));
};

const vars = extractVariables("Hello {{name}}, {{greeting}}");
// Result: ["name", "greeting"]
```

### Test Variable Substitution
```typescript
let content = "Hello {{name}}, your {{item}} is ready";
const variables = { name: "John", item: "order" };

for (const [key, value] of Object.entries(variables)) {
  content = content.replaceAll(`{{${key}}}`, value);
}
// Result: "Hello John, your order is ready"
```

## 🧪 Testing

### Run Tests
```bash
# All tests
npm run test

# Specific test files
npm run test src/tests/pages/admin/documents/apply-template.test.tsx
npm run test src/tests/components/editor/tiptap-preview.test.tsx
npm run test src/tests/lib/documents/api.test.ts
```

### Test Coverage
```bash
npm run test:coverage
```

## 🐛 Troubleshooting

### Issue: Variables not detected
**Solution**: Ensure variables use `{{name}}` format (double curly braces)

### Issue: Preview not showing
**Solution**: Click "Gerar Preview" button first, then save

### Issue: Document not saving
**Solution**: Check that user is authenticated

### Issue: TipTap not rendering
**Solution**: Ensure `@tiptap/react` and `@tiptap/starter-kit` are installed

## 📊 File Locations

```
Implementation Files:
├─ Component: src/pages/admin/documents/apply-template.tsx
├─ Preview: src/components/editor/tiptap-preview.tsx
├─ API: src/lib/documents/api.ts
└─ Demo: src/pages/admin/documents/apply-template-demo.tsx

Test Files:
├─ Component Tests: src/tests/pages/admin/documents/apply-template.test.tsx
├─ Preview Tests: src/tests/components/editor/tiptap-preview.test.tsx
└─ API Tests: src/tests/lib/documents/api.test.ts

Documentation:
├─ Implementation: APPLY_TEMPLATE_IMPLEMENTATION.md
├─ Visual Summary: APPLY_TEMPLATE_VISUAL_SUMMARY.md
└─ Quick Reference: APPLY_TEMPLATE_QUICKREF.md (this file)
```

## 🔗 Related Components

- Templates Page: `/src/pages/admin/templates.tsx`
- Documents Table: Supabase `documents` table
- Templates Table: Supabase `templates` table

## ⚙️ Configuration

### Required Dependencies
```json
{
  "@tiptap/react": "^2.26.3",
  "@tiptap/starter-kit": "^2.26.3",
  "@supabase/supabase-js": "^2.57.4"
}
```

### Environment Variables
No additional environment variables required. Uses existing Supabase configuration.

## 📈 Performance

- Variable extraction: O(n) where n = content length
- Preview generation: O(v) where v = number of variables
- Document save: ~100-200ms (network dependent)

## 🎯 Best Practices

1. **Always preview before saving**: Ensures variables are correctly substituted
2. **Use descriptive variable names**: `{{customer_name}}` better than `{{n}}`
3. **Handle empty values**: Consider what happens if user doesn't fill all fields
4. **Test edge cases**: Empty templates, templates without variables, etc.

## 💡 Tips

- Variables are case-sensitive: `{{Name}}` ≠ `{{name}}`
- Duplicate variables show only once in the form
- Preview updates only when clicking "Gerar Preview"
- Documents are saved with auto-generated IDs

## 🔄 Workflow Integration

```typescript
// From templates page
const applyTemplate = (template) => {
  navigate("/admin/documents/apply-template-demo");
  // or directly use the component
};

// From documents page
const editDocument = (docId) => {
  const doc = await getDocument(docId);
  // Use TipTapPreview to show content
};
```

## 📞 Support

For issues or questions:
1. Check this quick reference
2. Review `APPLY_TEMPLATE_IMPLEMENTATION.md`
3. Check test files for usage examples
4. Review component source code with inline comments
