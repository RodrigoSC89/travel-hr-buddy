# DocumentEditor Component

## Overview

The `DocumentEditor` component is a collaborative real-time document editor built with TipTap, Yjs, and WebRTC. It enables multiple users to edit the same document simultaneously with live cursor tracking and automatic version history.

## Features

- ✅ **Real-time Collaboration**: Multiple users can edit the same document simultaneously using WebRTC peer-to-peer connections
- ✅ **Auto-save**: Changes are automatically saved to Supabase database with a 3-second debounce
- ✅ **Version History**: All versions are tracked automatically when content changes
- ✅ **User Presence**: See other users' cursors and names while editing
- ✅ **Rich Text Editing**: Full TipTap editor with StarterKit features (bold, italic, headings, lists, etc.)
- ✅ **Clear & Restore**: Clear the document or restore the last saved version

## Installation

The following packages are required (already installed):

```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-collaboration @tiptap/extension-collaboration-cursor @tiptap/y-tiptap yjs y-webrtc y-prosemirror lodash @supabase/auth-helpers-nextjs
```

## Database Setup

Run the migration to create the `documents` table:

```sql
-- Located in: supabase/migrations/20251013014800_create_documents_table.sql
-- Creates the documents table with:
-- - id (UUID)
-- - content (TEXT)
-- - updated_by (UUID)
-- - updated_at (TIMESTAMPTZ)
```

The table includes Row Level Security (RLS) policies that allow authenticated users to:
- View all documents
- Create new documents
- Update existing documents
- Delete documents

## Usage

### Basic Usage

```tsx
import DocumentEditor from '@/components/documents/DocumentEditor'

function MyPage() {
  const documentId = "your-document-uuid"
  
  return <DocumentEditor documentId={documentId} />
}
```

### With Demo Page

A complete demo page is available at `src/pages/admin/documents/DocumentEditorDemo.tsx` showing:
- Document ID generation and persistence
- Create new document functionality
- Feature list and instructions

## Component Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `documentId` | `string` | Yes | Unique UUID identifying the document |

## How It Works

1. **Authentication**: Component fetches the current user session from Supabase
2. **WebRTC Connection**: Creates a WebRTC provider with room name `doc-{documentId}`
3. **Yjs Document**: Initializes a Yjs document for collaborative editing
4. **TipTap Editor**: Configures TipTap with:
   - StarterKit (basic formatting)
   - Collaboration extension (Yjs integration)
   - CollaborationCursor (user presence)
5. **Auto-save**: Debounced save to Supabase every 3 seconds after changes
6. **Version Tracking**: All saves are tracked in `versionRef` for restore functionality

## Architecture

```
┌─────────────────────────────────────────────────┐
│              DocumentEditor                     │
├─────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌────────────────────────┐  │
│  │   TipTap     │  │  Yjs Document (CRDT)   │  │
│  │   Editor     │──│  Shared State          │  │
│  └──────────────┘  └────────────────────────┘  │
│         │                    │                  │
│         │                    │                  │
│  ┌──────▼──────┐    ┌───────▼────────┐         │
│  │  Auto-save  │    │  WebRTC        │         │
│  │  Supabase   │    │  Provider      │         │
│  └─────────────┘    └────────────────┘         │
│                            │                    │
│                            │                    │
│                     ┌──────▼────────┐           │
│                     │  Other Users  │           │
│                     │  (P2P Sync)   │           │
│                     └───────────────┘           │
└─────────────────────────────────────────────────┘
```

## Testing

Run the test suite:

```bash
npm test -- src/tests/components/documents/DocumentEditor.test.tsx
```

Tests verify:
- ✅ Component renders with title
- ✅ Editor content area is present
- ✅ Action buttons (Clear & Restore) are available

## Customization

### Styling

The editor uses Tailwind CSS classes and can be customized by modifying the `className` props:

```tsx
<EditorContent
  editor={editor}
  className="border rounded-md p-4 bg-white min-h-[400px]"
/>
```

### Debounce Time

Change the auto-save delay by modifying the debounce time (default: 3000ms):

```tsx
const debouncedSave = useRef(
  debounce((html) => saveContentToDB(html), 5000) // 5 seconds
).current
```

### User Colors

Customize the cursor color for each user:

```tsx
CollaborationCursor.configure({
  provider: provider!,
  user: {
    name: user?.email || 'User',
    color: '#ff6b6b', // Custom color
  },
})
```

## Security Considerations

1. **Authentication Required**: Users must be authenticated to use the editor
2. **RLS Policies**: Database policies enforce user permissions
3. **WebRTC P2P**: Data is transmitted peer-to-peer, not through a central server
4. **Auto-save**: All saves include the `updated_by` user ID for audit tracking

## Troubleshooting

### Editor Not Loading

Check that:
1. User is authenticated (session exists)
2. `documentId` is a valid UUID
3. Database migration has been applied
4. RLS policies allow access

### Collaboration Not Working

Verify:
1. WebRTC is not blocked by firewall
2. Multiple users are using the same `documentId`
3. Users are in the same network or WebRTC signaling server is accessible

### Auto-save Failing

Check:
1. Supabase connection is configured correctly
2. RLS policies allow INSERT/UPDATE operations
3. User has permissions on the `documents` table

## Examples

### Creating a New Document

```tsx
import { useState } from 'react'
import DocumentEditor from '@/components/documents/DocumentEditor'

function CreateDocument() {
  const [docId] = useState(() => crypto.randomUUID())
  
  return (
    <div>
      <h1>New Document</h1>
      <p>Document ID: {docId}</p>
      <DocumentEditor documentId={docId} />
    </div>
  )
}
```

### Loading Existing Document

```tsx
import DocumentEditor from '@/components/documents/DocumentEditor'
import { useParams } from 'react-router-dom'

function EditDocument() {
  const { documentId } = useParams()
  
  if (!documentId) return <div>Invalid document ID</div>
  
  return <DocumentEditor documentId={documentId} />
}
```

## Related Components

- **DocumentVersionHistory**: View and restore previous versions of documents
- **DocumentView**: View documents in read-only mode
- **DocumentList**: Browse all available documents

## License

This component is part of the Travel HR Buddy application.

## Support

For issues or questions, please contact the development team.
