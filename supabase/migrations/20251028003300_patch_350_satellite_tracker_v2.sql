-- PATCH 350: Satellite Tracker v2 - Global Coverage
-- Objective: Complete global satellite tracking with 3D visualization and mission integration

-- Satellite Positions Table (Real-time satellite positions)
CREATE TABLE IF NOT EXISTS satellite_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  satellite_id TEXT NOT NULL, -- NORAD ID or custom identifier
  satellite_name TEXT NOT NULL,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  altitude_km NUMERIC NOT NULL,
  velocity_kmh NUMERIC,
  heading NUMERIC, -- Degrees 0-360
  orbital_period_minutes NUMERIC,
  inclination_degrees NUMERIC,
  eccentricity NUMERIC,
  perigee_km NUMERIC,
  apogee_km NUMERIC,
  tle_line1 TEXT, -- Two-Line Element set line 1
  tle_line2 TEXT, -- Two-Line Element set line 2
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  next_update_at TIMESTAMPTZ,
  data_source TEXT, -- 'api', 'manual', 'calculated'
  metadata JSONB
);

-- Satellites Table (Satellite registry)
CREATE TABLE IF NOT EXISTS satellites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  satellite_id TEXT UNIQUE NOT NULL,
  satellite_name TEXT NOT NULL,
  satellite_type TEXT NOT NULL, -- 'communication', 'navigation', 'observation', 'weather'
  operator TEXT,
  launch_date DATE,
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'inactive', 'deorbited', 'lost'
  mission_ids UUID[], -- Array of associated mission IDs
  coverage_zones JSONB, -- Geographic coverage zones
  capabilities JSONB, -- Satellite capabilities
  frequency_bands TEXT[],
  orbit_type TEXT, -- 'LEO', 'MEO', 'GEO', 'HEO'
  is_tracked BOOLEAN DEFAULT true,
  priority TEXT DEFAULT 'normal', -- 'low', 'normal', 'high', 'critical'
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Satellite Alerts Table
CREATE TABLE IF NOT EXISTS satellite_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  satellite_id TEXT NOT NULL,
  alert_type TEXT NOT NULL, -- 'coverage_lost', 'low_battery', 'orbital_decay', 'collision_risk', 'malfunction'
  severity TEXT NOT NULL DEFAULT 'warning', -- 'info', 'warning', 'critical'
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'acknowledged', 'resolved'
  affected_missions UUID[],
  affected_areas JSONB, -- Geographic areas affected
  current_position JSONB,
  predicted_impact JSONB,
  recommended_actions TEXT[],
  triggered_at TIMESTAMPTZ DEFAULT NOW(),
  acknowledged_at TIMESTAMPTZ,
  acknowledged_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id),
  resolution_notes TEXT,
  metadata JSONB
);

-- Satellite Coverage Map Table (Pre-calculated coverage areas)
CREATE TABLE IF NOT EXISTS satellite_coverage_maps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  satellite_id TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  coverage_geojson JSONB NOT NULL, -- GeoJSON polygon of coverage area
  elevation_angle_degrees NUMERIC, -- Minimum elevation angle
  coverage_radius_km NUMERIC,
  visibility_duration_minutes NUMERIC,
  next_pass_at TIMESTAMPTZ,
  quality_score NUMERIC, -- 0-1 signal quality score
  metadata JSONB
);

-- Satellite Missions Link Table
CREATE TABLE IF NOT EXISTS satellite_mission_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  satellite_id TEXT NOT NULL,
  mission_id UUID NOT NULL,
  link_type TEXT NOT NULL, -- 'primary', 'backup', 'relay'
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'standby', 'inactive'
  priority INTEGER DEFAULT 0,
  bandwidth_allocated_mbps NUMERIC,
  uptime_percentage NUMERIC,
  last_contact_at TIMESTAMPTZ,
  next_contact_at TIMESTAMPTZ,
  contact_schedule JSONB,
  performance_metrics JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Satellite Passes Table (Predicted satellite passes over locations)
CREATE TABLE IF NOT EXISTS satellite_passes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  satellite_id TEXT NOT NULL,
  location_name TEXT,
  location_latitude NUMERIC NOT NULL,
  location_longitude NUMERIC NOT NULL,
  rise_time TIMESTAMPTZ NOT NULL,
  set_time TIMESTAMPTZ NOT NULL,
  max_elevation_time TIMESTAMPTZ,
  max_elevation_degrees NUMERIC,
  duration_minutes NUMERIC,
  visibility TEXT, -- 'visible', 'daylight', 'shadow'
  pass_quality TEXT DEFAULT 'good', -- 'poor', 'fair', 'good', 'excellent'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Satellite Telemetry Table (Satellite health data)
