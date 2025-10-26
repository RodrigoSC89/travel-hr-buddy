-- PATCH 216-220: Collective Intelligence System Tables
-- Drop and recreate tables with correct syntax

DROP TABLE IF EXISTS public.learning_adjustments CASCADE;
DROP TABLE IF EXISTS public.ai_performance_metrics CASCADE;
DROP TABLE IF EXISTS public.feedback_events CASCADE;
DROP TABLE IF EXISTS public.ai_suggestions CASCADE;
DROP TABLE IF EXISTS public.module_health CASCADE;
DROP TABLE IF EXISTS public.system_observations CASCADE;
DROP TABLE IF EXISTS public.decision_history CASCADE;
DROP TABLE IF EXISTS public.distributed_decisions CASCADE;
DROP TABLE IF EXISTS public.context_sync_logs CASCADE;
DROP TABLE IF EXISTS public.context_snapshots CASCADE;
DROP TABLE IF EXISTS public.copilot_sessions CASCADE;

CREATE TABLE public.context_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  context_type TEXT NOT NULL,
  context_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  source_module TEXT NOT NULL,
  tenant_id UUID,
  vessel_id UUID,
  sync_status TEXT DEFAULT 'synced',
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_context_snapshots_type ON public.context_snapshots(context_type);

CREATE TABLE public.context_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  context_type TEXT NOT NULL,
  action TEXT NOT NULL,
  source_module TEXT NOT NULL,
  target_modules TEXT[] DEFAULT '{}',
  sync_duration_ms INTEGER,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.distributed_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_type TEXT NOT NULL,
  decision_level TEXT NOT NULL,
  decision_status TEXT DEFAULT 'pending',
  context JSONB NOT NULL DEFAULT '{}'::jsonb,
  priority TEXT NOT NULL,
  confidence NUMERIC(5,2) DEFAULT 0,
  simulation_result JSONB,
  escalation_reason TEXT,
  approved_by UUID,
  executed_at TIMESTAMPTZ,
  outcome TEXT,
  tenant_id UUID,
  vessel_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.decision_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id UUID NOT NULL,
  previous_status TEXT NOT NULL,
  new_status TEXT NOT NULL,
  changed_by UUID,
  reason TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.system_observations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  observation_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  module_name TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  tenant_id UUID,
  vessel_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.module_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_name TEXT NOT NULL UNIQUE,
  health_score NUMERIC(5,2) DEFAULT 100,
  status TEXT DEFAULT 'healthy',
  cpu_usage NUMERIC(5,2),
  memory_usage NUMERIC(5,2),
  error_count INTEGER DEFAULT 0,
  last_error TEXT,
  last_check_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.ai_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  suggestion_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  module_name TEXT NOT NULL,
  issue_description TEXT NOT NULL,
  suggestion_text TEXT NOT NULL,
  expected_impact TEXT,
  confidence NUMERIC(5,2) DEFAULT 0,
  status TEXT DEFAULT 'pending',
  applied_at TIMESTAMPTZ,
  applied_by UUID,
  effectiveness_score NUMERIC(5,2),
  metadata JSONB DEFAULT '{}'::jsonb,
  tenant_id UUID,
  vessel_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

CREATE TABLE public.feedback_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_type TEXT NOT NULL,
  feedback_category TEXT NOT NULL,
  source TEXT NOT NULL,
  module_name TEXT NOT NULL,
  ai_decision_id UUID,
  original_decision TEXT,
  corrected_decision TEXT,
  reason TEXT,
  confidence NUMERIC(5,2) DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  processed BOOLEAN DEFAULT false,
  learning_applied BOOLEAN DEFAULT false,
  tenant_id UUID,
  user_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.ai_performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_name TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC(10,2) NOT NULL,
  success_rate NUMERIC(5,2),
  avg_confidence NUMERIC(5,2),
  correction_count INTEGER DEFAULT 0,
  approval_count INTEGER DEFAULT 0,
  rejection_count INTEGER DEFAULT 0,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  tenant_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.learning_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_name TEXT NOT NULL,
  parameter_name TEXT NOT NULL,
  old_value NUMERIC(10,4) NOT NULL,
  new_value NUMERIC(10,4) NOT NULL,
  reason TEXT NOT NULL,
  confidence NUMERIC(5,2) DEFAULT 0,
  impact TEXT,
  applied_by TEXT DEFAULT 'system',
  approved_by UUID,
  rollback_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  tenant_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.copilot_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  session_name TEXT,
  context JSONB DEFAULT '{}'::jsonb,
  messages JSONB DEFAULT '[]'::jsonb,
  recommendations JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'active',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.context_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.context_sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.distributed_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decision_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.copilot_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth_users_context" ON public.context_snapshots FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "auth_users_sync" ON public.context_sync_logs FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "auth_users_decisions" ON public.distributed_decisions FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "auth_users_history" ON public.decision_history FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "auth_users_obs" ON public.system_observations FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "public_health" ON public.module_health FOR SELECT USING (true);
CREATE POLICY "auth_manage_health" ON public.module_health FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "auth_update_health" ON public.module_health FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "auth_users_sugg" ON public.ai_suggestions FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "auth_users_feedback" ON public.feedback_events FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "auth_users_perf" ON public.ai_performance_metrics FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "auth_users_adj" ON public.learning_adjustments FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "users_copilot" ON public.copilot_sessions FOR ALL USING (auth.uid() = user_id);