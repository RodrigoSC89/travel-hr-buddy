-- PATCHES 446-450: Maritime Operations Consolidation and AI Enhancement
-- Migration: 20251028200000_patches_446_450_maritime_operations.sql
-- This migration creates tables for:
-- PATCH 446: Crew Management (crew_assignments, crew_certifications, crew_performance with views)
-- PATCH 447: Navigation Copilot (route_suggestions with weather and AI tracking)
-- PATCH 448: Sonar AI (sonar_ai_results for analysis and detection)
-- PATCH 449: Route Planner (planned_routes with waypoints and weather integration)
-- PATCH 450: Underwater Drone Control (drone_missions and drone_telemetry)

-- =============================================================================
-- PATCH 447: Navigation Copilot - Route Suggestions
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.route_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  route_name VARCHAR(255) NOT NULL,
  origin JSONB NOT NULL, -- {lat, lng}
  destination JSONB NOT NULL, -- {lat, lng}
  suggested_route JSONB NOT NULL, -- Array of waypoints
  distance_nm DECIMAL(10, 2) NOT NULL,
  estimated_duration_hours DECIMAL(6, 2) NOT NULL,
  risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),
  ai_confidence INTEGER CHECK (ai_confidence >= 0 AND ai_confidence <= 100),
  weather_conditions JSONB, -- Array of weather alerts
  optimization_factors JSONB, -- {avoidStorms, maxWindSpeed, fuelEfficiency, etc.}
  recommended BOOLEAN DEFAULT FALSE,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'accepted', 'rejected', 'expired')),
  valid_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- PATCH 448: Sonar AI - AI Results Storage
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.sonar_ai_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID,
  scan_id UUID,
  analysis_type VARCHAR(100) NOT NULL,
  detected_patterns JSONB, -- Array of pattern objects
  hazards_detected JSONB, -- Array of hazard objects
  safe_zones JSONB, -- Array of safe zone coordinates
  acoustic_signatures JSONB, -- Signal analysis data
  confidence_level DECIMAL(5, 2) CHECK (confidence_level >= 0 AND confidence_level <= 100),
  ai_model_version VARCHAR(50),
  processing_time_ms INTEGER,
  recommendations TEXT,
  bathymetric_data JSONB, -- Depth mapping
  scan_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- PATCH 449: Route Planner - Planned Routes
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.planned_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE SET NULL,
  route_name VARCHAR(255) NOT NULL,
  description TEXT,
  waypoints JSONB NOT NULL, -- Array of waypoint objects with {lat, lng, name}
  origin JSONB NOT NULL,
  destination JSONB NOT NULL,
  distance_nm DECIMAL(10, 2) NOT NULL,
  estimated_duration_hours DECIMAL(6, 2) NOT NULL,
  weather_integrated BOOLEAN DEFAULT FALSE,
  weather_factor DECIMAL(4, 2) DEFAULT 1.0, -- Multiplier for ETA
  eta TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) DEFAULT 'planned' CHECK (status IN ('planned', 'active', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- PATCH 450: Underwater Drone Control - Missions and Telemetry
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.drone_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_name VARCHAR(255) NOT NULL,
  drone_id VARCHAR(100) NOT NULL,
  mission_type VARCHAR(50) CHECK (mission_type IN ('survey', 'inspection', 'maintenance', 'research', 'emergency')),
  planned_waypoints JSONB NOT NULL, -- Array of 3D waypoints {x, y, z, depth}
  actual_trajectory JSONB, -- Recorded path
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  max_depth_meters DECIMAL(8, 2),
  mission_objectives TEXT,
  status VARCHAR(50) DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'aborted', 'failed')),
  completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.drone_telemetry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID REFERENCES public.drone_missions(id) ON DELETE CASCADE,
  drone_id VARCHAR(100) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  position_x DECIMAL(10, 4),
  position_y DECIMAL(10, 4),
  position_z DECIMAL(10, 4),
  depth_meters DECIMAL(8, 2),
  heading_degrees DECIMAL(5, 2),
  pitch_degrees DECIMAL(5, 2),
  roll_degrees DECIMAL(5, 2),
  battery_percentage INTEGER CHECK (battery_percentage >= 0 AND battery_percentage <= 100),
  water_temperature_celsius DECIMAL(5, 2),
  pressure_bar DECIMAL(8, 2),
  velocity_mps DECIMAL(6, 2),
  camera_status VARCHAR(50),
  sonar_status VARCHAR(50),
  system_health VARCHAR(50),
  alerts JSONB, -- Array of alert messages
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- INDEXES for Performance
-- =============================================================================

-- Route Suggestions Indexes
CREATE INDEX IF NOT EXISTS idx_route_suggestions_user_id ON public.route_suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_route_suggestions_created_at ON public.route_suggestions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_route_suggestions_status ON public.route_suggestions(status);
CREATE INDEX IF NOT EXISTS idx_route_suggestions_recommended ON public.route_suggestions(recommended) WHERE recommended = TRUE;

