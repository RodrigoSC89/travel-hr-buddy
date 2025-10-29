-- PATCHES 536-540: Coordination AI Engine, Deep Risk AI, Sensors Hub, Ocean Sonar AI, Navigation Copilot v3
-- Implementation Date: 2025-10-29

-- ============================================================================
-- PATCH 536: Coordination AI Engine v1.0
-- Multi-agent coordination with priority-based task distribution
-- ============================================================================

-- Agent registry for coordination
CREATE TABLE IF NOT EXISTS coordination_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_name TEXT NOT NULL,
  agent_type TEXT NOT NULL CHECK (agent_type IN ('llm', 'copilot', 'sensor', 'drone', 'analyzer', 'executor', 'coordinator')),
  capabilities JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'idle' CHECK (status IN ('registered', 'active', 'idle', 'busy', 'offline', 'error')),
  priority_level INTEGER DEFAULT 5 CHECK (priority_level BETWEEN 1 AND 10),
  max_concurrent_tasks INTEGER DEFAULT 3,
  current_task_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  last_heartbeat TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Coordination tasks
CREATE TABLE IF NOT EXISTS coordination_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_name TEXT NOT NULL,
  task_type TEXT NOT NULL,
  priority INTEGER DEFAULT 5 CHECK (priority BETWEEN 1 AND 10),
  required_capabilities JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'processing', 'completed', 'failed', 'timeout', 'cancelled')),
  assigned_agent_id UUID REFERENCES coordination_agents(id) ON DELETE SET NULL,
  payload JSONB DEFAULT '{}'::jsonb,
  result JSONB,
  error_message TEXT,
  timeout_seconds INTEGER DEFAULT 300,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Central decision log for agent coordination
CREATE TABLE IF NOT EXISTS coordination_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES coordination_tasks(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES coordination_agents(id) ON DELETE CASCADE,
  decision_type TEXT NOT NULL,
  decision_data JSONB DEFAULT '{}'::jsonb,
  reasoning TEXT,
  confidence_score NUMERIC(5, 2) CHECK (confidence_score BETWEEN 0 AND 100),
  timestamp TIMESTAMPTZ DEFAULT now()
);

-- Mission-engine integration tracking
CREATE TABLE IF NOT EXISTS coordination_mission_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID,
  coordination_task_id UUID REFERENCES coordination_tasks(id) ON DELETE CASCADE,
  integration_status TEXT DEFAULT 'linked' CHECK (integration_status IN ('linked', 'synced', 'completed', 'failed')),
  sync_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- PATCH 537: Deep Risk AI with ONNX Runtime
-- AI-powered risk analysis using ONNX models in browser
-- ============================================================================

-- Risk forecasts with ONNX model predictions
CREATE TABLE IF NOT EXISTS risk_forecast (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  forecast_name TEXT NOT NULL,
  risk_score NUMERIC(5, 2) NOT NULL CHECK (risk_score BETWEEN 0 AND 100),
  risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  risk_factors JSONB DEFAULT '[]'::jsonb,
  input_data JSONB NOT NULL,
  model_version TEXT,
  model_confidence NUMERIC(5, 2) CHECK (model_confidence BETWEEN 0 AND 100),
  inference_time_ms INTEGER,
  recommendations JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ONNX model registry
CREATE TABLE IF NOT EXISTS onnx_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_name TEXT NOT NULL UNIQUE,
  model_version TEXT NOT NULL,
  model_type TEXT NOT NULL,
  model_url TEXT,
  input_shape JSONB,
  output_shape JSONB,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'deprecated', 'testing')),
  performance_metrics JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- PATCH 538: Sensors Hub (Physical Sensors Integration)
-- Real-time sensor monitoring with MQTT/HTTP ingestion
-- ============================================================================

-- Sensor logs for real-time data
CREATE TABLE IF NOT EXISTS sensor_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sensor_id TEXT NOT NULL,
  sensor_name TEXT NOT NULL,
  sensor_type TEXT NOT NULL CHECK (sensor_type IN ('temperature', 'pressure', 'humidity', 'motion', 'gps', 'depth', 'speed', 'wind', 'wave', 'current', 'other')),
  reading_value NUMERIC NOT NULL,
  reading_unit TEXT NOT NULL,
  location JSONB,
  status TEXT DEFAULT 'normal' CHECK (status IN ('normal', 'warning', 'critical', 'offline')),
  metadata JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Sensor configurations
CREATE TABLE IF NOT EXISTS sensor_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sensor_id TEXT NOT NULL UNIQUE,
  sensor_name TEXT NOT NULL,
  sensor_type TEXT NOT NULL,
  mqtt_topic TEXT,
  http_endpoint TEXT,
  polling_interval_seconds INTEGER DEFAULT 5,
  alert_thresholds JSONB DEFAULT '{}'::jsonb,
  calibration_data JSONB DEFAULT '{}'::jsonb,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Sensor alerts
