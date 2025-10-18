-- ===========================
-- Add SGSO Effectiveness Tracking Fields
-- Adds fields needed to monitor effectiveness of action plans
-- ===========================

-- Add new columns to dp_incidents table for effectiveness tracking
ALTER TABLE public.dp_incidents 
ADD COLUMN IF NOT EXISTS sgso_category TEXT,
ADD COLUMN IF NOT EXISTS action_plan_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS repeated BOOLEAN DEFAULT false;

-- Add comments for documentation
COMMENT ON COLUMN public.dp_incidents.sgso_category IS 'Categoria SGSO: Erro humano, Falha técnica, Comunicação, Falha organizacional';
COMMENT ON COLUMN public.dp_incidents.action_plan_date IS 'Data de criação do plano de ação';
COMMENT ON COLUMN public.dp_incidents.resolved_at IS 'Data de resolução/fechamento do incidente';
COMMENT ON COLUMN public.dp_incidents.repeated IS 'Indica se o incidente é uma reincidência';

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
  category TEXT,
  incidents_total BIGINT,
  incidents_repeated BIGINT,
  effectiveness_percent NUMERIC,
  avg_resolution_days NUMERIC
) 
LANGUAGE SQL
STABLE
AS $$
  SELECT
    sgso_category as category,
    COUNT(*) as incidents_total,
    SUM(CASE WHEN repeated = true THEN 1 ELSE 0 END) as incidents_repeated,
    ROUND(
      100 - (
        COALESCE(SUM(CASE WHEN repeated = true THEN 1 ELSE 0 END)::NUMERIC, 0) / 
        NULLIF(COUNT(*)::NUMERIC, 0) * 100
      ), 
      1
    ) as effectiveness_percent,
    ROUND(
      AVG(
        CASE 
          WHEN resolved_at IS NOT NULL AND incident_date IS NOT NULL 
          THEN EXTRACT(EPOCH FROM (resolved_at - incident_date)) / 86400
          ELSE NULL
        END
      ),
      1
    ) as avg_resolution_days
  FROM dp_incidents
  WHERE sgso_category IS NOT NULL
  GROUP BY sgso_category
  ORDER BY category;
$$;

COMMENT ON FUNCTION calculate_sgso_effectiveness IS 'Calcula métricas de efetividade por categoria SGSO';

-- ===========================
-- Function: calculate_sgso_effectiveness_by_vessel
-- Returns effectiveness metrics by vessel and category
-- ===========================
CREATE OR REPLACE FUNCTION calculate_sgso_effectiveness_by_vessel()
RETURNS TABLE (
  vessel TEXT,
  category TEXT,
  incidents_total BIGINT,
  incidents_repeated BIGINT,
  effectiveness_percent NUMERIC,
  avg_resolution_days NUMERIC
) 
LANGUAGE SQL
STABLE
AS $$
  SELECT
    vessel,
    sgso_category as category,
    COUNT(*) as incidents_total,
    SUM(CASE WHEN repeated = true THEN 1 ELSE 0 END) as incidents_repeated,
    ROUND(
      100 - (
        COALESCE(SUM(CASE WHEN repeated = true THEN 1 ELSE 0 END)::NUMERIC, 0) / 
        NULLIF(COUNT(*)::NUMERIC, 0) * 100
      ),
      1
    ) as effectiveness_percent,
    ROUND(
      AVG(
        CASE 
          WHEN resolved_at IS NOT NULL AND incident_date IS NOT NULL 
          THEN EXTRACT(EPOCH FROM (resolved_at - incident_date)) / 86400
          ELSE NULL
        END
      ),
      1
    ) as avg_resolution_days
  FROM dp_incidents
  WHERE sgso_category IS NOT NULL
  GROUP BY vessel, sgso_category
  ORDER BY vessel, category;
$$;

COMMENT ON FUNCTION calculate_sgso_effectiveness_by_vessel IS 'Calcula métricas de efetividade por embarcação e categoria SGSO';

-- ===========================
-- Update sample data with SGSO categories
-- ===========================
UPDATE dp_incidents
SET 
  sgso_category = CASE
    WHEN title ILIKE '%gyro%' OR title ILIKE '%sensor%' THEN 'Falha técnica'
    WHEN title ILIKE '%software%' OR title ILIKE '%pms%' THEN 'Falha técnica'
    WHEN title ILIKE '%reference%' OR title ILIKE '%dgps%' THEN 'Falha técnica'
    WHEN title ILIKE '%calibration%' THEN 'Falha organizacional'
    WHEN title ILIKE '%thruster%' AND title ILIKE '%performance%' THEN 'Falha técnica'
    ELSE 'Erro humano'
  END,
  action_plan_date = incident_date + INTERVAL '1 day',
  resolved_at = CASE 
    WHEN status = 'analyzed' THEN incident_date + INTERVAL '5 days'
    ELSE NULL
  END,
  repeated = CASE
    WHEN title ILIKE '%gyro%' AND vessel = 'DP Shuttle Tanker X' THEN false
    WHEN title ILIKE '%wind%' AND vessel = 'DP Shuttle Tanker X' THEN false
    ELSE false
  END
WHERE sgso_category IS NULL;
