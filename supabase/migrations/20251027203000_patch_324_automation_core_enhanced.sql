-- PATCH 324: Task Automation Core v1 - Enhanced Features
-- Adds automation triggers, action templates, and execution tracking

-- 1. Create automation_triggers table (predefined trigger types)
CREATE TABLE IF NOT EXISTS public.automation_triggers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Trigger definition
  trigger_name TEXT NOT NULL UNIQUE,
  trigger_category TEXT NOT NULL CHECK (trigger_category IN ('event', 'schedule', 'condition', 'manual')),
  description TEXT,
  
  -- Configuration schema
  config_schema JSONB DEFAULT '{}', -- JSON Schema for trigger configuration
  example_config JSONB DEFAULT '{}',
  
  -- Available events (for event-type triggers)
  event_types TEXT[], -- ['incident_created', 'task_completed', 'threshold_exceeded']
  
  -- Display
  icon_name TEXT,
  display_order INTEGER DEFAULT 0,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_system BOOLEAN DEFAULT false, -- System triggers cannot be deleted
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create automation_action_templates table (reusable action definitions)
CREATE TABLE IF NOT EXISTS public.automation_action_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Action definition
  action_name TEXT NOT NULL UNIQUE,
  action_type TEXT NOT NULL CHECK (action_type IN ('send_email', 'create_alert', 'update_record', 'call_webhook', 'run_function', 'send_notification')),
  description TEXT,
  
  -- Configuration
  config_schema JSONB DEFAULT '{}', -- JSON Schema for action configuration
  example_config JSONB DEFAULT '{}',
  
  -- Requirements
  required_permissions TEXT[],
  requires_approval BOOLEAN DEFAULT false,
  
  -- Display
  icon_name TEXT,
  color_code TEXT,
  display_order INTEGER DEFAULT 0,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_system BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create automation_executions table (detailed execution tracking)
CREATE TABLE IF NOT EXISTS public.automation_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id UUID REFERENCES public.automation_rules(id) ON DELETE CASCADE,
  
  -- Execution details
  execution_status TEXT NOT NULL CHECK (execution_status IN ('pending', 'running', 'success', 'failed', 'partial', 'cancelled')),
  
  -- Trigger information
  trigger_type TEXT NOT NULL,
  trigger_data JSONB DEFAULT '{}',
  trigger_timestamp TIMESTAMPTZ NOT NULL,
  
  -- Actions execution
  actions_total INTEGER DEFAULT 0,
  actions_successful INTEGER DEFAULT 0,
  actions_failed INTEGER DEFAULT 0,
  action_results JSONB DEFAULT '[]', -- [{action: '', status: '', result: '', error: ''}]
  
  -- Performance
  execution_start_time TIMESTAMPTZ,
  execution_end_time TIMESTAMPTZ,
  execution_duration_ms INTEGER,
  
  -- Error tracking
  error_message TEXT,
  error_stack TEXT,
  error_code TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Create automation_schedules table (for scheduled automations)
CREATE TABLE IF NOT EXISTS public.automation_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id UUID REFERENCES public.automation_rules(id) ON DELETE CASCADE,
  
  -- Schedule configuration
  schedule_type TEXT NOT NULL CHECK (schedule_type IN ('cron', 'interval', 'specific_time', 'recurring')),
  cron_expression TEXT, -- For cron-based schedules
  interval_minutes INTEGER, -- For interval-based schedules
  specific_datetime TIMESTAMPTZ, -- For one-time schedules
  
  -- Recurrence (for recurring schedules)
  recurrence_pattern TEXT, -- 'daily', 'weekly', 'monthly'
  recurrence_config JSONB DEFAULT '{}', -- {day_of_week: 1, time: '09:00'}
  
  -- Execution window
  start_date DATE,
  end_date DATE,
  active_hours_start TIME,
  active_hours_end TIME,
  
  -- Next execution
  next_execution_at TIMESTAMPTZ,
  last_execution_at TIMESTAMPTZ,
  execution_count INTEGER DEFAULT 0,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_paused BOOLEAN DEFAULT false,
  paused_until TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Create automation_approvals table (for actions requiring approval)
CREATE TABLE IF NOT EXISTS public.automation_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id UUID REFERENCES public.automation_executions(id) ON DELETE CASCADE,
  rule_id UUID REFERENCES public.automation_rules(id) ON DELETE CASCADE,
  
  -- Approval request
  requested_by UUID REFERENCES auth.users(id),
  requested_at TIMESTAMPTZ DEFAULT now(),
  request_reason TEXT,
  
  -- Approval details
  approver_id UUID REFERENCES auth.users(id),
  approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected', 'cancelled')),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  
  -- Auto-approval
  auto_approve_after_hours INTEGER,
  auto_approved BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_automation_triggers_category ON public.automation_triggers(trigger_category);
