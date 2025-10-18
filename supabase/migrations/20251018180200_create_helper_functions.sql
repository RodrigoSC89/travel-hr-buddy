-- Helper function: Get vessel risk summary
-- Aggregates risk metrics by vessel
CREATE OR REPLACE FUNCTION get_vessel_risk_summary(p_vessel_id UUID DEFAULT NULL)
RETURNS TABLE (
  vessel_id UUID,
  vessel_name TEXT,
  total_risks BIGINT,
  critical_risks BIGINT,
  high_risks BIGINT,
  medium_risks BIGINT,
  low_risks BIGINT,
  active_risks BIGINT,
  avg_risk_score NUMERIC,
  last_prediction_date TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    v.id AS vessel_id,
    v.name AS vessel_name,
    COUNT(tr.id) AS total_risks,
    COUNT(tr.id) FILTER (WHERE tr.risk_level = 'Critical') AS critical_risks,
    COUNT(tr.id) FILTER (WHERE tr.risk_level = 'High') AS high_risks,
    COUNT(tr.id) FILTER (WHERE tr.risk_level = 'Medium') AS medium_risks,
    COUNT(tr.id) FILTER (WHERE tr.risk_level = 'Low') AS low_risks,
    COUNT(tr.id) FILTER (WHERE tr.status = 'Active') AS active_risks,
    COALESCE(AVG(tr.risk_score), 0)::NUMERIC AS avg_risk_score,
    MAX(tr.predicted_date) AS last_prediction_date
  FROM vessels v
  LEFT JOIN tactical_risks tr ON v.id = tr.vessel_id
  WHERE 
    (p_vessel_id IS NULL OR v.id = p_vessel_id)
    AND v.status = 'active'
  GROUP BY v.id, v.name
  ORDER BY critical_risks DESC, high_risks DESC, avg_risk_score DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comment on function
COMMENT ON FUNCTION get_vessel_risk_summary IS 'Aggregates tactical risk metrics by vessel. Can be filtered by vessel_id or return summary for all active vessels.';

-- Helper function: Get latest audit predictions
-- Retrieves current valid predictions
CREATE OR REPLACE FUNCTION get_latest_audit_predictions(p_vessel_id UUID DEFAULT NULL)
RETURNS TABLE (
  id UUID,
  vessel_id UUID,
  vessel_name TEXT,
  audit_type TEXT,
  expected_score INTEGER,
  pass_probability TEXT,
  confidence_level INTEGER,
  weaknesses TEXT[],
  recommendations TEXT[],
  compliance_areas JSONB,
  predicted_date TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
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
    ap.pass_probability,
    ap.confidence_level,
    ap.weaknesses,
    ap.recommendations,
    ap.compliance_areas,
    ap.predicted_date,
    ap.valid_until,
    ap.status
  FROM audit_predictions ap
  INNER JOIN vessels v ON ap.vessel_id = v.id
  WHERE 
    (p_vessel_id IS NULL OR ap.vessel_id = p_vessel_id)
    AND ap.status = 'Active'
    AND ap.valid_until > NOW()
    AND v.status = 'active'
  ORDER BY ap.vessel_id, ap.audit_type, ap.predicted_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comment on function
COMMENT ON FUNCTION get_latest_audit_predictions IS 'Retrieves the latest active audit predictions for each vessel and audit type. Can be filtered by vessel_id.';

-- Helper function: Get audit readiness summary
-- Overall readiness assessment across all vessels
CREATE OR REPLACE FUNCTION get_audit_readiness_summary()
RETURNS TABLE (
  audit_type TEXT,
  total_predictions BIGINT,
  avg_score NUMERIC,
  high_probability_count BIGINT,
  medium_probability_count BIGINT,
  low_probability_count BIGINT,
  vessels_ready BIGINT,
  vessels_at_risk BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ap.audit_type,
    COUNT(DISTINCT ap.id) AS total_predictions,
    COALESCE(AVG(ap.expected_score), 0)::NUMERIC AS avg_score,
    COUNT(DISTINCT ap.id) FILTER (WHERE ap.pass_probability = 'Alta') AS high_probability_count,
    COUNT(DISTINCT ap.id) FILTER (WHERE ap.pass_probability = 'Média') AS medium_probability_count,
    COUNT(DISTINCT ap.id) FILTER (WHERE ap.pass_probability = 'Baixa') AS low_probability_count,
    COUNT(DISTINCT ap.vessel_id) FILTER (WHERE ap.expected_score >= 70 AND ap.pass_probability IN ('Alta', 'Média')) AS vessels_ready,
    COUNT(DISTINCT ap.vessel_id) FILTER (WHERE ap.expected_score < 70 OR ap.pass_probability = 'Baixa') AS vessels_at_risk
  FROM audit_predictions ap
  INNER JOIN vessels v ON ap.vessel_id = v.id
  WHERE 
    ap.status = 'Active'
    AND ap.valid_until > NOW()
    AND v.status = 'active'
  GROUP BY ap.audit_type
  ORDER BY avg_score ASC, vessels_at_risk DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comment on function
COMMENT ON FUNCTION get_audit_readiness_summary IS 'Provides overall audit readiness assessment across all active vessels, grouped by audit type.';

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_vessel_risk_summary TO authenticated;
GRANT EXECUTE ON FUNCTION get_latest_audit_predictions TO authenticated;
GRANT EXECUTE ON FUNCTION get_audit_readiness_summary TO authenticated;
