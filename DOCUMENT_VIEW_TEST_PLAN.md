# Document View Feature - Test Plan

## Overview
This test plan covers the new document view feature with version history and real-time comments.

## Test Environment Setup
1. Ensure Supabase instance is running
2. Run the database migration: `20251011044200_create_document_versions_and_comments.sql`
3. Create test users:
   - Admin user (with role 'admin' in user_roles table)
   - Regular user 1 (document owner)
   - Regular user 2 (non-owner)

## Test Cases

### TC1: Document View - Basic Loading
**Preconditions**: Valid document exists in `ai_generated_documents`
**Steps**:
1. Navigate to `/admin/documents/view/[valid-document-id]`
2. Verify loading spinner appears initially
3. Verify document loads successfully

**Expected Results**:
- ✅ Loading spinner shows "Carregando documento..."
- ✅ Document title appears with 📄 emoji
- ✅ Creation date is formatted as "dd/MM/yyyy HH:mm"
- ✅ Document content is displayed in a card
- ✅ Comments section appears at the bottom

### TC2: Document View - Invalid Document
**Preconditions**: None
**Steps**:
1. Navigate to `/admin/documents/view/invalid-uuid`

**Expected Results**:
- ✅ Error toast appears: "Não foi possível carregar o documento"
- ✅ Error message displays: "Documento não encontrado"

### TC3: Edit Permission - Document Owner
**Preconditions**: User is logged in as document owner
**Steps**:
1. Navigate to own document
2. Check for "Editar Documento" button

**Expected Results**:
- ✅ "✏️ Editar Documento" button is visible
- ✅ Button is enabled

### TC4: Edit Permission - Admin User
**Preconditions**: User is logged in as admin (not document owner)
**Steps**:
1. Navigate to any document
2. Check for "Editar Documento" button
3. Verify author email is displayed

**Expected Results**:
- ✅ "✏️ Editar Documento" button is visible
- ✅ Button is enabled
- ✅ "Autor: [email]" text is displayed

### TC5: Edit Permission - Other User
**Preconditions**: User is logged in but is not owner or admin
**Steps**:
1. Navigate to another user's document
2. Check for "Editar Documento" button

**Expected Results**:
- ✅ "Editar Documento" button is NOT visible
- ✅ Document content is read-only

### TC6: Document Editing - Enter Edit Mode
**Preconditions**: User has edit permission
**Steps**:
1. Navigate to document
2. Click "Editar Documento" button

**Expected Results**:
- ✅ Content changes to textarea with 12 rows
- ✅ Textarea contains current document content
- ✅ "Salvar Alterações" button appears with save icon
- ✅ "Editar Documento" button is hidden

### TC7: Document Editing - Save Changes
**Preconditions**: User is in edit mode
**Steps**:
1. Modify content in textarea
2. Click "Salvar Alterações"
3. Check database tables

**Expected Results**:
- ✅ New entry created in `document_versions` with old content
- ✅ Document content updated in `ai_generated_documents`
- ✅ Edit mode closes, showing new content
- ✅ Success toast: "Documento atualizado com sucesso"

### TC8: Version History - Data Integrity
**Preconditions**: Document has been edited at least once
**Steps**:
1. Query `document_versions` table for the document
2. Verify version data

**Expected Results**:
- ✅ Version record exists with correct `document_id`
- ✅ `content` field contains the previous version
- ✅ `updated_by` field contains the user ID who made the change
- ✅ `created_at` timestamp is accurate

### TC9: Comments - View Existing Comments
**Preconditions**: Document has existing comments
**Steps**:
1. Navigate to document
2. Scroll to comments section

**Expected Results**:
- ✅ All comments are displayed
- ✅ Comments are ordered by creation time (oldest first)
- ✅ Each comment shows content and timestamp
- ✅ Timestamps formatted as "dd/MM/yyyy HH:mm"

### TC10: Comments - Add New Comment
**Preconditions**: User is logged in
**Steps**:
1. Navigate to document
2. Type comment in textarea
3. Click "Enviar" button

**Expected Results**:
- ✅ Comment saved to `document_comments` table
- ✅ Comment appears in list immediately
- ✅ Textarea is cleared
- ✅ Success toast: "Comentário enviado"

### TC11: Comments - Real-Time Updates
**Preconditions**: Two users viewing same document in different browsers/sessions
**Steps**:
1. User A adds a comment
2. Observe User B's screen (without refresh)

