# 📄 Create From Template - TipTap Integration

## Overview

This implementation integrates the **TipTap rich text editor** with template-based document creation, allowing users to:

1. ✍️ **Apply templates** with variable substitution
2. 📝 **Edit dynamically** using the TipTap rich text editor
3. 💾 **Save documents** to Supabase database
4. 📄 **Export as PDF** using the browser print function

## Architecture

### Components Created

#### 1. **CreateFromTemplate Component** 
Location: `src/pages/admin/documents/create-from-template.tsx`

**Main Features:**
- Extracts variables from template content using `{{variable}}` pattern
- Provides input fields for each variable
- Applies variable substitution when user clicks "Apply Variables"
- Integrates TipTap editor for content editing
- Saves final document to Supabase
- Supports PDF export via `window.print()`

**Props:**
```typescript
interface Template {
  id?: string;
  title: string;
  content: string | object;
}

<CreateFromTemplate template={template} />
```

#### 2. **TipTapEditor Component**
Location: `src/components/editor/tiptap.tsx`

**Features:**
- Reusable TipTap editor wrapper
- Supports both string and object content
- Auto-updates when content prop changes
- Styled with Tailwind prose classes
- Server-side rendering disabled (Next.js compatibility)

**Props:**
```typescript
interface TipTapEditorProps {
  content: string | object;
  onChange: (content: string) => void;
}
```

#### 3. **Document API Functions**
Location: `src/lib/documents/api.ts`

**Functions:**
- `createDocument(params)`: Creates a new document in Supabase
- `updateDocument(documentId, params)`: Updates an existing document
- `getDocument(documentId)`: Retrieves a document by ID

**Parameters:**
```typescript
interface CreateDocumentParams {
  title: string;
  content: string | object;
  prompt?: string;
}
```

## Usage

### Basic Usage

```tsx
import CreateFromTemplate from "@/pages/admin/documents/create-from-template";

const template = {
  title: "Employee Report",
  content: "Employee: {{employee_name}}, Department: {{department}}"
};

<CreateFromTemplate template={template} />
```

### With Demo Page

Access the demo at: `/admin/documents/create-from-template`

The demo includes a sample travel report template with multiple variables.

### Variable Syntax

Variables in templates use double curly braces:
```
{{variable_name}}
```

**Example:**
```html
<h1>Report for {{employee_name}}</h1>
<p>Date: {{report_date}}</p>
<p>Department: {{department}}</p>
```

## Workflow

1. **Load Template**: Component receives template with content and variables
2. **Extract Variables**: System detects all `{{variable}}` patterns
3. **User Input**: Form displays input fields for each unique variable
4. **Apply Variables**: User fills in values and clicks "Apply Variables"
5. **Edit Content**: TipTap editor loads with substituted content
6. **Save/Export**: User can save to database or export as PDF

## API Integration

### Saving Documents

```typescript
import { createDocument } from "@/lib/documents/api";

const documentId = await createDocument({
  title: "My Document",
  content: "<p>Document content</p>",
  prompt: "Created from template"
});
```

### Error Handling

All API functions include proper error handling and logging:
- User authentication validation
- Supabase error catching
- Toast notifications for success/failure
- Logger integration for debugging

## Features

### ✅ Implemented

- [x] Variable extraction from templates
- [x] Dynamic input fields for variables
- [x] Variable substitution
- [x] TipTap rich text editing
- [x] Document saving to Supabase
- [x] PDF export via print
- [x] Support for both string and JSON content
- [x] Proper TypeScript typing
- [x] ESLint compliance
- [x] Comprehensive test coverage

### 📋 Template Variables

**Supported Patterns:**
- Single variables: `{{name}}`
- Multiple occurrences: `{{name}}` appears multiple times
- Unique extraction: Duplicate variables merged into single input

**Variable Names:**
- Can contain letters, numbers, underscores
- Case-sensitive
- Automatically trimmed of whitespace

### 💾 Document Storage

Documents are saved to the `ai_generated_documents` table with:
- `id`: Auto-generated UUID
- `title`: User-defined title
- `content`: HTML content from TipTap
- `prompt`: Context/origin (e.g., "Created from template")
- `generated_by`: User ID
- `created_at`/`updated_at`: Timestamps

### 🖨️ PDF Export

Uses browser's native print functionality:
- Click "Exportar PDF" button
- Browser print dialog opens
- Save as PDF option available
- Preserves formatting and styles

## Testing

### Test Coverage

Location: `src/tests/pages/admin/documents/create-from-template.test.tsx`

