-- =============================================================================
-- MÓDULO HUMAN FACTORS: ASSESSMENTS TABLE
-- =============================================================================

-- Tabela principal de avaliações HFACS
CREATE TABLE IF NOT EXISTS public.human_factors_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE,
  crew_member_id UUID REFERENCES public.crew_members(id) ON DELETE SET NULL,
  assessment_date TIMESTAMPTZ DEFAULT now(),
  
  -- HFACS Categories (Human Factors Analysis and Classification System)
  unsafe_acts JSONB DEFAULT '[]',
  preconditions JSONB DEFAULT '[]',
  unsafe_supervision JSONB DEFAULT '[]',
  organizational_influences JSONB DEFAULT '[]',
  
  -- Emotional Intelligence Scores (0-100)
  self_awareness_score NUMERIC(5,2) DEFAULT 0,
  self_regulation_score NUMERIC(5,2) DEFAULT 0,
  motivation_score NUMERIC(5,2) DEFAULT 0,
  empathy_score NUMERIC(5,2) DEFAULT 0,
  social_skills_score NUMERIC(5,2) DEFAULT 0,
  overall_eq_score NUMERIC(5,2) DEFAULT 0,
  
  -- Fatigue & Stress Indicators
  fatigue_level TEXT CHECK (fatigue_level IN ('low', 'moderate', 'high', 'critical')),
  stress_level TEXT CHECK (stress_level IN ('low', 'moderate', 'high', 'critical')),
  hours_worked_24h NUMERIC(5,2) DEFAULT 0,
  hours_rest_24h NUMERIC(5,2) DEFAULT 0,
  days_on_duty INTEGER DEFAULT 0,
  
  -- AI Analysis
  ai_analysis JSONB DEFAULT '{}',
  risk_factors JSONB DEFAULT '[]',
  recommendations JSONB DEFAULT '[]',
  confidence_score NUMERIC(5,2) DEFAULT 0,
  
  -- Status & Metadata
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'in_progress', 'completed', 'requires_review')),
  assessed_by UUID,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_hf_assessments_org ON public.human_factors_assessments(organization_id);
CREATE INDEX IF NOT EXISTS idx_hf_assessments_vessel ON public.human_factors_assessments(vessel_id);
CREATE INDEX IF NOT EXISTS idx_hf_assessments_crew ON public.human_factors_assessments(crew_member_id);
CREATE INDEX IF NOT EXISTS idx_hf_assessments_date ON public.human_factors_assessments(assessment_date DESC);
CREATE INDEX IF NOT EXISTS idx_hf_assessments_fatigue ON public.human_factors_assessments(fatigue_level) WHERE fatigue_level IN ('high', 'critical');

-- Enable RLS
ALTER TABLE public.human_factors_assessments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own org assessments"
  ON public.human_factors_assessments
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_users 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can insert own org assessments"
  ON public.human_factors_assessments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.organization_users 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can update own org assessments"
  ON public.human_factors_assessments
  FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_users 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION public.update_hf_assessments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trigger_hf_assessments_updated_at
  BEFORE UPDATE ON public.human_factors_assessments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_hf_assessments_updated_at();