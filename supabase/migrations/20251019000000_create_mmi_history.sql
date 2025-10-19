-- Create mmi_history table for tracking maintenance history
-- This table stores historical maintenance records with execution status

CREATE TABLE IF NOT EXISTS public.mmi_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE SET NULL,
  system_name TEXT NOT NULL,
  task_description TEXT NOT NULL,
  executed_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('executado', 'pendente', 'atrasado')),
  pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.mmi_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Allow authenticated users to view all history
CREATE POLICY "Users can view mmi_history"
  ON public.mmi_history FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to create history entries
CREATE POLICY "Users can create mmi_history"
  ON public.mmi_history FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update history entries
CREATE POLICY "Users can update mmi_history"
  ON public.mmi_history FOR UPDATE
  TO authenticated
  USING (true);

-- Allow authenticated users to delete history entries
CREATE POLICY "Users can delete mmi_history"
  ON public.mmi_history FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX idx_mmi_history_vessel_id ON public.mmi_history(vessel_id);
CREATE INDEX idx_mmi_history_status ON public.mmi_history(status);
CREATE INDEX idx_mmi_history_executed_at ON public.mmi_history(executed_at DESC);
CREATE INDEX idx_mmi_history_created_at ON public.mmi_history(created_at DESC);

-- Create trigger for updated_at
CREATE TRIGGER update_mmi_history_updated_at
  BEFORE UPDATE ON public.mmi_history
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add comment
COMMENT ON TABLE public.mmi_history IS 'Historical maintenance records with execution status and PDF reports';