CREATE TABLE IF NOT EXISTS satellite_telemetry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  satellite_id TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  battery_percentage NUMERIC,
  power_generation_watts NUMERIC,
  temperature_celsius NUMERIC,
  signal_strength_dbm NUMERIC,
  data_rate_mbps NUMERIC,
  health_status TEXT DEFAULT 'nominal', -- 'nominal', 'degraded', 'critical'
  subsystem_status JSONB, -- Status of individual subsystems
  anomalies TEXT[],
  metadata JSONB
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_satellite_positions_satellite_id ON satellite_positions(satellite_id);
CREATE INDEX IF NOT EXISTS idx_satellite_positions_timestamp ON satellite_positions(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_satellite_positions_location ON satellite_positions(latitude, longitude);

CREATE INDEX IF NOT EXISTS idx_satellites_satellite_id ON satellites(satellite_id);
CREATE INDEX IF NOT EXISTS idx_satellites_status ON satellites(status);
CREATE INDEX IF NOT EXISTS idx_satellites_satellite_type ON satellites(satellite_type);
CREATE INDEX IF NOT EXISTS idx_satellites_is_tracked ON satellites(is_tracked);

CREATE INDEX IF NOT EXISTS idx_satellite_alerts_satellite_id ON satellite_alerts(satellite_id);
CREATE INDEX IF NOT EXISTS idx_satellite_alerts_status ON satellite_alerts(status);
CREATE INDEX IF NOT EXISTS idx_satellite_alerts_severity ON satellite_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_satellite_alerts_triggered_at ON satellite_alerts(triggered_at DESC);

CREATE INDEX IF NOT EXISTS idx_satellite_coverage_satellite_id ON satellite_coverage_maps(satellite_id);
CREATE INDEX IF NOT EXISTS idx_satellite_coverage_timestamp ON satellite_coverage_maps(timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_satellite_mission_links_satellite ON satellite_mission_links(satellite_id);
CREATE INDEX IF NOT EXISTS idx_satellite_mission_links_mission ON satellite_mission_links(mission_id);
CREATE INDEX IF NOT EXISTS idx_satellite_mission_links_status ON satellite_mission_links(status);

CREATE INDEX IF NOT EXISTS idx_satellite_passes_satellite_id ON satellite_passes(satellite_id);
CREATE INDEX IF NOT EXISTS idx_satellite_passes_rise_time ON satellite_passes(rise_time);
CREATE INDEX IF NOT EXISTS idx_satellite_passes_location ON satellite_passes(location_latitude, location_longitude);

CREATE INDEX IF NOT EXISTS idx_satellite_telemetry_satellite_id ON satellite_telemetry(satellite_id);
CREATE INDEX IF NOT EXISTS idx_satellite_telemetry_timestamp ON satellite_telemetry(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_satellite_telemetry_health_status ON satellite_telemetry(health_status);

-- Enable RLS
ALTER TABLE satellite_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE satellites ENABLE ROW LEVEL SECURITY;
ALTER TABLE satellite_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE satellite_coverage_maps ENABLE ROW LEVEL SECURITY;
ALTER TABLE satellite_mission_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE satellite_passes ENABLE ROW LEVEL SECURITY;
ALTER TABLE satellite_telemetry ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Authenticated users can view satellite positions"
  ON satellite_positions FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "System can insert satellite positions"
  ON satellite_positions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view satellites"
  ON satellites FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view alerts"
  ON satellite_alerts FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can acknowledge alerts"
  ON satellite_alerts FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "System can create alerts"
  ON satellite_alerts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view coverage maps"
  ON satellite_coverage_maps FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view mission links"
  ON satellite_mission_links FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view passes"
  ON satellite_passes FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view telemetry"
  ON satellite_telemetry FOR SELECT
  USING (auth.role() = 'authenticated');

-- Function to update satellite position
CREATE OR REPLACE FUNCTION update_satellite_position(
  p_satellite_id TEXT,
  p_latitude NUMERIC,
  p_longitude NUMERIC,
  p_altitude_km NUMERIC,
  p_velocity_kmh NUMERIC DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_position_id UUID;
BEGIN
  -- Insert new position
  INSERT INTO satellite_positions (
    satellite_id, satellite_name, latitude, longitude,
    altitude_km, velocity_kmh, data_source
  )
  SELECT 
    p_satellite_id, 
    COALESCE(satellite_name, p_satellite_id),
    p_latitude,
    p_longitude,
    p_altitude_km,
    p_velocity_kmh,
    'api'
  FROM satellites
  WHERE satellite_id = p_satellite_id
  RETURNING id INTO v_position_id;
  
  RETURN v_position_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check coverage and create alerts
CREATE OR REPLACE FUNCTION check_satellite_coverage(
  p_satellite_id TEXT,
  p_critical_area JSONB
)
RETURNS BOOLEAN AS $$
DECLARE
  v_latest_position RECORD;
  v_coverage_lost BOOLEAN;
  v_alert_exists BOOLEAN;
BEGIN
  -- Get latest position
  SELECT * INTO v_latest_position
  FROM satellite_positions
  WHERE satellite_id = p_satellite_id
  ORDER BY timestamp DESC
  LIMIT 1;
  
  -- Simple coverage check (in real implementation, use PostGIS)
  -- This is a simplified version
  v_coverage_lost := (v_latest_position.timestamp < NOW() - INTERVAL '10 minutes');
  
  -- Check if alert already exists
  SELECT EXISTS(
    SELECT 1 FROM satellite_alerts
    WHERE satellite_id = p_satellite_id
      AND alert_type = 'coverage_lost'
      AND status = 'active'
  ) INTO v_alert_exists;
  
  -- Create alert if coverage lost and no active alert
  IF v_coverage_lost AND NOT v_alert_exists THEN
    INSERT INTO satellite_alerts (
      satellite_id, alert_type, severity, title, description
    ) VALUES (
      p_satellite_id,
      'coverage_lost',
      'critical',
      'Satellite Coverage Lost',
      format('Satellite %s has lost coverage of critical area', p_satellite_id)
    );
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to predict satellite passes
CREATE OR REPLACE FUNCTION calculate_satellite_passes(
  p_satellite_id TEXT,
  p_location_lat NUMERIC,
  p_location_lon NUMERIC,
  p_hours_ahead INTEGER DEFAULT 24
)
RETURNS SETOF satellite_passes AS $$
BEGIN
  -- In a real implementation, this would use orbital mechanics
  -- This is a placeholder that returns sample data
  RETURN QUERY
  SELECT 
    gen_random_uuid() as id,
    p_satellite_id,
    'Location' as location_name,
    p_location_lat,
    p_location_lon,
    NOW() + (generate_series(1, 5) * INTERVAL '4 hours') as rise_time,
    NOW() + (generate_series(1, 5) * INTERVAL '4 hours') + INTERVAL '10 minutes' as set_time,
    NOW() + (generate_series(1, 5) * INTERVAL '4 hours') + INTERVAL '5 minutes' as max_elevation_time,
    45.0 as max_elevation_degrees,
    10.0 as duration_minutes,
    'visible' as visibility,
    'good' as pass_quality,
    NOW() as created_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert sample satellites
INSERT INTO satellites (satellite_id, satellite_name, satellite_type, operator, status, orbit_type, is_tracked) VALUES
  ('NORAD-25544', 'ISS (International Space Station)', 'observation', 'NASA/ESA/JAXA', 'active', 'LEO', true),
  ('NORAD-43657', 'Starlink-1007', 'communication', 'SpaceX', 'active', 'LEO', true),
  ('NORAD-41866', 'Sentinel-3B', 'observation', 'ESA', 'active', 'LEO', true),
  ('NORAD-40128', 'GOES-17', 'weather', 'NOAA', 'active', 'GEO', true),
  ('CUSTOM-001', 'Nautilus-Sat-1', 'navigation', 'Nautilus Maritime', 'active', 'MEO', true)
ON CONFLICT DO NOTHING;

COMMENT ON TABLE satellite_positions IS 'PATCH 350: Real-time satellite position tracking';
COMMENT ON TABLE satellites IS 'PATCH 350: Satellite registry with mission links';
COMMENT ON TABLE satellite_alerts IS 'PATCH 350: Automatic satellite alerts';
COMMENT ON TABLE satellite_coverage_maps IS 'PATCH 350: Pre-calculated coverage areas';
COMMENT ON TABLE satellite_mission_links IS 'PATCH 350: Links between satellites and missions';
COMMENT ON TABLE satellite_passes IS 'PATCH 350: Predicted satellite passes over locations';
COMMENT ON TABLE satellite_telemetry IS 'PATCH 350: Satellite health and telemetry data';
