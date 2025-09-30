-- Fix infinite recursion in RLS policies for organization_users and tenant_users

-- Drop problematic recursive policies for organization_users
DROP POLICY IF EXISTS "Organization owners can manage all users" ON organization_users;
DROP POLICY IF EXISTS "Organization owners can manage users" ON organization_users;

-- Drop problematic recursive policies for tenant_users
DROP POLICY IF EXISTS "Tenant owners and admins can manage users" ON tenant_users;
DROP POLICY IF EXISTS "Tenant owners can manage all users" ON tenant_users;

-- Create non-recursive policies for organization_users
-- Users can view their own memberships
CREATE POLICY "Users can view their own memberships" 
ON organization_users 
FOR SELECT 
USING (user_id = auth.uid());

-- Users can update their own memberships
CREATE POLICY "Users can update own memberships" 
ON organization_users 
FOR UPDATE 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Users can insert their own memberships
CREATE POLICY "Users can create own memberships" 
ON organization_users 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Admins can manage all (using function that doesn't query same table)
CREATE POLICY "Admins can manage all organization memberships" 
ON organization_users 
FOR ALL 
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Create non-recursive policies for tenant_users
-- Users can view their own tenant memberships
CREATE POLICY "Users can view own tenant memberships" 
ON tenant_users 
FOR SELECT 
USING (user_id = auth.uid());

-- Users can update their own tenant memberships
CREATE POLICY "Users can update own tenant memberships" 
ON tenant_users 
FOR UPDATE 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Users can insert their own tenant memberships
CREATE POLICY "Users can create own tenant memberships" 
ON tenant_users 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Admins can manage all tenant memberships (using function that doesn't query same table)
CREATE POLICY "Admins can manage all tenant memberships" 
ON tenant_users 
FOR ALL 
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));