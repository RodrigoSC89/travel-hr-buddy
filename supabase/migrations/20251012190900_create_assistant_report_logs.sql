-- Create assistant_report_logs table to track email report sends
CREATE TABLE IF NOT EXISTS public.assistant_report_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL CHECK (status IN ('success', 'error', 'pending')),
  message TEXT,
  user_email TEXT NOT NULL,
  logs_count INTEGER NOT NULL DEFAULT 0,
  recipient_email TEXT
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_assistant_report_logs_sent_at ON public.assistant_report_logs(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_assistant_report_logs_status ON public.assistant_report_logs(status);
CREATE INDEX IF NOT EXISTS idx_assistant_report_logs_user_email ON public.assistant_report_logs(user_email);

-- Enable RLS
ALTER TABLE public.assistant_report_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can insert logs
CREATE POLICY "Service role can insert logs" ON public.assistant_report_logs
  FOR INSERT
  WITH CHECK (true);

-- Policy: Admin users can view all logs
CREATE POLICY "Admin users can view logs" ON public.assistant_report_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Policy: Users can view their own logs
CREATE POLICY "Users can view their own logs" ON public.assistant_report_logs
  FOR SELECT
  USING (
    user_email IN (
      SELECT email FROM public.profiles
      WHERE id = auth.uid()
    )
  );
