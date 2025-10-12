-- Create report_email_logs table to track email sending attempts
-- This table maintains an audit trail of all daily restore report emails

CREATE TABLE IF NOT EXISTS public.report_email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'error')),
  message TEXT NOT NULL,
  error_details JSONB,
  recipient_email TEXT,
  logs_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_report_email_logs_sent_at ON public.report_email_logs(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_report_email_logs_status ON public.report_email_logs(status);
CREATE INDEX IF NOT EXISTS idx_report_email_logs_created_at ON public.report_email_logs(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.report_email_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can insert logs
CREATE POLICY "Service role can insert email logs"
  ON public.report_email_logs
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Policy: Admin users can view logs
CREATE POLICY "Admin users can view email logs"
  ON public.report_email_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Add comments for documentation
COMMENT ON TABLE public.report_email_logs IS 'Audit trail for daily restore report email sending attempts';
COMMENT ON COLUMN public.report_email_logs.id IS 'Unique identifier for each email log entry';
COMMENT ON COLUMN public.report_email_logs.sent_at IS 'Timestamp when the email was sent or attempted';
COMMENT ON COLUMN public.report_email_logs.status IS 'Status of the email sending attempt (success or error)';
COMMENT ON COLUMN public.report_email_logs.message IS 'Descriptive message about the email sending result';
COMMENT ON COLUMN public.report_email_logs.error_details IS 'Detailed error information if the sending failed';
COMMENT ON COLUMN public.report_email_logs.recipient_email IS 'Email address of the recipient';
COMMENT ON COLUMN public.report_email_logs.logs_count IS 'Number of restore logs included in the report';
