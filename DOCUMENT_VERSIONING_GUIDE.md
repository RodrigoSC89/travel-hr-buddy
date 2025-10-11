# Document Versioning & Real-Time Comments

This document describes the implementation of document versioning and real-time comments system for AI-generated documents.

## Overview

Two new database tables have been added to support:
1. **Document Version History** - Automatically tracks changes to documents
2. **Real-Time Comments** - Enables collaborative commenting on documents

## Database Schema

### 1. document_versions Table

Stores historical versions of documents for version control.

**Columns:**
- `id` (UUID) - Primary key
- `document_id` (UUID) - Foreign key to `ai_generated_documents`
- `content` (TEXT) - The document content at this version
- `created_at` (TIMESTAMP) - When this version was created
- `updated_by` (UUID) - Foreign key to `auth.users` (who made the change)

**Automatic Versioning:**
A database trigger automatically creates a new version entry whenever a document's content is updated. This happens transparently without requiring additional code.

**Example Query:**
```sql
-- Get all versions of a document
SELECT * FROM document_versions 
WHERE document_id = 'your-document-id'
ORDER BY created_at DESC;

-- Get the most recent version
SELECT * FROM document_versions 
WHERE document_id = 'your-document-id'
ORDER BY created_at DESC
LIMIT 1;
```

### 2. document_comments Table

Stores real-time comments on documents for collaboration.

**Columns:**
- `id` (UUID) - Primary key
- `document_id` (UUID) - Foreign key to `ai_generated_documents`
- `user_id` (UUID) - Foreign key to `auth.users` (comment author)
- `content` (TEXT) - The comment text
- `created_at` (TIMESTAMP) - When the comment was created

**Example Query:**
```sql
-- Get all comments for a document
SELECT dc.*, u.email as user_email
FROM document_comments dc
LEFT JOIN auth.users u ON dc.user_id = u.id
WHERE dc.document_id = 'your-document-id'
ORDER BY dc.created_at DESC;
```

## Security (Row Level Security)

Both tables have RLS policies enabled to ensure data security:

### document_versions Policies:
- Users can **view** versions of documents they own
- Users can **create** versions (via the automatic trigger)

### document_comments Policies:
- Users can **view** comments on their own documents
- Users can **create** comments on their own documents
- Users can **update** only their own comments
- Users can **delete** only their own comments

## TypeScript Integration

TypeScript types are automatically generated in `src/integrations/supabase/types.ts`:

```typescript
import type { Database } from "@/integrations/supabase/types";

// Type for document version row
type DocumentVersion = Database["public"]["Tables"]["document_versions"]["Row"];

// Type for document comment row
type DocumentComment = Database["public"]["Tables"]["document_comments"]["Row"];

// Type for inserting a comment
type DocumentCommentInsert = Database["public"]["Tables"]["document_comments"]["Insert"];
```

## Usage Examples

### TypeScript/React Usage

#### 1. Fetching Document Versions

```typescript
import { supabase } from "@/integrations/supabase/client";

async function fetchDocumentVersions(documentId: string) {
  const { data, error } = await supabase
    .from("document_versions")
    .select("*")
    .eq("document_id", documentId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching versions:", error);
    return null;
  }

  return data;
}
```

#### 2. Adding a Comment

```typescript
import { supabase } from "@/integrations/supabase/client";

async function addComment(documentId: string, content: string) {
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from("document_comments")
    .insert({
      document_id: documentId,
      user_id: user?.id,
      content: content,
    })
    .select()
    .single();

  if (error) {
    console.error("Error adding comment:", error);
    return null;
  }

  return data;
}
```

#### 3. Real-Time Comments Subscription

```typescript
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

function useDocumentComments(documentId: string) {
  const [comments, setComments] = useState([]);

  useEffect(() => {
    // Fetch initial comments
    const fetchComments = async () => {
      const { data } = await supabase
        .from("document_comments")
        .select("*")
        .eq("document_id", documentId)
        .order("created_at", { ascending: false });
      
      if (data) setComments(data);
    };

    fetchComments();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel(`comments:${documentId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "document_comments",
          filter: `document_id=eq.${documentId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setComments((prev) => [payload.new, ...prev]);
          } else if (payload.eventType === "DELETE") {
            setComments((prev) => 
              prev.filter((c) => c.id !== payload.old.id)
            );
          } else if (payload.eventType === "UPDATE") {
            setComments((prev) =>
              prev.map((c) => (c.id === payload.new.id ? payload.new : c))
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [documentId]);

  return comments;
}
```

#### 4. Restoring a Previous Version

```typescript
import { supabase } from "@/integrations/supabase/client";

async function restoreVersion(documentId: string, versionId: string) {
  // Get the version content
  const { data: version } = await supabase
    .from("document_versions")
    .select("content")
    .eq("id", versionId)
    .single();

  if (!version) return null;

  // Update the document (this will automatically create a new version)
  const { data, error } = await supabase
    .from("ai_generated_documents")
    .update({ content: version.content })
    .eq("id", documentId)
    .select()
    .single();

  if (error) {
    console.error("Error restoring version:", error);
    return null;
  }

  return data;
}
```

## Performance Considerations

- **Indexes**: Both tables have indexes on frequently queried columns (`document_id`, `created_at`, `user_id`)
- **Cascading Deletes**: When a document is deleted, all its versions and comments are automatically deleted
- **Automatic Versioning**: The trigger only creates a version when content actually changes

## Migration File

The migration is located at:
```
supabase/migrations/20251011044227_create_document_versions_and_comments.sql
```

## Testing

Unit tests for the TypeScript types are located at:
```
src/tests/integrations/document-versioning.test.ts
```

Run tests with:
```bash
npm run test
```

## Next Steps

To integrate these features into your UI:

1. **Version History View**: Create a component to display document versions
2. **Comments Section**: Add a comment section to the document editor
3. **Real-time Updates**: Use Supabase Realtime to show live comments
4. **Version Comparison**: Implement a diff view to compare versions
5. **Notifications**: Notify users when someone comments on their document

## Support

For issues or questions:
- Check the Supabase documentation: https://supabase.com/docs
- Review the test files for usage examples
- Consult the TypeScript types in `src/integrations/supabase/types.ts`
