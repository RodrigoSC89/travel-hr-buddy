-- PATCH 421-425: Maritime Operations Modules
-- Complete implementation of Document Hub consolidation, Coordination AI, 
-- Ocean Sonar, Underwater Drone, and Navigation Copilot

-- =============================================================================
-- PATCH 422: Coordination AI - Multi-agent orchestration and decision logging
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.coordination_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  context TEXT NOT NULL,
  decision TEXT NOT NULL,
  agent_type TEXT CHECK (agent_type IN ('mission_control', 'fleet_manager', 'weather_monitor', 'emergency_handler')),
  agent_id TEXT,
  confidence DECIMAL(3,2) CHECK (confidence >= 0 AND confidence <= 1),
  outcome TEXT CHECK (outcome IN ('success', 'pending', 'failed')),
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_coordination_decisions_agent_type ON public.coordination_decisions(agent_type);
CREATE INDEX idx_coordination_decisions_created_at ON public.coordination_decisions(created_at DESC);
CREATE INDEX idx_coordination_decisions_confidence ON public.coordination_decisions(confidence DESC);
CREATE INDEX idx_coordination_decisions_outcome ON public.coordination_decisions(outcome);

-- RLS for coordination_decisions
ALTER TABLE public.coordination_decisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view coordination decisions"
  ON public.coordination_decisions FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert coordination decisions"
  ON public.coordination_decisions FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND created_by = auth.uid());

-- =============================================================================
-- PATCH 423: Ocean Sonar - Bathymetric data and event tracking
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.sonar_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID,
  location JSONB NOT NULL, -- {lat, lng}
  depth_meters DECIMAL(10,2) NOT NULL,
  signal_strength DECIMAL(5,2),
  temperature_celsius DECIMAL(5,2),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  bathymetric_data JSONB DEFAULT '{}', -- Full scan data
  risk_level TEXT CHECK (risk_level IN ('safe', 'caution', 'danger')),
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.sonar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_id UUID REFERENCES public.sonar_signals(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('obstacle', 'shallow_water', 'temperature_anomaly', 'signal_loss', 'navigation_hazard')),
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT,
  location JSONB NOT NULL, -- {lat, lng}
  auto_detected BOOLEAN DEFAULT true,
  acknowledged BOOLEAN DEFAULT false,
  acknowledged_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_sonar_signals_vessel_id ON public.sonar_signals(vessel_id);
CREATE INDEX idx_sonar_signals_timestamp ON public.sonar_signals(timestamp DESC);
CREATE INDEX idx_sonar_signals_risk_level ON public.sonar_signals(risk_level);
CREATE INDEX idx_sonar_signals_location ON public.sonar_signals USING GIN (location);

CREATE INDEX idx_sonar_events_signal_id ON public.sonar_events(signal_id);
CREATE INDEX idx_sonar_events_event_type ON public.sonar_events(event_type);
CREATE INDEX idx_sonar_events_severity ON public.sonar_events(severity);
CREATE INDEX idx_sonar_events_acknowledged ON public.sonar_events(acknowledged);
CREATE INDEX idx_sonar_events_created_at ON public.sonar_events(created_at DESC);

-- RLS for sonar tables
ALTER TABLE public.sonar_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sonar_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view sonar signals"
  ON public.sonar_signals FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert sonar signals"
  ON public.sonar_signals FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view sonar events"
  ON public.sonar_events FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert sonar events"
  ON public.sonar_events FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can acknowledge sonar events"
  ON public.sonar_events FOR UPDATE
  USING (auth.role() = 'authenticated');

-- =============================================================================
-- PATCH 424: Underwater Drone - Mission tracking and operation logs
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.drone_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  drone_id TEXT NOT NULL,
  mission_type TEXT CHECK (mission_type IN ('survey', 'inspection', 'repair', 'exploration', 'emergency')),
  status TEXT CHECK (status IN ('planned', 'active', 'paused', 'completed', 'aborted', 'failed')),
  start_location JSONB NOT NULL, -- {lat, lng, depth}
  end_location JSONB,
  waypoints JSONB DEFAULT '[]', -- Array of {lat, lng, depth, timestamp}
  planned_start TIMESTAMP WITH TIME ZONE,
  actual_start TIMESTAMP WITH TIME ZONE,
  planned_end TIMESTAMP WITH TIME ZONE,
  actual_end TIMESTAMP WITH TIME ZONE,
  max_depth_meters DECIMAL(10,2),
  distance_traveled_meters DECIMAL(10,2),
  mission_objectives JSONB DEFAULT '[]',
  mission_summary TEXT,
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.drone_operation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID REFERENCES public.drone_missions(id) ON DELETE CASCADE,
  drone_id TEXT NOT NULL,
  log_type TEXT CHECK (log_type IN ('telemetry', 'command', 'alert', 'error', 'system')),
  severity TEXT CHECK (severity IN ('info', 'warning', 'error', 'critical')),
  message TEXT NOT NULL,
  position JSONB, -- {lat, lng, depth, altitude}
  telemetry_data JSONB DEFAULT '{}', -- battery, temperature, pressure, etc.
  metadata JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_drone_missions_drone_id ON public.drone_missions(drone_id);
