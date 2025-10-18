-- ===========================
-- Add plan email tracking fields to dp_incidents table
-- This migration adds fields to track action plan emails
-- ===========================

-- Add email tracking columns to dp_incidents table
ALTER TABLE public.dp_incidents
  ADD COLUMN IF NOT EXISTS plan_sent_to TEXT,
  ADD COLUMN IF NOT EXISTS plan_status TEXT CHECK (plan_status IN ('pendente', 'em andamento', 'concluído')),
  ADD COLUMN IF NOT EXISTS plan_sent_at TIMESTAMP WITH TIME ZONE;

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS idx_dp_incidents_plan_status ON public.dp_incidents(plan_status);
CREATE INDEX IF NOT EXISTS idx_dp_incidents_plan_sent_at ON public.dp_incidents(plan_sent_at DESC);

-- Add column comments
COMMENT ON COLUMN public.dp_incidents.plan_sent_to IS 'Email do setor ou responsável que recebeu o plano de ação';
COMMENT ON COLUMN public.dp_incidents.plan_status IS 'Status do plano de ação: pendente, em andamento, concluído';
COMMENT ON COLUMN public.dp_incidents.plan_sent_at IS 'Data e hora do envio do plano de ação por email';
