-- Create function to get compliance statistics by vessel
-- Returns aggregated plan status counts per vessel

CREATE OR REPLACE FUNCTION get_dp_conformidade_por_navio()
RETURNS TABLE (
  vessel TEXT,
  total BIGINT,
  concluido BIGINT,
  andamento BIGINT,
  pendente BIGINT
) 
LANGUAGE sql
STABLE
AS $$
  SELECT 
    COALESCE(vessel, 'Unknown') as vessel,
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE plan_status = 'concluído') as concluido,
    COUNT(*) FILTER (WHERE plan_status = 'em andamento') as andamento,
    COUNT(*) FILTER (WHERE plan_status = 'pendente') as pendente
  FROM dp_incidents
  WHERE vessel IS NOT NULL AND vessel != ''
  GROUP BY vessel
  ORDER BY vessel;
$$;

-- Add comment
COMMENT ON FUNCTION get_dp_conformidade_por_navio() IS 'Retorna estatísticas de conformidade de planos de ação agrupados por embarcação';
