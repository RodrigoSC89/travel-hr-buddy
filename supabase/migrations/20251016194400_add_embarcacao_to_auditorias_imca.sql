-- Add embarcacao column to auditorias_imca table
-- This column will store the vessel/ship name associated with the audit

ALTER TABLE public.auditorias_imca 
ADD COLUMN IF NOT EXISTS embarcacao TEXT;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_auditorias_imca_embarcacao 
ON public.auditorias_imca(embarcacao);

-- Add comment to describe the column
COMMENT ON COLUMN public.auditorias_imca.embarcacao IS 'Nome da embarcação/navio associado à auditoria';
