# PR #244 - Admin-Only Author Email Display Implementation

## Overview
This PR refactors and implements the functionality to display the author's email address in the DocumentView page, visible only to admin users.

## Changes Made

### 1. Updated DocumentView Component (`src/pages/admin/documents/DocumentView.tsx`)

#### Added imports:
- `usePermissions` hook to check user role

#### Updated Document interface:
```typescript
interface Document {
  title: string;
  content: string;
  created_at: string;
  generated_by_email?: string | null;  // New field
}
```

#### Modified database query:
- Changed from selecting only `title, content, created_at`
- Now includes a join with profiles table: `profiles:generated_by(email)`
- Extracts email from nested profiles object and adds it to document state

#### Updated UI:
- Wrapped date display in a `div` with `space-y-1` class for better spacing
- Added conditional rendering for author email:
  ```typescript
  {userRole === "admin" && doc.generated_by_email && (
    <p className="text-sm text-muted-foreground">
      Autor: <span className="font-medium">{doc.generated_by_email}</span>
    </p>
  )}
  ```

### 2. Enhanced Tests (`src/tests/pages/admin/documents/DocumentView.test.tsx`)

#### Added new test cases:
1. **Admin user sees author email**: Verifies that when a user with admin role views a document, the author's email is displayed
2. **Non-admin user doesn't see author email**: Verifies that when a non-admin user views a document, the author's email is hidden

#### Improved mocking:
- Created flexible mock for `usePermissions` hook
- Created flexible mock for Supabase client
- Tests can now simulate different user roles

## Security Considerations

- **Role-based access**: Only users with `userRole === "admin"` can see the author email
- **Database security**: The query uses Supabase's existing RLS policies which already allow admins to view all profiles
- **Null safety**: The code safely handles cases where email might be null or undefined

## Technical Details

### Database Query
The implementation uses Supabase's relational query syntax to join with the profiles table:
```typescript
.select(`
  title, 
  content, 
  created_at,
  generated_by,
  profiles:generated_by(email)
`)
```

This creates a nested object structure where `data.profiles.email` contains the author's email address.

### Permission Check
Uses the `usePermissions` hook which provides:
- `userRole`: The current user's role (admin, hr_manager, employee, etc.)
- Checks specifically for `userRole === "admin"` before displaying email

## Files Modified
1. `src/pages/admin/documents/DocumentView.tsx` - Main component implementation
2. `src/tests/pages/admin/documents/DocumentView.test.tsx` - Test coverage

## Testing
All tests pass with the new functionality:
- ✅ Document not found message displays correctly
- ✅ Back button renders in document view
- ✅ Admin users can see author email
- ✅ Non-admin users cannot see author email

## Benefits
1. **Transparency**: Admins can now see who created each document
2. **Accountability**: Clear authorship tracking for audit purposes
3. **Minimal changes**: Surgical implementation with no breaking changes
4. **Well-tested**: Comprehensive test coverage for new functionality
5. **Secure**: Role-based access control ensures only admins see sensitive information

## Future Enhancements
Potential improvements for future iterations:
- Display author's full name in addition to email
- Show when document was last modified and by whom
- Add author filtering in document list page
- Display author information in document versions
