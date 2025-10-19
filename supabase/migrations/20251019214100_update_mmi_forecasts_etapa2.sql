-- Etapa 2: Update mmi_forecasts table to support job_id, system, next_due_date, risk_level, reasoning
-- This migration adds new columns required for the AI forecast integration

-- Add new columns to mmi_forecasts table
ALTER TABLE public.mmi_forecasts 
  ADD COLUMN IF NOT EXISTS job_id UUID REFERENCES public.mmi_jobs(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS system TEXT,
  ADD COLUMN IF NOT EXISTS next_due_date DATE,
  ADD COLUMN IF NOT EXISTS risk_level TEXT CHECK (risk_level IN ('baixo', 'médio', 'alto')),
  ADD COLUMN IF NOT EXISTS reasoning TEXT;

-- Create index for job_id for better query performance
CREATE INDEX IF NOT EXISTS idx_mmi_forecasts_job_id ON public.mmi_forecasts(job_id);
CREATE INDEX IF NOT EXISTS idx_mmi_forecasts_risk_level ON public.mmi_forecasts(risk_level);
CREATE INDEX IF NOT EXISTS idx_mmi_forecasts_next_due_date ON public.mmi_forecasts(next_due_date);

-- Add comment to document the new schema
COMMENT ON COLUMN public.mmi_forecasts.job_id IS 'Reference to the associated maintenance job';
COMMENT ON COLUMN public.mmi_forecasts.system IS 'System name from the job';
COMMENT ON COLUMN public.mmi_forecasts.next_due_date IS 'AI-predicted next maintenance due date';
COMMENT ON COLUMN public.mmi_forecasts.risk_level IS 'AI-assessed risk level: baixo, médio, or alto';
COMMENT ON COLUMN public.mmi_forecasts.reasoning IS 'AI reasoning for the forecast';
