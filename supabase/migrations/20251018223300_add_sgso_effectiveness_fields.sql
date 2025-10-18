-- Add SGSO effectiveness monitoring fields to dp_incidents table
-- This migration adds fields required to track action plan effectiveness

-- Add sgso_category column with check constraint
ALTER TABLE dp_incidents 
ADD COLUMN IF NOT EXISTS sgso_category TEXT 
CHECK (sgso_category IN ('Erro humano', 'Falha técnica', 'Comunicação', 'Falha organizacional'));

-- Add action_plan_date column to track when action plan was created
ALTER TABLE dp_incidents 
ADD COLUMN IF NOT EXISTS action_plan_date TIMESTAMP WITH TIME ZONE;

-- Add resolved_at column to track when incident was resolved
ALTER TABLE dp_incidents 
ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMP WITH TIME ZONE;

-- Add repeated flag to identify repeat incidents
ALTER TABLE dp_incidents 
ADD COLUMN IF NOT EXISTS repeated BOOLEAN DEFAULT false;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_dp_incidents_sgso_category ON dp_incidents(sgso_category);
CREATE INDEX IF NOT EXISTS idx_dp_incidents_action_plan_date ON dp_incidents(action_plan_date);
CREATE INDEX IF NOT EXISTS idx_dp_incidents_resolved_at ON dp_incidents(resolved_at);
CREATE INDEX IF NOT EXISTS idx_dp_incidents_repeated ON dp_incidents(repeated);

-- Add comments for documentation
COMMENT ON COLUMN dp_incidents.sgso_category IS 'SGSO category classification: Erro humano, Falha técnica, Comunicação, Falha organizacional';
COMMENT ON COLUMN dp_incidents.action_plan_date IS 'Date when action plan was created for this incident';
COMMENT ON COLUMN dp_incidents.resolved_at IS 'Date when incident was resolved/closed';
COMMENT ON COLUMN dp_incidents.repeated IS 'Flag indicating if this is a repeat incident';
