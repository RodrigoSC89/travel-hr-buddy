-- ===========================
-- SGSO Effectiveness Tracking Enhancement
-- Add fields needed for action plan effectiveness monitoring
-- ===========================

-- Add fields to safety_incidents table for effectiveness tracking
ALTER TABLE public.safety_incidents 
  ADD COLUMN IF NOT EXISTS sgso_category TEXT,
  ADD COLUMN IF NOT EXISTS action_plan_date TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS repeated BOOLEAN DEFAULT false;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_safety_incidents_sgso_category ON public.safety_incidents(sgso_category);
CREATE INDEX IF NOT EXISTS idx_safety_incidents_resolved_at ON public.safety_incidents(resolved_at);
CREATE INDEX IF NOT EXISTS idx_safety_incidents_repeated ON public.safety_incidents(repeated);

-- Add comments for documentation
COMMENT ON COLUMN public.safety_incidents.sgso_category IS 'Categoria SGSO do incidente (ex: Erro humano, Falha técnica, Comunicação, Falha organizacional)';
COMMENT ON COLUMN public.safety_incidents.action_plan_date IS 'Data em que o plano de ação foi criado';
COMMENT ON COLUMN public.safety_incidents.resolved_at IS 'Data em que o incidente foi completamente resolvido';
COMMENT ON COLUMN public.safety_incidents.repeated IS 'Indica se o incidente é uma reincidência';

-- Create function to calculate SGSO effectiveness metrics
CREATE OR REPLACE FUNCTION calculate_sgso_effectiveness()
RETURNS TABLE (
  category TEXT,
  incidents_total BIGINT,
  incidents_repeated BIGINT,
  effectiveness_percent NUMERIC,
  avg_resolution_days NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(sgso_category, 'Não Classificado') as category,
    COUNT(*) as incidents_total,
    SUM(CASE WHEN repeated = true THEN 1 ELSE 0 END) as incidents_repeated,
    CASE 
      WHEN COUNT(*) = 0 THEN 0
      ELSE ROUND(100 - (SUM(CASE WHEN repeated = true THEN 1 ELSE 0 END)::NUMERIC / COUNT(*) * 100), 2)
    END as effectiveness_percent,
    CASE 
      WHEN COUNT(CASE WHEN resolved_at IS NOT NULL THEN 1 END) = 0 THEN NULL
      ELSE ROUND(AVG(
        CASE 
          WHEN resolved_at IS NOT NULL THEN EXTRACT(day FROM (resolved_at - created_at))
          ELSE NULL
        END
      ), 2)
    END as avg_resolution_days
  FROM public.safety_incidents
  WHERE status IN ('resolved', 'closed')
  GROUP BY sgso_category;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION calculate_sgso_effectiveness() TO authenticated;

-- Create function to get effectiveness by vessel
CREATE OR REPLACE FUNCTION calculate_sgso_effectiveness_by_vessel()
RETURNS TABLE (
  vessel_name TEXT,
  category TEXT,
  incidents_total BIGINT,
  incidents_repeated BIGINT,
  effectiveness_percent NUMERIC,
  avg_resolution_days NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(v.name, 'Não Especificado') as vessel_name,
    COALESCE(si.sgso_category, 'Não Classificado') as category,
    COUNT(*) as incidents_total,
    SUM(CASE WHEN si.repeated = true THEN 1 ELSE 0 END) as incidents_repeated,
    CASE 
      WHEN COUNT(*) = 0 THEN 0
      ELSE ROUND(100 - (SUM(CASE WHEN si.repeated = true THEN 1 ELSE 0 END)::NUMERIC / COUNT(*) * 100), 2)
    END as effectiveness_percent,
    CASE 
      WHEN COUNT(CASE WHEN si.resolved_at IS NOT NULL THEN 1 END) = 0 THEN NULL
      ELSE ROUND(AVG(
        CASE 
          WHEN si.resolved_at IS NOT NULL THEN EXTRACT(day FROM (si.resolved_at - si.created_at))
          ELSE NULL
        END
      ), 2)
    END as avg_resolution_days
  FROM public.safety_incidents si
  LEFT JOIN public.vessels v ON si.vessel_id = v.id
  WHERE si.status IN ('resolved', 'closed')
  GROUP BY v.name, si.sgso_category;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION calculate_sgso_effectiveness_by_vessel() TO authenticated;

-- Add table comment
COMMENT ON FUNCTION calculate_sgso_effectiveness() IS 'Calcula métricas de efetividade dos planos de ação SGSO por categoria';
COMMENT ON FUNCTION calculate_sgso_effectiveness_by_vessel() IS 'Calcula métricas de efetividade dos planos de ação SGSO por embarcação e categoria';
