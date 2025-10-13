-- Create cron_execution_logs table for comprehensive cron monitoring
-- This table stores all cron job execution records with timestamps and status

CREATE TABLE IF NOT EXISTS public.cron_execution_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  function_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'error', 'warning', 'critical')),
  message TEXT,
  error_details JSONB,
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create optimized indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_cron_execution_logs_executed_at 
  ON public.cron_execution_logs(executed_at DESC);

CREATE INDEX IF NOT EXISTS idx_cron_execution_logs_function_name 
  ON public.cron_execution_logs(function_name, executed_at DESC);

CREATE INDEX IF NOT EXISTS idx_cron_execution_logs_status 
  ON public.cron_execution_logs(status, executed_at DESC);

-- Enable Row Level Security
ALTER TABLE public.cron_execution_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can insert logs (edge functions only)
CREATE POLICY "Service role can insert cron execution logs"
  ON public.cron_execution_logs
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Policy: Only admins can view logs
CREATE POLICY "Admins can view cron execution logs"
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

-- Grant appropriate permissions
GRANT SELECT ON public.cron_execution_logs TO authenticated;
GRANT INSERT ON public.cron_execution_logs TO service_role;

-- Add helpful comment
COMMENT ON TABLE public.cron_execution_logs IS 
  'Stores all cron job execution records with timestamps and status for monitoring and alerting';

COMMENT ON COLUMN public.cron_execution_logs.function_name IS 
  'Name of the cron function that executed (e.g., send-daily-assistant-report)';

COMMENT ON COLUMN public.cron_execution_logs.status IS 
  'Execution status: success, error, warning, or critical';

COMMENT ON COLUMN public.cron_execution_logs.message IS 
  'Human-readable message describing the execution result';

COMMENT ON COLUMN public.cron_execution_logs.error_details IS 
  'JSON object containing error details if status is error or critical';

COMMENT ON COLUMN public.cron_execution_logs.executed_at IS 
  'Timestamp when the cron function executed';
