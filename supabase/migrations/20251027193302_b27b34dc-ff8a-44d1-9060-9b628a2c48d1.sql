-- PATCH 291-295: Create missing tables for validation

-- PATCH 291: Fuel Optimizer - Missing tables
CREATE TABLE IF NOT EXISTS public.fuel_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES auth.users(id),
  vessel_id UUID,
  fuel_type TEXT NOT NULL DEFAULT 'diesel',
  quantity_liters NUMERIC NOT NULL,
  consumption_rate_lph NUMERIC,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  location_latitude NUMERIC,
  location_longitude NUMERIC,
  vessel_speed_knots NUMERIC,
  weather_condition TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.route_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES auth.users(id),
  route_id UUID,
  segment_name TEXT NOT NULL,
  departure_port TEXT NOT NULL,
  arrival_port TEXT NOT NULL,
  distance_nm NUMERIC NOT NULL,
  estimated_duration_hours NUMERIC,
  weather_factor NUMERIC DEFAULT 1.0,
  current_factor NUMERIC DEFAULT 1.0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.vessel_speeds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES auth.users(id),
  vessel_id UUID,
  recorded_speed_knots NUMERIC NOT NULL,
  optimal_speed_knots NUMERIC,
  fuel_efficiency_rating NUMERIC,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  route_segment_id UUID REFERENCES public.route_segments(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- PATCH 292: Mission Control - Workflow table
CREATE TABLE IF NOT EXISTS public.mission_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES auth.users(id),
  created_by UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  description TEXT,
  workflow_definition JSONB NOT NULL,
  status TEXT DEFAULT 'draft',
  is_active BOOLEAN DEFAULT true,
  execution_count INTEGER DEFAULT 0,
  last_executed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- PATCH 293: Satellite Tracker - satellite_tracks table
CREATE TABLE IF NOT EXISTS public.satellite_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES auth.users(id),
  satellite_id TEXT NOT NULL,
  satellite_name TEXT NOT NULL,
  norad_id INTEGER,
  tle_line1 TEXT,
  tle_line2 TEXT,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  altitude_km NUMERIC NOT NULL,
  velocity_kmh NUMERIC NOT NULL,
  visibility_status TEXT DEFAULT 'visible',
  azimuth NUMERIC,
  elevation NUMERIC,
  range_km NUMERIC,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- PATCH 294: Integrations Hub - connected_integrations and webhook_events
CREATE TABLE IF NOT EXISTS public.connected_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES auth.users(id),
  user_id UUID REFERENCES auth.users(id),
  provider TEXT NOT NULL,
  integration_name TEXT NOT NULL,
  oauth_access_token TEXT,
  oauth_refresh_token TEXT,
  oauth_token_expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  scopes TEXT[],
  metadata JSONB,
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES auth.users(id),
  integration_id UUID REFERENCES public.connected_integrations(id),
  event_type TEXT NOT NULL,
  event_name TEXT NOT NULL,
  payload JSONB NOT NULL,
  source_ip TEXT,
  headers JSONB,
  status TEXT DEFAULT 'received',
  processed_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- PATCH 295: Document Templates - document_template_versions
CREATE TABLE IF NOT EXISTS public.document_template_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES auth.users(id),
  template_id UUID REFERENCES public.document_templates(id) ON DELETE CASCADE,
  template_name TEXT NOT NULL,
  template_content TEXT NOT NULL,
  version_number INTEGER NOT NULL DEFAULT 1,
  variables JSONB,
  is_current BOOLEAN DEFAULT true,
  change_description TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(template_id, version_number)
);

-- Enable RLS on all tables
ALTER TABLE public.fuel_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vessel_speeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.satellite_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connected_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_template_versions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for fuel_logs
CREATE POLICY "Users can view their own fuel logs"
  ON public.fuel_logs FOR SELECT
  USING (auth.uid() = organization_id);

