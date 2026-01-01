-- Fix security definer view issue - recreate view with SECURITY INVOKER
DROP VIEW IF EXISTS ai_usage_daily_stats;

CREATE VIEW ai_usage_daily_stats WITH (security_invoker = true) AS
SELECT 
  DATE(created_at) as usage_date,
  module_id,
  module_name,
  organization_id,
  COUNT(*) as total_requests,
  SUM(message_count) as total_messages,
  SUM(tokens_input) as total_tokens_input,
  SUM(tokens_output) as total_tokens_output,
  AVG(response_time_ms)::INTEGER as avg_response_time_ms,
  COUNT(CASE WHEN voice_enabled THEN 1 END) as voice_requests,
  COUNT(CASE WHEN success THEN 1 END) as successful_requests,
  COUNT(CASE WHEN NOT success THEN 1 END) as failed_requests
FROM public.ai_usage_logs
GROUP BY DATE(created_at), module_id, module_name, organization_id;