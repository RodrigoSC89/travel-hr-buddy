-- PATCH 348: Mission Control v2 - Autonomy Layer
-- Objective: Implement autonomous task decision engine with safety controls

-- Autonomous Tasks Table
CREATE TABLE IF NOT EXISTS autonomous_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_type TEXT NOT NULL, -- 'maintenance', 'logistics', 'satellite', 'mission'
  task_name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'executing', 'completed', 'failed', 'cancelled'
  priority TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  autonomy_level INTEGER NOT NULL DEFAULT 1, -- 1-5, higher = more autonomous
  requires_approval BOOLEAN DEFAULT true,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  mission_id UUID,
  equipment_id UUID,
  satellite_id UUID,
  decision_logic JSONB NOT NULL, -- Rules/AI logic that triggered this task
  decision_confidence NUMERIC, -- 0-1 confidence score
  predicted_outcome JSONB,
  actual_outcome JSONB,
  execution_plan JSONB, -- Step-by-step execution plan
  execution_logs JSONB[], -- Array of log entries
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB
);

-- Autonomy Rules Table
CREATE TABLE IF NOT EXISTS autonomy_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  rule_type TEXT NOT NULL, -- 'threshold', 'pattern', 'prediction', 'schedule'
  task_type TEXT NOT NULL, -- What type of task this rule can create
  conditions JSONB NOT NULL, -- Conditions that trigger this rule
  actions JSONB NOT NULL, -- Actions to take when triggered
  autonomy_level INTEGER NOT NULL DEFAULT 1,
  is_enabled BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  requires_approval BOOLEAN DEFAULT true,
  success_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  last_triggered_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Autonomy Decision Logs Table
CREATE TABLE IF NOT EXISTS autonomy_decision_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES autonomous_tasks(id) ON DELETE CASCADE,
  rule_id UUID REFERENCES autonomy_rules(id) ON DELETE SET NULL,
  decision_type TEXT NOT NULL, -- 'create', 'approve', 'reject', 'execute', 'complete'
  decision_maker TEXT NOT NULL, -- 'system', 'user', 'ai'
  decision_data JSONB NOT NULL,
  reasoning TEXT,
  confidence_score NUMERIC,
  user_id UUID REFERENCES auth.users(id),
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Autonomy Configuration Table (per mission/equipment)
CREATE TABLE IF NOT EXISTS autonomy_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL, -- 'mission', 'equipment', 'satellite', 'global'
  entity_id UUID, -- NULL for global config
  is_enabled BOOLEAN DEFAULT false,
  autonomy_level INTEGER NOT NULL DEFAULT 1, -- Max autonomy level allowed
  allowed_task_types TEXT[], -- Array of allowed task types
  require_approval_threshold INTEGER DEFAULT 3, -- Tasks with level > this require approval
  auto_approve_low_risk BOOLEAN DEFAULT false,
  safety_constraints JSONB, -- Safety rules that must be satisfied
  notification_channels JSONB, -- Where to send notifications
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(entity_type, entity_id)
);

-- Autonomy Metrics Table
CREATE TABLE IF NOT EXISTS autonomy_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
  tasks_created INTEGER DEFAULT 0,
  tasks_completed INTEGER DEFAULT 0,
  tasks_failed INTEGER DEFAULT 0,
  tasks_requiring_approval INTEGER DEFAULT 0,
  tasks_auto_approved INTEGER DEFAULT 0,
  avg_completion_time_minutes NUMERIC,
  avg_confidence_score NUMERIC,
  success_rate NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(metric_date)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_autonomous_tasks_status ON autonomous_tasks(status);
CREATE INDEX IF NOT EXISTS idx_autonomous_tasks_task_type ON autonomous_tasks(task_type);
CREATE INDEX IF NOT EXISTS idx_autonomous_tasks_priority ON autonomous_tasks(priority);
CREATE INDEX IF NOT EXISTS idx_autonomous_tasks_mission_id ON autonomous_tasks(mission_id);
CREATE INDEX IF NOT EXISTS idx_autonomous_tasks_equipment_id ON autonomous_tasks(equipment_id);
CREATE INDEX IF NOT EXISTS idx_autonomous_tasks_created_at ON autonomous_tasks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_autonomous_tasks_scheduled_at ON autonomous_tasks(scheduled_at);

