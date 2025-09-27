-- Fix infinite recursion in RLS policies for tenant_users and organization_users

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view their tenant data" ON public.tenant_users;
DROP POLICY IF EXISTS "Users can update their tenant data" ON public.tenant_users;
DROP POLICY IF EXISTS "Users can insert their tenant data" ON public.tenant_users;
DROP POLICY IF EXISTS "Users can delete their tenant data" ON public.tenant_users;

DROP POLICY IF EXISTS "Users can view their organization data" ON public.organization_users;
DROP POLICY IF EXISTS "Users can update their organization data" ON public.organization_users;
DROP POLICY IF EXISTS "Users can insert their organization data" ON public.organization_users;
DROP POLICY IF EXISTS "Users can delete their organization data" ON public.organization_users;

-- Create non-recursive policies for tenant_users
CREATE POLICY "Users can view tenant memberships" 
ON public.tenant_users 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can insert tenant memberships" 
ON public.tenant_users 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own tenant membership" 
ON public.tenant_users 
FOR UPDATE 
USING (user_id = auth.uid());

-- Create non-recursive policies for organization_users
CREATE POLICY "Users can view organization memberships" 
ON public.organization_users 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can insert organization memberships" 
ON public.organization_users 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own organization membership" 
ON public.organization_users 
FOR UPDATE 
USING (user_id = auth.uid());