CREATE TABLE IF NOT EXISTS sensor_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sensor_id TEXT NOT NULL,
  alert_type TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('info', 'warning', 'critical')),
  message TEXT NOT NULL,
  reading_value NUMERIC,
  threshold_value NUMERIC,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved')),
  acknowledged_by UUID REFERENCES auth.users(id),
  acknowledged_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- PATCH 539: Ocean Sonar AI v1
-- AI-assisted sonar pattern interpretation
-- ============================================================================

-- Sonar data records
CREATE TABLE IF NOT EXISTS sonar_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id TEXT NOT NULL,
  scan_type TEXT CHECK (scan_type IN ('active', 'passive', 'side-scan', 'multi-beam')),
  raw_data JSONB NOT NULL,
  frequency_khz NUMERIC,
  range_meters NUMERIC,
  depth_meters NUMERIC,
  location JSONB,
  timestamp TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- AI sonar analysis results
CREATE TABLE IF NOT EXISTS sonar_ai_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id TEXT NOT NULL,
  sonar_data_id UUID REFERENCES sonar_data(id) ON DELETE CASCADE,
  detected_patterns JSONB DEFAULT '[]'::jsonb,
  anomalies JSONB DEFAULT '[]'::jsonb,
  zones_of_interest JSONB DEFAULT '[]'::jsonb,
  ai_confidence NUMERIC(5, 2) CHECK (ai_confidence BETWEEN 0 AND 100),
  interpretation TEXT,
  recommendations TEXT,
  model_used TEXT,
  processing_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Sonar detection logs
CREATE TABLE IF NOT EXISTS sonar_detection_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id TEXT NOT NULL,
  detection_type TEXT NOT NULL,
  confidence NUMERIC(5, 2) CHECK (confidence BETWEEN 0 AND 100),
  location JSONB NOT NULL,
  characteristics JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'investigating', 'classified', 'dismissed')),
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- PATCH 540: Navigation Copilot v3 (Full Autonomy)
-- Autonomous navigation with real-time obstacle avoidance and replanning
-- ============================================================================

-- Navigation routes with autonomy
CREATE TABLE IF NOT EXISTS autonomous_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_name TEXT NOT NULL,
  origin JSONB NOT NULL,
  destination JSONB NOT NULL,
  waypoints JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'paused', 'completed', 'cancelled', 'replanning')),
  autonomy_level TEXT DEFAULT 'full' CHECK (autonomy_level IN ('manual', 'assisted', 'conditional', 'full')),
  current_position JSONB,
  obstacles_detected JSONB DEFAULT '[]'::jsonb,
  environmental_conditions JSONB DEFAULT '{}'::jsonb,
  eta TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Navigation alerts
CREATE TABLE IF NOT EXISTS navigation_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID REFERENCES autonomous_routes(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('obstacle', 'weather', 'traffic', 'mechanical', 'route_deviation', 'fuel', 'other')),
  severity TEXT CHECK (severity IN ('info', 'warning', 'critical', 'emergency')),
  message TEXT NOT NULL,
  location JSONB,
  visual_notification BOOLEAN DEFAULT true,
  audio_notification BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved')),
  response_action TEXT,
  acknowledged_by UUID REFERENCES auth.users(id),
  acknowledged_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Route replanning history
CREATE TABLE IF NOT EXISTS route_replan_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID REFERENCES autonomous_routes(id) ON DELETE CASCADE,
  replan_reason TEXT NOT NULL,
  original_route JSONB NOT NULL,
  new_route JSONB NOT NULL,
  trigger_data JSONB DEFAULT '{}'::jsonb,
  autonomous BOOLEAN DEFAULT true,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Environmental monitoring for navigation
CREATE TABLE IF NOT EXISTS navigation_environment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID REFERENCES autonomous_routes(id) ON DELETE CASCADE,
  location JSONB NOT NULL,
  weather_conditions JSONB DEFAULT '{}'::jsonb,
  sea_state JSONB DEFAULT '{}'::jsonb,
  visibility_meters NUMERIC,
  wind_speed_knots NUMERIC,
  wave_height_meters NUMERIC,
  obstacles JSONB DEFAULT '[]'::jsonb,
  risk_assessment JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- Indexes for Performance
-- ============================================================================

-- PATCH 536 indexes
CREATE INDEX IF NOT EXISTS idx_coordination_agents_status ON coordination_agents(status);
CREATE INDEX IF NOT EXISTS idx_coordination_agents_type ON coordination_agents(agent_type);
CREATE INDEX IF NOT EXISTS idx_coordination_tasks_status ON coordination_tasks(status);
CREATE INDEX IF NOT EXISTS idx_coordination_tasks_priority ON coordination_tasks(priority);
CREATE INDEX IF NOT EXISTS idx_coordination_tasks_assigned ON coordination_tasks(assigned_agent_id);
CREATE INDEX IF NOT EXISTS idx_coordination_decisions_task ON coordination_decisions(task_id);
CREATE INDEX IF NOT EXISTS idx_coordination_decisions_agent ON coordination_decisions(agent_id);

