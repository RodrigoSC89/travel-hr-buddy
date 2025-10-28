-- PATCH 436: Underwater Drone Controller - underwater_missions table
-- Create table for storing underwater drone missions

CREATE TABLE IF NOT EXISTS public.underwater_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_name TEXT NOT NULL,
  description TEXT,
  mission_data JSONB NOT NULL, -- Stores the full mission configuration
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'paused', 'completed', 'aborted')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  
  -- Mission metadata
  waypoints_count INTEGER DEFAULT 0,
  current_waypoint INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- User tracking
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Operational data
  route_replay JSONB, -- Stores position history for replay
  sensor_logs JSONB, -- Stores sensor data from the mission
  events_log JSONB -- Stores mission events
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_underwater_missions_user_id ON public.underwater_missions(user_id);
CREATE INDEX IF NOT EXISTS idx_underwater_missions_status ON public.underwater_missions(status);
CREATE INDEX IF NOT EXISTS idx_underwater_missions_created_at ON public.underwater_missions(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.underwater_missions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own missions"
  ON public.underwater_missions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own missions"
  ON public.underwater_missions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own missions"
  ON public.underwater_missions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own missions"
  ON public.underwater_missions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_underwater_missions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-updating updated_at
CREATE TRIGGER update_underwater_missions_updated_at
  BEFORE UPDATE ON public.underwater_missions
  FOR EACH ROW
  EXECUTE FUNCTION update_underwater_missions_updated_at();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.underwater_missions TO authenticated;
GRANT USAGE ON SEQUENCE public.underwater_missions_id_seq TO authenticated;

-- Add comment
COMMENT ON TABLE public.underwater_missions IS 'PATCH 436: Stores underwater drone mission configurations, logs, and replay data';
