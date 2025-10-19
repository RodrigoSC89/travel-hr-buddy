-- Create mmi_tasks table for automatic task/OS creation from forecasts
-- This table stores automatically generated maintenance tasks based on AI forecasts

CREATE TABLE IF NOT EXISTS public.mmi_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  forecast_date DATE,
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE SET NULL,
  system_name TEXT,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_andamento', 'concluido', 'cancelado')),
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  ai_reasoning TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.mmi_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Allow authenticated users to view all tasks
CREATE POLICY "Users can view mmi_tasks"
  ON public.mmi_tasks FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to create tasks
CREATE POLICY "Users can create mmi_tasks"
  ON public.mmi_tasks FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update their own tasks or tasks assigned to them
CREATE POLICY "Users can update mmi_tasks"
  ON public.mmi_tasks FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by OR auth.uid() = assigned_to);

-- Allow users to delete their own tasks
CREATE POLICY "Users can delete mmi_tasks"
  ON public.mmi_tasks FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- Create indexes for better performance
CREATE INDEX idx_mmi_tasks_vessel_id ON public.mmi_tasks(vessel_id);
CREATE INDEX idx_mmi_tasks_status ON public.mmi_tasks(status);
CREATE INDEX idx_mmi_tasks_priority ON public.mmi_tasks(priority);
CREATE INDEX idx_mmi_tasks_forecast_date ON public.mmi_tasks(forecast_date);
CREATE INDEX idx_mmi_tasks_assigned_to ON public.mmi_tasks(assigned_to);
CREATE INDEX idx_mmi_tasks_created_at ON public.mmi_tasks(created_at DESC);

-- Create trigger for updated_at
CREATE TRIGGER update_mmi_tasks_updated_at
  BEFORE UPDATE ON public.mmi_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add comment
COMMENT ON TABLE public.mmi_tasks IS 'Automatically generated maintenance tasks from AI forecasts with work order generation';
