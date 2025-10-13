# Document Editor Quick Start Guide

## 🚀 Quick Start in 3 Steps

### Step 1: Visit the Demo
Navigate to: `/admin/documents/demo`

### Step 2: Try Real-time Collaboration
1. Copy the Document ID shown on the page
2. Open the same page in a new browser tab
3. Paste the Document ID in the new tab
4. Start editing in both tabs - see changes sync instantly!

### Step 3: Use in Your Code
```tsx
import { DocumentEditor } from "@/components/documents/DocumentEditor";

function MyComponent() {
  const documentId = crypto.randomUUID(); // Generate unique ID
  return <DocumentEditor documentId={documentId} />;
}
```

---

## 📦 Installation

Dependencies are already installed:
- ✅ @tiptap/react
- ✅ @tiptap/starter-kit
- ✅ @tiptap/extension-collaboration
- ✅ @tiptap/extension-collaboration-cursor
- ✅ yjs
- ✅ y-webrtc
- ✅ lodash

---

## 🔧 Database Setup

Run the migration:
```bash
supabase migration up
```

Or execute manually:
```sql
-- See: supabase/migrations/20251013023900_create_documents_table.sql
```

This creates the `documents` table with Row Level Security.

---

## 💡 Basic Usage

### Single User Editing
```tsx
import { DocumentEditor } from "@/components/documents/DocumentEditor";

function DocumentPage() {
  const [docId] = useState(crypto.randomUUID());
  
  return <DocumentEditor documentId={docId} />;
}
```

### Multi-User Collaboration
Share the same `documentId` across users:

```tsx
// User 1
<DocumentEditor documentId="550e8400-e29b-41d4-a716-446655440000" />

// User 2 (different browser/tab)
<DocumentEditor documentId="550e8400-e29b-41d4-a716-446655440000" />

// Both will see real-time updates!
```

---

## 🎯 Features at a Glance

| Feature | Description |
|---------|-------------|
| 🔄 Real-time Sync | WebRTC P2P with 50-200ms latency |
| 🚀 Conflict-free | Yjs CRDT automatically merges edits |
| 💾 Auto-save | Saves to database every 3 seconds |
| 👥 User Presence | See colored cursors of other users |
| 📝 Rich Text | Bold, italic, headings, lists, code |
| 🔒 Secure | Authentication + RLS required |

---

## 🎨 Editor Toolbar

Available formatting options:
- **B** - Bold text (`Ctrl+B`)
- **I** - Italic text (`Ctrl+I`)
- **H1** - Large heading
- **H2** - Medium heading
- **• List** - Bullet list
- **</>** - Code block

---

## 🔐 Authentication Required

The editor requires an authenticated user:
```tsx
import { useAuth } from "@/contexts/AuthContext";

function ProtectedEditor() {
  const { user } = useAuth();
  
  if (!user) {
    return <div>Please log in to edit documents</div>;
  }
  
  return <DocumentEditor documentId="..." />;
}
```

---

## 🌐 Routes

- **Demo Page**: `/admin/documents/demo`
- **Editor Page**: `/admin/documents/editor`

---

## 🐛 Troubleshooting

### Changes not syncing?
- ✅ Ensure same `documentId` is used
- ✅ Check WebRTC is not blocked
- ✅ Verify internet connection

### Auto-save not working?
- ✅ User must be authenticated
- ✅ Database must have `documents` table
- ✅ Check browser console for errors

### Editor not loading?
- ✅ Run `npm install` to ensure dependencies
- ✅ Check for TypeScript errors
- ✅ Verify Yjs is initialized

---

## 📚 More Documentation

- **Full Guide**: `DOCUMENT_EDITOR_GUIDE.md`
- **Implementation Details**: `DOCUMENT_EDITOR_IMPLEMENTATION_SUMMARY.md`
- **Visual Guide**: `DOCUMENT_EDITOR_VISUAL_GUIDE.md`

---

## 🎉 That's It!

You're ready to use collaborative document editing. Start with the demo at `/admin/documents/demo` and explore the features!

For questions or issues, refer to the full documentation or check the troubleshooting section.
