-- PATCH 298: Travel Management
-- Crew travel coordination with conflict detection and export capabilities

-- ============================================
-- Travel Itineraries Table
-- ============================================
CREATE TABLE IF NOT EXISTS travel_itineraries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  itinerary_number text UNIQUE NOT NULL,
  crew_member_id uuid REFERENCES crew_members(id) ON DELETE CASCADE,
  vessel_id uuid REFERENCES vessels(id) ON DELETE SET NULL,
  mission_id uuid REFERENCES missions(id) ON DELETE SET NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  departure_location text NOT NULL,
  arrival_location text NOT NULL,
  departure_date timestamptz NOT NULL,
  arrival_date timestamptz NOT NULL,
  travel_purpose text,
  total_cost numeric DEFAULT 0,
  currency text DEFAULT 'USD',
  notes text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_travel_itineraries_crew ON travel_itineraries(crew_member_id);
CREATE INDEX IF NOT EXISTS idx_travel_itineraries_vessel ON travel_itineraries(vessel_id);
CREATE INDEX IF NOT EXISTS idx_travel_itineraries_mission ON travel_itineraries(mission_id);
CREATE INDEX IF NOT EXISTS idx_travel_itineraries_dates ON travel_itineraries(departure_date, arrival_date);
CREATE INDEX IF NOT EXISTS idx_travel_itineraries_status ON travel_itineraries(status);

-- ============================================
-- Travel Legs Table (Multi-leg support)
-- ============================================
CREATE TABLE IF NOT EXISTS travel_legs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  itinerary_id uuid REFERENCES travel_itineraries(id) ON DELETE CASCADE,
  leg_number integer NOT NULL,
  transport_type text NOT NULL CHECK (transport_type IN ('flight', 'train', 'bus', 'car', 'boat', 'other')),
  carrier text,
  booking_reference text,
  departure_location text NOT NULL,
  arrival_location text NOT NULL,
  departure_time timestamptz NOT NULL,
  arrival_time timestamptz NOT NULL,
  seat_number text,
  cost numeric DEFAULT 0,
  status text DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'pending', 'cancelled')),
  notes text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_travel_legs_itinerary ON travel_legs(itinerary_id);
CREATE INDEX IF NOT EXISTS idx_travel_legs_times ON travel_legs(departure_time, arrival_time);

-- ============================================
-- Travel Schedule Conflicts Table
-- ============================================
CREATE TABLE IF NOT EXISTS travel_schedule_conflicts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conflict_type text NOT NULL CHECK (conflict_type IN ('time_overlap', 'vessel_assignment', 'mission_conflict', 'unavailability')),
  severity text DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  itinerary_id_1 uuid REFERENCES travel_itineraries(id) ON DELETE CASCADE,
  itinerary_id_2 uuid REFERENCES travel_itineraries(id) ON DELETE CASCADE,
  crew_member_id uuid REFERENCES crew_members(id) ON DELETE CASCADE,
  conflict_description text NOT NULL,
  suggested_resolution text,
  resolved boolean DEFAULT false,
  resolved_by uuid REFERENCES auth.users(id),
  resolved_at timestamptz,
  resolution_notes text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_travel_conflicts_type ON travel_schedule_conflicts(conflict_type);
CREATE INDEX IF NOT EXISTS idx_travel_conflicts_severity ON travel_schedule_conflicts(severity);
CREATE INDEX IF NOT EXISTS idx_travel_conflicts_unresolved ON travel_schedule_conflicts(resolved) WHERE resolved = false;
CREATE INDEX IF NOT EXISTS idx_travel_conflicts_crew ON travel_schedule_conflicts(crew_member_id);

-- Function to detect travel time overlaps
CREATE OR REPLACE FUNCTION detect_travel_time_overlaps()
RETURNS void AS $$
BEGIN
  -- Detect overlapping travel schedules for the same crew member
  INSERT INTO travel_schedule_conflicts (
    conflict_type,
    severity,
    itinerary_id_1,
    itinerary_id_2,
    crew_member_id,
    conflict_description
  )
  SELECT DISTINCT
    'time_overlap',
    'high',
    t1.id,
    t2.id,
    t1.crew_member_id,
    format('Travel schedules overlap for crew member. Trip 1: %s to %s, Trip 2: %s to %s',
      t1.departure_date, t1.arrival_date, t2.departure_date, t2.arrival_date)
  FROM travel_itineraries t1
  INNER JOIN travel_itineraries t2 ON t1.crew_member_id = t2.crew_member_id
  WHERE t1.id < t2.id
    AND t1.status NOT IN ('cancelled', 'completed')
    AND t2.status NOT IN ('cancelled', 'completed')
    AND (
      (t1.departure_date, t1.arrival_date) OVERLAPS (t2.departure_date, t2.arrival_date)
    )
    AND NOT EXISTS (
      SELECT 1 FROM travel_schedule_conflicts tsc
      WHERE tsc.itinerary_id_1 = t1.id
        AND tsc.itinerary_id_2 = t2.id
        AND tsc.resolved = false
    );
