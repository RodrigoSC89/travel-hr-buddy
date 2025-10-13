# 🚀 Collaboration Reactions & Replies - Quick Reference

## Quick Start

### Adding a Reaction
```typescript
const addReaction = async (commentId: string, emoji: string) => {
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
};
```

### Submitting a Reply
```typescript
const submitReply = async (commentId: string, text: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  await supabase.from("colab_replies").insert({
    comment_id: commentId,
    text: text,
    author_id: user.id,
  });
};
```

### Fetching Replies
```typescript
const fetchReplies = async () => {
  const { data } = await supabase
    .from("colab_replies")
    .select("id, comment_id, author_id, text, created_at, author:profiles(email)")
    .order("created_at", { ascending: true });

  // Group by comment_id
  const grouped = data.reduce((acc, reply) => {
    if (!acc[reply.comment_id]) acc[reply.comment_id] = [];
    acc[reply.comment_id].push(reply);
    return acc;
  }, {});

  return grouped;
};
```

## Database Schema

### colab_comments (enhanced)
```sql
ALTER TABLE colab_comments 
ADD COLUMN reactions JSONB DEFAULT '{}'::jsonb;
```

### colab_replies (new)
```sql
CREATE TABLE colab_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID REFERENCES colab_comments(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Real-time Subscriptions

### Comments Channel
```typescript
const commentsChannel = supabase
  .channel("colab_comments_changes")
  .on(
    "postgres_changes",
    { event: "*", schema: "public", table: "colab_comments" },
    () => fetchComments()
  )
  .subscribe();
```

### Replies Channel
```typescript
const repliesChannel = supabase
  .channel("colab_replies_changes")
  .on(
    "postgres_changes",
    { event: "*", schema: "public", table: "colab_replies" },
    () => fetchReplies()
  )
  .subscribe();
```

## UI Components

### Reaction Buttons
```tsx
{emojis.map((emoji) => (
  <Button
    key={emoji}
    variant="outline"
    size="sm"
    onClick={() => addReaction(comment.id, emoji)}
  >
    {emoji} {comment.reactions?.[emoji] || 0}
  </Button>
))}
```

### Reply Input
```tsx
<Textarea
  placeholder="Responder..."
  value={replyTexts[comment.id] || ""}
  onChange={(e) => setReplyTexts({
    ...replyTexts,
    [comment.id]: e.target.value,
  })}
/>
<Button
  onClick={() => submitReply(comment.id)}
  disabled={!replyTexts[comment.id]?.trim()}
>
  ➕ Responder
</Button>
```

### Reply Display
```tsx
{replies[comment.id]?.map((reply) => (
  <div key={reply.id} className="bg-gray-50 p-3 rounded-md">
    <div className="text-xs text-muted-foreground">
      {new Date(reply.created_at).toLocaleString("pt-BR")}
    </div>
    <div className="text-xs text-muted-foreground">
      {reply.author?.email}
    </div>
    <p className="text-sm">{reply.text}</p>
  </div>
))}
```

## RLS Policies

### Replies - View
```sql
CREATE POLICY "Allow authenticated users to view replies"
  ON colab_replies FOR SELECT TO authenticated USING (true);
```

### Replies - Insert
```sql
CREATE POLICY "Allow authenticated users to insert replies"
  ON colab_replies FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = author_id);
```

## Migration Command
```bash
supabase migration up
```

## Available Emojis
- 👍 Thumbs up
- ❤️ Heart
- 👏 Clapping hands

## Key Features
✅ Real-time reactions  
✅ Threaded replies  
✅ Secure (RLS policies)  
✅ Type-safe (TypeScript)  
✅ Optimized (indexes)  
✅ User-friendly UI
