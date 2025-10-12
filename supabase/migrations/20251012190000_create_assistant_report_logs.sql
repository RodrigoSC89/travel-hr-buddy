-- Create assistant_report_logs table for tracking AI assistant report sending
-- This tracks when the assistant sends reports via email to users
CREATE TABLE IF NOT EXISTS public.assistant_report_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'error', 'pending')),
  message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  report_type TEXT,
  metadata JSONB
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_assistant_report_logs_user_email ON public.assistant_report_logs(user_email);
CREATE INDEX IF NOT EXISTS idx_assistant_report_logs_sent_at ON public.assistant_report_logs(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_assistant_report_logs_status ON public.assistant_report_logs(status);
CREATE INDEX IF NOT EXISTS idx_assistant_report_logs_user_id ON public.assistant_report_logs(user_id);

-- Enable RLS
ALTER TABLE public.assistant_report_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own logs
CREATE POLICY "Users can view their own report logs" 
ON public.assistant_report_logs FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Admins can view all logs
CREATE POLICY "Admins can view all report logs by role" 
ON public.assistant_report_logs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Policy: Authenticated users can insert their own logs
CREATE POLICY "Users can insert their own report logs" 
ON public.assistant_report_logs FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: System can insert logs (for automated reports)
CREATE POLICY "System can insert report logs"
ON public.assistant_report_logs FOR INSERT
WITH CHECK (true);

-- Policy: Admins can update all logs
CREATE POLICY "Admins can update all report logs"
ON public.assistant_report_logs FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Policy: Admins can delete all logs
CREATE POLICY "Admins can delete all report logs"
ON public.assistant_report_logs FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);
