-- ============================================================================
-- ETAPA 33 - Módulo de Conformidade Viva (Live Compliance Module)
-- ============================================================================
-- Creates 5 core tables for automated compliance monitoring and management
-- Includes RLS policies, indexes, and automatic timestamp triggers
-- ============================================================================

-- ============================================================================
-- 1. COMPLIANCE_NON_CONFORMITIES
-- Core table for tracking detected non-conformities from various sources
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.compliance_non_conformities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL CHECK (source_type IN ('dp_incident', 'safety_log', 'forecast', 'manual_report')),
  source_id UUID, -- Reference to the original record (dp_incidents.id, etc.)
  description TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  norm_type TEXT CHECK (norm_type IN ('IMCA', 'ISO', 'ANP', 'IBAMA', 'IMO', 'OTHER')),
  norm_clause TEXT,
  ai_analysis JSONB, -- Stores GPT analysis results
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'false_positive')),
  resolved_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_compliance_nc_vessel ON public.compliance_non_conformities(vessel_id);
CREATE INDEX IF NOT EXISTS idx_compliance_nc_status ON public.compliance_non_conformities(status);
CREATE INDEX IF NOT EXISTS idx_compliance_nc_severity ON public.compliance_non_conformities(severity);
CREATE INDEX IF NOT EXISTS idx_compliance_nc_detected ON public.compliance_non_conformities(detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_compliance_nc_source ON public.compliance_non_conformities(source_type, source_id);

-- RLS Policies
ALTER TABLE public.compliance_non_conformities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view compliance non-conformities"
  ON public.compliance_non_conformities FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admin can manage compliance non-conformities"
  ON public.compliance_non_conformities FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Service role can manage compliance non-conformities"
  ON public.compliance_non_conformities FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================================================
-- 2. COMPLIANCE_CORRECTIVE_ACTIONS
-- Stores AI-generated and manual corrective action plans
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.compliance_corrective_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  non_conformity_id UUID REFERENCES public.compliance_non_conformities(id) ON DELETE CASCADE,
  action_title TEXT NOT NULL,
  action_description TEXT NOT NULL,
  action_steps JSONB, -- Array of steps with details
  responsible_person UUID REFERENCES auth.users(id),
  responsible_role TEXT, -- e.g., 'Captain', 'Chief Engineer', 'DPO'
  deadline TIMESTAMPTZ,
  priority TEXT NOT NULL CHECK (priority IN ('urgent', 'high', 'medium', 'low')),
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'overdue', 'cancelled')),
  completion_notes TEXT,
  completed_at TIMESTAMPTZ,
  resources_required JSONB, -- List of resources, tools, materials needed
  estimated_hours NUMERIC(6, 2),
  actual_hours NUMERIC(6, 2),
  ai_generated BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_compliance_ca_nc ON public.compliance_corrective_actions(non_conformity_id);
CREATE INDEX IF NOT EXISTS idx_compliance_ca_status ON public.compliance_corrective_actions(status);
CREATE INDEX IF NOT EXISTS idx_compliance_ca_deadline ON public.compliance_corrective_actions(deadline);
CREATE INDEX IF NOT EXISTS idx_compliance_ca_responsible ON public.compliance_corrective_actions(responsible_person);

-- RLS Policies
ALTER TABLE public.compliance_corrective_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view corrective actions"
  ON public.compliance_corrective_actions FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admin can manage corrective actions"
  ON public.compliance_corrective_actions FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Service role can manage corrective actions"
  ON public.compliance_corrective_actions FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================================================
-- 3. COMPLIANCE_EVIDENCE
-- Links non-conformities to audit-ready evidence documents
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.compliance_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  non_conformity_id UUID REFERENCES public.compliance_non_conformities(id) ON DELETE CASCADE,
  corrective_action_id UUID REFERENCES public.compliance_corrective_actions(id) ON DELETE CASCADE,
  evidence_type TEXT NOT NULL CHECK (evidence_type IN ('document', 'photo', 'video', 'log', 'certificate', 'report', 'email')),
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  file_name TEXT,
  file_size BIGINT,
  file_type TEXT,
  norm_type TEXT,
  norm_clause TEXT,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,
  metadata JSONB, -- Additional structured data
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_compliance_ev_nc ON public.compliance_evidence(non_conformity_id);
CREATE INDEX IF NOT EXISTS idx_compliance_ev_ca ON public.compliance_evidence(corrective_action_id);
CREATE INDEX IF NOT EXISTS idx_compliance_ev_type ON public.compliance_evidence(evidence_type);
CREATE INDEX IF NOT EXISTS idx_compliance_ev_norm ON public.compliance_evidence(norm_type, norm_clause);

