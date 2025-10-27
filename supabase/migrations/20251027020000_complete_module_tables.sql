-- Complete Module Tables Migration
-- Creates missing tables for Crew Management, Maritime System, Communication Hub,
-- Voyage Planner, Notifications Center, Crew Wellbeing, and User Management modules

-- ============================================
-- CREW MANAGEMENT TABLES
-- ============================================

-- Crew Rotations Table
CREATE TABLE IF NOT EXISTS crew_rotations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_member_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vessel_id uuid REFERENCES vessels(id) ON DELETE CASCADE,
  rotation_type text NOT NULL CHECK (rotation_type IN ('embarkation', 'disembarkation', 'rotation', 'leave', 'emergency')),
  scheduled_date timestamptz NOT NULL,
  actual_date timestamptz,
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'delayed')),
  departure_port text,
  arrival_port text,
  transportation_method text,
  flight_details jsonb,
  accommodation_details jsonb,
  documentation_status text DEFAULT 'pending' CHECK (documentation_status IN ('pending', 'verified', 'incomplete', 'expired')),
  medical_clearance boolean DEFAULT false,
  visa_status text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

CREATE INDEX idx_crew_rotations_member ON crew_rotations(crew_member_id);
CREATE INDEX idx_crew_rotations_vessel ON crew_rotations(vessel_id);
CREATE INDEX idx_crew_rotations_date ON crew_rotations(scheduled_date);
CREATE INDEX idx_crew_rotations_status ON crew_rotations(status);

ALTER TABLE crew_rotations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read crew rotations"
  ON crew_rotations FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert crew rotations"
  ON crew_rotations FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update crew rotations"
  ON crew_rotations FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- ============================================
-- MARITIME SYSTEM TABLES
-- ============================================

-- IoT Sensor Data Table
CREATE TABLE IF NOT EXISTS iot_sensor_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id uuid NOT NULL REFERENCES vessels(id) ON DELETE CASCADE,
  sensor_id text NOT NULL,
  sensor_type text NOT NULL CHECK (sensor_type IN ('temperature', 'pressure', 'vibration', 'fuel_level', 'engine_rpm', 'gps', 'weather', 'other')),
  sensor_location text,
  value numeric NOT NULL,
  unit text NOT NULL,
  status text DEFAULT 'normal' CHECK (status IN ('normal', 'warning', 'critical', 'offline')),
  threshold_min numeric,
  threshold_max numeric,
  is_alert boolean DEFAULT false,
  reading_timestamp timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_iot_sensor_vessel ON iot_sensor_data(vessel_id);
CREATE INDEX idx_iot_sensor_type ON iot_sensor_data(sensor_type);
CREATE INDEX idx_iot_sensor_timestamp ON iot_sensor_data(reading_timestamp DESC);
CREATE INDEX idx_iot_sensor_status ON iot_sensor_data(status);
CREATE INDEX idx_iot_sensor_alert ON iot_sensor_data(is_alert) WHERE is_alert = true;

ALTER TABLE iot_sensor_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read sensor data"
  ON iot_sensor_data FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert sensor data"
  ON iot_sensor_data FOR INSERT TO authenticated WITH CHECK (true);

-- Crew Rotation Logs Table
CREATE TABLE IF NOT EXISTS crew_rotation_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rotation_id uuid NOT NULL REFERENCES crew_rotations(id) ON DELETE CASCADE,
  log_type text NOT NULL CHECK (log_type IN ('status_change', 'notification_sent', 'document_updated', 'comment', 'system')),
  description text NOT NULL,
  previous_status text,
  new_status text,
  performed_by uuid REFERENCES auth.users(id),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_crew_rotation_logs_rotation ON crew_rotation_logs(rotation_id);
CREATE INDEX idx_crew_rotation_logs_type ON crew_rotation_logs(log_type);
CREATE INDEX idx_crew_rotation_logs_created ON crew_rotation_logs(created_at DESC);

ALTER TABLE crew_rotation_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read rotation logs"
  ON crew_rotation_logs FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert rotation logs"
  ON crew_rotation_logs FOR INSERT TO authenticated WITH CHECK (true);

