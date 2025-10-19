-- ===========================
-- SGSO Effectiveness Calculation Functions
-- Functions to calculate effectiveness metrics by category and vessel
-- ===========================

-- Function to calculate SGSO effectiveness by category
CREATE OR REPLACE FUNCTION public.calculate_sgso_effectiveness_by_category()
RETURNS TABLE (
  category TEXT,
  total_incidents BIGINT,
  repeated_incidents BIGINT,
  effectiveness_percentage NUMERIC,
  avg_resolution_days NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    si.sgso_category as category,
    COUNT(*) as total_incidents,
    COUNT(*) FILTER (WHERE si.repeated = true) as repeated_incidents,
    CASE 
      WHEN COUNT(*) > 0 THEN 
        ROUND(100 - (COUNT(*) FILTER (WHERE si.repeated = true)::NUMERIC / COUNT(*)::NUMERIC * 100), 2)
      ELSE 0
    END as effectiveness_percentage,
    ROUND(
      AVG(
        CASE 
          WHEN si.resolved_at IS NOT NULL AND si.created_at IS NOT NULL THEN 
            EXTRACT(EPOCH FROM (si.resolved_at - si.created_at)) / 86400
          ELSE NULL
        END
      ), 2
    ) as avg_resolution_days
  FROM public.sgso_incidents si
  WHERE si.sgso_category IS NOT NULL
  GROUP BY si.sgso_category
  ORDER BY effectiveness_percentage DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Function to calculate SGSO effectiveness by vessel
CREATE OR REPLACE FUNCTION public.calculate_sgso_effectiveness_by_vessel()
RETURNS TABLE (
  vessel_id UUID,
  vessel_name TEXT,
  total_incidents BIGINT,
  repeated_incidents BIGINT,
  effectiveness_percentage NUMERIC,
  avg_resolution_days NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    si.vessel_id,
    v.name as vessel_name,
    COUNT(*) as total_incidents,
    COUNT(*) FILTER (WHERE si.repeated = true) as repeated_incidents,
    CASE 
      WHEN COUNT(*) > 0 THEN 
        ROUND(100 - (COUNT(*) FILTER (WHERE si.repeated = true)::NUMERIC / COUNT(*)::NUMERIC * 100), 2)
      ELSE 0
    END as effectiveness_percentage,
    ROUND(
      AVG(
        CASE 
          WHEN si.resolved_at IS NOT NULL AND si.created_at IS NOT NULL THEN 
            EXTRACT(EPOCH FROM (si.resolved_at - si.created_at)) / 86400
          ELSE NULL
        END
      ), 2
    ) as avg_resolution_days
  FROM public.sgso_incidents si
  LEFT JOIN public.vessels v ON si.vessel_id = v.id
  WHERE si.vessel_id IS NOT NULL
  GROUP BY si.vessel_id, v.name
  ORDER BY effectiveness_percentage DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.calculate_sgso_effectiveness_by_category() TO authenticated;
GRANT EXECUTE ON FUNCTION public.calculate_sgso_effectiveness_by_vessel() TO authenticated;

-- Add comments
COMMENT ON FUNCTION public.calculate_sgso_effectiveness_by_category() IS 'Calculates SGSO effectiveness metrics grouped by incident category';
COMMENT ON FUNCTION public.calculate_sgso_effectiveness_by_vessel() IS 'Calculates SGSO effectiveness metrics grouped by vessel';