**9 Test Cases:**
1. ✅ Component renders with template title
2. ✅ Extracts and displays variable inputs
3. ✅ Applies variables when button clicked
4. ✅ Hides variable inputs after applying
5. ✅ Saves document when save button clicked
6. ✅ Handles templates without variables
7. ✅ Allows editing document title
8. ✅ Triggers print for PDF export
9. ✅ Handles JSON template content

**Run Tests:**
```bash
npm run test -- create-from-template.test.tsx
```

## Routes

### Available Routes

- `/admin/documents/create-from-template` - Demo page with example template
- `/admin/documents/ai` - AI-powered document editor
- `/admin/templates` - Template management

### Adding New Routes

To add a new route using CreateFromTemplate:

```tsx
// In App.tsx
const MyTemplatePage = React.lazy(() => 
  import("./pages/admin/documents/my-template")
);

// In routes
<Route path="/admin/documents/my-template" element={<MyTemplatePage />} />
```

## Integration Points

### With Existing Templates Module

The CreateFromTemplate component integrates with:
- `src/pages/admin/templates.tsx` - Template management
- `src/pages/admin/documents/ai-templates.tsx` - AI template library
- `src/components/templates/ApplyTemplateModal.tsx` - Template application

### With Document Management

Connects to:
- `src/components/documents/DocumentEditor.tsx` - Document editing
- `src/components/documents/CollaborativeDocumentEditor.tsx` - Real-time editing
- `src/pages/admin/documents/DocumentList.tsx` - Document listing

## Dependencies

### Required Packages

```json
{
  "@tiptap/react": "^2.26.3",
  "@tiptap/starter-kit": "^2.26.3",
  "next": "^15.5.5",
  "react": "^18.3.1"
}
```

### Optional Enhancements

For advanced features, consider:
- `@tiptap/extension-table` - Table support
- `@tiptap/extension-image` - Image uploads
- `@tiptap/extension-link` - Hyperlinks
- `@tiptap/extension-color` - Text coloring

## Best Practices

### Template Design

1. **Use meaningful variable names**: `{{employee_name}}` instead of `{{var1}}`
2. **Keep variables atomic**: One piece of data per variable
3. **Provide default content**: Include sample text for context
4. **Use HTML formatting**: Take advantage of rich text capabilities

### Error Handling

```typescript
try {
  const documentId = await createDocument({ title, content });
  toast({ title: "Success", description: "Document saved" });
} catch (error) {
  logger.error("Error saving:", error);
  toast({ 
    title: "Error", 
    description: "Failed to save",
    variant: "destructive" 
  });
}
```

### Performance

- TipTap editor is dynamically imported (code splitting)
- Content updates are controlled to prevent re-renders
- Server-side rendering is disabled for client-only features

## Troubleshooting

### Common Issues

**Issue**: Variables not detected
- **Solution**: Ensure variables use `{{variable}}` syntax exactly

**Issue**: Content not updating in editor
- **Solution**: Check that `onChange` callback is properly connected

**Issue**: Save fails
- **Solution**: Verify user authentication and Supabase connection

**Issue**: PDF export doesn't work
- **Solution**: Ensure browser supports `window.print()`, check for print styles

## Future Enhancements

### Planned Features

- [ ] Template preview before application
- [ ] Variable validation and constraints
- [ ] Rich text formatting toolbar
- [ ] Auto-save functionality
- [ ] Version history
- [ ] Collaborative editing
- [ ] Advanced PDF export with custom styling
- [ ] Template categorization and search

## Examples

### Travel Report Template

```typescript
const travelTemplate = {
  title: "Relatório de Viagem",
  content: `
    <h1>Relatório de Viagem</h1>
    <p><strong>Viajante:</strong> {{employee_name}}</p>
    <p><strong>Destino:</strong> {{destination}}</p>
    <p><strong>Data:</strong> {{travel_date}}</p>
    <h2>Resumo</h2>
    <p>{{summary}}</p>
  `
};
```

### Meeting Minutes Template

```typescript
const meetingTemplate = {
  title: "Ata de Reunião",
  content: `
    <h1>Ata de Reunião</h1>
    <p><strong>Data:</strong> {{meeting_date}}</p>
    <p><strong>Participantes:</strong> {{participants}}</p>
    <h2>Pauta</h2>
    <p>{{agenda}}</p>
    <h2>Decisões</h2>
    <p>{{decisions}}</p>
  `
};
```

## Conclusion

This implementation provides a complete, production-ready solution for template-based document creation with rich text editing capabilities. The modular architecture allows for easy extension and integration with existing systems.

**Key Benefits:**
- 🚀 Fast and intuitive user experience
- 🔧 Flexible variable system
- 💾 Reliable data persistence
- 📱 Responsive design
- ✅ Comprehensive test coverage
- 🎨 Customizable and extensible

For questions or support, refer to the inline code documentation or contact the development team.
