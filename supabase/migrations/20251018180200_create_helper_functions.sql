-- Helper function: get_vessel_risk_summary
-- Aggregates risk metrics by vessel
CREATE OR REPLACE FUNCTION get_vessel_risk_summary(p_vessel_id UUID DEFAULT NULL)
RETURNS TABLE (
  vessel_id UUID,
  vessel_name TEXT,
  total_risks INTEGER,
  critical_count INTEGER,
  high_count INTEGER,
  medium_count INTEGER,
  low_count INTEGER,
  active_risks INTEGER,
  unassigned_risks INTEGER,
  last_update TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    v.id AS vessel_id,
    v.name AS vessel_name,
    COUNT(tr.id)::INTEGER AS total_risks,
    COUNT(CASE WHEN tr.risk_level = 'Critical' THEN 1 END)::INTEGER AS critical_count,
    COUNT(CASE WHEN tr.risk_level = 'High' THEN 1 END)::INTEGER AS high_count,
    COUNT(CASE WHEN tr.risk_level = 'Medium' THEN 1 END)::INTEGER AS medium_count,
    COUNT(CASE WHEN tr.risk_level = 'Low' THEN 1 END)::INTEGER AS low_count,
    COUNT(CASE WHEN tr.status = 'active' THEN 1 END)::INTEGER AS active_risks,
    COUNT(CASE WHEN tr.assigned_to IS NULL AND tr.status = 'active' THEN 1 END)::INTEGER AS unassigned_risks,
    MAX(tr.updated_at) AS last_update
  FROM public.vessels v
  LEFT JOIN public.tactical_risks tr ON v.id = tr.vessel_id
  WHERE (p_vessel_id IS NULL OR v.id = p_vessel_id)
    AND v.status = 'active'
  GROUP BY v.id, v.name
  ORDER BY critical_count DESC, high_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function: get_latest_audit_predictions
-- Retrieves current predictions for all vessels
CREATE OR REPLACE FUNCTION get_latest_audit_predictions(p_vessel_id UUID DEFAULT NULL)
RETURNS TABLE (
  id UUID,
  vessel_id UUID,
  vessel_name TEXT,
  audit_type TEXT,
  expected_score INTEGER,
  probability TEXT,
  confidence_level DECIMAL,
  weaknesses JSONB,
  recommendations JSONB,
  compliance_areas JSONB,
  predicted_date TIMESTAMP WITH TIME ZONE,
  valid_until TIMESTAMP WITH TIME ZONE,
  status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT ON (ap.vessel_id, ap.audit_type)
    ap.id,
    ap.vessel_id,
    v.name AS vessel_name,
    ap.audit_type,
    ap.expected_score,
    ap.probability,
    ap.confidence_level,
    ap.weaknesses,
    ap.recommendations,
    ap.compliance_areas,
    ap.predicted_date,
    ap.valid_until,
    ap.status
  FROM public.audit_predictions ap
  JOIN public.vessels v ON ap.vessel_id = v.id
  WHERE (p_vessel_id IS NULL OR ap.vessel_id = p_vessel_id)
    AND ap.status = 'active'
    AND ap.valid_until > NOW()
  ORDER BY ap.vessel_id, ap.audit_type, ap.predicted_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function: get_audit_readiness_summary
-- Overall readiness assessment
CREATE OR REPLACE FUNCTION get_audit_readiness_summary(p_vessel_id UUID DEFAULT NULL)
RETURNS TABLE (
  vessel_id UUID,
  vessel_name TEXT,
  audit_type TEXT,
  latest_score INTEGER,
  probability TEXT,
  risk_count INTEGER,
  critical_risks INTEGER,
  readiness_level TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH latest_predictions AS (
    SELECT DISTINCT ON (vessel_id, audit_type)
      vessel_id,
      audit_type,
      expected_score,
      probability
    FROM public.audit_predictions
    WHERE status = 'active'
      AND valid_until > NOW()
    ORDER BY vessel_id, audit_type, predicted_date DESC
  ),
  risk_summary AS (
    SELECT 
      vessel_id,
      COUNT(*)::INTEGER AS risk_count,
      COUNT(CASE WHEN risk_level = 'Critical' THEN 1 END)::INTEGER AS critical_risks
    FROM public.tactical_risks
    WHERE status = 'active'
    GROUP BY vessel_id
  )
  SELECT 
    v.id AS vessel_id,
    v.name AS vessel_name,
    lp.audit_type,
    lp.expected_score AS latest_score,
    lp.probability,
    COALESCE(rs.risk_count, 0) AS risk_count,
    COALESCE(rs.critical_risks, 0) AS critical_risks,
    CASE 
      WHEN lp.expected_score >= 85 AND lp.probability = 'Alta' THEN 'Excellent'
      WHEN lp.expected_score >= 75 AND lp.probability IN ('Alta', 'Média') THEN 'Good'
      WHEN lp.expected_score >= 60 THEN 'Fair'
      ELSE 'Needs Improvement'
    END AS readiness_level
  FROM public.vessels v
  LEFT JOIN latest_predictions lp ON v.id = lp.vessel_id
  LEFT JOIN risk_summary rs ON v.id = rs.vessel_id
  WHERE (p_vessel_id IS NULL OR v.id = p_vessel_id)
    AND v.status = 'active'
  ORDER BY v.name, lp.audit_type;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_vessel_risk_summary(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_latest_audit_predictions(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_audit_readiness_summary(UUID) TO authenticated;
