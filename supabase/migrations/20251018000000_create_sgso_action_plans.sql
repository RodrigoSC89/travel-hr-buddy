-- ===========================
-- SGSO Action Plans Table
-- Complete action plan tracking for QSMS compliance and external audits (IBAMA/IMCA)
-- ===========================

-- Create sgso_action_plans table
CREATE TABLE IF NOT EXISTS public.sgso_action_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL REFERENCES public.dp_incidents(id) ON DELETE CASCADE,
  vessel_id TEXT NOT NULL,
  
  -- Action plan details
  correction_action TEXT,
  prevention_action TEXT,
  recommendation_action TEXT,
  
  -- Status workflow: aberto → em_andamento → resolvido
  status TEXT NOT NULL DEFAULT 'aberto' CHECK (status IN ('aberto', 'em_andamento', 'resolvido')),
  
  -- Approval documentation
  approved_by TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add SGSO classification fields to dp_incidents if not exists
ALTER TABLE public.dp_incidents 
ADD COLUMN IF NOT EXISTS sgso_category TEXT;

COMMENT ON COLUMN public.dp_incidents.sgso_category IS 'Categoria SGSO do incidente (Equipamento, Sistema, Energia, etc.)';

-- Add RLS (Row Level Security) policies
ALTER TABLE public.sgso_action_plans ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all action plans
CREATE POLICY "Allow authenticated users to read sgso_action_plans"
  ON public.sgso_action_plans
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert action plans
CREATE POLICY "Allow authenticated users to insert sgso_action_plans"
  ON public.sgso_action_plans
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update action plans
CREATE POLICY "Allow authenticated users to update sgso_action_plans"
  ON public.sgso_action_plans
  FOR UPDATE
  TO authenticated
  USING (true);

-- Performance-optimized indexes on key columns
CREATE INDEX IF NOT EXISTS idx_sgso_action_plans_incident_id ON public.sgso_action_plans(incident_id);
CREATE INDEX IF NOT EXISTS idx_sgso_action_plans_vessel_id ON public.sgso_action_plans(vessel_id);
CREATE INDEX IF NOT EXISTS idx_sgso_action_plans_status ON public.sgso_action_plans(status);
CREATE INDEX IF NOT EXISTS idx_sgso_action_plans_created_at ON public.sgso_action_plans(created_at DESC);

-- Automatic timestamp trigger
CREATE OR REPLACE FUNCTION update_sgso_action_plans_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_sgso_action_plans_updated_at
  BEFORE UPDATE ON public.sgso_action_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_sgso_action_plans_updated_at();

-- Add comments for documentation
COMMENT ON TABLE public.sgso_action_plans IS 'Rastreamento completo de planos de ação para compliance QSMS e auditorias externas';
COMMENT ON COLUMN public.sgso_action_plans.status IS 'Status do plano: aberto (inicial), em_andamento (em execução), resolvido (concluído)';
COMMENT ON COLUMN public.sgso_action_plans.approved_by IS 'Nome e função de quem aprovou o plano de ação';
COMMENT ON COLUMN public.sgso_action_plans.approved_at IS 'Data e hora da aprovação do plano';
