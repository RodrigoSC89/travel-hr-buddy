-- PATCH 194.0 - Missing Core Tables Migration
-- Creates all missing core tables identified in technical analysis

-- ============================================
-- Cargo Shipments Table
-- ============================================
CREATE TABLE IF NOT EXISTS cargo_shipments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_number text UNIQUE NOT NULL,
  vessel_id uuid REFERENCES vessels(id) ON DELETE SET NULL,
  origin_port text NOT NULL,
  destination_port text NOT NULL,
  cargo_type text NOT NULL,
  cargo_description text,
  weight_kg numeric,
  volume_m3 numeric,
  container_count integer,
  container_types jsonb DEFAULT '[]'::jsonb,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'loaded', 'in_transit', 'delivered', 'cancelled')),
  priority text DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  loading_date timestamptz,
  departure_date timestamptz,
  eta timestamptz,
  actual_arrival timestamptz,
  shipper_name text,
  shipper_contact text,
  consignee_name text,
  consignee_contact text,
  customs_cleared boolean DEFAULT false,
  insurance_value numeric,
  special_requirements text,
  temperature_controlled boolean DEFAULT false,
  hazardous_materials boolean DEFAULT false,
  documents jsonb DEFAULT '[]'::jsonb,
  tracking_updates jsonb DEFAULT '[]'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Cargo shipments indexes
CREATE INDEX IF NOT EXISTS idx_cargo_shipments_vessel ON cargo_shipments(vessel_id);
CREATE INDEX IF NOT EXISTS idx_cargo_shipments_status ON cargo_shipments(status);
CREATE INDEX IF NOT EXISTS idx_cargo_shipments_departure ON cargo_shipments(departure_date);
CREATE INDEX IF NOT EXISTS idx_cargo_shipments_eta ON cargo_shipments(eta);

-- Cargo shipments RLS
ALTER TABLE cargo_shipments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read cargo shipments"
  ON cargo_shipments FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert cargo shipments"
  ON cargo_shipments FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update cargo shipments"
  ON cargo_shipments FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- ============================================
-- Notifications Table
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type text NOT NULL CHECK (notification_type IN ('info', 'warning', 'alert', 'success', 'error', 'system')),
  title text NOT NULL,
  message text NOT NULL,
  priority text DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'critical')),
  category text,
  source_module text,
  action_url text,
  action_label text,
  is_read boolean DEFAULT false,
  is_archived boolean DEFAULT false,
  read_at timestamptz,
  expires_at timestamptz,
  related_entity_type text,
  related_entity_id uuid,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(notification_type);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority);

-- Notifications RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ============================================
-- Calendar Events Table
-- ============================================
CREATE TABLE IF NOT EXISTS calendar_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  event_type text NOT NULL CHECK (event_type IN ('meeting', 'maintenance', 'inspection', 'training', 'audit', 'voyage', 'other')),
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  all_day boolean DEFAULT false,
  location text,
  vessel_id uuid REFERENCES vessels(id) ON DELETE CASCADE,
  organizer_id uuid REFERENCES auth.users(id),
  attendees jsonb DEFAULT '[]'::jsonb,
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'cancelled', 'completed', 'rescheduled')),
  reminder_minutes integer,
  recurring_rule text,
  parent_event_id uuid REFERENCES calendar_events(id) ON DELETE CASCADE,
  is_recurring boolean DEFAULT false,
  color text,
  category text,
  priority text DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high')),
  attachments jsonb DEFAULT '[]'::jsonb,
  notes text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Calendar events indexes
CREATE INDEX IF NOT EXISTS idx_calendar_events_start ON calendar_events(start_time);
CREATE INDEX IF NOT EXISTS idx_calendar_events_end ON calendar_events(end_time);
CREATE INDEX IF NOT EXISTS idx_calendar_events_type ON calendar_events(event_type);
CREATE INDEX IF NOT EXISTS idx_calendar_events_vessel ON calendar_events(vessel_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_organizer ON calendar_events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_status ON calendar_events(status);

-- Calendar events RLS
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read calendar events"
  ON calendar_events FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert calendar events"
  ON calendar_events FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update calendar events"
  ON calendar_events FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- ============================================
-- Performance Tables for Mock Data Migration
-- ============================================

-- Fleet Logs Table
CREATE TABLE IF NOT EXISTS fleet_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id uuid REFERENCES vessels(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN ('departure', 'arrival', 'maintenance', 'incident', 'downtime', 'inspection', 'other')),
  event_description text,
  downtime_reason text,
  duration_minutes integer,
  location text,
  latitude numeric,
  longitude numeric,
  severity text CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  reported_by uuid REFERENCES auth.users(id),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fleet_logs_vessel ON fleet_logs(vessel_id);
CREATE INDEX IF NOT EXISTS idx_fleet_logs_type ON fleet_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_fleet_logs_created ON fleet_logs(created_at DESC);

ALTER TABLE fleet_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated users to read fleet logs"
  ON fleet_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to insert fleet logs"
  ON fleet_logs FOR INSERT TO authenticated WITH CHECK (true);

-- Mission Activities Table
CREATE TABLE IF NOT EXISTS mission_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id uuid REFERENCES vessels(id) ON DELETE CASCADE,
  mission_name text NOT NULL,
  mission_type text,
  status text DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')),
  start_time timestamptz,
  end_time timestamptz,
  duration_minutes integer,
  distance numeric,
  origin text,
  destination text,
  crew_count integer,
  objectives jsonb DEFAULT '[]'::jsonb,
  achievements jsonb DEFAULT '[]'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mission_activities_vessel ON mission_activities(vessel_id);
CREATE INDEX IF NOT EXISTS idx_mission_activities_status ON mission_activities(status);
CREATE INDEX IF NOT EXISTS idx_mission_activities_start ON mission_activities(start_time);

ALTER TABLE mission_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated users to read mission activities"
  ON mission_activities FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to insert mission activities"
  ON mission_activities FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update mission activities"
  ON mission_activities FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Fuel Usage Table
CREATE TABLE IF NOT EXISTS fuel_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id uuid REFERENCES vessels(id) ON DELETE CASCADE,
  fuel_type text NOT NULL,
  amount numeric NOT NULL,
  unit text DEFAULT 'liters',
  cost numeric,
  supplier text,
  recorded_at timestamptz DEFAULT now(),
  location text,
  odometer_reading numeric,
  efficiency_rating numeric,
  notes text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fuel_usage_vessel ON fuel_usage(vessel_id);
CREATE INDEX IF NOT EXISTS idx_fuel_usage_recorded ON fuel_usage(recorded_at DESC);

ALTER TABLE fuel_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated users to read fuel usage"
  ON fuel_usage FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to insert fuel usage"
  ON fuel_usage FOR INSERT TO authenticated WITH CHECK (true);

-- ============================================
-- Update Triggers
-- ============================================

CREATE TRIGGER update_cargo_shipments_updated_at 
  BEFORE UPDATE ON cargo_shipments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calendar_events_updated_at 
  BEFORE UPDATE ON calendar_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mission_activities_updated_at 
  BEFORE UPDATE ON mission_activities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Comments
-- ============================================

COMMENT ON TABLE cargo_shipments IS 'Cargo shipment tracking and management';
COMMENT ON TABLE notifications IS 'User notifications and alerts system';
COMMENT ON TABLE calendar_events IS 'Calendar events and scheduling';
COMMENT ON TABLE fleet_logs IS 'Fleet event logs for performance tracking';
COMMENT ON TABLE mission_activities IS 'Mission and activity tracking';
COMMENT ON TABLE fuel_usage IS 'Fuel consumption tracking and optimization';
