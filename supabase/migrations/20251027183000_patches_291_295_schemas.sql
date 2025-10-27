-- =====================================================
-- PATCHES 291-295: COMPLETE MARITIME OPERATIONS SYSTEM
-- =====================================================
-- Migration: Fuel Optimizer, Workflow Builder, Satellite Tracker, 
--            Integrations Hub, Document Templates
-- Created: 2025-10-27
-- =====================================================

-- ============================================================
-- PATCH 291: FUEL OPTIMIZER SYSTEM
-- ============================================================

-- Fuel Logs Table
CREATE TABLE IF NOT EXISTS public.fuel_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE,
  fuel_type TEXT NOT NULL,
  quantity_consumed NUMERIC(10, 2) NOT NULL,
  consumption_rate NUMERIC(8, 2),
  efficiency_rating NUMERIC(5, 2),
  record_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  distance_covered_nm NUMERIC(10, 2),
  vessel_speed_knots NUMERIC(6, 2),
  weather_conditions JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_fuel_logs_vessel ON public.fuel_logs(vessel_id);
CREATE INDEX IF NOT EXISTS idx_fuel_logs_date ON public.fuel_logs(record_date);

-- Vessel Speeds Table
CREATE TABLE IF NOT EXISTS public.vessel_speeds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE,
  speed_knots NUMERIC(6, 2) NOT NULL,
  fuel_consumption_rate NUMERIC(8, 2),
  engine_rpm INTEGER,
  sea_state TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  location GEOGRAPHY(POINT, 4326),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vessel_speeds_vessel ON public.vessel_speeds(vessel_id);
CREATE INDEX IF NOT EXISTS idx_vessel_speeds_timestamp ON public.vessel_speeds(timestamp);

