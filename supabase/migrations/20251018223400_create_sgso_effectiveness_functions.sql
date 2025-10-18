-- Create PostgreSQL functions for SGSO effectiveness calculations

-- Function to calculate SGSO effectiveness by category
CREATE OR REPLACE FUNCTION calculate_sgso_effectiveness()
RETURNS TABLE (
  category TEXT,
  total_incidents BIGINT,
  repeated_incidents BIGINT,
  effectiveness_percentage NUMERIC,
  avg_resolution_days NUMERIC
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sgso_category AS category,
    COUNT(*) AS total_incidents,
    COUNT(*) FILTER (WHERE repeated = true) AS repeated_incidents,
    CASE 
      WHEN COUNT(*) > 0 THEN 
        ROUND(100 - (COUNT(*) FILTER (WHERE repeated = true)::NUMERIC / COUNT(*)::NUMERIC * 100), 2)
      ELSE 0
    END AS effectiveness_percentage,
    ROUND(AVG(
      CASE 
        WHEN resolved_at IS NOT NULL AND created_at IS NOT NULL THEN
          EXTRACT(EPOCH FROM (resolved_at - created_at)) / 86400
        ELSE NULL
      END
    ), 2) AS avg_resolution_days
  FROM dp_incidents
  WHERE sgso_category IS NOT NULL
  GROUP BY sgso_category
  ORDER BY category;
END;
$$;

-- Function to calculate SGSO effectiveness by vessel
CREATE OR REPLACE FUNCTION calculate_sgso_effectiveness_by_vessel()
RETURNS TABLE (
  vessel_name TEXT,
  category TEXT,
  total_incidents BIGINT,
  repeated_incidents BIGINT,
  effectiveness_percentage NUMERIC,
  avg_resolution_days NUMERIC
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(vessel, 'Unknown') AS vessel_name,
    sgso_category AS category,
    COUNT(*) AS total_incidents,
    COUNT(*) FILTER (WHERE repeated = true) AS repeated_incidents,
    CASE 
      WHEN COUNT(*) > 0 THEN 
        ROUND(100 - (COUNT(*) FILTER (WHERE repeated = true)::NUMERIC / COUNT(*)::NUMERIC * 100), 2)
      ELSE 0
    END AS effectiveness_percentage,
    ROUND(AVG(
      CASE 
        WHEN resolved_at IS NOT NULL AND created_at IS NOT NULL THEN
          EXTRACT(EPOCH FROM (resolved_at - created_at)) / 86400
        ELSE NULL
      END
    ), 2) AS avg_resolution_days
  FROM dp_incidents
  WHERE sgso_category IS NOT NULL
  GROUP BY vessel, sgso_category
  ORDER BY vessel_name, category;
END;
$$;

-- Add comments for documentation
COMMENT ON FUNCTION calculate_sgso_effectiveness() IS 'Calculates SGSO effectiveness metrics aggregated by category';
COMMENT ON FUNCTION calculate_sgso_effectiveness_by_vessel() IS 'Calculates SGSO effectiveness metrics aggregated by vessel and category';
