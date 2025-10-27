-- PATCH 258: Travel Management - Booking & Itinerário Completo
-- Objetivo: Finalizar módulo de gerenciamento de viagens e itinerários para tripulação

-- ============================================
-- Travel Bookings Table
-- ============================================
CREATE TABLE IF NOT EXISTS travel_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_number text UNIQUE NOT NULL,
  crew_member_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  vessel_id uuid REFERENCES vessels(id) ON DELETE SET NULL,
  booking_type text NOT NULL CHECK (booking_type IN ('onboarding', 'disembarkation', 'shore_leave', 'medical', 'emergency', 'training', 'other')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'rescheduled')),
  priority text DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  
  -- Travel Details
  origin_city text NOT NULL,
  origin_country text,
  origin_airport_code text,
  destination_city text NOT NULL,
  destination_country text,
  destination_airport_code text,
  
  -- Dates
  departure_date timestamptz NOT NULL,
  arrival_date timestamptz,
  return_departure_date timestamptz,
  return_arrival_date timestamptz,
  
  -- Transportation
  flight_details jsonb DEFAULT '[]'::jsonb, -- Array of flight segments
  ground_transportation jsonb DEFAULT '{}'::jsonb,
  accommodation_details jsonb DEFAULT '[]'::jsonb,
  
  -- Costs
  flight_cost numeric DEFAULT 0 CHECK (flight_cost >= 0),
  accommodation_cost numeric DEFAULT 0 CHECK (accommodation_cost >= 0),
  ground_transport_cost numeric DEFAULT 0 CHECK (ground_transport_cost >= 0),
  meal_allowance numeric DEFAULT 0 CHECK (meal_allowance >= 0),
  other_expenses numeric DEFAULT 0 CHECK (other_expenses >= 0),
  total_cost numeric GENERATED ALWAYS AS (
    flight_cost + accommodation_cost + ground_transport_cost + meal_allowance + other_expenses
  ) STORED,
  budget_limit numeric,
  currency text DEFAULT 'USD',
  
  -- Approval
  approved_by uuid REFERENCES auth.users(id),
  approved_at timestamptz,
  approval_notes text,
  
  -- Additional Info
  purpose text,
  special_requirements text,
  visa_required boolean DEFAULT false,
  visa_status text CHECK (visa_status IN ('not_required', 'pending', 'approved', 'rejected', 'expired')),
  travel_insurance jsonb,
  emergency_contacts jsonb DEFAULT '[]'::jsonb,
  
  notes text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Travel bookings indexes
CREATE INDEX IF NOT EXISTS idx_travel_bookings_crew ON travel_bookings(crew_member_id);
CREATE INDEX IF NOT EXISTS idx_travel_bookings_vessel ON travel_bookings(vessel_id);
CREATE INDEX IF NOT EXISTS idx_travel_bookings_status ON travel_bookings(status);
CREATE INDEX IF NOT EXISTS idx_travel_bookings_type ON travel_bookings(booking_type);
CREATE INDEX IF NOT EXISTS idx_travel_bookings_departure ON travel_bookings(departure_date);

-- ============================================
-- Itineraries Table
-- ============================================
CREATE TABLE IF NOT EXISTS itineraries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES travel_bookings(id) ON DELETE CASCADE,
  itinerary_name text NOT NULL,
  description text,
  
  -- Timeline
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  total_duration_days numeric GENERATED ALWAYS AS (
    EXTRACT(DAY FROM (end_date - start_date))
  ) STORED,
  
  -- Itinerary Items
  items jsonb DEFAULT '[]'::jsonb NOT NULL, -- Array of {date, time, activity, location, notes, duration}
  
  -- Status
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'finalized', 'active', 'completed', 'cancelled')),
  completion_percentage numeric DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  
  -- Documents
  confirmation_documents jsonb DEFAULT '[]'::jsonb,
  tickets jsonb DEFAULT '[]'::jsonb,
  vouchers jsonb DEFAULT '[]'::jsonb,
  
  -- Notifications
  notifications_sent jsonb DEFAULT '[]'::jsonb,
  reminders_scheduled jsonb DEFAULT '[]'::jsonb,
  
  -- Sync with Crew
  crew_member_id uuid REFERENCES auth.users(id),
  vessel_assignment_id uuid REFERENCES crew_assignments(id),
  sync_status text DEFAULT 'pending' CHECK (sync_status IN ('pending', 'synced', 'out_of_sync', 'conflict')),
  last_sync_at timestamptz,
  
  notes text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Itineraries indexes
CREATE INDEX IF NOT EXISTS idx_itineraries_booking ON itineraries(booking_id);
CREATE INDEX IF NOT EXISTS idx_itineraries_crew ON itineraries(crew_member_id);
CREATE INDEX IF NOT EXISTS idx_itineraries_vessel_assignment ON itineraries(vessel_assignment_id);
CREATE INDEX IF NOT EXISTS idx_itineraries_status ON itineraries(status);
CREATE INDEX IF NOT EXISTS idx_itineraries_dates ON itineraries(start_date, end_date);

