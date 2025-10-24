-- Create watchdog_logs table for System Watchdog
CREATE TABLE IF NOT EXISTS public.watchdog_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  error_id TEXT NOT NULL,
  error_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  message TEXT NOT NULL,
  stack_trace TEXT,
  context JSONB,
  ai_analysis JSONB,
  auto_fix_attempted BOOLEAN DEFAULT false,
  auto_fix_success BOOLEAN,
  module_name TEXT,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT
);

-- Create indexes for performance
CREATE INDEX idx_watchdog_logs_error_id ON public.watchdog_logs(error_id);
CREATE INDEX idx_watchdog_logs_severity ON public.watchdog_logs(severity);
CREATE INDEX idx_watchdog_logs_created_at ON public.watchdog_logs(created_at DESC);
CREATE INDEX idx_watchdog_logs_module ON public.watchdog_logs(module_name);
CREATE INDEX idx_watchdog_logs_user ON public.watchdog_logs(user_id);

-- Enable RLS
ALTER TABLE public.watchdog_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can see all logs
CREATE POLICY "Admins can view all watchdog logs"
ON public.watchdog_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);

-- Policy: Users can see their own error logs
CREATE POLICY "Users can view their own watchdog logs"
ON public.watchdog_logs
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: System can insert logs (for backend)
CREATE POLICY "System can insert watchdog logs"
ON public.watchdog_logs
FOR INSERT
WITH CHECK (true);

-- Policy: Admins can update logs (mark as resolved)
CREATE POLICY "Admins can update watchdog logs"
ON public.watchdog_logs
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);

COMMENT ON TABLE public.watchdog_logs IS 'Stores System Watchdog error detection and AI analysis logs';