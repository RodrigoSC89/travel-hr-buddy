-- Add effectiveness tracking fields to dp_incidents table
-- This migration adds fields needed to track SGSO action plan effectiveness

-- Add sgso_category column with check constraint
ALTER TABLE dp_incidents 
ADD COLUMN IF NOT EXISTS sgso_category TEXT 
CHECK (sgso_category IN ('Erro humano', 'Falha técnica', 'Comunicação', 'Falha organizacional'));

-- Add action plan date tracking
ALTER TABLE dp_incidents 
ADD COLUMN IF NOT EXISTS action_plan_date TIMESTAMP WITH TIME ZONE;

-- Add resolution date tracking
ALTER TABLE dp_incidents 
ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMP WITH TIME ZONE;

-- Add repeated incident flag
ALTER TABLE dp_incidents 
ADD COLUMN IF NOT EXISTS repeated BOOLEAN DEFAULT false;

-- Create index for faster queries on sgso_category
CREATE INDEX IF NOT EXISTS idx_dp_incidents_sgso_category ON dp_incidents(sgso_category);

-- Create index for effectiveness queries
CREATE INDEX IF NOT EXISTS idx_dp_incidents_resolved_at ON dp_incidents(resolved_at);

-- Function to calculate SGSO effectiveness by category
CREATE OR REPLACE FUNCTION calculate_sgso_effectiveness()
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
    sgso_category as category,
    COUNT(*) as total_incidents,
    COUNT(*) FILTER (WHERE repeated = true) as repeated_incidents,
    CASE 
      WHEN COUNT(*) > 0 THEN 
        ROUND(100 - (COUNT(*) FILTER (WHERE repeated = true)::NUMERIC / COUNT(*)::NUMERIC * 100), 2)
      ELSE 0
    END as effectiveness_percentage,
    CASE
      WHEN COUNT(*) FILTER (WHERE resolved_at IS NOT NULL AND action_plan_date IS NOT NULL) > 0 THEN
        ROUND(AVG(EXTRACT(EPOCH FROM (resolved_at - action_plan_date)) / 86400) 
          FILTER (WHERE resolved_at IS NOT NULL AND action_plan_date IS NOT NULL), 1)
      ELSE NULL
    END as avg_resolution_days
  FROM dp_incidents
  WHERE sgso_category IS NOT NULL
  GROUP BY sgso_category
  ORDER BY category;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate SGSO effectiveness by vessel
CREATE OR REPLACE FUNCTION calculate_sgso_effectiveness_by_vessel()
RETURNS TABLE (
  vessel_name TEXT,
  category TEXT,
  total_incidents BIGINT,
  repeated_incidents BIGINT,
  effectiveness_percentage NUMERIC,
  avg_resolution_days NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(vessel, 'Unknown') as vessel_name,
    sgso_category as category,
    COUNT(*) as total_incidents,
    COUNT(*) FILTER (WHERE repeated = true) as repeated_incidents,
    CASE 
      WHEN COUNT(*) > 0 THEN 
        ROUND(100 - (COUNT(*) FILTER (WHERE repeated = true)::NUMERIC / COUNT(*)::NUMERIC * 100), 2)
      ELSE 0
    END as effectiveness_percentage,
    CASE
      WHEN COUNT(*) FILTER (WHERE resolved_at IS NOT NULL AND action_plan_date IS NOT NULL) > 0 THEN
        ROUND(AVG(EXTRACT(EPOCH FROM (resolved_at - action_plan_date)) / 86400) 
          FILTER (WHERE resolved_at IS NOT NULL AND action_plan_date IS NOT NULL), 1)
      ELSE NULL
    END as avg_resolution_days
  FROM dp_incidents
  WHERE sgso_category IS NOT NULL
  GROUP BY vessel, sgso_category
  ORDER BY vessel_name, category;
END;
$$ LANGUAGE plpgsql;

-- Add comments for documentation
COMMENT ON COLUMN dp_incidents.sgso_category IS 'SGSO category classification: Erro humano, Falha técnica, Comunicação, Falha organizacional';
COMMENT ON COLUMN dp_incidents.action_plan_date IS 'Date when action plan was created for this incident';
COMMENT ON COLUMN dp_incidents.resolved_at IS 'Date when incident was fully resolved';
COMMENT ON COLUMN dp_incidents.repeated IS 'Flag indicating if this is a repeated incident in the same category';
COMMENT ON FUNCTION calculate_sgso_effectiveness() IS 'Calculates effectiveness metrics by SGSO category';
COMMENT ON FUNCTION calculate_sgso_effectiveness_by_vessel() IS 'Calculates effectiveness metrics by vessel and SGSO category';
