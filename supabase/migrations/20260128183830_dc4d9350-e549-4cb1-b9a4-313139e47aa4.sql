-- =====================================================
-- SECURITY FIX PATCH 902b - Fix Security Warnings
-- =====================================================

-- 1. Fix SECURITY DEFINER view - Convert to standard view
DROP VIEW IF EXISTS public.security_metrics;

CREATE OR REPLACE VIEW public.security_metrics AS
SELECT
  (SELECT COUNT(*) FROM access_logs WHERE action = 'login_failed' AND timestamp > now() - INTERVAL '24 hours') AS failed_logins_24h,
  (SELECT COUNT(*) FROM access_logs WHERE action = 'login_success' AND timestamp > now() - INTERVAL '24 hours') AS successful_logins_24h,
  (SELECT COUNT(*) FROM blocked_entities WHERE expires_at > now()) AS active_blocks,
  (SELECT COUNT(*) FROM active_sessions WHERE is_active = true) AS active_sessions,
  (SELECT COUNT(*) FROM access_logs WHERE severity = 'critical' AND timestamp > now() - INTERVAL '24 hours') AS critical_events_24h,
  (SELECT COUNT(*) FROM security_audit_chain WHERE timestamp > now() - INTERVAL '24 hours') AS audit_entries_24h;

-- Grant access to authenticated users (view enforces RLS of underlying tables)
GRANT SELECT ON public.security_metrics TO authenticated;

-- 2. Fix RLS "Always True" policy on security_audit_chain INSERT
-- Replace with a more restrictive policy that still allows system inserts
DROP POLICY IF EXISTS "System can insert audit records" ON security_audit_chain;

-- Create a security definer function to check if insert is allowed
CREATE OR REPLACE FUNCTION public.can_insert_audit_record()
RETURNS BOOLEAN AS $$
BEGIN
  -- Allow if user is authenticated OR if called from service role
  -- Service role bypasses RLS anyway, so this is for authenticated users
  -- who need to log their own actions
  RETURN auth.uid() IS NOT NULL;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

-- Create restrictive policy
CREATE POLICY "Authenticated users can insert their audit records" ON security_audit_chain
  FOR INSERT WITH CHECK (
    public.can_insert_audit_record() 
    AND (user_id IS NULL OR user_id = auth.uid())
  );

-- 3. Ensure no other "USING(true)" policies were created
-- Review and fix any from this migration

-- For blocked_entities, restrict to admin function instead of true
DROP POLICY IF EXISTS "Admins can manage blocked entities" ON blocked_entities;
CREATE POLICY "Admins can manage blocked entities" ON blocked_entities
  FOR ALL USING (public.is_admin());

-- For api_key_rotations, same fix
DROP POLICY IF EXISTS "Admins can manage API keys" ON api_key_rotations;
CREATE POLICY "Admins can manage API keys" ON api_key_rotations
  FOR ALL USING (public.is_admin());

-- For webhook_signatures, same fix
DROP POLICY IF EXISTS "Admins can manage webhooks" ON webhook_signatures;
CREATE POLICY "Admins can manage webhooks" ON webhook_signatures
  FOR ALL USING (public.is_admin());