-- ===========================
-- Add Plan of Action fields to dp_incidents table
-- ===========================

-- Add new columns for plan of action management
ALTER TABLE public.dp_incidents
  ADD COLUMN IF NOT EXISTS plan_of_action TEXT,
  ADD COLUMN IF NOT EXISTS plan_status TEXT DEFAULT 'pendente' CHECK (plan_status IN ('pendente', 'em andamento', 'concluído')),
  ADD COLUMN IF NOT EXISTS plan_sent_to TEXT,
  ADD COLUMN IF NOT EXISTS plan_sent_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS plan_updated_at TIMESTAMP WITH TIME ZONE;

-- Create index for status filtering
CREATE INDEX IF NOT EXISTS idx_dp_incidents_plan_status ON public.dp_incidents(plan_status);

-- Create index for sent_at to optimize cron job queries
CREATE INDEX IF NOT EXISTS idx_dp_incidents_plan_sent_at ON public.dp_incidents(plan_sent_at);

-- Add column comments
COMMENT ON COLUMN public.dp_incidents.plan_of_action IS 'Plano de ação gerado por IA para o incidente';
COMMENT ON COLUMN public.dp_incidents.plan_status IS 'Status do plano: pendente, em andamento, ou concluído';
COMMENT ON COLUMN public.dp_incidents.plan_sent_to IS 'Email para onde o plano foi enviado';
COMMENT ON COLUMN public.dp_incidents.plan_sent_at IS 'Data/hora do envio do plano';
COMMENT ON COLUMN public.dp_incidents.plan_updated_at IS 'Data/hora da última atualização do status do plano';
