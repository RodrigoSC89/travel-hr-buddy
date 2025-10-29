-- PATCH 539: Complete AI Logging System
-- Create ai_logs table for tracking all AI interactions

CREATE TABLE IF NOT EXISTS ai_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id_hash TEXT,
  service TEXT NOT NULL CHECK (service IN ('copilot', 'vault_ai', 'dp_intelligence', 'forecast_engine', 'other')),
  prompt_hash TEXT,
  prompt_length INTEGER,
  response_length INTEGER,
  response_time_ms INTEGER,
  model TEXT,
  tokens_used INTEGER,
  status TEXT NOT NULL CHECK (status IN ('success', 'error', 'timeout')),
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_logs_service ON ai_logs(service);
CREATE INDEX IF NOT EXISTS idx_ai_logs_status ON ai_logs(status);
CREATE INDEX IF NOT EXISTS idx_ai_logs_created_at ON ai_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_logs_user_hash ON ai_logs(user_id_hash);
CREATE INDEX IF NOT EXISTS idx_ai_logs_response_time ON ai_logs(response_time_ms);

-- Enable Row Level Security
ALTER TABLE ai_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow service role to manage ai_logs"
  ON ai_logs FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to insert ai_logs"
  ON ai_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view all ai_logs"
  ON ai_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Create function to get AI metrics
CREATE OR REPLACE FUNCTION get_ai_metrics(
  p_service TEXT DEFAULT NULL,
  p_start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
  p_end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
  service TEXT,
  total_calls BIGINT,
  success_calls BIGINT,
  error_calls BIGINT,
  avg_response_time NUMERIC,
  avg_tokens NUMERIC,
  success_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    al.service,
    COUNT(*)::BIGINT as total_calls,
    COUNT(*) FILTER (WHERE al.status = 'success')::BIGINT as success_calls,
    COUNT(*) FILTER (WHERE al.status = 'error')::BIGINT as error_calls,
    ROUND(AVG(al.response_time_ms)::NUMERIC, 2) as avg_response_time,
    ROUND(AVG(al.tokens_used)::NUMERIC, 2) as avg_tokens,
    ROUND((COUNT(*) FILTER (WHERE al.status = 'success')::NUMERIC / COUNT(*)::NUMERIC * 100), 2) as success_rate
  FROM ai_logs al
  WHERE 
    al.created_at BETWEEN p_start_date AND p_end_date
    AND (p_service IS NULL OR al.service = p_service)
  GROUP BY al.service
  ORDER BY total_calls DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