CREATE INDEX IF NOT EXISTS idx_autonomy_rules_task_type ON autonomy_rules(task_type);
CREATE INDEX IF NOT EXISTS idx_autonomy_rules_is_enabled ON autonomy_rules(is_enabled);
CREATE INDEX IF NOT EXISTS idx_autonomy_rules_priority ON autonomy_rules(priority DESC);

CREATE INDEX IF NOT EXISTS idx_autonomy_decision_logs_task_id ON autonomy_decision_logs(task_id);
CREATE INDEX IF NOT EXISTS idx_autonomy_decision_logs_timestamp ON autonomy_decision_logs(timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_autonomy_configs_entity ON autonomy_configs(entity_type, entity_id);

-- Enable RLS
ALTER TABLE autonomous_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE autonomy_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE autonomy_decision_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE autonomy_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE autonomy_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Authenticated users can view autonomous tasks"
  ON autonomous_tasks FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "System can create autonomous tasks"
  ON autonomous_tasks FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update tasks they created or approved"
  ON autonomous_tasks FOR UPDATE
  USING (auth.uid() IN (created_by, approved_by) OR auth.role() = 'service_role');

CREATE POLICY "Authenticated users can view rules"
  ON autonomy_rules FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can manage their own rules"
  ON autonomy_rules FOR ALL
  USING (auth.uid() = created_by);

CREATE POLICY "Authenticated users can view decision logs"
  ON autonomy_decision_logs FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "System can create decision logs"
  ON autonomy_decision_logs FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view configs"
  ON autonomy_configs FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can manage configs they created"
  ON autonomy_configs FOR ALL
  USING (auth.uid() = created_by);

CREATE POLICY "Authenticated users can view metrics"
  ON autonomy_metrics FOR SELECT
  USING (auth.role() = 'authenticated');

-- Function to create autonomous task
CREATE OR REPLACE FUNCTION create_autonomous_task(
  p_task_type TEXT,
  p_task_name TEXT,
  p_description TEXT,
  p_decision_logic JSONB,
  p_autonomy_level INTEGER DEFAULT 1,
  p_mission_id UUID DEFAULT NULL,
  p_equipment_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_task_id UUID;
  v_config RECORD;
  v_requires_approval BOOLEAN := true;
BEGIN
  -- Get autonomy configuration
  SELECT * INTO v_config FROM autonomy_configs
  WHERE (entity_type = 'mission' AND entity_id = p_mission_id)
     OR (entity_type = 'equipment' AND entity_id = p_equipment_id)
     OR (entity_type = 'global' AND entity_id IS NULL)
  ORDER BY 
    CASE entity_type 
      WHEN 'mission' THEN 1 
      WHEN 'equipment' THEN 2 
      ELSE 3 
    END
  LIMIT 1;
  
  -- Check if autonomy is enabled
  IF v_config IS NULL OR NOT v_config.is_enabled THEN
    RAISE EXCEPTION 'Autonomy is not enabled for this entity';
  END IF;
  
  -- Check if task type is allowed
  IF NOT (p_task_type = ANY(v_config.allowed_task_types)) THEN
    RAISE EXCEPTION 'Task type % is not allowed', p_task_type;
  END IF;
  
  -- Determine if approval is required
  v_requires_approval := p_autonomy_level > v_config.require_approval_threshold
    OR NOT v_config.auto_approve_low_risk;
  
  -- Create task
  INSERT INTO autonomous_tasks (
    task_type, task_name, description, decision_logic,
    autonomy_level, requires_approval, mission_id, equipment_id,
    status, created_by
  ) VALUES (
    p_task_type, p_task_name, p_description, p_decision_logic,
    p_autonomy_level, v_requires_approval, p_mission_id, p_equipment_id,
    CASE WHEN v_requires_approval THEN 'pending' ELSE 'approved' END,
    auth.uid()
  ) RETURNING id INTO v_task_id;
  
  -- Log decision
  INSERT INTO autonomy_decision_logs (
    task_id, decision_type, decision_maker, decision_data, reasoning
  ) VALUES (
    v_task_id, 'create', 'system', p_decision_logic,
    'Task created by autonomy engine'
  );
  
  -- Update metrics
  INSERT INTO autonomy_metrics (tasks_created)
  VALUES (1)
  ON CONFLICT (metric_date) DO UPDATE SET
    tasks_created = autonomy_metrics.tasks_created + 1;
  
  RETURN v_task_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to approve autonomous task
CREATE OR REPLACE FUNCTION approve_autonomous_task(
  p_task_id UUID,
  p_approved BOOLEAN DEFAULT true
)
RETURNS BOOLEAN AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  IF p_approved THEN
    UPDATE autonomous_tasks
    SET status = 'approved',
        approved_by = v_user_id,
        approved_at = NOW()
    WHERE id = p_task_id AND status = 'pending';
    
    INSERT INTO autonomy_decision_logs (
      task_id, decision_type, decision_maker, user_id, decision_data
    ) VALUES (
      p_task_id, 'approve', 'user', v_user_id, '{}'::jsonb
    );
  ELSE
    UPDATE autonomous_tasks
    SET status = 'cancelled'
    WHERE id = p_task_id AND status = 'pending';
    
    INSERT INTO autonomy_decision_logs (
      task_id, decision_type, decision_maker, user_id, decision_data
    ) VALUES (
      p_task_id, 'reject', 'user', v_user_id, '{}'::jsonb
    );
  END IF;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default autonomy rules
INSERT INTO autonomy_rules (name, description, rule_type, task_type, conditions, actions, autonomy_level, requires_approval) VALUES
  (
    'Auto-schedule maintenance',
    'Automatically schedule maintenance when equipment usage exceeds threshold',
    'threshold',
    'maintenance',
    '{"metric": "usage_hours", "operator": "greater_than", "value": 1000}'::jsonb,
    '{"action": "schedule_maintenance", "priority": "medium"}'::jsonb,
    2,
    true
  ),
  (
    'Low fuel alert',
    'Create logistics task when fuel levels are low',
    'threshold',
    'logistics',
    '{"metric": "fuel_level", "operator": "less_than", "value": 20}'::jsonb,
    '{"action": "request_refuel", "priority": "high"}'::jsonb,
    1,
    false
  ),
  (
    'Satellite coverage loss',
    'Adjust satellite parameters when coverage is lost',
    'pattern',
    'satellite',
    '{"event": "coverage_lost", "duration_minutes": 5}'::jsonb,
    '{"action": "adjust_orbit", "priority": "critical"}'::jsonb,
    3,
    true
  )
ON CONFLICT DO NOTHING;

-- Insert default global autonomy config
INSERT INTO autonomy_configs (
  entity_type, entity_id, is_enabled, autonomy_level,
  allowed_task_types, require_approval_threshold
) VALUES (
  'global', NULL, false, 2,
  ARRAY['maintenance', 'logistics', 'satellite'],
  2
)
ON CONFLICT DO NOTHING;

COMMENT ON TABLE autonomous_tasks IS 'PATCH 348: Autonomous tasks created by the autonomy engine';
COMMENT ON TABLE autonomy_rules IS 'PATCH 348: Rules that trigger autonomous task creation';
COMMENT ON TABLE autonomy_decision_logs IS 'PATCH 348: Decision logs for audit trail';
COMMENT ON TABLE autonomy_configs IS 'PATCH 348: Autonomy configuration per entity';
COMMENT ON TABLE autonomy_metrics IS 'PATCH 348: Daily autonomy metrics';
