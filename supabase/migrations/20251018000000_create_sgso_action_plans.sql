-- ===========================
-- Create SGSO Action Plans Table
-- Tracks corrective, preventive, and recommendation actions by vessel and incident
-- ===========================

-- Create sgso_action_plans table
CREATE TABLE IF NOT EXISTS public.sgso_action_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID REFERENCES public.vessels(id),
  incident_id UUID REFERENCES public.dp_incidents(id),
  corrective_action TEXT,
  preventive_action TEXT,
  recommendation TEXT,
  status TEXT DEFAULT 'aberto' CHECK (status IN ('aberto', 'em_andamento', 'resolvido')),
  approved_by TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add SGSO classification fields to dp_incidents if they don't exist
ALTER TABLE public.dp_incidents 
ADD COLUMN IF NOT EXISTS sgso_category TEXT;

ALTER TABLE public.dp_incidents
ADD COLUMN IF NOT EXISTS sgso_risk_level TEXT;

-- Enable Row Level Security (RLS)
ALTER TABLE public.sgso_action_plans ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for sgso_action_plans
CREATE POLICY "Allow authenticated users to read sgso_action_plans"
  ON public.sgso_action_plans
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert sgso_action_plans"
  ON public.sgso_action_plans
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update sgso_action_plans"
  ON public.sgso_action_plans
  FOR UPDATE
  TO authenticated
  USING (true);

-- Create performance indexes
CREATE INDEX IF NOT EXISTS idx_sgso_action_plans_vessel_id ON public.sgso_action_plans(vessel_id);
CREATE INDEX IF NOT EXISTS idx_sgso_action_plans_incident_id ON public.sgso_action_plans(incident_id);
CREATE INDEX IF NOT EXISTS idx_sgso_action_plans_status ON public.sgso_action_plans(status);
CREATE INDEX IF NOT EXISTS idx_sgso_action_plans_created_at ON public.sgso_action_plans(created_at DESC);

-- Create indexes for dp_incidents SGSO fields
CREATE INDEX IF NOT EXISTS idx_dp_incidents_sgso_category ON public.dp_incidents(sgso_category);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_sgso_action_plans_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create updated_at trigger
CREATE TRIGGER update_sgso_action_plans_updated_at
  BEFORE UPDATE ON public.sgso_action_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_sgso_action_plans_updated_at();

-- Add column comments
COMMENT ON TABLE public.sgso_action_plans IS 'Planos de ação SGSO com rastreabilidade completa por embarcação e incidente';
COMMENT ON COLUMN public.sgso_action_plans.corrective_action IS 'Ação corretiva para o incidente';
COMMENT ON COLUMN public.sgso_action_plans.preventive_action IS 'Ação preventiva para evitar recorrência';
COMMENT ON COLUMN public.sgso_action_plans.recommendation IS 'Recomendações adicionais';
COMMENT ON COLUMN public.sgso_action_plans.status IS 'Status: aberto, em_andamento, resolvido';
COMMENT ON COLUMN public.sgso_action_plans.approved_by IS 'Nome e cargo do aprovador';
COMMENT ON COLUMN public.sgso_action_plans.approved_at IS 'Data/hora da aprovação';
