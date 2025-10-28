-- ============================================
-- PATCH 377: Travel Management - Reservations Integration
-- Objective: Complete travel management with itinerary sync, exports, and notifications
-- ============================================

-- ============================================
-- 1. Reservations Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.travel_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_number TEXT UNIQUE NOT NULL,
  itinerary_id UUID REFERENCES public.travel_itineraries(id) ON DELETE CASCADE,
  crew_member_id UUID REFERENCES public.crew_members(id) ON DELETE CASCADE,
  reservation_type TEXT NOT NULL CHECK (reservation_type IN ('accommodation', 'transportation', 'car_rental', 'service', 'other')),
  provider_name TEXT NOT NULL,
  booking_reference TEXT,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
  check_in_date TIMESTAMPTZ,
  check_out_date TIMESTAMPTZ,
  location TEXT,
  cost DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'cancelled')),
  confirmation_sent BOOLEAN DEFAULT false,
  cancellation_policy TEXT,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_reservations_itinerary ON public.travel_reservations(itinerary_id);
CREATE INDEX IF NOT EXISTS idx_reservations_crew ON public.travel_reservations(crew_member_id);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON public.travel_reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_check_in ON public.travel_reservations(check_in_date);
CREATE INDEX IF NOT EXISTS idx_reservations_type ON public.travel_reservations(reservation_type);

ALTER TABLE public.travel_reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view reservations"
  ON public.travel_reservations FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can manage their reservations"
  ON public.travel_reservations FOR ALL
  USING (auth.uid() = created_by OR auth.uid() = crew_member_id::uuid);

-- ============================================
-- 2. Itinerary Groups (for team travel)
-- ============================================
CREATE TABLE IF NOT EXISTS public.itinerary_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_name TEXT NOT NULL,
  group_type TEXT CHECK (group_type IN ('mission', 'training', 'crew_rotation', 'emergency', 'other')),
  description TEXT,
  departure_location TEXT,
  arrival_location TEXT,
  departure_date TIMESTAMPTZ,
  arrival_date TIMESTAMPTZ,
  lead_crew_member_id UUID REFERENCES public.crew_members(id),
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  budget DECIMAL(12,2),
  currency TEXT DEFAULT 'USD',
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_itinerary_groups_status ON public.itinerary_groups(status);
CREATE INDEX IF NOT EXISTS idx_itinerary_groups_dates ON public.itinerary_groups(departure_date, arrival_date);
CREATE INDEX IF NOT EXISTS idx_itinerary_groups_type ON public.itinerary_groups(group_type);

ALTER TABLE public.itinerary_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view groups"
  ON public.itinerary_groups FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can manage groups"
  ON public.itinerary_groups FOR ALL
  USING (auth.uid() = created_by);

-- ============================================
-- 3. Group Members Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.itinerary_group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES public.itinerary_groups(id) ON DELETE CASCADE NOT NULL,
  itinerary_id UUID REFERENCES public.travel_itineraries(id) ON DELETE CASCADE NOT NULL,
  crew_member_id UUID REFERENCES public.crew_members(id) ON DELETE CASCADE NOT NULL,
  role TEXT, -- 'leader', 'member', 'coordinator'
  joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(group_id, crew_member_id)
);

CREATE INDEX IF NOT EXISTS idx_group_members_group ON public.itinerary_group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_crew ON public.itinerary_group_members(crew_member_id);

ALTER TABLE public.itinerary_group_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view group members"
  ON public.itinerary_group_members FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- ============================================
