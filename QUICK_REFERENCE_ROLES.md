# Quick Reference: Profiles Role System

## For Database Administrators

### Make a user an admin
```sql
UPDATE profiles SET role = 'admin' WHERE email = 'admin@company.com';
```

### List all admins
```sql
SELECT id, email, full_name, role FROM profiles WHERE role = 'admin';
```

### List all regular users
```sql
SELECT id, email, full_name, role FROM profiles WHERE role = 'user';
```

### Check a specific user's role
```sql
SELECT email, role FROM profiles WHERE email = 'user@example.com';
```

## For Frontend Developers

### Check if current user is admin
```typescript
import { useAuthProfile } from "@/hooks/use-auth-profile";

function MyComponent() {
  const { profile, isLoading } = useAuthProfile();
  
  if (isLoading) return <div>Loading...</div>;
  
  const isAdmin = profile?.role === 'admin';
  
  if (isAdmin) {
    return <div>Admin content</div>;
  }
  
  return <div>Regular user content</div>;
}
```

### Conditional rendering based on role
```typescript
{profile?.role === 'admin' && (
  <AdminPanel />
)}

{profile?.role === 'user' && (
  <UserDashboard />
)}
```

### Get role display name
```typescript
const getRoleLabel = (role: string) => {
  return role === 'admin' ? 'Administrador' : 'Usuário';
};
```

## For Backend/API Developers

### Check role in Supabase RLS policies
```sql
-- Example: Allow only admins to delete records
CREATE POLICY "Only admins can delete"
ON public.some_table
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

### Check role in PostgreSQL functions
```sql
CREATE OR REPLACE FUNCTION is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role = 'admin'
  );
$$;
```

## Common Scenarios

### Scenario 1: New user signs up
- Automatically gets `role = 'user'`
- Can view/edit their own profile
- Cannot view other users' profiles
- Cannot edit other users' profiles

### Scenario 2: Admin needs to be created
```sql
-- After user registers normally
UPDATE profiles SET role = 'admin' WHERE email = 'admin@company.com';
```

### Scenario 3: Admin views all users
- Admin can SELECT all rows in profiles table
- Uses "Admins can view all profiles by role" RLS policy
- Policy checks: `profiles.role = 'admin'` for current user

### Scenario 4: Admin updates any user
- Admin can UPDATE any row in profiles table
- Uses "Admins can update all profiles" RLS policy
- Policy checks: `profiles.role = 'admin'` for current user

### Scenario 5: Admin demoted to user
```sql
UPDATE profiles SET role = 'user' WHERE email = 'former-admin@company.com';
```

## Security Notes

✅ **Role is protected by CHECK constraint** - Only 'user' or 'admin' allowed
✅ **RLS is enabled** - Database-level access control
✅ **Users cannot promote themselves** - Only direct SQL can change roles
✅ **Admins verified by RLS policies** - Checked on every query

## Troubleshooting

### User can't see other profiles
- Check if user has `role = 'admin'` in database
- Verify RLS policies are enabled
- Check Supabase logs for policy failures

### Admin promotion not working
```sql
-- Verify role was actually updated
SELECT email, role FROM profiles WHERE email = 'admin@company.com';

-- Should show 'admin', not 'user'
```

### TypeScript type errors
- Ensure `role` field is included in Profile interface
- Type should be `"user" | "admin"` or `string | null`
- Check import statements are correct

## Migration Rollback (if needed)

```sql
-- Remove the role column (not recommended)
ALTER TABLE public.profiles DROP COLUMN IF EXISTS role;

-- Remove new policies
DROP POLICY IF EXISTS "Admins can view all profiles by role" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Restore old handle_new_user function (see previous migration)
```

## Additional Resources

- Full implementation: `PROFILES_ROLE_IMPLEMENTATION.md`
- Verification checklist: `VERIFICATION_CHECKLIST.md`
- Visual changes: `VISUAL_CHANGES.md`
- PR summary: `PR_SUMMARY_PROFILES_ROLE.md`
- Migration file: `supabase/migrations/20251011042700_add_role_to_profiles.sql`
