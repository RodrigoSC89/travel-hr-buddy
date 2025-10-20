-- ===========================
-- Add link_original and sistema_afetado to dp_incidents
-- Required for IMCA crawler to store original source links and affected systems
-- ===========================

-- Add link_original column to dp_incidents table
ALTER TABLE public.dp_incidents 
ADD COLUMN IF NOT EXISTS link_original TEXT;

-- Add sistema_afetado column to dp_incidents table
ALTER TABLE public.dp_incidents 
ADD COLUMN IF NOT EXISTS sistema_afetado TEXT;

-- Add comments for new columns
COMMENT ON COLUMN public.dp_incidents.link_original IS 'URL da fonte original do incidente (ex: IMCA website)';
COMMENT ON COLUMN public.dp_incidents.sistema_afetado IS 'Sistema afetado identificado no incidente (ex: DP, Thruster, Power Management)';

-- Create index for performance on link_original queries (for duplicate checking)
CREATE INDEX IF NOT EXISTS idx_dp_incidents_link_original ON public.dp_incidents(link_original);

-- Create index for performance on sistema_afetado queries
CREATE INDEX IF NOT EXISTS idx_dp_incidents_sistema_afetado ON public.dp_incidents(sistema_afetado);
