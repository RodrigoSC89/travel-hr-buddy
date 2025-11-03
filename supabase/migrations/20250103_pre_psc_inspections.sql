-- Pre-PSC Inspections Table
-- Stores Pre-Port State Control inspection records with digital signatures

-- Create the pre_psc_inspections table
CREATE TABLE IF NOT EXISTS pre_psc_inspections (
  id TEXT PRIMARY KEY,
  vessel_id UUID NOT NULL,
  inspector_name TEXT NOT NULL,
  inspection_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  findings JSONB NOT NULL DEFAULT '[]'::jsonb,
  recommendations JSONB NOT NULL DEFAULT '[]'::jsonb,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  signed_by TEXT NOT NULL,
  signature_hash TEXT NOT NULL,
  risk_flag BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add index on vessel_id for faster queries
CREATE INDEX IF NOT EXISTS idx_pre_psc_inspections_vessel_id ON pre_psc_inspections(vessel_id);

-- Add index on inspection_date for sorting
CREATE INDEX IF NOT EXISTS idx_pre_psc_inspections_date ON pre_psc_inspections(inspection_date DESC);

-- Add index on risk_flag for filtering critical inspections
CREATE INDEX IF NOT EXISTS idx_pre_psc_inspections_risk_flag ON pre_psc_inspections(risk_flag) WHERE risk_flag = true;

-- Enable Row Level Security
ALTER TABLE pre_psc_inspections ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view inspections for their vessel
CREATE POLICY "Users can view inspections for their vessel"
  ON pre_psc_inspections
  FOR SELECT
  USING (
    vessel_id IN (
      SELECT vessel_id FROM profiles WHERE id = auth.uid()
    )
  );

-- RLS Policy: Users can insert inspections for their vessel
CREATE POLICY "Users can insert inspections for their vessel"
  ON pre_psc_inspections
  FOR INSERT
  WITH CHECK (
    vessel_id IN (
      SELECT vessel_id FROM profiles WHERE id = auth.uid()
    )
  );

-- RLS Policy: Users can update inspections for their vessel
CREATE POLICY "Users can update inspections for their vessel"
  ON pre_psc_inspections
  FOR UPDATE
  USING (
    vessel_id IN (
      SELECT vessel_id FROM profiles WHERE id = auth.uid()
    )
  );

-- RLS Policy: Admins can view all inspections
CREATE POLICY "Admins can view all inspections"
  ON pre_psc_inspections
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_pre_psc_inspections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_pre_psc_inspections_updated_at
  BEFORE UPDATE ON pre_psc_inspections
  FOR EACH ROW
  EXECUTE FUNCTION update_pre_psc_inspections_updated_at();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON pre_psc_inspections TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Add comment to table
COMMENT ON TABLE pre_psc_inspections IS 'Pre-Port State Control inspection records with digital signatures and compliance scoring';

-- Add comments to columns
COMMENT ON COLUMN pre_psc_inspections.id IS 'Unique inspection identifier';
COMMENT ON COLUMN pre_psc_inspections.vessel_id IS 'Reference to vessel being inspected';
COMMENT ON COLUMN pre_psc_inspections.inspector_name IS 'Name of the inspector conducting the audit';
COMMENT ON COLUMN pre_psc_inspections.inspection_date IS 'Date and time of the inspection';
COMMENT ON COLUMN pre_psc_inspections.findings IS 'JSON array of inspection findings with status and severity';
COMMENT ON COLUMN pre_psc_inspections.recommendations IS 'JSON array of recommendations based on findings';
COMMENT ON COLUMN pre_psc_inspections.score IS 'Compliance score from 0 to 100';
COMMENT ON COLUMN pre_psc_inspections.signed_by IS 'Inspector who digitally signed the report';
COMMENT ON COLUMN pre_psc_inspections.signature_hash IS 'SHA-256 hash for digital signature validation';
COMMENT ON COLUMN pre_psc_inspections.risk_flag IS 'Flag indicating high or critical risk level';
