# Template to Document - Quick Reference

## Quick Start

### 1. Using TipTapEditor

```tsx
import TipTapEditor from '@/components/editor/TipTapEditor';

function MyComponent() {
  const [content, setContent] = useState("<p>Hello</p>");
  
  return (
    <TipTapEditor 
      content={content} 
      onChange={setContent} 
    />
  );
}
```

### 2. Using CreateFromTemplate

```tsx
import CreateFromTemplate from '@/pages/admin/documents/create-from-template';

const template = {
  title: "Contract",
  content: "<p>Name: {{name}}, Date: {{date}}</p>"
};

<CreateFromTemplate template={template} />
```

## Variable Syntax

- Use `{{variableName}}` in templates
- Variables are extracted automatically
- Case-sensitive matching

## API Functions

```typescript
// Create document
const doc = await createDocument({ 
  title: "Doc Title", 
  content: "<p>Content</p>" 
});

// Get document
const doc = await getDocument("doc-id");

// Update document
await updateDocument("doc-id", "<p>Updated</p>");

// Delete document
await deleteDocument("doc-id");

// List all documents
const docs = await listDocuments();
```

## Component Props

### TipTapEditor
- `content` (string | object) - Required
- `onChange` (function) - Optional
- `className` (string) - Optional
- `editable` (boolean) - Optional, default: true

### CreateFromTemplate
- `template` (object) - Required
  - `id` (string) - Optional
  - `title` (string) - Optional
  - `content` (string | object) - Required
- `onSaved` (function) - Optional

## Testing

```bash
# Run all tests
npm test

# Run specific test
npm test -- src/tests/components/editor/TipTapEditor.test.tsx
npm test -- src/tests/pages/admin/documents/create-from-template.test.tsx

# Build project
npm run build

# Lint code
npm run lint
```

## File Locations

- **TipTapEditor**: `src/components/editor/TipTapEditor.tsx`
- **CreateFromTemplate**: `src/pages/admin/documents/create-from-template.tsx`
- **Document API**: `src/lib/documents/api.ts`
- **Tests**: 
  - `src/tests/components/editor/TipTapEditor.test.tsx`
  - `src/tests/pages/admin/documents/create-from-template.test.tsx`
  - `src/tests/lib/documents/api.test.ts`

## Common Patterns

### Template with Variables
```typescript
const template = {
  title: "Employee Welcome",
  content: `
    <h1>Welcome {{employeeName}}</h1>
    <p>Position: {{position}}</p>
    <p>Start Date: {{startDate}}</p>
    <p>Manager: {{managerName}}</p>
  `
};
```

### Handling Save Success
```typescript
<CreateFromTemplate 
  template={template}
  onSaved={(doc) => {
    console.log('Document saved:', doc.id);
    navigate(`/documents/${doc.id}`);
  }}
/>
```

### Custom Styling
```tsx
<TipTapEditor 
  content={content}
  onChange={setContent}
  className="min-h-[400px] max-w-4xl"
/>
```

## Dependencies

- `@tiptap/react` (v2.26.3)
- `@tiptap/starter-kit` (v2.26.3)
- `@supabase/supabase-js` (existing)
- `react-hook-form` (existing)
- `shadcn/ui` components (existing)

## Key Features

✅ Variable extraction and substitution
✅ Rich text editing with TipTap
✅ Database persistence
✅ PDF export (via browser print)
✅ Authentication integration
✅ Error handling
✅ TypeScript support
✅ Comprehensive tests
✅ Responsive design

## Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile: ✅ Responsive design

## Performance Tips

1. Use string content for simple HTML
2. Use object content for complex structures
3. Minimize re-renders with proper memoization
4. Leverage existing Supabase connections
5. Use pagination for large document lists

## Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "User not authenticated" | No active session | Log in first |
| "Error creating document" | Database issue | Check Supabase connection |
| Variables not found | Wrong syntax | Use `{{variable}}` format |
| Content not saving | Permission issue | Check RLS policies |

## Best Practices

1. Always validate user input before substitution
2. Sanitize content before rendering
3. Handle errors gracefully with user feedback
4. Test with both string and object content
5. Use TypeScript types for type safety
6. Follow existing code conventions
7. Write tests for new features
8. Document complex logic

## Next Steps

1. Create your first template
2. Test variable substitution
3. Save a document
4. Export as PDF
5. Integrate with your workflow

## Support

- Check logs: Browser console and server logs
- Review tests: Run `npm test` for validation
- Build project: Run `npm run build` to verify
- Documentation: See `TEMPLATE_TO_DOCUMENT_IMPLEMENTATION.md`
