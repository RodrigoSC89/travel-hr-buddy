-- =====================================================
-- PATCH: Harden RLS Policies for vessel_positions
-- Fixes: 2x "RLS Policy Always True" warnings
-- =====================================================

-- Drop existing permissive policies
DROP POLICY IF EXISTS "Allow authenticated insert to vessel_positions" ON vessel_positions;
DROP POLICY IF EXISTS "Allow authenticated update to vessel_positions" ON vessel_positions;

-- Create restrictive INSERT policy
-- Only users in the same organization can insert vessel positions
CREATE POLICY "org_users_can_insert_vessel_positions"
ON vessel_positions
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM vessels v
    JOIN organization_users ou ON v.organization_id = ou.organization_id
    WHERE v.id = vessel_positions.vessel_id
    AND ou.user_id = auth.uid()
    AND ou.status = 'active'
  )
  OR public.is_admin()
);

-- Create restrictive UPDATE policy
-- Only users in the same organization can update vessel positions
CREATE POLICY "org_users_can_update_vessel_positions"
ON vessel_positions
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM vessels v
    JOIN organization_users ou ON v.organization_id = ou.organization_id
    WHERE v.id = vessel_positions.vessel_id
    AND ou.user_id = auth.uid()
    AND ou.status = 'active'
  )
  OR public.is_admin()
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM vessels v
    JOIN organization_users ou ON v.organization_id = ou.organization_id
    WHERE v.id = vessel_positions.vessel_id
    AND ou.user_id = auth.uid()
    AND ou.status = 'active'
  )
  OR public.is_admin()
);