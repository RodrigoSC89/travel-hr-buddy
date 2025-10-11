-- Create table for restore_report_logs
-- This table tracks when the daily restore report emails are sent

CREATE TABLE IF NOT EXISTS public.restore_report_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'error', 'pending')),
  message TEXT,
  error_details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_restore_report_logs_executed_at ON public.restore_report_logs(executed_at DESC);
CREATE INDEX IF NOT EXISTS idx_restore_report_logs_status ON public.restore_report_logs(status);

-- Enable RLS
ALTER TABLE public.restore_report_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for admins only
CREATE POLICY "Only admins can view restore report logs"
  ON public.restore_report_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Grant access to authenticated users (RLS will handle authorization)
GRANT SELECT ON public.restore_report_logs TO authenticated;

COMMENT ON TABLE public.restore_report_logs IS 'Logs of daily restore report email executions';
COMMENT ON COLUMN public.restore_report_logs.executed_at IS 'When the report was executed/sent';
COMMENT ON COLUMN public.restore_report_logs.status IS 'Status of the execution: success, error, or pending';
COMMENT ON COLUMN public.restore_report_logs.message IS 'Human-readable message about the execution';
COMMENT ON COLUMN public.restore_report_logs.error_details IS 'Detailed error information if status is error';
