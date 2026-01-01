-- Create ai_usage_logs table for persisting AI analytics
CREATE TABLE public.ai_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  user_id UUID,
  module_id TEXT NOT NULL,
  module_name TEXT NOT NULL,
  session_id TEXT,
  message_count INTEGER DEFAULT 1,
  tokens_input INTEGER DEFAULT 0,
  tokens_output INTEGER DEFAULT 0,
  response_time_ms INTEGER,
  voice_enabled BOOLEAN DEFAULT false,
  voice_duration_seconds INTEGER DEFAULT 0,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_usage_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their organization's AI usage logs"
ON public.ai_usage_logs
FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM organization_users WHERE user_id = auth.uid()
  )
  OR user_id = auth.uid()
);

CREATE POLICY "Users can insert their own AI usage logs"
ON public.ai_usage_logs
FOR INSERT
WITH CHECK (auth.uid() = user_id OR auth.uid() IS NOT NULL);

-- Create indexes for performance
CREATE INDEX idx_ai_usage_logs_org_date ON public.ai_usage_logs(organization_id, created_at DESC);
CREATE INDEX idx_ai_usage_logs_module ON public.ai_usage_logs(module_id, created_at DESC);
CREATE INDEX idx_ai_usage_logs_user ON public.ai_usage_logs(user_id, created_at DESC);

-- Create aggregated view for daily stats
CREATE OR REPLACE VIEW ai_usage_daily_stats AS
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