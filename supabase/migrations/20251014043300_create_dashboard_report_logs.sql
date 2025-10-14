-- Create dashboard_report_logs table to track automated dashboard report executions
-- This table stores audit logs of when dashboard reports are sent via email

CREATE TABLE IF NOT EXISTS dashboard_report_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  executed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL CHECK (status IN ('success', 'error')),
  email TEXT NOT NULL,
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_dashboard_report_logs_executed_at 
  ON dashboard_report_logs (executed_at DESC);

CREATE INDEX IF NOT EXISTS idx_dashboard_report_logs_status 
  ON dashboard_report_logs (status);

CREATE INDEX IF NOT EXISTS idx_dashboard_report_logs_email 
  ON dashboard_report_logs (email);

-- Enable Row Level Security
ALTER TABLE dashboard_report_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can view all logs
CREATE POLICY "Admins can view all dashboard report logs"
  ON dashboard_report_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy: System can insert logs (service role)
CREATE POLICY "Service role can insert dashboard report logs"
  ON dashboard_report_logs
  FOR INSERT
  WITH CHECK (true);

-- Grant permissions
GRANT SELECT ON dashboard_report_logs TO authenticated;
GRANT INSERT ON dashboard_report_logs TO service_role;

-- Add comment
COMMENT ON TABLE dashboard_report_logs IS 'Audit logs for automated dashboard report email executions';
