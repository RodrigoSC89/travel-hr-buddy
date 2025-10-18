-- Create audit_predictions table for audit outcome simulation
CREATE TABLE IF NOT EXISTS audit_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID REFERENCES vessels(id) ON DELETE CASCADE,
  audit_type TEXT NOT NULL CHECK (audit_type IN ('Petrobras', 'IBAMA', 'ISO', 'IMCA', 'ISM', 'SGSO')),
  predicted_score DECIMAL(5,2) CHECK (predicted_score >= 0 AND predicted_score <= 100),
  confidence_level DECIMAL(5,2) CHECK (confidence_level >= 0 AND confidence_level <= 100),
  pass_probability DECIMAL(5,2) CHECK (pass_probability >= 0 AND pass_probability <= 100),
  compliance_areas JSONB,
  weaknesses JSONB,
  recommendations JSONB,
  readiness_status TEXT CHECK (readiness_status IN ('Ready', 'Needs_Improvement', 'Critical', 'Unknown')),
  prediction_date DATE NOT NULL,
  valid_until DATE NOT NULL,
  ai_generated BOOLEAN DEFAULT false,
  ai_model TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_audit_predictions_vessel ON audit_predictions(vessel_id);
CREATE INDEX IF NOT EXISTS idx_audit_predictions_audit_type ON audit_predictions(audit_type);
CREATE INDEX IF NOT EXISTS idx_audit_predictions_prediction_date ON audit_predictions(prediction_date);

-- Enable Row Level Security
ALTER TABLE audit_predictions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "audit_predictions_select_policy" ON audit_predictions
  FOR SELECT
  USING (true);

CREATE POLICY "audit_predictions_insert_policy" ON audit_predictions
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "audit_predictions_update_policy" ON audit_predictions
  FOR UPDATE
  USING (true);

CREATE POLICY "audit_predictions_delete_policy" ON audit_predictions
  FOR DELETE
  USING (true);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_audit_predictions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_audit_predictions_updated_at
  BEFORE UPDATE ON audit_predictions
  FOR EACH ROW
  EXECUTE FUNCTION update_audit_predictions_updated_at();

-- Add comment
COMMENT ON TABLE audit_predictions IS 'AI-powered audit outcome predictions for vessels';
