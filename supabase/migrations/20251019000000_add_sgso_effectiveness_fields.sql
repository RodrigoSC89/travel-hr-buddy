-- ===========================
-- SGSO Effectiveness Monitoring Fields
-- Adds fields to track incident categories, action plan dates, resolution, and recurrence
-- ===========================

-- Add effectiveness tracking fields to sgso_incidents table
ALTER TABLE public.sgso_incidents 
ADD COLUMN IF NOT EXISTS sgso_category TEXT CHECK (sgso_category IN ('Erro humano', 'Falha técnica', 'Comunicação', 'Falha organizacional')),
ADD COLUMN IF NOT EXISTS action_plan_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS repeated BOOLEAN DEFAULT false;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_sgso_incidents_category ON public.sgso_incidents(sgso_category);
CREATE INDEX IF NOT EXISTS idx_sgso_incidents_repeated ON public.sgso_incidents(repeated);
CREATE INDEX IF NOT EXISTS idx_sgso_incidents_resolved_at ON public.sgso_incidents(resolved_at);
CREATE INDEX IF NOT EXISTS idx_sgso_incidents_action_plan_date ON public.sgso_incidents(action_plan_date);

-- Add comments
COMMENT ON COLUMN public.sgso_incidents.sgso_category IS 'Category of SGSO incident: Erro humano, Falha técnica, Comunicação, Falha organizacional';
COMMENT ON COLUMN public.sgso_incidents.action_plan_date IS 'Date when action plan was created for this incident';
COMMENT ON COLUMN public.sgso_incidents.resolved_at IS 'Date when incident was resolved';
COMMENT ON COLUMN public.sgso_incidents.repeated IS 'Whether this incident is a repeated occurrence';
