-- ===========================
-- Add plan status tracking fields to dp_incidents table
-- This allows tracking the status of action plans: pendente, em andamento, concluído
-- ===========================

-- Add plan_status column with check constraint
ALTER TABLE public.dp_incidents 
ADD COLUMN IF NOT EXISTS plan_status TEXT DEFAULT 'pendente' 
CHECK (plan_status IN ('pendente', 'em andamento', 'concluído'));

-- Add plan_sent_at column (timestamp when plan was sent to responsible party)
ALTER TABLE public.dp_incidents 
ADD COLUMN IF NOT EXISTS plan_sent_at TIMESTAMP WITH TIME ZONE;

-- Add plan_updated_at column (timestamp when plan status was last updated)
ALTER TABLE public.dp_incidents 
ADD COLUMN IF NOT EXISTS plan_updated_at TIMESTAMP WITH TIME ZONE;

-- Create index for plan_status for efficient filtering
CREATE INDEX IF NOT EXISTS idx_dp_incidents_plan_status ON public.dp_incidents(plan_status);

-- Add column comments
COMMENT ON COLUMN public.dp_incidents.plan_status IS 'Status do plano de ação: pendente, em andamento, ou concluído';
COMMENT ON COLUMN public.dp_incidents.plan_sent_at IS 'Data/hora do envio do plano de ação ao responsável';
COMMENT ON COLUMN public.dp_incidents.plan_updated_at IS 'Data/hora da última atualização do status do plano de ação';
