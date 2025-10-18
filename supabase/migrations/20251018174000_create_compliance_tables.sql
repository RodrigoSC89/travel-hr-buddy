-- =====================================================
-- ETAPA 33: Live Compliance Module - Database Schema
-- =====================================================
-- Creates tables for AI-powered maritime compliance automation
-- Tracks non-conformities, corrective actions, evidence, training, and scores

-- =====================================================
-- Table: compliance_non_conformities
-- =====================================================
-- Core tracking of detected compliance issues
CREATE TABLE IF NOT EXISTS public.compliance_non_conformities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type TEXT NOT NULL CHECK (source_type IN ('dp_incident', 'safety_log', 'forecast', 'manual')),
  source_id UUID,
  vessel_id UUID,
  vessel_name TEXT,
  description TEXT NOT NULL,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'archived')),
  matched_norms JSONB, -- Array of {norm_type, clause, description, confidence}
  ai_analysis TEXT,
  assigned_to UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  tenant_id UUID NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_compliance_nc_tenant ON public.compliance_non_conformities(tenant_id);
CREATE INDEX IF NOT EXISTS idx_compliance_nc_vessel ON public.compliance_non_conformities(vessel_id);
CREATE INDEX IF NOT EXISTS idx_compliance_nc_status ON public.compliance_non_conformities(status);
CREATE INDEX IF NOT EXISTS idx_compliance_nc_severity ON public.compliance_non_conformities(severity);
CREATE INDEX IF NOT EXISTS idx_compliance_nc_detected ON public.compliance_non_conformities(detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_compliance_nc_source ON public.compliance_non_conformities(source_type, source_id);

-- RLS Policies
ALTER TABLE public.compliance_non_conformities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their tenant's non-conformities" ON public.compliance_non_conformities
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage non-conformities" ON public.compliance_non_conformities
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
      AND tenant_id = compliance_non_conformities.tenant_id
    )
  );

CREATE POLICY "Service role can manage non-conformities" ON public.compliance_non_conformities
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- =====================================================
-- Table: compliance_corrective_actions
-- =====================================================
-- Action plan management for resolving non-conformities
CREATE TABLE IF NOT EXISTS public.compliance_corrective_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  non_conformity_id UUID NOT NULL REFERENCES public.compliance_non_conformities(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('immediate', 'preventive', 'corrective', 'monitoring')),
  priority TEXT NOT NULL CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  assigned_to UUID REFERENCES auth.users(id),
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  resources_required TEXT,
  estimated_hours NUMERIC,
  actual_hours NUMERIC,
  completion_notes TEXT,
  verification_required BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  tenant_id UUID NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_compliance_ca_tenant ON public.compliance_corrective_actions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_compliance_ca_nc ON public.compliance_corrective_actions(non_conformity_id);
CREATE INDEX IF NOT EXISTS idx_compliance_ca_status ON public.compliance_corrective_actions(status);
CREATE INDEX IF NOT EXISTS idx_compliance_ca_due ON public.compliance_corrective_actions(due_date);
CREATE INDEX IF NOT EXISTS idx_compliance_ca_assigned ON public.compliance_corrective_actions(assigned_to);

-- RLS Policies
ALTER TABLE public.compliance_corrective_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their tenant's corrective actions" ON public.compliance_corrective_actions
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage corrective actions" ON public.compliance_corrective_actions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
      AND tenant_id = compliance_corrective_actions.tenant_id
    )
  );

CREATE POLICY "Service role can manage corrective actions" ON public.compliance_corrective_actions
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- =====================================================
-- Table: compliance_evidence
-- =====================================================
-- Audit trail documentation linking to evidence
CREATE TABLE IF NOT EXISTS public.compliance_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  non_conformity_id UUID NOT NULL REFERENCES public.compliance_non_conformities(id) ON DELETE CASCADE,
  evidence_type TEXT NOT NULL CHECK (evidence_type IN ('document', 'certificate', 'photo', 'video', 'log', 'report')),
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  file_type TEXT,
  file_size BIGINT,
  norm_reference TEXT, -- e.g., "IMCA M 103 Rev. 2 - Section 4.2.1"
  collected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  collected_by UUID REFERENCES auth.users(id),
  metadata JSONB, -- Additional structured data
  created_at TIMESTAMPTZ DEFAULT NOW(),
  tenant_id UUID NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_compliance_ev_tenant ON public.compliance_evidence(tenant_id);
CREATE INDEX IF NOT EXISTS idx_compliance_ev_nc ON public.compliance_evidence(non_conformity_id);
CREATE INDEX IF NOT EXISTS idx_compliance_ev_type ON public.compliance_evidence(evidence_type);
CREATE INDEX IF NOT EXISTS idx_compliance_ev_collected ON public.compliance_evidence(collected_at DESC);

