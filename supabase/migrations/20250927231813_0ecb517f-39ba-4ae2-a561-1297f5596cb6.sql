-- Fix infinite recursion in RLS policies by creating security definer functions

-- Create security definer function to check if user is in organization
CREATE OR REPLACE FUNCTION public.user_in_organization(user_id uuid, org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.organization_users 
    WHERE organization_users.user_id = user_in_organization.user_id 
    AND organization_users.organization_id = user_in_organization.org_id
  );
$$;

-- Create security definer function to check if user is in tenant
CREATE OR REPLACE FUNCTION public.user_in_tenant(user_id uuid, tenant_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.tenant_users 
    WHERE tenant_users.user_id = user_in_tenant.user_id 
    AND tenant_users.tenant_id = user_in_tenant.tenant_id
  );
$$;

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view their organization memberships" ON public.organization_users;
DROP POLICY IF EXISTS "Users can view their tenant memberships" ON public.tenant_users;

-- Create new non-recursive policies for organization_users
CREATE POLICY "Users can view their organization memberships"
ON public.organization_users
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their organization memberships"
ON public.organization_users
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Create new non-recursive policies for tenant_users
CREATE POLICY "Users can view their tenant memberships"
ON public.tenant_users
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their tenant memberships"
ON public.tenant_users
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());