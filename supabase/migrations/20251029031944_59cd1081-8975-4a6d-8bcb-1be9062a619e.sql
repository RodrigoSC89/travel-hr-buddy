-- PATCH 506: AI Memory Layer
CREATE TABLE IF NOT EXISTS public.ai_memory_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID,
  event_type TEXT NOT NULL,
  event_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  embedding vector(1536),
  context TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  confidence NUMERIC(3,2) DEFAULT 0.0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for ai_memory_events
CREATE INDEX IF NOT EXISTS idx_ai_memory_events_user_id ON public.ai_memory_events(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_memory_events_org_id ON public.ai_memory_events(organization_id);
CREATE INDEX IF NOT EXISTS idx_ai_memory_events_type ON public.ai_memory_events(event_type);
CREATE INDEX IF NOT EXISTS idx_ai_memory_events_created ON public.ai_memory_events(created_at DESC);

-- Enable RLS
ALTER TABLE public.ai_memory_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_memory_events
CREATE POLICY "Users can view their own AI memory events"
  ON public.ai_memory_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own AI memory events"
  ON public.ai_memory_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can manage AI memory events"
  ON public.ai_memory_events FOR ALL
  USING (true);

-- PATCH 507: Automated Backups
CREATE TABLE IF NOT EXISTS public.system_backups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_type TEXT NOT NULL DEFAULT 'automatic',
  file_path TEXT NOT NULL,
  file_size BIGINT,
  backup_status TEXT NOT NULL DEFAULT 'completed',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  error_message TEXT
);

-- Indexes for system_backups
CREATE INDEX IF NOT EXISTS idx_system_backups_status ON public.system_backups(backup_status);
CREATE INDEX IF NOT EXISTS idx_system_backups_created ON public.system_backups(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_backups_type ON public.system_backups(backup_type);

-- Enable RLS
ALTER TABLE public.system_backups ENABLE ROW LEVEL SECURITY;

-- RLS Policies for system_backups
CREATE POLICY "Admins can view all backups"
  ON public.system_backups FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'hr_manager')
    )
  );

CREATE POLICY "System can manage backups"
  ON public.system_backups FOR ALL
  USING (true);

-- PATCH 509: AI Feedback Loop
CREATE TABLE IF NOT EXISTS public.ai_feedback_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  command_type TEXT NOT NULL,
  command_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  self_score NUMERIC(3,2) NOT NULL,
  feedback_data JSONB DEFAULT '{}'::jsonb,
  improvements JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for ai_feedback_scores
CREATE INDEX IF NOT EXISTS idx_ai_feedback_user_id ON public.ai_feedback_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_feedback_command ON public.ai_feedback_scores(command_type);
CREATE INDEX IF NOT EXISTS idx_ai_feedback_score ON public.ai_feedback_scores(self_score);
CREATE INDEX IF NOT EXISTS idx_ai_feedback_created ON public.ai_feedback_scores(created_at DESC);

-- Enable RLS
ALTER TABLE public.ai_feedback_scores ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_feedback_scores
CREATE POLICY "Users can view their own AI feedback"
  ON public.ai_feedback_scores FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage AI feedback"
  ON public.ai_feedback_scores FOR ALL
  USING (true);

-- PATCH 510: Auth Sessions Table
CREATE TABLE IF NOT EXISTS public.active_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_token TEXT NOT NULL,
  refresh_token TEXT,
  ip_address INET,
  user_agent TEXT,
  device_info JSONB DEFAULT '{}'::jsonb,
  last_activity TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Indexes for active_sessions
CREATE INDEX IF NOT EXISTS idx_active_sessions_user_id ON public.active_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_active_sessions_token ON public.active_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_active_sessions_expires ON public.active_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_active_sessions_active ON public.active_sessions(is_active) WHERE is_active = true;

-- Enable RLS
ALTER TABLE public.active_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for active_sessions
CREATE POLICY "Users can view their own sessions"
  ON public.active_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions"
  ON public.active_sessions FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage sessions"
  ON public.active_sessions FOR ALL
  USING (true);

-- PATCH 508: RLS Audit Log
CREATE TABLE IF NOT EXISTS public.rls_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL,
  access_granted BOOLEAN NOT NULL,
  policy_name TEXT,
  row_data JSONB,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for rls_access_logs
CREATE INDEX IF NOT EXISTS idx_rls_logs_user_id ON public.rls_access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_rls_logs_table ON public.rls_access_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_rls_logs_operation ON public.rls_access_logs(operation);
CREATE INDEX IF NOT EXISTS idx_rls_logs_created ON public.rls_access_logs(created_at DESC);

-- Enable RLS
ALTER TABLE public.rls_access_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for rls_access_logs
CREATE POLICY "Admins can view all RLS logs"
  ON public.rls_access_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'hr_manager')
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_ai_memory_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for ai_memory_events
CREATE TRIGGER update_ai_memory_events_updated_at
  BEFORE UPDATE ON public.ai_memory_events
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_memory_updated_at();