CREATE POLICY "Users can insert their own fuel logs"
  ON public.fuel_logs FOR INSERT
  WITH CHECK (auth.uid() = organization_id);

CREATE POLICY "Users can update their own fuel logs"
  ON public.fuel_logs FOR UPDATE
  USING (auth.uid() = organization_id);

CREATE POLICY "Users can delete their own fuel logs"
  ON public.fuel_logs FOR DELETE
  USING (auth.uid() = organization_id);

-- Create RLS policies for route_segments
CREATE POLICY "Users can view their own route segments"
  ON public.route_segments FOR SELECT
  USING (auth.uid() = organization_id);

CREATE POLICY "Users can insert their own route segments"
  ON public.route_segments FOR INSERT
  WITH CHECK (auth.uid() = organization_id);

CREATE POLICY "Users can update their own route segments"
  ON public.route_segments FOR UPDATE
  USING (auth.uid() = organization_id);

-- Create RLS policies for vessel_speeds
CREATE POLICY "Users can view their own vessel speeds"
  ON public.vessel_speeds FOR SELECT
  USING (auth.uid() = organization_id);

CREATE POLICY "Users can insert their own vessel speeds"
  ON public.vessel_speeds FOR INSERT
  WITH CHECK (auth.uid() = organization_id);

-- Create RLS policies for mission_workflows
CREATE POLICY "Users can view their own workflows"
  ON public.mission_workflows FOR SELECT
  USING (auth.uid() = organization_id OR auth.uid() = created_by);

CREATE POLICY "Users can insert their own workflows"
  ON public.mission_workflows FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own workflows"
  ON public.mission_workflows FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own workflows"
  ON public.mission_workflows FOR DELETE
  USING (auth.uid() = created_by);

-- Create RLS policies for satellite_tracks
CREATE POLICY "Users can view satellite tracks"
  ON public.satellite_tracks FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert satellite tracks"
  ON public.satellite_tracks FOR INSERT
  WITH CHECK (auth.uid() = organization_id);

-- Create RLS policies for connected_integrations
CREATE POLICY "Users can view their own integrations"
  ON public.connected_integrations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own integrations"
  ON public.connected_integrations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own integrations"
  ON public.connected_integrations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own integrations"
  ON public.connected_integrations FOR DELETE
  USING (auth.uid() = user_id);

-- Create RLS policies for webhook_events
CREATE POLICY "Users can view their webhook events"
  ON public.webhook_events FOR SELECT
  USING (auth.uid() = organization_id);

CREATE POLICY "System can insert webhook events"
  ON public.webhook_events FOR INSERT
  WITH CHECK (true);

-- Create RLS policies for document_template_versions
CREATE POLICY "Users can view template versions"
  ON public.document_template_versions FOR SELECT
  USING (auth.uid() = organization_id OR auth.uid() = created_by);

CREATE POLICY "Users can insert template versions"
  ON public.document_template_versions FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Create indexes for better performance
CREATE INDEX idx_fuel_logs_vessel_timestamp ON public.fuel_logs(vessel_id, timestamp DESC);
CREATE INDEX idx_fuel_logs_org ON public.fuel_logs(organization_id);
CREATE INDEX idx_route_segments_org ON public.route_segments(organization_id);
CREATE INDEX idx_vessel_speeds_vessel ON public.vessel_speeds(vessel_id, timestamp DESC);
CREATE INDEX idx_mission_workflows_org ON public.mission_workflows(organization_id);
CREATE INDEX idx_mission_workflows_status ON public.mission_workflows(status, is_active);
CREATE INDEX idx_satellite_tracks_satellite ON public.satellite_tracks(satellite_id, timestamp DESC);
CREATE INDEX idx_connected_integrations_user ON public.connected_integrations(user_id, is_active);
CREATE INDEX idx_webhook_events_integration ON public.webhook_events(integration_id, created_at DESC);
CREATE INDEX idx_template_versions_template ON public.document_template_versions(template_id, version_number DESC);