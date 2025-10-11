# PR236 - Refactor Document View Page for Role-Based Author Visibility

## Overview
This PR implements role-based access control for the Document View page (`DocumentView.tsx`), ensuring that users can only view documents they own unless they have admin or hr_manager roles.

## Problem Statement
The Document View page previously allowed any authenticated user to view any AI-generated document by ID, without checking if they were the author or had the appropriate role. This needed to be restricted to follow the principle of least privilege.

## Solution

### 1. Added Role-Based Access Control
**File Modified**: `src/pages/admin/documents/DocumentView.tsx`

#### Key Changes:
1. **Import necessary dependencies:**
   - Added `RoleBasedAccess` component from `@/components/auth/role-based-access`
   - Added `usePermissions` hook from `@/hooks/use-permissions`
   - Added `useAuth` hook from `@/contexts/AuthContext`

2. **Fetch author information:**
   - Updated database query to include `generated_by` field
   - This field contains the user ID of the document creator

3. **Implement access control logic:**
   ```typescript
   // Check access: admin/hr_manager can view all, others only their own
   const isAdmin = userRole === "admin" || userRole === "hr_manager";
   const isOwner = data.generated_by === user.id;

   if (!isAdmin && !isOwner) {
     setAccessDenied(true);
     setDoc(null);
   }
   ```

4. **Display appropriate UI:**
   - Show loading state while checking permissions
   - Show access denied message (via RoleBasedAccess component) for unauthorized access
   - Show document content for authorized users

### 2. Access Control Behavior
- **Admin/HR Manager Users**: Can view ALL AI-generated documents
- **Regular Users**: Can only view documents they created
- **Unauthorized Users**: See an "Acesso Negado" (Access Denied) message with warning icon
- **Loading State**: Shows a loading spinner while fetching document and checking permissions

### 3. Test Coverage
**File Created**: `src/tests/pages/admin/documents/document-view.test.tsx`

Added 7 comprehensive tests:
1. Should show loading state initially
2. Should display document when user is the owner
3. Should display access denied when user is not owner and not admin
4. Should display document when user is admin regardless of ownership
5. Should display document when user is hr_manager regardless of ownership
6. Should display not found message when document does not exist
7. Should format creation date correctly

All tests pass successfully (51 total tests pass across the entire test suite).

## Alignment with Database Security

This frontend access control complements the existing database Row Level Security (RLS) policies:

From `supabase/migrations/20251011035058_create_ai_generated_documents.sql`:
```sql
-- Política: usuários podem visualizar seus próprios documentos
CREATE POLICY "Users can view their own AI documents" ON public.ai_generated_documents
  FOR SELECT USING (generated_by = auth.uid());
```

This provides defense-in-depth security by enforcing access control at both:
1. **Frontend Level**: Prevents unauthorized UI access and provides better UX
2. **Database Level**: Prevents unauthorized data access (enforced by RLS)

## Files Changed

1. `src/pages/admin/documents/DocumentView.tsx`
   - Added imports for RoleBasedAccess, usePermissions, and useAuth
   - Updated Document interface to include `generated_by` field
   - Implemented role-based access checking logic
   - Added access denied state and UI

2. `src/tests/pages/admin/documents/document-view.test.tsx` (new file)
   - Created comprehensive test suite
   - All 7 tests pass

## Validation

### Test Status
✅ All 51 tests pass (10 test files)
✅ 7 new tests added for DocumentViewPage
✅ All existing tests continue to pass

### Linting Status
✅ Code follows existing patterns
✅ TypeScript types properly defined
✅ React hooks used correctly

## Benefits

1. **Enhanced Security**: Restricts access to documents based on ownership and role
2. **Better UX**: Clear access denied message for unauthorized users
3. **Consistency**: Aligns with existing database RLS policies
4. **Defense in Depth**: Combines frontend and backend security
5. **Maintainability**: Uses existing `RoleBasedAccess` component for consistency
6. **Testability**: Comprehensive test coverage ensures reliability

## Related Issues

This PR refactors PR #236: "Refactor document view page for role-based author visibility"
This PR follows the same pattern as PR #222: "Add admin role check for document listing"

## Migration Notes

No database migrations needed - the `generated_by` field already exists in the `ai_generated_documents` table.

Users who previously had access to documents they didn't own will now see an access denied message unless they have admin or hr_manager roles.
