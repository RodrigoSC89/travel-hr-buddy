-- ============================================================================
-- PATCH 491-495 - Database Schema (Adapted)
-- Incident Merge, Mission Engine, Templates, Route Planner, Satellite Tracker
-- ============================================================================

-- PATCH 491: Incident Reports (Consolidated)
CREATE TABLE IF NOT EXISTS public.incident_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('safety', 'environmental', 'operational', 'security', 'other')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'closed')),
  reported_by UUID REFERENCES auth.users(id),
  assigned_to UUID REFERENCES auth.users(id),
  reported_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at TIMESTAMPTZ,
  location TEXT NOT NULL,
  evidence JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  ai_analysis JSONB,
  replay_status TEXT CHECK (replay_status IN ('pending', 'in_progress', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.incident_reports ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'incident_reports' AND policyname = 'Users can view all incident reports') THEN
    CREATE POLICY "Users can view all incident reports"
      ON public.incident_reports FOR SELECT
      USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'incident_reports' AND policyname = 'Authenticated users can create incident reports') THEN
    CREATE POLICY "Authenticated users can create incident reports"
      ON public.incident_reports FOR INSERT
      WITH CHECK (auth.uid() = reported_by);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'incident_reports' AND policyname = 'Users can update their own incident reports') THEN
    CREATE POLICY "Users can update their own incident reports"
      ON public.incident_reports FOR UPDATE
      USING (auth.uid() = reported_by OR auth.uid() = assigned_to);
  END IF;
END $$;

-- PATCH 492: Mission Logs (missions table already exists)
CREATE TABLE IF NOT EXISTS public.mission_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID REFERENCES public.missions(id) ON DELETE CASCADE,
  log_type TEXT NOT NULL CHECK (log_type IN ('info', 'warning', 'error', 'critical', 'success')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  category TEXT NOT NULL,
  source_module TEXT NOT NULL,
  event_timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.mission_logs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'mission_logs' AND policyname = 'Users can view all mission logs') THEN
    CREATE POLICY "Users can view all mission logs"
      ON public.mission_logs FOR SELECT
      USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'mission_logs' AND policyname = 'Authenticated users can create mission logs') THEN
    CREATE POLICY "Authenticated users can create mission logs"
      ON public.mission_logs FOR INSERT
      WITH CHECK (auth.uid() IS NOT NULL);
  END IF;
END $$;

-- PATCH 493: Template Export System
CREATE TABLE IF NOT EXISTS public.rendered_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL,
  title TEXT NOT NULL,
  format TEXT NOT NULL CHECK (format IN ('pdf', 'html', 'word', 'docx')),
  pdf_url TEXT,
  html_content TEXT,
  variables JSONB DEFAULT '{}'::jsonb,
  rendered_by UUID REFERENCES auth.users(id),
  rendered_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.rendered_documents ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'rendered_documents' AND policyname = 'Users can view all rendered documents') THEN
    CREATE POLICY "Users can view all rendered documents"
      ON public.rendered_documents FOR SELECT
      USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'rendered_documents' AND policyname = 'Authenticated users can create rendered documents') THEN
    CREATE POLICY "Authenticated users can create rendered documents"
      ON public.rendered_documents FOR INSERT
      WITH CHECK (auth.uid() = rendered_by);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.template_placeholders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL,
  placeholder_key TEXT NOT NULL,
  placeholder_label TEXT NOT NULL,
  placeholder_type TEXT NOT NULL DEFAULT 'text' CHECK (placeholder_type IN ('text', 'number', 'date', 'email', 'select')),
  is_required BOOLEAN DEFAULT false,
  default_value TEXT,
  options JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(template_id, placeholder_key)
);

ALTER TABLE public.template_placeholders ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'template_placeholders' AND policyname = 'Users can view all template placeholders') THEN
    CREATE POLICY "Users can view all template placeholders"
      ON public.template_placeholders FOR SELECT
      USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'template_placeholders' AND policyname = 'Authenticated users can manage template placeholders') THEN
    CREATE POLICY "Authenticated users can manage template placeholders"
      ON public.template_placeholders FOR ALL
      USING (auth.uid() IS NOT NULL);
  END IF;
END $$;

-- PATCH 494: Route Planner AI
CREATE TABLE IF NOT EXISTS public.route_ai_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  origin JSONB NOT NULL,
  destination JSONB NOT NULL,
  suggested_route JSONB NOT NULL,
  weather_data JSONB,
  fuel_estimate NUMERIC,
  time_estimate_hours NUMERIC,
  risk_score NUMERIC,
  ai_reasoning TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.route_ai_suggestions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'route_ai_suggestions' AND policyname = 'Users can view all route suggestions') THEN
    CREATE POLICY "Users can view all route suggestions"
      ON public.route_ai_suggestions FOR SELECT
      USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'route_ai_suggestions' AND policyname = 'Authenticated users can create route suggestions') THEN
    CREATE POLICY "Authenticated users can create route suggestions"
      ON public.route_ai_suggestions FOR INSERT
      WITH CHECK (auth.uid() = created_by);
  END IF;
END $$;

-- PATCH 495: Satellite Tracker
CREATE TABLE IF NOT EXISTS public.satellite_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  norad_id TEXT NOT NULL,
  name TEXT NOT NULL,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  altitude NUMERIC NOT NULL,
  velocity NUMERIC NOT NULL,
  orbital_period NUMERIC,
  inclination NUMERIC,
  eccentricity NUMERIC,
  tle_line1 TEXT,
  tle_line2 TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'lost')),
  last_updated TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.satellite_positions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'satellite_positions' AND policyname = 'Everyone can view satellite positions') THEN
    CREATE POLICY "Everyone can view satellite positions"
      ON public.satellite_positions FOR SELECT
      USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'satellite_positions' AND policyname = 'Authenticated users can manage satellite positions') THEN
    CREATE POLICY "Authenticated users can manage satellite positions"
      ON public.satellite_positions FOR ALL
      USING (auth.uid() IS NOT NULL);
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_incident_reports_status ON public.incident_reports(status);
CREATE INDEX IF NOT EXISTS idx_incident_reports_severity ON public.incident_reports(severity);
CREATE INDEX IF NOT EXISTS idx_mission_logs_mission_id ON public.mission_logs(mission_id);
CREATE INDEX IF NOT EXISTS idx_satellite_positions_norad_id ON public.satellite_positions(norad_id);

-- Updated_at trigger for incident_reports
DROP TRIGGER IF EXISTS update_incident_reports_updated_at ON public.incident_reports;
CREATE TRIGGER update_incident_reports_updated_at
  BEFORE UPDATE ON public.incident_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample satellites for testing
INSERT INTO public.satellite_positions (norad_id, name, latitude, longitude, altitude, velocity, status)
VALUES
  ('25544', 'ISS (ZARYA)', 0, 0, 408, 7.66, 'active'),
  ('43013', 'STARLINK-1007', 0, 0, 550, 7.59, 'active'),
  ('48274', 'STARLINK-1600', 0, 0, 550, 7.59, 'active'),
  ('20580', 'GOES 13', 0, 0, 35786, 3.07, 'active'),
  ('33591', 'NOAA 19', 0, 0, 870, 7.40, 'active')
ON CONFLICT DO NOTHING;