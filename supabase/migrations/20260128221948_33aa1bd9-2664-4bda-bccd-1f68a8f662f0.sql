-- Corrigir views para usar SECURITY INVOKER (padrão do Postgres 15+)

-- Recriar security_metrics com SECURITY INVOKER explícito
DROP VIEW IF EXISTS public.security_metrics;
CREATE VIEW public.security_metrics 
WITH (security_invoker = true) AS
SELECT 
    (SELECT count(*) FROM access_logs WHERE action = 'login_failed' AND timestamp > (now() - interval '24 hours')) AS failed_logins_24h,
    (SELECT count(*) FROM access_logs WHERE action = 'login_success' AND timestamp > (now() - interval '24 hours')) AS successful_logins_24h,
    (SELECT count(*) FROM blocked_entities WHERE expires_at > now()) AS active_blocks,
    (SELECT count(*) FROM active_sessions WHERE is_active = true) AS active_sessions,
    (SELECT count(*) FROM access_logs WHERE severity = 'critical' AND timestamp > (now() - interval '24 hours')) AS critical_events_24h,
    (SELECT count(*) FROM security_audit_chain WHERE timestamp > (now() - interval '24 hours')) AS audit_entries_24h;

-- Recriar ai_usage_daily_stats com SECURITY INVOKER explícito
DROP VIEW IF EXISTS public.ai_usage_daily_stats;
CREATE VIEW public.ai_usage_daily_stats 
WITH (security_invoker = true) AS
SELECT 
    date(created_at) AS usage_date,
    module_id,
    module_name,
    organization_id,
    count(*) AS total_requests,
    sum(message_count) AS total_messages,
    sum(tokens_input) AS total_tokens_input,
    sum(tokens_output) AS total_tokens_output,
    avg(response_time_ms)::integer AS avg_response_time_ms,
    count(CASE WHEN voice_enabled THEN 1 ELSE NULL END) AS voice_requests,
    count(CASE WHEN success THEN 1 ELSE NULL END) AS successful_requests,
    count(CASE WHEN NOT success THEN 1 ELSE NULL END) AS failed_requests
FROM ai_usage_logs
GROUP BY date(created_at), module_id, module_name, organization_id;

-- Grant permissions
GRANT SELECT ON public.ai_usage_daily_stats TO authenticated;
GRANT SELECT ON public.security_metrics TO authenticated;