-- Create audit_predictions table for AI-generated audit simulations
CREATE TABLE IF NOT EXISTS audit_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID NOT NULL REFERENCES vessels(id) ON DELETE CASCADE,
  audit_type TEXT NOT NULL CHECK (audit_type IN ('Petrobras', 'IBAMA', 'ISO', 'IMCA', 'ISM', 'SGSO')),
  expected_score INTEGER NOT NULL CHECK (expected_score >= 0 AND expected_score <= 100),
  pass_probability TEXT NOT NULL CHECK (pass_probability IN ('Alta', 'Média', 'Baixa')),
  confidence_level INTEGER CHECK (confidence_level >= 0 AND confidence_level <= 100),
  weaknesses TEXT[] DEFAULT ARRAY[]::TEXT[],
  recommendations TEXT[] DEFAULT ARRAY[]::TEXT[],
  compliance_areas JSONB DEFAULT '{}'::jsonb,
  predicted_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  valid_until TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Expired', 'Confirmed', 'Rejected')),
  actual_score INTEGER CHECK (actual_score >= 0 AND actual_score <= 100),
  actual_result TEXT CHECK (actual_result IN ('Approved', 'Rejected', 'Conditional')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_audit_predictions_vessel_id ON audit_predictions(vessel_id);
CREATE INDEX IF NOT EXISTS idx_audit_predictions_audit_type ON audit_predictions(audit_type);
CREATE INDEX IF NOT EXISTS idx_audit_predictions_status ON audit_predictions(status);
CREATE INDEX IF NOT EXISTS idx_audit_predictions_predicted_date ON audit_predictions(predicted_date);
CREATE INDEX IF NOT EXISTS idx_audit_predictions_valid_until ON audit_predictions(valid_until);
CREATE INDEX IF NOT EXISTS idx_audit_predictions_pass_probability ON audit_predictions(pass_probability);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_audit_predictions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_audit_predictions_updated_at
  BEFORE UPDATE ON audit_predictions
  FOR EACH ROW
  EXECUTE FUNCTION update_audit_predictions_updated_at();

-- Enable Row Level Security
ALTER TABLE audit_predictions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Allow authenticated users to read all audit predictions
CREATE POLICY "Allow authenticated users to view audit predictions"
  ON audit_predictions
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow service role to insert predictions (for API)
CREATE POLICY "Allow service role to insert audit predictions"
  ON audit_predictions
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Allow service role to update predictions
CREATE POLICY "Allow service role to update audit predictions"
  ON audit_predictions
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to update predictions
CREATE POLICY "Allow authenticated users to update audit predictions"
  ON audit_predictions
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Comment on table
COMMENT ON TABLE audit_predictions IS 'Stores AI-generated audit simulations supporting 6 audit types (Petrobras, IBAMA, ISO, IMCA, ISM, SGSO). Predictions are valid for 30 days and include expected scores, probabilities, weaknesses, and recommendations.';
