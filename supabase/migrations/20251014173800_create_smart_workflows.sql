-- Create smart_workflows table to store workflow definitions
CREATE TABLE IF NOT EXISTS smart_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'pausado', 'concluido')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  category TEXT,
  tags TEXT[]
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_smart_workflows_created_by 
  ON smart_workflows (created_by);

CREATE INDEX IF NOT EXISTS idx_smart_workflows_status 
  ON smart_workflows (status);

CREATE INDEX IF NOT EXISTS idx_smart_workflows_created_at 
  ON smart_workflows (created_at DESC);

-- Enable Row Level Security
ALTER TABLE smart_workflows ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can view all workflows
CREATE POLICY "Authenticated users can view all workflows"
  ON smart_workflows
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Authenticated users can create workflows
CREATE POLICY "Authenticated users can create workflows"
  ON smart_workflows
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Policy: Users can update workflows they created
CREATE POLICY "Users can update their own workflows"
  ON smart_workflows
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by);

-- Policy: Users can delete workflows they created
CREATE POLICY "Users can delete their own workflows"
  ON smart_workflows
  FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON smart_workflows TO authenticated;

-- Add comment
COMMENT ON TABLE smart_workflows IS 'Smart workflow definitions for task management';

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_smart_workflows_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_smart_workflows_updated_at_trigger
  BEFORE UPDATE ON smart_workflows
  FOR EACH ROW
  EXECUTE FUNCTION update_smart_workflows_updated_at();
