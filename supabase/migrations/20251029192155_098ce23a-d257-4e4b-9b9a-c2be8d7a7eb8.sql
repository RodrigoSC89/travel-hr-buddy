-- Create ai_logs table for AI interaction tracking
CREATE TABLE IF NOT EXISTS public.ai_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id_hash TEXT,
  service TEXT NOT NULL CHECK (service IN ('copilot', 'vault_ai', 'dp_intelligence', 'forecast_engine', 'other')),
  prompt_hash TEXT NOT NULL,
  prompt_length INTEGER NOT NULL,
  response_length INTEGER DEFAULT 0,
  response_time_ms INTEGER,
  model TEXT,
  tokens_used INTEGER,
  status TEXT NOT NULL CHECK (status IN ('success', 'error', 'timeout')),
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create ai_commands table for mission control AI command tracking
CREATE TABLE IF NOT EXISTS public.ai_commands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  command_type TEXT NOT NULL,
  command_text TEXT NOT NULL,
  command_hash TEXT NOT NULL,
  execution_status TEXT NOT NULL CHECK (execution_status IN ('pending', 'executing', 'completed', 'failed', 'cancelled')),
  mission_id UUID,
  source_module TEXT NOT NULL,
  parameters JSONB DEFAULT '{}'::jsonb,
  result JSONB,
  error_details TEXT,
  execution_time_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Enable RLS on ai_logs
ALTER TABLE public.ai_logs ENABLE ROW LEVEL SECURITY;

-- Enable RLS on ai_commands
ALTER TABLE public.ai_commands ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_logs (admin only access)
CREATE POLICY "Admins can view all AI logs"
  ON public.ai_logs
  FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "System can insert AI logs"
  ON public.ai_logs
  FOR INSERT
  WITH CHECK (true);

-- RLS Policies for ai_commands
CREATE POLICY "Users can view their own AI commands"
  ON public.ai_commands
  FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE POLICY "Authenticated users can create AI commands"
  ON public.ai_commands
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI commands"
  ON public.ai_commands
  FOR UPDATE
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete AI commands"
  ON public.ai_commands
  FOR DELETE
  USING (public.is_admin(auth.uid()));

-- Add indexes for performance
CREATE INDEX idx_ai_logs_created_at ON public.ai_logs(created_at DESC);
CREATE INDEX idx_ai_logs_service ON public.ai_logs(service);
CREATE INDEX idx_ai_logs_status ON public.ai_logs(status);

CREATE INDEX idx_ai_commands_user_id ON public.ai_commands(user_id);
CREATE INDEX idx_ai_commands_created_at ON public.ai_commands(created_at DESC);
CREATE INDEX idx_ai_commands_status ON public.ai_commands(execution_status);
CREATE INDEX idx_ai_commands_mission_id ON public.ai_commands(mission_id);

-- Trigger to update updated_at on ai_commands
CREATE OR REPLACE FUNCTION public.update_ai_commands_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_ai_commands_updated_at
  BEFORE UPDATE ON public.ai_commands
  FOR EACH ROW
  EXECUTE FUNCTION public.update_ai_commands_updated_at();

-- Add RLS policies to access_logs if not already present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'access_logs' AND policyname = 'Admins can view all access logs'
  ) THEN
    CREATE POLICY "Admins can view all access logs"
      ON public.access_logs
      FOR SELECT
      USING (public.is_admin(auth.uid()));
  END IF;
END $$;

-- Add RLS policies to audit_logs if not already present  
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'audit_logs' AND policyname = 'Admins can view all audit logs'
  ) THEN
    CREATE POLICY "Admins can view all audit logs"
      ON public.audit_logs
      FOR SELECT
      USING (public.is_admin(auth.uid()));
  END IF;
END $$;

COMMENT ON TABLE public.ai_logs IS 'Logs all AI interactions for transparency and auditing';
COMMENT ON TABLE public.ai_commands IS 'Tracks AI commands from mission control and other modules for traceability';