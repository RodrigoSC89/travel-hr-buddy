-- Create assistant_report_logs table for tracking daily report email logs
-- This table tracks when automated assistant reports are sent via email

CREATE TABLE IF NOT EXISTS public.assistant_report_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_email TEXT,
  status TEXT NOT NULL CHECK (status IN ('success', 'error', 'pending')),
  message TEXT,
  error_details TEXT,
  logs_count INTEGER DEFAULT 0,
  triggered_by TEXT DEFAULT 'automated'
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_assistant_report_logs_sent_at ON public.assistant_report_logs(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_assistant_report_logs_status ON public.assistant_report_logs(status);

-- Enable RLS
ALTER TABLE public.assistant_report_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can view all report logs
CREATE POLICY "Admins can view all report logs" 
ON public.assistant_report_logs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Policy: System can insert report logs
CREATE POLICY "Service role can insert report logs" 
ON public.assistant_report_logs FOR INSERT
WITH CHECK (true);

-- Policy: Admins can update report logs
CREATE POLICY "Admins can update report logs"
ON public.assistant_report_logs FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Policy: Admins can delete report logs
CREATE POLICY "Admins can delete report logs"
ON public.assistant_report_logs FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);
