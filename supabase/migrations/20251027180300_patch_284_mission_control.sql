-- PATCH 284: Mission Control - Tactical Planning
-- Tables: missions, mission_resources, mission_timeline

-- Create missions table
CREATE TABLE IF NOT EXISTS public.missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_code TEXT UNIQUE NOT NULL,
  mission_name TEXT NOT NULL,
  mission_type TEXT CHECK (mission_type IN ('emergency', 'rescue', 'maintenance', 'training', 'inspection', 'transport', 'other')),
  description TEXT,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  status TEXT CHECK (status IN ('planning', 'ready', 'active', 'on_hold', 'completed', 'cancelled', 'failed')) DEFAULT 'planning',
  activation_time TIMESTAMPTZ,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  estimated_duration_hours NUMERIC,
  actual_duration_hours NUMERIC,
  location_lat NUMERIC,
  location_lng NUMERIC,
  location_name TEXT,
  area_radius_km NUMERIC,
  objectives TEXT[],
  success_criteria TEXT[],
  risk_assessment TEXT,
  contingency_plan TEXT,
  command_center TEXT,
  commander_id UUID,
  team_size INTEGER DEFAULT 0,
  budget_allocated NUMERIC,
  budget_used NUMERIC,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create mission_resources table
CREATE TABLE IF NOT EXISTS public.mission_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID REFERENCES public.missions(id) ON DELETE CASCADE,
  resource_type TEXT CHECK (resource_type IN ('personnel', 'vehicle', 'vessel', 'aircraft', 'equipment', 'supply', 'facility', 'other')) NOT NULL,
  resource_name TEXT NOT NULL,
  resource_id UUID, -- Reference to actual resource (vessel, person, etc.)
  quantity INTEGER DEFAULT 1,
  unit TEXT,
  allocation_status TEXT CHECK (allocation_status IN ('requested', 'allocated', 'deployed', 'returned', 'unavailable')) DEFAULT 'requested',
  allocated_at TIMESTAMPTZ,
  deployed_at TIMESTAMPTZ,
  returned_at TIMESTAMPTZ,
  location TEXT,
  condition_status TEXT CHECK (condition_status IN ('excellent', 'good', 'fair', 'poor', 'damaged')) DEFAULT 'good',
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create mission_timeline table
CREATE TABLE IF NOT EXISTS public.mission_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID REFERENCES public.missions(id) ON DELETE CASCADE,
  milestone_name TEXT NOT NULL,
  milestone_type TEXT CHECK (milestone_type IN ('checkpoint', 'objective', 'deadline', 'alert', 'decision_point', 'phase_complete', 'other')),
  scheduled_time TIMESTAMPTZ NOT NULL,
  actual_time TIMESTAMPTZ,
  status TEXT CHECK (status IN ('pending', 'in_progress', 'completed', 'delayed', 'cancelled', 'failed')) DEFAULT 'pending',
  description TEXT,
  responsible_person_id UUID,
  dependencies UUID[], -- Array of milestone IDs
  is_critical BOOLEAN DEFAULT false,
  auto_notify BOOLEAN DEFAULT true,
  notification_sent BOOLEAN DEFAULT false,
  completion_notes TEXT,
  sequence_order INTEGER,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create mission_logs table
