-- Recriar views sem SECURITY DEFINER explícito

-- Recriar ai_usage_daily_stats
DROP VIEW IF EXISTS public.ai_usage_daily_stats CASCADE;

CREATE OR REPLACE VIEW public.ai_usage_daily_stats AS
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