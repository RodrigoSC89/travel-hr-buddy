-- Fix infinite recursion in organization_users RLS policies
-- Drop existing problematic policies first
DROP POLICY IF EXISTS "Users can view their organization memberships" ON public.organization_users;
DROP POLICY IF EXISTS "Users can insert their own organization membership" ON public.organization_users;
DROP POLICY IF EXISTS "Users can update their own organization membership" ON public.organization_users;
DROP POLICY IF EXISTS "Organization admins can manage all memberships" ON public.organization_users;

-- Create new, non-recursive policies for organization_users
CREATE POLICY "Users can view their organization memberships" 
ON public.organization_users 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can insert organization membership" 
ON public.organization_users 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their organization membership" 
ON public.organization_users 
FOR UPDATE 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Ensure vessels table has proper RLS policies
DROP POLICY IF EXISTS "Users can view vessels from their organization" ON public.vessels;
CREATE POLICY "Users can view vessels from their organization" 
ON public.vessels 
FOR SELECT 
USING (
  organization_id IN (
    SELECT organization_id FROM public.organization_users 
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

-- Ensure crew_members table has proper RLS policies
DROP POLICY IF EXISTS "Users can view crew from their organization" ON public.crew_members;
CREATE POLICY "Users can view crew from their organization" 
ON public.crew_members 
FOR SELECT 
USING (
  organization_id IN (
    SELECT organization_id FROM public.organization_users 
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

-- Ensure maritime_certificates table has proper RLS policies  
CREATE POLICY "Users can view certificates from their organization" 
ON public.maritime_certificates 
FOR SELECT 
USING (
  crew_member_id IN (
    SELECT id FROM public.crew_members 
    WHERE organization_id IN (
      SELECT organization_id FROM public.organization_users 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  )
);