-- Create mmi_logs table for storing maintenance job execution history
-- This table records every execution of maintenance jobs for AI forecasting

CREATE TABLE IF NOT EXISTS public.mmi_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.mmi_jobs(id) ON DELETE CASCADE NOT NULL,
  executado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL CHECK (status IN ('executado', 'pendente', 'cancelado', 'falha')),
  observacoes TEXT,
  executor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.mmi_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Allow authenticated users to view all logs
CREATE POLICY "Users can view mmi_logs"
  ON public.mmi_logs FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to create logs
CREATE POLICY "Users can create mmi_logs"
  ON public.mmi_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update logs
CREATE POLICY "Users can update mmi_logs"
  ON public.mmi_logs FOR UPDATE
  TO authenticated
  USING (true);

-- Allow authenticated users to delete logs
CREATE POLICY "Users can delete mmi_logs"
  ON public.mmi_logs FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX idx_mmi_logs_job_id ON public.mmi_logs(job_id);
CREATE INDEX idx_mmi_logs_executado_em ON public.mmi_logs(executado_em DESC);
CREATE INDEX idx_mmi_logs_status ON public.mmi_logs(status);

-- Create trigger for updated_at
CREATE TRIGGER update_mmi_logs_updated_at
  BEFORE UPDATE ON public.mmi_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add comment
COMMENT ON TABLE public.mmi_logs IS 'Execution history for MMI maintenance jobs used by AI forecasting';
COMMENT ON COLUMN public.mmi_logs.executado_em IS 'Timestamp when the job was executed';
COMMENT ON COLUMN public.mmi_logs.status IS 'Status of execution: executado (completed), pendente (pending), cancelado (canceled), falha (failed)';
