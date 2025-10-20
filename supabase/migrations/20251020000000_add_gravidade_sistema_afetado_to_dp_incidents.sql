-- ===========================
-- Add gravidade and sistema_afetado columns to dp_incidents
-- Migration for Etapa 10 - Filtering functionality
-- ===========================

-- Add gravidade column (severity level)
ALTER TABLE public.dp_incidents 
ADD COLUMN IF NOT EXISTS gravidade TEXT CHECK (gravidade IN ('baixo', 'médio', 'alto'));

-- Add sistema_afetado column (affected system)
ALTER TABLE public.dp_incidents 
ADD COLUMN IF NOT EXISTS sistema_afetado TEXT;

-- Create indexes for filtering performance
CREATE INDEX IF NOT EXISTS idx_dp_incidents_gravidade ON public.dp_incidents(gravidade);
CREATE INDEX IF NOT EXISTS idx_dp_incidents_sistema_afetado ON public.dp_incidents(sistema_afetado);

-- Add column comments
COMMENT ON COLUMN public.dp_incidents.gravidade IS 'Nível de gravidade do incidente: baixo, médio, alto';
COMMENT ON COLUMN public.dp_incidents.sistema_afetado IS 'Sistema afetado pelo incidente (ex: DP System, Propulsor, Energia, Navegação)';
