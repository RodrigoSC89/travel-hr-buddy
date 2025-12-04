-- Fix active_sessions: Remove overly permissive system policy
DROP POLICY IF EXISTS "System can manage sessions" ON public.active_sessions;

-- Create a more restrictive policy for session management
CREATE POLICY "Service role can manage sessions"
ON public.active_sessions
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Fix access_logs: Make insert policy more restrictive
DROP POLICY IF EXISTS "System can insert access logs" ON public.access_logs;

-- Allow authenticated users to insert their own access logs
CREATE POLICY "Users can insert own access logs"
ON public.access_logs
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Allow service role for system logs
CREATE POLICY "Service role can insert access logs"
ON public.access_logs
FOR INSERT
TO service_role
WITH CHECK (true);

-- Fix audit_logs: Add policies to prevent unauthorized modifications
DROP POLICY IF EXISTS "Anyone can insert audit logs" ON public.audit_logs;

-- Only allow inserts through service role or by authenticated users for their own actions
CREATE POLICY "Authenticated users can insert audit logs"
ON public.audit_logs
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can insert audit logs"
ON public.audit_logs
FOR INSERT
TO service_role
WITH CHECK (true);

-- Prevent any updates or deletes to audit logs (immutable audit trail)
DROP POLICY IF EXISTS "No updates to audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "No deletes to audit logs" ON public.audit_logs;

CREATE POLICY "No updates to audit logs"
ON public.audit_logs
FOR UPDATE
TO authenticated
USING (false);

CREATE POLICY "No deletes to audit logs"
ON public.audit_logs
FOR DELETE
TO authenticated
USING (false);