-- Sonar AI Results Indexes
CREATE INDEX IF NOT EXISTS idx_sonar_ai_results_mission_id ON public.sonar_ai_results(mission_id);
CREATE INDEX IF NOT EXISTS idx_sonar_ai_results_scan_timestamp ON public.sonar_ai_results(scan_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_sonar_ai_results_user_id ON public.sonar_ai_results(user_id);

-- Planned Routes Indexes
CREATE INDEX IF NOT EXISTS idx_planned_routes_user_id ON public.planned_routes(user_id);
CREATE INDEX IF NOT EXISTS idx_planned_routes_vessel_id ON public.planned_routes(vessel_id);
CREATE INDEX IF NOT EXISTS idx_planned_routes_status ON public.planned_routes(status);
CREATE INDEX IF NOT EXISTS idx_planned_routes_eta ON public.planned_routes(eta);
CREATE INDEX IF NOT EXISTS idx_planned_routes_created_at ON public.planned_routes(created_at DESC);

-- Drone Missions Indexes
CREATE INDEX IF NOT EXISTS idx_drone_missions_drone_id ON public.drone_missions(drone_id);
CREATE INDEX IF NOT EXISTS idx_drone_missions_status ON public.drone_missions(status);
CREATE INDEX IF NOT EXISTS idx_drone_missions_user_id ON public.drone_missions(user_id);
CREATE INDEX IF NOT EXISTS idx_drone_missions_start_time ON public.drone_missions(start_time DESC);

-- Drone Telemetry Indexes
CREATE INDEX IF NOT EXISTS idx_drone_telemetry_mission_id ON public.drone_telemetry(mission_id);
CREATE INDEX IF NOT EXISTS idx_drone_telemetry_drone_id ON public.drone_telemetry(drone_id);
CREATE INDEX IF NOT EXISTS idx_drone_telemetry_timestamp ON public.drone_telemetry(timestamp DESC);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

ALTER TABLE public.route_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sonar_ai_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planned_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drone_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drone_telemetry ENABLE ROW LEVEL SECURITY;

-- Route Suggestions Policies
CREATE POLICY "Users can view their own route suggestions"
  ON public.route_suggestions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create route suggestions"
  ON public.route_suggestions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own route suggestions"
  ON public.route_suggestions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own route suggestions"
  ON public.route_suggestions FOR DELETE
  USING (auth.uid() = user_id);

-- Sonar AI Results Policies
CREATE POLICY "Users can view sonar AI results"
  ON public.sonar_ai_results FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Authenticated users can create sonar AI results"
  ON public.sonar_ai_results FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own sonar AI results"
  ON public.sonar_ai_results FOR UPDATE
  USING (auth.uid() = user_id);

-- Planned Routes Policies
CREATE POLICY "Users can view their own planned routes"
  ON public.planned_routes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create planned routes"
  ON public.planned_routes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own planned routes"
  ON public.planned_routes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own planned routes"
  ON public.planned_routes FOR DELETE
  USING (auth.uid() = user_id);

-- Drone Missions Policies
CREATE POLICY "Users can view their own drone missions"
  ON public.drone_missions FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Authenticated users can create drone missions"
  ON public.drone_missions FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own drone missions"
  ON public.drone_missions FOR UPDATE
  USING (auth.uid() = user_id);

-- Drone Telemetry Policies
CREATE POLICY "Authenticated users can view drone telemetry"
  ON public.drone_telemetry FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create drone telemetry"
  ON public.drone_telemetry FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- =============================================================================
-- HELPER VIEWS for Crew Management (PATCH 446)
-- =============================================================================

-- View for active crew assignments
CREATE OR REPLACE VIEW public.active_crew_assignments AS
SELECT 
  ca.id,
  ca.crew_member_id,
  cm.full_name,
  cm.position,
  cm.rank,
  ca.vessel_id,
  ca.start_date,
  ca.end_date,
  ca.status,
  ca.notes
FROM public.crew_assignments ca
JOIN public.crew_members cm ON ca.crew_member_id = cm.id
WHERE ca.status = 'active';

-- View for expiring certifications (within 30 days)
CREATE OR REPLACE VIEW public.expiring_certifications AS
SELECT 
  cc.id,
  cc.crew_member_id,
  cm.full_name,
  cm.position,
  cc.certification_name,
  cc.certification_type,
  cc.expiry_date,
  cc.issuing_authority,
  (cc.expiry_date - CURRENT_DATE) AS days_until_expiry
FROM public.crew_certifications cc
JOIN public.crew_members cm ON cc.crew_member_id = cm.id
WHERE cc.expiry_date IS NOT NULL
  AND cc.expiry_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
  AND cc.status = 'valid'
ORDER BY cc.expiry_date ASC;

-- =============================================================================
-- AUDIT TRIGGERS
-- =============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all tables
CREATE TRIGGER update_route_suggestions_updated_at
  BEFORE UPDATE ON public.route_suggestions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sonar_ai_results_updated_at
  BEFORE UPDATE ON public.sonar_ai_results
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_planned_routes_updated_at
  BEFORE UPDATE ON public.planned_routes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_drone_missions_updated_at
  BEFORE UPDATE ON public.drone_missions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- COMMENTS for Documentation
-- =============================================================================

COMMENT ON TABLE public.route_suggestions IS 'PATCH 447: AI-powered route suggestions with weather integration';
COMMENT ON TABLE public.sonar_ai_results IS 'PATCH 448: Sonar AI analysis results and pattern detection';
COMMENT ON TABLE public.planned_routes IS 'PATCH 449: Enhanced route planning with dynamic ETA';
COMMENT ON TABLE public.drone_missions IS 'PATCH 450: Underwater drone mission planning';
COMMENT ON TABLE public.drone_telemetry IS 'PATCH 450: Real-time drone telemetry data';
