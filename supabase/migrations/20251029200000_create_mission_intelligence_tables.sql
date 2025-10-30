-- PATCH 596-600: Mission Intelligence Core Tables
-- Creates tables for persistent intelligence, signals, patterns, and replay

-- Mission Intelligence Core (PATCH 596)
CREATE TABLE IF NOT EXISTS mission_intelligence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mission_id TEXT NOT NULL,
  context JSONB NOT NULL DEFAULT '{}',
  decisions JSONB NOT NULL DEFAULT '[]',
  patterns_learned JSONB NOT NULL DEFAULT '[]',
  session_count INTEGER DEFAULT 1,
  last_session_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_mission_intelligence_mission_id ON mission_intelligence(mission_id);
CREATE INDEX idx_mission_intelligence_created_at ON mission_intelligence(created_at DESC);

-- Situational Signals (PATCH 597)
CREATE TABLE IF NOT EXISTS situational_signals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mission_id TEXT NOT NULL,
  signal_type TEXT NOT NULL, -- voice, climate, sensor, navigation
  raw_data JSONB NOT NULL,
  normalized_data JSONB NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_situational_signals_mission_id ON situational_signals(mission_id);
CREATE INDEX idx_situational_signals_type ON situational_signals(signal_type);
CREATE INDEX idx_situational_signals_timestamp ON situational_signals(timestamp DESC);

-- Pattern Recognition (PATCH 598)
CREATE TABLE IF NOT EXISTS mission_patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pattern_type TEXT NOT NULL, -- failure, success, anomaly
  pattern_data JSONB NOT NULL,
  mission_types TEXT[] DEFAULT '{}',
  occurrences INTEGER DEFAULT 1,
  confidence_score NUMERIC(3,2) DEFAULT 0.5,
  preventive_actions JSONB DEFAULT '[]',
  first_detected_at TIMESTAMPTZ DEFAULT NOW(),
  last_detected_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_mission_patterns_type ON mission_patterns(pattern_type);
CREATE INDEX idx_mission_patterns_confidence ON mission_patterns(confidence_score DESC);
CREATE INDEX idx_mission_patterns_detected ON mission_patterns(last_detected_at DESC);

-- Mission Replay Events (PATCH 599)
CREATE TABLE IF NOT EXISTS mission_replay_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mission_id TEXT NOT NULL,
  event_type TEXT NOT NULL, -- critical, warning, info, success
  event_data JSONB NOT NULL,
  ai_annotation TEXT,
  ai_insights JSONB DEFAULT '[]',
  timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_mission_replay_mission_id ON mission_replay_events(mission_id);
CREATE INDEX idx_mission_replay_timestamp ON mission_replay_events(timestamp);

-- Mission Status for Dashboard (PATCH 600)
CREATE TABLE IF NOT EXISTS global_mission_status (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mission_id TEXT UNIQUE NOT NULL,
  mission_name TEXT NOT NULL,
  status TEXT NOT NULL, -- active, completed, failed, paused
  mission_type TEXT NOT NULL,
  region TEXT,
  location_data JSONB, -- {lat, lon, details}
  metrics JSONB DEFAULT '{}',
  alerts JSONB DEFAULT '[]',
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_global_mission_status_mission_id ON global_mission_status(mission_id);
CREATE INDEX idx_global_mission_status_status ON global_mission_status(status);
CREATE INDEX idx_global_mission_status_region ON global_mission_status(region);
CREATE INDEX idx_global_mission_status_updated ON global_mission_status(updated_at DESC);

-- RLS Policies
ALTER TABLE mission_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE situational_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE mission_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE mission_replay_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_mission_status ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all data
CREATE POLICY "Allow authenticated read mission_intelligence" ON mission_intelligence
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated read situational_signals" ON situational_signals
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated read mission_patterns" ON mission_patterns
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated read mission_replay_events" ON mission_replay_events
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated read global_mission_status" ON global_mission_status
  FOR SELECT TO authenticated USING (true);

-- Allow authenticated users to insert/update their own data
CREATE POLICY "Allow authenticated insert mission_intelligence" ON mission_intelligence
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Allow authenticated update mission_intelligence" ON mission_intelligence
  FOR UPDATE TO authenticated USING (auth.uid() = created_by);

CREATE POLICY "Allow authenticated insert situational_signals" ON situational_signals
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated insert mission_patterns" ON mission_patterns
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update mission_patterns" ON mission_patterns
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated insert mission_replay_events" ON mission_replay_events
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated insert global_mission_status" ON global_mission_status
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update global_mission_status" ON global_mission_status
  FOR UPDATE TO authenticated USING (true);

-- Functions
CREATE OR REPLACE FUNCTION update_mission_intelligence_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_mission_intelligence_timestamp
  BEFORE UPDATE ON mission_intelligence
  FOR EACH ROW EXECUTE FUNCTION update_mission_intelligence_timestamp();

CREATE TRIGGER trigger_update_global_mission_status_timestamp
  BEFORE UPDATE ON global_mission_status
  FOR EACH ROW EXECUTE FUNCTION update_mission_intelligence_timestamp();
