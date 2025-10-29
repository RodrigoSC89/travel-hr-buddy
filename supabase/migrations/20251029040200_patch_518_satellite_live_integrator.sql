-- PATCH 518: Satélite Live Integrator
-- Real satellite tracking integration with external APIs

-- Satellite tracking data
CREATE TABLE IF NOT EXISTS satellite_live_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  satellite_id TEXT NOT NULL,
  norad_id INTEGER,
  satellite_name TEXT NOT NULL,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  altitude_km NUMERIC NOT NULL,
  velocity_kmh NUMERIC,
  azimuth NUMERIC,
  elevation NUMERIC,
  visibility TEXT CHECK (visibility IN ('visible', 'eclipsed', 'daylight')),
  orbit_type TEXT CHECK (orbit_type IN ('LEO', 'MEO', 'GEO', 'HEO')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'deorbited')),
  metadata JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Satellite coverage zones
CREATE TABLE IF NOT EXISTS satellite_coverage_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  satellite_id TEXT NOT NULL,
  coverage_radius_km NUMERIC NOT NULL,
  center_lat NUMERIC NOT NULL,
  center_lng NUMERIC NOT NULL,
  signal_strength INTEGER CHECK (signal_strength >= 0 AND signal_strength <= 100),
  frequency_mhz NUMERIC,
  active BOOLEAN DEFAULT true,
  valid_from TIMESTAMPTZ DEFAULT now(),
  valid_until TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Satellite API sync logs
CREATE TABLE IF NOT EXISTS satellite_api_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_provider TEXT NOT NULL CHECK (api_provider IN ('n2yo', 'mapbox', 'spire', 'celestrak', 'other')),
  sync_type TEXT NOT NULL CHECK (sync_type IN ('full', 'incremental', 'realtime')),
  satellites_updated INTEGER DEFAULT 0,
  satellites_added INTEGER DEFAULT 0,
  satellites_removed INTEGER DEFAULT 0,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  response_time_ms NUMERIC,
  metadata JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMPTZ DEFAULT now()
);

-- Satellite orbital elements (TLE data)
CREATE TABLE IF NOT EXISTS satellite_orbital_elements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  satellite_id TEXT NOT NULL,
  norad_id INTEGER UNIQUE,
  tle_line1 TEXT NOT NULL,
  tle_line2 TEXT NOT NULL,
  epoch TIMESTAMPTZ NOT NULL,
  inclination NUMERIC,
  right_ascension NUMERIC,
  eccentricity NUMERIC,
  argument_perigee NUMERIC,
  mean_anomaly NUMERIC,
  mean_motion NUMERIC,
  revolutions_at_epoch INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_satellite_live_tracking_satellite_id ON satellite_live_tracking(satellite_id);
CREATE INDEX IF NOT EXISTS idx_satellite_live_tracking_timestamp ON satellite_live_tracking(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_satellite_live_tracking_status ON satellite_live_tracking(status);
CREATE INDEX IF NOT EXISTS idx_satellite_coverage_zones_satellite_id ON satellite_coverage_zones(satellite_id);
CREATE INDEX IF NOT EXISTS idx_satellite_coverage_zones_active ON satellite_coverage_zones(active);
CREATE INDEX IF NOT EXISTS idx_satellite_api_sync_logs_timestamp ON satellite_api_sync_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_satellite_orbital_elements_satellite_id ON satellite_orbital_elements(satellite_id);
CREATE INDEX IF NOT EXISTS idx_satellite_orbital_elements_norad_id ON satellite_orbital_elements(norad_id);

-- Enable Row Level Security
ALTER TABLE satellite_live_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE satellite_coverage_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE satellite_api_sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE satellite_orbital_elements ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Allow public read access to satellite_live_tracking" ON satellite_live_tracking FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to manage satellite_live_tracking" ON satellite_live_tracking FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow public read access to satellite_coverage_zones" ON satellite_coverage_zones FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to manage satellite_coverage_zones" ON satellite_coverage_zones FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow public read access to satellite_api_sync_logs" ON satellite_api_sync_logs FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to insert satellite_api_sync_logs" ON satellite_api_sync_logs FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow public read access to satellite_orbital_elements" ON satellite_orbital_elements FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to manage satellite_orbital_elements" ON satellite_orbital_elements FOR ALL USING (auth.role() = 'authenticated');

-- Trigger for updated_at
CREATE TRIGGER satellite_orbital_elements_updated_at
  BEFORE UPDATE ON satellite_orbital_elements
  FOR EACH ROW
  EXECUTE FUNCTION update_sensor_config_updated_at();