END;
$$ LANGUAGE plpgsql;

-- Function to detect vessel assignment conflicts
CREATE OR REPLACE FUNCTION detect_vessel_assignment_conflicts()
RETURNS void AS $$
BEGIN
  -- Detect conflicts when crew is scheduled to travel while assigned to a vessel
  INSERT INTO travel_schedule_conflicts (
    conflict_type,
    severity,
    itinerary_id_1,
    crew_member_id,
    conflict_description
  )
  SELECT DISTINCT
    'vessel_assignment',
    'medium',
    ti.id,
    ti.crew_member_id,
    format('Crew member has travel scheduled during vessel assignment period')
  FROM travel_itineraries ti
  INNER JOIN crew_members cm ON ti.crew_member_id = cm.id
  WHERE ti.status NOT IN ('cancelled', 'completed')
    AND ti.vessel_id IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM travel_schedule_conflicts tsc
      WHERE tsc.itinerary_id_1 = ti.id
        AND tsc.conflict_type = 'vessel_assignment'
        AND tsc.resolved = false
    );
END;
$$ LANGUAGE plpgsql;

-- Trigger to check for conflicts on insert/update
CREATE OR REPLACE FUNCTION check_travel_conflicts()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM detect_travel_time_overlaps();
  PERFORM detect_vessel_assignment_conflicts();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_travel_conflicts
  AFTER INSERT OR UPDATE ON travel_itineraries
  FOR EACH ROW
  EXECUTE FUNCTION check_travel_conflicts();

-- ============================================
-- Travel Export History Table
-- ============================================
CREATE TABLE IF NOT EXISTS travel_export_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  export_type text NOT NULL CHECK (export_type IN ('pdf', 'excel', 'csv', 'json')),
  itinerary_id uuid REFERENCES travel_itineraries(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_url text,
  file_size bigint,
  exported_by uuid REFERENCES auth.users(id),
  export_filters jsonb DEFAULT '{}'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_travel_export_history_type ON travel_export_history(export_type);
CREATE INDEX IF NOT EXISTS idx_travel_export_history_itinerary ON travel_export_history(itinerary_id);
CREATE INDEX IF NOT EXISTS idx_travel_export_history_created ON travel_export_history(created_at DESC);

-- ============================================
-- RLS Policies
-- ============================================
ALTER TABLE travel_itineraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_legs ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_schedule_conflicts ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_export_history ENABLE ROW LEVEL SECURITY;

-- Travel itineraries policies
CREATE POLICY "Users can view travel itineraries"
  ON travel_itineraries FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create travel itineraries"
  ON travel_itineraries FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own travel itineraries"
  ON travel_itineraries FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid() OR EXISTS (
    SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' IN ('admin', 'manager')
  ))
  WITH CHECK (true);

-- Travel legs policies
CREATE POLICY "Users can view travel legs"
  ON travel_legs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage travel legs"
  ON travel_legs FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Travel conflicts policies
CREATE POLICY "Users can view travel conflicts"
  ON travel_schedule_conflicts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can resolve conflicts"
  ON travel_schedule_conflicts FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Travel export history policies
CREATE POLICY "Users can view export history"
  ON travel_export_history FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create export records"
  ON travel_export_history FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Grant permissions
GRANT ALL ON travel_itineraries TO authenticated;
GRANT ALL ON travel_legs TO authenticated;
GRANT ALL ON travel_schedule_conflicts TO authenticated;
GRANT ALL ON travel_export_history TO authenticated;

COMMENT ON TABLE travel_itineraries IS 'PATCH 298: Travel itinerary management with crew and vessel integration';
COMMENT ON TABLE travel_legs IS 'PATCH 298: Multi-leg travel segments for complex itineraries';
COMMENT ON TABLE travel_schedule_conflicts IS 'PATCH 298: Auto-detected conflicts in travel schedules';
COMMENT ON TABLE travel_export_history IS 'PATCH 298: Audit trail for PDF/Excel exports';
