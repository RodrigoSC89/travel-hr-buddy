# DocumentEditor Quick Reference

## 🚀 Quick Start

### Import and Use
```tsx
import { DocumentEditor } from "@/components/documents/DocumentEditor";

<DocumentEditor onSave={(docId) => console.log("Saved!", docId)} />
```

## 📍 Access Points

- **Route**: `/admin/documents/editor`
- **Component**: `src/components/documents/DocumentEditor.tsx`
- **Example Page**: `src/pages/admin/documents/DocumentEditorPage.tsx`

## 🎯 Key Features

| Feature | Description |
|---------|-------------|
| **Auto-Save** | Saves 2 seconds after typing stops |
| **Version History** | Every save creates a version entry |
| **Manual Save** | Click "Salvar" button anytime |
| **User Tracking** | All saves attributed to current user |
| **Real-time Feedback** | Toast notifications on save |
| **Last Saved** | Shows timestamp of last save |
| **Version Counter** | Displays total versions created |

## 📊 Props

```typescript
interface DocumentEditorProps {
  documentId?: string;           // For editing existing doc
  initialTitle?: string;         // Pre-fill title
  initialContent?: string;       // Pre-fill content
  onSave?: (docId: string) => void;  // Callback after save
}
```

## 💾 Database Operations

### Main Document Save
```typescript
supabase.from('ai_generated_documents').upsert({
  id: documentId,
  content,
  title,
  updated_by: user.id,
})
```

### Version History Save
```typescript
supabase.from('document_versions').insert({
  document_id: documentId,
  content,
  updated_by: user.id,
})
```

## 🧪 Testing

Run tests:
```bash
npm run test -- src/tests/components/DocumentEditor.test.tsx
```

**8 tests covering**:
- Component rendering
- Props handling
- Save states
- Database operations
- User interaction

## 🔒 Security

- ✅ Requires authentication
- ✅ Role-based access (admin/manager)
- ✅ User ID tracking
- ✅ RLS policies enforced

## 🎨 UI States

### Empty (New Document)
- Save button: **Disabled**
- Status: Waiting for input

### Editing
- Save button: **Enabled**
- Status: Ready to save

### Saving
- Save button: **Disabled** with spinner
- Status: "Auto-salvando..." or "Salvando..."

### Saved
- Save button: **Enabled**
- Status: Shows "Último salvamento: HH:MM:SS"

## 🚨 Error Handling

### No User
```
Toast: "Erro de autenticação"
Description: "Você precisa estar logado para salvar documentos"
```

### Empty Fields
```
Toast: "Campos obrigatórios"
Description: "Por favor, preencha o título e o conteúdo"
```

### Database Error
```
Toast: "Erro ao salvar"
Description: "Não foi possível salvar o documento"
```

## 📈 Performance

- **Debounced**: Saves only after 2s of inactivity
- **Async**: Non-blocking operations
- **Optimistic**: Immediate UI feedback
- **Efficient**: Local version tracking

## 🔗 Related Components

- `DocumentVersionHistory` - View/restore versions
- `DocumentView` - Display with version history
- `DocumentsAI` - AI-generated documents
- `DocumentList` - List all documents

## 📚 Full Documentation

See `DOCUMENT_EDITOR_GUIDE.md` for:
- Detailed usage examples
- Database schema
- Security details
- Troubleshooting
- Future enhancements

## ✅ Test Coverage

```
✓ renders with title and content fields
✓ shows initial title and content
✓ disables save when empty
✓ enables save when filled
✓ saves new document and version
✓ updates existing document
✓ displays version count
✓ shows auto-save information
```

## 🎉 Summary

**What it does**: Provides a complete document editing experience with automatic saving and version history tracking.

**How to use**: Import the component, optionally provide a `documentId` for editing, and handle the `onSave` callback.

**Where it saves**: Two tables - `ai_generated_documents` (current state) and `document_versions` (history).

**When it saves**: Automatically 2 seconds after typing stops, or manually via button click.
