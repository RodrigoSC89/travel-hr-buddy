-- PATCH SECURITY: Corrigir SECURITY DEFINER view e RLS policies permissivas

-- 1. Recriar security_metrics como view normal (sem SECURITY DEFINER)
DROP VIEW IF EXISTS public.security_metrics;

CREATE VIEW public.security_metrics AS
SELECT 
    (SELECT count(*) FROM access_logs WHERE action = 'login_failed' AND timestamp > (now() - interval '24 hours')) AS failed_logins_24h,
    (SELECT count(*) FROM access_logs WHERE action = 'login_success' AND timestamp > (now() - interval '24 hours')) AS successful_logins_24h,
    (SELECT count(*) FROM blocked_entities WHERE expires_at > now()) AS active_blocks,
    (SELECT count(*) FROM active_sessions WHERE is_active = true) AS active_sessions,
    (SELECT count(*) FROM access_logs WHERE severity = 'critical' AND timestamp > (now() - interval '24 hours')) AS critical_events_24h,
    (SELECT count(*) FROM security_audit_chain WHERE timestamp > (now() - interval '24 hours')) AS audit_entries_24h;

-- 2. Corrigir policies WITH CHECK(true) para usar verificação de autenticação

-- simulation_event_log - exigir autenticação
DROP POLICY IF EXISTS "Users can insert simulation events" ON public.simulation_event_log;
CREATE POLICY "Authenticated users can insert simulation events" 
ON public.simulation_event_log FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- simulation_decision_log - exigir autenticação
DROP POLICY IF EXISTS "Users can insert simulation decisions" ON public.simulation_decision_log;
CREATE POLICY "Authenticated users can insert simulation decisions" 
ON public.simulation_decision_log FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- user_notifications - exigir autenticação do sistema ou usuário
DROP POLICY IF EXISTS "System can insert notifications" ON public.user_notifications;
CREATE POLICY "Authenticated can insert notifications" 
ON public.user_notifications FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);