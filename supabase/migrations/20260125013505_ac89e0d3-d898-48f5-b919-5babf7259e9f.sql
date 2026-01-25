-- Create crew_wellbeing_logs table for mood tracking
CREATE TABLE IF NOT EXISTS public.crew_wellbeing_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  crew_member_id UUID REFERENCES public.crew_members(id) ON DELETE CASCADE,
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE SET NULL,
  mood_score INTEGER CHECK (mood_score >= 1 AND mood_score <= 5),
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 5),
  stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 5),
  notes TEXT,
  factors TEXT[],
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create weather_alerts table
CREATE TABLE IF NOT EXISTS public.weather_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('storm', 'wind', 'wave', 'visibility', 'temperature', 'general')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  description TEXT,
  location JSONB,
  affected_vessels TEXT[],
  valid_from TIMESTAMPTZ NOT NULL,
  valid_until TIMESTAMPTZ NOT NULL,
  source TEXT,
  raw_data JSONB,
  acknowledged BOOLEAN DEFAULT false,
  acknowledged_by UUID,
  acknowledged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.crew_wellbeing_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weather_alerts ENABLE ROW LEVEL SECURITY;

-- RLS policies for crew_wellbeing_logs
CREATE POLICY "Users can view wellbeing logs" ON public.crew_wellbeing_logs
  FOR SELECT USING (true);

CREATE POLICY "Users can insert wellbeing logs" ON public.crew_wellbeing_logs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update wellbeing logs" ON public.crew_wellbeing_logs
  FOR UPDATE USING (true);

-- RLS policies for weather_alerts
CREATE POLICY "Users can view weather alerts" ON public.weather_alerts
  FOR SELECT USING (true);

CREATE POLICY "Users can insert weather alerts" ON public.weather_alerts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update weather alerts" ON public.weather_alerts
  FOR UPDATE USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_crew_wellbeing_logs_crew_member ON public.crew_wellbeing_logs(crew_member_id);
CREATE INDEX IF NOT EXISTS idx_crew_wellbeing_logs_vessel ON public.crew_wellbeing_logs(vessel_id);
CREATE INDEX IF NOT EXISTS idx_crew_wellbeing_logs_recorded_at ON public.crew_wellbeing_logs(recorded_at);
CREATE INDEX IF NOT EXISTS idx_weather_alerts_severity ON public.weather_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_weather_alerts_valid_dates ON public.weather_alerts(valid_from, valid_until);