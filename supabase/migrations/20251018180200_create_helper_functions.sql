-- ===========================
-- Helper Functions for Tactical Risks & Audit Predictions
-- Database functions to aggregate and analyze risk and audit data
-- ===========================

-- Function 1: Get vessel risk summary
CREATE OR REPLACE FUNCTION get_vessel_risk_summary(p_vessel_id TEXT DEFAULT NULL)
RETURNS TABLE (
  vessel_id TEXT,
  total_risks INTEGER,
  critical_risks INTEGER,
  high_risks INTEGER,
  medium_risks INTEGER,
  low_risks INTEGER,
  pending_risks INTEGER,
  assigned_risks INTEGER,
  mitigated_risks INTEGER,
  avg_confidence_score NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    tr.vessel_id,
    COUNT(*)::INTEGER AS total_risks,
    COUNT(*) FILTER (WHERE tr.severity = 'critical')::INTEGER AS critical_risks,
    COUNT(*) FILTER (WHERE tr.severity = 'high')::INTEGER AS high_risks,
    COUNT(*) FILTER (WHERE tr.severity = 'medium')::INTEGER AS medium_risks,
    COUNT(*) FILTER (WHERE tr.severity = 'low')::INTEGER AS low_risks,
    COUNT(*) FILTER (WHERE tr.status = 'pending')::INTEGER AS pending_risks,
    COUNT(*) FILTER (WHERE tr.status = 'assigned')::INTEGER AS assigned_risks,
    COUNT(*) FILTER (WHERE tr.status = 'mitigated')::INTEGER AS mitigated_risks,
    ROUND(AVG(tr.confidence_score), 2) AS avg_confidence_score
  FROM public.tactical_risks tr
  WHERE (p_vessel_id IS NULL OR tr.vessel_id = p_vessel_id)
    AND tr.forecast_date >= CURRENT_DATE
  GROUP BY tr.vessel_id;
END;
$$ LANGUAGE plpgsql;

-- Function 2: Get latest audit predictions
CREATE OR REPLACE FUNCTION get_latest_audit_predictions(p_vessel_id TEXT DEFAULT NULL)
RETURNS TABLE (
  vessel_id TEXT,
  audit_type TEXT,
  predicted_score INTEGER,
  pass_probability NUMERIC,
  readiness_level TEXT,
  weaknesses JSONB,
  recommendations JSONB,
  simulated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT ON (ap.vessel_id, ap.audit_type)
    ap.vessel_id,
    ap.audit_type,
    ap.predicted_score,
    ap.pass_probability,
    ap.readiness_level,
    ap.weaknesses,
    ap.recommendations,
    ap.simulated_at
  FROM public.audit_predictions ap
  WHERE (p_vessel_id IS NULL OR ap.vessel_id = p_vessel_id)
  ORDER BY ap.vessel_id, ap.audit_type, ap.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function 3: Get audit readiness summary
CREATE OR REPLACE FUNCTION get_audit_readiness_summary(p_vessel_id TEXT DEFAULT NULL)
RETURNS TABLE (
  vessel_id TEXT,
  total_audits INTEGER,
  avg_predicted_score NUMERIC,
  avg_pass_probability NUMERIC,
  excellent_readiness INTEGER,
  high_readiness INTEGER,
  medium_readiness INTEGER,
  low_readiness INTEGER,
  petrobras_score INTEGER,
  ibama_score INTEGER,
  iso_score INTEGER,
  imca_score INTEGER,
  ism_score INTEGER,
  sgso_score INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH latest_predictions AS (
    SELECT DISTINCT ON (vessel_id, audit_type)
      vessel_id,
      audit_type,
      predicted_score,
      pass_probability,
      readiness_level
    FROM public.audit_predictions
    WHERE (p_vessel_id IS NULL OR vessel_id = p_vessel_id)
    ORDER BY vessel_id, audit_type, created_at DESC
  )
  SELECT 
    lp.vessel_id,
    COUNT(*)::INTEGER AS total_audits,
    ROUND(AVG(lp.predicted_score), 0) AS avg_predicted_score,
    ROUND(AVG(lp.pass_probability), 2) AS avg_pass_probability,
    COUNT(*) FILTER (WHERE lp.readiness_level = 'excellent')::INTEGER AS excellent_readiness,
    COUNT(*) FILTER (WHERE lp.readiness_level = 'high')::INTEGER AS high_readiness,
    COUNT(*) FILTER (WHERE lp.readiness_level = 'medium')::INTEGER AS medium_readiness,
    COUNT(*) FILTER (WHERE lp.readiness_level = 'low')::INTEGER AS low_readiness,
    MAX(CASE WHEN lp.audit_type = 'petrobras' THEN lp.predicted_score END)::INTEGER AS petrobras_score,
    MAX(CASE WHEN lp.audit_type = 'ibama' THEN lp.predicted_score END)::INTEGER AS ibama_score,
    MAX(CASE WHEN lp.audit_type = 'iso' THEN lp.predicted_score END)::INTEGER AS iso_score,
    MAX(CASE WHEN lp.audit_type = 'imca' THEN lp.predicted_score END)::INTEGER AS imca_score,
    MAX(CASE WHEN lp.audit_type = 'ism' THEN lp.predicted_score END)::INTEGER AS ism_score,
    MAX(CASE WHEN lp.audit_type = 'sgso' THEN lp.predicted_score END)::INTEGER AS sgso_score
  FROM latest_predictions lp
  GROUP BY lp.vessel_id;
END;
$$ LANGUAGE plpgsql;

-- Add comments for documentation
COMMENT ON FUNCTION get_vessel_risk_summary IS 'Aggregates risk metrics by vessel, showing counts by severity and status';
COMMENT ON FUNCTION get_latest_audit_predictions IS 'Retrieves the most recent audit prediction for each vessel and audit type';
COMMENT ON FUNCTION get_audit_readiness_summary IS 'Provides overall audit readiness assessment with scores by audit type';
