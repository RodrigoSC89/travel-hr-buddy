-- PATCH 443: Ocean Sonar Enhancement
-- Create sonar_events table for tracking sonar detections and anomalies

CREATE TABLE IF NOT EXISTS sonar_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vessel_id TEXT NOT NULL,
  scan_id UUID,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'object_detected',
    'anomaly_detected',
    'obstacle_warning',
    'safe_route_calculated',
    'bathymetric_scan_completed',
    'depth_anomaly',
    'terrain_change',
    'hazard_identified'
  )),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  object_type TEXT,
  description TEXT NOT NULL,
  latitude NUMERIC,
  longitude NUMERIC,
  depth_meters NUMERIC,
  distance_meters NUMERIC,
  confidence_score NUMERIC CHECK (confidence_score >= 0 AND confidence_score <= 100),
  ai_analysis JSONB,
  bathymetric_data JSONB,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_sonar_events_vessel_id ON sonar_events(vessel_id);
CREATE INDEX IF NOT EXISTS idx_sonar_events_timestamp ON sonar_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_sonar_events_event_type ON sonar_events(event_type);
CREATE INDEX IF NOT EXISTS idx_sonar_events_severity ON sonar_events(severity);
CREATE INDEX IF NOT EXISTS idx_sonar_events_unresolved ON sonar_events(resolved) WHERE resolved = FALSE;
CREATE INDEX IF NOT EXISTS idx_sonar_events_scan_id ON sonar_events(scan_id);