-- Checklist Records Table
CREATE TABLE IF NOT EXISTS checklist_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id uuid REFERENCES vessels(id) ON DELETE CASCADE,
  checklist_type text NOT NULL CHECK (checklist_type IN ('pre_departure', 'arrival', 'safety', 'maintenance', 'inspection', 'emergency', 'custom')),
  checklist_name text NOT NULL,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed', 'expired')),
  assigned_to uuid REFERENCES auth.users(id),
  completed_by uuid REFERENCES auth.users(id),
  started_at timestamptz,
  completed_at timestamptz,
  due_date timestamptz,
  completion_percentage numeric DEFAULT 0,
  notes text,
  attachments jsonb DEFAULT '[]'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

CREATE INDEX idx_checklist_records_vessel ON checklist_records(vessel_id);
CREATE INDEX idx_checklist_records_type ON checklist_records(checklist_type);
CREATE INDEX idx_checklist_records_status ON checklist_records(status);
CREATE INDEX idx_checklist_records_assigned ON checklist_records(assigned_to);
CREATE INDEX idx_checklist_records_due ON checklist_records(due_date);

ALTER TABLE checklist_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read checklist records"
  ON checklist_records FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert checklist records"
  ON checklist_records FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update checklist records"
  ON checklist_records FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Vessel Status Table (for real-time tracking)
CREATE TABLE IF NOT EXISTS vessel_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id uuid NOT NULL REFERENCES vessels(id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('underway', 'at_anchor', 'moored', 'docked', 'maintenance', 'emergency', 'offline')),
  speed_knots numeric,
  heading numeric,
  latitude numeric,
  longitude numeric,
  weather_condition text,
  sea_state text,
  engine_status text,
  fuel_level_percentage numeric,
  crew_count integer,
  cargo_status text,
  last_port text,
  next_port text,
  eta_next_port timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  timestamp timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_vessel_status_vessel ON vessel_status(vessel_id);
CREATE INDEX idx_vessel_status_timestamp ON vessel_status(timestamp DESC);
CREATE INDEX idx_vessel_status_location ON vessel_status USING gist(ll_to_earth(latitude, longitude)) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

ALTER TABLE vessel_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read vessel status"
  ON vessel_status FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert vessel status"
  ON vessel_status FOR INSERT TO authenticated WITH CHECK (true);

-- Maintenance Alerts Table
CREATE TABLE IF NOT EXISTS maintenance_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id uuid NOT NULL REFERENCES vessels(id) ON DELETE CASCADE,
  maintenance_id uuid REFERENCES maintenance(id) ON DELETE SET NULL,
  alert_type text NOT NULL CHECK (alert_type IN ('due_soon', 'overdue', 'critical', 'parts_needed', 'inspection_required')),
  title text NOT NULL,
  description text,
  severity text DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status text DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved', 'dismissed')),
  due_date timestamptz,
  acknowledged_at timestamptz,
  acknowledged_by uuid REFERENCES auth.users(id),
  resolved_at timestamptz,
  resolved_by uuid REFERENCES auth.users(id),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_maintenance_alerts_vessel ON maintenance_alerts(vessel_id);
CREATE INDEX idx_maintenance_alerts_type ON maintenance_alerts(alert_type);
CREATE INDEX idx_maintenance_alerts_severity ON maintenance_alerts(severity);
CREATE INDEX idx_maintenance_alerts_status ON maintenance_alerts(status);
CREATE INDEX idx_maintenance_alerts_due ON maintenance_alerts(due_date);

ALTER TABLE maintenance_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read maintenance alerts"
  ON maintenance_alerts FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert maintenance alerts"
  ON maintenance_alerts FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update maintenance alerts"
  ON maintenance_alerts FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- ============================================
-- COMMUNICATION HUB TABLES
-- ============================================

-- Messages Table (if not exists - some variants may already exist)
CREATE TABLE IF NOT EXISTS crew_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  vessel_id uuid REFERENCES vessels(id) ON DELETE CASCADE,
  channel_id uuid,
  message_type text DEFAULT 'text' CHECK (message_type IN ('text', 'voice', 'attachment', 'system', 'alert')),
  content text,
  subject text,
  priority text DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  status text DEFAULT 'sent' CHECK (status IN ('draft', 'sent', 'delivered', 'read', 'failed')),
  is_read boolean DEFAULT false,
  read_at timestamptz,
  reply_to_id uuid REFERENCES crew_messages(id) ON DELETE SET NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_crew_messages_sender ON crew_messages(sender_id);
CREATE INDEX idx_crew_messages_recipient ON crew_messages(recipient_id);
CREATE INDEX idx_crew_messages_vessel ON crew_messages(vessel_id);
CREATE INDEX idx_crew_messages_created ON crew_messages(created_at DESC);
CREATE INDEX idx_crew_messages_status ON crew_messages(status);
CREATE INDEX idx_crew_messages_read ON crew_messages(is_read);

