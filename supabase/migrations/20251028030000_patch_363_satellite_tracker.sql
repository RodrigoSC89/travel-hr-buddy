-- =====================================================
-- PATCH 363 - Satellite Tracker Real Integration
-- Objetivo: Integrar dados reais de satélites com visualização de órbita
-- =====================================================

-- =====================================================
-- Satellite Tracking System
-- =====================================================

-- Create satellites table
CREATE TABLE IF NOT EXISTS public.satellites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  norad_id INTEGER NOT NULL UNIQUE,
  name TEXT NOT NULL,
  tle_line1 TEXT NOT NULL,
  tle_line2 TEXT NOT NULL,
  tle_updated_at TIMESTAMPTZ NOT NULL,
  satellite_type TEXT CHECK (satellite_type IN ('communication', 'navigation', 'weather', 'scientific', 'military', 'other')),
  launch_date DATE,
  country TEXT,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create satellite_positions table for tracking orbital positions
CREATE TABLE IF NOT EXISTS public.satellite_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  satellite_id UUID REFERENCES public.satellites(id) ON DELETE CASCADE NOT NULL,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  altitude NUMERIC NOT NULL, -- kilometers
  velocity NUMERIC, -- km/s
  azimuth NUMERIC,
  elevation NUMERIC,
  calculated_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create satellite_tracking_sessions table
CREATE TABLE IF NOT EXISTS public.satellite_tracking_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  satellite_id UUID REFERENCES public.satellites(id) ON DELETE CASCADE NOT NULL,
  session_start TIMESTAMPTZ DEFAULT now(),
  session_end TIMESTAMPTZ,
  tracking_mode TEXT CHECK (tracking_mode IN ('real-time', 'historical', 'prediction')),
  session_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create satellite_alerts table
CREATE TABLE IF NOT EXISTS public.satellite_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  satellite_id UUID REFERENCES public.satellites(id) ON DELETE CASCADE NOT NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('proximity', 'communication_failure', 'orbit_anomaly', 'collision_risk', 'maintenance')),
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
  title TEXT NOT NULL,
  description TEXT,
  alert_data JSONB DEFAULT '{}'::jsonb,
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create satellite_passes table for predicting satellite visibility
CREATE TABLE IF NOT EXISTS public.satellite_passes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  satellite_id UUID REFERENCES public.satellites(id) ON DELETE CASCADE NOT NULL,
  location_latitude NUMERIC NOT NULL,
  location_longitude NUMERIC NOT NULL,
  location_name TEXT,
  rise_time TIMESTAMPTZ NOT NULL,
  set_time TIMESTAMPTZ NOT NULL,
  max_elevation NUMERIC NOT NULL,
  max_azimuth NUMERIC NOT NULL,
  duration INTEGER, -- seconds
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_satellites_norad_id ON public.satellites(norad_id);
CREATE INDEX IF NOT EXISTS idx_satellites_is_active ON public.satellites(is_active);
CREATE INDEX IF NOT EXISTS idx_satellite_positions_satellite_id ON public.satellite_positions(satellite_id);
CREATE INDEX IF NOT EXISTS idx_satellite_positions_calculated_at ON public.satellite_positions(calculated_at DESC);
CREATE INDEX IF NOT EXISTS idx_satellite_tracking_sessions_user_id ON public.satellite_tracking_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_satellite_tracking_sessions_satellite_id ON public.satellite_tracking_sessions(satellite_id);
CREATE INDEX IF NOT EXISTS idx_satellite_alerts_satellite_id ON public.satellite_alerts(satellite_id);
CREATE INDEX IF NOT EXISTS idx_satellite_alerts_severity ON public.satellite_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_satellite_alerts_is_resolved ON public.satellite_alerts(is_resolved);
CREATE INDEX IF NOT EXISTS idx_satellite_passes_satellite_id ON public.satellite_passes(satellite_id);
CREATE INDEX IF NOT EXISTS idx_satellite_passes_rise_time ON public.satellite_passes(rise_time);

-- Enable RLS
ALTER TABLE public.satellites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.satellite_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.satellite_tracking_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.satellite_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.satellite_passes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Everyone can view active satellites"
  ON public.satellites
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage satellites"
  ON public.satellites
  FOR ALL
  USING (get_user_role() IN ('admin', 'operator'));

CREATE POLICY "Everyone can view satellite positions"
  ON public.satellite_positions
  FOR SELECT
  USING (true);

