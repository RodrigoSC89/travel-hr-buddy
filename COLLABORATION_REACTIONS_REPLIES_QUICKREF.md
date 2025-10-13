# Collaboration Reactions & Replies - Quick Reference

## 🚀 Quick Start

### For Users

**Adding Reactions:**
1. Navigate to `/admin/collaboration`
2. Find a comment you want to react to
3. Click one of the emoji buttons: 👍, ❤️, or 👏
4. Your reaction is counted and updated in real-time

**Replying to Comments:**
1. Scroll to the reply section below a comment
2. Type your response in the textarea
3. Click "➕ Responder"
4. Your reply appears immediately for all users

**Creating Comments:**
1. Use the main textarea at the top
2. Type your comment
3. Click "Adicionar Comentário"
4. Your comment appears at the top of the list

### For Developers

**Key Files:**
- **Migration:** `supabase/migrations/20251013004600_add_colab_reactions_and_replies.sql`
- **Component:** `src/pages/admin/collaboration.tsx`

**Database Tables:**
```
colab_comments (updated)
├── id (UUID)
├── author_id (UUID → profiles)
├── text (TEXT)
├── created_at (TIMESTAMPTZ)
└── reactions (JSONB) ← NEW

colab_replies (new)
├── id (UUID)
├── comment_id (UUID → colab_comments)
├── author_id (UUID → profiles)
├── text (TEXT)
└── created_at (TIMESTAMPTZ)
```

**Key Functions:**
```typescript
// Add a reaction
addReaction(commentId: string, emoji: string)

// Submit a reply
submitReply(commentId: string)

// Fetch replies
fetchReplies(commentId: string)

// Real-time subscriptions
setupRealtimeSubscriptions()
```

## 📊 API Usage

### Adding a Reaction
```typescript
const comment = comments.find(c => c.id === commentId);
const currentReactions = comment.reactions || {};
const newReactions = {
  ...currentReactions,
  [emoji]: (currentReactions[emoji] || 0) + 1,
};

await supabase
  .from("colab_comments")
  .update({ reactions: newReactions })
  .eq("id", commentId);
```

### Submitting a Reply
```typescript
await supabase.from("colab_replies").insert({
  comment_id: commentId,
  author_id: currentUserId,
  text: replyText,
});
```

### Fetching Replies
```typescript
const { data } = await supabase
  .from("colab_replies")
  .select(`
    *,
    profiles:author_id (email)
  `)
  .eq("comment_id", commentId)
  .order("created_at", { ascending: true });
```

## 🔒 Security Policies

### colab_comments
- ✅ View: All authenticated users
- ✅ Insert: Own comments only
- ✅ Update: Own comments only
- ✅ Delete: Own comments only

### colab_replies
- ✅ View: All authenticated users
- ✅ Insert: Own replies only
- ✅ Update: Own replies only
- ✅ Delete: Own replies only

## 🎨 UI Components

### Reaction Button
```tsx
<Button
  variant="outline"
  size="sm"
  onClick={() => addReaction(comment.id, "👍")}
  className="hover:bg-primary/10"
>
  👍 {comment.reactions["👍"] || 0}
</Button>
```

### Reply Section
```tsx
<div className="ml-6 mt-4 space-y-3 border-l-2 border-gray-200 pl-4">
  <p className="text-sm font-medium">💬 Respostas:</p>
  {replies[comment.id].map((reply) => (
    <div key={reply.id} className="bg-gray-50 p-3 rounded-lg">
      {/* Reply content */}
    </div>
  ))}
</div>
```

## 🐛 Troubleshooting

**Issue: Reactions not updating**
- Check that the user is authenticated
- Verify Supabase real-time is enabled
- Check browser console for errors

**Issue: Replies not showing**
- Ensure the migration has been applied
- Check RLS policies are correct
- Verify the `comment_id` foreign key is valid

**Issue: Cannot add reactions/replies**
- Confirm user is authenticated (`currentUserId` is not null)
- Check that the user has the proper permissions
- Look for error toasts in the UI

## 📈 Performance Tips

1. **Indexes are created** for:
   - `colab_replies.comment_id`
   - `colab_replies.created_at`
   - `colab_replies.author_id`

2. **Real-time channels** are optimized:
   - Comments channel updates on any change
   - Replies channel updates only relevant comment threads

3. **Query optimization:**
   - Fetch replies on-demand per comment
   - Use `.select()` with joins to reduce queries

## 🔄 Real-time Subscriptions

```typescript
// Comments channel
const commentsChannel = supabase
  .channel("colab_comments_changes")
  .on("postgres_changes", 
    { event: "*", schema: "public", table: "colab_comments" },
    () => { fetchComments(); }
  )
  .subscribe();

// Replies channel
const repliesChannel = supabase
  .channel("colab_replies_changes")
  .on("postgres_changes",
    { event: "*", schema: "public", table: "colab_replies" },
    (payload) => {
      const newReply = payload.new as Reply | null;
      if (newReply?.comment_id) {
        fetchReplies(newReply.comment_id);
      }
    }
  )
  .subscribe();
```

## ✅ Checklist

**Before Deployment:**
- [ ] Run migration: `supabase migration up`
- [ ] Test reactions on dev environment
- [ ] Test replies on dev environment
- [ ] Verify real-time updates work across tabs
- [ ] Check error handling and toast notifications
- [ ] Build succeeds: `npm run build`
- [ ] All tests pass: `npm test`

**After Deployment:**
- [ ] Verify migration applied in production
- [ ] Test reactions in production
- [ ] Test replies in production
- [ ] Monitor error logs
- [ ] Check performance metrics

---

**Quick Links:**
- [Full Implementation Guide](./COLLABORATION_REACTIONS_REPLIES_IMPLEMENTATION.md)
- [Visual Guide](./COLLABORATION_REACTIONS_REPLIES_VISUAL_GUIDE.md)
- [Complete Summary](./COLLABORATION_REACTIONS_REPLIES_COMPLETE.md)
