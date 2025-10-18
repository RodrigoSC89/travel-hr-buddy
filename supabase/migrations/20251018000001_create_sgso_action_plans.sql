-- ===========================
-- SGSO ACTION PLANS - AI-Generated Action Plans for DP Incidents
-- Table for storing automatically generated action plans from DP incidents
-- with approval workflow for QSMS team
-- ===========================

-- Create sgso_action_plans table
CREATE TABLE IF NOT EXISTS public.sgso_action_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id TEXT NOT NULL REFERENCES public.dp_incidents(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  corrective_action TEXT NOT NULL,
  preventive_action TEXT NOT NULL,
  recommendation TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'approved', 'rejected', 'in_progress', 'completed')),
  status_approval TEXT DEFAULT 'pendente' CHECK (status_approval IN ('pendente', 'aprovado', 'recusado')),
  approval_note TEXT,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.sgso_action_plans ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their organization's action plans"
  ON public.sgso_action_plans FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
    OR auth.role() = 'authenticated'
  );

CREATE POLICY "Users can insert action plans for their organization"
  ON public.sgso_action_plans FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
    OR auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their organization's action plans"
  ON public.sgso_action_plans FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
    OR auth.role() = 'authenticated'
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sgso_action_plans_incident ON public.sgso_action_plans(incident_id);
CREATE INDEX IF NOT EXISTS idx_sgso_action_plans_org ON public.sgso_action_plans(organization_id);
CREATE INDEX IF NOT EXISTS idx_sgso_action_plans_status ON public.sgso_action_plans(status);
CREATE INDEX IF NOT EXISTS idx_sgso_action_plans_status_approval ON public.sgso_action_plans(status_approval);
CREATE INDEX IF NOT EXISTS idx_sgso_action_plans_created_at ON public.sgso_action_plans(created_at DESC);

-- Add table and column comments
COMMENT ON TABLE public.sgso_action_plans IS 'Planos de ação SGSO gerados automaticamente por IA a partir de incidentes DP, com workflow de aprovação';
COMMENT ON COLUMN public.sgso_action_plans.incident_id IS 'ID do incidente DP que gerou este plano de ação';
COMMENT ON COLUMN public.sgso_action_plans.corrective_action IS 'Ação corretiva proposta pela IA';
COMMENT ON COLUMN public.sgso_action_plans.preventive_action IS 'Ação preventiva proposta pela IA';
COMMENT ON COLUMN public.sgso_action_plans.recommendation IS 'Recomendação adicional da IA';
COMMENT ON COLUMN public.sgso_action_plans.status IS 'Status geral do plano de ação';
COMMENT ON COLUMN public.sgso_action_plans.status_approval IS 'Status de aprovação QSMS (pendente, aprovado, recusado)';
COMMENT ON COLUMN public.sgso_action_plans.approval_note IS 'Nota ou comentário da equipe QSMS sobre a aprovação/rejeição';

-- Create trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION update_sgso_action_plans_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_sgso_action_plans_updated_at ON public.sgso_action_plans;
CREATE TRIGGER trigger_update_sgso_action_plans_updated_at
  BEFORE UPDATE ON public.sgso_action_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_sgso_action_plans_updated_at();
