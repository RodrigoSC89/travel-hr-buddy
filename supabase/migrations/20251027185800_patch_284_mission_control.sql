-- PATCH 284: Mission Control - Tactical Mission Planning
-- Comprehensive mission planning, resource allocation, and timeline management

-- ============================================
-- Missions Table
-- ============================================
CREATE TABLE IF NOT EXISTS missions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_code text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  mission_type text NOT NULL CHECK (mission_type IN ('transport', 'rescue', 'patrol', 'maintenance', 'survey', 'training', 'other')),
  priority text DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'critical')),
  status text DEFAULT 'planning' CHECK (status IN ('planning', 'ready', 'active', 'paused', 'completed', 'cancelled', 'failed')),
  commander_id uuid REFERENCES auth.users(id),
  vessel_id uuid REFERENCES vessels(id) ON DELETE SET NULL,
  origin text,
  destination text,
  waypoints jsonb DEFAULT '[]'::jsonb,
  estimated_start timestamptz,
  actual_start timestamptz,
  estimated_end timestamptz,
  actual_end timestamptz,
  estimated_duration_hours numeric,
  actual_duration_hours numeric,
  progress_percentage numeric DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  objectives jsonb DEFAULT '[]'::jsonb, -- Array of mission objectives
  success_criteria jsonb DEFAULT '[]'::jsonb,
  risk_assessment jsonb DEFAULT '{}'::jsonb,
  contingency_plans jsonb DEFAULT '[]'::jsonb,
  budget_allocated numeric DEFAULT 0,
  budget_used numeric DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_missions_status ON missions(status);
CREATE INDEX IF NOT EXISTS idx_missions_type ON missions(mission_type);
CREATE INDEX IF NOT EXISTS idx_missions_priority ON missions(priority);
CREATE INDEX IF NOT EXISTS idx_missions_commander ON missions(commander_id);
CREATE INDEX IF NOT EXISTS idx_missions_vessel ON missions(vessel_id);
CREATE INDEX IF NOT EXISTS idx_missions_start ON missions(estimated_start);
CREATE INDEX IF NOT EXISTS idx_missions_progress ON missions(progress_percentage);

-- ============================================
-- Mission Resources Table
-- ============================================
CREATE TABLE IF NOT EXISTS mission_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id uuid NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  resource_type text NOT NULL CHECK (resource_type IN ('personnel', 'vehicle', 'equipment', 'fuel', 'supplies', 'other')),
  resource_id uuid, -- Reference to specific resource (vessel, equipment, etc.)
  resource_name text NOT NULL,
  quantity numeric DEFAULT 1,
  unit text,
  allocated boolean DEFAULT false,
  allocation_date timestamptz,
  return_date timestamptz,
  status text DEFAULT 'requested' CHECK (status IN ('requested', 'allocated', 'in_use', 'returned', 'unavailable')),
  cost numeric DEFAULT 0,
  notes text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mission_resources_mission ON mission_resources(mission_id);
CREATE INDEX IF NOT EXISTS idx_mission_resources_type ON mission_resources(resource_type);
CREATE INDEX IF NOT EXISTS idx_mission_resources_status ON mission_resources(status);
CREATE INDEX IF NOT EXISTS idx_mission_resources_allocated ON mission_resources(allocated);

