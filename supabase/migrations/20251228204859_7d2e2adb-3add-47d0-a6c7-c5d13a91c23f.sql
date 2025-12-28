-- PATCH 661.6: Create satellites tables from scratch
CREATE TABLE IF NOT EXISTS public.satellites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  norad_id TEXT UNIQUE,
  name TEXT NOT NULL,
  satellite_type TEXT,
  operator TEXT,
  launch_date DATE,
  orbital_period_minutes NUMERIC,
  inclination_degrees NUMERIC,
  apogee_km NUMERIC,
  perigee_km NUMERIC,
  tle_line1 TEXT,
  tle_line2 TEXT,
  is_active BOOLEAN DEFAULT true,
  organization_id UUID REFERENCES public.organizations(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.satellite_positions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  satellite_id UUID REFERENCES public.satellites(id),
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  altitude_km NUMERIC NOT NULL,
  velocity_km_s NUMERIC,
  azimuth NUMERIC,
  elevation NUMERIC,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.satellite_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  satellite_id UUID REFERENCES public.satellites(id),
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'info',
  message TEXT NOT NULL,
  acknowledged BOOLEAN DEFAULT false,
  organization_id UUID REFERENCES public.organizations(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.satellite_telemetry (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  satellite_id UUID REFERENCES public.satellites(id),
  telemetry_type TEXT NOT NULL,
  value NUMERIC,
  unit TEXT,
  status TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.satellite_passes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  satellite_id UUID REFERENCES public.satellites(id),
  observer_lat NUMERIC NOT NULL,
  observer_lon NUMERIC NOT NULL,
  rise_time TIMESTAMPTZ NOT NULL,
  max_elevation NUMERIC,
  set_time TIMESTAMPTZ,
  duration_seconds INTEGER,
  is_visible BOOLEAN DEFAULT false,
  organization_id UUID REFERENCES public.organizations(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.satellite_mission_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  satellite_id UUID REFERENCES public.satellites(id),
  mission_id UUID REFERENCES public.missions(id),
  link_type TEXT NOT NULL DEFAULT 'tracking',
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.satellites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.satellite_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.satellite_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.satellite_telemetry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.satellite_passes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.satellite_mission_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "satellites_policy" ON public.satellites FOR ALL USING (true);
CREATE POLICY "satellite_positions_policy" ON public.satellite_positions FOR ALL USING (true);
CREATE POLICY "satellite_alerts_policy" ON public.satellite_alerts FOR ALL USING (true);
CREATE POLICY "satellite_telemetry_policy" ON public.satellite_telemetry FOR ALL USING (true);
CREATE POLICY "satellite_passes_policy" ON public.satellite_passes FOR ALL USING (true);
CREATE POLICY "satellite_mission_links_policy" ON public.satellite_mission_links FOR ALL USING (true);