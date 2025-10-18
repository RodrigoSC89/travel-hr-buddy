-- ===========================
-- Add GPT Analysis and Updated_at to DP Incidents
-- Adds gpt_analysis column to store AI analysis results
-- Adds updated_at column to track when records are updated
-- ===========================

-- Add gpt_analysis column to store AI analysis results as JSONB
ALTER TABLE public.dp_incidents 
ADD COLUMN IF NOT EXISTS gpt_analysis JSONB DEFAULT NULL;

-- Add updated_at column to track when records are updated
ALTER TABLE public.dp_incidents 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Add index for faster queries on updated_at
CREATE INDEX IF NOT EXISTS idx_dp_incidents_updated_at ON public.dp_incidents(updated_at DESC);

-- Add column comments
COMMENT ON COLUMN public.dp_incidents.gpt_analysis IS 'Análise de IA (GPT-4) do incidente em formato JSON estruturado';
COMMENT ON COLUMN public.dp_incidents.updated_at IS 'Data/hora da última atualização do registro';

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_dp_incidents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at on row update
DROP TRIGGER IF EXISTS trigger_update_dp_incidents_updated_at ON public.dp_incidents;
CREATE TRIGGER trigger_update_dp_incidents_updated_at
  BEFORE UPDATE ON public.dp_incidents
  FOR EACH ROW
  EXECUTE FUNCTION update_dp_incidents_updated_at();
