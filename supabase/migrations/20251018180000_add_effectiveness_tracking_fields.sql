-- ===========================
-- Add SGSO Effectiveness Tracking Fields
-- Adds fields for monitoring action plan effectiveness
-- ===========================

-- Add effectiveness tracking columns to dp_incidents table
ALTER TABLE public.dp_incidents 
ADD COLUMN IF NOT EXISTS sgso_category TEXT CHECK (sgso_category IN ('Erro humano', 'Falha técnica', 'Comunicação', 'Falha organizacional')),
ADD COLUMN IF NOT EXISTS action_plan_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS repeated BOOLEAN DEFAULT false;

-- Add comments for new columns
COMMENT ON COLUMN public.dp_incidents.sgso_category IS 'Categoria SGSO do incidente: Erro humano, Falha técnica, Comunicação, Falha organizacional';
COMMENT ON COLUMN public.dp_incidents.action_plan_date IS 'Data de criação do plano de ação';
COMMENT ON COLUMN public.dp_incidents.resolved_at IS 'Data de resolução/fechamento do incidente';
COMMENT ON COLUMN public.dp_incidents.repeated IS 'Indica se é um incidente repetido na mesma categoria';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_dp_incidents_sgso_category ON public.dp_incidents(sgso_category);
CREATE INDEX IF NOT EXISTS idx_dp_incidents_action_plan_date ON public.dp_incidents(action_plan_date);
CREATE INDEX IF NOT EXISTS idx_dp_incidents_resolved_at ON public.dp_incidents(resolved_at);
CREATE INDEX IF NOT EXISTS idx_dp_incidents_repeated ON public.dp_incidents(repeated);

-- ===========================
-- Function: calculate_sgso_effectiveness
-- Returns effectiveness metrics by SGSO category
-- ===========================
CREATE OR REPLACE FUNCTION calculate_sgso_effectiveness()
RETURNS TABLE (
  categoria TEXT,
  total_incidencias BIGINT,
  incidencias_repetidas BIGINT,
  efetividade NUMERIC,
  tempo_medio_resolucao NUMERIC
) 
LANGUAGE sql
STABLE
AS $$
  SELECT
    sgso_category as categoria,
    COUNT(*) as total_incidencias,
    COUNT(*) FILTER (WHERE repeated = true) as incidencias_repetidas,
    CASE 
      WHEN COUNT(*) = 0 THEN 0
      ELSE ROUND(100 - (COUNT(*) FILTER (WHERE repeated = true)::NUMERIC / COUNT(*)::NUMERIC * 100), 2)
    END as efetividade,
    CASE
      WHEN COUNT(*) FILTER (WHERE action_plan_date IS NOT NULL AND resolved_at IS NOT NULL) = 0 THEN NULL
      ELSE ROUND(
        AVG(
          EXTRACT(EPOCH FROM (resolved_at - action_plan_date)) / 86400
        ) FILTER (WHERE action_plan_date IS NOT NULL AND resolved_at IS NOT NULL),
        1
      )
    END as tempo_medio_resolucao
  FROM dp_incidents
  WHERE sgso_category IS NOT NULL
  GROUP BY sgso_category
  ORDER BY categoria
$$;

-- Add comment for function
COMMENT ON FUNCTION calculate_sgso_effectiveness IS 'Calcula métricas de efetividade dos planos de ação SGSO por categoria';

-- ===========================
-- Function: calculate_sgso_effectiveness_by_vessel
-- Returns effectiveness metrics by vessel and SGSO category
-- ===========================
CREATE OR REPLACE FUNCTION calculate_sgso_effectiveness_by_vessel()
RETURNS TABLE (
  embarcacao TEXT,
  categoria TEXT,
  total_incidencias BIGINT,
  incidencias_repetidas BIGINT,
  efetividade NUMERIC,
  tempo_medio_resolucao NUMERIC
) 
LANGUAGE sql
STABLE
AS $$
  SELECT
    vessel as embarcacao,
    sgso_category as categoria,
    COUNT(*) as total_incidencias,
    COUNT(*) FILTER (WHERE repeated = true) as incidencias_repetidas,
    CASE 
      WHEN COUNT(*) = 0 THEN 0
      ELSE ROUND(100 - (COUNT(*) FILTER (WHERE repeated = true)::NUMERIC / COUNT(*)::NUMERIC * 100), 2)
    END as efetividade,
    CASE
      WHEN COUNT(*) FILTER (WHERE action_plan_date IS NOT NULL AND resolved_at IS NOT NULL) = 0 THEN NULL
      ELSE ROUND(
        AVG(
          EXTRACT(EPOCH FROM (resolved_at - action_plan_date)) / 86400
        ) FILTER (WHERE action_plan_date IS NOT NULL AND resolved_at IS NOT NULL),
        1
      )
    END as tempo_medio_resolucao
  FROM dp_incidents
  WHERE sgso_category IS NOT NULL AND vessel IS NOT NULL
  GROUP BY vessel, sgso_category
  ORDER BY embarcacao, categoria
$$;

-- Add comment for function
COMMENT ON FUNCTION calculate_sgso_effectiveness_by_vessel IS 'Calcula métricas de efetividade dos planos de ação SGSO por embarcação e categoria';
