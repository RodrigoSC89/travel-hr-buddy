-- =====================================================
-- PATCH 96.0 - Logs System Table
-- Creates logs table for centralized logging system
-- =====================================================

-- Create logs table
CREATE TABLE IF NOT EXISTS public.logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  level TEXT NOT NULL CHECK (level IN ('debug', 'info', 'warning', 'error', 'critical')),
  module TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON public.logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_logs_level ON public.logs(level);
CREATE INDEX IF NOT EXISTS idx_logs_module ON public.logs(module);
CREATE INDEX IF NOT EXISTS idx_logs_user_id ON public.logs(user_id);
CREATE INDEX IF NOT EXISTS idx_logs_organization_id ON public.logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_logs_module_level_timestamp ON public.logs(module, level, timestamp DESC);

-- Enable RLS
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their organization logs"
  ON public.logs FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_users 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Authenticated users can insert logs"
  ON public.logs FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can delete old logs"
  ON public.logs FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Function to cleanup old logs (90 days retention)
CREATE OR REPLACE FUNCTION public.cleanup_old_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.logs 
  WHERE timestamp < NOW() - INTERVAL '90 days';
END;
$$;

-- Comments
COMMENT ON TABLE public.logs IS 'Centralized logging system for all modules';
COMMENT ON COLUMN public.logs.level IS 'Log level: debug, info, warning, error, critical';
COMMENT ON COLUMN public.logs.module IS 'Module identifier that generated the log';
COMMENT ON COLUMN public.logs.metadata IS 'Additional structured data in JSON format';