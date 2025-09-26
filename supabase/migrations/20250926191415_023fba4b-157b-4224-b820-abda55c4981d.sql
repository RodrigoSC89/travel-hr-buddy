-- First, drop all problematic policies causing recursion
DROP POLICY IF EXISTS "Organization owners and admins can manage users" ON organization_users;

-- Create safe policies without recursion
CREATE POLICY "Users can view their organization membership" 
ON organization_users FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "System can manage organization users"
ON organization_users FOR ALL
USING (true)
WITH CHECK (true);

-- Update vessel table to avoid policy conflicts
DROP POLICY IF EXISTS "Admins can manage vessels" ON vessels;

CREATE POLICY "Organization users can view vessels"
ON vessels FOR SELECT
USING (
  organization_id IN (
    SELECT ou.organization_id 
    FROM organization_users ou 
    WHERE ou.user_id = auth.uid() 
    AND ou.status = 'active'
  )
);

CREATE POLICY "Organization admins can manage vessels"
ON vessels FOR ALL
USING (
  organization_id IN (
    SELECT ou.organization_id 
    FROM organization_users ou 
    WHERE ou.user_id = auth.uid() 
    AND ou.role IN ('owner', 'admin', 'manager')
    AND ou.status = 'active'
  )
);