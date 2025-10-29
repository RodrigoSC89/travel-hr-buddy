-- ============================================================================
-- PATCH 491-495 - Database Schema (Corrigido)
-- Adiciona apenas as colunas/tabelas que faltam
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
  reported_by UUID,
  assigned_to UUID,
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

DROP POLICY IF EXISTS "Users can view all incident reports" ON public.incident_reports;
CREATE POLICY "Users can view all incident reports"
  ON public.incident_reports FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can create incident reports" ON public.incident_reports;
CREATE POLICY "Authenticated users can create incident reports"
  ON public.incident_reports FOR INSERT
  WITH CHECK (auth.uid() = reported_by);

DROP POLICY IF EXISTS "Users can update their own incident reports" ON public.incident_reports;
CREATE POLICY "Users can update their own incident reports"
  ON public.incident_reports FOR UPDATE
  USING (auth.uid() = reported_by OR auth.uid() = assigned_to);

-- PATCH 492: Adiciona colunas faltantes na tabela missions se não existirem
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='missions' AND column_name='code') THEN
    ALTER TABLE public.missions ADD COLUMN code TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='missions' AND column_name='name') THEN
    ALTER TABLE public.missions ADD COLUMN name TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='missions' AND column_name='type') THEN
    ALTER TABLE public.missions ADD COLUMN type TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='missions' AND column_name='priority') THEN
    ALTER TABLE public.missions ADD COLUMN priority TEXT DEFAULT 'medium';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='missions' AND column_name='description') THEN
    ALTER TABLE public.missions ADD COLUMN description TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='missions' AND column_name='location') THEN
    ALTER TABLE public.missions ADD COLUMN location JSONB;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='missions' AND column_name='assigned_vessel_id') THEN
    ALTER TABLE public.missions ADD COLUMN assigned_vessel_id UUID;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='missions' AND column_name='assigned_agents') THEN
    ALTER TABLE public.missions ADD COLUMN assigned_agents JSONB DEFAULT '[]'::jsonb;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='missions' AND column_name='start_time') THEN
    ALTER TABLE public.missions ADD COLUMN start_time TIMESTAMPTZ;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='missions' AND column_name='end_time') THEN
    ALTER TABLE public.missions ADD COLUMN end_time TIMESTAMPTZ;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='missions' AND column_name='created_by') THEN
    ALTER TABLE public.missions ADD COLUMN created_by UUID;
  END IF;
END $$;

ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view all missions" ON public.missions;
CREATE POLICY "Users can view all missions"
  ON public.missions FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can create missions" ON public.missions;
CREATE POLICY "Authenticated users can create missions"
  ON public.missions FOR INSERT
  WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Mission creators can update their missions" ON public.missions;
CREATE POLICY "Mission creators can update their missions"
  ON public.missions FOR UPDATE
  USING (auth.uid() = created_by);

-- Mission Logs Table
CREATE TABLE IF NOT EXISTS public.mission_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID,
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

DROP POLICY IF EXISTS "Users can view all mission logs" ON public.mission_logs;
CREATE POLICY "Users can view all mission logs"
  ON public.mission_logs FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can create mission logs" ON public.mission_logs;
CREATE POLICY "Authenticated users can create mission logs"
  ON public.mission_logs FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- PATCH 493: Template Export System
CREATE TABLE IF NOT EXISTS public.rendered_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL,
  title TEXT NOT NULL,
  format TEXT NOT NULL CHECK (format IN ('pdf', 'html', 'word', 'docx')),
  pdf_url TEXT,
  html_content TEXT,
  variables JSONB DEFAULT '{}'::jsonb,
  rendered_by UUID,
  rendered_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.rendered_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view all rendered documents" ON public.rendered_documents;
CREATE POLICY "Users can view all rendered documents"
  ON public.rendered_documents FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can create rendered documents" ON public.rendered_documents;
CREATE POLICY "Authenticated users can create rendered documents"
  ON public.rendered_documents FOR INSERT
  WITH CHECK (auth.uid() = rendered_by);

-- Template Placeholders Table
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

DROP POLICY IF EXISTS "Users can view all template placeholders" ON public.template_placeholders;
CREATE POLICY "Users can view all template placeholders"
  ON public.template_placeholders FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage template placeholders" ON public.template_placeholders;
CREATE POLICY "Authenticated users can manage template placeholders"
  ON public.template_placeholders FOR ALL
  USING (auth.uid() IS NOT NULL);

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
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.route_ai_suggestions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view all route suggestions" ON public.route_ai_suggestions;
CREATE POLICY "Users can view all route suggestions"
  ON public.route_ai_suggestions FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can create route suggestions" ON public.route_ai_suggestions;
CREATE POLICY "Authenticated users can create route suggestions"
  ON public.route_ai_suggestions FOR INSERT
  WITH CHECK (auth.uid() = created_by);

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

DROP POLICY IF EXISTS "Everyone can view satellite positions" ON public.satellite_positions;
CREATE POLICY "Everyone can view satellite positions"
  ON public.satellite_positions FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage satellite positions" ON public.satellite_positions;
CREATE POLICY "Authenticated users can manage satellite positions"
  ON public.satellite_positions FOR ALL
  USING (auth.uid() IS NOT NULL);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_incident_reports_status ON public.incident_reports(status);
CREATE INDEX IF NOT EXISTS idx_incident_reports_severity ON public.incident_reports(severity);
CREATE INDEX IF NOT EXISTS idx_missions_status ON public.missions(status);
CREATE INDEX IF NOT EXISTS idx_missions_priority ON public.missions(priority);
CREATE INDEX IF NOT EXISTS idx_mission_logs_mission_id ON public.mission_logs(mission_id);
CREATE INDEX IF NOT EXISTS idx_satellite_positions_norad_id ON public.satellite_positions(norad_id);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach triggers
DROP TRIGGER IF EXISTS update_incident_reports_updated_at ON public.incident_reports;
CREATE TRIGGER update_incident_reports_updated_at
  BEFORE UPDATE ON public.incident_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_missions_updated_at ON public.missions;
CREATE TRIGGER update_missions_updated_at
  BEFORE UPDATE ON public.missions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();