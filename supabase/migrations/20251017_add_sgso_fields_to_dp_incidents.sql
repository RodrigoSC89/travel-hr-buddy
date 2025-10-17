-- ===========================
-- SGSO Integration with DP Incidents
-- Add SGSO classification fields to dp_incidents table
-- ===========================

-- Add SGSO fields to dp_incidents table
ALTER TABLE public.dp_incidents
  ADD COLUMN IF NOT EXISTS sgso_category TEXT,
  ADD COLUMN IF NOT EXISTS sgso_root_cause TEXT,
  ADD COLUMN IF NOT EXISTS sgso_risk_level TEXT;

-- Add check constraint for risk level
ALTER TABLE public.dp_incidents
  ADD CONSTRAINT check_sgso_risk_level 
  CHECK (sgso_risk_level IS NULL OR sgso_risk_level IN ('baixo', 'moderado', 'alto', 'crítico'));

-- Create index for filtering by SGSO fields
CREATE INDEX IF NOT EXISTS idx_dp_incidents_sgso_category ON public.dp_incidents(sgso_category);
CREATE INDEX IF NOT EXISTS idx_dp_incidents_sgso_risk_level ON public.dp_incidents(sgso_risk_level);

-- Add column comments
COMMENT ON COLUMN public.dp_incidents.sgso_category IS 'SGSO category classification (e.g., Falha de sistema, Erro humano, Não conformidade)';
COMMENT ON COLUMN public.dp_incidents.sgso_root_cause IS 'Identified root cause within SGSO framework';
COMMENT ON COLUMN public.dp_incidents.sgso_risk_level IS 'SGSO risk level: baixo, moderado, alto, crítico';
