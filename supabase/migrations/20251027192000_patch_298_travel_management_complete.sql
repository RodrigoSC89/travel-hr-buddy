-- PATCH 298: Travel Management v1 - Complete Implementation
-- Objective: Finalize travel management with itinerary, conflict detection, and export

-- ============================================
-- Travel Schedule Conflicts Table
-- ============================================
CREATE TABLE IF NOT EXISTS travel_schedule_conflicts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id_1 uuid NOT NULL REFERENCES travel_bookings(id) ON DELETE CASCADE,
  booking_id_2 uuid NOT NULL REFERENCES travel_bookings(id) ON DELETE CASCADE,
  crew_member_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conflict_type text NOT NULL CHECK (conflict_type IN ('time_overlap', 'location_conflict', 'vessel_assignment', 'visa_issue', 'budget_exceeded')),
  severity text NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description text NOT NULL,
  overlap_start timestamptz,
  overlap_end timestamptz,
  overlap_duration_hours numeric,
  resolution_status text DEFAULT 'unresolved' CHECK (resolution_status IN ('unresolved', 'acknowledged', 'resolving', 'resolved', 'ignored')),
  resolved_by uuid REFERENCES auth.users(id),
  resolved_at timestamptz,
  resolution_notes text,
  auto_detected boolean DEFAULT true,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Travel conflicts indexes
CREATE INDEX IF NOT EXISTS idx_travel_conflicts_booking1 ON travel_schedule_conflicts(booking_id_1);
CREATE INDEX IF NOT EXISTS idx_travel_conflicts_booking2 ON travel_schedule_conflicts(booking_id_2);
CREATE INDEX IF NOT EXISTS idx_travel_conflicts_crew ON travel_schedule_conflicts(crew_member_id);
CREATE INDEX IF NOT EXISTS idx_travel_conflicts_type ON travel_schedule_conflicts(conflict_type);
CREATE INDEX IF NOT EXISTS idx_travel_conflicts_status ON travel_schedule_conflicts(resolution_status);
CREATE INDEX IF NOT EXISTS idx_travel_conflicts_severity ON travel_schedule_conflicts(severity);

-- ============================================
-- Travel Export History Table
-- ============================================
CREATE TABLE IF NOT EXISTS travel_export_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES travel_bookings(id) ON DELETE SET NULL,
  itinerary_id uuid REFERENCES itineraries(id) ON DELETE SET NULL,
  export_type text NOT NULL CHECK (export_type IN ('pdf', 'excel', 'csv', 'ical', 'json')),
  export_format text,
  file_path text,
  file_name text NOT NULL,
  file_size_bytes bigint,
  exported_by uuid NOT NULL REFERENCES auth.users(id),
  export_parameters jsonb DEFAULT '{}'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Export history indexes
CREATE INDEX IF NOT EXISTS idx_export_history_booking ON travel_export_history(booking_id);
CREATE INDEX IF NOT EXISTS idx_export_history_itinerary ON travel_export_history(itinerary_id);
CREATE INDEX IF NOT EXISTS idx_export_history_type ON travel_export_history(export_type);
CREATE INDEX IF NOT EXISTS idx_export_history_date ON travel_export_history(created_at DESC);

-- ============================================
-- Row Level Security
-- ============================================

ALTER TABLE travel_schedule_conflicts ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_export_history ENABLE ROW LEVEL SECURITY;

-- Travel conflicts policies
CREATE POLICY "Allow crew to read their own conflicts"
  ON travel_schedule_conflicts FOR SELECT TO authenticated 
  USING (auth.uid() = crew_member_id);

CREATE POLICY "Allow managers to read all conflicts"
  ON travel_schedule_conflicts FOR SELECT TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'operator')
    )
  );

CREATE POLICY "Allow authenticated users to insert conflicts"
  ON travel_schedule_conflicts FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update conflicts"
  ON travel_schedule_conflicts FOR UPDATE TO authenticated USING (true);

-- Export history policies
CREATE POLICY "Allow users to read their own exports"
  ON travel_export_history FOR SELECT TO authenticated 
  USING (auth.uid() = exported_by);

CREATE POLICY "Allow managers to read all exports"
  ON travel_export_history FOR SELECT TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'operator')
    )
  );

CREATE POLICY "Allow authenticated users to insert exports"
  ON travel_export_history FOR INSERT TO authenticated WITH CHECK (true);

-- ============================================
-- Functions for Conflict Detection
-- ============================================

