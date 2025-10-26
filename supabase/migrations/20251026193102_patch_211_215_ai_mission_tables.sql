-- PATCH 211.0 - Mission Simulation Core
-- Create simulated_missions table
CREATE TABLE IF NOT EXISTS simulated_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  vessels JSONB NOT NULL DEFAULT '[]',
  weather JSONB NOT NULL DEFAULT '[]',
  crew JSONB NOT NULL DEFAULT '[]',
  payload JSONB NOT NULL DEFAULT '[]',
  risk_factors JSONB NOT NULL DEFAULT '[]',
  failure_injections JSONB DEFAULT '{}',
  outcome JSONB,
  predictions JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_simulated_missions_status ON simulated_missions(status);
CREATE INDEX IF NOT EXISTS idx_simulated_missions_created_at ON simulated_missions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_simulated_missions_created_by ON simulated_missions(created_by);

-- Enable RLS
ALTER TABLE simulated_missions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own simulations"
  ON simulated_missions FOR SELECT
  USING (auth.uid() = created_by OR auth.jwt()->>'role' = 'admin');

CREATE POLICY "Users can create simulations"
  ON simulated_missions FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own simulations"
  ON simulated_missions FOR UPDATE
  USING (auth.uid() = created_by OR auth.jwt()->>'role' = 'admin');

-- PATCH 212.0 - Satellite Sync Engine
-- Create satellite_data table
CREATE TABLE IF NOT EXISTS satellite_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL CHECK (source IN ('NOAA', 'Starlink', 'AIS', 'Other')),
  data_type TEXT NOT NULL CHECK (data_type IN ('telemetry', 'position', 'weather', 'other')),
  raw_data JSONB NOT NULL,
  normalized_data JSONB,
  latitude NUMERIC(10, 7),
  longitude NUMERIC(10, 7),
  timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_satellite_data_source ON satellite_data(source);
CREATE INDEX IF NOT EXISTS idx_satellite_data_timestamp ON satellite_data(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_satellite_data_location ON satellite_data(latitude, longitude);

-- Enable RLS
ALTER TABLE satellite_data ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "All authenticated users can view satellite data"
  ON satellite_data FOR SELECT
  USING (auth.role() = 'authenticated');

-- Create weather_feed table
CREATE TABLE IF NOT EXISTS weather_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL CHECK (source IN ('Windy', 'NOAA', 'OpenWeather', 'Other')),
  location_name TEXT,
  latitude NUMERIC(10, 7) NOT NULL,
  longitude NUMERIC(10, 7) NOT NULL,
  temperature NUMERIC(5, 2),
  wind_speed NUMERIC(5, 2),
  wind_direction INTEGER,
  visibility NUMERIC(6, 2),
  sea_state TEXT,
  weather_conditions JSONB,
  forecast_data JSONB,
  risk_level TEXT CHECK (risk_level IN ('safe', 'caution', 'warning', 'danger')),
  timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_weather_feed_location ON weather_feed(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_weather_feed_timestamp ON weather_feed(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_weather_feed_risk_level ON weather_feed(risk_level);

-- Enable RLS
ALTER TABLE weather_feed ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "All authenticated users can view weather feed"
  ON weather_feed FOR SELECT
  USING (auth.role() = 'authenticated');

-- PATCH 213.0 - Neural Copilot Engine
-- Create copilot_sessions table
CREATE TABLE IF NOT EXISTS copilot_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  session_name TEXT,
  context JSONB DEFAULT '{}',
  messages JSONB DEFAULT '[]',
  recommendations JSONB DEFAULT '[]',
  input_type TEXT CHECK (input_type IN ('voice', 'text', 'both')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_copilot_sessions_user_id ON copilot_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_copilot_sessions_created_at ON copilot_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_copilot_sessions_status ON copilot_sessions(status);

-- Enable RLS
ALTER TABLE copilot_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own copilot sessions"
  ON copilot_sessions FOR SELECT
  USING (auth.uid() = user_id OR auth.jwt()->>'role' = 'admin');

CREATE POLICY "Users can create copilot sessions"
  ON copilot_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own copilot sessions"
  ON copilot_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- PATCH 214.0 - Mission AI Autonomy
-- Create autonomy_actions table
CREATE TABLE IF NOT EXISTS autonomy_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type TEXT NOT NULL,
  decision_level TEXT NOT NULL CHECK (decision_level IN ('auto_execute', 'request_approval', 'forbidden')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'executed', 'failed')),
  context JSONB NOT NULL,
  reasoning TEXT,
  confidence_score NUMERIC(3, 2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  risk_score NUMERIC(3, 2) CHECK (risk_score >= 0 AND risk_score <= 1),
  approved_by UUID REFERENCES auth.users(id),
  executed_at TIMESTAMPTZ,
  result JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_autonomy_actions_decision_level ON autonomy_actions(decision_level);
CREATE INDEX IF NOT EXISTS idx_autonomy_actions_status ON autonomy_actions(status);
CREATE INDEX IF NOT EXISTS idx_autonomy_actions_created_at ON autonomy_actions(created_at DESC);

-- Enable RLS
ALTER TABLE autonomy_actions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can view autonomy actions"
  ON autonomy_actions FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "System can create autonomy actions"
  ON autonomy_actions FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can update autonomy actions"
  ON autonomy_actions FOR UPDATE
  USING (auth.jwt()->>'role' = 'admin' OR auth.uid() = approved_by);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_simulated_missions_updated_at BEFORE UPDATE ON simulated_missions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_copilot_sessions_updated_at BEFORE UPDATE ON copilot_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_autonomy_actions_updated_at BEFORE UPDATE ON autonomy_actions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
