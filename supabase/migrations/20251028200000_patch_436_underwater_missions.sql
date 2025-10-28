-- PATCH 436: Underwater Missions Table
-- Mission configurations with JSONB mission data, route replay tracking, sensor logs and event streams

-- Create underwater_missions table
CREATE TABLE IF NOT EXISTS public.underwater_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  mission_name TEXT NOT NULL,
  mission_type TEXT CHECK (mission_type IN ('survey', 'inspection', 'research', 'training', 'rescue', 'other')),
  status TEXT CHECK (status IN ('pending', 'active', 'paused', 'completed', 'aborted', 'failed')) DEFAULT 'pending',
  
  -- Mission configuration (JSONB)
  mission_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Route replay tracking
  route_replay JSONB DEFAULT '{}'::jsonb,
  
  -- Sensor logs and telemetry
  sensor_logs JSONB DEFAULT '[]'::jsonb,
  
  -- Event stream for operational history
  event_stream JSONB DEFAULT '[]'::jsonb,
  
  -- Mission metadata
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  duration_minutes INTEGER,
  
  -- Position data
  start_position JSONB,
  end_position JSONB,
  max_depth NUMERIC(10,2),
  total_distance NUMERIC(10,2),
  
  -- Progress tracking
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  waypoints_completed INTEGER DEFAULT 0,
  waypoints_total INTEGER DEFAULT 0,
  
  -- Notes and description
  description TEXT,
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_underwater_missions_user_id ON public.underwater_missions(user_id);
CREATE INDEX IF NOT EXISTS idx_underwater_missions_status ON public.underwater_missions(status);
CREATE INDEX IF NOT EXISTS idx_underwater_missions_mission_type ON public.underwater_missions(mission_type);
CREATE INDEX IF NOT EXISTS idx_underwater_missions_created_at ON public.underwater_missions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_underwater_missions_start_time ON public.underwater_missions(start_time DESC);

-- GIN indexes for JSONB columns for efficient querying
CREATE INDEX IF NOT EXISTS idx_underwater_missions_mission_data ON public.underwater_missions USING GIN(mission_data);
CREATE INDEX IF NOT EXISTS idx_underwater_missions_sensor_logs ON public.underwater_missions USING GIN(sensor_logs);
CREATE INDEX IF NOT EXISTS idx_underwater_missions_event_stream ON public.underwater_missions USING GIN(event_stream);

-- Enable Row Level Security
ALTER TABLE public.underwater_missions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user isolation

-- Policy: Users can view their own missions
CREATE POLICY "Users can view own underwater missions"
  ON public.underwater_missions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own missions
CREATE POLICY "Users can insert own underwater missions"
  ON public.underwater_missions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own missions
CREATE POLICY "Users can update own underwater missions"
  ON public.underwater_missions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own missions
CREATE POLICY "Users can delete own underwater missions"
  ON public.underwater_missions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_underwater_missions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER trigger_update_underwater_missions_updated_at
  BEFORE UPDATE ON public.underwater_missions
  FOR EACH ROW
  EXECUTE FUNCTION update_underwater_missions_updated_at();

-- Function to calculate mission duration on completion
CREATE OR REPLACE FUNCTION calculate_underwater_mission_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IN ('completed', 'aborted', 'failed') AND NEW.start_time IS NOT NULL AND NEW.end_time IS NULL THEN
    NEW.end_time = NOW();
    NEW.duration_minutes = EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time)) / 60;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically calculate duration
CREATE TRIGGER trigger_calculate_underwater_mission_duration
  BEFORE UPDATE ON public.underwater_missions
  FOR EACH ROW
  EXECUTE FUNCTION calculate_underwater_mission_duration();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.underwater_missions TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE public.underwater_missions IS 'PATCH 436: Stores underwater drone mission configurations, telemetry, and operational history';
COMMENT ON COLUMN public.underwater_missions.mission_data IS 'Complete mission configuration including waypoints, parameters, and settings';
COMMENT ON COLUMN public.underwater_missions.route_replay IS 'Route replay data for mission visualization and analysis';
COMMENT ON COLUMN public.underwater_missions.sensor_logs IS 'Array of sensor readings collected during mission';
COMMENT ON COLUMN public.underwater_missions.event_stream IS 'Chronological log of mission events and status changes';
