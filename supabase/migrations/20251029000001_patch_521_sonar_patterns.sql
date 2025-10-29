-- PATCH 521: Sonar AI Processor - sonar_patterns table
-- Stores processed acoustic patterns and AI detections from sonar data

CREATE TABLE IF NOT EXISTS sonar_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL,
  
  -- File information
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('wav', 'json', 'csv', 'txt')),
  file_size INTEGER,
  
  -- Processing metadata
  processed_at TIMESTAMPTZ DEFAULT now(),
  processing_time_ms INTEGER,
  
  -- Audio analysis (for WAV files)
  sample_rate INTEGER,
  duration_seconds NUMERIC,
  frequency_range JSONB, -- { min: number, max: number }
  
  -- Pattern detection results
  patterns_detected JSONB, -- Array of detected patterns with confidence
  anomaly_score NUMERIC,
  object_detections JSONB, -- Array of detected objects with positions
  
  -- AI classification
  ai_model TEXT DEFAULT 'tensorflow-sonar-v1',
  confidence_score NUMERIC,
  risk_level TEXT CHECK (risk_level IN ('safe', 'caution', 'warning', 'danger')),
  
  -- Session tracking
  scan_depth NUMERIC,
  scan_radius NUMERIC,
  coordinates JSONB, -- { lat, lon }
  
  -- Additional metadata
  metadata JSONB,
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sonar_patterns_user_id ON sonar_patterns(user_id);
CREATE INDEX IF NOT EXISTS idx_sonar_patterns_session_id ON sonar_patterns(session_id);
CREATE INDEX IF NOT EXISTS idx_sonar_patterns_processed_at ON sonar_patterns(processed_at DESC);
CREATE INDEX IF NOT EXISTS idx_sonar_patterns_risk_level ON sonar_patterns(risk_level);

-- RLS policies
ALTER TABLE sonar_patterns ENABLE ROW LEVEL SECURITY;

-- Users can view their own patterns
CREATE POLICY "Users can view own sonar patterns"
  ON sonar_patterns FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own patterns
CREATE POLICY "Users can insert own sonar patterns"
  ON sonar_patterns FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own patterns
CREATE POLICY "Users can update own sonar patterns"
  ON sonar_patterns FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own patterns
CREATE POLICY "Users can delete own sonar patterns"
  ON sonar_patterns FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_sonar_patterns_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_sonar_patterns_timestamp
  BEFORE UPDATE ON sonar_patterns
  FOR EACH ROW
  EXECUTE FUNCTION update_sonar_patterns_updated_at();
