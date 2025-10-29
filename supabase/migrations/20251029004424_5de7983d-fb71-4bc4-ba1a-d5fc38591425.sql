-- ============================================
-- PATCH 456 - Missing Tables Creation
-- Creates mission_tasks, drone_missions, and drone_telemetry tables
-- ============================================

-- ==================== Mission Tasks Table ====================
CREATE TABLE IF NOT EXISTS public.mission_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed', 'failed')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  assigned_to UUID REFERENCES auth.users(id),
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.mission_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for mission_tasks
CREATE POLICY "Users can view mission tasks in their organization"
  ON public.mission_tasks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_users
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can create mission tasks"
  ON public.mission_tasks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.organization_users
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can update mission tasks"
  ON public.mission_tasks FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_users
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Indexes for mission_tasks
CREATE INDEX idx_mission_tasks_mission_id ON public.mission_tasks(mission_id);
CREATE INDEX idx_mission_tasks_status ON public.mission_tasks(status);
CREATE INDEX idx_mission_tasks_assigned_to ON public.mission_tasks(assigned_to);

-- ==================== Drone Missions Table ====================
CREATE TABLE IF NOT EXISTS public.drone_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_name TEXT NOT NULL,
  drone_id TEXT NOT NULL,
  mission_type TEXT NOT NULL CHECK (mission_type IN ('inspection', 'surveillance', 'mapping', 'search', 'maintenance')),
  planned_waypoints JSONB DEFAULT '[]'::jsonb,
  actual_trajectory JSONB DEFAULT '[]'::jsonb,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  max_depth_meters NUMERIC(10,2),
  mission_objectives JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'in-progress', 'completed', 'cancelled', 'failed')),
  completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  user_id UUID REFERENCES auth.users(id),
  organization_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.drone_missions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for drone_missions
CREATE POLICY "Users can view drone missions in their organization"
  ON public.drone_missions FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.organization_users
      WHERE user_id = auth.uid() AND organization_id = drone_missions.organization_id AND status = 'active'
    )
  );

CREATE POLICY "Users can create drone missions"
  ON public.drone_missions FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their drone missions"
  ON public.drone_missions FOR UPDATE
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.organization_users
      WHERE user_id = auth.uid() AND organization_id = drone_missions.organization_id AND status = 'active'
    )
  );

-- Indexes for drone_missions
CREATE INDEX idx_drone_missions_drone_id ON public.drone_missions(drone_id);
CREATE INDEX idx_drone_missions_status ON public.drone_missions(status);
CREATE INDEX idx_drone_missions_user_id ON public.drone_missions(user_id);
CREATE INDEX idx_drone_missions_organization_id ON public.drone_missions(organization_id);

-- ==================== Drone Telemetry Table ====================
CREATE TABLE IF NOT EXISTS public.drone_telemetry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID REFERENCES public.drone_missions(id) ON DELETE CASCADE,
  drone_id TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  position_x NUMERIC(12,6),
  position_y NUMERIC(12,6),
  position_z NUMERIC(12,6),
  depth_meters NUMERIC(10,2),
  heading_degrees NUMERIC(5,2),
  pitch_degrees NUMERIC(5,2),
  roll_degrees NUMERIC(5,2),
  battery_percentage INTEGER CHECK (battery_percentage >= 0 AND battery_percentage <= 100),
  water_temperature_celsius NUMERIC(5,2),
  pressure_bar NUMERIC(10,2),
  velocity_ms NUMERIC(8,2),
  signal_strength_dbm INTEGER,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.drone_telemetry ENABLE ROW LEVEL SECURITY;

-- RLS Policies for drone_telemetry
CREATE POLICY "Users can view telemetry for their missions"
  ON public.drone_telemetry FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.drone_missions
      WHERE id = drone_telemetry.mission_id 
      AND (
        user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.organization_users
          WHERE user_id = auth.uid() AND organization_id = drone_missions.organization_id AND status = 'active'
        )
      )
    )
  );

CREATE POLICY "Users can insert telemetry for their missions"
  ON public.drone_telemetry FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.drone_missions
      WHERE id = drone_telemetry.mission_id 
      AND (
        user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.organization_users
          WHERE user_id = auth.uid() AND organization_id = drone_missions.organization_id AND status = 'active'
        )
      )
    )
  );

-- Indexes for drone_telemetry
CREATE INDEX idx_drone_telemetry_mission_id ON public.drone_telemetry(mission_id);
CREATE INDEX idx_drone_telemetry_drone_id ON public.drone_telemetry(drone_id);
CREATE INDEX idx_drone_telemetry_timestamp ON public.drone_telemetry(timestamp DESC);

-- ==================== Triggers for updated_at ====================
CREATE TRIGGER update_mission_tasks_updated_at
  BEFORE UPDATE ON public.mission_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER update_drone_missions_updated_at
  BEFORE UPDATE ON public.drone_missions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();