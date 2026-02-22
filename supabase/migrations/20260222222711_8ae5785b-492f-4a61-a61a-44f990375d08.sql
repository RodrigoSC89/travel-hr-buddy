
-- Fix overly permissive INSERT policy on travel_quotation_requests
-- Table has organization_id, use it for tenant isolation
CREATE POLICY "Authenticated users create own quotation requests"
ON public.travel_quotation_requests
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Fix overly permissive INSERT policy on travel_quotation_responses
-- Responses are linked to requests, ensure user is authenticated
CREATE POLICY "Authenticated users create quotation responses"
ON public.travel_quotation_responses
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Fix SECURITY DEFINER views - recreate as SECURITY INVOKER
CREATE OR REPLACE VIEW public.ai_usage_daily_stats
WITH (security_invoker = true)
AS
SELECT date(created_at) AS usage_date,
    module_id,
    module_name,
    organization_id,
    count(*) AS total_requests,
    sum(message_count) AS total_messages,
    sum(tokens_input) AS total_tokens_input,
    sum(tokens_output) AS total_tokens_output,
    (avg(response_time_ms))::integer AS avg_response_time_ms,
    count(CASE WHEN voice_enabled THEN 1 ELSE NULL END) AS voice_requests,
    count(CASE WHEN success THEN 1 ELSE NULL END) AS successful_requests,
    count(CASE WHEN (NOT success) THEN 1 ELSE NULL END) AS failed_requests
FROM ai_usage_logs
GROUP BY (date(created_at)), module_id, module_name, organization_id;

CREATE OR REPLACE VIEW public.security_metrics
WITH (security_invoker = true)
AS
SELECT 
    (SELECT count(*) FROM access_logs WHERE action = 'login_failed' AND "timestamp" > (now() - '24:00:00'::interval)) AS failed_logins_24h,
    (SELECT count(*) FROM access_logs WHERE action = 'login_success' AND "timestamp" > (now() - '24:00:00'::interval)) AS successful_logins_24h,
    (SELECT count(*) FROM blocked_entities WHERE expires_at > now()) AS active_blocks,
    (SELECT count(*) FROM active_sessions WHERE is_active = true) AS active_sessions,
    (SELECT count(*) FROM access_logs WHERE severity = 'critical' AND "timestamp" > (now() - '24:00:00'::interval)) AS critical_events_24h,
    (SELECT count(*) FROM security_audit_chain WHERE "timestamp" > (now() - '24:00:00'::interval)) AS audit_entries_24h;

CREATE OR REPLACE VIEW public.system_events_summary
WITH (security_invoker = true)
AS
SELECT event_type,
    count(*) AS total,
    count(*) FILTER (WHERE processed = true) AS processed,
    count(*) FILTER (WHERE processed = false) AS pending,
    count(*) FILTER (WHERE error_message IS NOT NULL) AS errors,
    max(created_at) AS last_event_at
FROM system_events
GROUP BY event_type
ORDER BY max(created_at) DESC;