-- 4. Check-in/Out Notifications Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.travel_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_type TEXT NOT NULL CHECK (notification_type IN ('check_in_reminder', 'check_out_reminder', 'departure_reminder', 'arrival_confirmation', 'delay_alert', 'cancellation', 'itinerary_update')),
  itinerary_id UUID REFERENCES public.travel_itineraries(id) ON DELETE CASCADE,
  reservation_id UUID REFERENCES public.travel_reservations(id) ON DELETE CASCADE,
  crew_member_id UUID REFERENCES public.crew_members(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  delivery_method TEXT[] DEFAULT ARRAY['email'], -- email, sms, push, in_app
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_notifications_crew ON public.travel_notifications(crew_member_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON public.travel_notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_scheduled ON public.travel_notifications(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_notifications_itinerary ON public.travel_notifications(itinerary_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.travel_notifications(notification_type);

ALTER TABLE public.travel_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their notifications"
  ON public.travel_notifications FOR SELECT
  USING (auth.uid() = crew_member_id::uuid);

-- ============================================
-- 5. Itinerary Export History
-- ============================================
CREATE TABLE IF NOT EXISTS public.itinerary_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  itinerary_id UUID REFERENCES public.travel_itineraries(id) ON DELETE CASCADE NOT NULL,
  export_format TEXT NOT NULL CHECK (export_format IN ('pdf', 'ics', 'json', 'csv')),
  file_url TEXT,
  file_size_kb INTEGER,
  exported_by UUID REFERENCES auth.users(id),
  exported_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  download_count INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_exports_itinerary ON public.itinerary_exports(itinerary_id);
CREATE INDEX IF NOT EXISTS idx_exports_user ON public.itinerary_exports(exported_by);
CREATE INDEX IF NOT EXISTS idx_exports_format ON public.itinerary_exports(export_format);

ALTER TABLE public.itinerary_exports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their exports"
  ON public.itinerary_exports FOR SELECT
  USING (auth.uid() = exported_by);

CREATE POLICY "Users can create exports"
  ON public.itinerary_exports FOR INSERT
  WITH CHECK (auth.uid() = exported_by);

-- ============================================
-- 6. Functions
-- ============================================

-- Function to sync reservations with itinerary
CREATE OR REPLACE FUNCTION sync_reservation_to_itinerary()
RETURNS TRIGGER AS $$
BEGIN
  -- Update itinerary status based on reservation confirmations
  IF NEW.status = 'confirmed' THEN
    UPDATE travel_itineraries
    SET status = 'confirmed',
        updated_at = NOW()
    WHERE id = NEW.itinerary_id
      AND status = 'pending';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER sync_reservation_status
  AFTER INSERT OR UPDATE OF status ON public.travel_reservations
  FOR EACH ROW
  EXECUTE FUNCTION sync_reservation_to_itinerary();

-- Function to create check-in/out notifications
CREATE OR REPLACE FUNCTION create_checkin_notifications()
RETURNS TRIGGER AS $$
BEGIN
  -- Create check-in reminder (1 day before)
  IF NEW.check_in_date IS NOT NULL THEN
    INSERT INTO public.travel_notifications (
      notification_type,
      reservation_id,
      itinerary_id,
      crew_member_id,
      title,
      message,
      scheduled_for
    ) VALUES (
      'check_in_reminder',
      NEW.id,
      NEW.itinerary_id,
      NEW.crew_member_id,
      'Check-in Reminder',
      format('Reminder: Check-in for %s at %s on %s', 
        NEW.reservation_type, NEW.provider_name, 
        to_char(NEW.check_in_date, 'DD/MM/YYYY HH24:MI')),
      NEW.check_in_date - INTERVAL '1 day'
    )
    ON CONFLICT DO NOTHING;
  END IF;
  
  -- Create check-out reminder (on check-out day)
  IF NEW.check_out_date IS NOT NULL THEN
    INSERT INTO public.travel_notifications (
      notification_type,
      reservation_id,
      itinerary_id,
      crew_member_id,
      title,
      message,
      scheduled_for
    ) VALUES (
      'check_out_reminder',
      NEW.id,
      NEW.itinerary_id,
      NEW.crew_member_id,
      'Check-out Reminder',
      format('Reminder: Check-out from %s today at %s', 
        NEW.provider_name, to_char(NEW.check_out_date, 'HH24:MI')),
      NEW.check_out_date - INTERVAL '2 hours'
    )
    ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER create_reservation_notifications
  AFTER INSERT OR UPDATE OF check_in_date, check_out_date ON public.travel_reservations
  FOR EACH ROW
  EXECUTE FUNCTION create_checkin_notifications();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_travel_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_reservations_updated_at 
  BEFORE UPDATE ON public.travel_reservations
  FOR EACH ROW 
  EXECUTE FUNCTION update_travel_updated_at();

CREATE TRIGGER set_groups_updated_at 
  BEFORE UPDATE ON public.itinerary_groups
  FOR EACH ROW 
  EXECUTE FUNCTION update_travel_updated_at();

-- ============================================
-- 7. Sample Data
-- ============================================

-- Insert sample group
INSERT INTO public.itinerary_groups (group_name, group_type, description, status) VALUES
  ('Q1 Crew Rotation', 'crew_rotation', 'Quarterly crew rotation for offshore vessels', 'planning'),
  ('Emergency Response Team', 'emergency', 'Emergency response deployment', 'confirmed')
ON CONFLICT DO NOTHING;

COMMENT ON TABLE public.travel_reservations IS 'PATCH 377: Travel reservations with sync to itineraries';
COMMENT ON TABLE public.itinerary_groups IS 'PATCH 377: Group travel management for teams';
COMMENT ON TABLE public.travel_notifications IS 'PATCH 377: Automated check-in/out notifications';
COMMENT ON TABLE public.itinerary_exports IS 'PATCH 377: Export history for PDF and ICS formats';
