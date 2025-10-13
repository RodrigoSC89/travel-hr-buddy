# Document Editor Implementation Guide

## Overview

The DocumentEditor component provides a collaborative real-time document editing experience using TipTap editor, Yjs CRDT (Conflict-free Replicated Data Type), and WebRTC for peer-to-peer communication.

## Features

### Real-time Collaboration
- Multiple users can edit the same document simultaneously
- Changes are synchronized in real-time using WebRTC peer-to-peer connections
- Conflicts are automatically resolved using Yjs CRDT algorithm

### Auto-save
- Changes are automatically saved to Supabase database
- Debounced save with 3-second delay to reduce database writes
- Visual feedback when saving is in progress

### User Presence
- See other users' cursors in real-time
- Each user has a unique color-coded cursor
- User names displayed near cursors

### Version History
- Local version tracking (last 10 versions)
- One-click restore to previous version
- Timestamps for each version

### Rich Text Editing
- Full TipTap StarterKit features
- Headings (H1-H6)
- Bold, italic, strike-through
- Ordered and unordered lists
- Code blocks
- Blockquotes
- Horizontal rules

## Installation

The following dependencies are required:

```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-collaboration @tiptap/extension-collaboration-cursor yjs y-webrtc y-prosemirror lodash @types/lodash
```

## Database Setup

Apply the database migration to create the documents table:

```sql
-- Run this migration
supabase migration up
```

The migration creates:
- `documents` table with UUID primary key
- Row Level Security (RLS) policies for authenticated users
- Indexes for performance optimization

## Usage

### Basic Usage

```tsx
import DocumentEditor from '@/components/documents/DocumentEditor'

function MyPage() {
  const documentId = "your-uuid-here"
  
  return <DocumentEditor documentId={documentId} />
}
```

### Demo Page

Visit the demo page at `/admin/documents/demo` to:
- Test collaborative editing
- Generate document IDs
- See real-time synchronization
- Explore all features

### Multi-user Testing

1. Open the demo page
2. Copy the Document ID
3. Open the same page in multiple tabs/browsers
4. Use the same Document ID in all instances
5. Start editing - changes will sync in real-time!

## Architecture

```
User Input → TipTap Editor → Yjs CRDT → WebRTC Provider → Other Users
                  ↓
            Debounced Save (3s)
                  ↓
          Supabase Database
```

### Components Flow

1. **User Input**: User types in the editor
2. **TipTap Editor**: Rich text editing interface
3. **Yjs CRDT**: Converts edits to CRDT operations
4. **WebRTC Provider**: Broadcasts changes to peers
5. **Auto-save**: Debounced save to Supabase (3s)
6. **Database**: Persistent storage with RLS

## Configuration

### WebRTC Signaling Server

By default, the component uses the public Yjs signaling server:
- `wss://signaling.yjs.dev`

For production, consider:
- Running your own signaling server
- Using a commercial WebRTC service
- Implementing fallback servers

### Customizing User Presence

Edit the CollaborationCursor configuration:

```tsx
CollaborationCursor.configure({
  provider: provider,
  user: {
    name: currentUser.name, // Replace with actual user name
    color: currentUser.color, // Replace with user's color
  },
})
```

### Adjusting Auto-save Delay

Modify the debounce delay in DocumentEditor.tsx:

```tsx
const debouncedSave = useCallback(
  debounce((content: string) => {
    saveDocument(content);
  }, 3000), // Change this value (milliseconds)
  [saveDocument]
);
```

## Security

### Authentication
- All database operations require authentication
- Anonymous users cannot read or write documents

### Row Level Security
- Enabled on the documents table
- Policies enforce authenticated access
- User tracking on all updates

### WebRTC Encryption
- Peer-to-peer connections are encrypted by default
- No data passes through signaling server (only connection metadata)

## Troubleshooting

### Document Not Loading
- Check that the user is authenticated
- Verify the document ID exists in the database
- Check browser console for errors

### Collaboration Not Working
- Ensure all users are using the same document ID
- Check that WebRTC is not blocked by firewall
- Verify signaling server is accessible

### Auto-save Not Working
- Check Supabase connection
- Verify user has authentication token
- Check RLS policies are correctly configured

### Build Errors
- Ensure all dependencies are installed
- Check for TypeScript errors
- Verify imports are correct

## Best Practices

### Performance
- Limit the number of concurrent users (recommend < 50)
- Use document versioning for large documents
- Implement pagination for document lists

### User Experience
- Show connection status indicators
- Provide offline mode support
- Implement conflict resolution UI for edge cases

### Data Management
- Regular cleanup of old versions
- Implement document archiving
- Set up automated backups

## API Reference

### DocumentEditor Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| documentId | string | Yes | Unique identifier for the document |

### Database Schema

```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY,
  content TEXT,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review the implementation summary
3. Consult the visual guide
4. Check TipTap documentation: https://tiptap.dev
5. Review Yjs documentation: https://docs.yjs.dev

## License

This component is part of the Travel HR Buddy application.
