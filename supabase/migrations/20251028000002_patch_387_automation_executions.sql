-- PATCH 387: Task Automation - Execution Logging Table
-- Migration to create automation_executions table for workflow execution tracking

CREATE TABLE IF NOT EXISTS public.automation_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  rule_id UUID REFERENCES public.automation_rules(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  trigger_type TEXT NOT NULL,
  trigger_data JSONB,
  execution_log JSONB DEFAULT '[]'::jsonb,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_automation_executions_organization ON public.automation_executions(organization_id);
CREATE INDEX IF NOT EXISTS idx_automation_executions_rule ON public.automation_executions(rule_id);
CREATE INDEX IF NOT EXISTS idx_automation_executions_status ON public.automation_executions(status);
CREATE INDEX IF NOT EXISTS idx_automation_executions_started_at ON public.automation_executions(started_at DESC);

-- Enable Row Level Security
ALTER TABLE public.automation_executions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view executions from their organization"
  ON public.automation_executions
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_users 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "System can manage executions"
  ON public.automation_executions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_users 
      WHERE user_id = auth.uid() 
      AND organization_id = automation_executions.organization_id
      AND status = 'active'
    )
  );

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON public.automation_executions TO authenticated;
GRANT USAGE ON SEQUENCE automation_executions_id_seq TO authenticated;
