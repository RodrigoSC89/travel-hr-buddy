-- =====================================================
-- PATCH: Schema Alignment for TypeScript Compatibility
-- =====================================================

-- 1. Add missing columns to satellite_positions
ALTER TABLE public.satellite_positions 
  ADD COLUMN IF NOT EXISTS satellite_id UUID REFERENCES public.satellites(id),
  ADD COLUMN IF NOT EXISTS azimuth NUMERIC,
  ADD COLUMN IF NOT EXISTS elevation NUMERIC,
  ADD COLUMN IF NOT EXISTS calculated_at TIMESTAMPTZ DEFAULT now();

-- 2. Add missing columns to satellite_alerts
ALTER TABLE public.satellite_alerts 
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS is_resolved BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ;

-- 3. Create tracking_sessions table
CREATE TABLE IF NOT EXISTS public.tracking_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  satellite_id UUID REFERENCES public.satellites(id),
  tracking_mode TEXT DEFAULT 'real-time',
  status TEXT DEFAULT 'active',
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ,
  session_data JSONB DEFAULT '{}',
  organization_id UUID,
  user_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.tracking_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tracking_sessions_auth" ON public.tracking_sessions
  FOR ALL USING (auth.uid() IS NOT NULL);

-- 4. Create sonar_analysis table
CREATE TABLE IF NOT EXISTS public.sonar_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  input_id UUID,
  mission_id UUID,
  analysis_type TEXT NOT NULL,
  ai_model TEXT DEFAULT 'gpt-4o-mini',
  confidence_score NUMERIC DEFAULT 0,
  patterns_detected JSONB DEFAULT '[]',
  frequency_data JSONB DEFAULT '{}',
  anomalies JSONB DEFAULT '[]',
  recommendations TEXT,
  status TEXT DEFAULT 'pending',
  processed_at TIMESTAMPTZ,
  organization_id UUID,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.sonar_analysis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sonar_analysis_auth" ON public.sonar_analysis
  FOR ALL USING (auth.uid() IS NOT NULL);

-- 5. Create sonar_alerts table  
CREATE TABLE IF NOT EXISTS public.sonar_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID,
  mission_id UUID,
  alert_type TEXT NOT NULL,
  severity TEXT DEFAULT 'medium',
  title TEXT NOT NULL,
  description TEXT,
  frequency_range TEXT,
  location JSONB,
  is_acknowledged BOOLEAN DEFAULT false,
  resolved BOOLEAN DEFAULT false,
  organization_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.sonar_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sonar_alerts_auth" ON public.sonar_alerts
  FOR ALL USING (auth.uid() IS NOT NULL);

-- 6. Add missing columns to inspector_profiles
ALTER TABLE public.inspector_profiles 
  ADD COLUMN IF NOT EXISTS expertise TEXT[],
  ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS historical_focus_areas TEXT[];

-- 7. Create indexes
CREATE INDEX IF NOT EXISTS idx_tracking_sessions_satellite ON public.tracking_sessions(satellite_id);
CREATE INDEX IF NOT EXISTS idx_sonar_analysis_input ON public.sonar_analysis(input_id);
CREATE INDEX IF NOT EXISTS idx_sonar_alerts_analysis ON public.sonar_alerts(analysis_id);
CREATE INDEX IF NOT EXISTS idx_satellite_positions_satellite ON public.satellite_positions(satellite_id);