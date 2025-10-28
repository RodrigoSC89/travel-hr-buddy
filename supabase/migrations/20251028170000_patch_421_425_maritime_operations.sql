-- PATCH 421-425: Maritime Operations Modules
-- Database schema for coordination, sonar, and navigation features

-- Coordination AI Decisions Table
CREATE TABLE IF NOT EXISTS coordination_decisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  context TEXT NOT NULL,
  decision TEXT NOT NULL,
  agent VARCHAR(255) NOT NULL,
  confidence DECIMAL(3,2) CHECK (confidence >= 0 AND confidence <= 1),
  outcome TEXT,
  task_id VARCHAR(255),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_coordination_decisions_created_at 
  ON coordination_decisions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_coordination_decisions_agent 
  ON coordination_decisions(agent);

-- Sonar Signals Table (PATCH 423)
CREATE TABLE IF NOT EXISTS sonar_signals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  depth DECIMAL(10, 2) NOT NULL,
  signal_strength INTEGER CHECK (signal_strength >= 0 AND signal_strength <= 100),
  terrain_type VARCHAR(50),
  risk_level VARCHAR(20) CHECK (risk_level IN ('safe', 'caution', 'danger')),
  scan_session_id VARCHAR(255),
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_sonar_signals_created_at 
  ON sonar_signals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sonar_signals_location 
  ON sonar_signals(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_sonar_signals_session 
  ON sonar_signals(scan_session_id);

-- Sonar Events Table (PATCH 423)
CREATE TABLE IF NOT EXISTS sonar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('obstacle', 'anomaly', 'target', 'alert')),
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  depth DECIMAL(10, 2),
  severity VARCHAR(20) CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT,
  scan_session_id VARCHAR(255),
  resolved BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_sonar_events_created_at 
  ON sonar_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sonar_events_type 
  ON sonar_events(event_type);
CREATE INDEX IF NOT EXISTS idx_sonar_events_severity 
  ON sonar_events(severity);
CREATE INDEX IF NOT EXISTS idx_sonar_events_resolved 
  ON sonar_events(resolved);

-- Underwater Drone Missions Table (PATCH 424)
CREATE TABLE IF NOT EXISTS drone_missions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  drone_id VARCHAR(255) NOT NULL,
  mission_name VARCHAR(255) NOT NULL,
  mission_type VARCHAR(50) CHECK (mission_type IN ('scan', 'survey', 'inspection', 'transport', 'patrol')),
  status VARCHAR(50) CHECK (status IN ('planned', 'active', 'paused', 'completed', 'failed')) DEFAULT 'planned',
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  waypoints JSONB NOT NULL DEFAULT '[]'::jsonb,
  mission_data JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_drone_missions_drone_id 
  ON drone_missions(drone_id);
CREATE INDEX IF NOT EXISTS idx_drone_missions_status 
  ON drone_missions(status);
CREATE INDEX IF NOT EXISTS idx_drone_missions_created_at 
  ON drone_missions(created_at DESC);

-- Drone Operation Logs Table (PATCH 424)
CREATE TABLE IF NOT EXISTS drone_operation_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  drone_id VARCHAR(255) NOT NULL,
  mission_id UUID REFERENCES drone_missions(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('start', 'stop', 'command', 'telemetry', 'alert', 'error')),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  depth DECIMAL(10, 2),
  battery_level INTEGER CHECK (battery_level >= 0 AND battery_level <= 100),
  signal_strength INTEGER CHECK (signal_strength >= 0 AND signal_strength <= 100),
  description TEXT,
  data JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_drone_logs_created_at 
  ON drone_operation_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_drone_logs_drone_id 
  ON drone_operation_logs(drone_id);
CREATE INDEX IF NOT EXISTS idx_drone_logs_mission_id 
  ON drone_operation_logs(mission_id);

