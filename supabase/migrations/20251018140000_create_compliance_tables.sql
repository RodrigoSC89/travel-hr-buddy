-- ===========================
-- COMPLIANCE VIVA - Live Compliance Module
-- Tables for continuous compliance monitoring and automation
-- ETAPA 33 - Módulo de Conformidade Viva
-- ===========================

-- 1. COMPLIANCE NON-CONFORMITIES - Store detected non-conformities
CREATE TABLE IF NOT EXISTS public.compliance_non_conformities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  
  -- Source of non-conformity
  source_type TEXT NOT NULL CHECK (source_type IN ('log', 'incident', 'forecast', 'manual', 'audit')),
  source_id UUID, -- Reference to original log/incident/forecast
  
  -- Non-conformity details
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  status TEXT NOT NULL DEFAULT 'detected' CHECK (status IN ('detected', 'analyzing', 'action_planned', 'in_progress', 'resolved', 'closed')),
  
  -- Related entities
  vessel_id UUID REFERENCES public.vessels(id),
  crew_id UUID REFERENCES public.crew_members(id),
  
  -- Norm/regulation correlation
  norm_type TEXT, -- e.g., 'IMCA', 'IBAMA', 'ANP', 'ISO'
  norm_reference TEXT, -- e.g., 'IMCA M 103', 'ISO 9001:2015 - 8.5.1'
  norm_clause TEXT, -- Specific clause or section
  
  -- Detection metadata
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  detected_by TEXT, -- 'system' or user_id
  detection_method TEXT, -- e.g., 'ai_analysis', 'log_correlation', 'manual_report'
  
  -- AI Analysis
  ai_analysis JSONB DEFAULT '{}', -- AI-generated analysis and recommendations
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. COMPLIANCE CORRECTIVE ACTIONS - Store corrective action plans
CREATE TABLE IF NOT EXISTS public.compliance_corrective_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  non_conformity_id UUID REFERENCES public.compliance_non_conformities(id) ON DELETE CASCADE,
  
  -- Action plan details
  action_type TEXT NOT NULL CHECK (action_type IN ('immediate', 'corrective', 'preventive', 'training')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  plan_details JSONB DEFAULT '{}', -- Structured action plan
  
  -- Responsibility
  responsible_user_id UUID REFERENCES auth.users(id),
  responsible_role TEXT, -- e.g., 'Captain', 'Chief Engineer', 'DPO'
  
  -- Timeline
  planned_start_date TIMESTAMP WITH TIME ZONE,
  planned_completion_date TIMESTAMP WITH TIME ZONE,
  actual_start_date TIMESTAMP WITH TIME ZONE,
  actual_completion_date TIMESTAMP WITH TIME ZONE,
  
  -- Status and priority
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'pending_verification', 'completed', 'cancelled')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  
  -- Documentation
  documentation_url TEXT,
  attachments JSONB DEFAULT '[]',
  
  -- Verification
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  verification_notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. COMPLIANCE EVIDENCE - Store evidence links for audits
CREATE TABLE IF NOT EXISTS public.compliance_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  
  -- Link to action or non-conformity
  non_conformity_id UUID REFERENCES public.compliance_non_conformities(id) ON DELETE CASCADE,
  corrective_action_id UUID REFERENCES public.compliance_corrective_actions(id) ON DELETE CASCADE,
  
  -- Evidence details
  evidence_type TEXT NOT NULL CHECK (evidence_type IN ('document', 'certificate', 'photo', 'video', 'log_entry', 'training_record', 'inspection_report', 'other')),
  title TEXT NOT NULL,
  description TEXT,
  
  -- Norm reference
  norm_type TEXT,
  norm_reference TEXT,
  norm_clause TEXT,
  
  -- File/URL reference
  file_url TEXT,
  file_metadata JSONB DEFAULT '{}', -- size, type, checksum, etc.
  
  -- Audit trail
  uploaded_by UUID REFERENCES auth.users(id),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  
  -- Categorization
  tags TEXT[],
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. COMPLIANCE TRAINING ASSIGNMENTS - Link trainings to non-conformities
CREATE TABLE IF NOT EXISTS public.compliance_training_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  
  -- Link to non-conformity that triggered training
  non_conformity_id UUID REFERENCES public.compliance_non_conformities(id) ON DELETE CASCADE,
  
  -- Training details
  training_id UUID REFERENCES public.sgso_training_records(id),
  training_title TEXT NOT NULL,
  training_type TEXT NOT NULL,
  training_description TEXT,
  
  -- Assignment
  crew_member_id UUID REFERENCES public.crew_members(id) ON DELETE CASCADE,
  vessel_id UUID REFERENCES public.vessels(id),
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Scheduling
  scheduled_date TIMESTAMP WITH TIME ZONE,
  due_date TIMESTAMP WITH TIME ZONE,
  
  -- Completion
  status TEXT NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned', 'scheduled', 'in_progress', 'completed', 'overdue', 'cancelled')),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Certificate/Quiz
  quiz_score NUMERIC CHECK (quiz_score >= 0 AND quiz_score <= 100),
  certificate_issued BOOLEAN DEFAULT false,
  certificate_url TEXT,
  certificate_issued_at TIMESTAMP WITH TIME ZONE,
  
  -- Norm reference
  norm_type TEXT,
  norm_reference TEXT,
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. COMPLIANCE SCORE HISTORY - Track compliance scores over time
CREATE TABLE IF NOT EXISTS public.compliance_score_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  vessel_id UUID REFERENCES public.vessels(id),
  
  -- Score details
  score NUMERIC NOT NULL CHECK (score >= 0 AND score <= 100),
  score_type TEXT NOT NULL CHECK (score_type IN ('overall', 'by_norm', 'by_vessel', 'by_practice')),
  
  -- Context
  norm_type TEXT, -- For score_type = 'by_norm'
  practice_id UUID, -- For score_type = 'by_practice'
  
  -- Breakdown
  total_conformities INTEGER DEFAULT 0,
  total_non_conformities INTEGER DEFAULT 0,
  open_actions INTEGER DEFAULT 0,
  closed_actions INTEGER DEFAULT 0,
  overdue_actions INTEGER DEFAULT 0,
  
  -- Metadata
  calculation_method TEXT,
  calculation_details JSONB DEFAULT '{}',
  
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ===========================
-- INDEXES for better performance
-- ===========================

