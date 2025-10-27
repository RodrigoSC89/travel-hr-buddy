-- PATCH 243: Mission Control Database Tables
-- Create tables for mission planning, resource allocation, and tactical monitoring

-- missions: Store mission information
CREATE TABLE IF NOT EXISTS public.missions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_name text NOT NULL,
  mission_type text NOT NULL CHECK (mission_type IN ('emergency', 'patrol', 'maintenance', 'survey', 'training', 'logistics', 'search_rescue', 'other')),
  description text,
  objective text,
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status text DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'completed', 'cancelled', 'on_hold')),
  start_date timestamptz,
  end_date timestamptz,
  estimated_duration_hours integer,
  actual_duration_hours integer,
  commander_id uuid REFERENCES auth.users(id),
  organization_id uuid,
  location_coordinates jsonb,
  location_name text,
  success_criteria jsonb,
  risks jsonb,
  notes text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- mission_resources: Track resources allocated to missions
CREATE TABLE IF NOT EXISTS public.mission_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id uuid REFERENCES public.missions(id) ON DELETE CASCADE,
  resource_type text NOT NULL CHECK (resource_type IN ('crew', 'vessel', 'equipment', 'vehicle', 'sensor', 'other')),
  resource_id uuid,
  resource_name text NOT NULL,
  quantity integer DEFAULT 1,
  allocation_status text DEFAULT 'assigned' CHECK (allocation_status IN ('assigned', 'deployed', 'returned', 'unavailable')),
  allocated_at timestamptz DEFAULT now(),
  deployed_at timestamptz,
  returned_at timestamptz,
  notes text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- mission_status_updates: Track real-time status updates
CREATE TABLE IF NOT EXISTS public.mission_status_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id uuid REFERENCES public.missions(id) ON DELETE CASCADE,
  update_type text NOT NULL CHECK (update_type IN ('status_change', 'progress', 'alert', 'incident', 'completion', 'note')),
  title text NOT NULL,
  description text,
  severity text CHECK (severity IN ('info', 'warning', 'error', 'critical')),
  previous_status text,
  new_status text,
  progress_percentage integer CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  location_coordinates jsonb,
  reported_by uuid REFERENCES auth.users(id),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_missions_status ON public.missions(status);
CREATE INDEX IF NOT EXISTS idx_missions_type ON public.missions(mission_type);
CREATE INDEX IF NOT EXISTS idx_missions_priority ON public.missions(priority);
CREATE INDEX IF NOT EXISTS idx_missions_commander ON public.missions(commander_id);
CREATE INDEX IF NOT EXISTS idx_missions_dates ON public.missions(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_missions_org ON public.missions(organization_id);

CREATE INDEX IF NOT EXISTS idx_mission_resources_mission ON public.mission_resources(mission_id);
CREATE INDEX IF NOT EXISTS idx_mission_resources_type ON public.mission_resources(resource_type);
CREATE INDEX IF NOT EXISTS idx_mission_resources_status ON public.mission_resources(allocation_status);

CREATE INDEX IF NOT EXISTS idx_mission_status_updates_mission ON public.mission_status_updates(mission_id);
CREATE INDEX IF NOT EXISTS idx_mission_status_updates_type ON public.mission_status_updates(update_type);
CREATE INDEX IF NOT EXISTS idx_mission_status_updates_created ON public.mission_status_updates(created_at DESC);

-- Enable RLS
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_status_updates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for missions
CREATE POLICY "Users can view missions in their organization"
  ON public.missions FOR SELECT
  USING (
    auth.uid() = commander_id OR
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Authorized users can create missions"
  ON public.missions FOR INSERT
  WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'manager', 'operator')
    )
  );

CREATE POLICY "Mission commanders and admins can update missions"
  ON public.missions FOR UPDATE
  USING (
    auth.uid() = commander_id OR
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'manager')
    )
  );

-- RLS Policies for mission_resources
CREATE POLICY "Users can view mission resources"
  ON public.mission_resources FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.missions
      WHERE missions.id = mission_resources.mission_id
      AND (missions.commander_id = auth.uid() OR missions.created_by = auth.uid())
    )
  );

CREATE POLICY "Authorized users can manage mission resources"
  ON public.mission_resources FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.missions
      WHERE missions.id = mission_resources.mission_id
      AND (missions.commander_id = auth.uid() OR missions.created_by = auth.uid())
    )
  );

-- RLS Policies for mission_status_updates
CREATE POLICY "Users can view mission status updates"
  ON public.mission_status_updates FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.missions
      WHERE missions.id = mission_status_updates.mission_id
      AND (missions.commander_id = auth.uid() OR missions.created_by = auth.uid())
    )
  );

CREATE POLICY "Authorized users can create status updates"
  ON public.mission_status_updates FOR INSERT
  WITH CHECK (
    auth.uid() = reported_by AND
    EXISTS (
      SELECT 1 FROM public.missions
      WHERE missions.id = mission_status_updates.mission_id
      AND (missions.commander_id = auth.uid() OR missions.created_by = auth.uid())
    )
  );

-- Triggers
CREATE OR REPLACE FUNCTION update_missions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_missions_updated_at_trigger
  BEFORE UPDATE ON public.missions
  FOR EACH ROW
  EXECUTE FUNCTION update_missions_updated_at();

CREATE TRIGGER update_mission_resources_updated_at_trigger
  BEFORE UPDATE ON public.mission_resources
  FOR EACH ROW
  EXECUTE FUNCTION update_missions_updated_at();
