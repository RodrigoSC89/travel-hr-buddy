-- Create crew_status table for crew member metadata
CREATE TABLE IF NOT EXISTS public.crew_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_member_id UUID NOT NULL,
  full_name TEXT,
  position TEXT,
  department TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create crew_health_logs table for wellbeing check-ins
CREATE TABLE IF NOT EXISTS public.crew_health_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_member_id UUID NOT NULL,
  stress_level INTEGER CHECK (stress_level >= 0 AND stress_level <= 100),
  energy_level INTEGER CHECK (energy_level >= 0 AND energy_level <= 100),
  sleep_quality INTEGER CHECK (sleep_quality >= 0 AND sleep_quality <= 100),
  mood INTEGER CHECK (mood >= 0 AND mood <= 100),
  notes TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.crew_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crew_health_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for crew_status
CREATE POLICY "Users can view their own status"
  ON public.crew_status
  FOR SELECT
  USING (auth.uid() = crew_member_id);

CREATE POLICY "Users can insert their own status"
  ON public.crew_status
  FOR INSERT
  WITH CHECK (auth.uid() = crew_member_id);

CREATE POLICY "Users can update their own status"
  ON public.crew_status
  FOR UPDATE
  USING (auth.uid() = crew_member_id);

-- RLS Policies for crew_health_logs (confidential data)
CREATE POLICY "Users can view their own health logs"
  ON public.crew_health_logs
  FOR SELECT
  USING (auth.uid() = crew_member_id);

CREATE POLICY "Users can insert their own health logs"
  ON public.crew_health_logs
  FOR INSERT
  WITH CHECK (auth.uid() = crew_member_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_crew_status_member ON public.crew_status(crew_member_id);
CREATE INDEX IF NOT EXISTS idx_crew_health_logs_member ON public.crew_health_logs(crew_member_id);
CREATE INDEX IF NOT EXISTS idx_crew_health_logs_timestamp ON public.crew_health_logs(timestamp DESC);