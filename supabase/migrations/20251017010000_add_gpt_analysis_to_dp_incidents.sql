-- Add gpt_analysis and updated_at columns to dp_incidents table
ALTER TABLE public.dp_incidents
ADD COLUMN IF NOT EXISTS gpt_analysis TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Add comments
COMMENT ON COLUMN public.dp_incidents.gpt_analysis IS 'Análise gerada por IA (GPT) do incidente';
COMMENT ON COLUMN public.dp_incidents.updated_at IS 'Data/hora da última atualização do registro';

-- Create index for updated_at
CREATE INDEX IF NOT EXISTS idx_dp_incidents_updated_at ON public.dp_incidents(updated_at DESC);
