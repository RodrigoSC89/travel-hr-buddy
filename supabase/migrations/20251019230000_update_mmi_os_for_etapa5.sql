-- Migration for Etapa 5 - Update mmi_os table to support new status values and fields
-- Add forecast_id and descricao fields, update status check to include new values

-- Add forecast_id column if it doesn't exist
ALTER TABLE public.mmi_os
ADD COLUMN IF NOT EXISTS forecast_id UUID;

-- Add descricao column if it doesn't exist (maps to description/notes)
ALTER TABLE public.mmi_os
ADD COLUMN IF NOT EXISTS descricao TEXT;

-- Drop the existing status check constraint if it exists
ALTER TABLE public.mmi_os
DROP CONSTRAINT IF EXISTS mmi_os_status_check;

-- Add new status check constraint with additional values
ALTER TABLE public.mmi_os
ADD CONSTRAINT mmi_os_status_check 
CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled', 'pendente', 'executado', 'atrasado'));

-- Create index on forecast_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_mmi_os_forecast_id ON public.mmi_os(forecast_id);

-- Add foreign key constraint for forecast_id if mmi_forecasts table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'mmi_forecasts') THEN
    ALTER TABLE public.mmi_os
    ADD CONSTRAINT fk_mmi_os_forecast
    FOREIGN KEY (forecast_id) REFERENCES public.mmi_forecasts(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add comments
COMMENT ON COLUMN public.mmi_os.forecast_id IS 'Reference to the forecast that generated this OS';
COMMENT ON COLUMN public.mmi_os.descricao IS 'Description of the work order (Descrição da OS)';
