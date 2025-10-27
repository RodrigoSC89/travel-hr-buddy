-- PATCH 291: Fuel Optimizer Tables
CREATE TABLE IF NOT EXISTS fuel_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vessel_id UUID REFERENCES vessels(id),
  fuel_type TEXT NOT NULL,
  quantity_liters DECIMAL(10, 2) NOT NULL,
  consumption_rate DECIMAL(10, 4),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  route_segment_id UUID,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vessel_speeds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vessel_id UUID REFERENCES vessels(id),
  speed_knots DECIMAL(6, 2) NOT NULL,
  engine_load_percent DECIMAL(5, 2),
  fuel_consumption_rate DECIMAL(10, 4),
  weather_conditions JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS route_segments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  route_name TEXT NOT NULL,
  start_point GEOGRAPHY(POINT),
  end_point GEOGRAPHY(POINT),
  distance_nm DECIMAL(10, 2),
  estimated_fuel_consumption DECIMAL(10, 2),
  actual_fuel_consumption DECIMAL(10, 2),
  cargo_weight_tons DECIMAL(10, 2),
  average_speed_knots DECIMAL(6, 2),
  completion_status TEXT DEFAULT 'planned',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fuel_predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  route_segment_id UUID REFERENCES route_segments(id),
  predicted_consumption DECIMAL(10, 2) NOT NULL,
  actual_consumption DECIMAL(10, 2),
  accuracy_percentage DECIMAL(5, 2),
  ai_model_version TEXT,
  prediction_factors JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fuel_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vessel_id UUID REFERENCES vessels(id),
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  message TEXT NOT NULL,
  threshold_value DECIMAL(10, 2),
  actual_value DECIMAL(10, 2),
  acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_by UUID,
  acknowledged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PATCH 292: Mission Control Workflow Builder Tables
CREATE TABLE IF NOT EXISTS mission_workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  workflow_definition JSONB NOT NULL,
  status TEXT DEFAULT 'draft',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mission_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID REFERENCES mission_workflows(id),
  execution_id UUID NOT NULL,
  status TEXT NOT NULL,
  step_name TEXT,
  step_output JSONB,
  error_message TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PATCH 293: Satellite Tracker Tables
CREATE TABLE IF NOT EXISTS satellite_tracks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  satellite_name TEXT NOT NULL,
  satellite_id TEXT UNIQUE NOT NULL,
  tle_line1 TEXT NOT NULL,
  tle_line2 TEXT NOT NULL,
  current_latitude DECIMAL(10, 6),
  current_longitude DECIMAL(10, 6),
  altitude_km DECIMAL(10, 2),
  velocity_kmps DECIMAL(10, 4),
  visibility_status TEXT,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS satellite_coverage_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  satellite_id TEXT REFERENCES satellite_tracks(satellite_id),
  event_type TEXT NOT NULL,
  vessel_id UUID,
  coverage_area GEOGRAPHY(POLYGON),
  signal_strength INTEGER,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PATCH 294: Integrations Hub Tables
CREATE TABLE IF NOT EXISTS connected_integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  integration_name TEXT NOT NULL,
  integration_type TEXT NOT NULL,
  oauth_provider TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  configuration JSONB,
  status TEXT DEFAULT 'active',
  last_sync TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  integration_id UUID REFERENCES connected_integrations(id),
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT DEFAULT 'pending',
  retry_count INTEGER DEFAULT 0,
  last_retry_at TIMESTAMPTZ,
  processed_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PATCH 295: Document Templates Tables (extending existing)
CREATE TABLE IF NOT EXISTS document_template_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID REFERENCES ai_document_templates(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  variables JSONB,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(template_id, version_number)
);

CREATE TABLE IF NOT EXISTS document_generation_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID REFERENCES ai_document_templates(id),
  version_id UUID REFERENCES document_template_versions(id),
  generated_by UUID REFERENCES auth.users(id),
  variables_used JSONB,
  output_format TEXT,
  file_path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_fuel_logs_vessel_timestamp ON fuel_logs(vessel_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_vessel_speeds_vessel_timestamp ON vessel_speeds(vessel_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_route_segments_status ON route_segments(completion_status);
CREATE INDEX IF NOT EXISTS idx_fuel_alerts_vessel_ack ON fuel_alerts(vessel_id, acknowledged);
CREATE INDEX IF NOT EXISTS idx_mission_logs_workflow_exec ON mission_logs(workflow_id, execution_id);
CREATE INDEX IF NOT EXISTS idx_satellite_tracks_updated ON satellite_tracks(last_updated DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_events_status ON webhook_events(status, created_at);
CREATE INDEX IF NOT EXISTS idx_template_versions_template ON document_template_versions(template_id, version_number DESC);

-- Add RLS policies
ALTER TABLE fuel_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE vessel_speeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE route_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE mission_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE mission_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE satellite_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE satellite_coverage_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE connected_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_template_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_generation_history ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (authenticated users can read all, admins can modify)
CREATE POLICY "Allow read access to authenticated users" ON fuel_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access to authenticated users" ON vessel_speeds FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access to authenticated users" ON route_segments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access to authenticated users" ON fuel_predictions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access to authenticated users" ON fuel_alerts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access to authenticated users" ON mission_workflows FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access to authenticated users" ON mission_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access to authenticated users" ON satellite_tracks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access to authenticated users" ON satellite_coverage_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access to own integrations" ON connected_integrations FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Allow read access to own webhooks" ON webhook_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access to authenticated users" ON document_template_versions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access to authenticated users" ON document_generation_history FOR SELECT TO authenticated USING (true);