-- Function to detect time overlaps
CREATE OR REPLACE FUNCTION detect_travel_time_overlaps()
RETURNS void AS $$
DECLARE
  booking1 RECORD;
  booking2 RECORD;
  v_overlap_start timestamptz;
  v_overlap_end timestamptz;
  v_overlap_hours numeric;
BEGIN
  -- Clear old auto-detected conflicts
  DELETE FROM travel_schedule_conflicts
  WHERE auto_detected = true
    AND created_at < now() - interval '7 days';

  -- Find overlapping bookings for the same crew member
  FOR booking1 IN
    SELECT * FROM travel_bookings
    WHERE status NOT IN ('cancelled', 'completed')
      AND departure_date >= now() - interval '30 days'
  LOOP
    FOR booking2 IN
      SELECT * FROM travel_bookings
      WHERE id != booking1.id
        AND crew_member_id = booking1.crew_member_id
        AND status NOT IN ('cancelled', 'completed')
        AND departure_date >= now() - interval '30 days'
        -- Check for time overlap
        AND (
          (departure_date, COALESCE(return_arrival_date, arrival_date, departure_date + interval '1 day'))
          OVERLAPS
          (booking1.departure_date, COALESCE(booking1.return_arrival_date, booking1.arrival_date, booking1.departure_date + interval '1 day'))
        )
    LOOP
      -- Calculate overlap period
      v_overlap_start := GREATEST(booking1.departure_date, booking2.departure_date);
      v_overlap_end := LEAST(
        COALESCE(booking1.return_arrival_date, booking1.arrival_date, booking1.departure_date + interval '1 day'),
        COALESCE(booking2.return_arrival_date, booking2.arrival_date, booking2.departure_date + interval '1 day')
      );
      v_overlap_hours := EXTRACT(EPOCH FROM (v_overlap_end - v_overlap_start)) / 3600;

      -- Insert conflict if not already exists
      INSERT INTO travel_schedule_conflicts (
        booking_id_1,
        booking_id_2,
        crew_member_id,
        conflict_type,
        severity,
        description,
        overlap_start,
        overlap_end,
        overlap_duration_hours,
        auto_detected
      )
      SELECT
        booking1.id,
        booking2.id,
        booking1.crew_member_id,
        'time_overlap',
        CASE 
          WHEN v_overlap_hours > 48 THEN 'critical'
          WHEN v_overlap_hours > 24 THEN 'high'
          WHEN v_overlap_hours > 6 THEN 'medium'
          ELSE 'low'
        END,
        format('Time overlap detected: %s hours between bookings %s and %s',
          ROUND(v_overlap_hours, 1),
          booking1.booking_number,
          booking2.booking_number
        ),
        v_overlap_start,
        v_overlap_end,
        v_overlap_hours,
        true
      WHERE NOT EXISTS (
        SELECT 1 FROM travel_schedule_conflicts
        WHERE (booking_id_1 = booking1.id AND booking_id_2 = booking2.id)
           OR (booking_id_1 = booking2.id AND booking_id_2 = booking1.id)
      );
    END LOOP;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to check for vessel assignment conflicts
CREATE OR REPLACE FUNCTION detect_vessel_assignment_conflicts()
RETURNS void AS $$
DECLARE
  booking RECORD;
  conflict_found boolean;
