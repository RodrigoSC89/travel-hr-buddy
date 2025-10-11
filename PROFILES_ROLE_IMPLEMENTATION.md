# Profiles Role System - Implementation Summary

## Overview
This implementation adds a simple `role` column to the `profiles` table for basic admin/user access control, as requested in the problem statement.

## Database Changes

### 1. Added `role` column to `profiles` table
```sql
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin'));
```

**Properties:**
- Default value: `'user'`
- Possible values: `'user'` or `'admin'`
- Constraint enforces only these two values

### 2. Updated `handle_new_user()` trigger function
The trigger automatically creates a profile with `role = 'user'` when a new user registers:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), 'user');
  
  -- Still maintains user_roles for complex permissions
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'employee')
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 3. RLS Policies for Admins
Two new policies enable admins to manage all profiles:

**View all profiles:**
```sql
CREATE POLICY "Admins can view all profiles by role"
ON public.profiles FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.profiles p 
  WHERE p.id = auth.uid() AND p.role = 'admin'
));
```

**Update all profiles:**
```sql
CREATE POLICY "Admins can update all profiles"
ON public.profiles FOR UPDATE TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.profiles p 
  WHERE p.id = auth.uid() AND p.role = 'admin'
));
```

## Frontend Changes

### Updated TypeScript Interfaces

**`use-profile.ts`:**
```typescript
interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  department: string | null;
  position: string | null;
  phone: string | null;
  role: string | null;  // ✅ Added
}
```

**`use-auth-profile.ts`:**
```typescript
interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  department: string | null;
  position: string | null;
  phone: string | null;
  role: "user" | "admin";  // ✅ Updated from complex roles
  preferences: {
    theme: "light" | "dark" | "system";
    notifications: boolean;
    language: "pt" | "en" | "es";
  };
}
```

## How to Use

### Making a User an Admin

After registering, you can manually promote a user to admin using SQL:

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'voce@empresa.com';
```

### In Your Code

**Check if user is admin:**
```typescript
import { useAuthProfile } from "@/hooks/use-auth-profile";

const { profile } = useAuthProfile();

if (profile?.role === 'admin') {
  // Admin-only functionality
}
```

**Fetch profile with role:**
```typescript
import { useProfile } from "@/hooks/use-profile";

const { profile, isLoading } = useProfile();

console.log(profile?.role); // 'user' or 'admin'
```

## Backward Compatibility

This implementation **maintains** the existing `user_roles` table system for more complex permissions (e.g., `hr_manager`, `department_manager`, `employee`). The simple `role` column in `profiles` is meant for basic admin/user distinction, while `user_roles` continues to handle fine-grained permissions.

## Security Notes

1. RLS is enabled on the `profiles` table
2. Users can view their own profile
3. Users can update their own profile
4. Admins can view ALL profiles
5. Admins can update ALL profiles
6. The role column has a CHECK constraint to prevent invalid values

## Migration File

Location: `supabase/migrations/20251011042700_add_role_to_profiles.sql`

The migration is **idempotent** - it can be run multiple times safely:
- Uses `ADD COLUMN IF NOT EXISTS`
- Uses `CREATE OR REPLACE FUNCTION`
- Uses `DROP POLICY IF EXISTS` before creating policies