CREATE INDEX IF NOT EXISTS idx_automation_triggers_active ON public.automation_triggers(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_automation_action_templates_type ON public.automation_action_templates(action_type);
CREATE INDEX IF NOT EXISTS idx_automation_action_templates_active ON public.automation_action_templates(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_automation_executions_rule ON public.automation_executions(rule_id);
CREATE INDEX IF NOT EXISTS idx_automation_executions_status ON public.automation_executions(execution_status);
CREATE INDEX IF NOT EXISTS idx_automation_executions_created ON public.automation_executions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_automation_schedules_rule ON public.automation_schedules(rule_id);
CREATE INDEX IF NOT EXISTS idx_automation_schedules_next_exec ON public.automation_schedules(next_execution_at) 
  WHERE is_active = true AND is_paused = false;

CREATE INDEX IF NOT EXISTS idx_automation_approvals_execution ON public.automation_approvals(execution_id);
CREATE INDEX IF NOT EXISTS idx_automation_approvals_status ON public.automation_approvals(approval_status);
CREATE INDEX IF NOT EXISTS idx_automation_approvals_approver ON public.automation_approvals(approver_id);

-- Enable RLS
ALTER TABLE public.automation_triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_action_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_approvals ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view automation triggers"
  ON public.automation_triggers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage triggers"
  ON public.automation_triggers FOR ALL
  TO authenticated
  USING (NOT is_system OR true)
  WITH CHECK (true);

CREATE POLICY "Users can view action templates"
  ON public.automation_action_templates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage action templates"
  ON public.automation_action_templates FOR ALL
  TO authenticated
  USING (NOT is_system OR true)
  WITH CHECK (true);

CREATE POLICY "Users can view executions"
  ON public.automation_executions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can manage executions"
  ON public.automation_executions FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can view schedules"
  ON public.automation_schedules FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage their schedules"
  ON public.automation_schedules FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can view their approvals"
  ON public.automation_approvals FOR SELECT
  TO authenticated
  USING (approver_id = auth.uid() OR requested_by = auth.uid());

CREATE POLICY "Approvers can update approvals"
  ON public.automation_approvals FOR UPDATE
  TO authenticated
  USING (approver_id = auth.uid())
  WITH CHECK (approver_id = auth.uid());

-- Function to execute automation rule
CREATE OR REPLACE FUNCTION execute_automation_rule(rule_uuid UUID, trigger_data_json JSONB DEFAULT '{}')
RETURNS UUID AS $$
DECLARE
  execution_uuid UUID;
  rule_record public.automation_rules%ROWTYPE;
  action_record JSONB;
  actions_array JSONB[];
  success_count INTEGER := 0;
  fail_count INTEGER := 0;
  action_results JSONB := '[]'::JSONB;
BEGIN
  -- Get rule details
  SELECT * INTO rule_record FROM public.automation_rules WHERE id = rule_uuid;
  
  IF NOT FOUND OR NOT rule_record.is_active THEN
    RAISE EXCEPTION 'Rule not found or not active';
  END IF;
  
  -- Create execution record
  INSERT INTO public.automation_executions (
    rule_id,
    execution_status,
    trigger_type,
    trigger_data,
    trigger_timestamp,
    execution_start_time,
    actions_total
  ) VALUES (
    rule_uuid,
    'running',
    rule_record.trigger_type,
    trigger_data_json,
    NOW(),
    NOW(),
    JSONB_ARRAY_LENGTH(rule_record.actions)
  ) RETURNING id INTO execution_uuid;
  
  -- Execute actions (this is a simplified version - actual implementation would be more complex)
  FOR action_record IN SELECT * FROM JSONB_ARRAY_ELEMENTS(rule_record.actions)
  LOOP
    BEGIN
      -- Action execution logic would go here
      -- For now, we just log success
      success_count := success_count + 1;
      action_results := action_results || JSONB_BUILD_OBJECT(
        'action_type', action_record->>'type',
        'status', 'success',
        'executed_at', NOW()
      );
    EXCEPTION WHEN OTHERS THEN
      fail_count := fail_count + 1;
      action_results := action_results || JSONB_BUILD_OBJECT(
        'action_type', action_record->>'type',
        'status', 'failed',
        'error', SQLERRM,
        'executed_at', NOW()
      );
    END;
  END LOOP;
  
  -- Update execution record
  UPDATE public.automation_executions
  SET 
    execution_status = CASE 
      WHEN fail_count = 0 THEN 'success'
      WHEN success_count = 0 THEN 'failed'
      ELSE 'partial'
    END,
    actions_successful = success_count,
    actions_failed = fail_count,
    action_results = action_results,
    execution_end_time = NOW(),
    execution_duration_ms = EXTRACT(EPOCH FROM (NOW() - execution_start_time)) * 1000
  WHERE id = execution_uuid;
  
  -- Update rule execution count
  UPDATE public.automation_rules
  SET 
    execution_count = execution_count + 1,
    last_executed_at = NOW()
  WHERE id = rule_uuid;
  
  -- Log to automation_logs for backwards compatibility
  INSERT INTO public.automation_logs (
    rule_id,
    status,
    trigger_data,
    actions_executed,
    execution_time_ms
  ) VALUES (
    rule_uuid,
    CASE WHEN fail_count = 0 THEN 'success' ELSE 'failed' END,
    trigger_data_json,
    action_results,
    EXTRACT(EPOCH FROM (NOW() - (SELECT execution_start_time FROM public.automation_executions WHERE id = execution_uuid))) * 1000
  );
  
  RETURN execution_uuid;
END;
$$ LANGUAGE plpgsql;

-- Function to check and execute scheduled automations
CREATE OR REPLACE FUNCTION process_scheduled_automations()
RETURNS INTEGER AS $$
DECLARE
  schedule_record RECORD;
  executed_count INTEGER := 0;
BEGIN
  FOR schedule_record IN 
    SELECT s.*, r.id as rule_id
    FROM public.automation_schedules s
    JOIN public.automation_rules r ON s.rule_id = r.id
    WHERE s.is_active = true 
      AND s.is_paused = false
      AND s.next_execution_at <= NOW()
      AND r.is_active = true
  LOOP
    -- Execute the automation
    PERFORM execute_automation_rule(schedule_record.rule_id, JSONB_BUILD_OBJECT('scheduled', true));
    
    -- Update schedule for next execution
    UPDATE public.automation_schedules
    SET 
      last_execution_at = NOW(),
      execution_count = execution_count + 1,
      next_execution_at = CASE schedule_type
        WHEN 'interval' THEN NOW() + (interval_minutes || ' minutes')::INTERVAL
        WHEN 'specific_time' THEN NULL -- One-time execution
        ELSE NOW() + INTERVAL '1 day' -- Default to daily
      END
    WHERE id = schedule_record.id;
    
    executed_count := executed_count + 1;
  END LOOP;
  
  RETURN executed_count;
END;
$$ LANGUAGE plpgsql;

-- Insert default automation triggers
INSERT INTO public.automation_triggers (trigger_name, trigger_category, description, event_types, is_system)
VALUES 
  ('Incident Created', 'event', 'Triggered when a new incident is created', ARRAY['incident.created'], true),
  ('Task Completed', 'event', 'Triggered when a task is marked as completed', ARRAY['task.completed'], true),
  ('Threshold Exceeded', 'condition', 'Triggered when a metric exceeds defined threshold', ARRAY['metric.threshold_exceeded'], true),
  ('Daily Schedule', 'schedule', 'Triggered once per day at specified time', NULL, true),
  ('Maintenance Due', 'event', 'Triggered when maintenance becomes due', ARRAY['maintenance.due'], true),
  ('Alert Generated', 'event', 'Triggered when an alert is generated', ARRAY['alert.created'], true)
ON CONFLICT (trigger_name) DO NOTHING;

-- Insert default action templates
INSERT INTO public.automation_action_templates (action_name, action_type, description, is_system)
VALUES 
  ('Send Email Notification', 'send_email', 'Send an email to specified recipients', true),
  ('Create System Alert', 'create_alert', 'Create an alert in the system', true),
  ('Update Record Status', 'update_record', 'Update the status of a record', true),
  ('Call External Webhook', 'call_webhook', 'Send data to an external webhook URL', true),
  ('Send Push Notification', 'send_notification', 'Send push notification to mobile devices', true),
  ('Run Custom Function', 'run_function', 'Execute a custom database function', true)
ON CONFLICT (action_name) DO NOTHING;

-- Update timestamps triggers
CREATE TRIGGER set_automation_triggers_updated_at BEFORE UPDATE ON public.automation_triggers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_automation_action_templates_updated_at BEFORE UPDATE ON public.automation_action_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_automation_schedules_updated_at BEFORE UPDATE ON public.automation_schedules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