-- ============================================
-- Mission Timeline Table
-- ============================================
CREATE TABLE IF NOT EXISTS mission_timeline (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id uuid NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  milestone_name text NOT NULL,
  milestone_type text CHECK (milestone_type IN ('checkpoint', 'objective', 'phase', 'event')),
  description text,
  sequence_order integer NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped', 'failed')),
  estimated_datetime timestamptz,
  actual_datetime timestamptz,
  duration_minutes integer,
  dependencies jsonb DEFAULT '[]'::jsonb, -- Array of milestone IDs that must complete first
  responsible_user_id uuid REFERENCES auth.users(id),
  completion_notes text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mission_timeline_mission ON mission_timeline(mission_id);
CREATE INDEX IF NOT EXISTS idx_mission_timeline_status ON mission_timeline(status);
CREATE INDEX IF NOT EXISTS idx_mission_timeline_order ON mission_timeline(sequence_order);
CREATE INDEX IF NOT EXISTS idx_mission_timeline_datetime ON mission_timeline(estimated_datetime);

-- ============================================
-- Mission Logs Table
-- ============================================
CREATE TABLE IF NOT EXISTS mission_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id uuid NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  log_type text NOT NULL CHECK (log_type IN ('info', 'warning', 'error', 'critical', 'update', 'milestone', 'communication')),
  severity text DEFAULT 'info' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title text NOT NULL,
  message text NOT NULL,
  logged_by uuid REFERENCES auth.users(id),
  related_milestone_id uuid REFERENCES mission_timeline(id) ON DELETE SET NULL,
  attachments jsonb DEFAULT '[]'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mission_logs_mission ON mission_logs(mission_id);
CREATE INDEX IF NOT EXISTS idx_mission_logs_type ON mission_logs(log_type);
CREATE INDEX IF NOT EXISTS idx_mission_logs_severity ON mission_logs(severity);
CREATE INDEX IF NOT EXISTS idx_mission_logs_date ON mission_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mission_logs_milestone ON mission_logs(related_milestone_id);

-- ============================================
-- Mission Notifications Table
-- ============================================
CREATE TABLE IF NOT EXISTS mission_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id uuid NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  notification_type text NOT NULL CHECK (notification_type IN ('status_change', 'milestone_completed', 'resource_allocated', 'alert', 'reminder', 'update')),
  priority text DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  title text NOT NULL,
  message text NOT NULL,
  recipient_id uuid REFERENCES auth.users(id),
  read boolean DEFAULT false,
  read_at timestamptz,
  action_required boolean DEFAULT false,
  action_url text,
  expires_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mission_notifications_mission ON mission_notifications(mission_id);
CREATE INDEX IF NOT EXISTS idx_mission_notifications_recipient ON mission_notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_mission_notifications_type ON mission_notifications(notification_type);
CREATE INDEX IF NOT EXISTS idx_mission_notifications_unread ON mission_notifications(read) WHERE read = false;
CREATE INDEX IF NOT EXISTS idx_mission_notifications_priority ON mission_notifications(priority);

-- ============================================
-- Function: Activate Mission
-- ============================================
CREATE OR REPLACE FUNCTION activate_mission(p_mission_id uuid)
RETURNS jsonb AS $$
DECLARE
  v_mission_name text;
  v_commander_id uuid;
  v_first_milestone_id uuid;
BEGIN
  -- Get mission details
  SELECT name, commander_id INTO v_mission_name, v_commander_id
  FROM missions
  WHERE id = p_mission_id;

  IF v_mission_name IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Mission not found');
  END IF;

  -- Update mission status
  UPDATE missions
  SET 
    status = 'active',
    actual_start = now(),
    updated_at = now()
  WHERE id = p_mission_id;

  -- Create activation log
  INSERT INTO mission_logs (mission_id, log_type, severity, title, message)
  VALUES (
    p_mission_id,
    'milestone',
    'high',
    'Mission Activated',
    format('Mission "%s" has been activated and is now in progress.', v_mission_name)
  );

  -- Send notification to commander
  IF v_commander_id IS NOT NULL THEN
    INSERT INTO mission_notifications (
      mission_id,
      notification_type,
      priority,
      title,
      message,
      recipient_id,
      action_required
    ) VALUES (
      p_mission_id,
      'status_change',
      'high',
      'Mission Activated',
      format('Mission "%s" is now active. Please monitor progress and coordinate resources.', v_mission_name),
      v_commander_id,
      true
    );
  END IF;

  -- Activate first milestone in timeline
  SELECT id INTO v_first_milestone_id
  FROM mission_timeline
  WHERE mission_id = p_mission_id
  AND status = 'pending'
  ORDER BY sequence_order
  LIMIT 1;

  IF v_first_milestone_id IS NOT NULL THEN
    UPDATE mission_timeline
    SET status = 'in_progress', updated_at = now()
    WHERE id = v_first_milestone_id;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'mission_id', p_mission_id,
    'mission_name', v_mission_name,
    'activated_at', now(),
    'first_milestone_id', v_first_milestone_id
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Function: Update Mission Progress
-- ============================================
CREATE OR REPLACE FUNCTION update_mission_progress()
RETURNS TRIGGER AS $$
DECLARE
  v_total_milestones integer;
  v_completed_milestones integer;
  v_progress_percentage numeric;
BEGIN
  -- Calculate progress based on completed milestones
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'completed')
  INTO v_total_milestones, v_completed_milestones
  FROM mission_timeline
  WHERE mission_id = NEW.mission_id;

  IF v_total_milestones > 0 THEN
    v_progress_percentage := (v_completed_milestones::numeric / v_total_milestones::numeric * 100);
    
    UPDATE missions
    SET 
      progress_percentage = v_progress_percentage,
      updated_at = now()
    WHERE id = NEW.mission_id;

    -- Check if mission is complete
    IF v_progress_percentage = 100 THEN
      UPDATE missions
      SET 
        status = 'completed',
        actual_end = now()
      WHERE id = NEW.mission_id
      AND status = 'active';

      -- Log completion
      INSERT INTO mission_logs (mission_id, log_type, severity, title, message)
      VALUES (
        NEW.mission_id,
        'milestone',
        'high',
        'Mission Completed',
        'All milestones have been completed. Mission marked as complete.'
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_mission_progress
  AFTER UPDATE OF status ON mission_timeline
  FOR EACH ROW
  WHEN (NEW.status = 'completed' AND OLD.status <> 'completed')
  EXECUTE FUNCTION update_mission_progress();

-- ============================================
-- RLS Policies
-- ============================================
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mission_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE mission_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE mission_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE mission_notifications ENABLE ROW LEVEL SECURITY;

-- Missions policies
CREATE POLICY "Users can view all missions"
  ON missions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage their missions"
  ON missions FOR ALL
  TO authenticated
  USING (commander_id = auth.uid() OR created_by = auth.uid())
  WITH CHECK (commander_id = auth.uid() OR created_by = auth.uid());

-- Mission resources policies
CREATE POLICY "Users can view mission resources"
  ON mission_resources FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage resources for their missions"
  ON mission_resources FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM missions
      WHERE id = mission_resources.mission_id
      AND (commander_id = auth.uid() OR created_by = auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM missions
      WHERE id = mission_resources.mission_id
      AND (commander_id = auth.uid() OR created_by = auth.uid())
    )
  );