CREATE INDEX idx_drone_missions_status ON public.drone_missions(status);
CREATE INDEX idx_drone_missions_mission_type ON public.drone_missions(mission_type);
CREATE INDEX idx_drone_missions_created_at ON public.drone_missions(created_at DESC);

CREATE INDEX idx_drone_operation_logs_mission_id ON public.drone_operation_logs(mission_id);
CREATE INDEX idx_drone_operation_logs_drone_id ON public.drone_operation_logs(drone_id);
CREATE INDEX idx_drone_operation_logs_log_type ON public.drone_operation_logs(log_type);
CREATE INDEX idx_drone_operation_logs_severity ON public.drone_operation_logs(severity);
CREATE INDEX idx_drone_operation_logs_timestamp ON public.drone_operation_logs(timestamp DESC);

-- RLS for drone tables
ALTER TABLE public.drone_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drone_operation_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view drone missions"
  ON public.drone_missions FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create drone missions"
  ON public.drone_missions FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND created_by = auth.uid());

CREATE POLICY "Users can update their own drone missions"
  ON public.drone_missions FOR UPDATE
  USING (created_by = auth.uid());

CREATE POLICY "Authenticated users can view drone operation logs"
  ON public.drone_operation_logs FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert drone operation logs"
  ON public.drone_operation_logs FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Trigger to update updated_at on drone_missions
CREATE OR REPLACE FUNCTION update_drone_missions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_drone_missions_updated_at
  BEFORE UPDATE ON public.drone_missions
  FOR EACH ROW
  EXECUTE FUNCTION update_drone_missions_updated_at();

-- =============================================================================
-- PATCH 425: Navigation Copilot - Route planning and weather alerts
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.navigation_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_name TEXT NOT NULL,
  vessel_id UUID,
  origin JSONB NOT NULL, -- {lat, lng, name}
  destination JSONB NOT NULL, -- {lat, lng, name}
  waypoints JSONB DEFAULT '[]', -- Array of {lat, lng, timestamp, speed, heading}
  distance_nautical_miles DECIMAL(10,2),
  estimated_duration_hours DECIMAL(10,2),
  eta_calculated TIMESTAMP WITH TIME ZONE,
  eta_with_weather TIMESTAMP WITH TIME ZONE,
  route_type TEXT CHECK (route_type IN ('direct', 'weather_optimized', 'fuel_optimized', 'safety_optimized')),
  risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),
  is_recommended BOOLEAN DEFAULT false,
  status TEXT CHECK (status IN ('planned', 'active', 'completed', 'cancelled')),
  weather_conditions JSONB DEFAULT '{}',
  optimization_metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.navigation_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID REFERENCES public.navigation_routes(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('storm', 'high_winds', 'poor_visibility', 'high_waves', 'ice', 'piracy', 'restricted_area')),
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  description TEXT,
  location JSONB NOT NULL, -- {lat, lng}
  affected_radius_nautical_miles DECIMAL(10,2),
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT now(),
  valid_until TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  acknowledged BOOLEAN DEFAULT false,
  acknowledged_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_navigation_routes_vessel_id ON public.navigation_routes(vessel_id);
CREATE INDEX idx_navigation_routes_status ON public.navigation_routes(status);
CREATE INDEX idx_navigation_routes_route_type ON public.navigation_routes(route_type);
CREATE INDEX idx_navigation_routes_risk_score ON public.navigation_routes(risk_score);
CREATE INDEX idx_navigation_routes_is_recommended ON public.navigation_routes(is_recommended);
CREATE INDEX idx_navigation_routes_created_at ON public.navigation_routes(created_at DESC);

CREATE INDEX idx_navigation_alerts_route_id ON public.navigation_alerts(route_id);
CREATE INDEX idx_navigation_alerts_alert_type ON public.navigation_alerts(alert_type);
CREATE INDEX idx_navigation_alerts_severity ON public.navigation_alerts(severity);
CREATE INDEX idx_navigation_alerts_is_active ON public.navigation_alerts(is_active);
CREATE INDEX idx_navigation_alerts_acknowledged ON public.navigation_alerts(acknowledged);
CREATE INDEX idx_navigation_alerts_valid_until ON public.navigation_alerts(valid_until);

