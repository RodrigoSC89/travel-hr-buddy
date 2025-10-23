-- Create nautilus_workflows table
CREATE TABLE IF NOT EXISTS public.nautilus_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  steps JSONB NOT NULL,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create workflow_executions table
CREATE TABLE IF NOT EXISTS public.workflow_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES public.nautilus_workflows(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('running', 'completed', 'failed', 'rolled_back', 'waiting_approval')),
  current_step INTEGER DEFAULT 0,
  total_steps INTEGER NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create workflow_execution_logs table
CREATE TABLE IF NOT EXISTS public.workflow_execution_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id UUID NOT NULL REFERENCES public.workflow_executions(id) ON DELETE CASCADE,
  step_index INTEGER NOT NULL,
  step_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('completed', 'failed', 'skipped')),
  input JSONB,
  output JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.nautilus_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_execution_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for nautilus_workflows
CREATE POLICY "Users can view their own workflows"
  ON public.nautilus_workflows
  FOR SELECT
  USING (auth.uid() = created_by);

CREATE POLICY "Users can create their own workflows"
  ON public.nautilus_workflows
  FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own workflows"
  ON public.nautilus_workflows
  FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own workflows"
  ON public.nautilus_workflows
  FOR DELETE
  USING (auth.uid() = created_by);

-- RLS Policies for workflow_executions
CREATE POLICY "Users can view executions of their workflows"
  ON public.workflow_executions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.nautilus_workflows
      WHERE nautilus_workflows.id = workflow_executions.workflow_id
      AND nautilus_workflows.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can create executions of their workflows"
  ON public.workflow_executions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.nautilus_workflows
      WHERE nautilus_workflows.id = workflow_executions.workflow_id
      AND nautilus_workflows.created_by = auth.uid()
    )
  );

-- RLS Policies for workflow_execution_logs
CREATE POLICY "Users can view logs of their workflow executions"
  ON public.workflow_execution_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workflow_executions
      JOIN public.nautilus_workflows ON nautilus_workflows.id = workflow_executions.workflow_id
      WHERE workflow_executions.id = workflow_execution_logs.execution_id
      AND nautilus_workflows.created_by = auth.uid()
    )
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_workflows_created_by ON public.nautilus_workflows(created_by);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_workflow_id ON public.workflow_executions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_execution_logs_execution_id ON public.workflow_execution_logs(execution_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_workflow_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_workflows_updated_at
  BEFORE UPDATE ON public.nautilus_workflows
  FOR EACH ROW
  EXECUTE FUNCTION update_workflow_updated_at();