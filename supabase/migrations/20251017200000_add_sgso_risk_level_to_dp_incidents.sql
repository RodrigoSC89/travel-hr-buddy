-- ===========================
-- Add SGSO Risk Level to DP Incidents
-- Adds sgso_risk_level column and updated_at for trend analysis
-- ===========================

-- Add sgso_risk_level column to dp_incidents table
ALTER TABLE public.dp_incidents 
ADD COLUMN IF NOT EXISTS sgso_risk_level TEXT;

-- Add updated_at column if it doesn't exist
ALTER TABLE public.dp_incidents 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Add comment for new column
COMMENT ON COLUMN public.dp_incidents.sgso_risk_level IS 'Nível de risco SGSO do incidente: baixo, moderado, alto, crítico';
COMMENT ON COLUMN public.dp_incidents.updated_at IS 'Data/hora da última atualização do registro';

-- Create index for performance on sgso_risk_level queries
CREATE INDEX IF NOT EXISTS idx_dp_incidents_sgso_risk_level ON public.dp_incidents(sgso_risk_level);
CREATE INDEX IF NOT EXISTS idx_dp_incidents_updated_at ON public.dp_incidents(updated_at DESC);

-- Create or replace function to get SGSO trend data
CREATE OR REPLACE FUNCTION get_sgso_trend()
RETURNS TABLE (
  mes DATE,
  sgso_risk_level TEXT,
  total BIGINT
) 
LANGUAGE sql
STABLE
AS $$
  SELECT
    date_trunc('month', updated_at)::DATE as mes,
    sgso_risk_level,
    count(*) as total
  FROM dp_incidents
  WHERE sgso_risk_level IS NOT NULL
  GROUP BY date_trunc('month', updated_at), sgso_risk_level
  ORDER BY date_trunc('month', updated_at) DESC
$$;

-- Add comment for function
COMMENT ON FUNCTION get_sgso_trend IS 'Retorna evolução mensal dos riscos SGSO por nível de severidade';
