-- Create smart_workflow_steps table to store workflow task steps
CREATE TABLE IF NOT EXISTS smart_workflow_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES smart_workflows(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_progresso', 'concluido')),
  assigned_to UUID REFERENCES auth.users(id),
  due_date DATE,
  position INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_smart_workflow_steps_workflow_id 
  ON smart_workflow_steps (workflow_id);

CREATE INDEX IF NOT EXISTS idx_smart_workflow_steps_assigned_to 
  ON smart_workflow_steps (assigned_to);

CREATE INDEX IF NOT EXISTS idx_smart_workflow_steps_status 
  ON smart_workflow_steps (status);

CREATE INDEX IF NOT EXISTS idx_smart_workflow_steps_position 
  ON smart_workflow_steps (workflow_id, position);

-- Enable Row Level Security
ALTER TABLE smart_workflow_steps ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can view all steps
CREATE POLICY "Authenticated users can view all steps"
  ON smart_workflow_steps
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Authenticated users can create steps
CREATE POLICY "Authenticated users can create steps"
  ON smart_workflow_steps
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Authenticated users can update steps
CREATE POLICY "Authenticated users can update steps"
  ON smart_workflow_steps
  FOR UPDATE
  TO authenticated
  USING (true);

-- Policy: Authenticated users can delete steps
CREATE POLICY "Authenticated users can delete steps"
  ON smart_workflow_steps
  FOR DELETE
  TO authenticated
  USING (true);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON smart_workflow_steps TO authenticated;

-- Add comment
COMMENT ON TABLE smart_workflow_steps IS 'Steps/tasks for smart workflows with Kanban board support';
