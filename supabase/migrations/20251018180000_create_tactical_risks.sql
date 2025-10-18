-- Create tactical_risks table for AI-predicted operational risks
CREATE TABLE IF NOT EXISTS tactical_risks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID NOT NULL REFERENCES vessels(id) ON DELETE CASCADE,
  risk_category TEXT NOT NULL CHECK (risk_category IN ('DP', 'Energia', 'SGSO', 'Comunicações', 'Navegação', 'Máquinas', 'Segurança')),
  risk_type TEXT NOT NULL CHECK (risk_type IN ('Failure', 'Intermittency', 'Delay', 'Degradation', 'Normal')),
  risk_score INTEGER NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
  risk_level TEXT GENERATED ALWAYS AS (
    CASE 
      WHEN risk_score >= 80 THEN 'Critical'
      WHEN risk_score >= 60 THEN 'High'
      WHEN risk_score >= 40 THEN 'Medium'
      ELSE 'Low'
    END
  ) STORED,
  description TEXT NOT NULL,
  predicted_date TIMESTAMPTZ NOT NULL,
  valid_until TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '15 days'),
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Resolved', 'Expired', 'Mitigated')),
  recommended_actions TEXT[],
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_tactical_risks_vessel_id ON tactical_risks(vessel_id);
CREATE INDEX IF NOT EXISTS idx_tactical_risks_risk_level ON tactical_risks(risk_level);
CREATE INDEX IF NOT EXISTS idx_tactical_risks_status ON tactical_risks(status);
CREATE INDEX IF NOT EXISTS idx_tactical_risks_predicted_date ON tactical_risks(predicted_date);
CREATE INDEX IF NOT EXISTS idx_tactical_risks_valid_until ON tactical_risks(valid_until);
CREATE INDEX IF NOT EXISTS idx_tactical_risks_assigned_to ON tactical_risks(assigned_to);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_tactical_risks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_tactical_risks_updated_at
  BEFORE UPDATE ON tactical_risks
  FOR EACH ROW
  EXECUTE FUNCTION update_tactical_risks_updated_at();

-- Enable Row Level Security
ALTER TABLE tactical_risks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Allow authenticated users to read all risks
CREATE POLICY "Allow authenticated users to view tactical risks"
  ON tactical_risks
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow service role to insert risks (for API and cron jobs)
CREATE POLICY "Allow service role to insert tactical risks"
  ON tactical_risks
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Allow service role to update risks
CREATE POLICY "Allow service role to update tactical risks"
  ON tactical_risks
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to update risks they are assigned to
CREATE POLICY "Allow users to update assigned tactical risks"
  ON tactical_risks
  FOR UPDATE
  TO authenticated
  USING (assigned_to = auth.uid())
  WITH CHECK (assigned_to = auth.uid());

-- Comment on table
COMMENT ON TABLE tactical_risks IS 'Stores AI-predicted operational risks by vessel and system. Predictions are valid for 15 days and can be assigned to team members for action.';
