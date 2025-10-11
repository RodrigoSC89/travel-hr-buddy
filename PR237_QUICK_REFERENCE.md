# 🚀 Document Version Restore - Quick Reference

## Quick Start

### Viewing Version History

1. Navigate to any document at `/admin/documents/view/{id}`
2. Scroll down below the document content
3. See the "Histórico de Versões" card with all previous versions

### Restoring a Previous Version

1. Find the version you want to restore in the history list
2. Click the **"Restaurar"** button next to that version
3. Review the version content in the confirmation dialog
4. Click **"Confirmar Restauração"** to restore
5. The document will be updated and the current version will be saved automatically

## Key Features

| Feature | Description |
|---------|-------------|
| 🕐 **Automatic Versioning** | Every document edit creates a new version automatically |
| 👁️ **View History** | See all previous versions with timestamps |
| 🔄 **One-Click Restore** | Restore any version with a single click |
| ✅ **Safety Confirmation** | Confirmation dialog prevents accidental restores |
| 📝 **Audit Logs** | All restorations logged to restore_logs table |
| 🔒 **Security** | RLS policies ensure users only see their own versions |

## Component API

```tsx
import { DocumentVersionHistory } from "@/components/documents/DocumentVersionHistory";

<DocumentVersionHistory 
  documentId={string}        // Required: Document ID to show versions for
  onRestore={() => void}     // Optional: Callback after successful restore
/>
```

## Database Tables

### document_versions
Stores all historical versions of documents
- Automatically populated by database trigger
- Read-only for UI (trigger handles writes)

### document_restore_logs
Audit trail of all restore operations
- User who restored
- Which version was restored
- Timestamp of restoration
- Viewable at `/admin/documents/restore-logs`

## User Flow

```
Document View Page
    ↓
[User scrolls to Version History]
    ↓
[Views list of all versions]
    ↓
[Clicks "Restaurar" on desired version]
    ↓
[Confirmation dialog appears]
    ↓
[Reviews version content]
    ↓
[Clicks "Confirmar Restauração"]
    ↓
[Document updated]
    ↓
[Old version saved automatically]
    ↓
[Restore logged to audit table]
    ↓
[Success toast notification]
    ↓
[Page reloads with restored content]
```

## Visual Guide

### Version History Card
- **Badge Colors**:
  - Blue "Mais recente" = Latest version (no restore button)
  - Gray "Versão X" = Previous versions (restore button shown)
- **Content Preview**: Shows first 150 characters
- **Character Count**: Total length of version content
- **Date Format**: dd/MM/yyyy às HH:mm (Brazilian)

### Empty State
- Shown when document has no previous versions
- Explains that versions are created automatically on edit

## Troubleshooting

### No versions showing?
- Document might not have been edited yet
- Check if user has permission to view this document
- Verify document_versions table has data

### Restore not working?
- Check user permissions (must own the document)
- Verify internet connection
- Check browser console for errors
- Ensure document_restore_logs table exists

### Tests failing?
```bash
npm run test
```
All 7 DocumentVersionHistory tests should pass.

## Access Points

| URL | Description |
|-----|-------------|
| `/admin/documents` | List all documents |
| `/admin/documents/view/{id}` | View document with version history |
| `/admin/documents/restore-logs` | View audit logs of all restorations |

## Performance

- **Load Time**: < 1 second for typical document histories
- **Restore Time**: < 2 seconds including logging
- **Database Indexes**: Optimized for fast version queries
- **Pagination**: Not yet implemented (consider for >100 versions)

## Best Practices

1. ✅ **Always review** the version content before restoring
2. ✅ **Use confirmation dialog** - don't bypass it
3. ✅ **Check restore logs** regularly for audit compliance
4. ✅ **Test restores** in development before production use

## Developer Notes

### Adding to New Pages

```tsx
import { DocumentVersionHistory } from "@/components/documents/DocumentVersionHistory";

function MyDocumentPage() {
  const documentId = useParams().id;
  
  const handleRestore = () => {
    // Reload your document
    loadDocument();
  };

  return (
    <div>
      {/* Your document UI */}
      <DocumentVersionHistory 
        documentId={documentId} 
        onRestore={handleRestore}
      />
    </div>
  );
}
```

### Customizing Behavior

The component is self-contained but can be extended:
- Add version comparison feature
- Add version export
- Customize date formatting
- Add version notes/comments

## Support

- 📖 **Full Documentation**: `PR237_IMPLEMENTATION_SUMMARY.md`
- 🧪 **Test File**: `src/tests/components/DocumentVersionHistory.test.tsx`
- 💻 **Source Code**: `src/components/documents/DocumentVersionHistory.tsx`

---

**Last Updated**: October 11, 2025  
**Version**: 1.0.0  
**Status**: Production Ready ✅
