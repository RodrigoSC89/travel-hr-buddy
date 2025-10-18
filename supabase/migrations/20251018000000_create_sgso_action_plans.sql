-- ===========================
-- SGSO ACTION PLANS - Sistema de Gestão de Segurança Operacional
-- Table for storing action plans for DP incidents
-- ===========================

-- Add new columns to dp_incidents table if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'dp_incidents' AND column_name = 'description') THEN
    ALTER TABLE public.dp_incidents ADD COLUMN description TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'dp_incidents' AND column_name = 'sgso_category') THEN
    ALTER TABLE public.dp_incidents ADD COLUMN sgso_category TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'dp_incidents' AND column_name = 'sgso_risk_level') THEN
    ALTER TABLE public.dp_incidents ADD COLUMN sgso_risk_level TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'dp_incidents' AND column_name = 'updated_at') THEN
    ALTER TABLE public.dp_incidents ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
  END IF;
END $$;

-- Create sgso_action_plans table
CREATE TABLE IF NOT EXISTS public.sgso_action_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE,
  incident_id TEXT REFERENCES public.dp_incidents(id) ON DELETE CASCADE,
  corrective_action TEXT,
  preventive_action TEXT,
  recommendation TEXT,
  status TEXT DEFAULT 'aberto' CHECK (status IN ('aberto', 'em_andamento', 'resolvido')),
  approved_by TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.sgso_action_plans ENABLE ROW LEVEL SECURITY;

-- Create RLS policy - authenticated users can read
CREATE POLICY "Allow read access to authenticated users"
  ON public.sgso_action_plans 
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Create RLS policy - authenticated users can insert
CREATE POLICY "Allow insert access to authenticated users"
  ON public.sgso_action_plans 
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Create RLS policy - authenticated users can update
CREATE POLICY "Allow update access to authenticated users"
  ON public.sgso_action_plans 
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_sgso_action_plans_vessel_id ON public.sgso_action_plans(vessel_id);
CREATE INDEX IF NOT EXISTS idx_sgso_action_plans_incident_id ON public.sgso_action_plans(incident_id);
CREATE INDEX IF NOT EXISTS idx_sgso_action_plans_status ON public.sgso_action_plans(status);
CREATE INDEX IF NOT EXISTS idx_sgso_action_plans_created_at ON public.sgso_action_plans(created_at DESC);

-- Add table comment
COMMENT ON TABLE public.sgso_action_plans IS 'Tabela para armazenamento de planos de ação SGSO relacionados a incidentes de DP';

-- Add column comments
COMMENT ON COLUMN public.sgso_action_plans.id IS 'Identificador único do plano de ação';
COMMENT ON COLUMN public.sgso_action_plans.vessel_id IS 'Referência à embarcação relacionada';
COMMENT ON COLUMN public.sgso_action_plans.incident_id IS 'Referência ao incidente de DP';
COMMENT ON COLUMN public.sgso_action_plans.corrective_action IS 'Ação corretiva aplicada';
COMMENT ON COLUMN public.sgso_action_plans.preventive_action IS 'Ação preventiva para evitar recorrência';
COMMENT ON COLUMN public.sgso_action_plans.recommendation IS 'Recomendação adicional (gerada por IA ou manual)';
COMMENT ON COLUMN public.sgso_action_plans.status IS 'Status da execução: aberto, em_andamento, resolvido';
COMMENT ON COLUMN public.sgso_action_plans.approved_by IS 'Nome do aprovador';
COMMENT ON COLUMN public.sgso_action_plans.approved_at IS 'Data e hora da aprovação';
COMMENT ON COLUMN public.sgso_action_plans.created_at IS 'Data/hora de criação do registro';
COMMENT ON COLUMN public.sgso_action_plans.updated_at IS 'Data/hora da última atualização';

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_sgso_action_plans_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_sgso_action_plans_updated_at
  BEFORE UPDATE ON public.sgso_action_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_sgso_action_plans_updated_at();

-- Create trigger to update dp_incidents updated_at timestamp
CREATE OR REPLACE FUNCTION update_dp_incidents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_dp_incidents_updated_at ON public.dp_incidents;
CREATE TRIGGER trigger_update_dp_incidents_updated_at
  BEFORE UPDATE ON public.dp_incidents
  FOR EACH ROW
  EXECUTE FUNCTION update_dp_incidents_updated_at();