-- Non-conformities indexes
CREATE INDEX IF NOT EXISTS idx_compliance_non_conformities_org ON public.compliance_non_conformities(organization_id);
CREATE INDEX IF NOT EXISTS idx_compliance_non_conformities_vessel ON public.compliance_non_conformities(vessel_id);
CREATE INDEX IF NOT EXISTS idx_compliance_non_conformities_status ON public.compliance_non_conformities(status);
CREATE INDEX IF NOT EXISTS idx_compliance_non_conformities_severity ON public.compliance_non_conformities(severity);
CREATE INDEX IF NOT EXISTS idx_compliance_non_conformities_norm ON public.compliance_non_conformities(norm_type, norm_reference);
CREATE INDEX IF NOT EXISTS idx_compliance_non_conformities_detected ON public.compliance_non_conformities(detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_compliance_non_conformities_source ON public.compliance_non_conformities(source_type, source_id);

-- Corrective actions indexes
CREATE INDEX IF NOT EXISTS idx_compliance_corrective_actions_org ON public.compliance_corrective_actions(organization_id);
CREATE INDEX IF NOT EXISTS idx_compliance_corrective_actions_nonconf ON public.compliance_corrective_actions(non_conformity_id);
CREATE INDEX IF NOT EXISTS idx_compliance_corrective_actions_status ON public.compliance_corrective_actions(status);
CREATE INDEX IF NOT EXISTS idx_compliance_corrective_actions_responsible ON public.compliance_corrective_actions(responsible_user_id);
CREATE INDEX IF NOT EXISTS idx_compliance_corrective_actions_dates ON public.compliance_corrective_actions(planned_completion_date);

-- Evidence indexes
CREATE INDEX IF NOT EXISTS idx_compliance_evidence_org ON public.compliance_evidence(organization_id);
CREATE INDEX IF NOT EXISTS idx_compliance_evidence_nonconf ON public.compliance_evidence(non_conformity_id);
CREATE INDEX IF NOT EXISTS idx_compliance_evidence_action ON public.compliance_evidence(corrective_action_id);
CREATE INDEX IF NOT EXISTS idx_compliance_evidence_norm ON public.compliance_evidence(norm_type, norm_reference);
CREATE INDEX IF NOT EXISTS idx_compliance_evidence_verified ON public.compliance_evidence(is_verified);

-- Training assignments indexes
CREATE INDEX IF NOT EXISTS idx_compliance_training_org ON public.compliance_training_assignments(organization_id);
CREATE INDEX IF NOT EXISTS idx_compliance_training_nonconf ON public.compliance_training_assignments(non_conformity_id);
CREATE INDEX IF NOT EXISTS idx_compliance_training_crew ON public.compliance_training_assignments(crew_member_id);
CREATE INDEX IF NOT EXISTS idx_compliance_training_vessel ON public.compliance_training_assignments(vessel_id);
CREATE INDEX IF NOT EXISTS idx_compliance_training_status ON public.compliance_training_assignments(status);
CREATE INDEX IF NOT EXISTS idx_compliance_training_due ON public.compliance_training_assignments(due_date);

-- Score history indexes
CREATE INDEX IF NOT EXISTS idx_compliance_score_org ON public.compliance_score_history(organization_id);
CREATE INDEX IF NOT EXISTS idx_compliance_score_vessel ON public.compliance_score_history(vessel_id);
CREATE INDEX IF NOT EXISTS idx_compliance_score_recorded ON public.compliance_score_history(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_compliance_score_type ON public.compliance_score_history(score_type);

-- ===========================
-- ROW LEVEL SECURITY (RLS)
-- ===========================

-- Enable RLS on all tables
ALTER TABLE public.compliance_non_conformities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_corrective_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_training_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_score_history ENABLE ROW LEVEL SECURITY;

-- Policies for compliance_non_conformities
CREATE POLICY "Authenticated users can view compliance non-conformities"
  ON public.compliance_non_conformities FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert compliance non-conformities"
  ON public.compliance_non_conformities FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their organization's non-conformities"
  ON public.compliance_non_conformities FOR UPDATE
  TO authenticated
  USING (true);

-- Policies for compliance_corrective_actions
CREATE POLICY "Authenticated users can view corrective actions"
  ON public.compliance_corrective_actions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert corrective actions"
  ON public.compliance_corrective_actions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update corrective actions"
  ON public.compliance_corrective_actions FOR UPDATE
  TO authenticated
  USING (true);

-- Policies for compliance_evidence
CREATE POLICY "Authenticated users can view evidence"
  ON public.compliance_evidence FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert evidence"
  ON public.compliance_evidence FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update evidence"
  ON public.compliance_evidence FOR UPDATE
  TO authenticated
  USING (true);

-- Policies for compliance_training_assignments
CREATE POLICY "Authenticated users can view training assignments"
  ON public.compliance_training_assignments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert training assignments"
  ON public.compliance_training_assignments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update training assignments"
  ON public.compliance_training_assignments FOR UPDATE
  TO authenticated
  USING (true);

-- Policies for compliance_score_history
CREATE POLICY "Authenticated users can view compliance scores"
  ON public.compliance_score_history FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can insert compliance scores"
  ON public.compliance_score_history FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ===========================
-- TRIGGERS for updated_at
-- ===========================

-- Function for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_compliance_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables
CREATE TRIGGER update_compliance_non_conformities_updated_at
  BEFORE UPDATE ON public.compliance_non_conformities
  FOR EACH ROW
  EXECUTE FUNCTION update_compliance_updated_at();

CREATE TRIGGER update_compliance_corrective_actions_updated_at
  BEFORE UPDATE ON public.compliance_corrective_actions
  FOR EACH ROW
  EXECUTE FUNCTION update_compliance_updated_at();

CREATE TRIGGER update_compliance_evidence_updated_at
  BEFORE UPDATE ON public.compliance_evidence
  FOR EACH ROW
  EXECUTE FUNCTION update_compliance_updated_at();

CREATE TRIGGER update_compliance_training_assignments_updated_at
  BEFORE UPDATE ON public.compliance_training_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_compliance_updated_at();

-- ===========================
-- COMMENTS for documentation
-- ===========================

COMMENT ON TABLE public.compliance_non_conformities IS 'Stores detected non-conformities from logs, incidents, forecasts, and manual reports';
COMMENT ON TABLE public.compliance_corrective_actions IS 'Stores corrective action plans generated for non-conformities';
COMMENT ON TABLE public.compliance_evidence IS 'Stores evidence links for audit trail and compliance verification';
COMMENT ON TABLE public.compliance_training_assignments IS 'Links training assignments to non-conformities for reactive training';
COMMENT ON TABLE public.compliance_score_history IS 'Tracks compliance scores over time for trending and analysis';
