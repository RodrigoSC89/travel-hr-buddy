-- Update mmi_forecasts table for Etapa 2: AI Forecast Pipeline with Supabase Integration
-- This migration adds columns needed for job-based forecasting

-- Add new columns to support job-based forecasting
ALTER TABLE public.mmi_forecasts 
  ADD COLUMN IF NOT EXISTS job_id UUID REFERENCES public.mmi_jobs(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS system TEXT,
  ADD COLUMN IF NOT EXISTS next_due_date DATE,
  ADD COLUMN IF NOT EXISTS risk_level TEXT CHECK (risk_level IN ('baixo', 'médio', 'alto')),
  ADD COLUMN IF NOT EXISTS reasoning TEXT;

-- Create index for job_id lookups
CREATE INDEX IF NOT EXISTS idx_mmi_forecasts_job_id ON public.mmi_forecasts(job_id);

-- Create index for next_due_date to help with upcoming maintenance queries
CREATE INDEX IF NOT EXISTS idx_mmi_forecasts_next_due_date ON public.mmi_forecasts(next_due_date);

-- Create index for risk_level to help filter by risk
CREATE INDEX IF NOT EXISTS idx_mmi_forecasts_risk_level ON public.mmi_forecasts(risk_level);

-- Add comment
COMMENT ON COLUMN public.mmi_forecasts.job_id IS 'Reference to the maintenance job this forecast is for';
COMMENT ON COLUMN public.mmi_forecasts.system IS 'System name (e.g., Sistema hidráulico, Sistema elétrico)';
COMMENT ON COLUMN public.mmi_forecasts.next_due_date IS 'AI-predicted next maintenance due date';
COMMENT ON COLUMN public.mmi_forecasts.risk_level IS 'AI-assessed risk level (baixo, médio, alto)';
COMMENT ON COLUMN public.mmi_forecasts.reasoning IS 'Technical justification for the forecast from GPT-4';