-- Navigation Routes Table (PATCH 425)
CREATE TABLE IF NOT EXISTS navigation_routes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  route_name VARCHAR(255) NOT NULL,
  origin_lat DECIMAL(10, 8) NOT NULL,
  origin_lng DECIMAL(11, 8) NOT NULL,
  destination_lat DECIMAL(10, 8) NOT NULL,
  destination_lng DECIMAL(11, 8) NOT NULL,
  waypoints JSONB NOT NULL DEFAULT '[]'::jsonb,
  distance_nm DECIMAL(10, 2),
  estimated_time_hours DECIMAL(10, 2),
  risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),
  weather_conditions JSONB DEFAULT '{}'::jsonb,
  ai_suggestions JSONB DEFAULT '[]'::jsonb,
  status VARCHAR(50) CHECK (status IN ('planned', 'active', 'completed', 'cancelled')) DEFAULT 'planned',
  created_by UUID REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_navigation_routes_created_at 
  ON navigation_routes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_navigation_routes_status 
  ON navigation_routes(status);
CREATE INDEX IF NOT EXISTS idx_navigation_routes_created_by 
  ON navigation_routes(created_by);

-- Navigation Alerts Table (PATCH 425)
CREATE TABLE IF NOT EXISTS navigation_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  route_id UUID REFERENCES navigation_routes(id) ON DELETE CASCADE,
  alert_type VARCHAR(50) NOT NULL CHECK (alert_type IN ('weather', 'traffic', 'hazard', 'performance')),
  severity VARCHAR(20) CHECK (severity IN ('info', 'warning', 'danger', 'critical')),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  valid_until TIMESTAMP WITH TIME ZONE,
  acknowledged BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_navigation_alerts_created_at 
  ON navigation_alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_navigation_alerts_route_id 
  ON navigation_alerts(route_id);
CREATE INDEX IF NOT EXISTS idx_navigation_alerts_severity 
  ON navigation_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_navigation_alerts_acknowledged 
  ON navigation_alerts(acknowledged);

-- Enable Row Level Security
ALTER TABLE coordination_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sonar_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE sonar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE drone_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE drone_operation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE navigation_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE navigation_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Allow all authenticated users for now, can be refined later)
CREATE POLICY "Allow authenticated users to read coordination_decisions" 
  ON coordination_decisions FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Allow authenticated users to insert coordination_decisions" 
  ON coordination_decisions FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to read sonar_signals" 
  ON sonar_signals FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Allow authenticated users to insert sonar_signals" 
  ON sonar_signals FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to read sonar_events" 
  ON sonar_events FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Allow authenticated users to insert sonar_events" 
  ON sonar_events FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to read drone_missions" 
  ON drone_missions FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Allow authenticated users to insert drone_missions" 
  ON drone_missions FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update drone_missions" 
  ON drone_missions FOR UPDATE 
  TO authenticated 
  USING (true);

CREATE POLICY "Allow authenticated users to read drone_operation_logs" 
  ON drone_operation_logs FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Allow authenticated users to insert drone_operation_logs" 
  ON drone_operation_logs FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to read navigation_routes" 
  ON navigation_routes FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Allow authenticated users to insert navigation_routes" 
  ON navigation_routes FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update navigation_routes" 
  ON navigation_routes FOR UPDATE 
  TO authenticated 
  USING (true);

CREATE POLICY "Allow authenticated users to read navigation_alerts" 
  ON navigation_alerts FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Allow authenticated users to insert navigation_alerts" 
  ON navigation_alerts FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update navigation_alerts" 
  ON navigation_alerts FOR UPDATE 
  TO authenticated 
  USING (true);

-- Add comments for documentation
COMMENT ON TABLE coordination_decisions IS 'PATCH 422 - Stores AI coordination decisions and task assignments';
COMMENT ON TABLE sonar_signals IS 'PATCH 423 - Stores bathymetric sonar readings';
COMMENT ON TABLE sonar_events IS 'PATCH 423 - Stores sonar events and alerts';
COMMENT ON TABLE drone_missions IS 'PATCH 424 - Stores underwater drone missions';
COMMENT ON TABLE drone_operation_logs IS 'PATCH 424 - Stores drone operation logs';
COMMENT ON TABLE navigation_routes IS 'PATCH 425 - Stores navigation routes and AI suggestions';
COMMENT ON TABLE navigation_alerts IS 'PATCH 425 - Stores navigation alerts and warnings';
