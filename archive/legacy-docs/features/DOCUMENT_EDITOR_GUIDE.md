# Document Editor with Auto-Save and Version History

## Overview

The DocumentEditor component provides a rich text editing interface with automatic saving and version history tracking. Every time a document is saved, a version entry is created in the `document_versions` table.

## Features

- ✅ **Auto-Save**: Documents are automatically saved 2 seconds after the user stops typing
- ✅ **Version History**: Every save creates a new version entry in the database
- ✅ **Manual Save**: Users can manually save at any time
- ✅ **Version Tracking**: Local tracking of how many versions have been created
- ✅ **User Attribution**: All saves are attributed to the authenticated user
- ✅ **Real-time Feedback**: Toast notifications for save success/failure
- ✅ **Last Saved Timestamp**: Display when the document was last saved

## Usage

### Basic Usage (New Document)

```tsx
import { DocumentEditor } from "@/components/documents/DocumentEditor";

export default function MyPage() {
  const handleSave = (documentId: string) => {
    console.log("Document saved with ID:", documentId);
  };

  return <DocumentEditor onSave={handleSave} />;
}
```

### Editing Existing Document

```tsx
import { DocumentEditor } from "@/components/documents/DocumentEditor";

export default function EditPage() {
  const documentId = "existing-doc-id";
  
  return (
    <DocumentEditor
      documentId={documentId}
      initialTitle="My Document"
      initialContent="Document content here..."
    />
  );
}
```

## Component Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `documentId` | `string` | No | ID of existing document to edit |
| `initialTitle` | `string` | No | Initial title for the document |
| `initialContent` | `string` | No | Initial content for the document |
| `onSave` | `(documentId: string) => void` | No | Callback fired after successful save |

## How It Works

### 1. Auto-Save Mechanism

The component uses a debounced auto-save mechanism:

```typescript
useEffect(() => {
  if (!documentId || !content) return;

  // Clear previous timeout
  if (saveTimeoutRef.current) {
    clearTimeout(saveTimeoutRef.current);
  }

  // Set new timeout for auto-save
  saveTimeoutRef.current = setTimeout(() => {
    saveContentToDB(content);
  }, 2000);

  return () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
  };
}, [content, documentId]);
```

### 2. Saving to Database

When a document is saved, two operations occur:

#### a) Update/Insert Main Document

```typescript
const { error: docError } = await supabase
  .from('ai_generated_documents')
  .upsert({
    id: documentId,
    content,
    title,
    updated_by: user.id,
  });
```

#### b) Create Version History Entry

```typescript
const { error: versionError } = await supabase
  .from('document_versions')
  .insert({
    document_id: documentId,
    content,
    updated_by: user.id,
  });
```

### 3. Local Version Tracking

```typescript
versionRef.current.push({ 
  content, 
  saved_at: new Date().toISOString() 
});
```

## Database Schema

### ai_generated_documents Table

The main documents table stores the current state of each document.

### document_versions Table

```sql
CREATE TABLE public.document_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.ai_generated_documents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);
```

**Key Features:**
- Cascade delete: When a document is deleted, all its versions are deleted
- User tracking: `updated_by` field tracks who made the change
- Automatic timestamp: `created_at` is automatically set

## Testing

The component includes comprehensive unit tests:

```bash
npm run test -- src/tests/components/DocumentEditor.test.tsx
```

**Test Coverage:**
- ✅ Component rendering
- ✅ Initial props
- ✅ Save button state
- ✅ Creating new documents
- ✅ Updating existing documents
- ✅ Version creation
- ✅ User interaction

## Example Implementation

A complete example page is available at:
```
src/pages/admin/documents/DocumentEditorPage.tsx
```

## Security

- **Authentication Required**: Component checks for authenticated user before saving
- **User Attribution**: All saves are attributed to the current user
- **Row Level Security**: Database RLS policies ensure users can only access their own documents

## Performance Considerations

- **Debounced Auto-Save**: Prevents excessive database writes
- **Local Version Tracking**: Reduces database queries for version count
- **Optimistic Updates**: UI updates immediately, database saves asynchronously

## Future Enhancements

Potential improvements:
- Rich text editor (Markdown/WYSIWYG)
- Collaborative editing
- Version comparison/diff view
- Version restoration
- Conflict resolution
- Offline support

## Related Components

- `DocumentVersionHistory.tsx`: Display and restore previous versions
- `DocumentView.tsx`: View documents with version history

## Troubleshooting

### Auto-save not working?
- Ensure `documentId` is provided
- Check user is authenticated
- Verify database permissions

### Versions not being created?
- Check `document_versions` table exists
- Verify RLS policies allow INSERT
- Check `updated_by` user has permissions

### Save button disabled?
- Ensure both title and content are non-empty
- Check user is authenticated

## Migration

The database migration is located at:
```
supabase/migrations/20251011044227_create_document_versions_and_comments.sql
```

This migration creates:
- `document_versions` table
- RLS policies
- Indexes for performance
- Automatic version trigger (on UPDATE)