ALTER TABLE crew_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own messages"
  ON crew_messages FOR SELECT TO authenticated 
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can send messages"
  ON crew_messages FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their own messages"
  ON crew_messages FOR UPDATE TO authenticated 
  USING (auth.uid() = sender_id) WITH CHECK (auth.uid() = sender_id);

-- Message Attachments Table
CREATE TABLE IF NOT EXISTS message_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES crew_messages(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_type text NOT NULL,
  file_size integer,
  storage_path text NOT NULL,
  storage_bucket text DEFAULT 'message-attachments',
  mime_type text,
  thumbnail_path text,
  is_public boolean DEFAULT false,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_message_attachments_message ON message_attachments(message_id);
CREATE INDEX idx_message_attachments_type ON message_attachments(file_type);

ALTER TABLE message_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read attachments from their messages"
  ON message_attachments FOR SELECT TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM crew_messages 
    WHERE crew_messages.id = message_attachments.message_id 
    AND (crew_messages.sender_id = auth.uid() OR crew_messages.recipient_id = auth.uid())
  ));

-- Voice Messages Table
CREATE TABLE IF NOT EXISTS crew_voice_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES crew_messages(id) ON DELETE CASCADE,
  audio_file_path text NOT NULL,
  duration_seconds integer,
  transcription text,
  transcription_confidence numeric,
  audio_format text DEFAULT 'webm',
  sample_rate integer,
  storage_bucket text DEFAULT 'voice-messages',
  is_transcribed boolean DEFAULT false,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_crew_voice_messages_message ON crew_voice_messages(message_id);
CREATE INDEX idx_crew_voice_messages_created ON crew_voice_messages(created_at DESC);

ALTER TABLE crew_voice_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read voice messages from their messages"
  ON crew_voice_messages FOR SELECT TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM crew_messages 
    WHERE crew_messages.id = crew_voice_messages.message_id 
    AND (crew_messages.sender_id = auth.uid() OR crew_messages.recipient_id = auth.uid())
  ));

-- ============================================
-- VOYAGE PLANNER TABLES
-- ============================================

-- Voyage Plans Table
CREATE TABLE IF NOT EXISTS voyage_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id uuid NOT NULL REFERENCES vessels(id) ON DELETE CASCADE,
  plan_name text NOT NULL,
  departure_port text NOT NULL,
  arrival_port text NOT NULL,
  waypoints jsonb DEFAULT '[]'::jsonb,
  planned_departure timestamptz NOT NULL,
  planned_arrival timestamptz NOT NULL,
  estimated_duration_hours numeric,
  total_distance_nm numeric,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'active', 'completed', 'cancelled')),
  weather_checked boolean DEFAULT false,
  fuel_optimized boolean DEFAULT false,
  route_type text DEFAULT 'shortest' CHECK (route_type IN ('shortest', 'fastest', 'economical', 'safest', 'custom')),
  average_speed_knots numeric,
  fuel_estimate numeric,
  crew_required integer,
  cargo_capacity_used numeric,
  special_considerations text,
  approval_status text DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  approved_by uuid REFERENCES auth.users(id),
  approved_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

CREATE INDEX idx_voyage_plans_vessel ON voyage_plans(vessel_id);
CREATE INDEX idx_voyage_plans_status ON voyage_plans(status);
CREATE INDEX idx_voyage_plans_departure ON voyage_plans(planned_departure);
CREATE INDEX idx_voyage_plans_created ON voyage_plans(created_at DESC);

ALTER TABLE voyage_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read voyage plans"
  ON voyage_plans FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert voyage plans"
  ON voyage_plans FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update voyage plans"
  ON voyage_plans FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Route Forecasts Table
CREATE TABLE IF NOT EXISTS route_forecasts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  voyage_plan_id uuid NOT NULL REFERENCES voyage_plans(id) ON DELETE CASCADE,
  forecast_timestamp timestamptz NOT NULL,
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  weather_condition text,
  temperature_celsius numeric,
  wind_speed_knots numeric,
  wind_direction numeric,
  wave_height_meters numeric,
  sea_state text,
  visibility_nm numeric,
  precipitation_mm numeric,
  weather_risk_level text CHECK (weather_risk_level IN ('low', 'moderate', 'high', 'severe')),
  recommended_action text,
  data_source text,
  confidence_level numeric,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_route_forecasts_voyage ON route_forecasts(voyage_plan_id);
