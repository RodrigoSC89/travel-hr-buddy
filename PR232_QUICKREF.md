# Document Version History - Quick Reference

## 🚀 Quick Start

### View Document with Versions
```
/admin/documents/view/:id
```

## 📁 Key Files

### Hooks
- `src/hooks/use-document-versions.ts` - Version history hook
- `src/hooks/use-document-comments.ts` - Comments hook

### Components
- `src/components/documents/version-history.tsx` - Version history UI
- `src/components/documents/comments-section.tsx` - Comments UI

### Page
- `src/pages/admin/documents/DocumentView.tsx` - Main document view

## 🎯 Features

### Version History
✅ Automatic versioning on content update
✅ View all versions with timestamps
✅ Restore previous versions
✅ Content preview
✅ Confirmation dialog

### Comments
✅ Add comments
✅ Real-time updates
✅ Delete own comments
✅ Chronological list
✅ User avatars

## 🔧 Usage

### Use Version Hook
```typescript
import { useDocumentVersions } from "@/hooks/use-document-versions";

const { versions, loading, error } = useDocumentVersions(documentId);
```

### Use Comments Hook
```typescript
import { useDocumentComments } from "@/hooks/use-document-comments";

const { comments, loading, error, addComment, deleteComment } = 
  useDocumentComments(documentId);

// Add comment
await addComment("Great document!");

// Delete comment
await deleteComment(commentId);
```

### Version History Component
```tsx
import { DocumentVersionHistory } from "@/components/documents/version-history";

<DocumentVersionHistory 
  documentId={id} 
  onVersionRestored={loadDocument} 
/>
```

### Comments Component
```tsx
import { DocumentComments } from "@/components/documents/comments-section";

<DocumentComments documentId={id} />
```

## 🗄️ Database

### Tables
- `document_versions` - Version history
- `document_comments` - Comments

### Automatic Versioning
Trigger: `trigger_create_document_version`
- Fires before UPDATE on `ai_generated_documents`
- Only creates version if content changed

## 🔐 Access Control

**Required Roles:**
- `admin`
- `hr_manager`

**RLS Policies:**
- Users can view/create versions for their documents
- Users can view/add/update/delete comments on their documents

## 📊 UI Tabs

1. **Conteúdo** - Document content
2. **Versões** - Version history
3. **Comentários** - Real-time comments

## 🎨 Components Used

- `Tabs` - Tab interface
- `Card` - Content containers
- `Button` - Actions
- `Badge` - Version count/number
- `ScrollArea` - Scrollable lists
- `Textarea` - Comment input
- `AlertDialog` - Restore confirmation
- `Avatar` - User avatars
- `Loader2` - Loading indicators

## 🧪 Tests

```bash
npm run test
```

**Test Files:**
- `src/tests/hooks/use-document-versions.test.ts`
- `src/tests/hooks/use-document-comments.test.ts`

## 🔄 Real-Time

Comments use Supabase Realtime:
```typescript
supabase
  .channel(`comments:${documentId}`)
  .on('postgres_changes', { ... })
  .subscribe()
```

## 📝 Example Flow

1. User opens document: `/admin/documents/view/:id`
2. Default tab shows content
3. Click "Versões" tab to see history
4. Click "Restaurar" on a version
5. Confirm restoration in dialog
6. Content updates, new version created
7. Click "Comentários" tab
8. Add comment, appears instantly
9. Other users see comment in real-time

## 🎯 Icons

- `FileText` - Document/content
- `History` - Version history
- `MessageSquare` - Comments
- `RotateCcw` - Restore version
- `Send` - Submit comment
- `Trash2` - Delete comment
- `Loader2` - Loading spinner
- `ArrowLeft` - Back button

## ⚡ Performance

- Indexed queries on `document_id`, `created_at`
- Pagination ready (ScrollArea)
- Lazy loading with React.lazy
- Optimistic updates on comments

## 🐛 Error Handling

- Loading states for all async operations
- Error messages with `toast` notifications
- Try-catch blocks around all database calls
- Null checks for undefined document IDs

## 📚 Related Docs

- `DOCUMENT_VERSIONING_GUIDE.md` - Full guide
- `PR232_IMPLEMENTATION_COMPLETE.md` - Implementation details
- Database migration: `supabase/migrations/20251011044227_create_document_versions_and_comments.sql`
