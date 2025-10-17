-- ===========================
-- Add Plan Fields to DP Incidents Table
-- Adds fields for action plan management and email tracking
-- ===========================

-- Add plan-related columns to dp_incidents table
ALTER TABLE public.dp_incidents
  ADD COLUMN IF NOT EXISTS plan_of_action TEXT,
  ADD COLUMN IF NOT EXISTS plan_sent_to TEXT,
  ADD COLUMN IF NOT EXISTS plan_status TEXT CHECK (plan_status IN ('pendente', 'em andamento', 'concluído')),
  ADD COLUMN IF NOT EXISTS plan_sent_at TIMESTAMP WITH TIME ZONE;

-- Create index for plan_status for filtering
CREATE INDEX IF NOT EXISTS idx_dp_incidents_plan_status ON public.dp_incidents(plan_status);

-- Add comments to new columns
COMMENT ON COLUMN public.dp_incidents.plan_of_action IS 'AI-generated action plan for the incident';
COMMENT ON COLUMN public.dp_incidents.plan_sent_to IS 'Email address of the department or person responsible';
COMMENT ON COLUMN public.dp_incidents.plan_status IS 'Status of the action plan: pendente | em andamento | concluído';
COMMENT ON COLUMN public.dp_incidents.plan_sent_at IS 'Timestamp when the plan was sent via email';