CREATE INDEX idx_route_forecasts_timestamp ON route_forecasts(forecast_timestamp);
CREATE INDEX idx_route_forecasts_location ON route_forecasts USING gist(ll_to_earth(latitude, longitude));

ALTER TABLE route_forecasts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read route forecasts"
  ON route_forecasts FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert route forecasts"
  ON route_forecasts FOR INSERT TO authenticated WITH CHECK (true);

-- Fuel Suggestions Table
CREATE TABLE IF NOT EXISTS fuel_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  voyage_plan_id uuid NOT NULL REFERENCES voyage_plans(id) ON DELETE CASCADE,
  suggestion_type text NOT NULL CHECK (suggestion_type IN ('route_optimization', 'speed_adjustment', 'weather_routing', 'port_optimization')),
  current_fuel_estimate numeric NOT NULL,
  optimized_fuel_estimate numeric NOT NULL,
  potential_savings_percentage numeric,
  potential_savings_cost numeric,
  recommendation_text text NOT NULL,
  alternative_route jsonb,
  optimized_speed_profile jsonb,
  confidence_score numeric,
  factors_considered jsonb DEFAULT '[]'::jsonb,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'implemented')),
  implemented_at timestamptz,
  actual_savings numeric,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_fuel_suggestions_voyage ON fuel_suggestions(voyage_plan_id);
CREATE INDEX idx_fuel_suggestions_type ON fuel_suggestions(suggestion_type);
CREATE INDEX idx_fuel_suggestions_status ON fuel_suggestions(status);
CREATE INDEX idx_fuel_suggestions_created ON fuel_suggestions(created_at DESC);

ALTER TABLE fuel_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read fuel suggestions"
  ON fuel_suggestions FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert fuel suggestions"
  ON fuel_suggestions FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update fuel suggestions"
  ON fuel_suggestions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- ============================================
-- NOTIFICATIONS CENTER TABLES
-- ============================================

-- Notification History Table
CREATE TABLE IF NOT EXISTS notification_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type text NOT NULL CHECK (notification_type IN ('push', 'email', 'sms', 'in_app', 'webhook')),
  title text NOT NULL,
  message text NOT NULL,
  delivery_status text DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'sent', 'delivered', 'failed', 'bounced')),
  delivery_method text,
  recipient_address text,
  sent_at timestamptz,
  delivered_at timestamptz,
  read_at timestamptz,
  clicked_at timestamptz,
  error_message text,
  retry_count integer DEFAULT 0,
  max_retries integer DEFAULT 3,
  priority text DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  category text,
  source_module text,
  related_entity_type text,
  related_entity_id uuid,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_notification_history_user ON notification_history(user_id);
CREATE INDEX idx_notification_history_type ON notification_history(notification_type);
CREATE INDEX idx_notification_history_status ON notification_history(delivery_status);
CREATE INDEX idx_notification_history_sent ON notification_history(sent_at DESC);
CREATE INDEX idx_notification_history_created ON notification_history(created_at DESC);

ALTER TABLE notification_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own notification history"
  ON notification_history FOR SELECT TO authenticated 
  USING (auth.uid() = user_id);

-- User Notification Settings Table
CREATE TABLE IF NOT EXISTS user_notification_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email_enabled boolean DEFAULT true,
  push_enabled boolean DEFAULT true,
  sms_enabled boolean DEFAULT false,
  in_app_enabled boolean DEFAULT true,
  quiet_hours_enabled boolean DEFAULT false,
  quiet_hours_start time,
  quiet_hours_end time,
  timezone text DEFAULT 'UTC',
  category_preferences jsonb DEFAULT '{
    "crew_management": {"email": true, "push": true, "sms": false},
    "fleet_alerts": {"email": true, "push": true, "sms": true},
    "maintenance": {"email": true, "push": true, "sms": false},
    "voyage_updates": {"email": true, "push": true, "sms": false},
    "weather_alerts": {"email": true, "push": true, "sms": true},
    "security": {"email": true, "push": true, "sms": true},
    "system": {"email": false, "push": true, "sms": false}
  }'::jsonb,
  frequency_limits jsonb DEFAULT '{
    "max_per_hour": 10,
    "max_per_day": 100
  }'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_user_notification_settings_user ON user_notification_settings(user_id);

ALTER TABLE user_notification_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own notification settings"
  ON user_notification_settings FOR SELECT TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification settings"
  ON user_notification_settings FOR UPDATE TO authenticated 
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notification settings"
  ON user_notification_settings FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- CREW WELLBEING TABLES
