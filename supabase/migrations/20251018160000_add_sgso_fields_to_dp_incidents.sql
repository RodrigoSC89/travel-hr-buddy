-- ===========================
-- Add SGSO fields to dp_incidents table
-- Connects DP incidents with SGSO risk management system
-- ===========================

-- Add SGSO classification columns to dp_incidents
ALTER TABLE public.dp_incidents
  ADD COLUMN IF NOT EXISTS sgso_category TEXT,
  ADD COLUMN IF NOT EXISTS sgso_root_cause TEXT,
  ADD COLUMN IF NOT EXISTS sgso_risk_level TEXT CHECK (sgso_risk_level IN ('baixo', 'moderado', 'alto', 'crítico'));

-- Create indexes for filtering performance
CREATE INDEX IF NOT EXISTS idx_dp_incidents_sgso_category ON public.dp_incidents(sgso_category);
CREATE INDEX IF NOT EXISTS idx_dp_incidents_sgso_risk_level ON public.dp_incidents(sgso_risk_level);

-- Add column comments
COMMENT ON COLUMN public.dp_incidents.sgso_category IS 'Categoria de risco SGSO: Falha de sistema, Erro humano, Não conformidade, etc.';
COMMENT ON COLUMN public.dp_incidents.sgso_root_cause IS 'Causa raiz identificada dentro do framework SGSO';
COMMENT ON COLUMN public.dp_incidents.sgso_risk_level IS 'Nível de risco: baixo, moderado, alto, crítico';
