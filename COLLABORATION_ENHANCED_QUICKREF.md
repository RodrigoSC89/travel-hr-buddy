# 🤝 Enhanced Collaboration Module - Quick Reference

## 🎯 What's New

Enhanced collaboration module with:
- ✅ Real-time comments and replies
- ✅ Emoji reactions (👍, ❤️, 👏)
- ✅ Threaded reply system
- ✅ Toast notifications
- ✅ Author identification

## 📂 Files Modified

| File | Changes |
|------|---------|
| `supabase/migrations/20251013010000_add_colab_reactions_replies.sql` | Added reactions column + colab_replies table |
| `src/pages/admin/collaboration.tsx` | Complete rewrite with full features |

## 🗄️ Database Schema

### colab_comments (Enhanced)
```sql
ALTER TABLE colab_comments 
ADD COLUMN reactions JSONB DEFAULT '{}'::jsonb;
```

Example reactions:
```json
{
  "👍": 5,
  "❤️": 3,
  "👏": 2
}
```

### colab_replies (New Table)
```sql
CREATE TABLE colab_replies (
  id UUID PRIMARY KEY,
  comment_id UUID REFERENCES colab_comments(id),
  author_id UUID REFERENCES profiles(id),
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 🚀 Quick Deploy

```bash
# 1. Apply migration
cd travel-hr-buddy
supabase db push

# 2. Verify
supabase db inspect

# 3. Test
# Navigate to /admin/collaboration
```

## 💻 Code Examples

### Submit Comment
```typescript
async function submitComment() {
  if (!comment.trim()) return
  const { error } = await supabase
    .from('colab_comments')
    .insert({ text: comment })
  if (!error) {
    toast.success('✅ Comentário enviado')
    setComment('')
  }
}
```

### Add Reaction
```typescript
async function addReaction(id: string, emoji: string) {
  const comment = comments.find((c) => c.id === id)
  const current = comment?.reactions || {}
  const count = current[emoji] || 0
  const updated = { ...current, [emoji]: count + 1 }
  await supabase
    .from('colab_comments')
    .update({ reactions: updated })
    .eq('id', id)
}
```

### Submit Reply
```typescript
async function submitReply(commentId: string) {
  const text = replyText[commentId]
  if (!text?.trim()) return
  const { error } = await supabase
    .from('colab_replies')
    .insert({ text, comment_id: commentId })
  if (!error) {
    toast.success('✉️ Resposta enviada')
  }
}
```

### Real-time Subscription
```typescript
useEffect(() => {
  fetchComments()
  const channel = supabase
    .channel('colab-comments-realtime')
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public', 
      table: 'colab_comments' 
    }, fetchComments)
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public', 
      table: 'colab_replies' 
    }, fetchComments)
    .subscribe()
  return () => supabase.removeChannel(channel)
}, [])
```

## 🔍 Queries

### Fetch Comments with Author
```typescript
const { data } = await supabase
  .from('colab_comments')
  .select('id, text, created_at, author_id, reactions, author:profiles(email)')
  .order('created_at', { ascending: false })
```

### Fetch Replies for Comments
```typescript
const { data } = await supabase
  .from('colab_replies')
  .select('id, comment_id, text, created_at, author_id, author:profiles(email)')
  .order('created_at', { ascending: true })
```

## 🔐 RLS Policies

### colab_comments
- ✅ SELECT: All authenticated users
- ✅ INSERT: Authenticated users (own comments)
- ✅ UPDATE/DELETE: Users (own comments only)

### colab_replies
- ✅ SELECT: All authenticated users
- ✅ INSERT: Authenticated users (own replies)
- ✅ UPDATE/DELETE: Users (own replies only)

## 🎨 UI Structure

```
📦 Collaboration Page
├── 📝 Comment Input Card
│   ├── Textarea (placeholder: "💬 Deixe seu comentário...")
│   └── Submit Button ("✉️ Enviar Comentário")
└── 📜 ScrollArea (h-[65vh])
    └── 💬 Comment Cards
        ├── 🕒 Timestamp
        ├── 👤 Author Email
        ├── 📄 Comment Text
        ├── 👍❤️👏 Reaction Buttons
        └── 💭 Reply Thread
            ├── Reply List
            ├── Reply Textarea
            └── Reply Button ("➕ Responder")
```

## 🧪 Testing Checklist

- [ ] Navigate to `/admin/collaboration`
- [ ] Page loads without disabled alert
- [ ] Submit a comment → See success toast
- [ ] Comment appears with author email
- [ ] Click 👍 → Counter increments
- [ ] Click ❤️ → Counter increments
- [ ] Click 👏 → Counter increments
- [ ] Type reply → Submit → See in thread
- [ ] Open second browser → Verify real-time updates

## 🐛 Troubleshooting

### Comments Not Loading
```typescript
// Check authentication
const { data: { user } } = await supabase.auth.getUser()
console.log('User:', user)

// Check RLS policies
SELECT * FROM colab_comments; -- in Supabase SQL editor
```

### Reactions Not Saving
```sql
-- Verify reactions column exists
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'colab_comments' AND column_name = 'reactions';
```

### Replies Not Appearing
```sql
-- Check colab_replies table
SELECT * FROM colab_replies ORDER BY created_at DESC LIMIT 5;

-- Verify foreign key
SELECT conname FROM pg_constraint 
WHERE conrelid = 'colab_replies'::regclass;
```

### Real-time Not Working
```typescript
// Check channel status
const channel = supabase.channel('test')
channel.subscribe((status) => {
  console.log('Channel status:', status)
})
```

## 📊 Performance Tips

1. **Indexes are created** for:
   - `colab_replies.comment_id` (group replies)
   - `colab_replies.created_at` (ordering)
   - `colab_replies.author_id` (filtering)

2. **Optimize queries**:
   ```typescript
   // Good: Single query with join
   .select('*, author:profiles(email)')
   
   // Avoid: Multiple queries
   // Don't fetch profiles separately
   ```

3. **Real-time subscription**:
   - ✅ Subscribe once in useEffect
   - ✅ Clean up on unmount
   - ✅ Listen to both tables

## 🎯 Key Features Summary

| Feature | Implementation |
|---------|---------------|
| **Real-time** | Supabase Realtime channels |
| **Reactions** | JSONB column with emoji keys |
| **Replies** | Foreign key to comment_id |
| **Notifications** | Sonner toast library |
| **Auth** | Supabase auth.getUser() |
| **Security** | RLS policies on both tables |

## 📚 Related Docs

- [COLLABORATION_ENHANCED_IMPLEMENTATION.md](./COLLABORATION_ENHANCED_IMPLEMENTATION.md) - Full documentation
- [COLLABORATION_MODULE_IMPLEMENTATION.md](./COLLABORATION_MODULE_IMPLEMENTATION.md) - Basic version
- [COLLABORATION_QUICKREF.md](./COLLABORATION_QUICKREF.md) - Original reference

## ✅ Status

**Implementation:** ✅ Complete
**Migration:** ⏳ Ready to deploy
**Testing:** ✅ Build/lint passed
**Documentation:** ✅ Complete

---

**Route:** `/admin/collaboration`

**Access:** Requires authentication

**Features:** Real-time comments, reactions, threaded replies
