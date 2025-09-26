-- Fix infinite recursion in organization_users policies
DROP POLICY IF EXISTS "Users can view organization users" ON public.organization_users;
DROP POLICY IF EXISTS "Admins can manage organization users" ON public.organization_users;
DROP POLICY IF EXISTS "Users can update their own membership" ON public.organization_users;

-- Create safe RLS policies that don't cause recursion
CREATE POLICY "Users can view their own organization membership" 
ON public.organization_users 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Organization owners can manage users" 
ON public.organization_users 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.organization_users ou
    WHERE ou.organization_id = organization_users.organization_id 
    AND ou.user_id = auth.uid() 
    AND ou.role = 'owner'
    AND ou.status = 'active'
  )
);

-- Drop existing profile policies if they exist
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Create new profile policies
CREATE POLICY "Users can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);