# 🚀 Collaboration Module - Quick Start Guide

## 🎯 What Was Built

A complete collaboration module with:
- 💬 Comments system
- 💭 Threaded replies
- ❤️ Emoji reactions (👍, ❤️, 👏)
- 🔐 Role-based permissions (admin/user)
- 📊 Admin panel with special UI

## ⚡ Quick Access

**URL**: `/admin/collaboration`

## 🔑 User Roles

### Regular User
- Can post comments
- Can reply to comments
- Can add/remove reactions
- Sees only standard UI

### Admin User
- All regular user features
- **Plus**: Yellow admin banner
- Message: "Você tem acesso para visualizar todas as interações e estatísticas"
- Foundation for admin analytics

## 💻 How to Make a User Admin

Run this SQL in Supabase:
```sql
UPDATE profiles SET role = 'admin' WHERE email = 'admin@example.com';
```

## 📊 Database Tables

### `colab_comments`
Main comments table (already existed)
- `id`, `author_id`, `text`, `created_at`

### `colab_replies` (NEW)
Threaded replies to comments
- `id`, `comment_id`, `author_id`, `text`, `created_at`

### `colab_reactions` (NEW)
Emoji reactions on comments
- `id`, `comment_id`, `user_id`, `emoji`, `created_at`
- Unique constraint: One reaction per user per comment per emoji

## 🎨 UI Features

### Comment Input
- Textarea with placeholder: "💬 Deixe seu comentário ou sugestão..."
- Submit button with emoji: "✉️ Enviar Comentário"
- Disabled when empty

### Comment Display
- Author email with 👤 icon
- Timestamp with 🕒 icon
- Formatted with `toLocaleString()`

### Reactions
- Three emoji buttons: 👍 ❤️ 👏
- Shows count next to each emoji
- Click to toggle (add/remove)
- Hover effect: `scale-110`

### Replies
- Section under each comment
- Header: "💬 Respostas:"
- Visual indentation with border-left
- Separate textarea and button for each comment

## 🔐 Security (RLS)

All tables have Row Level Security enabled:

✅ **SELECT**: All authenticated users can view  
✅ **INSERT**: Users can only insert with their own ID  
✅ **UPDATE**: Users can only update their own content  
✅ **DELETE**: Users can only delete their own content  

## 🚀 Usage Examples

### Post a Comment
1. Navigate to `/admin/collaboration`
2. Type in the textarea
3. Click "✉️ Enviar Comentário"
4. Toast notification: "Comentário enviado com sucesso!"

### Reply to a Comment
1. Find the comment you want to reply to
2. Scroll to the "Respostas" section
3. Type in the reply textarea
4. Click "➕ Responder"
5. Toast notification: "Resposta enviada com sucesso!"

### Add a Reaction
1. Find the comment
2. Click on any emoji (👍, ❤️, or 👏)
3. Counter increments immediately
4. Click again to remove your reaction

### View as Admin
1. Set your profile role to 'admin'
2. Navigate to `/admin/collaboration`
3. See yellow banner at top
4. Use all regular features

## 🛠️ Technical Stack

- **Frontend**: React + TypeScript
- **UI Components**: shadcn/ui (Card, Button, Textarea, ScrollArea)
- **Database**: Supabase PostgreSQL
- **State**: React hooks (useState, useEffect)
- **Auth**: useAuthProfile() hook
- **Notifications**: useToast() hook

## 📈 Performance

- **Indexes**: Created on `created_at` and foreign keys
- **Query Limit**: 1000 comments (easily paginated)
- **Joins**: Efficient with profiles table
- **Lazy Loading**: Component code-split in App.tsx

## 🔮 Future Extensions

Ready for:
- ✨ **Liveblocks** - Real-time collaboration
- ✨ **Yjs + Prosemirror** - Rich text collaborative editing
- ✨ **Admin Analytics** - Engagement metrics
- ✨ **Notifications** - Alert on new replies
- ✨ **File Attachments** - Add images/docs
- ✨ **@Mentions** - Notify specific users

## 🐛 Troubleshooting

### Comments Not Loading
- Check authentication (must be logged in)
- Verify Supabase connection
- Check browser console for errors

### Cannot Submit Comment
- Ensure you're authenticated
- Check that profiles table has your record
- Verify RLS policies are active

### Admin Banner Not Showing
- Verify your profile role is set to 'admin'
- Check the database: `SELECT role FROM profiles WHERE id = 'your-id'`
- Clear browser cache and reload

### Reactions Not Working
- Check authentication
- Verify you haven't already reacted with that emoji
- Check browser console for errors

## 📝 Code Snippets

### Check User Role
```typescript
import { useAuthProfile } from "@/hooks/use-auth-profile";

const { profile } = useAuthProfile();
const isAdmin = profile?.role === "admin";
```

### Fetch Comments
```typescript
const { data, error } = await supabase
  .from("colab_comments")
  .select("id, text, created_at, author_id, author:profiles(email)")
  .order("created_at", { ascending: false });
```

### Submit Comment
```typescript
await supabase
  .from("colab_comments")
  .insert({ text: comment, author_id: user.id });
```

### Add Reaction
```typescript
await supabase
  .from("colab_reactions")
  .insert({ comment_id, user_id: user.id, emoji: "👍" });
```

## ✅ Checklist for Testing

- [ ] Navigate to `/admin/collaboration`
- [ ] Post a comment as regular user
- [ ] Reply to your own comment
- [ ] Add reactions (all 3 types)
- [ ] Remove reactions (click again)
- [ ] Set role to admin and verify banner shows
- [ ] Post comment as admin
- [ ] Verify all toasts appear correctly
- [ ] Test back button returns to admin panel

## 📚 Documentation Files

- `COLLABORATION_FULL_IMPLEMENTATION.md` - Complete technical documentation
- `COLLABORATION_QUICKREF.md` - This quick reference (existing)
- `COLLABORATION_MODULE_IMPLEMENTATION.md` - Original implementation notes

## 🎉 Status

✅ **Fully Implemented**  
✅ **Production Ready**  
✅ **Build Verified**  
✅ **Documentation Complete**

---

**Need Help?** Check the full documentation in `COLLABORATION_FULL_IMPLEMENTATION.md`
