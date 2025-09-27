-- Fix RLS infinite recursion by simplifying policies and removing circular dependencies

-- Drop problematic policies that cause recursion
DROP POLICY IF EXISTS "org_users_select_own_or_admin" ON organization_users;
DROP POLICY IF EXISTS "org_users_insert_self_or_admin" ON organization_users;
DROP POLICY IF EXISTS "org_users_update_admin_only" ON organization_users;
DROP POLICY IF EXISTS "org_users_delete_admin_only" ON organization_users;
DROP POLICY IF EXISTS "Users can view organization members" ON organization_users;
DROP POLICY IF EXISTS "Admins can manage tenant users" ON tenant_users;

-- Drop duplicate policies on organization_users
DROP POLICY IF EXISTS "Users can insert organization membership" ON organization_users;
DROP POLICY IF EXISTS "Users can view their organization membership" ON organization_users;
DROP POLICY IF EXISTS "Users can view their organization memberships" ON organization_users;
DROP POLICY IF EXISTS "Users can view their own organization membership" ON organization_users;
DROP POLICY IF EXISTS "Users can view their own organization memberships" ON organization_users;

-- Create simplified, non-recursive policies for organization_users
CREATE POLICY "Users can view their own organization data"
  ON organization_users
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own organization membership"
  ON organization_users
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own organization data"
  ON organization_users
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Organization owners can manage all users"
  ON organization_users
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM organization_users AS owners
      WHERE owners.organization_id = organization_users.organization_id
      AND owners.user_id = auth.uid()
      AND owners.role = 'owner'
      AND owners.status = 'active'
    )
  );

-- Create simplified policies for tenant_users  
CREATE POLICY "Users can view their own tenant data"
  ON tenant_users
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Tenant owners and admins can manage users"
  ON tenant_users
  FOR ALL
  USING (
    tenant_id IN (
      SELECT t.tenant_id FROM tenant_users t
      WHERE t.user_id = auth.uid()
      AND t.role IN ('owner', 'admin')
      AND t.status = 'active'
    )
  );

-- Drop the get_user_role function if it exists to prevent recursion
DROP FUNCTION IF EXISTS get_user_role();

-- Create optimized indexes for better performance
CREATE INDEX IF NOT EXISTS idx_organization_users_org_user ON organization_users(organization_id, user_id);
CREATE INDEX IF NOT EXISTS idx_organization_users_role_status ON organization_users(role, status);
CREATE INDEX IF NOT EXISTS idx_tenant_users_tenant_user ON tenant_users(tenant_id, user_id);
CREATE INDEX IF NOT EXISTS idx_tenant_users_role_status ON tenant_users(role, status);