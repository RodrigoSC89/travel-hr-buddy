# Template Application with Intelligent Variable Substitution

## Overview

This implementation provides a complete solution for applying templates with intelligent variable substitution. Users can select a template, fill in variables, preview the result, and save it as a document.

## Components

### 1. ApplyTemplate Component
**Location**: `/src/pages/admin/documents/apply-template.tsx`

Main component that handles the template application workflow:
- **Variable Extraction**: Automatically detects `{{variableName}}` patterns in template content
- **Dynamic Form Generation**: Creates input fields for each unique variable found
- **Variable Substitution**: Replaces placeholders with user-provided values
- **Preview**: Shows the final content with all variables replaced
- **Document Creation**: Saves the processed content as a new document

#### Usage Example:
```tsx
import ApplyTemplate from '@/pages/admin/documents/apply-template';

// In your component
const template = {
  id: "template-1",
  title: "Welcome Email",
  content: "Hello {{name}}, your {{item}} is ready!",
  // ... other fields
};

<ApplyTemplate template={template} />
```

### 2. TipTapPreview Component
**Location**: `/src/components/editor/tiptap-preview.tsx`

Read-only TipTap editor for previewing content:
- **Rich Text Rendering**: Uses TipTap with StarterKit extensions
- **Customizable**: Accepts className prop for styling
- **Editable Mode**: Can optionally be made editable with `readOnly={false}`

#### Usage Example:
```tsx
import TipTapPreview from '@/components/editor/tiptap-preview';

<TipTapPreview 
  content="<p>Hello World</p>" 
  readOnly={true}
  className="custom-class"
/>
```

### 3. ApplyTemplateDemo Component
**Location**: `/src/pages/admin/documents/apply-template-demo.tsx`

Demo page showing how to use the ApplyTemplate component:
- Lists available templates
- Allows selection of a template to apply
- Shows the ApplyTemplate component in action

## API Functions

### Documents API
**Location**: `/src/lib/documents/api.ts`

Provides CRUD operations for documents:

#### `createDocument(doc: Document): Promise<Document | null>`
Creates a new document in the database.

```typescript
const result = await createDocument({
  content: "Hello, world!",
});
```

#### `getDocument(id: string): Promise<Document | null>`
Fetches a document by ID.

```typescript
const doc = await getDocument("doc-123");
```

#### `updateDocument(id: string, content: string): Promise<Document | null>`
Updates a document's content.

```typescript
const updated = await updateDocument("doc-123", "New content");
```

#### `deleteDocument(id: string): Promise<boolean>`
Deletes a document.

```typescript
const success = await deleteDocument("doc-123");
```

#### `listDocuments(): Promise<Document[]>`
Lists all documents.

```typescript
const docs = await listDocuments();
```

## Features Implemented

✅ **Variable Extraction**: Automatically detects `{{variableName}}` patterns
✅ **Dynamic Form Generation**: Creates input fields for each variable
✅ **Variable Substitution**: Replaces placeholders with user values
✅ **Preview System**: Shows final content before saving
✅ **Document Creation**: Saves processed content to database
✅ **Error Handling**: Provides user-friendly error messages
✅ **TypeScript Support**: Fully typed interfaces and functions
✅ **Unit Tests**: Comprehensive test coverage (25 tests)

## Testing

All components have comprehensive unit tests:

### Test Files:
- `/src/tests/pages/admin/documents/apply-template.test.tsx` (9 tests)
- `/src/tests/components/editor/tiptap-preview.test.tsx` (6 tests)
- `/src/tests/lib/documents/api.test.ts` (10 tests)

### Run Tests:
```bash
npm run test
```

## How It Works

1. **Template Selection**: User selects a template from the list
2. **Variable Detection**: System scans template content for `{{variable}}` patterns
3. **Form Generation**: Input fields are created for each unique variable
4. **User Input**: User fills in values for each variable
5. **Preview Generation**: User clicks "Gerar Preview" to see the result
6. **Document Saving**: User clicks "Salvar Documento" to create the document

## Variable Format

Variables in templates must follow this format:
```
{{variableName}}
```

Examples:
- `{{name}}` - Simple variable
- `{{user_email}}` - Variable with underscore
- `{{item}}` - Another simple variable

The system automatically:
- Extracts unique variable names
- Removes duplicate variables
- Trims whitespace from variable names

## Integration with Existing Code

The implementation integrates seamlessly with existing components:
- Uses existing UI components from `@/components/ui/*`
- Uses existing toast notifications from `@/hooks/use-toast`
- Uses existing Supabase client from `@/integrations/supabase/client`
- Uses existing logger from `@/lib/logger`

## Prerequisites

Before using this feature, ensure:
1. ✅ Supabase `templates` table exists (created by migration `20251014192800_create_templates_table.sql`)
2. ✅ Supabase `documents` table exists (created by migration `20251013023900_create_documents_table.sql`)
3. ✅ User is authenticated
4. ✅ TipTap dependencies are installed (`@tiptap/react`, `@tiptap/starter-kit`)

## Future Enhancements

Possible improvements:
- Support for more complex variable types (dropdowns, dates, etc.)
- Template variable validation
- Preview in different formats (PDF, HTML, etc.)
- Template sharing and collaboration
- Variable history/suggestions
