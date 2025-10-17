-- ===========================
-- DP INCIDENTS - Action Plan Status Fields
-- Add plan_status, plan_sent_at, and plan_updated_at fields to track action plan status
-- ===========================

-- Add plan status field
ALTER TABLE public.dp_incidents 
ADD COLUMN IF NOT EXISTS plan_status TEXT DEFAULT 'pendente' CHECK (plan_status IN ('pendente', 'em andamento', 'concluído'));

-- Add plan sent date
ALTER TABLE public.dp_incidents 
ADD COLUMN IF NOT EXISTS plan_sent_at TIMESTAMP WITH TIME ZONE;

-- Add plan updated date
ALTER TABLE public.dp_incidents 
ADD COLUMN IF NOT EXISTS plan_updated_at TIMESTAMP WITH TIME ZONE;

-- Add index for plan_status for filtering
CREATE INDEX IF NOT EXISTS idx_dp_incidents_plan_status ON public.dp_incidents(plan_status);

-- Add column comments
COMMENT ON COLUMN public.dp_incidents.plan_status IS 'Status do plano de ação: pendente, em andamento, ou concluído';
COMMENT ON COLUMN public.dp_incidents.plan_sent_at IS 'Data/hora do envio do plano de ação';
COMMENT ON COLUMN public.dp_incidents.plan_updated_at IS 'Data/hora da última atualização do status do plano de ação';