-- ============================================

-- Crew Health Records Table
CREATE TABLE IF NOT EXISTS crew_health_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_member_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vessel_id uuid REFERENCES vessels(id) ON DELETE SET NULL,
  record_type text NOT NULL CHECK (record_type IN ('daily_check', 'medical_exam', 'incident', 'vaccination', 'mental_health', 'fitness')),
  record_date date NOT NULL DEFAULT CURRENT_DATE,
  overall_health_status text CHECK (overall_health_status IN ('excellent', 'good', 'fair', 'poor', 'critical')),
  temperature_celsius numeric,
  blood_pressure_systolic integer,
  blood_pressure_diastolic integer,
  heart_rate_bpm integer,
  fatigue_level integer CHECK (fatigue_level >= 1 AND fatigue_level <= 10),
  stress_level integer CHECK (stress_level >= 1 AND stress_level <= 10),
  sleep_hours numeric,
  sleep_quality text CHECK (sleep_quality IN ('poor', 'fair', 'good', 'excellent')),
  symptoms text[],
  medications text[],
  notes text,
  examined_by uuid REFERENCES auth.users(id),
  follow_up_required boolean DEFAULT false,
  follow_up_date date,
  is_fit_for_duty boolean DEFAULT true,
  restrictions text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_crew_health_records_member ON crew_health_records(crew_member_id);
CREATE INDEX idx_crew_health_records_vessel ON crew_health_records(vessel_id);
CREATE INDEX idx_crew_health_records_date ON crew_health_records(record_date DESC);
CREATE INDEX idx_crew_health_records_type ON crew_health_records(record_type);
CREATE INDEX idx_crew_health_records_status ON crew_health_records(overall_health_status);

ALTER TABLE crew_health_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own health records"
  ON crew_health_records FOR SELECT TO authenticated 
  USING (auth.uid() = crew_member_id OR EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.raw_user_meta_data->>'role' IN ('admin', 'medical_officer', 'captain')
  ));

CREATE POLICY "Medical staff can insert health records"
  ON crew_health_records FOR INSERT TO authenticated 
  WITH CHECK (EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.raw_user_meta_data->>'role' IN ('admin', 'medical_officer')
  ));

CREATE POLICY "Medical staff can update health records"
  ON crew_health_records FOR UPDATE TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.raw_user_meta_data->>'role' IN ('admin', 'medical_officer')
  )) WITH CHECK (true);

-- Wellbeing Alerts Table
CREATE TABLE IF NOT EXISTS wellbeing_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_member_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vessel_id uuid REFERENCES vessels(id) ON DELETE SET NULL,
  alert_type text NOT NULL CHECK (alert_type IN ('fatigue_risk', 'health_concern', 'stress_high', 'mental_health', 'medical_due', 'fitness_issue')),
  severity text DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title text NOT NULL,
  description text NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved', 'dismissed', 'escalated')),
  detected_at timestamptz DEFAULT now(),
  acknowledged_at timestamptz,
  acknowledged_by uuid REFERENCES auth.users(id),
  resolved_at timestamptz,
  resolved_by uuid REFERENCES auth.users(id),
  resolution_notes text,
  recommended_actions text[],
  ai_generated boolean DEFAULT false,
  ai_confidence_score numeric,
  related_health_record_id uuid REFERENCES crew_health_records(id),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_wellbeing_alerts_member ON wellbeing_alerts(crew_member_id);
CREATE INDEX idx_wellbeing_alerts_vessel ON wellbeing_alerts(vessel_id);
CREATE INDEX idx_wellbeing_alerts_type ON wellbeing_alerts(alert_type);
CREATE INDEX idx_wellbeing_alerts_severity ON wellbeing_alerts(severity);
CREATE INDEX idx_wellbeing_alerts_status ON wellbeing_alerts(status);
CREATE INDEX idx_wellbeing_alerts_created ON wellbeing_alerts(created_at DESC);

ALTER TABLE wellbeing_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own wellbeing alerts"
  ON wellbeing_alerts FOR SELECT TO authenticated 
  USING (auth.uid() = crew_member_id OR EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.raw_user_meta_data->>'role' IN ('admin', 'medical_officer', 'captain')
  ));

CREATE POLICY "System can insert wellbeing alerts"
  ON wellbeing_alerts FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authorized users can update wellbeing alerts"
  ON wellbeing_alerts FOR UPDATE TO authenticated 
  USING (auth.uid() = crew_member_id OR EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.raw_user_meta_data->>'role' IN ('admin', 'medical_officer', 'captain')
  )) WITH CHECK (true);

