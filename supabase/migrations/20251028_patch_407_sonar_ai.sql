-- PATCH 407: Sonar AI Database Layer
-- Tables for sonar data analysis and AI-powered pattern detection
-- Migration: 20251028_patch_407_sonar_ai.sql

-- Sonar Inputs Table
CREATE TABLE IF NOT EXISTS sonar_inputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID,
  file_name VARCHAR(255),
  file_type VARCHAR(50) CHECK (file_type IN ('JSON', 'CSV', 'TXT')),
  file_size INTEGER,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  uploaded_by UUID REFERENCES auth.users(id),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  raw_data JSONB,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sonar Analysis Table
CREATE TABLE IF NOT EXISTS sonar_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  input_id UUID REFERENCES sonar_inputs(id) ON DELETE CASCADE,
  mission_id UUID,
  analysis_type VARCHAR(100),
  ai_model VARCHAR(100),
  confidence_score DECIMAL(5,2) CHECK (confidence_score >= 0 AND confidence_score <= 100),
  patterns_detected JSONB,
  frequency_data JSONB,
  anomalies JSONB,
  recommendations TEXT,
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sonar Alerts Table
CREATE TABLE IF NOT EXISTS sonar_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID REFERENCES sonar_analysis(id) ON DELETE CASCADE,
  mission_id UUID,
  alert_type VARCHAR(100),
  severity VARCHAR(20) CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  frequency_range VARCHAR(100),
  location JSONB,
  is_acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_by UUID REFERENCES auth.users(id),
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sonar_inputs_mission_id ON sonar_inputs(mission_id);
CREATE INDEX IF NOT EXISTS idx_sonar_inputs_uploaded_at ON sonar_inputs(uploaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_sonar_inputs_status ON sonar_inputs(status);

CREATE INDEX IF NOT EXISTS idx_sonar_analysis_input_id ON sonar_analysis(input_id);
CREATE INDEX IF NOT EXISTS idx_sonar_analysis_mission_id ON sonar_analysis(mission_id);
CREATE INDEX IF NOT EXISTS idx_sonar_analysis_processed_at ON sonar_analysis(processed_at DESC);

CREATE INDEX IF NOT EXISTS idx_sonar_alerts_analysis_id ON sonar_alerts(analysis_id);
CREATE INDEX IF NOT EXISTS idx_sonar_alerts_mission_id ON sonar_alerts(mission_id);
CREATE INDEX IF NOT EXISTS idx_sonar_alerts_severity ON sonar_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_sonar_alerts_created_at ON sonar_alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sonar_alerts_unacknowledged ON sonar_alerts(is_acknowledged) WHERE is_acknowledged = FALSE;

-- Row Level Security (RLS)
ALTER TABLE sonar_inputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sonar_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE sonar_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sonar_inputs
CREATE POLICY "Users can view their own sonar inputs"
  ON sonar_inputs FOR SELECT
  USING (auth.uid() = uploaded_by);

CREATE POLICY "Users can insert their own sonar inputs"
  ON sonar_inputs FOR INSERT
  WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Users can update their own sonar inputs"
  ON sonar_inputs FOR UPDATE
  USING (auth.uid() = uploaded_by);

-- RLS Policies for sonar_analysis
CREATE POLICY "Users can view sonar analysis"
  ON sonar_analysis FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sonar_inputs 
      WHERE sonar_inputs.id = sonar_analysis.input_id 
      AND sonar_inputs.uploaded_by = auth.uid()
    )
  );

CREATE POLICY "System can insert sonar analysis"
  ON sonar_analysis FOR INSERT
  WITH CHECK (true);

-- RLS Policies for sonar_alerts
CREATE POLICY "Users can view sonar alerts"
  ON sonar_alerts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sonar_analysis
      JOIN sonar_inputs ON sonar_inputs.id = sonar_analysis.input_id
      WHERE sonar_analysis.id = sonar_alerts.analysis_id
      AND sonar_inputs.uploaded_by = auth.uid()
    )
  );

CREATE POLICY "Users can acknowledge their alerts"
  ON sonar_alerts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM sonar_analysis
      JOIN sonar_inputs ON sonar_inputs.id = sonar_analysis.input_id
      WHERE sonar_analysis.id = sonar_alerts.analysis_id
      AND sonar_inputs.uploaded_by = auth.uid()
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_sonar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_sonar_inputs_updated_at
  BEFORE UPDATE ON sonar_inputs
  FOR EACH ROW
  EXECUTE FUNCTION update_sonar_updated_at();

CREATE TRIGGER update_sonar_analysis_updated_at
  BEFORE UPDATE ON sonar_analysis
  FOR EACH ROW
  EXECUTE FUNCTION update_sonar_updated_at();

CREATE TRIGGER update_sonar_alerts_updated_at
  BEFORE UPDATE ON sonar_alerts
  FOR EACH ROW
  EXECUTE FUNCTION update_sonar_updated_at();

-- View for critical alerts statistics
CREATE OR REPLACE VIEW sonar_alerts_stats AS
SELECT 
  COUNT(*) FILTER (WHERE severity = 'critical' AND NOT is_acknowledged) as critical_unacknowledged,
  COUNT(*) FILTER (WHERE severity = 'high' AND NOT is_acknowledged) as high_unacknowledged,
  COUNT(*) FILTER (WHERE NOT is_acknowledged) as total_unacknowledged,
  COUNT(*) FILTER (WHERE is_acknowledged) as total_acknowledged,
  COUNT(*) as total_alerts
FROM sonar_alerts;

COMMENT ON TABLE sonar_inputs IS 'Stores uploaded sonar data files for analysis';
COMMENT ON TABLE sonar_analysis IS 'Stores AI-powered analysis results of sonar data';
COMMENT ON TABLE sonar_alerts IS 'Stores alerts generated from sonar analysis';