-- Create sonar_scans table for tracking scanning sessions
CREATE TABLE IF NOT EXISTS sonar_scans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vessel_id TEXT NOT NULL,
  scan_type TEXT NOT NULL CHECK (scan_type IN (
    'bathymetric',
    'obstacle_detection',
    'route_planning',
    'survey',
    'emergency'
  )),
  center_latitude NUMERIC NOT NULL,
  center_longitude NUMERIC NOT NULL,
  radius_km NUMERIC NOT NULL,
  min_depth NUMERIC,
  max_depth NUMERIC,
  avg_depth NUMERIC,
  readings_count INTEGER,
  safe_areas_count INTEGER,
  caution_areas_count INTEGER,
  danger_areas_count INTEGER,
  objects_detected INTEGER DEFAULT 0,
  anomalies_detected INTEGER DEFAULT 0,
  scan_duration_seconds INTEGER,
  status TEXT NOT NULL CHECK (status IN ('queued', 'scanning', 'analyzing', 'completed', 'failed')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for scans
CREATE INDEX IF NOT EXISTS idx_sonar_scans_vessel_id ON sonar_scans(vessel_id);
CREATE INDEX IF NOT EXISTS idx_sonar_scans_status ON sonar_scans(status);
CREATE INDEX IF NOT EXISTS idx_sonar_scans_started ON sonar_scans(started_at DESC);

-- Create sonar_detections table for detailed object detections
CREATE TABLE IF NOT EXISTS sonar_detections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vessel_id TEXT NOT NULL,
  scan_id UUID REFERENCES sonar_scans(id),
  event_id UUID REFERENCES sonar_events(id),
  object_type TEXT CHECK (object_type IN (
    'shipwreck',
    'submarine',
    'underwater_structure',
    'rock_formation',
    'marine_life',
    'debris',
    'pipeline',
    'cable',
    'unknown'
  )),
  classification_confidence NUMERIC CHECK (classification_confidence >= 0 AND classification_confidence <= 100),
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  depth_meters NUMERIC NOT NULL,
  size_estimate_meters NUMERIC,
  distance_from_vessel_meters NUMERIC,
  bearing_degrees NUMERIC,
  threat_level TEXT CHECK (threat_level IN ('none', 'low', 'medium', 'high', 'critical')),
  ai_classification JSONB,
  sonar_signature JSONB,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  verified BOOLEAN DEFAULT FALSE,
  verified_by UUID REFERENCES profiles(id),
  verified_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for detections
CREATE INDEX IF NOT EXISTS idx_sonar_detections_vessel_id ON sonar_detections(vessel_id);
CREATE INDEX IF NOT EXISTS idx_sonar_detections_scan_id ON sonar_detections(scan_id);
CREATE INDEX IF NOT EXISTS idx_sonar_detections_event_id ON sonar_detections(event_id);
CREATE INDEX IF NOT EXISTS idx_sonar_detections_threat_level ON sonar_detections(threat_level);
CREATE INDEX IF NOT EXISTS idx_sonar_detections_timestamp ON sonar_detections(timestamp DESC);

-- Enable RLS
ALTER TABLE sonar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE sonar_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE sonar_detections ENABLE ROW LEVEL SECURITY;

-- RLS policies - Allow authenticated users to read and insert
CREATE POLICY "Allow authenticated users to read sonar events"
  ON sonar_events FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert sonar events"
  ON sonar_events FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update sonar events"
  ON sonar_events FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to read sonar scans"
  ON sonar_scans FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert sonar scans"
  ON sonar_scans FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update sonar scans"
  ON sonar_scans FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to read sonar detections"
  ON sonar_detections FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert sonar detections"
  ON sonar_detections FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update sonar detections"
  ON sonar_detections FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Function to create a sonar event
CREATE OR REPLACE FUNCTION log_sonar_event(
  p_vessel_id TEXT,
  p_event_type TEXT,
  p_severity TEXT,
  p_description TEXT,
  p_latitude NUMERIC DEFAULT NULL,
  p_longitude NUMERIC DEFAULT NULL,
  p_depth_meters NUMERIC DEFAULT NULL,
  p_confidence_score NUMERIC DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  event_id UUID;
BEGIN
  INSERT INTO sonar_events (
    vessel_id,
    event_type,
    severity,
    description,
    latitude,
    longitude,
    depth_meters,
    confidence_score,
    metadata
  ) VALUES (
    p_vessel_id,
    p_event_type,
    p_severity,
    p_description,
    p_latitude,
    p_longitude,
    p_depth_meters,
    p_confidence_score,
    p_metadata
  )
  RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$$ LANGUAGE plpgsql;

-- Function to start a sonar scan
CREATE OR REPLACE FUNCTION start_sonar_scan(
  p_vessel_id TEXT,
  p_scan_type TEXT,
  p_center_latitude NUMERIC,
  p_center_longitude NUMERIC,
  p_radius_km NUMERIC
) RETURNS UUID AS $$
DECLARE
  scan_id UUID;
BEGIN
  INSERT INTO sonar_scans (
    vessel_id,
    scan_type,
    center_latitude,
    center_longitude,
    radius_km,
    status,
    started_at
  ) VALUES (
    p_vessel_id,
    p_scan_type,
    p_center_latitude,
    p_center_longitude,
    p_radius_km,
    'scanning',
    NOW()
  )
  RETURNING id INTO scan_id;
  
  RETURN scan_id;
END;
$$ LANGUAGE plpgsql;

-- Function to complete a sonar scan
CREATE OR REPLACE FUNCTION complete_sonar_scan(
  p_scan_id UUID,
  p_min_depth NUMERIC,
  p_max_depth NUMERIC,
  p_avg_depth NUMERIC,
  p_readings_count INTEGER,
  p_safe_areas_count INTEGER,
  p_caution_areas_count INTEGER,
  p_danger_areas_count INTEGER
) RETURNS VOID AS $$
BEGIN
  UPDATE sonar_scans SET
    status = 'completed',
    min_depth = p_min_depth,
    max_depth = p_max_depth,
    avg_depth = p_avg_depth,
    readings_count = p_readings_count,
    safe_areas_count = p_safe_areas_count,
    caution_areas_count = p_caution_areas_count,
    danger_areas_count = p_danger_areas_count,
    completed_at = NOW(),
    scan_duration_seconds = EXTRACT(EPOCH FROM (NOW() - started_at))::INTEGER
  WHERE id = p_scan_id;
END;
$$ LANGUAGE plpgsql;

-- Function to log a sonar detection
CREATE OR REPLACE FUNCTION log_sonar_detection(
  p_vessel_id TEXT,
  p_scan_id UUID,
  p_object_type TEXT,
  p_latitude NUMERIC,
  p_longitude NUMERIC,
  p_depth_meters NUMERIC,
  p_threat_level TEXT,
  p_classification_confidence NUMERIC DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  detection_id UUID;
BEGIN
  INSERT INTO sonar_detections (
    vessel_id,
    scan_id,
    object_type,
    latitude,
    longitude,
    depth_meters,
    threat_level,
    classification_confidence
  ) VALUES (
    p_vessel_id,
    p_scan_id,
    p_object_type,
    p_latitude,
    p_longitude,
    p_depth_meters,
    p_threat_level,
    p_classification_confidence
  )
  RETURNING id INTO detection_id;
  
  -- Update scan detections count
  UPDATE sonar_scans
  SET objects_detected = objects_detected + 1
  WHERE id = p_scan_id;
  
  RETURN detection_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get sonar statistics
CREATE OR REPLACE FUNCTION get_sonar_stats(
  p_vessel_id TEXT,
  p_hours INTEGER DEFAULT 24
) RETURNS TABLE (
  total_scans INTEGER,
  completed_scans INTEGER,
  total_events INTEGER,
  critical_events INTEGER,
  total_detections INTEGER,
  high_threat_detections INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*)::INTEGER FROM sonar_scans 
     WHERE vessel_id = p_vessel_id 
     AND created_at > NOW() - (p_hours || ' hours')::INTERVAL) as total_scans,
    (SELECT COUNT(*)::INTEGER FROM sonar_scans 
     WHERE vessel_id = p_vessel_id 
     AND status = 'completed'
     AND created_at > NOW() - (p_hours || ' hours')::INTERVAL) as completed_scans,
    (SELECT COUNT(*)::INTEGER FROM sonar_events 
     WHERE vessel_id = p_vessel_id 
     AND created_at > NOW() - (p_hours || ' hours')::INTERVAL) as total_events,
    (SELECT COUNT(*)::INTEGER FROM sonar_events 
     WHERE vessel_id = p_vessel_id 
     AND severity = 'critical'
     AND created_at > NOW() - (p_hours || ' hours')::INTERVAL) as critical_events,
    (SELECT COUNT(*)::INTEGER FROM sonar_detections 
     WHERE vessel_id = p_vessel_id 
     AND created_at > NOW() - (p_hours || ' hours')::INTERVAL) as total_detections,
    (SELECT COUNT(*)::INTEGER FROM sonar_detections 
     WHERE vessel_id = p_vessel_id 
     AND threat_level IN ('high', 'critical')
     AND created_at > NOW() - (p_hours || ' hours')::INTERVAL) as high_threat_detections;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE sonar_events IS 'PATCH 443 - Sonar event tracking and anomaly detection logging';
COMMENT ON TABLE sonar_scans IS 'PATCH 443 - Bathymetric and obstacle detection scan sessions';
COMMENT ON TABLE sonar_detections IS 'PATCH 443 - Detailed sonar object detections with AI classification';