-- RLS Policies
ALTER TABLE public.compliance_evidence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view compliance evidence"
  ON public.compliance_evidence FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admin can manage compliance evidence"
  ON public.compliance_evidence FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Service role can manage compliance evidence"
  ON public.compliance_evidence FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================================================
-- 4. COMPLIANCE_TRAINING_ASSIGNMENTS
-- Links non-conformities to reactive training assignments for crew
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.compliance_training_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  non_conformity_id UUID REFERENCES public.compliance_non_conformities(id) ON DELETE CASCADE,
  training_module_id UUID REFERENCES public.training_modules(id) ON DELETE CASCADE,
  crew_member_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE,
  assigned_reason TEXT,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('urgent', 'high', 'medium', 'low')),
  due_date TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'completed', 'overdue', 'cancelled')),
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  quiz_score INTEGER CHECK (quiz_score >= 0 AND quiz_score <= 100),
  certificate_issued BOOLEAN DEFAULT false,
  certificate_url TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_compliance_ta_nc ON public.compliance_training_assignments(non_conformity_id);
CREATE INDEX IF NOT EXISTS idx_compliance_ta_crew ON public.compliance_training_assignments(crew_member_id);
CREATE INDEX IF NOT EXISTS idx_compliance_ta_vessel ON public.compliance_training_assignments(vessel_id);
CREATE INDEX IF NOT EXISTS idx_compliance_ta_status ON public.compliance_training_assignments(status);
CREATE INDEX IF NOT EXISTS idx_compliance_ta_due ON public.compliance_training_assignments(due_date);

-- RLS Policies
ALTER TABLE public.compliance_training_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their training assignments"
  ON public.compliance_training_assignments FOR SELECT
  USING (auth.uid() = crew_member_id OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin can manage training assignments"
  ON public.compliance_training_assignments FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Service role can manage training assignments"
  ON public.compliance_training_assignments FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================================================
-- 5. COMPLIANCE_SCORE_HISTORY
-- Tracks compliance score over time for trending and analytics
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.compliance_score_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE,
  score NUMERIC(5, 2) NOT NULL CHECK (score >= 0 AND score <= 100),
  total_non_conformities INTEGER NOT NULL DEFAULT 0,
  open_non_conformities INTEGER NOT NULL DEFAULT 0,
  in_progress_non_conformities INTEGER NOT NULL DEFAULT 0,
  resolved_non_conformities INTEGER NOT NULL DEFAULT 0,
  total_corrective_actions INTEGER NOT NULL DEFAULT 0,
  completed_actions INTEGER NOT NULL DEFAULT 0,
  overdue_actions INTEGER NOT NULL DEFAULT 0,
  automation_rate NUMERIC(5, 2), -- Percentage of automated processing
  calculation_details JSONB, -- Breakdown of score calculation
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_compliance_sh_vessel ON public.compliance_score_history(vessel_id);
CREATE INDEX IF NOT EXISTS idx_compliance_sh_calculated ON public.compliance_score_history(calculated_at DESC);
CREATE INDEX IF NOT EXISTS idx_compliance_sh_score ON public.compliance_score_history(score);

-- RLS Policies
ALTER TABLE public.compliance_score_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view compliance score history"
  ON public.compliance_score_history FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admin can manage compliance score history"
  ON public.compliance_score_history FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Service role can manage compliance score history"
  ON public.compliance_score_history FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================================================
-- AUTOMATIC TIMESTAMP TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for all tables
CREATE TRIGGER update_compliance_non_conformities_updated_at
  BEFORE UPDATE ON public.compliance_non_conformities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_compliance_corrective_actions_updated_at
  BEFORE UPDATE ON public.compliance_corrective_actions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_compliance_evidence_updated_at
  BEFORE UPDATE ON public.compliance_evidence
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_compliance_training_assignments_updated_at
  BEFORE UPDATE ON public.compliance_training_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE public.compliance_non_conformities IS 'Core table for tracking non-conformities detected from incidents, logs, forecasts, and manual reports';
COMMENT ON TABLE public.compliance_corrective_actions IS 'AI-generated and manual corrective action plans with tracking and status management';
COMMENT ON TABLE public.compliance_evidence IS 'Audit-ready evidence linking non-conformities to documents, photos, certificates, etc.';
COMMENT ON TABLE public.compliance_training_assignments IS 'Reactive training assignments automatically linked to non-conformities';
COMMENT ON TABLE public.compliance_score_history IS 'Historical compliance scores for trending and analytics';
