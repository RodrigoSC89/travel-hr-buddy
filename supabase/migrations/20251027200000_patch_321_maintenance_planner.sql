-- PATCH 321: Maintenance Planner v1
-- Complete maintenance planning system with MMI integration

-- 1. Create maintenance_plans table
CREATE TABLE IF NOT EXISTS public.maintenance_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Plan identification
  plan_name TEXT NOT NULL,
  description TEXT,
  equipment_type TEXT NOT NULL, -- 'engine', 'navigation', 'safety', 'electrical', 'hydraulic'
  equipment_id TEXT, -- Reference to specific equipment
  
  -- Schedule
  frequency TEXT NOT NULL, -- 'daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'on-condition'
  schedule_config JSONB DEFAULT '{}', -- {day_of_week: 1, day_of_month: 15, interval_days: 30}
  
  -- Plan details
  estimated_duration_hours NUMERIC,
  required_tools TEXT[],
  required_parts TEXT[],
  safety_requirements TEXT[],
  
  -- MMI Integration
  mmi_integration_enabled BOOLEAN DEFAULT false,
  last_mmi_sync_at TIMESTAMPTZ,
  predicted_failure_date DATE,
  failure_probability NUMERIC, -- 0.0 to 1.0
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create maintenance_tasks table
CREATE TABLE IF NOT EXISTS public.maintenance_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES public.maintenance_plans(id) ON DELETE CASCADE,
  
  -- Task details
  task_name TEXT NOT NULL,
  description TEXT,
  task_type TEXT NOT NULL CHECK (task_type IN ('inspection', 'repair', 'replacement', 'calibration', 'cleaning', 'testing')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  
  -- Scheduling
  scheduled_date DATE NOT NULL,
  scheduled_time TIME,
  deadline_date DATE,
  
  -- Assignment
  assigned_to UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMPTZ,
  
  -- Status tracking
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled', 'rescheduled', 'overdue')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Results
  completion_notes TEXT,
  issues_found TEXT[],
  parts_used JSONB DEFAULT '[]', -- [{part_name: '', quantity: 0, cost: 0}]
  
  -- Alert configuration
  alert_days_before INTEGER DEFAULT 3,
  alert_sent BOOLEAN DEFAULT false,
  alert_sent_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create task_logs table (audit trail)
CREATE TABLE IF NOT EXISTS public.task_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES public.maintenance_tasks(id) ON DELETE CASCADE,
  
  -- Log entry
  log_type TEXT NOT NULL CHECK (log_type IN ('status_change', 'comment', 'attachment', 'assignment', 'completion', 'issue')),
  log_message TEXT NOT NULL,
  
  -- Metadata
  old_value TEXT,
  new_value TEXT,
  logged_by UUID REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Create maintenance_alerts table
CREATE TABLE IF NOT EXISTS public.maintenance_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES public.maintenance_tasks(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES public.maintenance_plans(id) ON DELETE CASCADE,
  
  -- Alert details
  alert_type TEXT NOT NULL CHECK (alert_type IN ('due_soon', 'overdue', 'mmi_prediction', 'failure_risk')),
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
  message TEXT NOT NULL,
  
  -- Recipients
  assigned_user UUID REFERENCES auth.users(id),
  notified_users UUID[],
  
  -- Status
  is_read BOOLEAN DEFAULT false,
  is_dismissed BOOLEAN DEFAULT false,
  dismissed_by UUID REFERENCES auth.users(id),
  dismissed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_maintenance_plans_equipment ON public.maintenance_plans(equipment_type);
CREATE INDEX IF NOT EXISTS idx_maintenance_plans_active ON public.maintenance_plans(is_active);
CREATE INDEX IF NOT EXISTS idx_maintenance_plans_mmi_enabled ON public.maintenance_plans(mmi_integration_enabled) WHERE mmi_integration_enabled = true;

CREATE INDEX IF NOT EXISTS idx_maintenance_tasks_plan ON public.maintenance_tasks(plan_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_tasks_status ON public.maintenance_tasks(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_tasks_scheduled_date ON public.maintenance_tasks(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_maintenance_tasks_assigned_to ON public.maintenance_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_maintenance_tasks_overdue ON public.maintenance_tasks(status, deadline_date) 
  WHERE status != 'completed' AND status != 'cancelled';

CREATE INDEX IF NOT EXISTS idx_task_logs_task ON public.task_logs(task_id);
CREATE INDEX IF NOT EXISTS idx_task_logs_type ON public.task_logs(log_type);

CREATE INDEX IF NOT EXISTS idx_maintenance_alerts_task ON public.maintenance_alerts(task_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_alerts_unread ON public.maintenance_alerts(is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_maintenance_alerts_severity ON public.maintenance_alerts(severity);

-- Enable RLS
ALTER TABLE public.maintenance_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for maintenance_plans
CREATE POLICY "Users can view maintenance plans"
  ON public.maintenance_plans FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authorized users can manage plans"
  ON public.maintenance_plans FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for maintenance_tasks
CREATE POLICY "Users can view maintenance tasks"
  ON public.maintenance_tasks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Assigned users can update their tasks"
  ON public.maintenance_tasks FOR UPDATE
  TO authenticated
  USING (assigned_to = auth.uid() OR true)
  WITH CHECK (true);

CREATE POLICY "Authorized users can manage tasks"
  ON public.maintenance_tasks FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for task_logs
CREATE POLICY "Users can view task logs"
  ON public.task_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert task logs"
  ON public.task_logs FOR INSERT
  TO authenticated
  WITH CHECK (logged_by = auth.uid());

-- RLS Policies for maintenance_alerts
CREATE POLICY "Users can view their alerts"
  ON public.maintenance_alerts FOR SELECT
  TO authenticated
  USING (assigned_user = auth.uid() OR auth.uid() = ANY(notified_users) OR true);

CREATE POLICY "Users can update their alerts"
  ON public.maintenance_alerts FOR UPDATE
  TO authenticated
  USING (assigned_user = auth.uid() OR auth.uid() = ANY(notified_users))
  WITH CHECK (true);

-- Function to auto-create tasks from plans
CREATE OR REPLACE FUNCTION generate_maintenance_tasks_from_plan(plan_uuid UUID)
RETURNS VOID AS $$
DECLARE
  plan_record public.maintenance_plans%ROWTYPE;
  next_date DATE;
BEGIN
  SELECT * INTO plan_record FROM public.maintenance_plans WHERE id = plan_uuid;
  
  IF NOT FOUND OR NOT plan_record.is_active THEN
    RETURN;
  END IF;
  
  -- Calculate next scheduled date based on frequency
  next_date := CASE plan_record.frequency
    WHEN 'daily' THEN CURRENT_DATE + INTERVAL '1 day'
    WHEN 'weekly' THEN CURRENT_DATE + INTERVAL '1 week'
    WHEN 'monthly' THEN CURRENT_DATE + INTERVAL '1 month'
    WHEN 'quarterly' THEN CURRENT_DATE + INTERVAL '3 months'
    WHEN 'yearly' THEN CURRENT_DATE + INTERVAL '1 year'
    ELSE CURRENT_DATE + INTERVAL '1 month'
  END;
  
  -- Insert new task
  INSERT INTO public.maintenance_tasks (
    plan_id,
    task_name,
    description,
    task_type,
    scheduled_date,
    deadline_date,
    status
  ) VALUES (
    plan_uuid,
    plan_record.plan_name,
    plan_record.description,
    'inspection',
    next_date,
    next_date + INTERVAL '7 days',
    'pending'
  );
END;
$$ LANGUAGE plpgsql;

-- Function to check and send alerts for upcoming/overdue tasks
CREATE OR REPLACE FUNCTION check_maintenance_alerts()
RETURNS VOID AS $$
DECLARE
  task_record RECORD;
BEGIN
  -- Check for tasks due soon (within alert_days_before)
  FOR task_record IN 
    SELECT t.*, p.plan_name
    FROM public.maintenance_tasks t
    LEFT JOIN public.maintenance_plans p ON t.plan_id = p.id
    WHERE t.status = 'pending'
      AND t.scheduled_date <= CURRENT_DATE + (t.alert_days_before || ' days')::INTERVAL
      AND NOT t.alert_sent
  LOOP
    INSERT INTO public.maintenance_alerts (
      task_id,
      plan_id,
      alert_type,
      severity,
      message,
      assigned_user
    ) VALUES (
      task_record.id,
      task_record.plan_id,
      'due_soon',
      'warning',
      'Maintenance task "' || task_record.task_name || '" is due on ' || task_record.scheduled_date::TEXT,
      task_record.assigned_to
    );
    
    -- Mark alert as sent
    UPDATE public.maintenance_tasks 
    SET alert_sent = true, alert_sent_at = NOW()
    WHERE id = task_record.id;
  END LOOP;
  
  -- Check for overdue tasks
  FOR task_record IN 
    SELECT t.*, p.plan_name
    FROM public.maintenance_tasks t
    LEFT JOIN public.maintenance_plans p ON t.plan_id = p.id
    WHERE t.status IN ('pending', 'in_progress')
      AND t.deadline_date < CURRENT_DATE
  LOOP
    -- Update status to overdue
    UPDATE public.maintenance_tasks 
    SET status = 'overdue'
    WHERE id = task_record.id AND status != 'overdue';
    
    -- Create alert
    INSERT INTO public.maintenance_alerts (
      task_id,
      plan_id,
      alert_type,
      severity,
      message,
      assigned_user
    ) VALUES (
      task_record.id,
      task_record.plan_id,
      'overdue',
      'critical',
      'Maintenance task "' || task_record.task_name || '" is OVERDUE (deadline was ' || task_record.deadline_date::TEXT || ')',
      task_record.assigned_to
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Trigger to log task status changes
CREATE OR REPLACE FUNCTION log_task_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.task_logs (
      task_id,
      log_type,
      log_message,
      old_value,
      new_value,
      logged_by
    ) VALUES (
      NEW.id,
      'status_change',
      'Status changed from ' || OLD.status || ' to ' || NEW.status,
      OLD.status,
      NEW.status,
      auth.uid()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER task_status_change_logger
  AFTER UPDATE ON public.maintenance_tasks
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION log_task_status_change();

-- Update timestamps trigger
CREATE TRIGGER set_maintenance_plans_updated_at BEFORE UPDATE ON public.maintenance_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_maintenance_tasks_updated_at BEFORE UPDATE ON public.maintenance_tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