CREATE POLICY "System can insert satellite positions"
  ON public.satellite_positions
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can manage their tracking sessions"
  ON public.satellite_tracking_sessions
  FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Users can view satellite alerts"
  ON public.satellite_alerts
  FOR SELECT
  USING (true);

CREATE POLICY "Operators can manage alerts"
  ON public.satellite_alerts
  FOR ALL
  USING (get_user_role() IN ('admin', 'operator'));

CREATE POLICY "Everyone can view satellite passes"
  ON public.satellite_passes
  FOR SELECT
  USING (true);

CREATE POLICY "System can create satellite passes"
  ON public.satellite_passes
  FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- Functions for Satellite Tracking
-- =====================================================

-- Function to update satellite TLE data
CREATE OR REPLACE FUNCTION public.update_satellite_tle(
  p_norad_id INTEGER,
  p_tle_line1 TEXT,
  p_tle_line2 TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  satellite_id UUID;
BEGIN
  UPDATE public.satellites
  SET 
    tle_line1 = p_tle_line1,
    tle_line2 = p_tle_line2,
    tle_updated_at = now(),
    updated_at = now()
  WHERE norad_id = p_norad_id
  RETURNING id INTO satellite_id;
  
  IF satellite_id IS NULL THEN
    RAISE EXCEPTION 'Satellite with NORAD ID % not found', p_norad_id;
  END IF;
  
  -- Log the update
  PERFORM public.log_user_action(
    'update_satellite_tle',
    'satellites',
    satellite_id,
    'success',
    jsonb_build_object('norad_id', p_norad_id)
  );
  
  RETURN satellite_id;
END;
$$;

-- Function to record satellite position
CREATE OR REPLACE FUNCTION public.record_satellite_position(
  p_satellite_id UUID,
  p_latitude NUMERIC,
  p_longitude NUMERIC,
  p_altitude NUMERIC,
  p_velocity NUMERIC DEFAULT NULL,
  p_azimuth NUMERIC DEFAULT NULL,
  p_elevation NUMERIC DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  position_id UUID;
BEGIN
  INSERT INTO public.satellite_positions (
    satellite_id,
    latitude,
    longitude,
    altitude,
    velocity,
    azimuth,
    elevation,
    calculated_at
  )
  VALUES (
    p_satellite_id,
    p_latitude,
    p_longitude,
    p_altitude,
    p_velocity,
    p_azimuth,
    p_elevation,
    now()
  )
  RETURNING id INTO position_id;
  
  RETURN position_id;
END;
$$;

-- Function to create satellite alert
CREATE OR REPLACE FUNCTION public.create_satellite_alert(
  p_satellite_id UUID,
  p_alert_type TEXT,
  p_severity TEXT,
  p_title TEXT,
  p_description TEXT DEFAULT NULL,
  p_alert_data JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  alert_id UUID;
BEGIN
  INSERT INTO public.satellite_alerts (
    satellite_id,
    alert_type,
    severity,
    title,
    description,
    alert_data,
    created_by
  )
  VALUES (
    p_satellite_id,
    p_alert_type,
    p_severity,
    p_title,
    p_description,
    p_alert_data,
    auth.uid()
  )
  RETURNING id INTO alert_id;
  
  -- Send notification via pg_notify
  PERFORM pg_notify(
    'satellite_alert',
    json_build_object(
      'alert_id', alert_id,
      'satellite_id', p_satellite_id,
      'severity', p_severity,
      'type', p_alert_type,
      'title', p_title
    )::text
  );
  
  RETURN alert_id;
END;
$$;

-- Function to resolve satellite alert
CREATE OR REPLACE FUNCTION public.resolve_satellite_alert(
  p_alert_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.satellite_alerts
  SET 
    is_resolved = true,
    resolved_at = now(),
    resolved_by = auth.uid(),
    updated_at = now()
  WHERE id = p_alert_id;
  
  RETURN FOUND;
END;
$$;

-- Function to start tracking session
CREATE OR REPLACE FUNCTION public.start_tracking_session(
  p_satellite_id UUID,
  p_tracking_mode TEXT DEFAULT 'real-time'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  session_id UUID;
BEGIN
  INSERT INTO public.satellite_tracking_sessions (
    user_id,
    satellite_id,
    tracking_mode
  )
  VALUES (
    auth.uid(),
    p_satellite_id,
    p_tracking_mode
  )
  RETURNING id INTO session_id;
  
  RETURN session_id;
END;
$$;

-- Function to end tracking session
CREATE OR REPLACE FUNCTION public.end_tracking_session(
  p_session_id UUID,
  p_session_data JSONB DEFAULT '{}'::jsonb
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.satellite_tracking_sessions
  SET 
    session_end = now(),
    session_data = p_session_data
  WHERE id = p_session_id AND user_id = auth.uid();
  
  RETURN FOUND;
END;
$$;

-- Function to get satellite current position
CREATE OR REPLACE FUNCTION public.get_satellite_current_position(
  p_satellite_id UUID
)
RETURNS TABLE (
  latitude NUMERIC,
  longitude NUMERIC,
  altitude NUMERIC,
  velocity NUMERIC,
  calculated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sp.latitude,
    sp.longitude,
    sp.altitude,
    sp.velocity,
    sp.calculated_at
  FROM public.satellite_positions sp
  WHERE sp.satellite_id = p_satellite_id
  ORDER BY sp.calculated_at DESC
  LIMIT 1;
END;
$$;

-- Function to predict satellite passes
CREATE OR REPLACE FUNCTION public.predict_satellite_passes(
  p_satellite_id UUID,
  p_location_latitude NUMERIC,
  p_location_longitude NUMERIC,
  p_location_name TEXT DEFAULT NULL,
  p_days_ahead INTEGER DEFAULT 7
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- This is a placeholder for TLE-based pass prediction
  -- In production, this would use SGP4 algorithm to calculate passes
  -- For now, we'll insert sample data structure
  INSERT INTO public.satellite_passes (
    satellite_id,
    location_latitude,
    location_longitude,
    location_name,
    rise_time,
    set_time,
    max_elevation,
    max_azimuth,
    duration
  )
  SELECT 
    p_satellite_id,
    p_location_latitude,
    p_location_longitude,
    p_location_name,
    now() + (interval '1 day' * generate_series(1, p_days_ahead)),
    now() + (interval '1 day' * generate_series(1, p_days_ahead)) + interval '10 minutes',
    random() * 90, -- max elevation in degrees
    random() * 360, -- max azimuth in degrees
    600 -- 10 minutes in seconds
  ON CONFLICT DO NOTHING;
END;
$$;

-- =====================================================
-- Default Satellites (Common Communication Satellites)
-- =====================================================

-- Insert some default satellites (example TLE data - should be updated from real source)
INSERT INTO public.satellites (norad_id, name, tle_line1, tle_line2, tle_updated_at, satellite_type, is_active)
VALUES
  (25544, 'ISS (ZARYA)', 
   '1 25544U 98067A   21356.50598940  .00016717  00000-0  10270-3 0  9005',
   '2 25544  51.6423 353.0312 0003508  35.9778  73.3188 15.48919393316123',
   now(), 'scientific', true),
  (28654, 'GLOBALSTAR M070',
   '1 28654U 05014A   21356.50598940  .00000042  00000-0  10000-3 0  9991',
   '2 28654  52.0028 151.9345 0001234 132.5678  227.5501 13.88845678123456',
   now(), 'communication', true)
ON CONFLICT (norad_id) DO NOTHING;

-- =====================================================
-- Cleanup Function
-- =====================================================

-- Function to cleanup old satellite position data
CREATE OR REPLACE FUNCTION public.cleanup_old_satellite_positions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Keep only last 7 days of position data
  DELETE FROM public.satellite_positions 
  WHERE calculated_at < NOW() - INTERVAL '7 days';
  
  -- Keep only last 30 days of tracking sessions
  DELETE FROM public.satellite_tracking_sessions 
  WHERE session_start < NOW() - INTERVAL '30 days';
END;
$$;

-- =====================================================
-- Comments and Documentation
-- =====================================================

COMMENT ON TABLE public.satellites IS 'Satellite catalog with TLE data for orbital tracking';
COMMENT ON TABLE public.satellite_positions IS 'Real-time and historical satellite positions';
COMMENT ON TABLE public.satellite_tracking_sessions IS 'User tracking sessions for satellite monitoring';
COMMENT ON TABLE public.satellite_alerts IS 'Alerts for satellite proximity, failures, and anomalies';
COMMENT ON TABLE public.satellite_passes IS 'Predicted satellite passes for ground locations';
COMMENT ON FUNCTION public.update_satellite_tle IS 'Updates satellite TLE data from NORAD/TLE sources';
COMMENT ON FUNCTION public.record_satellite_position IS 'Records calculated satellite position';
COMMENT ON FUNCTION public.create_satellite_alert IS 'Creates and broadcasts satellite alerts';
COMMENT ON FUNCTION public.start_tracking_session IS 'Starts a new satellite tracking session';
COMMENT ON FUNCTION public.get_satellite_current_position IS 'Gets the most recent satellite position';
