-- Create tactical_risks table for AI-powered risk predictions
CREATE TABLE IF NOT EXISTS tactical_risks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID REFERENCES vessels(id) ON DELETE CASCADE,
  system_name TEXT NOT NULL, -- DP, Energia, SGSO, Comunicações, etc.
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
  predicted_date DATE NOT NULL,
  valid_until DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '15 days'),
  description TEXT,
  suggested_actions TEXT,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'false_positive')),
  ai_confidence NUMERIC(5, 2) CHECK (ai_confidence >= 0 AND ai_confidence <= 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create indexes for performance
CREATE INDEX idx_tactical_risks_vessel_id ON tactical_risks(vessel_id);
CREATE INDEX idx_tactical_risks_status ON tactical_risks(status);
CREATE INDEX idx_tactical_risks_predicted_date ON tactical_risks(predicted_date);
CREATE INDEX idx_tactical_risks_risk_level ON tactical_risks(risk_level);
CREATE INDEX idx_tactical_risks_assigned_to ON tactical_risks(assigned_to);

-- Enable Row Level Security
ALTER TABLE tactical_risks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "tactical_risks_select_policy" ON tactical_risks
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "tactical_risks_insert_policy" ON tactical_risks
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "tactical_risks_update_policy" ON tactical_risks
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "tactical_risks_delete_policy" ON tactical_risks
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Create function to get vessel risk summary
CREATE OR REPLACE FUNCTION get_vessel_risk_summary(vessel_uuid UUID DEFAULT NULL)
RETURNS TABLE (
  vessel_id UUID,
  vessel_name TEXT,
  total_risks BIGINT,
  critical_count BIGINT,
  high_count BIGINT,
  medium_count BIGINT,
  low_count BIGINT,
  avg_risk_score NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    tr.vessel_id,
    v.name AS vessel_name,
    COUNT(*)::BIGINT AS total_risks,
    COUNT(*) FILTER (WHERE tr.risk_level = 'Critical')::BIGINT AS critical_count,
    COUNT(*) FILTER (WHERE tr.risk_level = 'High')::BIGINT AS high_count,
    COUNT(*) FILTER (WHERE tr.risk_level = 'Medium')::BIGINT AS medium_count,
    COUNT(*) FILTER (WHERE tr.risk_level = 'Low')::BIGINT AS low_count,
    AVG(tr.risk_score) AS avg_risk_score
  FROM tactical_risks tr
  LEFT JOIN vessels v ON tr.vessel_id = v.id
  WHERE tr.status = 'active'
    AND (vessel_uuid IS NULL OR tr.vessel_id = vessel_uuid)
  GROUP BY tr.vessel_id, v.name
  ORDER BY critical_count DESC, high_count DESC, avg_risk_score DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_tactical_risks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tactical_risks_updated_at_trigger
  BEFORE UPDATE ON tactical_risks
  FOR EACH ROW
  EXECUTE FUNCTION update_tactical_risks_updated_at();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON tactical_risks TO authenticated;
GRANT EXECUTE ON FUNCTION get_vessel_risk_summary(UUID) TO authenticated;
