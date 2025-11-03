-- PATCH 597: Smart Scheduler + Task Engine
-- Creates scheduled_tasks table and related functions

-- Create scheduled_tasks table
CREATE TABLE IF NOT EXISTS scheduled_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  module VARCHAR(50) NOT NULL, -- PSC, MLC, LSA, OVID
  priority VARCHAR(20) NOT NULL DEFAULT 'medium', -- low, medium, high, critical
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, in_progress, completed, overdue
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  vessel_id UUID,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  ai_generated BOOLEAN DEFAULT false,
  recurrence_pattern VARCHAR(50), -- daily, weekly, monthly, quarterly
  parent_task_id UUID REFERENCES scheduled_tasks(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_module ON scheduled_tasks(module);
CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_status ON scheduled_tasks(status);
CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_due_date ON scheduled_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_assigned_to ON scheduled_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_vessel_id ON scheduled_tasks(vessel_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_ai_generated ON scheduled_tasks(ai_generated);
CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_recurrence ON scheduled_tasks(recurrence_pattern, status) WHERE recurrence_pattern IS NOT NULL;

-- Enable RLS
ALTER TABLE scheduled_tasks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view tasks assigned to them or created by them"
  ON scheduled_tasks FOR SELECT
  USING (
    auth.uid() = assigned_to OR 
    auth.uid() = created_by OR
    auth.uid() IN (
      SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' IN ('admin', 'supervisor')
    )
  );

CREATE POLICY "Authenticated users can create tasks"
  ON scheduled_tasks FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own tasks or admins can update any"
  ON scheduled_tasks FOR UPDATE
  USING (
    auth.uid() = assigned_to OR 
    auth.uid() = created_by OR
    auth.uid() IN (
      SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' IN ('admin', 'supervisor')
    )
  );

CREATE POLICY "Users can delete their own created tasks or admins can delete any"
  ON scheduled_tasks FOR DELETE
  USING (
    auth.uid() = created_by OR
    auth.uid() IN (
      SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' IN ('admin', 'supervisor')
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_scheduled_tasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_scheduled_tasks_updated_at
  BEFORE UPDATE ON scheduled_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_scheduled_tasks_updated_at();

-- Create function to mark overdue tasks
CREATE OR REPLACE FUNCTION mark_overdue_tasks()
RETURNS void AS $$
BEGIN
  UPDATE scheduled_tasks
  SET status = 'overdue'
  WHERE status = 'pending'
    AND due_date < NOW()
    AND completed_at IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Create function to generate recurring tasks
CREATE OR REPLACE FUNCTION generate_recurring_tasks()
RETURNS void AS $$
DECLARE
  task_record RECORD;
  next_due_date TIMESTAMP WITH TIME ZONE;
BEGIN
  FOR task_record IN
    SELECT * FROM scheduled_tasks
    WHERE recurrence_pattern IS NOT NULL
      AND status = 'completed'
      AND NOT EXISTS (
        SELECT 1 FROM scheduled_tasks st
        WHERE st.parent_task_id = task_record.id
          AND st.status IN ('pending', 'in_progress')
      )
  LOOP
    -- Calculate next due date based on recurrence pattern
    CASE task_record.recurrence_pattern
      WHEN 'daily' THEN
        next_due_date := task_record.due_date + INTERVAL '1 day';
      WHEN 'weekly' THEN
        next_due_date := task_record.due_date + INTERVAL '1 week';
      WHEN 'monthly' THEN
        next_due_date := task_record.due_date + INTERVAL '1 month';
      WHEN 'quarterly' THEN
        next_due_date := task_record.due_date + INTERVAL '3 months';
      ELSE
        next_due_date := NULL;
    END CASE;

    IF next_due_date IS NOT NULL AND next_due_date > NOW() THEN
      INSERT INTO scheduled_tasks (
        title, description, module, priority, status, due_date,
        assigned_to, vessel_id, created_by, metadata, ai_generated,
        recurrence_pattern, parent_task_id
      )
      VALUES (
        task_record.title,
        task_record.description,
        task_record.module,
        task_record.priority,
        'pending',
        next_due_date,
        task_record.assigned_to,
        task_record.vessel_id,
        task_record.created_by,
        task_record.metadata,
        task_record.ai_generated,
        task_record.recurrence_pattern,
        task_record.id
      );
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Add comment
COMMENT ON TABLE scheduled_tasks IS 'PATCH 597: Smart Scheduler - AI-generated and manual tasks with recurrence support';
