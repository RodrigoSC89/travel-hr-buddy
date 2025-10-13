-- ✅ Create comprehensive cron execution logging table
-- This table tracks all cron job executions with detailed metadata
-- Part of PR #403: Add comprehensive cron execution monitoring system

CREATE TABLE IF NOT EXISTS public.cron_execution_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  function_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'error', 'warning', 'critical')),
  message TEXT,
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  error_details JSONB,
  execution_duration_ms INTEGER,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_cron_execution_logs_executed_at 
  ON public.cron_execution_logs(executed_at DESC);

CREATE INDEX IF NOT EXISTS idx_cron_execution_logs_function_name 
  ON public.cron_execution_logs(function_name);

CREATE INDEX IF NOT EXISTS idx_cron_execution_logs_status 
  ON public.cron_execution_logs(status);

-- Enable Row Level Security
ALTER TABLE public.cron_execution_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can insert execution logs
CREATE POLICY "Service role can insert cron execution logs"
  ON public.cron_execution_logs
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Policy: Admins can view all execution logs
CREATE POLICY "Admins can view all cron execution logs"
  ON public.cron_execution_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Add table comment
COMMENT ON TABLE public.cron_execution_logs IS 
  'Comprehensive logging table for all cron job executions. Tracks status, timing, and error details for monitoring and debugging.';

-- Add column comments
COMMENT ON COLUMN public.cron_execution_logs.function_name IS 
  'Name of the cron function that was executed (e.g., send-daily-assistant-report)';

COMMENT ON COLUMN public.cron_execution_logs.status IS 
  'Execution status: success, error, warning, or critical';

COMMENT ON COLUMN public.cron_execution_logs.message IS 
  'Human-readable message describing the execution result';

COMMENT ON COLUMN public.cron_execution_logs.error_details IS 
  'JSON object containing detailed error information if execution failed';

COMMENT ON COLUMN public.cron_execution_logs.execution_duration_ms IS 
  'Duration of the execution in milliseconds';

COMMENT ON COLUMN public.cron_execution_logs.metadata IS 
  'Additional metadata about the execution (e.g., records processed, email sent to, etc.)';