-- RLS for navigation tables
ALTER TABLE public.navigation_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.navigation_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view navigation routes"
  ON public.navigation_routes FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create navigation routes"
  ON public.navigation_routes FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND created_by = auth.uid());

CREATE POLICY "Users can update their own navigation routes"
  ON public.navigation_routes FOR UPDATE
  USING (created_by = auth.uid());

CREATE POLICY "Authenticated users can view navigation alerts"
  ON public.navigation_alerts FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create navigation alerts"
  ON public.navigation_alerts FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can acknowledge navigation alerts"
  ON public.navigation_alerts FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Trigger to update updated_at on navigation_routes
CREATE OR REPLACE FUNCTION update_navigation_routes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_navigation_routes_updated_at
  BEFORE UPDATE ON public.navigation_routes
  FOR EACH ROW
  EXECUTE FUNCTION update_navigation_routes_updated_at();

-- =============================================================================
-- Sample Data for Testing
-- =============================================================================

-- Insert sample coordination decision
INSERT INTO public.coordination_decisions (context, decision, agent_type, confidence, outcome, metadata)
VALUES 
  ('Fleet coordination request for vessel repositioning', 'Assigned vessel MV-001 to new mission', 'fleet_manager', 0.92, 'success', '{"priority": "high", "vessel_count": 1}'),
  ('Weather alert in operational area', 'Rerouted vessel MV-002 to safer route', 'weather_monitor', 0.88, 'success', '{"alert_type": "storm", "severity": "high"}');

-- Insert sample sonar signal
INSERT INTO public.sonar_signals (location, depth_meters, signal_strength, temperature_celsius, risk_level, bathymetric_data)
VALUES 
  ('{"lat": -23.5505, "lng": -46.6333}', 150.5, 85.3, 18.5, 'safe', '{"scan_radius_km": 50, "reading_count": 1200}'),
  ('{"lat": -23.5600, "lng": -46.6400}', 45.2, 78.5, 19.1, 'caution', '{"scan_radius_km": 50, "reading_count": 1150}');

-- Insert sample drone mission
INSERT INTO public.drone_missions (name, drone_id, mission_type, status, start_location, waypoints, max_depth_meters)
VALUES 
  ('Hull Inspection Alpha', 'ROV-001', 'inspection', 'planned', '{"lat": -23.5505, "lng": -46.6333, "depth": 0}', '[{"lat": -23.5510, "lng": -46.6340, "depth": 50}]', 100.0);

-- Insert sample navigation route
INSERT INTO public.navigation_routes (route_name, origin, destination, distance_nautical_miles, estimated_duration_hours, route_type, risk_score, is_recommended)
VALUES 
  ('Santos to Rio Grande', '{"lat": -23.9608, "lng": -46.3333, "name": "Port of Santos"}', '{"lat": -32.0345, "lng": -52.0985, "name": "Rio Grande"}', 520.5, 52.0, 'weather_optimized', 25, true);

-- Insert sample navigation alert
INSERT INTO public.navigation_alerts (route_id, alert_type, severity, title, description, location, affected_radius_nautical_miles)
SELECT 
  id,
  'high_winds',
  'medium',
  'High winds forecasted',
  'Wind speeds up to 35 knots expected in the area',
  '{"lat": -28.0000, "lng": -49.0000}',
  50.0
FROM public.navigation_routes
WHERE route_name = 'Santos to Rio Grande'
LIMIT 1;

-- =============================================================================
-- Comments for Documentation
-- =============================================================================

COMMENT ON TABLE public.coordination_decisions IS 'PATCH 422: AI decision audit trail for multi-agent coordination with confidence scores';
COMMENT ON TABLE public.sonar_signals IS 'PATCH 423: Bathymetric sonar data for ocean floor mapping and depth analysis';
COMMENT ON TABLE public.sonar_events IS 'PATCH 423: Events and alerts detected from sonar signals';
COMMENT ON TABLE public.drone_missions IS 'PATCH 424: Mission tracking for underwater ROV/AUV operations';
COMMENT ON TABLE public.drone_operation_logs IS 'PATCH 424: Detailed operation logs and telemetry from drone missions';
COMMENT ON TABLE public.navigation_routes IS 'PATCH 425: AI-powered route planning with weather integration';
COMMENT ON TABLE public.navigation_alerts IS 'PATCH 425: Weather and navigation hazard alerts along routes';