CREATE TABLE IF NOT EXISTS public.mission_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID REFERENCES public.missions(id) ON DELETE CASCADE,
  log_type TEXT CHECK (log_type IN ('info', 'warning', 'critical', 'success', 'event', 'decision', 'communication', 'other')) DEFAULT 'info',
  log_message TEXT NOT NULL,
  logged_by UUID,
  related_resource_id UUID REFERENCES public.mission_resources(id) ON DELETE SET NULL,
  related_milestone_id UUID REFERENCES public.mission_timeline(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create mission_notifications table
CREATE TABLE IF NOT EXISTS public.mission_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID REFERENCES public.missions(id) ON DELETE CASCADE,
  notification_type TEXT CHECK (notification_type IN ('milestone', 'status_change', 'alert', 'resource_update', 'deadline', 'completion', 'other')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  recipient_ids UUID[],
  sent_at TIMESTAMPTZ DEFAULT now(),
  read_by UUID[],
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_missions_status ON public.missions(status);
CREATE INDEX IF NOT EXISTS idx_missions_priority ON public.missions(priority);
CREATE INDEX IF NOT EXISTS idx_missions_type ON public.missions(mission_type);
CREATE INDEX IF NOT EXISTS idx_missions_commander ON public.missions(commander_id);
CREATE INDEX IF NOT EXISTS idx_missions_activation ON public.missions(activation_time);
CREATE INDEX IF NOT EXISTS idx_mission_resources_mission ON public.mission_resources(mission_id);
CREATE INDEX IF NOT EXISTS idx_mission_resources_type ON public.mission_resources(resource_type);
CREATE INDEX IF NOT EXISTS idx_mission_resources_status ON public.mission_resources(allocation_status);
CREATE INDEX IF NOT EXISTS idx_mission_timeline_mission ON public.mission_timeline(mission_id);
CREATE INDEX IF NOT EXISTS idx_mission_timeline_scheduled ON public.mission_timeline(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_mission_timeline_status ON public.mission_timeline(status);
CREATE INDEX IF NOT EXISTS idx_mission_logs_mission ON public.mission_logs(mission_id);
CREATE INDEX IF NOT EXISTS idx_mission_notifications_mission ON public.mission_notifications(mission_id);

-- Enable Row Level Security
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view missions"
  ON public.missions FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create missions"
  ON public.missions FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update missions"
  ON public.missions FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view mission resources"
  ON public.mission_resources FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can manage mission resources"
  ON public.mission_resources FOR ALL
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view mission timeline"
  ON public.mission_timeline FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can manage mission timeline"
  ON public.mission_timeline FOR ALL
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view mission logs"
  ON public.mission_logs FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create mission logs"
  ON public.mission_logs FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view mission notifications"
  ON public.mission_notifications FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Function to activate mission
CREATE OR REPLACE FUNCTION activate_mission(p_mission_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_mission RECORD;
  v_activation_time TIMESTAMPTZ;
BEGIN
  SELECT * INTO v_mission FROM public.missions WHERE id = p_mission_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Mission not found');
  END IF;
  
  IF v_mission.status NOT IN ('planning', 'ready') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Mission cannot be activated from current status');
  END IF;
  
  v_activation_time := now();
  
  -- Update mission status
  UPDATE public.missions
  SET 
    status = 'active',
    activation_time = v_activation_time,
    start_time = v_activation_time,
    updated_at = now()
  WHERE id = p_mission_id;
  
  -- Create activation log
  INSERT INTO public.mission_logs (
    mission_id,
    log_type,
    log_message,
    logged_by
  ) VALUES (
    p_mission_id,
    'event',
    'Mission activated and countdown started',
    auth.uid()
  );
  
  -- Create activation notification
  INSERT INTO public.mission_notifications (
    mission_id,
    notification_type,
    title,
    message,
    priority
  ) VALUES (
    p_mission_id,
    'status_change',
    'Mission Activated',
    'Mission "' || v_mission.mission_name || '" has been activated and is now in progress.',
    'high'
  );
  
  -- Set first pending milestone to in_progress
  UPDATE public.mission_timeline
  SET status = 'in_progress', updated_at = now()
  WHERE mission_id = p_mission_id
    AND status = 'pending'
    AND sequence_order = (
      SELECT MIN(sequence_order)
      FROM public.mission_timeline
      WHERE mission_id = p_mission_id AND status = 'pending'
    );
  
  RETURN jsonb_build_object(
    'success', true,
    'mission_id', p_mission_id,
    'activation_time', v_activation_time,
    'message', 'Mission activated successfully'
  );
END;
$$ LANGUAGE plpgsql;

-- Function to update mission progress
CREATE OR REPLACE FUNCTION update_mission_progress()
RETURNS TRIGGER AS $$
DECLARE
  v_total_milestones INTEGER;
  v_completed_milestones INTEGER;
  v_progress_percentage INTEGER;
BEGIN
  -- Calculate progress based on completed milestones
  SELECT COUNT(*) INTO v_total_milestones
  FROM public.mission_timeline
  WHERE mission_id = NEW.mission_id;
  
  SELECT COUNT(*) INTO v_completed_milestones
  FROM public.mission_timeline
  WHERE mission_id = NEW.mission_id AND status = 'completed';
  
  IF v_total_milestones > 0 THEN
    v_progress_percentage := (v_completed_milestones * 100) / v_total_milestones;
    
    UPDATE public.missions
    SET 
      progress_percentage = v_progress_percentage,
      updated_at = now()
    WHERE id = NEW.mission_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update mission progress
DROP TRIGGER IF EXISTS trigger_update_mission_progress ON public.mission_timeline;
CREATE TRIGGER trigger_update_mission_progress
  AFTER UPDATE OF status
  ON public.mission_timeline
  FOR EACH ROW
  WHEN (NEW.status = 'completed')
  EXECUTE FUNCTION update_mission_progress();

-- Function to check milestone notifications
CREATE OR REPLACE FUNCTION check_milestone_notifications()
RETURNS void AS $$
DECLARE
  v_milestone RECORD;
BEGIN
  FOR v_milestone IN
    SELECT * FROM public.mission_timeline
    WHERE status = 'pending'
      AND auto_notify = true
      AND notification_sent = false
      AND scheduled_time <= now() + INTERVAL '1 hour'
      AND scheduled_time >= now()
  LOOP
    -- Create notification
    INSERT INTO public.mission_notifications (
      mission_id,
      notification_type,
      title,
      message,
      priority
    ) VALUES (
      v_milestone.mission_id,
      'milestone',
      'Upcoming Milestone: ' || v_milestone.milestone_name,
      'Milestone "' || v_milestone.milestone_name || '" is scheduled in less than 1 hour.',
      CASE WHEN v_milestone.is_critical THEN 'urgent' ELSE 'medium' END
    );
    
    -- Mark notification as sent
    UPDATE public.mission_timeline
    SET notification_sent = true
    WHERE id = v_milestone.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to update resource count
CREATE OR REPLACE FUNCTION update_mission_team_size()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.missions
  SET team_size = (
    SELECT COALESCE(SUM(quantity), 0)
    FROM public.mission_resources
    WHERE mission_id = COALESCE(NEW.mission_id, OLD.mission_id)
      AND resource_type = 'personnel'
      AND allocation_status IN ('allocated', 'deployed')
  )
  WHERE id = COALESCE(NEW.mission_id, OLD.mission_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update team size
DROP TRIGGER IF EXISTS trigger_update_mission_team_size ON public.mission_resources;
CREATE TRIGGER trigger_update_mission_team_size
  AFTER INSERT OR UPDATE OR DELETE
  ON public.mission_resources
  FOR EACH ROW
  EXECUTE FUNCTION update_mission_team_size();

-- Update timestamps triggers
DROP TRIGGER IF EXISTS set_missions_updated_at ON public.missions;
CREATE TRIGGER set_missions_updated_at
  BEFORE UPDATE ON public.missions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_mission_resources_updated_at ON public.mission_resources;
CREATE TRIGGER set_mission_resources_updated_at
  BEFORE UPDATE ON public.mission_resources
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_mission_timeline_updated_at ON public.mission_timeline;
CREATE TRIGGER set_mission_timeline_updated_at
  BEFORE UPDATE ON public.mission_timeline
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
