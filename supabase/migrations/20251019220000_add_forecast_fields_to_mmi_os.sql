-- Add forecast_id and descricao columns to mmi_os table
-- This migration adds support for creating work orders directly from forecasts

-- Add forecast_id column (references mmi_forecasts)
ALTER TABLE public.mmi_os 
ADD COLUMN IF NOT EXISTS forecast_id UUID REFERENCES public.mmi_forecasts(id) ON DELETE SET NULL;

-- Add descricao column for work order description
ALTER TABLE public.mmi_os 
ADD COLUMN IF NOT EXISTS descricao TEXT;

-- Add created_by column (aliasing opened_by for compatibility)
ALTER TABLE public.mmi_os 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Make job_id nullable since work orders can be created from forecasts without jobs
ALTER TABLE public.mmi_os 
ALTER COLUMN job_id DROP NOT NULL;

-- Update status constraint to include 'pendente' status
ALTER TABLE public.mmi_os 
DROP CONSTRAINT IF EXISTS mmi_os_status_check;

ALTER TABLE public.mmi_os 
ADD CONSTRAINT mmi_os_status_check 
CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled', 'pendente'));

-- Create index for forecast_id lookups
CREATE INDEX IF NOT EXISTS idx_mmi_os_forecast_id ON public.mmi_os(forecast_id);

-- Add comment
COMMENT ON COLUMN public.mmi_os.forecast_id IS 'Reference to the forecast that generated this work order';
COMMENT ON COLUMN public.mmi_os.descricao IS 'Work order description';
COMMENT ON COLUMN public.mmi_os.created_by IS 'User who created the work order';