-- ============================================
-- Expense Claims Table
-- ============================================
CREATE TABLE IF NOT EXISTS expense_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_number text UNIQUE NOT NULL,
  booking_id uuid REFERENCES travel_bookings(id) ON DELETE SET NULL,
  itinerary_id uuid REFERENCES itineraries(id) ON DELETE SET NULL,
  crew_member_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Claim Details
  claim_date timestamptz DEFAULT now(),
  expense_date timestamptz NOT NULL,
  category text NOT NULL CHECK (category IN ('transportation', 'accommodation', 'meals', 'communication', 'medical', 'equipment', 'other')),
  description text NOT NULL,
  
  -- Amounts
  amount numeric NOT NULL CHECK (amount >= 0),
  currency text DEFAULT 'USD',
  exchange_rate numeric DEFAULT 1.0,
  amount_usd numeric GENERATED ALWAYS AS (amount * exchange_rate) STORED,
  
  -- Status
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'paid', 'cancelled')),
  
  -- Approval
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  approved_amount numeric,
  rejection_reason text,
  
  -- Payment
  payment_method text CHECK (payment_method IN ('bank_transfer', 'check', 'cash', 'corporate_card', 'reimbursement')),
  payment_date timestamptz,
  payment_reference text,
  
  -- Supporting Documents
  receipts jsonb DEFAULT '[]'::jsonb,
  attachments jsonb DEFAULT '[]'::jsonb,
  
  -- Budget Check
  budget_exceeded boolean DEFAULT false,
  budget_variance numeric,
  
  notes text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Expense claims indexes
CREATE INDEX IF NOT EXISTS idx_expense_claims_booking ON expense_claims(booking_id);
CREATE INDEX IF NOT EXISTS idx_expense_claims_itinerary ON expense_claims(itinerary_id);
CREATE INDEX IF NOT EXISTS idx_expense_claims_crew ON expense_claims(crew_member_id);
CREATE INDEX IF NOT EXISTS idx_expense_claims_status ON expense_claims(status);
CREATE INDEX IF NOT EXISTS idx_expense_claims_category ON expense_claims(category);
CREATE INDEX IF NOT EXISTS idx_expense_claims_date ON expense_claims(expense_date DESC);

-- ============================================
-- Row Level Security
-- ============================================

ALTER TABLE travel_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE itineraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_claims ENABLE ROW LEVEL SECURITY;

-- Travel bookings policies
CREATE POLICY "Allow crew to read their own bookings"
  ON travel_bookings FOR SELECT TO authenticated 
  USING (auth.uid() = crew_member_id OR auth.uid() = created_by);

CREATE POLICY "Allow managers to read all bookings"
  ON travel_bookings FOR SELECT TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'operator')
    )
  );

CREATE POLICY "Allow authenticated users to insert bookings"
  ON travel_bookings FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update bookings"
  ON travel_bookings FOR UPDATE TO authenticated USING (true);

-- Itineraries policies
CREATE POLICY "Allow crew to read their own itineraries"
  ON itineraries FOR SELECT TO authenticated 
  USING (auth.uid() = crew_member_id OR auth.uid() = created_by);

CREATE POLICY "Allow managers to read all itineraries"
  ON itineraries FOR SELECT TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'operator')
    )
  );

CREATE POLICY "Allow authenticated users to insert itineraries"
  ON itineraries FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update itineraries"
  ON itineraries FOR UPDATE TO authenticated USING (true);

-- Expense claims policies
CREATE POLICY "Allow crew to read their own expense claims"
  ON expense_claims FOR SELECT TO authenticated 
  USING (auth.uid() = crew_member_id OR auth.uid() = created_by);

CREATE POLICY "Allow managers to read all expense claims"
  ON expense_claims FOR SELECT TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'operator')
    )
  );

CREATE POLICY "Allow authenticated users to insert expense claims"
  ON expense_claims FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update expense claims"
  ON expense_claims FOR UPDATE TO authenticated USING (true);

-- ============================================
-- Update Triggers
-- ============================================

CREATE TRIGGER update_travel_bookings_updated_at BEFORE UPDATE ON travel_bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_itineraries_updated_at BEFORE UPDATE ON itineraries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expense_claims_updated_at BEFORE UPDATE ON expense_claims
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Budget Alert Trigger
-- ============================================

