-- Add plan_status column to dp_incidents table
-- This column tracks the action plan status for each incident

ALTER TABLE public.dp_incidents 
ADD COLUMN IF NOT EXISTS plan_status TEXT 
CHECK (plan_status IN ('pendente', 'em andamento', 'concluído'))
DEFAULT 'pendente';

-- Add index for performance when filtering by status
CREATE INDEX IF NOT EXISTS idx_dp_incidents_plan_status ON public.dp_incidents(plan_status);

-- Add comment
COMMENT ON COLUMN public.dp_incidents.plan_status IS 'Status do plano de ação: pendente, em andamento, concluído';