-- ============================================
-- USER MANAGEMENT TABLES
-- ============================================

-- User Roles Table
CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_name text UNIQUE NOT NULL,
  role_description text,
  permissions jsonb DEFAULT '[]'::jsonb,
  is_system_role boolean DEFAULT false,
  hierarchy_level integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

CREATE INDEX idx_user_roles_name ON user_roles(role_name);
CREATE INDEX idx_user_roles_level ON user_roles(hierarchy_level);

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read roles"
  ON user_roles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Only admins can insert roles"
  ON user_roles FOR INSERT TO authenticated 
  WITH CHECK (EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.raw_user_meta_data->>'role' = 'admin'
  ));

CREATE POLICY "Only admins can update roles"
  ON user_roles FOR UPDATE TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.raw_user_meta_data->>'role' = 'admin'
  )) WITH CHECK (true);

-- User Access Logs Table
CREATE TABLE IF NOT EXISTS user_access_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  action text NOT NULL CHECK (action IN ('login', 'logout', 'page_view', 'api_call', 'data_access', 'data_modify', 'failed_login', 'permission_denied')),
  resource_type text,
  resource_id uuid,
  ip_address inet,
  user_agent text,
  location text,
  session_id text,
  status text CHECK (status IN ('success', 'failure', 'blocked')),
  error_message text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_user_access_logs_user ON user_access_logs(user_id);
CREATE INDEX idx_user_access_logs_action ON user_access_logs(action);
CREATE INDEX idx_user_access_logs_created ON user_access_logs(created_at DESC);
CREATE INDEX idx_user_access_logs_status ON user_access_logs(status);
CREATE INDEX idx_user_access_logs_ip ON user_access_logs(ip_address);

ALTER TABLE user_access_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own access logs"
  ON user_access_logs FOR SELECT TO authenticated 
  USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.raw_user_meta_data->>'role' = 'admin'
  ));

CREATE POLICY "System can insert access logs"
  ON user_access_logs FOR INSERT TO authenticated WITH CHECK (true);

-- ============================================
-- Update Triggers
-- ============================================

CREATE TRIGGER update_crew_rotations_updated_at 
  BEFORE UPDATE ON crew_rotations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_checklist_records_updated_at 
  BEFORE UPDATE ON checklist_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crew_messages_updated_at 
  BEFORE UPDATE ON crew_messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_voyage_plans_updated_at 
  BEFORE UPDATE ON voyage_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_notification_settings_updated_at 
  BEFORE UPDATE ON user_notification_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crew_health_records_updated_at 
  BEFORE UPDATE ON crew_health_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_roles_updated_at 
  BEFORE UPDATE ON user_roles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Comments
-- ============================================

COMMENT ON TABLE crew_rotations IS 'Crew rotation scheduling for embarkation and disembarkation';
COMMENT ON TABLE iot_sensor_data IS 'Real-time IoT sensor data from vessels';
COMMENT ON TABLE crew_rotation_logs IS 'Audit trail for crew rotation changes';
COMMENT ON TABLE checklist_records IS 'Operational checklists and completion tracking';
COMMENT ON TABLE vessel_status IS 'Real-time vessel status and position tracking';
COMMENT ON TABLE maintenance_alerts IS 'Automated maintenance alerts and notifications';
COMMENT ON TABLE crew_messages IS 'Internal crew messaging and communication';
COMMENT ON TABLE message_attachments IS 'File attachments for crew messages';
COMMENT ON TABLE crew_voice_messages IS 'Voice message recordings and transcriptions';
COMMENT ON TABLE voyage_plans IS 'Voyage planning with weather and fuel optimization';
COMMENT ON TABLE route_forecasts IS 'Weather forecasts along planned routes';
COMMENT ON TABLE fuel_suggestions IS 'AI-powered fuel optimization suggestions';
COMMENT ON TABLE notification_history IS 'Complete history of all notifications sent';
COMMENT ON TABLE user_notification_settings IS 'User preferences for notifications';
COMMENT ON TABLE crew_health_records IS 'Crew health and medical records';
COMMENT ON TABLE wellbeing_alerts IS 'AI-generated wellbeing and health alerts';
COMMENT ON TABLE user_roles IS 'User roles and permissions management';
COMMENT ON TABLE user_access_logs IS 'Audit trail of user access and actions';
