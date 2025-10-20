-- ===========================
-- Add crawler fields to dp_incidents table
-- Adds link_original and sistema_afetado for IMCA crawler integration
-- ===========================

-- Add link_original column to store the original incident URL
ALTER TABLE public.dp_incidents 
ADD COLUMN IF NOT EXISTS link_original TEXT;

-- Add sistema_afetado column (optional, detected via NLP or text pattern)
ALTER TABLE public.dp_incidents 
ADD COLUMN IF NOT EXISTS sistema_afetado TEXT;

-- Create index for link_original to prevent duplicates quickly
CREATE INDEX IF NOT EXISTS idx_dp_incidents_link_original ON public.dp_incidents(link_original);

-- Add column comments
COMMENT ON COLUMN public.dp_incidents.link_original IS 'URL completa da fonte original do incidente (IMCA, etc)';
COMMENT ON COLUMN public.dp_incidents.sistema_afetado IS 'Sistema ou equipamento afetado pelo incidente (detectado via NLP ou padrão textual)';
