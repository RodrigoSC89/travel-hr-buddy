-- Create cron_execution_logs table for tracking cron job executions
CREATE TABLE IF NOT EXISTS cron_execution_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  function_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'error', 'warning')),
  message TEXT,
  error_details JSONB,
  executed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for fast queries
CREATE INDEX idx_cron_execution_logs_executed_at ON cron_execution_logs(executed_at DESC);
CREATE INDEX idx_cron_execution_logs_function_name ON cron_execution_logs(function_name);
CREATE INDEX idx_cron_execution_logs_status ON cron_execution_logs(status);

-- Enable Row Level Security
ALTER TABLE cron_execution_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Only service role can insert
CREATE POLICY "Service role can insert execution logs"
  ON cron_execution_logs
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Policy: Authenticated admins can view all logs
CREATE POLICY "Admins can view all execution logs"
  ON cron_execution_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Add comment for documentation
COMMENT ON TABLE cron_execution_logs IS 'Tracks all cron job executions with status and error details';
COMMENT ON COLUMN cron_execution_logs.function_name IS 'Name of the cron function that executed';
COMMENT ON COLUMN cron_execution_logs.status IS 'Execution status: success, error, or warning';
COMMENT ON COLUMN cron_execution_logs.message IS 'Human-readable status message';
COMMENT ON COLUMN cron_execution_logs.error_details IS 'JSON object containing error details if status is error';
COMMENT ON COLUMN cron_execution_logs.executed_at IS 'Timestamp when the function executed';
