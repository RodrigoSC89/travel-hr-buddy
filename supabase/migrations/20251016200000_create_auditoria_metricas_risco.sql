-- ===========================
-- SGSO RISK METRICS RPC FUNCTION
-- Function to aggregate critical failures by vessel and month for SGSO dashboard
-- ===========================

-- Create RPC function to get audit risk metrics grouped by vessel and month
CREATE OR REPLACE FUNCTION public.auditoria_metricas_risco()
RETURNS TABLE (
  embarcacao TEXT,
  mes TEXT,
  falhas_criticas BIGINT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(v.name, 'Sem Embarcação') as embarcacao,
    TO_CHAR(si.incident_date, 'YYYY-MM') as mes,
    COUNT(*)::BIGINT as falhas_criticas
  FROM public.safety_incidents si
  LEFT JOIN public.vessels v ON v.id = si.vessel_id
  WHERE si.severity IN ('critical', 'high')
    AND si.incident_date >= NOW() - INTERVAL '12 months'
  GROUP BY embarcacao, mes
  ORDER BY mes DESC, embarcacao;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.auditoria_metricas_risco() TO authenticated;

-- Add comment
COMMENT ON FUNCTION public.auditoria_metricas_risco() IS 'Retorna métricas de risco agrupadas por embarcação e mês para o painel SGSO';
