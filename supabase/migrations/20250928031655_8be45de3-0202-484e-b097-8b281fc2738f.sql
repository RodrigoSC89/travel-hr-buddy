-- Fix infinite recursion issues safely by dropping and recreating problematic policies

-- 1. Drop problematic policies first
DROP POLICY IF EXISTS "tenant_users_select_policy" ON public.tenant_users;
DROP POLICY IF EXISTS "organization_users_select_policy" ON public.organization_users;

-- 2. Create security definer function to check admin role (avoiding recursion)
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'admin'
  )
$$;

-- 3. Create safe policies for tenant_users
CREATE POLICY "Users can view their own tenant memberships" 
ON public.tenant_users 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all tenant memberships" 
ON public.tenant_users 
FOR SELECT 
USING (public.is_admin(auth.uid()));

-- 4. Create safe policies for organization_users  
CREATE POLICY "Users can view their own organization memberships" 
ON public.organization_users 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all organization memberships" 
ON public.organization_users 
FOR SELECT 
USING (public.is_admin(auth.uid()));

-- 5. Add missing RLS policies for role_permissions table
CREATE POLICY "Anyone can read role permissions" 
ON public.role_permissions 
FOR SELECT 
USING (true);

-- 6. Fix search_path issues in existing functions
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public;