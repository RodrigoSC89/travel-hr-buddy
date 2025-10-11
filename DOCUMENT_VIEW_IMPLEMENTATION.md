# Document View with Version History and Real-Time Comments

## Overview

This feature enhances the document viewing experience by adding:
- **Version History**: Automatic versioning system that saves the previous content before each edit
- **Real-Time Comments**: Live commenting system with Supabase real-time subscriptions
- **Permission-Based Editing**: Only admins and document owners can edit documents

## Implementation Details

### Database Schema

#### 1. `document_versions` Table
Stores historical versions of document content:
```sql
CREATE TABLE public.document_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.ai_generated_documents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
```

#### 2. `document_comments` Table
Stores user comments on documents:
```sql
CREATE TABLE public.document_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.ai_generated_documents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
```

### Features

#### Version History
- Before each document update, the current content is saved to `document_versions`
- Each version includes:
  - The complete document content at that point in time
  - The user who made the update
  - Timestamp of the version

#### Real-Time Comments
- Users can add comments to documents they have access to
- Comments are updated in real-time using Supabase's real-time subscriptions
- All users viewing the same document see new comments instantly
- Each comment displays:
  - Comment content
  - Creation timestamp (formatted as dd/MM/yyyy HH:mm)

#### Permission System
- **View Access**: Users can view documents they created or (if admin) all documents
- **Edit Access**: Only the document owner or admins can edit documents
- **Comment Access**: All users with view access can comment

### User Interface

#### View Mode
- Document title and creation date
- Document content in a card
- Edit button (visible only if user has edit permission)
- Comments section below the document

#### Edit Mode
- Large textarea (12 rows) for editing content
- "Save Changes" button with save icon
- Cancel is handled by closing the edit mode

#### Comments Section
- List of existing comments with timestamps
- Text area for new comments
- "Send" button to submit comments
- Real-time updates when new comments are added

### Technical Implementation

#### Component Structure (`DocumentView.tsx`)
- React functional component with hooks
- State management for:
  - Document data
  - Loading state
  - Editing mode
  - Comments
  - Admin status
  - Author email (for admins)

#### Real-Time Subscription
```typescript
const channel = supabase
  .channel(`document-comments-${id}`)
  .on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "document_comments",
      filter: `document_id=eq.${id}`,
    },
    () => {
      loadComments();
    }
  )
  .subscribe();
```

#### Version Saving Flow
1. User clicks "Save Changes"
2. System creates a new version record with the current content
3. System updates the document with the new content
4. Edit mode closes and new content is displayed
5. Success toast notification is shown

### Row Level Security (RLS) Policies

#### Document Versions
- Users can view versions of their own documents
- Admins can view all versions
- System can create versions automatically

#### Document Comments
- Users can view comments on documents they can access
- Admins can view all comments
- Users can add comments to accessible documents
- Admins can comment on any document

### Error Handling
- Toast notifications for all operations (success/error)
- Graceful handling of missing documents
- Proper error messages for failed operations
- Loading states during async operations

### Access Route
The document view is accessible at:
```
/admin/documents/view/:id
```

Where `:id` is the UUID of the document.

## Usage Example

### Viewing a Document
1. Navigate to `/admin/documents/view/[document-id]`
2. Document loads with title, creation date, and content
3. Comments section displays existing comments in real-time

### Editing a Document
1. User with edit permission clicks "Edit Document" button
2. Content becomes editable in a textarea
3. User modifies content
4. User clicks "Save Changes"
5. Previous version is saved to history
6. New content is saved
7. View mode is restored with new content

### Adding a Comment
1. User types comment in the text area at the bottom
2. User clicks "Send" button
3. Comment is saved to database
4. All users viewing the document see the new comment immediately
5. Success notification is shown

## Future Enhancements

Possible improvements for future versions:
1. Display version history to users
2. Ability to restore previous versions
3. User names/avatars in comments
4. Comment editing and deletion
5. Comment threading/replies
6. Rich text editing for document content
7. Document change notifications
8. Comment reactions/likes

## Testing Checklist

- [x] Database migrations created
- [x] Component updated with new functionality
- [x] Build succeeds without errors
- [ ] Manual testing of view functionality
- [ ] Manual testing of edit functionality
- [ ] Manual testing of version saving
- [ ] Manual testing of real-time comments
- [ ] Permission testing (admin vs owner vs other users)

## Files Modified

1. **New Migration**: `supabase/migrations/20251011044200_create_document_versions_and_comments.sql`
   - Creates `document_versions` table
   - Creates `document_comments` table
   - Sets up RLS policies
   - Creates performance indexes

2. **Updated Component**: `src/pages/admin/documents/DocumentView.tsx`
   - Added editing functionality
   - Added version saving before updates
   - Added real-time comments
   - Added permission checks
   - Added toast notifications

## Dependencies

No new dependencies were added. The feature uses existing libraries:
- `@supabase/supabase-js` for database operations and real-time
- `date-fns` for date formatting
- `lucide-react` for icons
- `react-router-dom` for routing
- UI components from the existing component library
