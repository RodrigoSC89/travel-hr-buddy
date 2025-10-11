# Document View Feature

## Overview

This implementation adds a document management system with role-based access control, specifically showing author email to administrators.

## Features Implemented

### 1. Database Schema (`supabase/migrations/20251011042318_create_documents_table.sql`)
- Created `documents` table with:
  - `id` (UUID, primary key)
  - `title` (TEXT, required)
  - `content` (TEXT, required)
  - `user_id` (UUID, references auth.users, required)
  - `created_at` (timestamp)
  - `updated_at` (timestamp)

- Row Level Security (RLS) Policies:
  - Users can view their own documents
  - Admins can view all documents
  - Users can create, update, and delete their own documents
  - Admins can update and delete all documents

### 2. Pages Created

#### DocumentView (`/admin/documents/view/:id`)
- Displays document details (title, content, creation date)
- Shows author email **only to administrators**
- Uses `user_roles` table to check if user is admin
- Fetches author email from `profiles` table when user is admin

#### DocumentList (`/admin/documents`)
- Lists all documents accessible to the user
- Shows "Seu" badge on documents owned by the current user
- Admins see all documents; regular users see only their own

#### DocumentCreate (`/admin/documents/create`)
- Form to create new documents
- Automatically associates document with current user
- Redirects to view page after creation

## How It Works

### Admin Role Check
The system checks if a user is admin by querying the `user_roles` table:

```typescript
const { data: roleData } = await supabase
  .from("user_roles")
  .select("role")
  .eq("user_id", user.id)
  .single();

const isAdmin = roleData?.role === "admin";
```

### Author Email Display
When viewing a document:
1. The document is fetched with the `user_id` field
2. If the current user is an admin, the system queries the `profiles` table
3. Author email is displayed only if both conditions are met

### Security
- RLS policies ensure users can only access documents they own
- Admin users can access all documents via the admin policy
- The `get_user_role()` function is used in RLS policies

## Routes

- `/admin/documents` - List all documents
- `/admin/documents/create` - Create new document
- `/admin/documents/view/:id` - View document details

## Testing

To test this feature:

1. **Create a document** as a regular user:
   - Navigate to `/admin/documents/create`
   - Fill in title and content
   - Submit the form

2. **View as regular user**:
   - Navigate to `/admin/documents/view/{document-id}`
   - Verify you can see your own document
   - Verify author email is NOT shown

3. **View as admin**:
   - Sign in as an admin user
   - Navigate to `/admin/documents/view/{document-id}`
   - Verify you can see the document
   - Verify author email IS shown

## Database Setup

Make sure to:
1. Run the migration: `20251011042318_create_documents_table.sql`
2. Ensure `profiles` table exists with email field
3. Ensure `user_roles` table exists with role field
4. Set at least one user as admin in the `user_roles` table

## Dependencies

This feature uses:
- React Router for navigation
- Supabase client for database access
- date-fns for date formatting
- Shadcn UI components (Card, Button, Input, Textarea, Badge)
- AuthContext for user authentication
