-- Fleet Management Consolidated Schema
-- PATCH 191.0: Unified Fleet and Maritime system tables

-- ============================================
-- Vessels Table
-- ============================================
CREATE TABLE IF NOT EXISTS vessels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  imo_number text UNIQUE,
  vessel_type text NOT NULL,
  flag text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance', 'decommissioned')),
  location text,
  latitude numeric,
  longitude numeric,
  last_position_update timestamptz,
  gross_tonnage numeric,
  net_tonnage numeric,
  length_overall numeric,
  beam numeric,
  draft numeric,
  year_built integer,
  classification_society text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id)
);

-- Vessels indexes
CREATE INDEX IF NOT EXISTS idx_vessels_status ON vessels(status);
CREATE INDEX IF NOT EXISTS idx_vessels_type ON vessels(vessel_type);
CREATE INDEX IF NOT EXISTS idx_vessels_location ON vessels USING gist(ll_to_earth(latitude, longitude)) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_vessels_updated_at ON vessels(updated_at DESC);

-- Vessels RLS
ALTER TABLE vessels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read vessels"
  ON vessels FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert vessels"
  ON vessels FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update vessels"
  ON vessels FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================
-- Maintenance Table
-- ============================================
CREATE TABLE IF NOT EXISTS maintenance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id uuid NOT NULL REFERENCES vessels(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('routine', 'emergency', 'preventive', 'corrective', 'inspection', 'certification')),
  title text NOT NULL,
  description text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'in_progress', 'completed', 'cancelled', 'overdue')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  scheduled_date timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  estimated_duration_hours numeric,
  actual_duration_hours numeric,
  estimated_cost numeric,
  actual_cost numeric,
  assigned_to uuid REFERENCES auth.users(id),
  performed_by text,
  parts_used jsonb DEFAULT '[]'::jsonb,
  notes text,
  attachments jsonb DEFAULT '[]'::jsonb,
  next_maintenance_date timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Maintenance indexes
CREATE INDEX IF NOT EXISTS idx_maintenance_vessel ON maintenance(vessel_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_status ON maintenance(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_type ON maintenance(type);
CREATE INDEX IF NOT EXISTS idx_maintenance_scheduled_date ON maintenance(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_maintenance_priority ON maintenance(priority);

-- Maintenance RLS
ALTER TABLE maintenance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read maintenance"
  ON maintenance FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert maintenance"
  ON maintenance FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update maintenance"
  ON maintenance FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================
-- Routes Table
-- ============================================
CREATE TABLE IF NOT EXISTS routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id uuid REFERENCES vessels(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  origin_port text,
  destination_port text,
  waypoints jsonb DEFAULT '[]'::jsonb,
  distance_nm numeric,
  estimated_duration_hours numeric,
  status text DEFAULT 'planned' CHECK (status IN ('planned', 'active', 'completed', 'cancelled')),
  departure_time timestamptz,
  arrival_time timestamptz,
  actual_departure timestamptz,
  actual_arrival timestamptz,
  weather_conditions jsonb,
  fuel_consumption_estimated numeric,
  fuel_consumption_actual numeric,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Routes indexes
CREATE INDEX IF NOT EXISTS idx_routes_vessel ON routes(vessel_id);
CREATE INDEX IF NOT EXISTS idx_routes_status ON routes(status);
CREATE INDEX IF NOT EXISTS idx_routes_departure ON routes(departure_time);
CREATE INDEX IF NOT EXISTS idx_routes_created_at ON routes(created_at DESC);

-- Routes RLS
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read routes"
  ON routes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert routes"
  ON routes FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update routes"
  ON routes FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================
-- Crew Assignments Table
-- ============================================
CREATE TABLE IF NOT EXISTS crew_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id uuid NOT NULL REFERENCES vessels(id) ON DELETE CASCADE,
  crew_member_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL,
  rank text,
  department text,
  assignment_status text DEFAULT 'active' CHECK (assignment_status IN ('active', 'on_leave', 'completed', 'terminated')),
  assigned_date timestamptz DEFAULT now(),
  end_date timestamptz,
  rotation_schedule text,
  certifications jsonb DEFAULT '[]'::jsonb,
  emergency_contact jsonb,
  notes text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Crew assignments indexes
CREATE INDEX IF NOT EXISTS idx_crew_assignments_vessel ON crew_assignments(vessel_id);
CREATE INDEX IF NOT EXISTS idx_crew_assignments_member ON crew_assignments(crew_member_id);
CREATE INDEX IF NOT EXISTS idx_crew_assignments_status ON crew_assignments(assignment_status);
CREATE INDEX IF NOT EXISTS idx_crew_assignments_role ON crew_assignments(role);

-- Crew assignments RLS
ALTER TABLE crew_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read crew assignments"
  ON crew_assignments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert crew assignments"
  ON crew_assignments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update crew assignments"
  ON crew_assignments FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================
-- Update Triggers
-- ============================================

-- Trigger function for updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all tables
CREATE TRIGGER update_vessels_updated_at BEFORE UPDATE ON vessels
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_maintenance_updated_at BEFORE UPDATE ON maintenance
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_routes_updated_at BEFORE UPDATE ON routes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crew_assignments_updated_at BEFORE UPDATE ON crew_assignments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Comments
-- ============================================

COMMENT ON TABLE vessels IS 'Fleet vessel registry with location tracking';
COMMENT ON TABLE maintenance IS 'Vessel maintenance scheduling and tracking';
COMMENT ON TABLE routes IS 'Vessel routes and voyage planning';
COMMENT ON TABLE crew_assignments IS 'Crew member assignments to vessels';
