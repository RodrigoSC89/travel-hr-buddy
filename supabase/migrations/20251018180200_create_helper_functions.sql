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
  open_risks INTEGER,
  avg_probability DECIMAL,
  avg_impact DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    v.id AS vessel_id,
    v.name AS vessel_name,
    COUNT(tr.id)::INTEGER AS total_risks,
    COUNT(tr.id) FILTER (WHERE tr.severity = 'Critical')::INTEGER AS critical_count,
    COUNT(tr.id) FILTER (WHERE tr.severity = 'High')::INTEGER AS high_count,
    COUNT(tr.id) FILTER (WHERE tr.severity = 'Medium')::INTEGER AS medium_count,
    COUNT(tr.id) FILTER (WHERE tr.severity = 'Low')::INTEGER AS low_count,
    COUNT(tr.id) FILTER (WHERE tr.status = 'open')::INTEGER AS open_risks,
    AVG(tr.probability) AS avg_probability,
    AVG(tr.impact_score) AS avg_impact
  FROM vessels v
  LEFT JOIN tactical_risks tr ON v.id = tr.vessel_id
  WHERE (p_vessel_id IS NULL OR v.id = p_vessel_id)
  GROUP BY v.id, v.name;
END;
$$ LANGUAGE plpgsql;

-- Helper function: get_latest_audit_predictions
-- Retrieves current predictions
CREATE OR REPLACE FUNCTION get_latest_audit_predictions(p_vessel_id UUID DEFAULT NULL)
RETURNS TABLE (
  vessel_id UUID,
  vessel_name TEXT,
  audit_type TEXT,
  predicted_score DECIMAL,
  confidence_level DECIMAL,
  pass_probability DECIMAL,
  readiness_status TEXT,
  prediction_date DATE,
  valid_until DATE
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT ON (v.id, ap.audit_type)
    v.id AS vessel_id,
    v.name AS vessel_name,
    ap.audit_type,
    ap.predicted_score,
    ap.confidence_level,
    ap.pass_probability,
    ap.readiness_status,
    ap.prediction_date,
    ap.valid_until
  FROM vessels v
  LEFT JOIN audit_predictions ap ON v.id = ap.vessel_id
  WHERE (p_vessel_id IS NULL OR v.id = p_vessel_id)
    AND (ap.valid_until IS NULL OR ap.valid_until >= CURRENT_DATE)
  ORDER BY v.id, ap.audit_type, ap.prediction_date DESC;
END;
$$ LANGUAGE plpgsql;

-- Helper function: get_audit_readiness_summary
-- Overall readiness assessment
CREATE OR REPLACE FUNCTION get_audit_readiness_summary(p_vessel_id UUID DEFAULT NULL)
RETURNS TABLE (
  vessel_id UUID,
  vessel_name TEXT,
  total_predictions INTEGER,
  ready_count INTEGER,
  needs_improvement_count INTEGER,
  critical_count INTEGER,
  avg_predicted_score DECIMAL,
  avg_confidence DECIMAL,
  avg_pass_probability DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    v.id AS vessel_id,
    v.name AS vessel_name,
    COUNT(ap.id)::INTEGER AS total_predictions,
    COUNT(ap.id) FILTER (WHERE ap.readiness_status = 'Ready')::INTEGER AS ready_count,
    COUNT(ap.id) FILTER (WHERE ap.readiness_status = 'Needs_Improvement')::INTEGER AS needs_improvement_count,
    COUNT(ap.id) FILTER (WHERE ap.readiness_status = 'Critical')::INTEGER AS critical_count,
    AVG(ap.predicted_score) AS avg_predicted_score,
    AVG(ap.confidence_level) AS avg_confidence,
    AVG(ap.pass_probability) AS avg_pass_probability
  FROM vessels v
  LEFT JOIN audit_predictions ap ON v.id = ap.vessel_id
  WHERE (p_vessel_id IS NULL OR v.id = p_vessel_id)
    AND (ap.valid_until IS NULL OR ap.valid_until >= CURRENT_DATE)
  GROUP BY v.id, v.name;
END;
$$ LANGUAGE plpgsql;

-- Add comments
COMMENT ON FUNCTION get_vessel_risk_summary IS 'Aggregates risk metrics by vessel';
COMMENT ON FUNCTION get_latest_audit_predictions IS 'Retrieves current audit predictions';
COMMENT ON FUNCTION get_audit_readiness_summary IS 'Overall audit readiness assessment';
