-- ===========================================
-- PATCH: Fix RLS Issues and Security Definer View
-- ===========================================

-- 1. Add RLS policies to email_queue table (uses to_email for access control)
CREATE POLICY "email_queue_authenticated_access" 
ON public.email_queue 
FOR SELECT 
TO authenticated
USING (
  to_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  OR public.is_admin()
);

CREATE POLICY "email_queue_insert_admin" 
ON public.email_queue 
FOR INSERT 
TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "email_queue_update_admin" 
ON public.email_queue 
FOR UPDATE 
TO authenticated
USING (public.is_admin());

-- 2. Add RLS policies to scheduled_notifications table (uses user_id)
CREATE POLICY "scheduled_notifications_user_access" 
ON public.scheduled_notifications 
FOR SELECT 
TO authenticated
USING (
  user_id = auth.uid()
  OR public.is_admin()
);

CREATE POLICY "scheduled_notifications_insert" 
ON public.scheduled_notifications 
FOR INSERT 
TO authenticated
WITH CHECK (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "scheduled_notifications_update" 
ON public.scheduled_notifications 
FOR UPDATE 
TO authenticated
USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "scheduled_notifications_delete" 
ON public.scheduled_notifications 
FOR DELETE 
TO authenticated
USING (user_id = auth.uid() OR public.is_admin());

-- 3. Drop the security definer view and recreate as normal view
DROP VIEW IF EXISTS public.security_metrics;

CREATE VIEW public.security_metrics AS
SELECT 
  (SELECT count(*) FROM access_logs 
   WHERE action = 'login_failed' AND timestamp > (now() - interval '24 hours')) AS failed_logins_24h,
  (SELECT count(*) FROM access_logs 
   WHERE action = 'login_success' AND timestamp > (now() - interval '24 hours')) AS successful_logins_24h,
  (SELECT count(*) FROM blocked_entities 
   WHERE expires_at > now()) AS active_blocks,
  (SELECT count(*) FROM active_sessions 
   WHERE is_active = true) AS active_sessions,
  (SELECT count(*) FROM access_logs 
   WHERE severity = 'critical' AND timestamp > (now() - interval '24 hours')) AS critical_events_24h,
  (SELECT count(*) FROM security_audit_chain 
   WHERE timestamp > (now() - interval '24 hours')) AS audit_entries_24h;

-- Grant access to authenticated users  
GRANT SELECT ON public.security_metrics TO authenticated;