-- Create audit_predictions table for AI-powered audit simulations
CREATE TABLE IF NOT EXISTS audit_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID REFERENCES vessels(id) ON DELETE CASCADE,
  audit_type TEXT NOT NULL CHECK (audit_type IN ('Petrobras', 'IBAMA', 'ISO', 'IMCA', 'ISM', 'SGSO')),
  expected_score INTEGER NOT NULL CHECK (expected_score >= 0 AND expected_score <= 100),
  probability TEXT NOT NULL CHECK (probability IN ('Alta', 'Média', 'Baixa')),
  compliance_areas JSONB, -- {area: score} for each compliance area
  weaknesses TEXT[], -- Array of identified weak points
  recommendations TEXT[], -- Array of recommended actions
  risk_factors TEXT[],
  ai_confidence NUMERIC(5, 2) CHECK (ai_confidence >= 0 AND ai_confidence <= 100),
  prediction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  valid_until DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '30 days'),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'validated')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create indexes for performance
CREATE INDEX idx_audit_predictions_vessel_id ON audit_predictions(vessel_id);
CREATE INDEX idx_audit_predictions_audit_type ON audit_predictions(audit_type);
CREATE INDEX idx_audit_predictions_status ON audit_predictions(status);
CREATE INDEX idx_audit_predictions_prediction_date ON audit_predictions(prediction_date);
CREATE INDEX idx_audit_predictions_probability ON audit_predictions(probability);

-- Enable Row Level Security
ALTER TABLE audit_predictions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "audit_predictions_select_policy" ON audit_predictions
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "audit_predictions_insert_policy" ON audit_predictions
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "audit_predictions_update_policy" ON audit_predictions
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "audit_predictions_delete_policy" ON audit_predictions
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Create function to get latest audit predictions
CREATE OR REPLACE FUNCTION get_latest_audit_predictions(vessel_uuid UUID DEFAULT NULL)
RETURNS TABLE (
  id UUID,
  vessel_id UUID,
  vessel_name TEXT,
  audit_type TEXT,
  expected_score INTEGER,
  probability TEXT,
  compliance_areas JSONB,
  weaknesses TEXT[],
  recommendations TEXT[],
  ai_confidence NUMERIC,
  prediction_date DATE,
  valid_until DATE
) AS $$
BEGIN
  RETURN QUERY
  WITH ranked_predictions AS (
    SELECT
      ap.*,
      v.name AS vessel_name,
      ROW_NUMBER() OVER (
        PARTITION BY ap.vessel_id, ap.audit_type 
        ORDER BY ap.prediction_date DESC
      ) AS rn
    FROM audit_predictions ap
    LEFT JOIN vessels v ON ap.vessel_id = v.id
    WHERE ap.status = 'active'
      AND ap.valid_until >= CURRENT_DATE
      AND (vessel_uuid IS NULL OR ap.vessel_id = vessel_uuid)
  )
  SELECT
    rp.id,
    rp.vessel_id,
    rp.vessel_name,
    rp.audit_type,
    rp.expected_score,
    rp.probability,
    rp.compliance_areas,
    rp.weaknesses,
    rp.recommendations,
    rp.ai_confidence,
    rp.prediction_date,
    rp.valid_until
  FROM ranked_predictions rp
  WHERE rp.rn = 1
  ORDER BY rp.vessel_name, rp.audit_type;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get audit readiness summary
CREATE OR REPLACE FUNCTION get_audit_readiness_summary(vessel_uuid UUID DEFAULT NULL)
RETURNS TABLE (
  vessel_id UUID,
  vessel_name TEXT,
  audit_type TEXT,
  expected_score INTEGER,
  probability TEXT,
  readiness_status TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH latest_predictions AS (
    SELECT
      ap.vessel_id,
      v.name AS vessel_name,
      ap.audit_type,
      ap.expected_score,
      ap.probability,
      ROW_NUMBER() OVER (
        PARTITION BY ap.vessel_id, ap.audit_type 
        ORDER BY ap.prediction_date DESC
      ) AS rn
    FROM audit_predictions ap
    LEFT JOIN vessels v ON ap.vessel_id = v.id
    WHERE ap.status = 'active'
      AND ap.valid_until >= CURRENT_DATE
      AND (vessel_uuid IS NULL OR ap.vessel_id = vessel_uuid)
  )
  SELECT
    lp.vessel_id,
    lp.vessel_name,
    lp.audit_type,
    lp.expected_score,
    lp.probability,
    CASE
      WHEN lp.expected_score >= 85 AND lp.probability = 'Alta' THEN 'Excellent'
      WHEN lp.expected_score >= 70 THEN 'Good'
      WHEN lp.expected_score >= 60 THEN 'Fair'
      ELSE 'Needs Improvement'
    END AS readiness_status
  FROM latest_predictions lp
  WHERE lp.rn = 1
  ORDER BY lp.vessel_name, lp.audit_type;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_audit_predictions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_predictions_updated_at_trigger
  BEFORE UPDATE ON audit_predictions
  FOR EACH ROW
  EXECUTE FUNCTION update_audit_predictions_updated_at();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON audit_predictions TO authenticated;
GRANT EXECUTE ON FUNCTION get_latest_audit_predictions(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_audit_readiness_summary(UUID) TO authenticated;