-- Mission timeline policies
CREATE POLICY "Users can view mission timeline"
  ON mission_timeline FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage timeline for their missions"
  ON mission_timeline FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM missions
      WHERE id = mission_timeline.mission_id
      AND (commander_id = auth.uid() OR created_by = auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM missions
      WHERE id = mission_timeline.mission_id
      AND (commander_id = auth.uid() OR created_by = auth.uid())
    )
  );

-- Mission logs policies
CREATE POLICY "Users can view mission logs"
  ON mission_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create logs for any mission"
  ON mission_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Mission notifications policies
CREATE POLICY "Users can view their notifications"
  ON mission_notifications FOR SELECT
  TO authenticated
  USING (recipient_id = auth.uid() OR recipient_id IS NULL);

CREATE POLICY "Users can update their notifications"
  ON mission_notifications FOR UPDATE
  TO authenticated
  USING (recipient_id = auth.uid())
  WITH CHECK (recipient_id = auth.uid());

-- Grant permissions
GRANT ALL ON missions TO authenticated;
GRANT ALL ON mission_resources TO authenticated;
GRANT ALL ON mission_timeline TO authenticated;
GRANT ALL ON mission_logs TO authenticated;
GRANT ALL ON mission_notifications TO authenticated;
GRANT EXECUTE ON FUNCTION activate_mission TO authenticated;

COMMENT ON TABLE missions IS 'PATCH 284: Tactical mission planning and management';
COMMENT ON TABLE mission_resources IS 'PATCH 284: Resource allocation for missions';
COMMENT ON TABLE mission_timeline IS 'PATCH 284: Mission milestones and timeline';
COMMENT ON TABLE mission_logs IS 'PATCH 284: Mission activity logs';
COMMENT ON TABLE mission_notifications IS 'PATCH 284: Mission-related notifications';
COMMENT ON FUNCTION activate_mission IS 'PATCH 284: Activate a mission, update status, create logs, send notifications, and advance first milestone';