BEGIN
  FOR booking IN
    SELECT tb.*, ca.vessel_id as assigned_vessel_id, ca.start_date as assignment_start
    FROM travel_bookings tb
    LEFT JOIN crew_assignments ca ON ca.crew_member_id = tb.crew_member_id
      AND ca.status = 'active'
    WHERE tb.status NOT IN ('cancelled', 'completed')
      AND tb.departure_date >= now() - interval '7 days'
      AND tb.vessel_id IS NOT NULL
      AND ca.vessel_id IS NOT NULL
      AND tb.vessel_id != ca.vessel_id
  LOOP
    -- Insert vessel assignment conflict
    INSERT INTO travel_schedule_conflicts (
      booking_id_1,
      booking_id_2,
      crew_member_id,
      conflict_type,
      severity,
      description,
      auto_detected
    )
    SELECT
      booking.id,
      booking.id, -- Same booking referenced twice for this type
      booking.crew_member_id,
      'vessel_assignment',
      'high',
      format('Vessel assignment conflict: Booking for vessel %s but crew assigned to vessel %s',
        booking.vessel_id,
        booking.assigned_vessel_id
      ),
      true
    WHERE NOT EXISTS (
      SELECT 1 FROM travel_schedule_conflicts
      WHERE booking_id_1 = booking.id
        AND conflict_type = 'vessel_assignment'
        AND created_at > now() - interval '7 days'
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-detect conflicts when booking is created/updated
CREATE OR REPLACE FUNCTION trigger_conflict_detection()
RETURNS TRIGGER AS $$
BEGIN
  -- Run conflict detection asynchronously (in practice, this would be a job queue)
  PERFORM detect_travel_time_overlaps();
  PERFORM detect_vessel_assignment_conflicts();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER travel_booking_conflict_detection AFTER INSERT OR UPDATE ON travel_bookings
  FOR EACH ROW EXECUTE FUNCTION trigger_conflict_detection();

-- ============================================
-- Functions for Export
-- ============================================

-- Function to log export
CREATE OR REPLACE FUNCTION log_travel_export(
  p_booking_id uuid,
  p_itinerary_id uuid,
  p_export_type text,
  p_file_name text,
  p_file_path text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  export_id uuid;
BEGIN
  INSERT INTO travel_export_history (
    booking_id,
    itinerary_id,
    export_type,
    file_name,
    file_path,
    exported_by
  )
  VALUES (
    p_booking_id,
    p_itinerary_id,
    p_export_type,
    p_file_name,
    p_file_path,
    auth.uid()
  )
  RETURNING id INTO export_id;
  
  RETURN export_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Views
-- ============================================

-- View for active conflicts
CREATE OR REPLACE VIEW v_active_travel_conflicts AS
SELECT 
  tsc.*,
  tb1.booking_number as booking1_number,
  tb1.departure_date as booking1_departure,
  tb2.booking_number as booking2_number,
  tb2.departure_date as booking2_departure,
  u.raw_user_meta_data->>'full_name' as crew_member_name
FROM travel_schedule_conflicts tsc
LEFT JOIN travel_bookings tb1 ON tsc.booking_id_1 = tb1.id
LEFT JOIN travel_bookings tb2 ON tsc.booking_id_2 = tb2.id
LEFT JOIN auth.users u ON tsc.crew_member_id = u.id
WHERE tsc.resolution_status IN ('unresolved', 'acknowledged')
ORDER BY 
  CASE tsc.severity
    WHEN 'critical' THEN 1
    WHEN 'high' THEN 2
    WHEN 'medium' THEN 3
    WHEN 'low' THEN 4
  END,
  tsc.created_at DESC;

-- View for crew travel schedule
CREATE OR REPLACE VIEW v_crew_travel_schedule AS
SELECT 
  tb.id as booking_id,
  tb.booking_number,
  tb.crew_member_id,
  u.raw_user_meta_data->>'full_name' as crew_member_name,
  tb.booking_type,
  tb.status,
  tb.origin_city,
  tb.destination_city,
  tb.departure_date,
  tb.arrival_date,
  tb.return_departure_date,
  tb.return_arrival_date,
  tb.total_cost,
  tb.vessel_id,
  v.name as vessel_name,
  i.id as itinerary_id,
  i.itinerary_name,
  i.status as itinerary_status,
  -- Check for conflicts
  EXISTS (
    SELECT 1 FROM travel_schedule_conflicts
    WHERE (booking_id_1 = tb.id OR booking_id_2 = tb.id)
      AND resolution_status IN ('unresolved', 'acknowledged')
  ) as has_conflicts,
  -- Count of items in itinerary
  jsonb_array_length(COALESCE(i.items, '[]'::jsonb)) as itinerary_item_count
FROM travel_bookings tb
LEFT JOIN auth.users u ON tb.crew_member_id = u.id
LEFT JOIN vessels v ON tb.vessel_id = v.id
LEFT JOIN itineraries i ON i.booking_id = tb.id
WHERE tb.status NOT IN ('cancelled')
ORDER BY tb.departure_date DESC;

-- ============================================
-- Sample Data
-- ============================================

-- Run initial conflict detection
SELECT detect_travel_time_overlaps();
SELECT detect_vessel_assignment_conflicts();

-- ============================================
-- Comments
-- ============================================

COMMENT ON TABLE travel_schedule_conflicts IS 'Detected conflicts in travel schedules with resolution tracking';
COMMENT ON TABLE travel_export_history IS 'History of travel document exports (PDF, Excel, etc.)';
COMMENT ON FUNCTION detect_travel_time_overlaps IS 'Automatically detect time overlaps in crew travel bookings';
COMMENT ON FUNCTION detect_vessel_assignment_conflicts IS 'Detect conflicts between travel bookings and vessel assignments';
COMMENT ON VIEW v_active_travel_conflicts IS 'View of all active travel schedule conflicts';
COMMENT ON VIEW v_crew_travel_schedule IS 'Comprehensive view of crew travel schedule with conflicts';
