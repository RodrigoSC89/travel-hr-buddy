-- ===========================
-- Add plan_of_action field to dp_incidents table
-- This field will store AI-generated action plans in JSONB format
-- ===========================

-- Add plan_of_action column to dp_incidents table
ALTER TABLE public.dp_incidents 
ADD COLUMN IF NOT EXISTS plan_of_action JSONB;

-- Add severity and status columns if they don't exist
ALTER TABLE public.dp_incidents 
ADD COLUMN IF NOT EXISTS severity TEXT CHECK (severity IN ('critical', 'high', 'medium', 'low'));

ALTER TABLE public.dp_incidents 
ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('analyzed', 'pending')) DEFAULT 'pending';

ALTER TABLE public.dp_incidents
ADD COLUMN IF NOT EXISTS incident_date DATE;

ALTER TABLE public.dp_incidents
ADD COLUMN IF NOT EXISTS description TEXT;

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS idx_dp_incidents_severity ON public.dp_incidents(severity);
CREATE INDEX IF NOT EXISTS idx_dp_incidents_status ON public.dp_incidents(status);
CREATE INDEX IF NOT EXISTS idx_dp_incidents_incident_date ON public.dp_incidents(incident_date DESC);

-- Add column comments
COMMENT ON COLUMN public.dp_incidents.plan_of_action IS 'Plano de ação gerado por IA contendo diagnóstico, causa raiz, ações corretivas/preventivas, responsável e prazo';
COMMENT ON COLUMN public.dp_incidents.severity IS 'Severidade do incidente: critical, high, medium, low';
COMMENT ON COLUMN public.dp_incidents.status IS 'Status da análise: analyzed (analisado) ou pending (pendente)';
COMMENT ON COLUMN public.dp_incidents.incident_date IS 'Data de ocorrência do incidente';
COMMENT ON COLUMN public.dp_incidents.description IS 'Descrição detalhada do incidente';