-- PATCH 537 indexes
CREATE INDEX IF NOT EXISTS idx_risk_forecast_score ON risk_forecast(risk_score);
CREATE INDEX IF NOT EXISTS idx_risk_forecast_level ON risk_forecast(risk_level);
CREATE INDEX IF NOT EXISTS idx_risk_forecast_created ON risk_forecast(created_at);

-- PATCH 538 indexes
CREATE INDEX IF NOT EXISTS idx_sensor_logs_sensor ON sensor_logs(sensor_id);
CREATE INDEX IF NOT EXISTS idx_sensor_logs_type ON sensor_logs(sensor_type);
CREATE INDEX IF NOT EXISTS idx_sensor_logs_timestamp ON sensor_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_sensor_alerts_sensor ON sensor_alerts(sensor_id);
CREATE INDEX IF NOT EXISTS idx_sensor_alerts_status ON sensor_alerts(status);

-- PATCH 539 indexes
CREATE INDEX IF NOT EXISTS idx_sonar_data_scan ON sonar_data(scan_id);
CREATE INDEX IF NOT EXISTS idx_sonar_data_timestamp ON sonar_data(timestamp);
CREATE INDEX IF NOT EXISTS idx_sonar_ai_analysis_scan ON sonar_ai_analysis(scan_id);
CREATE INDEX IF NOT EXISTS idx_sonar_detection_logs_scan ON sonar_detection_logs(scan_id);
CREATE INDEX IF NOT EXISTS idx_sonar_detection_logs_status ON sonar_detection_logs(status);

-- PATCH 540 indexes
CREATE INDEX IF NOT EXISTS idx_autonomous_routes_status ON autonomous_routes(status);
CREATE INDEX IF NOT EXISTS idx_navigation_alerts_route ON navigation_alerts(route_id);
CREATE INDEX IF NOT EXISTS idx_navigation_alerts_status ON navigation_alerts(status);
CREATE INDEX IF NOT EXISTS idx_navigation_alerts_severity ON navigation_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_route_replan_history_route ON route_replan_history(route_id);
CREATE INDEX IF NOT EXISTS idx_navigation_environment_route ON navigation_environment(route_id);

-- ============================================================================
-- Enable Row Level Security (RLS)
-- ============================================================================

ALTER TABLE coordination_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE coordination_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE coordination_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE coordination_mission_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_forecast ENABLE ROW LEVEL SECURITY;
ALTER TABLE onnx_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensor_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensor_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensor_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sonar_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE sonar_ai_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE sonar_detection_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE autonomous_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE navigation_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE route_replan_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE navigation_environment ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS Policies (Allow authenticated users to read/write)
-- ============================================================================

-- PATCH 536 policies
CREATE POLICY "Allow authenticated read coordination_agents" ON coordination_agents FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert coordination_agents" ON coordination_agents FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update coordination_agents" ON coordination_agents FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated read coordination_tasks" ON coordination_tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert coordination_tasks" ON coordination_tasks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update coordination_tasks" ON coordination_tasks FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated read coordination_decisions" ON coordination_decisions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert coordination_decisions" ON coordination_decisions FOR INSERT TO authenticated WITH CHECK (true);

-- PATCH 537 policies
CREATE POLICY "Allow authenticated read risk_forecast" ON risk_forecast FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert risk_forecast" ON risk_forecast FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated read onnx_models" ON onnx_models FOR SELECT TO authenticated USING (true);

-- PATCH 538 policies
CREATE POLICY "Allow authenticated read sensor_logs" ON sensor_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert sensor_logs" ON sensor_logs FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated read sensor_alerts" ON sensor_alerts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert sensor_alerts" ON sensor_alerts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update sensor_alerts" ON sensor_alerts FOR UPDATE TO authenticated USING (true);

-- PATCH 539 policies
CREATE POLICY "Allow authenticated read sonar_data" ON sonar_data FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert sonar_data" ON sonar_data FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated read sonar_ai_analysis" ON sonar_ai_analysis FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert sonar_ai_analysis" ON sonar_ai_analysis FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated read sonar_detection_logs" ON sonar_detection_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert sonar_detection_logs" ON sonar_detection_logs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update sonar_detection_logs" ON sonar_detection_logs FOR UPDATE TO authenticated USING (true);

-- PATCH 540 policies
CREATE POLICY "Allow authenticated read autonomous_routes" ON autonomous_routes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert autonomous_routes" ON autonomous_routes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update autonomous_routes" ON autonomous_routes FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated read navigation_alerts" ON navigation_alerts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert navigation_alerts" ON navigation_alerts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update navigation_alerts" ON navigation_alerts FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated read route_replan_history" ON route_replan_history FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert route_replan_history" ON route_replan_history FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated read navigation_environment" ON navigation_environment FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert navigation_environment" ON navigation_environment FOR INSERT TO authenticated WITH CHECK (true);
