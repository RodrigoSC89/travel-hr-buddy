-- Add forecast-related fields to mmi_jobs table
ALTER TABLE public.mmi_jobs 
ADD COLUMN IF NOT EXISTS forecast TEXT,
ADD COLUMN IF NOT EXISTS hours NUMERIC,
ADD COLUMN IF NOT EXISTS responsible TEXT,
ADD COLUMN IF NOT EXISTS forecast_date TIMESTAMP WITH TIME ZONE;

-- Update existing sample data with forecast information
UPDATE public.mmi_jobs 
SET 
  forecast = '2025-11-15',
  hours = 150,
  responsible = 'Equipe de Manutenção',
  forecast_date = CURRENT_TIMESTAMP
WHERE forecast IS NULL;
