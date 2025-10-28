-- PATCH 407: Sonar AI Enhancement - Database Schema
-- Creates tables for sonar data analysis and alerts

-- Table for storing sonar input data
CREATE TABLE IF NOT EXISTS sonar_inputs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  scan_type VARCHAR(50) NOT NULL, -- 'manual', 'auto', 'file_upload', 'stream'
  scan_depth DECIMAL(10, 2) NOT NULL,
  scan_radius DECIMAL(10, 2) NOT NULL,
  resolution INTEGER NOT NULL, -- number of pings
  raw_data JSONB NOT NULL, -- array of ping data
  metadata JSONB, -- additional scan parameters
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for storing analysis results
CREATE TABLE IF NOT EXISTS sonar_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  input_id UUID REFERENCES sonar_inputs(id) ON DELETE CASCADE,
  quality_score DECIMAL(5, 2),
  coverage DECIMAL(5, 2),
  resolution_meters DECIMAL(10, 2),
  detected_patterns JSONB, -- array of detected patterns
  detected_returns JSONB, -- array of sonar returns
  anomalies_count INTEGER DEFAULT 0,
  risk_score DECIMAL(5, 2),
  overall_risk VARCHAR(20), -- 'safe', 'caution', 'dangerous', 'critical'
  navigation_advice TEXT,
  ai_confidence DECIMAL(5, 2), -- AI model confidence score
  processing_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for storing detected alerts and hazards
CREATE TABLE IF NOT EXISTS sonar_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  analysis_id UUID REFERENCES sonar_analysis(id) ON DELETE CASCADE,
  alert_type VARCHAR(50) NOT NULL, -- 'hazard', 'safe_zone', 'anomaly', 'pattern'
  severity VARCHAR(20) NOT NULL, -- 'low', 'medium', 'high', 'critical'
  title VARCHAR(200) NOT NULL,
  description TEXT,
  location JSONB NOT NULL, -- {angle, distance, depth}
  characteristics JSONB, -- array of characteristics or recommendations
  safety_score DECIMAL(5, 2),
  requires_action BOOLEAN DEFAULT false,
  acknowledged BOOLEAN DEFAULT false,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  acknowledged_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_sonar_inputs_session ON sonar_inputs(session_id);
CREATE INDEX IF NOT EXISTS idx_sonar_inputs_user ON sonar_inputs(user_id);
CREATE INDEX IF NOT EXISTS idx_sonar_inputs_created ON sonar_inputs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sonar_analysis_input ON sonar_analysis(input_id);
CREATE INDEX IF NOT EXISTS idx_sonar_analysis_risk ON sonar_analysis(overall_risk);
CREATE INDEX IF NOT EXISTS idx_sonar_analysis_created ON sonar_analysis(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sonar_alerts_analysis ON sonar_alerts(analysis_id);
CREATE INDEX IF NOT EXISTS idx_sonar_alerts_severity ON sonar_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_sonar_alerts_requires_action ON sonar_alerts(requires_action) WHERE requires_action = true;
CREATE INDEX IF NOT EXISTS idx_sonar_alerts_unacknowledged ON sonar_alerts(acknowledged) WHERE acknowledged = false;

-- Enable Row Level Security
ALTER TABLE sonar_inputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sonar_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE sonar_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sonar_inputs
CREATE POLICY "Users can view their own sonar inputs"
  ON sonar_inputs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sonar inputs"
  ON sonar_inputs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sonar inputs"
  ON sonar_inputs FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for sonar_analysis (readable by owner of input)
CREATE POLICY "Users can view analysis of their inputs"
  ON sonar_analysis FOR SELECT
  USING (
    input_id IN (
      SELECT id FROM sonar_inputs WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert analysis"
  ON sonar_analysis FOR INSERT
  WITH CHECK (true);

-- RLS Policies for sonar_alerts (readable by owner of analysis)
CREATE POLICY "Users can view alerts of their analysis"
  ON sonar_alerts FOR SELECT
  USING (
    analysis_id IN (
      SELECT sa.id FROM sonar_analysis sa
      JOIN sonar_inputs si ON sa.input_id = si.id
      WHERE si.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can acknowledge their alerts"
  ON sonar_alerts FOR UPDATE
  USING (
    analysis_id IN (
      SELECT sa.id FROM sonar_analysis sa
      JOIN sonar_inputs si ON sa.input_id = si.id
      WHERE si.user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert alerts"
  ON sonar_alerts FOR INSERT
  WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_sonar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for sonar_inputs
DROP TRIGGER IF EXISTS update_sonar_inputs_updated_at ON sonar_inputs;
CREATE TRIGGER update_sonar_inputs_updated_at
  BEFORE UPDATE ON sonar_inputs
  FOR EACH ROW
  EXECUTE FUNCTION update_sonar_updated_at();

-- View for quick stats
CREATE OR REPLACE VIEW sonar_stats AS
SELECT
  COUNT(DISTINCT si.id) as total_scans,
  COUNT(DISTINCT si.session_id) as total_sessions,
  COUNT(DISTINCT sa.id) as total_analyses,
  COUNT(DISTINCT sal.id) FILTER (WHERE sal.severity IN ('high', 'critical')) as critical_alerts,
  COUNT(DISTINCT sal.id) FILTER (WHERE sal.acknowledged = false) as unacknowledged_alerts,
  AVG(sa.quality_score) as avg_quality_score,
  AVG(sa.risk_score) as avg_risk_score
FROM sonar_inputs si
LEFT JOIN sonar_analysis sa ON si.id = sa.input_id
LEFT JOIN sonar_alerts sal ON sa.id = sal.analysis_id
WHERE si.created_at > NOW() - INTERVAL '30 days';

COMMENT ON TABLE sonar_inputs IS 'PATCH 407: Stores raw sonar scan data and parameters';
COMMENT ON TABLE sonar_analysis IS 'PATCH 407: Stores AI-powered analysis results';
COMMENT ON TABLE sonar_alerts IS 'PATCH 407: Stores hazards, safe zones, and anomaly alerts';
