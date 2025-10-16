# Auditorias IMCA - Row Level Security Implementation

## Overview
This document describes the implementation of Row Level Security (RLS) policies for the `auditorias_imca` table.

## Implementation Details

### Migration File
- **File**: `supabase/migrations/20251016154800_create_auditorias_imca_rls.sql`
- **Date**: October 16, 2025

### Table Structure

The `auditorias_imca` table stores IMCA (International Marine Contractors Association) audit records with the following schema:

```sql
CREATE TABLE public.auditorias_imca (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed', 'approved')),
  audit_date DATE,
  score NUMERIC CHECK (score >= 0 AND score <= 100),
  findings JSONB DEFAULT '{}',
  recommendations TEXT[],
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### Row Level Security Policies

#### User Policies
Users can only access their own audit records:

1. **SELECT Policy**: "Usuários veem apenas suas auditorias"
   - Users can only view audits where `user_id = auth.uid()`

2. **INSERT Policy**: "Usuários podem inserir auditorias"
   - Users can only insert audits for themselves (`user_id = auth.uid()`)

3. **UPDATE Policy**: "Usuários podem atualizar auditorias próprias"
   - Users can only update their own audits (`user_id = auth.uid()`)

4. **DELETE Policy**: "Usuários podem deletar auditorias próprias"
   - Users can only delete their own audits (`user_id = auth.uid()`)

#### Admin Policies
Administrators have full access to all audit records:

1. **SELECT Policy**: "Admins podem ver todas auditorias"
   - Admins can view all audits regardless of `user_id`

2. **INSERT Policy**: "Admins podem inserir auditorias"
   - Admins can create audits for any user

3. **UPDATE Policy**: "Admins podem atualizar todas auditorias"
   - Admins can update any audit

4. **DELETE Policy**: "Admins podem deletar todas auditorias"
   - Admins can delete any audit

Admin status is determined by checking `profiles.role = 'admin'`.

### Performance Indexes

The following indexes were created for optimal query performance:

- `idx_auditorias_imca_user_id`: Speeds up queries filtered by user
- `idx_auditorias_imca_created_at`: Optimizes sorting by creation date
- `idx_auditorias_imca_audit_date`: Optimizes sorting by audit date
- `idx_auditorias_imca_status`: Speeds up queries filtered by status

### Automatic Timestamp Updates

A trigger function automatically updates the `updated_at` column whenever a record is modified:

```sql
CREATE TRIGGER update_auditorias_imca_updated_at
  BEFORE UPDATE ON public.auditorias_imca
  FOR EACH ROW
  EXECUTE FUNCTION update_auditorias_imca_updated_at();
```

## Security Features

✅ **Row Level Security Enabled**: Users are isolated from each other's data
✅ **User Isolation**: Regular users can only see/modify their own audits
✅ **Admin Override**: Administrators have full access for management purposes
✅ **Cascade Deletion**: Audits are automatically deleted if the user is deleted
✅ **Data Validation**: Status values are constrained, scores are validated (0-100)

## Usage Examples

### Creating an Audit (User)
```sql
INSERT INTO auditorias_imca (user_id, title, description, status)
VALUES (auth.uid(), 'Q1 2025 Safety Audit', 'Quarterly safety inspection', 'draft');
```

### Viewing Own Audits (User)
```sql
SELECT * FROM auditorias_imca WHERE user_id = auth.uid();
```

### Viewing All Audits (Admin)
```sql
-- This query works for admins, returns all audits
SELECT * FROM auditorias_imca;
```

### Updating an Audit (User)
```sql
UPDATE auditorias_imca 
SET status = 'completed', score = 95
WHERE id = '<audit-id>' AND user_id = auth.uid();
```

### Deleting an Audit (User)
```sql
DELETE FROM auditorias_imca 
WHERE id = '<audit-id>' AND user_id = auth.uid();
```

## Testing Considerations

When testing the RLS policies:

1. **Test as regular user**: Verify you can only see your own audits
2. **Test as admin**: Verify you can see all audits from all users
3. **Test cross-user access**: Verify users cannot access other users' audits
4. **Test CRUD operations**: Verify insert, update, and delete work correctly
5. **Test cascade deletion**: Verify audits are deleted when a user is deleted

## Integration Notes

- This table integrates with the existing `auth.users` system
- Admin privileges are determined by the `profiles.role` column
- The table follows the same patterns as other audit tables in the system (e.g., `peotram_audits`)

## Related Tables

- `auth.users`: Source of user authentication
- `profiles`: Contains user role information (admin/user)
- `dp_incidents`: Related IMCA incident tracking table

## Future Enhancements

Potential future improvements:
- Add organization-level access policies
- Implement audit log tracking for changes
- Add file attachment support for audit evidence
- Implement workflow states with approval process
- Add notification system for audit status changes
