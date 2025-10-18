-- Create tactical_risks table for AI-powered risk forecasting
CREATE TABLE IF NOT EXISTS tactical_risks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID REFERENCES vessels(id) ON DELETE CASCADE,
  risk_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('Critical', 'High', 'Medium', 'Low')),
  description TEXT NOT NULL,
  probability DECIMAL(5,2) CHECK (probability >= 0 AND probability <= 100),
  impact_score INTEGER CHECK (impact_score >= 1 AND impact_score <= 10),
  forecasted_date DATE NOT NULL,
  valid_until DATE NOT NULL,
  recommended_actions JSONB,
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'expired')),
  ai_generated BOOLEAN DEFAULT false,
  ai_confidence DECIMAL(5,2) CHECK (ai_confidence >= 0 AND ai_confidence <= 100),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tactical_risks_vessel ON tactical_risks(vessel_id);
CREATE INDEX IF NOT EXISTS idx_tactical_risks_status ON tactical_risks(status);
CREATE INDEX IF NOT EXISTS idx_tactical_risks_severity ON tactical_risks(severity);
CREATE INDEX IF NOT EXISTS idx_tactical_risks_forecasted_date ON tactical_risks(forecasted_date);

-- Enable Row Level Security
ALTER TABLE tactical_risks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "tactical_risks_select_policy" ON tactical_risks
  FOR SELECT
  USING (true);

CREATE POLICY "tactical_risks_insert_policy" ON tactical_risks
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "tactical_risks_update_policy" ON tactical_risks
  FOR UPDATE
  USING (true);

CREATE POLICY "tactical_risks_delete_policy" ON tactical_risks
  FOR DELETE
  USING (true);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_tactical_risks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_tactical_risks_updated_at
  BEFORE UPDATE ON tactical_risks
  FOR EACH ROW
  EXECUTE FUNCTION update_tactical_risks_updated_at();

-- Add comment
COMMENT ON TABLE tactical_risks IS 'AI-powered tactical risk forecasting for vessels';
