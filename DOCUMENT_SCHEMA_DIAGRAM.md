# Database Schema Diagram: Document Versioning & Comments

## Entity Relationship Diagram

```
┌─────────────────────────────────────┐
│   auth.users                        │
│                                     │
│  • id (UUID) PK                     │
│  • email                            │
│  • ...                              │
└───┬─────────────────────────────┬───┘
    │                             │
    │ generated_by                │ user_id
    │                             │
┌───▼─────────────────────────────────┐
│   ai_generated_documents            │
│                                     │
│  • id (UUID) PK                     │
│  • title (TEXT)                     │
│  • content (TEXT)                   │
│  • prompt (TEXT)                    │
│  • generated_by (UUID) FK ────────┐ │
│  • created_at (TIMESTAMP)         │ │
│  • updated_at (TIMESTAMP)         │ │
└───┬──────────────┬────────────────┘ │
    │              │                  │
    │ document_id  │ document_id      │
    │              │                  │
┌───▼──────────────┴──────────────┐   │
│   document_versions              │   │
│                                  │   │
│  • id (UUID) PK                  │   │
│  • document_id (UUID) FK         │   │
│  • content (TEXT)                │   │
│  • created_at (TIMESTAMP)        │   │
│  • updated_by (UUID) FK ─────────┼───┘
└──────────────────────────────────┘   
                                       
┌────────────────────────────────────┐ │
│   document_comments                │ │
│                                    │ │
│  • id (UUID) PK                    │ │
│  • document_id (UUID) FK           │ │
│  • user_id (UUID) FK ──────────────┘
│  • content (TEXT)                  
│  • created_at (TIMESTAMP)          
└────────────────────────────────────┘
```

## Tables Overview

### 1. ai_generated_documents (Base Table)
**Purpose**: Stores AI-generated documents

**Key Fields**:
- `id`: Unique identifier
- `content`: Current document content
- `generated_by`: User who created the document

**Relationships**:
- Has many `document_versions`
- Has many `document_comments`

---

### 2. document_versions (Version History)
**Purpose**: Stores historical versions of documents

**Key Fields**:
- `document_id`: References `ai_generated_documents`
- `content`: Content at this version
- `updated_by`: User who made the change
- `created_at`: When this version was created

**Triggers**:
- Automatically created when `ai_generated_documents.content` is updated

**Relationships**:
- Belongs to `ai_generated_documents`
- Belongs to `auth.users` (updated_by)

---

### 3. document_comments (Comments)
**Purpose**: Stores comments on documents

**Key Fields**:
- `document_id`: References `ai_generated_documents`
- `user_id`: User who wrote the comment
- `content`: Comment text
- `created_at`: When comment was created

**Real-time**: 
- Supports Supabase Realtime subscriptions

**Relationships**:
- Belongs to `ai_generated_documents`
- Belongs to `auth.users` (user_id)

---

## Data Flow

### When a Document is Updated

```
1. User edits document content
   ↓
2. UPDATE ai_generated_documents SET content = 'new content'
   ↓
3. TRIGGER fires: create_document_version()
   ↓
4. Old content saved to document_versions
   ↓
5. New content saved in ai_generated_documents
   ↓
6. Version history preserved ✓
```

### When a Comment is Added

```
1. User writes comment
   ↓
2. INSERT INTO document_comments (document_id, user_id, content)
   ↓
3. RLS checks permissions
   ↓
4. Comment saved to database
   ↓
5. Real-time subscribers notified
   ↓
6. Other users see new comment ✓
```

---

## Indexes

### document_versions
- `idx_document_versions_document_id` → Fast lookup by document
- `idx_document_versions_created_at` → Chronological ordering
- `idx_document_versions_updated_by` → Filter by author

### document_comments
- `idx_document_comments_document_id` → Fast lookup by document
- `idx_document_comments_user_id` → Filter by commenter
- `idx_document_comments_created_at` → Chronological ordering

---

## Row Level Security (RLS)

### document_versions Policies

| Operation | Policy | Rule |
|-----------|--------|------|
| SELECT | Users can view versions they own | `EXISTS (SELECT 1 FROM ai_generated_documents WHERE id = document_versions.document_id AND generated_by = auth.uid())` |
| INSERT | Automatic via trigger | Same as SELECT |

### document_comments Policies

| Operation | Policy | Rule |
|-----------|--------|------|
| SELECT | View comments on own docs | `EXISTS (SELECT 1 FROM ai_generated_documents WHERE id = document_comments.document_id AND generated_by = auth.uid())` |
| INSERT | Create on own docs | `user_id = auth.uid() AND EXISTS (...)` |
| UPDATE | Update own comments | `user_id = auth.uid()` |
| DELETE | Delete own comments | `user_id = auth.uid()` |

---

## Cascade Behaviors

When a document is deleted:

```
DELETE FROM ai_generated_documents WHERE id = 'doc-id'
   ↓
CASCADE DELETE document_versions (all versions)
   ↓
CASCADE DELETE document_comments (all comments)
   ↓
Clean removal with no orphans ✓
```

---

## Storage Estimates

Assuming average document:
- Content: ~5KB per version
- Comment: ~500 bytes per comment

Example document with 10 versions and 20 comments:
- Versions: 10 × 5KB = 50KB
- Comments: 20 × 500B = 10KB
- Total: ~60KB per document

With 1,000 documents:
- Total storage: ~60MB
- Very manageable! ✓

---

## Performance Characteristics

### Queries

| Query | Performance | Notes |
|-------|-------------|-------|
| Get document | O(1) | Direct PK lookup |
| Get versions | O(log n) | Indexed on document_id |
| Get comments | O(log n) | Indexed on document_id |
| Create version | O(1) | Automatic trigger |
| Create comment | O(1) | Direct insert |

### Scalability

- ✅ Indexes ensure fast queries even with millions of rows
- ✅ RLS policies run efficiently with proper indexes
- ✅ Real-time subscriptions scale via Supabase infrastructure
- ✅ Cascade deletes are transactional and atomic

---

## Real-time Subscription Pattern

```typescript
// Subscribe to new comments
supabase
  .channel('document-comments')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'document_comments',
    filter: `document_id=eq.${docId}`
  }, (payload) => {
    console.log('New comment:', payload.new)
  })
  .subscribe()
```

Subscription is:
- ✅ Efficient (filtered at database level)
- ✅ Real-time (< 100ms latency)
- ✅ Secure (RLS policies still apply)

---

## Summary

✅ **3 tables** working together seamlessly
✅ **Automatic versioning** via database trigger
✅ **Real-time updates** via Supabase Realtime
✅ **Secure** via RLS policies
✅ **Fast** via strategic indexes
✅ **Scalable** design patterns