-- RLS Policies
ALTER TABLE public.compliance_evidence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their tenant's evidence" ON public.compliance_evidence
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage evidence" ON public.compliance_evidence
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
      AND tenant_id = compliance_evidence.tenant_id
    )
  );

CREATE POLICY "Service role can manage evidence" ON public.compliance_evidence
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- =====================================================
-- Table: compliance_training_assignments
-- =====================================================
-- Training correlation and tracking
CREATE TABLE IF NOT EXISTS public.compliance_training_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  non_conformity_id UUID NOT NULL REFERENCES public.compliance_non_conformities(id) ON DELETE CASCADE,
  training_type TEXT NOT NULL,
  training_title TEXT NOT NULL,
  training_description TEXT,
  assigned_to UUID NOT NULL REFERENCES auth.users(id),
  vessel_id UUID,
  due_date TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'completed', 'expired')),
  completed_at TIMESTAMPTZ,
  certificate_id UUID,
  certificate_issued_at TIMESTAMPTZ,
  certificate_expires_at TIMESTAMPTZ,
  score NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  tenant_id UUID NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_compliance_ta_tenant ON public.compliance_training_assignments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_compliance_ta_nc ON public.compliance_training_assignments(non_conformity_id);
CREATE INDEX IF NOT EXISTS idx_compliance_ta_assigned ON public.compliance_training_assignments(assigned_to);
CREATE INDEX IF NOT EXISTS idx_compliance_ta_vessel ON public.compliance_training_assignments(vessel_id);
CREATE INDEX IF NOT EXISTS idx_compliance_ta_status ON public.compliance_training_assignments(status);
CREATE INDEX IF NOT EXISTS idx_compliance_ta_due ON public.compliance_training_assignments(due_date);

-- RLS Policies
ALTER TABLE public.compliance_training_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their tenant's training assignments" ON public.compliance_training_assignments
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage training assignments" ON public.compliance_training_assignments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
      AND tenant_id = compliance_training_assignments.tenant_id
    )
  );

CREATE POLICY "Service role can manage training assignments" ON public.compliance_training_assignments
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- =====================================================
-- Table: compliance_score_history
-- =====================================================
-- Historical tracking of compliance scores
CREATE TABLE IF NOT EXISTS public.compliance_score_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  vessel_id UUID,
  score NUMERIC NOT NULL CHECK (score >= 0 AND score <= 100),
  total_non_conformities INTEGER NOT NULL DEFAULT 0,
  open_non_conformities INTEGER NOT NULL DEFAULT 0,
  resolved_non_conformities INTEGER NOT NULL DEFAULT 0,
  overdue_actions INTEGER NOT NULL DEFAULT 0,
  automation_rate NUMERIC, -- Percentage of automated processing
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB -- Additional breakdown data
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_compliance_sh_tenant ON public.compliance_score_history(tenant_id);
CREATE INDEX IF NOT EXISTS idx_compliance_sh_vessel ON public.compliance_score_history(vessel_id);
CREATE INDEX IF NOT EXISTS idx_compliance_sh_calculated ON public.compliance_score_history(calculated_at DESC);

-- RLS Policies
ALTER TABLE public.compliance_score_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their tenant's score history" ON public.compliance_score_history
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage score history" ON public.compliance_score_history
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
      AND tenant_id = compliance_score_history.tenant_id
    )
  );

CREATE POLICY "Service role can manage score history" ON public.compliance_score_history
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- =====================================================
-- Triggers for automatic timestamp updates
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_compliance_nc_updated_at
  BEFORE UPDATE ON public.compliance_non_conformities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_compliance_ca_updated_at
  BEFORE UPDATE ON public.compliance_corrective_actions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_compliance_ta_updated_at
  BEFORE UPDATE ON public.compliance_training_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Comments for documentation
-- =====================================================
COMMENT ON TABLE public.compliance_non_conformities IS 'ETAPA 33: Core tracking of detected compliance issues with AI analysis';
COMMENT ON TABLE public.compliance_corrective_actions IS 'ETAPA 33: Action plan management for resolving non-conformities';
COMMENT ON TABLE public.compliance_evidence IS 'ETAPA 33: Audit trail documentation linking to evidence';
COMMENT ON TABLE public.compliance_training_assignments IS 'ETAPA 33: Training correlation and tracking for crew members';
COMMENT ON TABLE public.compliance_score_history IS 'ETAPA 33: Historical tracking of compliance scores over time';
