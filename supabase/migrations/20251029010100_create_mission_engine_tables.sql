-- PATCH 477: Mission Engine Tables
-- Stores executed missions and their steps

-- Executed Missions Table
CREATE TABLE IF NOT EXISTS public.executed_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_name TEXT NOT NULL,
  mission_type TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed', 'failed', 'aborted')) DEFAULT 'pending',
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  estimated_duration_minutes INTEGER,
  actual_duration_minutes INTEGER,
  result_summary TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Mission Steps Table
CREATE TABLE IF NOT EXISTS public.mission_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID NOT NULL REFERENCES public.executed_missions(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  step_name TEXT NOT NULL,
  step_description TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed', 'failed', 'skipped')) DEFAULT 'pending',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  result_data JSONB DEFAULT '{}',
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(mission_id, step_number)
);

-- Indexes for performance
CREATE INDEX idx_executed_missions_status ON public.executed_missions(status);
CREATE INDEX idx_executed_missions_vessel_id ON public.executed_missions(vessel_id);
CREATE INDEX idx_executed_missions_created_at ON public.executed_missions(created_at DESC);
CREATE INDEX idx_mission_steps_mission_id ON public.mission_steps(mission_id);
CREATE INDEX idx_mission_steps_status ON public.mission_steps(status);

-- Enable RLS
ALTER TABLE public.executed_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_steps ENABLE ROW LEVEL SECURITY;

-- RLS Policies for executed_missions
CREATE POLICY "Users can view executed missions"
  ON public.executed_missions FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert executed missions"
  ON public.executed_missions FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update executed missions"
  ON public.executed_missions FOR UPDATE
  USING (auth.role() = 'authenticated');

-- RLS Policies for mission_steps
CREATE POLICY "Users can view mission steps"
  ON public.mission_steps FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert mission steps"
  ON public.mission_steps FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update mission steps"
  ON public.mission_steps FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.executed_missions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.mission_steps TO authenticated;

-- Comments
COMMENT ON TABLE public.executed_missions IS 'PATCH 477: Stores executed mission records with status and progress tracking';
COMMENT ON TABLE public.mission_steps IS 'PATCH 477: Stores individual steps of executed missions with timestamps and results';