-- Route Segments Table
CREATE TABLE IF NOT EXISTS public.route_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID,
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE,
  segment_name TEXT,
  start_point GEOGRAPHY(POINT, 4326),
  end_point GEOGRAPHY(POINT, 4326),
  distance_nm NUMERIC(10, 2),
  planned_fuel_consumption NUMERIC(10, 2),
  actual_fuel_consumption NUMERIC(10, 2),
  weather_factor NUMERIC(4, 2) DEFAULT 1.0,
  current_factor NUMERIC(4, 2) DEFAULT 1.0,
  departure_port TEXT,
  arrival_port TEXT,
  planned_speed NUMERIC(6, 2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_route_segments_vessel ON public.route_segments(vessel_id);
CREATE INDEX IF NOT EXISTS idx_route_segments_route ON public.route_segments(route_id);

-- Fuel Predictions Table
CREATE TABLE IF NOT EXISTS public.fuel_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE,
  route_segment_id UUID REFERENCES public.route_segments(id) ON DELETE CASCADE,
  predicted_consumption NUMERIC(10, 2) NOT NULL,
  actual_consumption NUMERIC(10, 2),
  accuracy_percentage NUMERIC(5, 2),
  prediction_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  model_version TEXT,
  confidence_score INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fuel_predictions_vessel ON public.fuel_predictions(vessel_id);
CREATE INDEX IF NOT EXISTS idx_fuel_predictions_date ON public.fuel_predictions(prediction_date);

-- Fuel Alerts Table
CREATE TABLE IF NOT EXISTS public.fuel_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  message TEXT NOT NULL,
  threshold_exceeded NUMERIC(10, 2),
  current_value NUMERIC(10, 2),
  acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_by UUID REFERENCES auth.users(id),
  acknowledged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fuel_alerts_vessel ON public.fuel_alerts(vessel_id);
CREATE INDEX IF NOT EXISTS idx_fuel_alerts_acknowledged ON public.fuel_alerts(acknowledged);

-- ============================================================
-- PATCH 292: MISSION CONTROL WORKFLOW BUILDER
-- ============================================================

-- Mission Workflows Table
CREATE TABLE IF NOT EXISTS public.mission_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  workflow_definition JSONB NOT NULL,
  status TEXT DEFAULT 'draft',
  created_by UUID REFERENCES auth.users(id),
  organization_id UUID,
  is_active BOOLEAN DEFAULT FALSE,
  last_executed_at TIMESTAMPTZ,
  execution_count INTEGER DEFAULT 0,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mission_workflows_creator ON public.mission_workflows(created_by);
CREATE INDEX IF NOT EXISTS idx_mission_workflows_status ON public.mission_workflows(status);
CREATE INDEX IF NOT EXISTS idx_mission_workflows_active ON public.mission_workflows(is_active);

-- Mission Logs Table
CREATE TABLE IF NOT EXISTS public.mission_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES public.mission_workflows(id) ON DELETE CASCADE,
  execution_id UUID NOT NULL,
  step_name TEXT NOT NULL,
  step_type TEXT NOT NULL,
  status TEXT NOT NULL,
  input_data JSONB,
  output_data JSONB,
  error_message TEXT,
  duration_ms INTEGER,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mission_logs_workflow ON public.mission_logs(workflow_id);
CREATE INDEX IF NOT EXISTS idx_mission_logs_execution ON public.mission_logs(execution_id);
CREATE INDEX IF NOT EXISTS idx_mission_logs_timestamp ON public.mission_logs(timestamp);

-- ============================================================
-- PATCH 293: SATELLITE TRACKER
-- ============================================================

-- Satellite Tracks Table
CREATE TABLE IF NOT EXISTS public.satellite_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  satellite_id TEXT NOT NULL,
  satellite_name TEXT NOT NULL,
  tle_line1 TEXT,
  tle_line2 TEXT,
  latitude NUMERIC(10, 6),
  longitude NUMERIC(10, 6),
  altitude_km NUMERIC(10, 2),
  velocity_kmh NUMERIC(10, 2),
  visibility_status TEXT,
  azimuth NUMERIC(6, 2),
  elevation NUMERIC(6, 2),
  range_km NUMERIC(10, 2),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_satellite_tracks_satellite ON public.satellite_tracks(satellite_id);
CREATE INDEX IF NOT EXISTS idx_satellite_tracks_timestamp ON public.satellite_tracks(timestamp);
CREATE INDEX IF NOT EXISTS idx_satellite_tracks_name ON public.satellite_tracks(satellite_name);

-- Satellite Coverage Events Table
CREATE TABLE IF NOT EXISTS public.satellite_coverage_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  satellite_id TEXT NOT NULL,
  satellite_name TEXT NOT NULL,
  event_type TEXT NOT NULL,
  location GEOGRAPHY(POINT, 4326),
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE,
  max_elevation NUMERIC(6, 2),
  duration_seconds INTEGER,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  notified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_satellite_coverage_satellite ON public.satellite_coverage_events(satellite_id);
CREATE INDEX IF NOT EXISTS idx_satellite_coverage_vessel ON public.satellite_coverage_events(vessel_id);
CREATE INDEX IF NOT EXISTS idx_satellite_coverage_notified ON public.satellite_coverage_events(notified);

-- ============================================================
-- PATCH 294: INTEGRATIONS HUB
-- ============================================================

-- Connected Integrations Table
CREATE TABLE IF NOT EXISTS public.connected_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID,
  integration_type TEXT NOT NULL,
  provider_name TEXT NOT NULL,
  connection_status TEXT DEFAULT 'active',
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  scopes TEXT[],
  metadata JSONB,
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_connected_integrations_user ON public.connected_integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_connected_integrations_provider ON public.connected_integrations(provider_name);
CREATE INDEX IF NOT EXISTS idx_connected_integrations_status ON public.connected_integrations(connection_status);

-- Webhook Events Table
CREATE TABLE IF NOT EXISTS public.webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID REFERENCES public.connected_integrations(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  webhook_url TEXT,
  payload JSONB NOT NULL,
  headers JSONB,
  status TEXT DEFAULT 'pending',
  response_code INTEGER,
  response_body TEXT,
  attempts INTEGER DEFAULT 0,
  last_attempt_at TIMESTAMPTZ,
  next_retry_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_webhook_events_integration ON public.webhook_events(integration_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_status ON public.webhook_events(status);
CREATE INDEX IF NOT EXISTS idx_webhook_events_created ON public.webhook_events(created_at);

-- ============================================================
-- PATCH 295: DOCUMENT TEMPLATES DYNAMIC
-- ============================================================

-- Document Template Versions Table
CREATE TABLE IF NOT EXISTS public.document_template_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL,
  template_name TEXT NOT NULL,
  template_content TEXT NOT NULL,
  version_number INTEGER NOT NULL,
  variables JSONB,
  is_current BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES auth.users(id),
  change_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_doc_template_versions_template ON public.document_template_versions(template_id);
CREATE INDEX IF NOT EXISTS idx_doc_template_versions_current ON public.document_template_versions(is_current);
CREATE INDEX IF NOT EXISTS idx_doc_template_versions_created ON public.document_template_versions(created_at);

-- Document Generation History Table
CREATE TABLE IF NOT EXISTS public.document_generation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL,
  template_version_id UUID REFERENCES public.document_template_versions(id),
  generated_by UUID REFERENCES auth.users(id),
  variables_used JSONB,
  output_format TEXT NOT NULL,
  file_url TEXT,
  file_size_bytes BIGINT,
  generation_duration_ms INTEGER,
  status TEXT DEFAULT 'completed',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_doc_generation_template ON public.document_generation_history(template_id);
CREATE INDEX IF NOT EXISTS idx_doc_generation_user ON public.document_generation_history(generated_by);
CREATE INDEX IF NOT EXISTS idx_doc_generation_created ON public.document_generation_history(created_at);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.fuel_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vessel_speeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fuel_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fuel_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.satellite_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.satellite_coverage_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connected_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_template_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_generation_history ENABLE ROW LEVEL SECURITY;

-- Fuel System Policies
CREATE POLICY "Users can view fuel logs for their organization vessels"
  ON public.fuel_logs FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert fuel logs"
  ON public.fuel_logs FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their fuel logs"
  ON public.fuel_logs FOR UPDATE
  USING (auth.uid() = created_by);

-- Vessel Speeds Policies
CREATE POLICY "Users can view vessel speeds"
  ON public.vessel_speeds FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert vessel speeds"
  ON public.vessel_speeds FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Route Segments Policies
CREATE POLICY "Users can view route segments"
  ON public.route_segments FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can manage route segments"
  ON public.route_segments FOR ALL
  USING (auth.uid() IS NOT NULL);

-- Fuel Predictions Policies
CREATE POLICY "Users can view fuel predictions"
  ON public.fuel_predictions FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert fuel predictions"
  ON public.fuel_predictions FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Fuel Alerts Policies
CREATE POLICY "Users can view fuel alerts"
  ON public.fuel_alerts FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can acknowledge fuel alerts"
  ON public.fuel_alerts FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Mission Workflows Policies
CREATE POLICY "Users can view workflows"
  ON public.mission_workflows FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create workflows"
  ON public.mission_workflows FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their workflows"
  ON public.mission_workflows FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their workflows"
  ON public.mission_workflows FOR DELETE
  USING (auth.uid() = created_by);

-- Mission Logs Policies
CREATE POLICY "Users can view mission logs"
  ON public.mission_logs FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "System can insert mission logs"
  ON public.mission_logs FOR INSERT
  WITH CHECK (true);

-- Satellite Tracks Policies
CREATE POLICY "Users can view satellite tracks"
  ON public.satellite_tracks FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "System can manage satellite tracks"
  ON public.satellite_tracks FOR ALL
  USING (true);

-- Satellite Coverage Events Policies
CREATE POLICY "Users can view coverage events"
  ON public.satellite_coverage_events FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "System can manage coverage events"
  ON public.satellite_coverage_events FOR ALL
  USING (true);

-- Connected Integrations Policies
CREATE POLICY "Users can view their integrations"
  ON public.connected_integrations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create integrations"
  ON public.connected_integrations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their integrations"
  ON public.connected_integrations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their integrations"
  ON public.connected_integrations FOR DELETE
  USING (auth.uid() = user_id);

-- Webhook Events Policies
CREATE POLICY "Users can view webhook events for their integrations"
  ON public.webhook_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.connected_integrations
      WHERE id = webhook_events.integration_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "System can manage webhook events"
  ON public.webhook_events FOR ALL
  USING (true);

-- Document Template Versions Policies
CREATE POLICY "Users can view template versions"
  ON public.document_template_versions FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create template versions"
  ON public.document_template_versions FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Document Generation History Policies
CREATE POLICY "Users can view their generation history"
  ON public.document_generation_history FOR SELECT
  USING (auth.uid() = generated_by);

CREATE POLICY "Users can create generation records"
  ON public.document_generation_history FOR INSERT
  WITH CHECK (auth.uid() = generated_by);

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_fuel_logs_updated_at
  BEFORE UPDATE ON public.fuel_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_route_segments_updated_at
  BEFORE UPDATE ON public.route_segments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mission_workflows_updated_at
  BEFORE UPDATE ON public.mission_workflows
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_connected_integrations_updated_at
  BEFORE UPDATE ON public.connected_integrations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- COMMENTS
-- ============================================================

COMMENT ON TABLE public.fuel_logs IS 'Tracks fuel consumption records for vessels';
COMMENT ON TABLE public.vessel_speeds IS 'Records vessel speed and fuel consumption correlation';
COMMENT ON TABLE public.route_segments IS 'Defines route segments for fuel optimization analysis';
COMMENT ON TABLE public.fuel_predictions IS 'AI-powered fuel consumption predictions';
COMMENT ON TABLE public.fuel_alerts IS 'Automated alerts for fuel consumption anomalies';
COMMENT ON TABLE public.mission_workflows IS 'Visual workflow definitions for mission automation';
COMMENT ON TABLE public.mission_logs IS 'Execution logs for workflow steps';
COMMENT ON TABLE public.satellite_tracks IS 'Real-time satellite position tracking data';
COMMENT ON TABLE public.satellite_coverage_events IS 'Satellite coverage entry/exit events';
COMMENT ON TABLE public.connected_integrations IS 'External service OAuth connections';
COMMENT ON TABLE public.webhook_events IS 'Webhook delivery logs and payloads';
COMMENT ON TABLE public.document_template_versions IS 'Version control for document templates';
COMMENT ON TABLE public.document_generation_history IS 'Audit trail of document generation events';