**Expected Results**:
- ✅ User B sees the new comment appear automatically
- ✅ No page refresh required
- ✅ Comment appears in correct chronological order

### TC12: Comments - Empty Comment Prevention
**Preconditions**: User is on document page
**Steps**:
1. Leave comment textarea empty
2. Click "Enviar" button

**Expected Results**:
- ✅ Nothing happens (function returns early)
- ✅ No comment is saved to database
- ✅ No error message appears

### TC13: Error Handling - Version Save Failure
**Preconditions**: Simulate database error (disconnect Supabase)
**Steps**:
1. Enter edit mode
2. Make changes
3. Click "Salvar Alterações"

**Expected Results**:
- ✅ Error toast: "Não foi possível salvar o histórico de versões"
- ✅ Document update is NOT performed
- ✅ User remains in edit mode
- ✅ Changes are not lost

### TC14: Error Handling - Comment Save Failure
**Preconditions**: Simulate database error
**Steps**:
1. Type a comment
2. Click "Enviar"

**Expected Results**:
- ✅ Error toast: "Não foi possível enviar o comentário"
- ✅ Comment text is NOT cleared
- ✅ User can try again

### TC15: Real-Time Subscription - Connection Management
**Preconditions**: Document page is loaded
**Steps**:
1. Open browser developer tools, network tab
2. Navigate to document
3. Observe real-time connection
4. Navigate away from document

**Expected Results**:
- ✅ Real-time subscription is created on page load
- ✅ Channel name: `document-comments-[document-id]`
- ✅ Subscription is cleaned up when leaving page
- ✅ No memory leaks

### TC16: RLS Policies - Document Access
**Preconditions**: Multiple users and documents
**Steps**:
1. User A creates document
2. User B (not admin) tries to access User A's document

**Expected Results**:
- ✅ User B cannot see User A's document (RLS blocks it)
- ✅ "Documento não encontrado" message appears

### TC17: RLS Policies - Version Access
**Preconditions**: Document with versions
**Steps**:
1. Query `document_versions` as non-owner, non-admin

**Expected Results**:
- ✅ RLS blocks access to other users' document versions
- ✅ User can only see versions of their own documents

### TC18: RLS Policies - Comment Access
**Preconditions**: Document with comments
**Steps**:
1. User B tries to view comments on User A's document

**Expected Results**:
- ✅ RLS blocks access based on document ownership
- ✅ Comments only visible to document owner or admin

### TC19: UI Responsiveness - Mobile View
**Preconditions**: Access on mobile device or resize browser
**Steps**:
1. Navigate to document on mobile
2. Test all features

**Expected Results**:
- ✅ Layout is responsive
- ✅ Textarea resizes appropriately
- ✅ Buttons are touch-friendly
- ✅ Comments section is readable

### TC20: Performance - Large Documents
**Preconditions**: Document with 10,000+ characters
**Steps**:
1. Load large document
2. Enter edit mode
3. Save changes

**Expected Results**:
- ✅ Page loads in < 2 seconds
- ✅ Textarea handles large content
- ✅ Save operation completes in < 3 seconds
- ✅ No browser freezing

## Database Verification Queries

### Check Version History
```sql
SELECT * FROM document_versions 
WHERE document_id = '[document-uuid]' 
ORDER BY created_at DESC;
```

### Check Comments
```sql
SELECT * FROM document_comments 
WHERE document_id = '[document-uuid]' 
ORDER BY created_at ASC;
```

### Verify RLS Policies
```sql
-- As regular user
SELECT * FROM document_versions LIMIT 5;
-- Should only return versions of user's own documents

SELECT * FROM document_comments LIMIT 5;
-- Should only return comments on accessible documents
```

## Acceptance Criteria
- ✅ All test cases pass
- ✅ No console errors
- ✅ No memory leaks
- ✅ RLS policies enforced correctly
- ✅ Real-time updates work reliably
- ✅ Version history saves correctly
- ✅ UI is responsive and intuitive
- ✅ Error handling is graceful

## Notes for Manual Testing
1. Use separate browser windows/incognito mode for testing multiple users
2. Monitor browser console for errors
3. Use Supabase dashboard to verify database changes
4. Test on different browsers (Chrome, Firefox, Safari)
5. Test on mobile devices
6. Verify all toast notifications appear correctly

## Regression Testing
After implementation, verify:
- [ ] Existing document listing still works
- [ ] Document creation still works
- [ ] Other admin features unaffected
- [ ] No breaking changes to existing code
