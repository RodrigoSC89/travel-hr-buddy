-- Create cron_execution_logs table for tracking all cron job executions
-- This table provides comprehensive monitoring and audit trail for automated tasks

CREATE TABLE IF NOT EXISTS cron_execution_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  function_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'error', 'warning')),
  message TEXT,
  executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  error_details JSONB,
  execution_duration_ms INTEGER,
  metadata JSONB
);

-- Create indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_cron_execution_logs_executed_at 
  ON cron_execution_logs(executed_at DESC);

CREATE INDEX IF NOT EXISTS idx_cron_execution_logs_function_name 
  ON cron_execution_logs(function_name, executed_at DESC);

CREATE INDEX IF NOT EXISTS idx_cron_execution_logs_status 
  ON cron_execution_logs(status, executed_at DESC);

-- Enable Row Level Security
ALTER TABLE cron_execution_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Only service role can insert execution logs
CREATE POLICY "Service role can insert execution logs"
  ON cron_execution_logs
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Policy: Admins can view all execution logs
CREATE POLICY "Admins can view execution logs"
  ON cron_execution_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Add comment for documentation
COMMENT ON TABLE cron_execution_logs IS 
  'Tracks all cron job executions with status, timestamps, and error details for monitoring and debugging';

COMMENT ON COLUMN cron_execution_logs.function_name IS 
  'Name of the edge function or cron job that executed';

COMMENT ON COLUMN cron_execution_logs.status IS 
  'Execution status: success, error, or warning';

COMMENT ON COLUMN cron_execution_logs.message IS 
  'Human-readable message describing the execution result';

COMMENT ON COLUMN cron_execution_logs.executed_at IS 
  'Timestamp when the execution completed';

COMMENT ON COLUMN cron_execution_logs.error_details IS 
  'JSON object containing detailed error information if status is error';

COMMENT ON COLUMN cron_execution_logs.execution_duration_ms IS 
  'Duration of execution in milliseconds';

COMMENT ON COLUMN cron_execution_logs.metadata IS 
  'Additional metadata about the execution (e.g., records processed, email sent)';
