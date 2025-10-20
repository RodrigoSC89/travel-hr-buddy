-- Add gravidade and sistema_afetado columns to dp_incidents table
-- Migration for Etapa 10: Filters for DP Intelligence page

-- Add gravidade column (severity level) with CHECK constraint
ALTER TABLE dp_incidents 
ADD COLUMN IF NOT EXISTS gravidade TEXT CHECK (gravidade IN ('baixo', 'médio', 'alto'));

-- Add sistema_afetado column (affected system)
ALTER TABLE dp_incidents 
ADD COLUMN IF NOT EXISTS sistema_afetado TEXT;

-- Create indexes for better query performance on filter columns
CREATE INDEX IF NOT EXISTS idx_dp_incidents_gravidade ON dp_incidents(gravidade);
CREATE INDEX IF NOT EXISTS idx_dp_incidents_sistema_afetado ON dp_incidents(sistema_afetado);

-- Add comment to document the purpose of these columns
COMMENT ON COLUMN dp_incidents.gravidade IS 'Severity level: baixo, médio, alto';
COMMENT ON COLUMN dp_incidents.sistema_afetado IS 'Affected system: DP System, Propulsor, Energia, Navegação, etc.';
