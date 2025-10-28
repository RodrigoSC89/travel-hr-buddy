-- PATCH 457: Ocean Sonar - Sonar Readings and AI Predictions
-- Tables for storing sonar readings and AI-powered predictions

-- Sonar Readings Table
CREATE TABLE IF NOT EXISTS sonar_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  location JSONB NOT NULL, -- {lat, lon}
  depth DECIMAL(10, 2) NOT NULL, -- Depth in meters
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  terrain_type TEXT CHECK (terrain_type IN ('rocky', 'sandy', 'muddy', 'coral', 'artificial')),
  risk_level TEXT CHECK (risk_level IN ('safe', 'caution', 'danger')),
  temperature DECIMAL(5, 2), -- Water temperature in Celsius
  pressure DECIMAL(8, 2), -- Pressure in bar
  visibility DECIMAL(5, 2), -- Visibility in meters
  reading_data JSONB, -- Raw sonar reading data
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sonar AI Predictions Table
CREATE TABLE IF NOT EXISTS sonar_ai_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reading_id UUID REFERENCES sonar_readings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  prediction_type TEXT CHECK (prediction_type IN ('object', 'structure', 'hazard', 'feature', 'anomaly')),
  confidence DECIMAL(5, 2) CHECK (confidence >= 0 AND confidence <= 100),
  location JSONB NOT NULL, -- {lat, lon}
  depth_range JSONB, -- {min, max} depth range
  description TEXT,
  detected_objects JSONB, -- Array of detected objects
  safe_route_recommendation JSONB, -- Array of {lat, lon} for safe route
  warnings JSONB DEFAULT '[]', -- Array of warning messages
  ai_model TEXT, -- AI model used for prediction
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sonar_readings_user_id ON sonar_readings(user_id);
CREATE INDEX IF NOT EXISTS idx_sonar_readings_mission_id ON sonar_readings(mission_id);
CREATE INDEX IF NOT EXISTS idx_sonar_readings_timestamp ON sonar_readings(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_sonar_readings_risk_level ON sonar_readings(risk_level);

CREATE INDEX IF NOT EXISTS idx_sonar_ai_predictions_reading_id ON sonar_ai_predictions(reading_id);
CREATE INDEX IF NOT EXISTS idx_sonar_ai_predictions_user_id ON sonar_ai_predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_sonar_ai_predictions_prediction_type ON sonar_ai_predictions(prediction_type);
CREATE INDEX IF NOT EXISTS idx_sonar_ai_predictions_processed_at ON sonar_ai_predictions(processed_at DESC);

-- Row Level Security
ALTER TABLE sonar_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE sonar_ai_predictions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sonar_readings
CREATE POLICY "Users can view their own sonar readings"
  ON sonar_readings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sonar readings"
  ON sonar_readings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sonar readings"
  ON sonar_readings FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for sonar_ai_predictions
CREATE POLICY "Users can view their own AI predictions"
  ON sonar_ai_predictions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own AI predictions"
  ON sonar_ai_predictions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_sonar_tables_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_sonar_readings_updated_at
  BEFORE UPDATE ON sonar_readings
  FOR EACH ROW
  EXECUTE FUNCTION update_sonar_tables_updated_at();

CREATE TRIGGER update_sonar_ai_predictions_updated_at
  BEFORE UPDATE ON sonar_ai_predictions
  FOR EACH ROW
  EXECUTE FUNCTION update_sonar_tables_updated_at();

-- View for sonar statistics
CREATE OR REPLACE VIEW sonar_readings_stats AS
SELECT 
  user_id,
  COUNT(*) as total_readings,
  COUNT(*) FILTER (WHERE risk_level = 'safe') as safe_readings,
  COUNT(*) FILTER (WHERE risk_level = 'caution') as caution_readings,
  COUNT(*) FILTER (WHERE risk_level = 'danger') as danger_readings,
  AVG(depth) as avg_depth,
  MIN(depth) as min_depth,
  MAX(depth) as max_depth
FROM sonar_readings
GROUP BY user_id;

COMMENT ON TABLE sonar_readings IS 'PATCH 457: Stores sonar readings from ocean floor scanning';
COMMENT ON TABLE sonar_ai_predictions IS 'PATCH 457: Stores AI-powered predictions and analysis from sonar data';