CREATE OR REPLACE FUNCTION check_travel_budget()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.budget_limit IS NOT NULL AND NEW.total_cost > NEW.budget_limit THEN
    -- Log alert
    INSERT INTO access_logs (module_accessed, action, result, severity, details)
    VALUES (
      'travel-management',
      'budget_exceeded',
      'warning',
      'warning',
      jsonb_build_object(
        'booking_id', NEW.id,
        'booking_number', NEW.booking_number,
        'budget_limit', NEW.budget_limit,
        'total_cost', NEW.total_cost,
        'variance', NEW.total_cost - NEW.budget_limit
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER travel_booking_budget_check AFTER INSERT OR UPDATE ON travel_bookings
  FOR EACH ROW EXECUTE FUNCTION check_travel_budget();

-- ============================================
-- Expense Budget Check Trigger
-- ============================================

CREATE OR REPLACE FUNCTION check_expense_budget()
RETURNS TRIGGER AS $$
DECLARE
  v_booking_budget numeric;
  v_total_expenses numeric;
BEGIN
  IF NEW.booking_id IS NOT NULL THEN
    -- Get booking budget
    SELECT budget_limit INTO v_booking_budget
    FROM travel_bookings
    WHERE id = NEW.booking_id;
    
    IF v_booking_budget IS NOT NULL THEN
      -- Calculate total expenses for this booking
      SELECT COALESCE(SUM(amount_usd), 0) INTO v_total_expenses
      FROM expense_claims
      WHERE booking_id = NEW.booking_id
        AND status NOT IN ('cancelled', 'rejected');
      
      -- Check if budget exceeded
      IF v_total_expenses > v_booking_budget THEN
        NEW.budget_exceeded := true;
        NEW.budget_variance := v_total_expenses - v_booking_budget;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER expense_claim_budget_check BEFORE INSERT OR UPDATE ON expense_claims
  FOR EACH ROW EXECUTE FUNCTION check_expense_budget();

-- ============================================
-- Functions for Travel Management
-- ============================================

-- Function to get travel cost summary
CREATE OR REPLACE FUNCTION get_travel_cost_summary(
  p_crew_member_id uuid DEFAULT NULL,
  p_start_date timestamptz DEFAULT now() - interval '30 days',
  p_end_date timestamptz DEFAULT now()
)
RETURNS TABLE (
  total_bookings bigint,
  total_cost numeric,
  avg_cost_per_booking numeric,
  total_over_budget numeric,
  bookings_over_budget bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::bigint as total_bookings,
    COALESCE(SUM(tb.total_cost), 0) as total_cost,
    COALESCE(AVG(tb.total_cost), 0) as avg_cost_per_booking,
    COALESCE(SUM(GREATEST(tb.total_cost - COALESCE(tb.budget_limit, tb.total_cost), 0)), 0) as total_over_budget,
    COUNT(*) FILTER (WHERE tb.total_cost > COALESCE(tb.budget_limit, tb.total_cost + 1))::bigint as bookings_over_budget
  FROM travel_bookings tb
  WHERE (p_crew_member_id IS NULL OR tb.crew_member_id = p_crew_member_id)
    AND tb.departure_date >= p_start_date
    AND tb.departure_date <= p_end_date;
END;
$$ LANGUAGE plpgsql;

-- Function to sync itinerary with crew assignment
CREATE OR REPLACE FUNCTION sync_itinerary_with_crew(p_itinerary_id uuid)
RETURNS void AS $$
DECLARE
  v_crew_id uuid;
  v_vessel_id uuid;
  v_start_date timestamptz;
  v_end_date timestamptz;
BEGIN
  -- Get itinerary details
  SELECT crew_member_id, start_date, end_date
  INTO v_crew_id, v_start_date, v_end_date
  FROM itineraries
  WHERE id = p_itinerary_id;
  
  -- Get vessel from booking
  SELECT vessel_id INTO v_vessel_id
  FROM travel_bookings tb
  JOIN itineraries i ON i.booking_id = tb.id
  WHERE i.id = p_itinerary_id;
  
  -- Update itinerary sync status
  UPDATE itineraries
  SET 
    sync_status = 'synced',
    last_sync_at = now()
  WHERE id = p_itinerary_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Views
-- ============================================

-- View for upcoming travel
CREATE OR REPLACE VIEW upcoming_travel AS
SELECT 
  tb.id,
  tb.booking_number,
  tb.crew_member_id,
  tb.vessel_id,
  tb.booking_type,
  tb.status,
  tb.origin_city,
  tb.destination_city,
  tb.departure_date,
  tb.arrival_date,
  tb.total_cost,
  tb.budget_limit,
  CASE 
    WHEN tb.total_cost > COALESCE(tb.budget_limit, tb.total_cost + 1) THEN true
    ELSE false
  END as over_budget,
  v.name as vessel_name
FROM travel_bookings tb
LEFT JOIN vessels v ON tb.vessel_id = v.id
WHERE tb.departure_date >= now()
  AND tb.status NOT IN ('cancelled', 'completed')
ORDER BY tb.departure_date ASC;

-- ============================================
-- Comments
-- ============================================

COMMENT ON TABLE travel_bookings IS 'Crew travel bookings with cost tracking and budget alerts';
COMMENT ON TABLE itineraries IS 'Detailed travel itineraries synchronized with crew assignments';
COMMENT ON TABLE expense_claims IS 'Travel expense claims with approval workflow and budget validation';
