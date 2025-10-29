-- PATCH 459: Underwater Drone - Missions and Telemetry
-- Tables for underwater drone missions and real-time telemetry

-- Underwater Missions Table
CREATE TABLE IF NOT EXISTS underwater_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  drone_id UUID, -- Reference to drone if applicable
  name TEXT NOT NULL,
  description TEXT,
  mission_type TEXT CHECK (mission_type IN ('survey', 'inspection', 'exploration', 'research', 'maintenance', 'rescue')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'paused', 'completed', 'aborted', 'failed')),
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  
  -- Location and path
  start_location JSONB NOT NULL, -- {lat, lon, depth}
  current_location JSONB, -- {lat, lon, depth}
  waypoints JSONB DEFAULT '[]', -- Array of mission waypoints
  trajectory JSONB DEFAULT '[]', -- Array of actual path taken
  
  -- Timing
  scheduled_start TIMESTAMP WITH TIME ZONE,
  actual_start TIMESTAMP WITH TIME ZONE,
  estimated_end TIMESTAMP WITH TIME ZONE,
  actual_end TIMESTAMP WITH TIME ZONE,
  
  -- Mission metrics
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  distance_covered_m DECIMAL(10, 2), -- Distance in meters
  max_depth_reached DECIMAL(10, 2), -- Maximum depth in meters
  duration_minutes INTEGER,
  
  -- Mission data
  objectives JSONB, -- Mission objectives and requirements
  findings JSONB, -- Discoveries and observations during mission
  samples_collected JSONB, -- Samples or data collected
  incidents JSONB DEFAULT '[]', -- Any incidents or issues encountered
  
  -- Mission result
  success_rate DECIMAL(5, 2), -- Success percentage
  result_summary TEXT,
  
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Drone Telemetry Table
CREATE TABLE IF NOT EXISTS drone_telemetry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID REFERENCES underwater_missions(id) ON DELETE CASCADE,
  drone_id UUID,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Position and orientation
  position JSONB NOT NULL, -- {lat, lon, depth, altitude}
  orientation JSONB, -- {yaw, pitch, roll}
  velocity JSONB, -- {speed, heading}
  
  -- Environmental
  water_temperature DECIMAL(5, 2), -- Celsius
  pressure DECIMAL(8, 2), -- Bar
  visibility DECIMAL(5, 2), -- Meters
  current_speed DECIMAL(5, 2), -- Current speed in m/s
  current_direction DECIMAL(5, 2), -- Direction in degrees
  
  -- Drone status
  battery_level INTEGER CHECK (battery_level >= 0 AND battery_level <= 100),
  battery_time_remaining INTEGER, -- Minutes
  signal_strength INTEGER CHECK (signal_strength >= 0 AND signal_strength <= 100),
  connection_type TEXT CHECK (connection_type IN ('cable', 'acoustic', 'satellite', 'none')),
  
  -- System health
  thruster_status JSONB, -- Status of each thruster
  sensor_status JSONB, -- Status of sensors
  system_alerts JSONB DEFAULT '[]', -- Active system alerts
  
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mission Events/Logs Table
CREATE TABLE IF NOT EXISTS mission_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID REFERENCES underwater_missions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT CHECK (event_type IN ('start', 'pause', 'resume', 'complete', 'abort', 'waypoint', 'alert', 'finding', 'incident')),
  severity TEXT CHECK (severity IN ('info', 'warning', 'critical')),
  message TEXT NOT NULL,
  location JSONB, -- {lat, lon, depth} at time of event
  details JSONB, -- Additional event details
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_underwater_missions_user_id ON underwater_missions(user_id);
CREATE INDEX IF NOT EXISTS idx_underwater_missions_drone_id ON underwater_missions(drone_id);
CREATE INDEX IF NOT EXISTS idx_underwater_missions_status ON underwater_missions(status);
CREATE INDEX IF NOT EXISTS idx_underwater_missions_created_at ON underwater_missions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_underwater_missions_scheduled_start ON underwater_missions(scheduled_start);

CREATE INDEX IF NOT EXISTS idx_drone_telemetry_mission_id ON drone_telemetry(mission_id);
CREATE INDEX IF NOT EXISTS idx_drone_telemetry_drone_id ON drone_telemetry(drone_id);
CREATE INDEX IF NOT EXISTS idx_drone_telemetry_user_id ON drone_telemetry(user_id);
CREATE INDEX IF NOT EXISTS idx_drone_telemetry_timestamp ON drone_telemetry(timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_mission_events_mission_id ON mission_events(mission_id);
CREATE INDEX IF NOT EXISTS idx_mission_events_user_id ON mission_events(user_id);
CREATE INDEX IF NOT EXISTS idx_mission_events_event_type ON mission_events(event_type);
CREATE INDEX IF NOT EXISTS idx_mission_events_timestamp ON mission_events(timestamp DESC);

-- Row Level Security
ALTER TABLE underwater_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE drone_telemetry ENABLE ROW LEVEL SECURITY;
ALTER TABLE mission_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for underwater_missions
CREATE POLICY "Users can view their own missions"
  ON underwater_missions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own missions"
  ON underwater_missions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own missions"
  ON underwater_missions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own missions"
  ON underwater_missions FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for drone_telemetry
CREATE POLICY "Users can view their own telemetry"
  ON drone_telemetry FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own telemetry"
  ON drone_telemetry FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for mission_events
CREATE POLICY "Users can view their own mission events"
  ON mission_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own mission events"
  ON mission_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_underwater_missions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER update_underwater_missions_updated_at
  BEFORE UPDATE ON underwater_missions
  FOR EACH ROW
  EXECUTE FUNCTION update_underwater_missions_updated_at();

-- View for mission statistics
CREATE OR REPLACE VIEW underwater_missions_stats AS
SELECT 
  user_id,
  COUNT(*) as total_missions,
  COUNT(*) FILTER (WHERE status = 'completed') as completed_missions,
  COUNT(*) FILTER (WHERE status = 'active') as active_missions,
  AVG(progress) as avg_progress,
  AVG(success_rate) as avg_success_rate,
  SUM(distance_covered_m) as total_distance,
  MAX(max_depth_reached) as max_depth
FROM underwater_missions
GROUP BY user_id;

COMMENT ON TABLE underwater_missions IS 'PATCH 459: Underwater drone missions with full tracking and status';
COMMENT ON TABLE drone_telemetry IS 'PATCH 459: Real-time telemetry data from underwater drones';
COMMENT ON TABLE mission_events IS 'PATCH 459: Event log for underwater missions';
